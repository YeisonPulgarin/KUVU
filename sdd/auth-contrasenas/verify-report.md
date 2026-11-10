# verify-report — auth-contrasenas

Estado verificado: `feat/auth-contrasenas` @ fbcdfa2 (PR 1: backend-orden + intro) y
`feat/auth-contrasenas-usuarios` @ ad9e8b0 (PR 2: app + cierre, sobre
`feat/app-interna-ux-gestion` @ 9a44105). Slices completados: `backend-orden`, `intro`, `app`,
`cierre`. Ninguno omitido.

**Resultado: VERDE**, con desvíos menores documentados abajo, ninguno bloqueante.

## Re-verificación tras `secure` y `refine`

Estado: `feat/auth-contrasenas` @ 99f8859 (fix de `secure`: el camino de cuenta bloqueada
verifica contra el hash de relleno). `refine` cerró sin cambios. PR 2 no cambió.

- `npm test`: 79/79 (78 + el test de regresión de tiempo). Karma PR 1: 499/499.
- CA-1 a CA-13 siguen pasando: el fix no cambia status ni cuerpos (CA-4 y CA-5 cubiertos por los
  mismos tests); el nuevo test fija que todo camino de rechazo hace una verificación bcrypt.
- Observación de `secure` sobre el tiempo de la cuenta bloqueada: resuelta. Las otras dos quedan
  como riesgo residual aceptado por el usuario (`secure-report`).

## Tests

| Suite | Rama | Resultado |
|---|---|---|
| `npm test` (backend, `node --test`) | PR 1 | 78/78 |
| Karma (`ng test`) + `ng build` | PR 1 | 499/499, build OK |
| Karma (`ng test`) + `ng build` | PR 2 | 572/572, build OK |
| Karma, merge de prueba PR 2 + PR 1 (worktree descartable, ya eliminado) | integrado | 597/597 tras resolver el conflicto previsto (ver D-3) |
| Migración en contenedores descartables (T-13) y en `kuvu_db` (T-14) | manual | OK (ver `apply-progress/backend-orden.md`) |

`ng build` avisa del presupuesto `css-inline-fonts` (Google Fonts en `index.html`), que el cambio
no toca. Un spec de home (`StepsJourneyComponent … brand colours`) falló una sola vez en una de
las corridas de PR 2 y pasó en las siguientes: inestabilidad preexistente, ajena al cambio.

Cobertura contra `tests_agregados` / `excepciones_sin_test`: todos los slices declaran sus tests.
Las excepciones (SQL de `db/init`, lista de endpoints de `server.js`, config SDD) están
justificadas y el SQL se verificó en contenedores.

## Criterios de aceptación

| CA | Resultado | Evidencia |
|---|---|---|
| CA-1 política | pasa | `test/password-policy.test.js` (límites 7/8/64/65, 72 bytes, clases, lista negra, correo/parte local/documento, igual a la actual) |
| CA-2 hash | pasa | `test/password.test.js` |
| CA-3 sin hash en respuestas, sin `SELECT u.*` | pasa | `auth.route.test.js`, `usuarios.route.test.js`, `credentials.test.js` |
| CA-4 login | pasa | 400, 200, 200 con cambio requerido sin usuario, 401 con cuerpo idéntico en 6 casos |
| CA-5 bloqueo | pasa | `credentials.test.js` con reloj simulado; además de punta a punta contra la BD descartable |
| CA-6 cambio de contraseña | pasa | `auth.route.test.js` |
| CA-7 creación y restablecimiento | pasa | `usuarios.route.test.js` (201/200, 401, 403 rol/empresa/temporal, 400 política, 404, auto-restablecimiento) |
| CA-8 `PUT` ignora contraseña | pasa | `usuarios.route.test.js` |
| CA-9 frontend login/cambio/AuthService | pasa | `login.component.spec`, `cambiar-password.component.spec`, `auth.service.spec`, `auth.guard.spec`, `password-policy.spec`, `app.routes.spec` |
| CA-10 frontend usuarios | pasa | `usuarios.component.spec`, `data.service.spec`, `sidebar.component.spec` (PR 2) |
| CA-11 migración | pasa | T-13 (dos corridas, sin cambios en datos previos; instalación nueva) y T-14 sobre `kuvu_db` (respaldo verificado, snapshot antes/después idéntico, 8/8 temporales válidas) |
| CA-12 logs | pasa | `auth-log.test.js`, `auth.route.test.js` (sin correo, documento ni contraseña en ninguna línea) |
| CA-13 suites en verde | pasa | tabla de tests |

