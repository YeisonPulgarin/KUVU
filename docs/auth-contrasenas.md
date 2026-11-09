# Contraseñas: hash, política y bloqueo

El acceso a la app interna de KUVU pide correo, número de documento y contraseña, dentro de la
inmobiliaria elegida en `/acceder`. La contraseña se guarda solo como hash bcrypt, cumple una
política de seguridad y se bloquea la cuenta tras varios intentos fallidos. Las contraseñas
temporales (las que asigna la migración o un administrador) obligan a definir una propia en el
primer ingreso.

## Cómo funciona

### Backend (`backend/auth/`)

- `password.js` — `hashPassword` / `verifyPassword` con `bcryptjs` (JS puro, costo 12).
  `DUMMY_HASH` es el hash de un valor aleatorio descartado: todo rechazo verifica contra él (o
  contra el hash real), así que cada camino cuesta una verificación bcrypt y la latencia no
  revela si la cuenta existe, está bloqueada o no tiene contraseña.
- `password-policy.js` — `validarPassword(pw, { correo, documento, actual })` devuelve `[]` o la
  lista de reglas incumplidas `{ codigo, mensaje }`:

  | Código | Regla |
  |---|---|
  | `LONGITUD` | 8 a 64 caracteres |
  | `BYTES` | como mucho 72 bytes en UTF-8 (bcrypt ignora el resto) |
  | `MAYUSCULA` / `MINUSCULA` / `NUMERO` / `SIMBOLO` | al menos uno de cada clase (el espacio cuenta como símbolo) |
  | `COMUN` | no está en la lista negra de `common-passwords.js` (sin distinguir mayúsculas) |
  | `CONTIENE_CORREO` | no contiene el correo ni su parte local de 4+ caracteres |
  | `CONTIENE_DOCUMENTO` | no contiene el número de documento |
  | `IGUAL_ACTUAL` | en un cambio, distinta de la actual |

- `credentials.js` — `verificarCredenciales(db, { correo, documento, password, empresa_id })`
  busca las cuentas por correo + empresa activa, compara el documento en JS y verifica el hash.
  Resultado: `ok`, `cambio_requerido` o `rechazado` (`credenciales`, `bloqueada`, `sin_hash`).
  Cada rechazo sobre una cuenta existente suma un fallo; al quinto, `bloqueado_hasta` = ahora +
  15 min y el contador vuelve a 0. Durante el bloqueo todo intento se rechaza sin extenderlo. Un
  acceso exitoso limpia contador y bloqueo.
- `admin.js` — `autorizarAdmin(db, admin, empresaIdDestino)`: re-verifica las credenciales
  completas del administrador (cuentan para su propio bloqueo), y exige rol Administrador, misma
  empresa y sin contraseña temporal pendiente. 401 si las credenciales fallan, 403 si no tiene
  permiso.
- `auth-log.js` — `logAuth(level, msg, fields)`: una línea JSON por evento (`timestamp`, `level`,
  `service`, `env`, `msg`) con solo los campos `empresa_id`, `idUsuario`, `idUsuarioDestino`,
  `motivo`, `actualizados`; cualquier otro se descarta.

### Endpoints

| Método y ruta | Cuerpo | Respuestas |
|---|---|---|
| `POST /api/auth/login` | `correo, documento, password, empresa_id` | 400 si falta algo; 401 `{ error }` con el mismo texto para todo rechazo; 200 `{ ok, requiereCambioPassword: true }` con contraseña temporal (sin datos de sesión); 200 `{ ok, requiereCambioPassword: false, usuario, empresa }` |
| `POST /api/auth/cambiar-password` | `correo, documento, password` (actual), `passwordNueva, empresa_id` | 400 faltantes; 401 genérico; 400 `{ error, reglas }` si la nueva no cumple; 200 con el mismo cuerpo de un login exitoso |
| `POST /api/usuarios` | campos del usuario + `passwordTemporal` + `admin: { correo, documento, password, empresa_id }` | 400, 401, 403, 400 `{ reglas }`, 201 `{ ok, idUsuario }`; el usuario queda con cambio obligatorio |
| `POST /api/usuarios/:id/restablecer-password` | `passwordTemporal, admin` | 400, 404, 401, 403, 400 si es la propia cuenta, 400 `{ reglas }`, 200; deja la temporal, cambio obligatorio y la cuenta desbloqueada |
| `GET /api/usuarios`, `GET /api/usuarios/:id` | — | columnas públicas + `debe_cambiar_password`; nunca el hash ni el estado de bloqueo |
| `PUT /api/usuarios/:id` | campos editables | no lee ni escribe contraseña ni bloqueo |

Eventos de log: `auth.login_ok`, `auth.login_rechazado` (con `motivo`), `auth.cuenta_bloqueada`,
`auth.cambio_requerido`, `auth.password_cambiada`, `auth.password_restablecida`,
`auth.restablecimiento_rechazado`, `usuarios.creado`, `usuarios.creacion_rechazada`,
`auth.error`.

### Base de datos

`db/init/03-auth-columnas.sql` agrega a `usuarios`, con `ADD COLUMN IF NOT EXISTS`:
`password_hash VARCHAR(60) NULL`, `debe_cambiar_password TINYINT(1) NOT NULL DEFAULT 0`,
`intentos_fallidos INT NOT NULL DEFAULT 0`, `bloqueado_hasta DATETIME NULL`. Solo agrega columnas
y es idempotente. En una instalación nueva corre solo después de `01`/`02`, y
`04-auth-seed.sql` deja a los usuarios demo con su documento (`123`) como contraseña temporal.

