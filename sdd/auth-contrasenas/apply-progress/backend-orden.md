# apply-progress — backend-orden

```
test_mode: test-after
test_command: npm test (backend/, node --test)
tests_status: verde (78 tests, 0 fallos)
tests_agregados:
  - backend/test/password.test.js
  - backend/test/password-policy.test.js
  - backend/test/auth-log.test.js
  - backend/test/credentials.test.js
  - backend/test/auth.route.test.js
  - backend/test/usuarios.route.test.js
  - backend/test/bootstrap-passwords.test.js
  - backend/test/helpers/fake-db.js, backend/test/helpers/route-harness.js (soporte)
excepciones_sin_test:
  - db/init/03-auth-columnas.sql y 04-auth-seed.sql: SQL sin test automático; verificados en
    contenedores descartables (T-13, abajo).
  - backend/server.js: solo la lista de endpoints de la ruta informativa `/`.
logs_conforme: sí, con un desvío: sin `request_id` (el backend no genera ids de petición;
  agregarlo es transversal y queda fuera de alcance). Campos: timestamp, level, service, env, msg
  + allowlist (empresa_id, idUsuario, idUsuarioDestino, motivo, actualizados).
commit: ver `git log` de feat/auth-contrasenas (feat(backend-orden): …)
```

## Tareas

| Tarea | Estado |
|---|---|
| T-1 bcryptjs + `auth/password.js` | completa |
| T-2 `auth/common-passwords.js` + `auth/password-policy.js` | completa |
| T-3 `auth/auth-log.js` | completa |
| T-4 `db/init/03-auth-columnas.sql` | completa |
| T-5 `auth/credentials.js` | completa |
| T-6 login | completa |
| T-7 `POST /api/auth/cambiar-password` | completa |
| T-8 `auth/admin.js` | completa (tests dentro de `usuarios.route.test.js`) |
| T-9 `routes/usuarios.js` | completa |
| T-10 `scripts/bootstrap-passwords.js` + `npm run passwords:bootstrap` | completa |
| T-11 `db/init/04-auth-seed.sql` | completa |
| T-12 `server.js` + suite completa | completa |
| T-13 verificación en contenedores descartables | completa |
| T-14 migración de `kuvu_db` (autorizada) | completa |

## T-13 — contenedores descartables

1. `mariadb:10.4` con el dump de `kuvu_db` (`db/backups/bd_arrendamientos-20261109-174736-pre-auth-t13.sql`):
   `03` aplicado dos veces sin error; `bootstrapPasswords` dos veces → 8 y 0 actualizados.
   Snapshot antes/después (conteos de todas las tablas, columnas previas de `usuarios` fila por
   fila, `CHECKSUM TABLE` del resto, índices y FKs de `usuarios`): idéntico salvo la
   cardinalidad estadística de los índices, que `ALTER TABLE` recalcula.
   Flujo de punta a punta contra esa BD: login con documento como temporal → 200 con cambio
   requerido; cambio a `Password1!` → 400 `COMUN`; cambio válido → 200 con usuario; login con la
   nueva → 200 sin cambio; 5 fallos → la contraseña correcta recibe 401 (bloqueo).
2. Volumen vacío con `01`–`04`: los 8 usuarios demo quedan con hash (8 hashes distintos) y cambio
   obligatorio; `admin1@gmail.com` + `123` + `123` → `cambio_requerido`.

Contenedores eliminados. Queda un volumen anónimo huérfano del primer contenedor (se eliminó
sin `-v`); no se borró porque requiere confirmar su id con el usuario.

## T-14 — migración de `kuvu_db`

1. Respaldo completo: `db/backups/bd_arrendamientos-20261109-175018-pre-auth-contrasenas.sql`
   (termina en `-- Dump completed`, ignorado por `db/backups/.gitignore`).
2. `03-auth-columnas.sql` aplicado.
3. `npm run passwords:bootstrap` (con el `.env` del backend) → 8 actualizados; segunda corrida → 0.
4. Verificación: snapshot antes/después idéntico (mismos conteos, columnas previas fila por fila,
   checksums de las otras tablas, índices y FKs); `password_hash IS NULL` → 0; 8 usuarios con
   cambio obligatorio y 8 hashes distintos; la temporal (documento) verifica en los 8.
   No fue necesario restaurar.

## Desvíos y notas

- `bloqueado_hasta` se escribe con la hora local del proceso Node (mysql2 con `timezone` por
  defecto) y se compara en JS, como indica D-6; el contenedor corre en UTC, así que comparar esa
  columna con `NOW()` en SQL da otra hora. No se cambia la zona del pool porque alteraría la
  lectura de las fechas existentes (contratos, pagos).
- Logs: campo `msg` en vez de `event` y `timestamp` en vez de `time` (D-8), para seguir los
  nombres de campos base de `DEVELOPMENT_GUIDELINES.md`.
- `backend/node_modules` tiene archivos versionados aunque `backend/.gitignore` lo ignora;
  `npm ci` los reescribe con otros finales de línea. No se stagean; `bcryptjs` no queda en git
  (cada equipo corre `npm install`).
- Efecto de la migración ya aplicada: un backend que no incluya este cambio (cualquier otra rama)
  responde `GET /api/usuarios` con `SELECT u.*`, es decir, **incluye `password_hash`**. Hasta que
  este PR se mergee, conviene correr el backend desde esta rama.
