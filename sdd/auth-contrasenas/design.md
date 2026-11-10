# design — auth-contrasenas

Referencias: `spec.md` (RF-1…RF-12, CA-1…CA-13), `propose.md`, `explore.md`.
`DEVELOPMENT_GUIDELINES.md` describe estructura para Go/Next/Astro; para Express se sigue la
convención existente (`routes/*.js` + `test/*.test.js` con doble de `db`) y se aplica su política
de logs.

## Mapa

```
backend/
  auth/                         (nuevo)
    password.js                 hash/verify con bcryptjs, DUMMY_HASH para igualar tiempos
    password-policy.js          validarPassword(pw, { correo, documento, actual }) → códigos
    common-passwords.js         lista negra embebida (array, ~200 entradas, en minúsculas)
    credentials.js              verificarCredenciales(db, creds) + registro de fallos/bloqueo
    admin.js                    autorizarAdmin(db, adminCreds, empresaIdDestino)
    auth-log.js                 logAuth(level, event, fields) — JSON a stdout, campos en allowlist
  routes/auth.js                login + POST /cambiar-password
  routes/usuarios.js            columnas explícitas; POST con temporal + admin; POST /:id/restablecer-password; PUT sin contraseña
  scripts/bootstrap-passwords.js  temporales = documento para usuarios sin hash (exporta la función)
  package.json                  + bcryptjs; script "passwords:bootstrap"
  test/                         password, password-policy, credentials, auth.route, usuarios.route, bootstrap, auth-log
db/init/
  01-schema.sql, 02-seed.sql    sin cambios
  03-auth-columnas.sql          (nuevo) ALTER idempotente; también es la migración de kuvu_db
  04-auth-seed.sql              (nuevo) hashes precalculados de los usuarios demo (solo instalación nueva)
frontend/proyecto_angular/src/app/
  services/auth.service.ts      login(correo, documento, password, empresa_id); cambiarPassword(); cambio pendiente en memoria
  services/password-policy.ts   (nuevo) reglas de composición/longitud/contenido para la ayuda en vivo
  components/login/             campo contraseña + toggle; mensajes; "¿Olvidaste…?" informativo
  components/cambiar-password/  (nuevo) pantalla de cambio (modo obligatorio y voluntario), ruta lazy
  guards/auth.guard.ts          + cambioPasswordGuard
  app.routes.ts                 + { path: 'cambiar-contrasena', canActivate: [cambioPasswordGuard] }
  models/index.ts               Usuario + debe_cambiar_password?
  components/usuarios/          temporal al crear, "Restablecer contraseña" (sobre app-interna-ux)
  services/data.service.ts      agregarUsuario(usuario, admin) / restablecerPassword(id, temporal, admin)
  components/shared/sidebar/    enlace "Cambiar contraseña"
```

## Decisiones

### D-1 Hash: `bcryptjs@3`, costo 12

JS puro: se instala en Windows sin compilador y su formato `$2b$` es intercambiable con `bcrypt`
si más adelante se quiere el binario nativo. Costo 12 (≈ 250 ms por verificación con bcryptjs;
aceptable para un login). `password.js` exporta `hashPassword(pw)`, `verifyPassword(pw, hash)` y
`DUMMY_HASH` (hash fijo de un valor aleatorio). Cuando la cuenta no existe o no tiene hash, se
verifica igual contra `DUMMY_HASH` para que el tiempo de respuesta no revele si la cuenta existe.

- Descartado `argon2`/`bcrypt` nativos: mejor rendimiento, pero dependen de binarios
  precompilados y no hay MSVC para el fallback. Descartado `crypto.scrypt`: formato propio a
  mantener a mano.
- RF-1 limita a 72 bytes justamente porque bcrypt ignora lo que pasa de ahí.

### D-2 Política: `validarPassword` devuelve códigos

`validarPassword(pw, { correo, documento, actual })` devuelve `[]` si es válida o una lista de
`{ codigo, mensaje }` con códigos estables: `LONGITUD`, `BYTES`, `MAYUSCULA`, `MINUSCULA`,
`NUMERO`, `SIMBOLO`, `COMUN`, `CONTIENE_CORREO`, `CONTIENE_DOCUMENTO`, `IGUAL_ACTUAL`.