**Migrar una BD existente** (desde la raíz del repo):

1. Respaldo completo, y comprobar que el archivo termina en `-- Dump completed`:
   `docker exec kuvu_db sh -c 'exec mysqldump -uroot -p"$MARIADB_ROOT_PASSWORD" --single-transaction --routines --triggers --databases bd_arrendamientos' > db/backups/bd_arrendamientos-AAAAMMDD-HHMMSS.sql`
2. Columnas: `docker exec -i kuvu_db sh -c 'exec mysql -uroot -p"$MARIADB_ROOT_PASSWORD" bd_arrendamientos' < db/init/03-auth-columnas.sql`
3. Temporales: `npm run passwords:bootstrap` desde `backend/`. A cada usuario sin hash le asigna su
   documento como contraseña temporal; a los que ya tienen hash no los toca (una segunda corrida
   actualiza 0).
4. Comprobación: `SELECT COUNT(*) FROM usuarios WHERE password_hash IS NULL;` → 0.
5. Restaurar si algo falla: `docker exec -i kuvu_db sh -c 'exec mysql -uroot -p"$MARIADB_ROOT_PASSWORD"' < db/backups/<archivo>.sql`

El backend necesita `npm install` en `backend/` para tener `bcryptjs`.

### Frontend (`frontend/proyecto_angular/src/app/`)

- `services/auth.service.ts` — `login(correo, documento, password, empresa_id, empresa?)`. Con
  contraseña temporal no abre sesión ni guarda nada en `localStorage`: deja en memoria
  `cambioPendiente` (correo, documento, empresa; nunca la contraseña).
  `cambiarPassword(actual, nueva)` usa ese pendiente o el usuario activo y, al confirmarse, abre la
  sesión como un login. `MENSAJE_ACCESO` es el mismo texto del 401 del backend.
- `components/login/` — correo, documento y contraseña (mostrar/ocultar,
  `autocomplete="current-password"`). Con cambio requerido navega a `/cambiar-contrasena`.
  "¿Olvidaste tu contraseña?" despliega que el administrador la restablece.
- `components/cambiar-password/` (`/cambiar-contrasena`, lazy, `cambioPasswordGuard`) — modo
  obligatorio (sin sesión, tras una temporal) o voluntario (con sesión). Muestra las reglas en vivo
  (`services/password-policy.ts`, réplica local sin la lista negra), pide confirmación y muestra
  las reglas que rechace el backend. Salir del modo obligatorio cierra la sesión pendiente.
- `components/usuarios/` — al crear pide la contraseña temporal (con reglas en vivo) y la
  contraseña del administrador; cada tarjeta ajena ofrece "Restablecer contraseña"; un badge marca
  a quien aún tiene una temporal. `DataService.agregarUsuario(usuario, temporal, admin)`,
  `restablecerPassword(id, empresaId, temporal, admin)`; `actualizarUsuario` envía solo los campos
  editables. La contraseña del administrador vive solo en el formulario y se limpia tras cada
  intento y al cerrar.
- `components/shared/sidebar/` — enlace "Cambiar contraseña" junto a "Cerrar sesión".

## Decisiones

- **El documento sigue siendo factor de acceso** (correo + documento + contraseña). Tradeoff: un
  campo más en el login, a cambio de no cambiar la identificación que los usuarios ya conocen.
- **bcryptjs en vez de bcrypt nativo o argon2**: se instala en Windows sin compilador y su formato
  `$2b$` es intercambiable con `bcrypt`. Tradeoff: es más lento que el nativo (≈ 250–300 ms por
  verificación con costo 12).
- **Política clásica de composición + lista negra** (decisión del usuario), aunque NIST prefiere
  solo longitud + lista negra.
- **Autorización sin sesión por re-verificación**: como la API no tiene token, crear usuarios y
  restablecer contraseñas exige las credenciales completas del administrador en la petición. Sin
  esto, `POST /api/usuarios` permitiría crear un administrador y con él tomar cualquier cuenta.
  Tradeoff: el administrador escribe su contraseña en cada una de esas operaciones.
- **Bloqueo por cuenta, no por IP**: guarda estado en `usuarios` y resiste reinicios del backend.
  Tradeoff: un tercero que conozca un correo puede bloquear esa cuenta 15 minutos.
- **Temporal de los usuarios migrados = su documento** (decisión del usuario), mitigada por el
  cambio obligatorio: la temporal solo abre la pantalla de cambio.
- **`bloqueado_hasta` en la hora local del proceso Node**, comparado en JS. No se cambia la zona del
  pool de mysql2 porque alteraría la lectura de las fechas existentes (contratos, pagos).

## Limitaciones conocidas

- La API no tiene sesión ni token: `PUT` y `DELETE` de usuarios y las demás rutas responden a
  cualquiera que alcance el backend, y el aislamiento por empresa depende del `empresa_id` que
  envía el cliente (riesgo aceptado por el usuario).
- La temporal de los usuarios migrados (su documento) es un dato visible en la app hasta que cada
  uno la cambia.
- No hay recuperación por correo, expiración periódica, historial de contraseñas ni límite de
  intentos por IP. "Recordarme" en `/login` es decorativo.
- La lista negra es embebida y acotada (no consulta servicios externos).
- El resto del backend registra errores con `console.error` fuera de la política de logs JSON.
- Las dependencias `express` (vía `body-parser`, `qs`, `proxy-addr`) y `mysql2` tienen avisos de
  `npm audit` con arreglo disponible.
