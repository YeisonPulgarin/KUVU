## Seguridad — home-ui-ux

### Modelo de amenazas (resumen)

- **Activos / datos sensibles:** preferencia de tema en `localStorage` (`kuvu-theme`,
  no sensible); contenido de marketing estático. **Este cambio no maneja PII, credenciales
  ni datos financieros.**
- **Fronteras de confianza:** una sola, el navegador del visitante. El componente home no
  introduce llamadas de red, ni endpoints, ni entrada de usuario (sin formularios, sin query
  params, sin `@Input` desde fuera).
- **Puntos de entrada:** template DOM, `localStorage`, `matchMedia`, `IntersectionObserver`,
  y el `<script>` inline en `index.html`.
- **Contexto de despliegue:** frontend estático; headers/CSP se configuran en la infra de
  despliegue (nginx/Railway), fuera del repo.

### Hallazgos por severidad

#### 1. Acceso a `localStorage` sin guard en el componente — Bajo (robustez / disponibilidad)

- **Severidad:** Bajo · explotabilidad baja (no es atacante; es fallo de entorno) ·
  alcanzabilidad alta (cualquier visitante con storage deshabilitado o cuota llena).
- **Categoría:** CWE-248 (Uncaught Exception) / disponibilidad (STRIDE: Denial of Service
  auto-infligido).
- **Descripción:** `ngOnInit` leía `localStorage.getItem` y `toggleTheme` escribía
  `localStorage.setItem` sin protección. Si el acceso lanza (Safari modo privado, storage
  deshabilitado, `QuotaExceededError`), el `ngOnInit` propaga la excepción y **la home no
  renderiza**. El `<script>` inline de `index.html` ya envolvía el mismo acceso en `try/catch`,
  así que el componente era inconsistente con él.
- **Estado:** **Corregido.**
- **Fix aplicado y capa:** en `home.component.ts`, helpers `readStoredTheme()` /
  `persistTheme()` envuelven el acceso en `try/catch` (misma capa, el componente). No se
  tocó ninguna otra lógica.
- **Verificación / test de regresión:** 2 tests nuevos en `home.component.spec.ts`:
  `localStorage.getItem` que lanza no rompe el render; `localStorage.setItem` que lanza no
  rompe `toggleTheme`. Suite: 60/60 SUCCESS.
- **¿Cambia comportamiento observable?:** **No.** Con storage disponible el comportamiento es
  idéntico; con storage roto, la home ahora renderiza en vez de romperse.

#### 2. `<script>` inline en `index.html` vs. CSP futura — Informativo (sin vuln)

- **Severidad:** Informativo · no explotable hoy.
- **Descripción:** el script inline solo lee `localStorage`, agrega la clase `.dark` y está en
  `try/catch`; no usa `eval`, `innerHTML` ni datos de usuario. Es seguro. Nota: una futura
  `Content-Security-Policy` con `script-src 'self'` lo bloquearía y requeriría hash/nonce.
- **Estado:** Riesgo aceptado / fuera de alcance. Hoy **no hay CSP configurada** (vive en la
  infra de despliegue, no en el repo). Acción de despliegue, no de este cambio.

#### 3. Fuente Geist servida desde `fonts.googleapis.com` — Informativo (privacidad / supply chain)

- **Severidad:** Informativo · no es vulnerabilidad.
- **Descripción:** dependencia de terceros en runtime (disponibilidad + IP del visitante
  expuesta a Google). Fue una decisión explícita de `design.md` (Google Fonts).
- **Estado:** Riesgo aceptado. Endurecimiento opcional (self-host de la fuente), fuera del
  alcance de este cambio. No se aplica (cambiaría el enfoque acordado).

### Acciones fuera del código (obligatorio marcar)

- **Secretos a ROTAR:** ninguno. El cambio no introduce secretos; `kuvu-theme` es una clave de
  preferencia, no un secreto.
- **Dependencias a actualizar (SCA):** ninguna nueva. Auditoría completa de dependencias y
  escaneo de historial de git: fuera del alcance de este cambio (tarea de baseline del repo).
- **Configuración / infra a endurecer:** headers de seguridad (CSP, HSTS, `X-Frame-Options`,
  `X-Content-Type-Options`) en la capa de despliegue. No vive en el repo; se marca para la
  fase de despliegue.

### Riesgo residual aceptado

- Script inline sujeto a futura CSP — aceptado; se resolverá con hash/nonce al configurar CSP
  en despliegue.
- Dependencia de Google Fonts en runtime — aceptado (decisión de diseño).

### Alcance de la búsqueda

- **Buscado:** `innerHTML` / `bypassSecurityTrust` / `eval` / `new Function` /
  `document.write` / `target=_blank` / URLs externas en el componente home → **0 resultados**.
- **Buscado:** uso de `localStorage`/`sessionStorage` en `src/` → revisado; solo el tema
  corresponde a este cambio (el resto es pre-existente: `auth.service.ts`, landing, login).
- **Buscado:** secretos en los archivos tocados → ninguno.
- **Modelado:** STRIDE-lite sobre el componente home y el script de tema.
- **Fuera de alcance:** backend Go, base de datos, infra de despliegue (nginx/Railway/Docker),
  escaneo de historial de git, SCA completo. Un scan limpio **no** prueba ausencia de
  vulnerabilidades: dice qué se buscó y qué quedó afuera.
