# tasks — auth-contrasenas

Referencias: `spec.md` (RF/CA), `design.md` (D-n). Modalidad: `test-after` (cada tarea cierra con
sus tests en verde). Rutas de frontend relativas a `frontend/proyecto_angular/src/app/`.

## Slices involucrados

| Slice | Involucrado | Qué cubre en este cambio |
|---|---|---|
| `backend-orden` | **Sí** | `backend/auth/`, rutas `auth`/`usuarios`, script de bootstrap, `db/init/03-04` + tests `node --test` |
| `intro` | **Sí** | `/login`, pantalla `cambiar-password`, `AuthService`, guard, ruta, `password-policy.ts` + Karma |
| `app` (lo declara `app-interna-ux`; no está en el `sdd.config.md` del árbol principal) | **Sí** | pantalla `usuarios`, `data.service.ts`, sidebar + Karma |
| `cierre` | **Sí** | `sdd.config.md` (slice `app` si no llegó, nota de `db/init` en `backend-orden`), `sdd-init.md` (backend y `npm test`) |
| `contenido`, `chrome`, `paginas`, `home` | No | — |

Desvío del orden default: `backend-orden` → `intro` → `app` → `cierre`. Coincide con el default
para los dos primeros; `app` no existe en la tabla del árbol principal y va después de `intro`
porque usa el contrato de `AuthService` solo en runtime (no en compilación) y depende de la base de
`app-interna-ux`.

`db/init/` no tiene slice; se agrupa en `backend-orden` porque el script de bootstrap y los tests
de credenciales dependen de las columnas.

## Tareas

### Slice `backend-orden` (PR A)

- **T-1** — Dependencia y módulo de hash: `npm install bcryptjs@3` en `backend/`;
  `auth/password.js` (`hashPassword`, `verifyPassword`, `DUMMY_HASH`). Test:
  `test/password.test.js` (CA-2). D-1.
- **T-2** — Política: `auth/common-passwords.js` (Set en minúsculas) y `auth/password-policy.js`
  (`validarPassword`, códigos de D-2). Test: `test/password-policy.test.js` (CA-1).
- **T-3** — Logs: `auth/auth-log.js` con allowlist. Test: `test/auth-log.test.js` (CA-12). D-8.
- **T-4** — Columnas: `db/init/03-auth-columnas.sql` (ALTER idempotente + cabecera con los pasos
  de D-5). D-3. Sin test automático (cubierto por T-14).
- **T-5** — Credenciales y bloqueo: `auth/credentials.js` (`verificarCredenciales`, registro de
  fallos, `MENSAJE_ACCESO`). Test: `test/credentials.test.js` con doble de `db` en memoria y
  `t.mock.timers` (CA-4, CA-5 a nivel función). Depende de T-1, T-3. D-6.
- **T-6** — Login: `routes/auth.js` con `verificarCredenciales`, columnas explícitas, respuestas de
  D-7. Test: `test/auth.route.test.js` (CA-3, CA-4: cuerpo idéntico en todos los 401, sin hash).
  Depende de T-5.
- **T-7** — Cambiar contraseña: `POST /api/auth/cambiar-password` en `routes/auth.js`. Tests en
  `test/auth.route.test.js` (CA-6). Depende de T-2, T-6.
- **T-8** — Autorización de administrador: `auth/admin.js` (`autorizarAdmin`). Tests unitarios en
  `test/credentials.test.js` o `test/admin.test.js` (401, 403 rol, 403 empresa, 403 cambio
  pendiente, fallo cuenta para el bloqueo del admin). Depende de T-5.
- **T-9** — Usuarios: `routes/usuarios.js` — GET con columnas explícitas (+ `debe_cambiar_password`),
  POST con `passwordTemporal` + `admin`, `POST /:id/restablecer-password`, PUT sin cambios de SQL.
  Test: `test/usuarios.route.test.js` (CA-3, CA-7, CA-8). Depende de T-2, T-8.
- **T-10** — Bootstrap: `scripts/bootstrap-passwords.js` (exporta `bootstrapPasswords(db)`, CLI
  con `require.main`), script `passwords:bootstrap` en `package.json`. Test:
  `test/bootstrap-passwords.test.js` (solo filas sin hash, segunda corrida actualiza 0, no imprime
  documentos). D-4.
