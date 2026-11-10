# explore — auth-contrasenas

Pedido (observación de la docente): "Guardar las contraseñas en hash y aplicar las políticas de
seguridad de contraseñas".

Base de lectura: rama `fix/tema-claro-tokens` (08d9b24). `backend/` y `db/` son idénticos en
`feat/sitio-publico-expresivo-paginas` y en `feat/app-interna-ux`. BD inspeccionada en vivo
(solo `DESCRIBE`/`SELECT`/`SHOW`) con el usuario `kuvu_app`.

## Cómo funciona hoy la autenticación (de punta a punta)

1. `/acceder` (landing): el visitante elige la inmobiliaria (`GET /api/empresas`). La empresa
   elegida queda en `sessionStorage.empresaPreseleccionada`.
2. `/login` (`components/login/`): lee esa empresa (sin ella redirige a `/acceder`) y pide
   **correo** (`type="email"`) y **número de documento** (`type="text"`, `autocomplete="off"`).
   "Recordarme" y "¿Olvidaste tu contraseña?" son decorativos, sin acción.
3. `AuthService.login(correo, documento, empresa_id)` → `POST /api/auth/login` con
   `{ correo, documento, empresa_id }`.
4. `backend/routes/auth.js`: 400 si falta algún campo; `SELECT u.*, r.nombreRol, e.* ...
   WHERE u.correo = ? AND u.documento = ? AND u.empresa_id = ? AND e.activo = 1`. Sin fila → 401
   `"Correo o documento incorrecto para esta empresa"`. Con fila → 200
   `{ ok, usuario: {idUsuario, nombre, correo, documento, idRol, nombreRol, empresa_id,
   nombreEmpresa}, empresa: {...colores, logo, slogan} }`. Errores → 500 con `console.error`.
   No hay contraseña, hash, conteo de intentos ni registro de accesos.
5. El frontend guarda `empresa_id`, `usuario` y `empresa` en `localStorage`, marca la señal
   `isAuthenticated` y aplica el tema de marca. `restaurarSesion()` reconstruye la sesión desde
   `localStorage` al recargar; la sesión no vence. `logout()` limpia `localStorage`.
6. Autorización: solo en el cliente. `authGuard` (autenticado) y `adminGuard` (`idRol === 1`)
   leen las señales de `AuthService`. La API no verifica identidad: todas las rutas
   (`/api/usuarios`, `/api/locales`, `/api/contratos`, `/api/pagos`, `/api/mantenimiento`)
   reciben `empresa_id` del cliente y responden a cualquiera. `cors()` está abierto a todo
   origen. El documento de requerimientos (`docs/KUVU-Requerimientos.docx`, tabla 7) registra
   como pendientes: RF-06 (documento como contraseña, sin recuperación), RF-09 (sesión que no
   vence), RF-20 (aislamiento por `empresa_id` del cliente, sin token) y RNF-13 (CORS abierto).

## Datos

- `usuarios` (en vivo, igual a `01-schema.sql`): `idUsuario` PK, `empresa_id` FK, `nombre`,
  `documento varchar(50) NOT NULL`, `telefono`, `correo varchar(100) NULL`, `idRol` FK. Sin
  columna de contraseña. Índices: PK, `idRol`, `fk_usr_emp`. **No hay `UNIQUE` sobre `correo`**
  (ni global ni por empresa).
- Datos en vivo: 8 usuarios (un administrador y un arrendatario por cada una de las 4
  empresas), todos con correo. Hoy ningún correo se repite, ni dentro de una empresa ni entre
  empresas. Los documentos difieren de `02-seed.sql` (editados a mano; el seed usa `'123'`).
- `db/init/01-schema.sql` y `02-seed.sql` se montan en `/docker-entrypoint-initdb.d` y **solo
  corren con el volumen vacío**: cambiar esos archivos no altera la BD actual. Una migración
  para `kuvu_db` tiene que aplicarse aparte (por ejemplo `docker exec ... mysql < archivo` o un
  script Node). MariaDB 10.4 soporta `ALTER TABLE ... ADD COLUMN IF NOT EXISTS`, lo que permite
  un script idempotente que sirva tanto para la BD actual como para una instalación nueva.