- Clases con Unicode: mayúscula `\p{Lu}`, minúscula `\p{Ll}`, número `\p{Nd}`, símbolo
  `[^\p{L}\p{Nd}]` (regex con flag `u`). Longitud en code points (`[...pw].length`), bytes con
  `Buffer.byteLength(pw, 'utf8')`.
- Lista negra: `common-passwords.js` exporta un `Set` en minúsculas (top de contraseñas comunes
  más variantes que cumplen composición: `password1!`, `qwerty123*`, `kuvu2026!`, nombres de
  las empresas demo con año y símbolo, etc.). Se compara `pw.toLowerCase()`.
- `IGUAL_ACTUAL` compara contra la contraseña actual en texto (ya verificada en la misma
  petición), no contra el hash.
- `password-policy.ts` en el frontend replica `LONGITUD`, `MAYUSCULA`, `MINUSCULA`, `NUMERO`,
  `SIMBOLO`, `CONTIENE_*` para la ayuda en vivo; la lista negra solo vive en el backend y su
  rechazo llega como 400 con `COMUN`. Respuesta 400:
  `{ error: 'La contraseña no cumple la política', reglas: [{ codigo, mensaje }] }`.

### D-3 Esquema: cuatro columnas nuevas

```sql
ALTER TABLE usuarios
  ADD COLUMN IF NOT EXISTS password_hash         VARCHAR(60) NULL,
  ADD COLUMN IF NOT EXISTS debe_cambiar_password TINYINT(1)  NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS intentos_fallidos     INT         NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS bloqueado_hasta       DATETIME    NULL;
```

Solo agrega (las filas existentes reciben `NULL`/`0`); no toca columnas, índices ni FKs. En
`db/init/03-auth-columnas.sql`: corre después de `01-schema.sql` en una instalación nueva y es el
mismo archivo que se aplica a `kuvu_db`. `01-schema.sql` no se edita (es un dump; mantenerlo
intacto evita divergir del respaldo y deja una única fuente para las columnas).

### D-4 Contraseñas iniciales

- **BD existente** — `backend/scripts/bootstrap-passwords.js` (`npm run passwords:bootstrap`,
  usa `.env` y `kuvu_app`): `SELECT idUsuario, documento FROM usuarios WHERE password_hash IS
  NULL`; por cada fila, `UPDATE usuarios SET password_hash = ?, debe_cambiar_password = 1 WHERE
  idUsuario = ? AND password_hash IS NULL`. Imprime `{"event":"passwords.bootstrap","actualizados":N}`.
  Re-ejecutarlo actualiza 0 filas. Exporta `bootstrapPasswords(db)` para testearlo con doble.
- **Instalación nueva** — `db/init/04-auth-seed.sql`: ocho `UPDATE ... SET password_hash =
  '<hash>', debe_cambiar_password = 1 WHERE idUsuario = N AND documento = '123' AND
  password_hash IS NULL`, con un hash distinto por usuario, precalculado una vez con costo 12.
  La condición `documento = '123'` lo hace inofensivo si alguien lo aplica a `kuvu_db`.

### D-5 Aplicación sobre `kuvu_db` (manual, con autorización)

Pasos documentados en `docs/auth-contrasenas.md` y en la cabecera de `03-auth-columnas.sql`:

1. Respaldo completo (queda ignorado por `db/backups/.gitignore`):
   `docker exec kuvu_db sh -c 'exec mysqldump -uroot -p"$MARIADB_ROOT_PASSWORD" --single-transaction --routines --triggers --databases bd_arrendamientos' > db/backups/bd_arrendamientos-AAAAMMDD-HHMMSS.sql`
   y comprobar que el archivo no está vacío y termina con `-- Dump completed`.
2. Columnas: `docker exec -i kuvu_db sh -c 'exec mysql -uroot -p"$MARIADB_ROOT_PASSWORD" bd_arrendamientos' < db/init/03-auth-columnas.sql`.
3. Temporales: `npm run passwords:bootstrap` desde `backend/`.
4. Verificación: `DESCRIBE usuarios` y `SELECT COUNT(*) FROM usuarios WHERE password_hash IS NULL` → 0.
5. Restaurar si algo falla: `docker exec -i kuvu_db sh -c 'exec mysql -uroot -p"$MARIADB_ROOT_PASSWORD"' < db/backups/<archivo>.sql`.