- **T-11** — Seed de instalación nueva: `db/init/04-auth-seed.sql` con 8 hashes precalculados
  (costo 12, uno por usuario) de `'123'`, condicionados a `documento = '123' AND password_hash IS
  NULL`. D-4.
- **T-12** — `server.js`: lista de endpoints de la ruta `/` con `POST /api/auth/cambiar-password` y
  `POST /api/usuarios/:id/restablecer-password`. Suite `npm test` completa en verde (CA-13).

### Verificación de migración (manual, dentro de `backend-orden`)

- **T-13** — Contenedor descartable `mariadb:10.4` (nombre y volumen propios, puerto distinto):
  cargar el último respaldo de `db/backups/` (o `01`+`02`), aplicar `03` dos veces y
  `bootstrapPasswords` dos veces; comprobar CA-11 (columnas previas y conteos iguales, segunda
  corrida sin cambios, login con documento como temporal → cambio requerido). Además, volumen vacío
  con `01`–`04` → usuarios demo con cambio requerido. Registrar en `apply-progress/backend-orden`.
  Eliminar el contenedor y el volumen descartables al terminar.
- **T-14** — **Aplicación sobre `kuvu_db` — requiere autorización explícita del usuario** (gate
  propio, no se ejecuta en modo automático): pasos 1–4 de D-5 (respaldo completo verificado,
  `03`, bootstrap, verificación). Si no se autoriza en este ciclo, queda como acción pendiente en
  el `archive-report`.

### Slice `intro` (PR B)

- **T-15** — `services/password-policy.ts` (reglas locales de D-2). Spec:
  `password-policy.spec.ts`.
- **T-16** — `AuthService`: `login(correo, documento, password, empresa_id)` con
  `LoginResponse`, `cambioPendiente`, `cambiarPassword(actual, nueva)`, `iniciarSesion` privado,
  `logout` limpia el pendiente. Spec: `auth.service.spec.ts` (no persiste con cambio requerido;
  éxito de cambio persiste). D-9.
- **T-17** — `cambioPasswordGuard` en `guards/auth.guard.ts` + ruta lazy `cambiar-contrasena` en
  `app.routes.ts`. Spec: `auth.guard.spec.ts` (y caso en `app.routes.spec.ts` si aplica).
- **T-18** — `components/cambiar-password/` (modo obligatorio/voluntario, reglas en vivo,
  confirmación, 400/401, éxito). Spec: `cambiar-password.component.spec.ts`. D-10. Depende de
  T-15–T-17.
- **T-19** — `/login`: campo contraseña con toggle, mensajes, navegación a cambio requerido,
  "¿Olvidaste…?" informativo. Spec: `login.component.spec.ts` actualizado. D-11. Suite Karma y
  `ng build` en verde (CA-9, CA-13).

### Slice `app` (PR C, sobre `feat/app-interna-ux-gestion`)

- **T-20** — `models/index.ts` (`debe_cambiar_password?`) y `DataService.agregarUsuario(usuario,
  passwordTemporal, adminPassword)` / `restablecerPassword(...)`; `actualizarUsuario` envía solo
  los campos editables. Spec de `DataService` (CA-10).
- **T-21** — Pantalla `usuarios`: campos de temporal + confirmación del admin en creación, acción
  "Restablecer contraseña" con modal y toast, badge "Contraseña temporal", ícono `key`. Spec:
  `usuarios.component.spec.ts` (CA-10). D-12.
- **T-22** — Sidebar: enlace "Cambiar contraseña". Spec del sidebar (existente en app-interna-ux).
  Suite Karma y build en verde.

### Slice `cierre`

- **T-23** — `sdd.config.md` (slice `app` si aún no está; `backend-orden` menciona `db/init/` y
  `backend/auth/`) y `sdd-init.md` (stack con backend, `npm test`). Va en el último PR.

## Forecast de riesgo

