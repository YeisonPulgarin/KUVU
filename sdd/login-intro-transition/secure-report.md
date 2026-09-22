# Secure report — login-intro-transition

Fase ejecutada sobre el cambio aplicado. **Sin cambios de código aplicados en esta fase** —
los hallazgos accionables son de arquitectura pre-existente y exceden el alcance de este work
item (ver "Riesgo residual aceptado"). No requiere re-verify por esta fase.

## Modelo de amenazas (resumen)

- **Activos / datos sensibles**: credenciales en tránsito (correo + documento/cédula a
  `POST /api/auth/login`), sesión persistida en `localStorage` (`usuario`, `empresa`,
  `empresa_id`), selección de empresa en `sessionStorage` (no sensible).
- **Fronteras de confianza**: (1) navegador ↔ API backend (HTTP); el SPA es un cliente **no
  confiable** — todo lo que escribe en storage es forjable; (2) el backend debe autorizar por
  request. El frontend nunca debe ser la única defensa.
- **Puntos de entrada**: `LandingComponent` (empresas públicas), `LoginComponent`
  (credenciales), API abierta.
- **Flujos**: INTRO → selección → login → guard → dashboard. El guard de rutas es **solo UX**
  (señal client-side).

## Hallazgos por severidad

### A1 — API backend sin autenticación entre requests (Alto — pre-existente, FUERA del alcance)
- **Categoría**: CWE-306 (Missing Authentication for Critical Function) / OWASP A01 Broken Access Control.
- **Descripción**: `server.js` registra `./routes/usuarios|locs|contratos|pagos|mantenimiento`
  sin middleware de autorización: inspección de rutas no revela `token`/`Authorization`/
  `req.user`. El login devuelve `usuario`+`empresa` pero **ningún token ni sesión**. El guard
  del SPA (`auth.guard`) y `restaurarSesion()` confían ciegamente en `localStorage`, que es
  escribible por el cliente. Resultado: cualquiera puede llamar a `GET /api/pagos`, etc., sin
  credencial.
- **Alcanzabilidad**: confirmada por inspección de `server.js` y rutas (sin middleware). En
  producción el API es internet-facing → confirmada.
- **Estado**: **Riesgo aceptado → requiere decisión del responsable**. No se corrige en este
  cambio: introducir sesión por token + middleware tocaría el contrato de la API y todas las
  rutas (prohibido por spec/CA10 y no-objetivo explícito). Recomendación: cambio SDD dedicado
  (`auth-token-backend`) con JWT/bearer, middleware de verificación en `/api/*` y guards del
  SPA consultando estado real del token.
- **Fix aplicado**: ninguno (fuera de alcance).
- **¿Cambia comportamiento observable?**: no (no se tocó código).
- **Positivo relacionado**: el único check de sesión server-side que existe — el query de
  login (`WHERE u.correo=? AND u.documento=? AND u.empresa_id=?`) — es **parametrizado** y
  valida membrecía por empresa; neutraliza que un cliente forje `empresa_id` en
  `sessionStorage` (ver A3).

### A2 — PII persistida en `localStorage` en claro (Medio — pre-existente)
- **Categoría**: CWE-922 (Insecure Storage of Sensitive Information) → depende del riesgo XSS.
- **Descripción**: el `usuario` guardado en `localStorage` incluye `documento` (cédula, PII).
  Si un XSS llegara a existir, exfiltraría credenciales/PII al instante.
- **Alcanzabilidad**: no hay XSS conocido en el SPA (ver A4); no alcanzable hoy por esa vía.
- **Estado**: **Mitigado hoy / riesgo aceptado** — se resuelve de forma natural con A1 (token
  sin PII / minimizar lo persistido). Fuera del alcance de este cambio.
- **¿Cambia comportamiento observable?**: no.

### A3 — `empresa_id` forjable en `sessionStorage` (Confirmado → MITIGADO, sin fix)
- **Categoría**: CWE-639 (Authorization Bypass Through User-Controlled Key).
- **Descripción**: el rol de una empresa en `/login`? El flujo deja que el cliente defina la
  empresa preseleccionada (sessionStorage). Si se forja un `empresa_id` ajeno, el login
  intentará autenticar contra esa empresa.
- **Alcanzabilidad**: **no explotable** — el query de login valida esa membrecía y devuelve 401
  si el correo/documento no pertenecen a la empresa presentada. Control server-side correcto.
- **Estado**: **Confirmado → mitigado por el servidor**. Sin fix en el frontend (no hay capa
  de defensa mejor en el cliente; tocar esto sería engañoso).

### A4 — Superficie del cambio: sin hallazgos (resultado limpio en el slice aplicado)
- **Descripción**: se revisó el código del change (intro, landing, login):
  - Interpolaciones de `nombre`, `error()`, copy: escapadas por Angular (`{{ }}`) — sin XSS.
  - `bgUrl()` usa mapa whitelist `BG_MAP[subdominio]` con fallback → sin inyección de URL/path.
  - Colores de empresa vía `[style.*]`: setea propiedad de estilo de forma programática, sin
    romper la declaración (sin CSS-injection que escape el atributo).
  - Sin `bypassSecurityTrust*`, sin `innerHTML`, sin logs con credenciales.
  - Inputs: sin persistencia nueva; `documento` con `autocomplete="off"`, `correo` con
    `autocomplete="email"`. "Recordarme" es decorativo (sin persistir).
  - Secret scanning (fuentes del frontend + historial git): sin secretos hardcodeados.
  - SCA: `npm audit --omit=dev` → **0 vulnerabilidades**.
- **Estado**: sin acciones.

## Acciones fuera del código (obligatorio marcar)

- **Secretos a ROTAR**: ninguno detectado (scan de código e historial limpio).
- **Dependencias a actualizar (SCA)**: `npm audit` limpio.
- **Configuración / infra a endurecer** (recomendaciones, fuera del cambio):
  1. **A1**: sesión por token + middleware de autorización en todo `/api/*` — cambio SDD dedicado.
  2. **A2**: minimizar PII en `localStorage` (no guardar `documento`; token en memoria/cookie
     httpOnly si se migra a cookie).
  3. **CSP y security headers**: `index.html` no define CSP; headers dependen del servidor
     (nginx/railway) → revisar en la fase de despliegue (`Content-Security-Policy`,
     `X-Content-Type-Options`, etc.).
  4. **CORS**: `app.use(cors())` abierto en backend; restringir a los orígenes del frontend.

## Riesgo residual aceptado

- **A1 (Alto, pre-existente)**: API sin autenticación por request y sesión client-side. **Aceptado
  de forma temporal** mientras se decide el cambio `auth-token-backend`. Aceptado por: el
  responsable del proyecto (usuario). No es consecuencia de este work item; este cambio no
  expande ni reduce la superficie.
- **A2 (Medio)**: PII en localStorage hasta migrar a token; no explotable hoy (sin XSS).

## Alcance de la búsqueda

- **Qué se buscó**: secretos en fuentes del frontend y en el historial git (patrones
  `password/api_key/token/Bearer/AKIA`), dependencias vulnerables (`npm audit`), revisión
  manual de la superficie del cambio (XSS, CSS/path injection, autorización client-side,
  persistencia), y autorización real del backend (inspección de `server.js` y rutas).
- **Herramientas**: revisión manual + `npm audit` + grep de patrones; sin scanner SAST/DAST
  comercial dedicado.
- **Fuera de alcance**: backend Go/Express más allá del login, infra de despliegue
  (nginx/railway), y tests de penetración activos.
- **Límite del método**: un scan limpio no prueba ausencia de vulnerabilidades.