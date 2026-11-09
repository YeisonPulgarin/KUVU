# login-intro-transition

Flujo de acceso al portal KUVU en tres pasos: una intro de ~3 s (una hoja que pasa como la página
de un libro, detallada en `docs/acceso-orden-e-intro.md`), la selección de inmobiliaria y las
credenciales. La autenticación usa `POST /api/auth/login` con `{correo, documento, empresa_id}` y la
lógica de sesión de `AuthService`.

## Cómo funciona

### Flujo de tres estados

```
Carga de /acceder
  └─ IntroStateService.debeReproducirse()
       ├─ true  → AuthIntroComponent (hoja que pasa, 2,9 s) → landing pasa a selección
       └─ false → selección directa (reduced-motion o intro ya vista en la pestaña)
Selección de inmobiliaria (/acceder) → sessionStorage['empresaPreseleccionada'] → /login
Credenciales (/login) → POST /api/auth/login → /dashboard
```

- **`IntroStateService`** (`src/app/services/intro-state.service.ts`): recuerda la intro por
  pestaña en `sessionStorage['kuvu.intro.seen']`, con un flag en memoria si el storage falla. No se
  repite en recargas ni al navegar `/login → /acceder`, y una pestaña nueva vuelve a mostrarla.
  Respeta `prefers-reduced-motion` desde el constructor (lectura única de `matchMedia`).
- **`AuthIntroComponent`** (`src/app/components/shared/auth-intro/`): la hoja que pasa, con
  coreografía CSS, fin por `setTimeout(2900)` y salto por clic, teclado o botón "Saltar". Ver
  `docs/acceso-orden-e-intro.md`.
- **`LandingComponent`** (`src/app/components/landing/`): orquesta `INTRO → SELECTION` con la señal
  `estado`. El selector se renderiza siempre, `inert` mientras dura la intro. `completadaIntro()`
  marca la intro como vista, pasa a `SELECTION` en el acto y enfoca el buscador. La lista sale de
  `AuthService.cargarEmpresas()`, en el orden de `id`.
- **`LoginComponent`** (`src/app/components/login/`): credenciales con correo + documento, badge de
  la empresa seleccionada, mapa `BG_MAP` de fondos por subdominio y trayectoria de navegación SPA
  (View Transitions activo; la entrada a `/acceder` con intro pendiente saltea el cross-fade). "Recordarme" y "¿Olvidaste tu contraseña?" son enlaces decorativos:
  el checkbox togglea una signal local sin persistencia y el enlace no tiene handler.

### Theming y flujo de empresa

- La empresa elegida viaja en `sessionStorage['empresaPreseleccionada']` (no persistente entre
  sesiones) y se lee/limpia al entrar a `/login`.
- El `AuthService` persiste la sesión en `localStorage` (`empresa_id`, `usuario`, `empresa`) y
  aplica el theming por empresa con CSS variables.

## Decisiones

- Las decisiones de la intro (CSS con franjas, timer en TS, recordado por pestaña, movimiento
  reducido) están en `docs/acceso-orden-e-intro.md`.
- **Enlaces decorativos en PANTALLA 2** — por decisión de producto; el backend no tiene
  contraseña ni recuperación. "Recordarme" no persiste nada.
- **Glassmorphism navy en `/login`** alineado a la referencia visual `Transicion_login.png`,
  preservando la identidad azul→violeta del CTA.

## Limitaciones conocidas

- La intro dura ~2,9 s; el selector empieza a verse bajo la hoja a ~1,4 s.
- "Recordarme" y "¿Olvidaste tu contraseña?" son decorativos sin acción (ver `spec`).
- Deuda registrada por `secure`: la API backend no tiene middleware de autorización por request y la
  sesión del SPA es client-side (`localStorage`). Riesgo Alto aceptado por el responsable, pendiente
  de un cambio dedicado (`auth-token-backend`).
- Warnings de bundle no bloqueantes: fuentes de Google inlined (`css-inline-fonts`, >10 kB) y
  `home.component.scss` (preexistente); candidatos a optimización futura.