## Ejes del protocolo

- **Documentación declarada**: `tasks.md` anticipa `CHANGELOG.md`, `docs/architecture.md`,
  `docs/auth-contrasenas.md`; no aplica OpenAPI (config) ni README (no existe);
  `DEVELOPMENT_GUIDELINES.md` sin cambios. Conforme.
- **Guidelines**: `DEVELOPMENT_GUIDELINES.md` describe Go/Next/Astro; el backend sigue la
  convención Express existente (`routes/` + módulo `auth/` + tests con doble de `db`), el frontend
  usa componentes standalone, rutas lazy y servicios singleton. Conforme.
- **Logs**: JSON con `timestamp`, `level`, `service`, `env`, `msg` y allowlist de campos; niveles
  INFO/WARN/ERROR según política; sin datos sensibles; sin logs por métrica (un evento por intento,
  no contadores). Desvío: sin `request_id` (el backend no genera ids de petición). El resto del
  backend conserva `console.error` (no-objetivo del cambio).

## Desvíos

- **D-1 (diseño → implementación, menor)**: campos de log `msg`/`timestamp` en vez de
  `event`/`time` de D-8, para seguir los nombres base de los guidelines. Eventos extra
  `usuarios.creacion_rechazada` y `auth.restablecimiento_rechazado` (WARN).
- **D-2 (menor)**: `AuthService.login` suma un quinto parámetro opcional `empresa`; `MENSAJE_ACCESO`
  vive en `auth.service.ts`; ícono `lock` en vez de `key`. Justificados en los `apply-progress`.
- **D-3 (integración, previsto en tasks)**: al integrar PR 2 con PR 1, `auth.service.spec.ts`
  choca (add/add: lo crean las dos ramas) y el spec de app-interna-ux llama a
  `login(correo, documento, empresa_id)`. Resolución verificada en el merge de prueba: conservar los
  dos specs (el de contraseñas como archivo aparte o unido) y pasar una contraseña en esa llamada.
  `auth.service.ts` se fusiona solo.
- **D-4 (operativo, importante)**: `bcryptjs` no queda en git (`backend/node_modules` está
  ignorado aunque tiene archivos versionados). Cualquier checkout del backend necesita
  `npm install` en `backend/` antes de arrancar o testear; sin eso, `require('bcryptjs')` falla.
- **D-5 (operativo, importante)**: la migración ya está aplicada en `kuvu_db`. Un backend de
  cualquier rama sin este cambio responde `GET /api/usuarios` con `SELECT u.*`, es decir, **con
  `password_hash`**, y su login sigue aceptando solo correo + documento. Hasta mergear PR 1 conviene
  correr el backend desde `feat/auth-contrasenas`.
- **D-6 (zona horaria)**: `bloqueado_hasta` queda en la hora local del proceso Node y se compara
  en JS; consultarlo con `NOW()` en SQL (UTC en el contenedor) da otra hora. Documentado.
- **D-7 (limpieza pendiente)**: queda un volumen Docker anónimo huérfano del primer contenedor
  descartable de T-13; no se borró sin confirmar su id con el usuario.

## Observaciones para `secure` (no son fallos de la spec)

- Un intento sobre una cuenta bloqueada responde sin verificar hash, más rápido que uno sobre una
  cuenta activa: la diferencia de tiempo puede revelar que la cuenta existe y está bloqueada.
- `PUT` y `DELETE` de usuarios y el resto de la API siguen sin autenticación (no-objetivo, sin
  JWT). En particular `PUT /api/usuarios/:id` permite cambiar el correo o documento de otra cuenta.
- La temporal inicial = documento es un dato visible en la app y en la respuesta del login: queda
  expuesta hasta que cada usuario la cambia.
