# Archive report — login-intro-transition

Cierre del cambio **login-intro-transition** — restructuración del flujo de acceso del portal
KUVU (Angular 21). Almacenamiento de artifacts: `files` (confirmado, sin push de memoria).

## Resumen de cierre

- **Qué se hizo**: intro cinematográfica en `/acceder` (casa moderna ensamblándose en 3D con CSS
  puro, 5 fases × 1s, estética navy + blueprint cian/teal + glow ámbar), una vez por carga de app y
  respetando `prefers-reduced-motion`. PANTALLA 1 de selección de inmobiliaria (copy nuevo,
  buscador y lista existentes) orquestada por `LandingComponent`. PANTALLA 2 de credenciales
  rediseñada en `/login` con "Inicia sesión", botón `Iniciar sesión →`, `← Cambiar de
  inmobiliaria` y enlaces decorativos "Recordarme"/"¿Olvidaste tu contraseña?". Sin cambios al
  contrato de auth (`POST /api/auth/login {correo, documento, empresa_id}`), al `AuthService` ni
  a las rutas.
- **Qué se decidió**: dos rutas preservadas (`/acceder` intro+selección, `/login` credenciales);
  decorativos sin funcionalidad (no hay contraseña en el backend); motor CSS 3D puro (sin
  three.js ni `@angular/animations`); flag de intro no persistente (se repite al recargar, no al
  navegar entre rutas); entrega en un solo slice `frontend`.
- **Qué quedó pendiente** (manual recomendado): check visual en viewport 767/480 y de la intro
  antes del merge; sección de "Acciones fuera del código" del `secure-report` abajo.

## Gerencia de seguridad (arrastrado de `secure-report`)

### Acciones fuera del código

- **Secretos a ROTAR**: ninguno detectado (scan de código e historial git limpio).
- **Dependencias a actualizar (SCA)**: `npm audit --omit=dev` → 0 vulnerabilidades.
- **Configuración / infra a endurecer**:
  1. **A1**: implementar sesión por token + middleware de autorización en todo `/api/*` —
     cambio SDD dedicado `auth-token-backend`.
  2. **A2**: minimizar PII en `localStorage` (no guardar `documento`; token en memoria/cookie
     httpOnly si se migra).
  3. **CSP y security headers**: `index.html` sin CSP; alinearlos en el servidor de despliegue.
  4. **CORS**: restringir `app.use(cors())` a los orígenes del frontend.

### Riesgo residual aceptado

- **A1 (Alto, pre-existente)**: API sin autenticación por request y sesión client-side
  (`localStorage`). Aceptado temporalmente por el responsable del proyecto (usuario) mientras se
  decide el cambio `auth-token-backend`. No es consecuencia de este work item.
- **A2 (Medio)**: PII en localStorage hasta migrar a token; no explotable hoy (sin XSS conocido).

## Refinamiento (arrastrado de `refine-report`)

### Deuda técnica residual (registrada, no resuelta)

- **A1/A2 de `secure`** → cambio SDD dedicado (ver arriba).
- **Warnings de bundle no bloqueantes**: fuentes de Google inlined (`css-inline-fonts`, >10 kB) y
  `home.component.scss` preexistente (15.37 kB sobre warning 10 kB); candidatos a un pase de
  optimización.

### Deliberadamente NO tocado

- Fonts inlined (YAGNI), `home.component.scss` (fuera del alcance), timing del crossfade 650ms
  (gold-plating; aceptado en verify como D1), mecanismo `transicionando`+timeout del landing
  (KISS), array `particulas` (trivial), y ningún control de `secure` (0 fixes aplicados).

### Cambios de refine aplicados

- Refactor único: `LandingComponent` reusa `AuthService.cargarEmpresas()` y elimina su fetch
  duplicado con URL hardcodeada. 47/47 tests verde antes y después (comportamiento preservado).

## Documentación (arrastrado de `document-report`)

- **Feature doc**: `docs/login-intro-transition.md` — qué hace, cómo funciona (3 estados,
  componentes, theming), decisiones y limitaciones.
- **Arquitectura**: `docs/architecture.md` actualizado (template completado con la arquitectura
  real: componentes, capas, flujos, decisiones estructurales, límites/no-goals).
- **CHANGELOG.md**: entrada bajo `[Unreleased]` — Added (intro, selección) + Changed (rediseño
  `/login`, separación de la selección).
- **README.md** (`fronted/proyecto_angular`): solo secciones afectadas — árbol de estructura
  (agrega `landing`, `auth-intro`, `intro-state.service`) y nota de flujo de acceso. Resto del
  README (Angular 19, DataService, credenciales de prueba) desactualizado de base, fuera del
  alcance.
- **OpenAPI / colecciones Bruno**: no aplica — ningún endpoint HTTP cambiado.
- **Guidelines**: sin cambios; sin convención nueva introducida.

## Verificación final

- Suite Karma: **47 SUCCESS, 0 FAILED** (post-secure/refine).
- `ng build`: exitoso (warnings de budget no bloqueantes).
- Criterios CA1–CA10 de `spec.md`: todos PASA con evidencia en `verify-report.md` (CA8 por
  inspección CSS).

## Estado

- Rama de trabajo sin PR creado (extensión `git` inactiva en `sdd.config.md`; el usuario maneja
  git directamente). Artifacts completos y consistentes bajo `sdd/login-intro-transition/`.