El ciclo no ejecuta estos pasos sin la autorización explícita del usuario (tarea manual en
`tasks`). CA-11 se prueba primero en un contenedor descartable (`mariadb:10.4` con otro nombre y
volumen, cargado con el último respaldo).

### D-6 `verificarCredenciales` y bloqueo

```
verificarCredenciales(db, { correo, documento, password, empresa_id })
  → { estado: 'ok' | 'cambio_requerido', usuario }   // usuario = fila con columnas de empresa
  | { estado: 'rechazado', motivo: 'credenciales' | 'bloqueada' | 'sin_hash', idUsuario? }
```

1. `SELECT <columnas explícitas de usuario + rol + empresa>, password_hash, debe_cambiar_password,
   intentos_fallidos, bloqueado_hasta FROM usuarios u JOIN rol r ... JOIN empresas e ... WHERE
   u.correo = ? AND u.empresa_id = ? AND e.activo = 1`. El documento se compara en JS para poder
   contar fallos de la cuenta aunque el documento esté mal.
2. Sin filas → `verifyPassword(password, DUMMY_HASH)` y `rechazado/credenciales` (no hay cuenta
   que contar).
3. Si alguna fila tiene `bloqueado_hasta > ahora` → `rechazado/bloqueada` sin verificar hash ni
   contar.
4. Fila con documento igual (trim, comparación exacta). Sin ella → verificación contra
   `DUMMY_HASH`, fallo registrado. Con ella y sin hash → `DUMMY_HASH`, `sin_hash`, fallo
   registrado. Con hash → `verifyPassword`; si falla, fallo registrado.
5. Registrar fallo, por cada fila del correo: `n = intentos_fallidos + 1`; si `n >= 5` →
   `UPDATE ... SET intentos_fallidos = 0, bloqueado_hasta = ?` (ahora + 15 min) y log
   `auth.cuenta_bloqueada`; si no, `UPDATE ... SET intentos_fallidos = ?`.
6. Éxito → si `intentos_fallidos > 0` o `bloqueado_hasta` no nulo, `UPDATE ... SET
   intentos_fallidos = 0, bloqueado_hasta = NULL`. Estado según `debe_cambiar_password`.

El tiempo sale de `Date.now()`; los tests usan `t.mock.timers.enable({ apis: ['Date'] })`
(disponible en Node 22). Las fechas viajan como `Date` en parámetros de `mysql2`, que las serializa
en la zona del pool, y se leen de vuelta como `Date`: la comparación es coherente sin depender de
`NOW()` del servidor.

Carrera aceptada: dos intentos simultáneos pueden contar uno; el bloqueo llega como mucho un
intento después. No justifica transacción o `SELECT ... FOR UPDATE` para este alcance.

### D-7 Rutas

**`POST /api/auth/login`** — `{ correo, documento, password, empresa_id }`. Falta alguno → 400
`{ error: 'Correo, documento, contraseña y empresa son requeridos' }`. `rechazado` → 401
`{ error: MENSAJE_ACCESO }` (constante exportada; mismo cuerpo en todos los casos).
`cambio_requerido` → 200 `{ ok: true, requiereCambioPassword: true }`. `ok` → 200 con la forma de
hoy (`usuario` con los mismos campos explícitos + `empresa`) más `requiereCambioPassword: false`.

**`POST /api/auth/cambiar-password`** — `{ correo, documento, password, passwordNueva,
empresa_id }`. Orden: faltantes → 400; `verificarCredenciales` (acepta `ok` y
`cambio_requerido`) → 401 si rechaza; `validarPassword(passwordNueva, { correo, documento, actual:
password })` → 400 con reglas; `UPDATE usuarios SET password_hash = ?, debe_cambiar_password = 0,
intentos_fallidos = 0, bloqueado_hasta = NULL WHERE idUsuario = ?` → 200 con el payload del login.

**Autorización de administrador (`auth/admin.js`)** — `autorizarAdmin(db, admin, empresaIdDestino)`
con `admin = { correo, documento, password, empresa_id }`: usa `verificarCredenciales` (los fallos
**cuentan para el bloqueo del administrador**, para que estos endpoints no sean un oráculo de
fuerza bruta sin límite — amplía RF-4, ver nota abajo). Resultado: `rechazado` → 401 genérico;
`cambio_requerido` → 403 `{ error: 'Cambia tu contraseña temporal antes de administrar usuarios' }`;
`idRol !== 1` o `empresa_id !== empresaIdDestino` → 403 `{ error: 'No tienes permiso para esta
operación' }`.