- `kuvu_app` tiene `ALL PRIVILEGES` sobre `bd_arrendamientos`. Existe `db/backups/` con un dump
  (`bd_arrendamientos-20260930-232751.sql`), anterior a las ediciones manuales recientes.
- El seed SQL no puede calcular un hash bcrypt/argon2/scrypt: si las instalaciones nuevas deben
  traer contraseña, el seed lleva hashes precalculados o deja la columna nula para un flujo de
  primer ingreso.

## Riesgos del código actual que el cambio toca

- `GET /api/usuarios` y `GET /api/usuarios/:id` hacen `SELECT u.*`: al agregar la columna de
  hash, **el hash viajaría al navegador** (y lo vería cualquiera, porque la API no autentica).
  `auth.js` también hace `SELECT u.*`, aunque responde con campos explícitos.
- `UsuariosComponent.abrirFormulario(u)` hace `this.form = { ...u }` y `PUT` devuelve el objeto
  entero: si el GET trajera el hash, el formulario lo reenviaría.
- `PUT /api/usuarios/:id` y `POST /api/usuarios` no tienen autenticación. Si la contraseña se
  fija o cambia por esos endpoints sin sesión en la API, cualquiera con acceso a la red podría
  reescribir la contraseña de cualquier usuario: sin sesión/token, el hash protege los datos en
  reposo pero no la cuenta.
- El `documento` sigue siendo un dato visible en la pantalla de usuarios y en la respuesta del
  login; mientras sea factor de acceso, no es un secreto.
- Logs: `DEVELOPMENT_GUIDELINES.md` → "Logging & Observability" pide logs estructurados (JSON
  en backend), sin datos sensibles, y no loguear lo que es métrica ("login failed" repetido).
  El backend usa `console.error` suelto en todas las rutas.

## Archivos relevantes y qué se tocaría

| Archivo | Rol hoy | Cambio probable | Slice |
|---|---|---|---|
| `backend/routes/auth.js` | login correo+documento+empresa | verificar hash; según decisiones: cambio de contraseña, primer ingreso, bloqueo, emisión de token | `backend-orden` |
| `backend/routes/usuarios.js` | CRUD sin auth, `SELECT u.*` | columnas explícitas (nunca el hash); crear usuario con contraseña inicial o marca de cambio obligatorio; reset por admin | `backend-orden` |
| `backend/server.js` | monta rutas, `cors()` abierto | middleware de sesión/token si entra; CORS restringido si entra | `backend-orden` |
| `backend/package.json` | sin libs de hash | dependencia de hash (o ninguna si se usa `crypto.scrypt`); de token si entra | `backend-orden` |
| módulo nuevo `backend/` (p. ej. `password.js`/`auth/`) | — | hash/verify, validación de política, lista negra | `backend-orden` |
| `backend/test/*.test.js` | patrón: doble de `db` vía `require.cache` + `fetch` a un `express` efímero | tests de login, política, CRUD sin hash | `backend-orden` |
| `db/init/01-schema.sql` / migración nueva (p. ej. `db/migrations/` o `db/init/03-*.sql` idempotente) | esquema sin contraseña | `ADD COLUMN IF NOT EXISTS password_hash`, marca de cambio obligatorio, contadores de bloqueo si entran; quizás `UNIQUE` en correo | sin slice declarado (más cercano `backend-orden`) |
| `db/init/02-seed.sql` | usuarios demo | hashes precalculados o columna nula | ídem |
| script de bootstrap (p. ej. `backend/scripts/`) | — | asignar contraseña inicial a usuarios existentes sin borrar datos | ídem |
| `components/login/login.component.{ts,html,spec.ts}` | correo + documento | campo contraseña (`type="password"`, `autocomplete="current-password"`), mensajes 401/423; enlace "¿Olvidaste...?" según decisión | `intro` |
| `services/auth.service.ts` (+ spec nuevo) | login, sesión en `localStorage` | firma de `login`, manejo de "debe cambiar contraseña", token si entra | `intro` — **solapa con app-interna-ux** |
| pantalla nueva de cambio de contraseña + ruta en `app.routes.ts` | — | si entra primer ingreso / cambio | `intro` (ruta: `chrome`/`paginas` también tocan `app.routes.ts`) |
| `guards/auth.guard.ts` | guards de cliente | redirigir a cambio obligatorio si aplica | `intro` |
| `components/usuarios/usuarios.component.{ts,html}` | formulario CRUD | campo de contraseña inicial / botón "restablecer contraseña"; no copiar el hash al form | sin slice (en app-interna-ux: `app`) — **solapa** |
| `services/data.service.ts` | CRUD usuarios | método de reset/cambio si entra | sin slice — **solapa** |
| `models/index.ts` (`Usuario`) | modelo | campos de estado (p. ej. `debe_cambiar_password`), nunca el hash | — |
| `docs/architecture.md`, `docs/auth-contrasenas.md`, `CHANGELOG.md` | docs | flujo de acceso con contraseña | `document` |