| Grupo | Archivos (aprox., tests incluidos) | Líneas (aprox., tests incluidos) |
|---|---|---|
| A — backend + BD (T-1…T-12) | 18 (8 nuevos de código/SQL + 7 tests + `package.json`/lock/`server.js`) | ~1 500 (≈ 650 código/SQL, ≈ 250 lista negra, ≈ 600 tests); el lockfile suma líneas no revisables |
| B — login y cambio (T-15…T-19) | 11 (4 nuevos + 5 specs) | ~800 |
| C — usuarios (T-20…T-22) | 7 | ~450 |
| cierre (T-23) | 2 | ~20 |
| **Total** | **~38** | **~2 750** |

- Umbral de `sdd.config.md`: 300 líneas → **riesgo ALTO** (≈ 9× el umbral).
- Un solo repo; toca backend, BD y frontend. Toca una BD con datos reales del usuario (T-14,
  bajo autorización).
- Estrategia cacheada: `ask-on-risk` → se pregunta en el Gate C.

### Propuesta de entrega

**Opción 1 (recomendada): 3 PRs**, cada uno con su verificación:

1. **PR A** `feat/auth-contrasenas-backend` ← `fix/tema-claro-tokens`. Backend, columnas, seed,
   bootstrap, tests. Independiente del frontend: el frontend actual deja de poder entrar en cuanto
   se mergea (el login pide contraseña), así que A y B se mergean juntos o B inmediatamente
   después.
2. **PR B** `feat/auth-contrasenas-login` ← PR A. `/login`, cambio de contraseña, `AuthService`,
   guard, ruta.
3. **PR C** `feat/auth-contrasenas-usuarios` ← `feat/app-interna-ux-gestion` (decisión del
   usuario: apilado sobre app-interna-ux). No depende de B en compilación; en runtime necesita A
   y B. Lleva `cierre`.

Worktrees en el scratchpad (`wt-auth` para A y B, `wt-auth-usuarios` para C), nunca en el árbol
principal.

**Opción 2: 2 PRs** — A+B juntos (~2 300 líneas, se mergea de una vez y no deja el login roto
entre PRs) y C sobre app-interna-ux.

**Opción 3: un solo PR** sobre `feat/app-interna-ux-gestion` (~2 750). Mezcla el backend con la
pila de app-interna-ux y bloquea el backend hasta que esa pila avance; no recomendado.

Base: `fix/tema-claro-tokens` está apilada sobre PRs abiertos (#1–#4); si se mergean antes, se
rebasea. Conflictos previstos: `auth.service.ts`/`auth.service.spec.ts` (B vs app-interna-ux
PR 1) y `app.routes.ts` (B vs `sitio-publico-expresivo`), ambos de una o pocas líneas salvo el spec.

## Alcance previsto de `document`

- `openapi_afectado`: no (config: sin OpenAPI). Sí se documentan los endpoints nuevos/cambiados en
  `docs/auth-contrasenas.md`.
- `changelog_afectado`: sí (login con contraseña, cambio obligatorio, bloqueo, restablecimiento).
- `readme_afectado`: no existe README en la raíz; la guía de migración va en
  `docs/auth-contrasenas.md` (y `backend/INSTRUCCIONES.md` si describe el login).
- `architecture_afectado`: sí (flujo de acceso con contraseña y cambio obligatorio, módulo
  `backend/auth/`, columnas nuevas, limitación sin sesión en la API).
- `guidelines_afectado`: no (se aplica la política de logs existente; no hay convención nueva).
- Además: `docs/KUVU-Requerimientos.docx` (RF-06) queda desactualizado; no se modifica en este
  cambio (archivo del usuario sin versionar), se anota en el `document-report`.

## Decisiones del Gate C

- Entrega en **2 PRs** (opción 2):
  1. `feat/auth-contrasenas` ← `fix/tema-claro-tokens`: grupos A + B (backend, BD, login, cambio
     de contraseña). Worktree `wt-auth` en el scratchpad.
  2. `feat/auth-contrasenas-usuarios` ← `feat/app-interna-ux-gestion`: grupo C + `cierre`. Se
     arranca cuando la rama de gestión tenga commits; si no, queda pendiente.
- Slices: `backend-orden`, `intro`, `app`, `cierre`.
- **T-14 autorizado** por el usuario: migración sobre `kuvu_db` según D-5, con respaldo
  completo verificado antes, comparación fila por fila de las columnas existentes después y
  restauración si algo falla. El respaldo va a `db/backups/` (ignorado por git).