**`POST /api/usuarios`** — cuerpo de hoy + `passwordTemporal` + `admin`. Orden: faltantes → 400;
`autorizarAdmin(admin, empresa_id)`; `validarPassword(passwordTemporal, { correo, documento })` →
400; `INSERT ... (…, password_hash, debe_cambiar_password) VALUES (…, ?, 1)` → 201
`{ ok, idUsuario }`.

**`POST /api/usuarios/:id/restablecer-password`** — `{ passwordTemporal, admin }`. Busca el
destino (`SELECT idUsuario, empresa_id, correo, documento`) → 404; `autorizarAdmin(admin,
destino.empresa_id)`; destino = admin → 400 `{ error: 'Usa "Cambiar contraseña" para tu propia
cuenta' }`; `validarPassword` respecto del destino → 400; `UPDATE ... SET password_hash = ?,
debe_cambiar_password = 1, intentos_fallidos = 0, bloqueado_hasta = NULL` → 200 `{ ok: true }`.
El 404 antes de autorizar revela si un id existe; los ids son secuenciales y `GET
/api/usuarios/:id` ya lo revela sin autenticación, así que no agrega exposición.

**`GET /api/usuarios`, `GET /:id`** — `SELECT u.idUsuario, u.empresa_id, u.nombre, u.documento,
u.telefono, u.correo, u.idRol, u.debe_cambiar_password, r.nombreRol`. **`PUT /:id`** — sin cambios
en su SQL (enumera columnas); un test lo fija. `auth.js` y `credentials.js` enumeran columnas, sin `SELECT u.*`.

Nota de spec: RF-4 menciona login y cambio; D-7 suma la verificación de administrador como fuente
de fallos. Se actualiza `spec.md` (RF-4) para que coincida.

### D-8 Logs (`auth/auth-log.js`)

`logAuth(level, event, fields)` escribe `JSON.stringify({ time: new Date().toISOString(), level,
event, ...pick(fields, ALLOWED) })` con `console.log` (INFO) o `console.error` (WARN/ERROR).
`ALLOWED = ['empresa_id', 'idUsuario', 'idUsuarioDestino', 'motivo', 'actualizados']`: cualquier
otro campo se descarta, así que es imposible filtrar correo, documento o contraseña por descuido.
Eventos: `auth.login_ok` (INFO), `auth.login_rechazado` (WARN, `motivo`), `auth.cuenta_bloqueada`
(WARN), `auth.cambio_requerido` (INFO), `auth.password_cambiada` (INFO),
`auth.password_restablecida` (INFO, actor + destino), `usuarios.creado` (INFO, actor + destino),
`auth.error` (ERROR, sin `err.message` de SQL que pueda llevar datos). El resto del backend sigue
con `console.error` (no-objetivo).

### D-9 Frontend: sesión y cambio pendiente

- `AuthService.login(correo, documento, password, empresa_id)` → `Observable<LoginResponse>`
  (unión `{ ok, requiereCambioPassword: false, usuario, empresa } | { ok, requiereCambioPassword:
  true }`). Con `requiereCambioPassword: true` **no** persiste nada en `localStorage`; guarda en
  un signal privado `cambioPendiente = { correo, documento, empresa }` (sin contraseña) y el
  componente navega a `/cambiar-contrasena`.
- `cambiarPassword(actual, nueva)` toma correo/documento/empresa de `cambioPendiente` o, si no
  hay, del usuario y la empresa activos; en éxito aplica la sesión igual que el login (método
  privado común `iniciarSesion(resp)`) y limpia `cambioPendiente`.
- `logout()` limpia también `cambioPendiente`. `restaurarSesion()` sin cambios.
- `cambioPasswordGuard`: deja pasar si hay `cambioPendiente` o sesión; si no, `/login`.
- `authGuard`/`adminGuard` sin cambios: un usuario con cambio pendiente nunca tiene sesión.
- Ruta `cambiar-contrasena` lazy en `app.routes.ts`, sin `data.publicSite` (no participa de las
  transiciones del sitio).

### D-10 Pantalla `cambiar-password`