### Solapamientos con `app-interna-ux` (worktree `wt-aiu`, rama `feat/app-interna-ux`)

- `services/auth.service.ts`: su T-3 agrega `--color-primario-contraste` en
  `aplicarTemaEmpresa`/`resetearTema` (diff ya en su working tree). Este cambio tocaría
  `login()`/`restaurarSesion()`/`logout()` del mismo archivo: hunks distintos, conflicto
  probable pero de merge simple. Ambos crean `auth.service.spec.ts` (ellos ya lo tienen sin
  commitear): ahí el choque es seguro.
- `components/usuarios/`: su T-15 cambia los botones de acción (`.btn-action--icon`) y quita
  `.btn-icon` del SCSS; también agrega `components/shared/{modal,confirm,toast}`. El formulario
  de contraseña debería montarse sobre su versión (y reutilizar su modal/toast) en vez de la de
  `fix/tema-claro-tokens`.
- `services/data.service.ts`: su T-11 agrega `eliminarContrato`, `eliminarMantenimiento` y
  `finalize`; un método de reset de contraseña sería un hunk aparte.
- Su `sdd.config.md` (modificado en el worktree) agrega el slice `app`; este cambio también
  necesitaría actualizar `sdd.config.md`/`sdd-init.md` en `cierre`.
- Conclusión operativa: la parte frontend de usuarios conviene partir de la rama de
  `app-interna-ux` una vez mergeada (o rebasar sobre ella); el backend y la migración no
  solapan con nadie.

## Opciones de librería de hash (Windows, Node 22.20, sin MSVC)

| Opción | Tipo | Windows | Notas |
|---|---|---|---|
| `bcrypt@6.0.0` | nativo (N-API, prebuildify) | trae binario win32-x64 precompilado; sin binario caería a node-gyp, que falla sin MSVC | estándar conocido; trunca a 72 bytes; costo 12 razonable |
| `bcryptjs@3.0.3` | JS puro | sin compilación | mismo formato `$2b$`, compatible con `bcrypt`; ~3x más lento, aceptable para pocos usuarios |
| `argon2@0.45.2` | nativo (prebuildify) | binario precompilado para win32-x64 | Argon2id, recomendado por OWASP como primera opción |
| `@node-rs/argon2@2.2.2` / `@node-rs/bcrypt@2.0.0` | Rust + N-API | prebuilds por plataforma | sin node-gyp |
| `crypto.scrypt` (built-in) | sin dependencias | sí | OWASP lo acepta; requiere armar a mano el formato `salt:hash:params` y comparar con `timingSafeEqual`. `crypto.argon2` no existe en Node 22 (llega en Node 24) |

Para una entrega académica, las opciones de menor riesgo de instalación son `bcryptjs` (cero
compilación, formato estándar) o `argon2` (mejor algoritmo, binario precompilado). La elección
queda para `design`.

## Ambigüedades para el Gate A

1. **Política de contraseñas**: longitud mínima (¿8? ¿12 según NIST 800-63B?), máximo (64; 72
   bytes si es bcrypt); ¿complejidad obligatoria (mayúscula/número/símbolo) o solo longitud +
   lista negra (NIST desaconseja reglas de composición)?; ¿lista negra de contraseñas comunes
   (top N embebida) más prohibir que contenga correo/documento/nombre de la empresa?; ¿expiración
   periódica (NIST la desaconseja) e historial para no repetir?
2. **Contraseña inicial de los 8 usuarios existentes** (sin perder datos): (a) temporal = su
   documento, hasheada por un script de migración, con cambio obligatorio al primer ingreso;
   (b) columna nula + primer ingreso con correo+documento que obliga a crear contraseña;
   (c) temporal aleatoria generada por script y entregada al admin, con cambio obligatorio;
   (d) una temporal común conocida. ¿Y los usuarios nuevos del CRUD: el admin escribe una
   temporal, o se genera?
