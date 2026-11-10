## Seguridad — auth-contrasenas

### Modelo de amenazas (resumen)

- **Activos / datos sensibles**: contraseñas (en tránsito en el cuerpo de las peticiones) y sus
  hashes bcrypt; estado de bloqueo; PII de `usuarios` (correo, documento, teléfono); capacidad de
  administrar usuarios de una empresa.
- **Fronteras de confianza y entradas**: navegador → API Express (`POST /api/auth/login`,
  `/api/auth/cambiar-password`, `POST /api/usuarios`, `POST /api/usuarios/:id/restablecer-password`,
  y el CRUD existente); API → MariaDB (`kuvu_app`); operador → scripts de migración.
- **Contexto**: aplicación académica, backend en `localhost:3000`, BD publicada solo en
  `127.0.0.1`, sin sesión ni token en la API (no-objetivo), CORS abierto (no-objetivo).
- **STRIDE-lite**: suplantación (adivinar contraseñas, enumerar cuentas), divulgación (hash en
  respuestas o logs), elevación (crear o restablecer sin ser administrador), DoS (bloqueo de
  cuentas, CPU de bcrypt), manipulación (`PUT` con campos de contraseña).

### Hallazgos por severidad

**1. Diferencia de tiempo en cuenta bloqueada — Bajo** (explotable en red, revela solo
existencia + bloqueo de una cuenta cuyo correo ya se conoce).
- Categoría: CWE-208 (Observable Timing Discrepancy) / OWASP A07.
- Descripción: un intento sobre una cuenta bloqueada respondía sin la verificación bcrypt que
  hacen todos los demás caminos, así que la latencia distinguía "existe y está bloqueada" de "no
  existe".
- Estado: **Corregido**.
- Fix y capa: `backend/auth/credentials.js`: el camino de cuenta bloqueada también verifica
  contra `DUMMY_HASH`. Todo camino de rechazo hace exactamente una verificación bcrypt.
- Verificación: test de regresión en `test/credentials.test.js` ("every rejection path runs
  exactly one bcrypt verification"), que cuenta las verificaciones en los 5 caminos de rechazo.
- ¿Cambia comportamiento observable?: no (mismo status y cuerpo; solo iguala la latencia).

**Revisado sin hallazgo accionable**:
- Inyección SQL: todas las consultas nuevas usan parámetros `?`; el doble de BD de los tests
  falla ante SQL no reconocido.
- Divulgación del hash: columnas explícitas en `usuarios` y `auth`; tests que lo verifican en
  todas las respuestas. Logs con allowlist de campos.
- Enumeración por mensaje: un único cuerpo 401 para todo rechazo (test).
- Elevación: crear y restablecer exigen credenciales completas de un administrador activo de la
  misma empresa; los fallos cuentan para su bloqueo (sin oráculo de fuerza bruta). `PUT` no toca
  la contraseña (test).
- Mass assignment: `POST`/`PUT` toman campos explícitos; el frontend envía solo los editables.
- Contraseña del administrador en el frontend: solo en memoria del formulario, se limpia tras
  cada intento y al cerrar; nada en `localStorage`. El cambio pendiente no guarda contraseña.
- Cripto: bcryptjs (estándar, sal por hash, costo 12); comparación de la librería; límite de 72
  bytes validado por la política.
- XSS: mensajes de reglas y errores renderizados con interpolación de Angular (escapada).

### Acciones fuera del código (obligatorio marcar)

- **Secretos a ROTAR**: ninguno. El diff no agrega secretos; `DUMMY_HASH` es el hash de un valor
  aleatorio descartado y los hashes de `04-auth-seed.sql` son de la contraseña demo pública
  `123`.
- **Dependencias (SCA)**: `bcryptjs@3.0.3` sin avisos. `npm audit --omit=dev` reporta avisos
  **preexistentes**, no introducidos por este cambio: `proxy-addr` (crítico) y `body-parser`
  (alto) vía `express`, `qs` (moderado) y `mysql2` (moderado, directo). Todos con arreglo
  disponible (`npm audit fix`). Recomendación: actualizarlos en un cambio propio, con la suite
  como red.
- **Configuración / infra**: ninguna nueva. Las respuestas de datos ya no incluyen el hash solo
  en esta rama: mientras no se mergee, un backend de otra rama sobre `kuvu_db` migrada expone
  `password_hash` en `GET /api/usuarios` (ver verify-report D-5).

### Riesgo residual aceptado

- **`PUT` y `DELETE` de usuarios, y el resto de la API, sin autenticación** (alto en una red
  hostil; acotado aquí a `localhost`). Quien alcance el backend puede editar o borrar usuarios,
  incluido cambiar el correo o documento de otra cuenta. Requiere sesión/token en la API, que es
  no-objetivo de este cambio. **Acepta: el usuario** (decisión comunicada por el orquestador).
- **Temporal inicial = documento**: el documento es un dato visible en la app, así que la
  temporal de los usuarios migrados es conocible hasta que cada uno la cambie. Mitigado por el
  cambio obligatorio (la temporal no da acceso a la app, solo a la pantalla de cambio, que exige
  una contraseña que cumple la política y no contiene el documento). **Acepta: el usuario.**
- **Bloqueo por cuenta como DoS acotado**: quien conozca un correo puede bloquear esa cuenta 15
  minutos. Aceptado en la spec (no-objetivos).
- **Sin límite por IP**: el costo de bcrypt (≈ 250–300 ms por intento) hace que una ráfaga de
  logins consuma CPU. Mitigaría un rate limit por IP (p. ej. `express-rate-limit`); queda fuera
  de alcance para una app local.

### Alcance de la búsqueda

- Revisión manual de `backend/auth/*`, `routes/auth.js`, `routes/usuarios.js`,
  `scripts/bootstrap-passwords.js`, `db/init/03-04`, y del frontend de acceso y usuarios
  (`auth.service.ts`, login, cambio de contraseña, usuarios, `data.service.ts`).
- Búsqueda de secretos con patrones sobre el diff de las dos ramas contra su base.
- SCA con `npm audit --omit=dev` en `backend/`. No se corrió SAST automatizado ni DAST; el
  comportamiento de los endpoints se ejercitó con los tests de ruta y la prueba de punta a punta
  de T-13.
- Fuera de alcance: CORS, sesión/JWT, el resto de rutas del backend, el frontend público.