Standalone, con el mismo lenguaje visual de `/login` (tarjeta sobre fondo de marca), **sin**
`<app-layout>`: así no depende de `app-interna-ux` y sirve igual en el modo obligatorio (sin
sesión) y en el voluntario. Campos: contraseña actual (en modo obligatorio, rotulada "Contraseña
temporal"), nueva y confirmación, cada uno con mostrar/ocultar y `autocomplete`
(`current-password` / `new-password`). Lista de reglas con estado en vivo (`password-policy.ts`,
`aria-live="polite"`); el botón se habilita cuando las reglas locales se cumplen y la confirmación
coincide. 400 → muestra las reglas del backend (incluida `COMUN`); 401 → mensaje genérico; éxito →
`/dashboard`. Modo voluntario: botón "Volver" al dashboard.

### D-11 `/login`

Tercer campo `type="password"` con botón mostrar/ocultar (`aria-pressed`, `aria-label`),
`(keyup.enter)` pasa del documento a este campo. Mensajes de RF-10. "¿Olvidaste tu contraseña?"
es un `<button type="button">` que despliega un texto: "Pídele al administrador de tu
inmobiliaria que la restablezca." "Recordarme" sigue decorativo.

### D-12 Pantalla de usuarios (apilada sobre `feat/app-interna-ux-gestion`)

- Formulario de creación (en el `<app-modal>` de app-interna-ux): campos "Contraseña temporal"
  (con la ayuda de `password-policy.ts`) y, al pie, "Tu contraseña (confirma que eres
  administrador)". En edición esos campos no se muestran y el `PUT` envía solo `nombre, documento,
  telefono, correo, idRol, empresa_id`.
- Acción de fila "Restablecer contraseña" (`.btn-action--icon` con ícono `key`, que se agrega al
  set de íconos de app-interna-ux) → modal con temporal + contraseña del administrador; éxito →
  toast "Contraseña restablecida. El usuario deberá cambiarla al ingresar."; errores 400/401/403
  dentro del modal.
- Badge "Contraseña temporal" en las filas con `debe_cambiar_password = 1` (usa `badges.ts`).
- `DataService.agregarUsuario(usuario, passwordTemporal, adminPassword)` y
  `restablecerPassword(id, passwordTemporal, adminPassword)` arman `admin` con correo, documento y
  empresa del usuario activo. La contraseña del administrador no se guarda: vive solo en el
  formulario y se limpia al cerrar el modal.
- Sidebar: enlace "Cambiar contraseña" junto a "Cerrar sesión".

## Testing

| Archivo | Cubre |
|---|---|
| `test/password.test.js` | CA-2 (costo 12 → tests lentos pero acotados; ~6 hashes) |
| `test/password-policy.test.js` | CA-1 |
| `test/credentials.test.js` | CA-4/CA-5 a nivel función, reloj simulado, doble de `db` con filas en memoria |
| `test/auth.route.test.js` | CA-3/CA-4/CA-6, cuerpo idéntico de 401, sin hash en respuestas |
| `test/usuarios.route.test.js` | CA-3/CA-7/CA-8, SQL sin `u.*`, `PUT` ignora campos |
| `test/bootstrap-passwords.test.js` | idempotencia del script con doble |
| `test/auth-log.test.js` | CA-12, allowlist |
| `login.component.spec.ts`, `cambiar-password.component.spec.ts`, `auth.service.spec.ts`, `password-policy.spec.ts`, `auth.guard.spec.ts` | CA-9 |
| `usuarios.component.spec.ts`, `data.service.spec.ts` (o el que exista en app-interna-ux) | CA-10 |
| Contenedor descartable + checklist | CA-11 (manual, registrado en `apply-progress`) |

El doble de `db` de los tests de rutas responde por patrón de SQL (no por orden de llamadas),
porque login hace SELECT y UPDATE.

## Riesgos

- `auth.service.spec.ts` lo crea también app-interna-ux: el PR de login se rebasea sobre su base
  si se mergea antes, o se fusionan los specs en el conflicto.
- `app.routes.ts` lo tocan `sitio-publico-expresivo` (otras rutas): conflicto de una entrada.
- bcryptjs con costo 12 hace los tests de backend más lentos (segundos). Si molesta, los tests de
  rutas usan hashes precalculados con costo 4 en los dobles (bcrypt verifica cualquier costo).