3. **Credenciales del login**: ¿correo + contraseña (la empresa sigue elegida en `/acceder`) o
   correo + documento + contraseña? Si es correo + contraseña dentro de la empresa, ¿se agrega
   `UNIQUE(empresa_id, correo)` (o global) y `correo NOT NULL`? Hoy los datos lo permiten.
4. **Recuperación y cambio**: ¿entra "cambiar mi contraseña" (usuario autenticado, pide la
   actual)? ¿"¿Olvidaste tu contraseña?": reset por el administrador desde la pantalla de
   usuarios, por correo (no hay servicio SMTP), o queda decorativo/fuera de alcance?
5. **Bloqueo por intentos fallidos**: ¿entra? ¿cuántos intentos, por cuánto tiempo, por cuenta
   (columnas en `usuarios`) o por IP (memoria, p. ej. `express-rate-limit`)? ¿Mensaje genérico
   que no revele si el correo existe?
6. **Sesión/token en la API**: ¿entra (JWT o sesión firmada; middleware en todas las rutas;
   `empresa_id` derivado del token en vez del query; vencimiento → resuelve RF-09/RF-20) o queda
   fuera? Sin él, el cambio/reset de contraseña por la API es explotable por cualquiera que
   alcance el backend. Alternativa mínima: proteger solo los endpoints de contraseña. ¿Y CORS
   restringido (RNF-13) entra?
7. **Migración**: ¿formato — script SQL idempotente aplicado con `docker exec` + archivo en
   `db/init/` para instalaciones nuevas, o script Node `npm run migrate`? ¿Se exige un dump de
   respaldo (`db/backups/`) antes de aplicarla? ¿Quién la aplica sobre `kuvu_db` (este ciclo
   no la ejecuta sin autorización explícita)?
8. **Alcance frontend y coordinación**: ¿la parte de la pantalla de usuarios espera al merge de
   `app-interna-ux` o se hace en paralelo asumiendo el conflicto? ¿Slice para `usuarios`/`db`
   (agregar `app`/`db` a `sdd.config.md`)?
9. **Logging**: ¿se adopta logging estructurado JSON en las rutas de auth (eventos de login
   exitoso/fallido/bloqueo sin datos sensibles), o se mantiene `console.error` y queda como
   deuda fuera de alcance?

## Decisiones de clarify

Respuestas del usuario al Gate A. La siguiente fase es `propose`.

1. **Login**: correo + documento + contraseña. La empresa se sigue eligiendo en `/acceder`. El
   documento se mantiene intacto como dato y como factor de acceso.
2. **Almacenamiento**: columna nueva con el hash de la contraseña (`bcryptjs`), agregada por una
   migración idempotente que solo agrega columnas. Los datos actuales de `kuvu_db` quedan
   intactos. Antes de aplicarla se toma un respaldo completo de `kuvu_db`.
3. **Política**: longitud 8–64; al menos una mayúscula, una minúscula, un número y un símbolo;
   lista negra de contraseñas comunes; no puede contener el correo ni el documento.
4. **Usuarios existentes**: contraseña temporal = su documento (hasheada), con cambio
   obligatorio en el primer ingreso. **Usuarios nuevos**: el administrador escribe una
   contraseña temporal al crearlos (también con cambio obligatorio en el primer ingreso).
5. **Extras que entran**: bloqueo por intentos (5 fallos → 15 minutos, mensaje genérico que no
   revela qué dato falló); "cambiar mi contraseña" para el usuario autenticado; restablecimiento
   de contraseña por el administrador.
6. **No-objetivo**: sesión/JWT en la API. La API sigue sin verificar identidad; queda registrado
   como limitación conocida.
7. **Coordinación**: el frontend de la pantalla de usuarios se apila sobre la rama de
   `app-interna-ux`.
8. **Logging**: los eventos de autenticación (login exitoso, fallido, bloqueo, cambio y
   restablecimiento de contraseña) se registran como logs JSON estructurados, sin datos
   sensibles, según `DEVELOPMENT_GUIDELINES.md`.
