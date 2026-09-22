# login-intro-transition

Rediseño del flujo de acceso al portal KUVU: una intro cinematográfica de ~5 segundos presenta una
casa moderna que se ensambla en 3D (`CSS3D` exploded view, estética navy + blueprint cian/teal + glow
ámbar) y da paso a la selección de inmobiliaria y luego a las credenciales. La autenticación
conserva su contrato (`POST /api/auth/login` con `{correo, documento, empresa_id}`) y su lógica de
sesión en `AuthService`; nada de esto se modificó.

## Cómo funciona

### Flujo de tres estados

```
Carga de /acceder
  └─ IntroStateService.debeReproducirse()
       ├─ true  → AuthIntroComponent (5 fases × 1s) → landing pasa a selección
       └─ false → selección directa (reduced-motion o intro ya vista)
Selección de inmobiliaria (/acceder) → sessionStorage['empresaPreseleccionada'] → /login
Credenciales (/login) → POST /api/auth/login → /dashboard
```

- **`IntroStateService`** (`src/app/services/intro-state.service.ts`): singleton con flag de vida
  corta `introVistoEnEstaCarga`. La intro corre una sola vez por carga de app, no se repite al
  navegar `/login → /acceder`, y vuelve a correr tras un reload (F5). Respeta
  `prefers-reduced-motion` desde el constructor (lectura única de `matchMedia`).
- **`AuthIntroComponent`** (`src/app/components/shared/auth-intro/`): máquina de fases dirigida
  por TS — `fase` signal 1..5 con timers de 1000 ms y `output() completada` al llegar a 5. El
  template alterna markup por fase (`@if` sobre `fase()`); el SCSS dispara las transiciones:
  blueprint (fase 1), piezas flotando (fase 2), ensamblaje (fase 3), iluminación ámbar de
  ventanas (fase 4), casa terminada con sway de cámara y crossfade (fase 5, `.saliendo` de 650 ms).
  El ensamblaje usa `perspective` + `preserve-3d` con 12 piezas y custom props
  (`--dx0/--dy0/--dz0/--rot0/--rot1/--z1/--td`); sin three.js ni `@angular/animations`.
- **`LandingComponent`** (`src/app/components/landing/`): orquesta `INTRO → SELECTION` con señales
  `estado` y `transicionando`. `completadaIntro()` marca el flag en `IntroStateService` y ejecuta
  el crossfade de 650 ms. La selección reusa el buscador y la lista de empresas existentes; el
  fetch de empresas vive en `AuthService.cargarEmpresas()`.
- **`LoginComponent`** (`src/app/components/login/`): credenciales con correo + documento, badge de
  la empresa seleccionada, mapa `BG_MAP` de fondos por subdominio y trayectoria de navegación SPA
  (View Transitions activo). "Recordarme" y "¿Olvidaste tu contraseña?" son enlaces decorativos:
  el checkbox togglea una signal local sin persistencia y el enlace no tiene handler.

### Theming y flujo de empresa

- La empresa elegida viaja en `sessionStorage['empresaPreseleccionada']` (no persistente entre
  sesiones) y se lee/limpia al entrar a `/login`.
- El `AuthService` persiste la sesión en `localStorage` (`empresa_id`, `usuario`, `empresa`) y
  aplica el theming por empresa con CSS variables.

## Decisiones

- **CSS 3D puro en vez de three.js/WebGL** — la escena es una casa geométrica estilizada de 5 s;
  `perspective` + `preserve-3d` alcanza el resultado premium sin dependencia nueva ni costo de GPU
  permanente. Tradeoff: menos detalle que un render WebGL; la complejidad visual se compensa con
  blueprint, partículas y glow.
- **Máquina de fases por timers TS (+ señales) en vez de keyframes CSS únicos** — hace la animación
  testeable en Karma (asserts de `fase()` por tick) y permite omitirla con reduced-motion sin CSS
  condicional. Tradeoff: el timing vive en TS, el movimiento en CSS (acople deliberado y acotado).
- **Flag de intro por carga (en servicio, no en storage)** — cumple "una vez por carga" sin
  persistir nada; la intro se repite al recargar el documento a propósito.
- **Enlaces decorativos en PANTALLA 2** — por decisión de producto; el backend no tiene
  contraseña ni recuperación. "Recordarme" no persiste nada.
- **Glassmorphism navy en `/login`** alineado a la referencia visual `Transicion_login.png`,
  preservando la identidad azul→violeta del CTA.

## Limitaciones conocidas

- La intro completa el crossfade ~5.65 s desde el load (5 s de intro + 650 ms de fade): el contenido
  empieza a verse a los 5 s.
- "Recordarme" y "¿Olvidaste tu contraseña?" son decorativos sin acción (ver `spec`).
- Deuda registrada por `secure`: la API backend no tiene middleware de autorización por request y la
  sesión del SPA es client-side (`localStorage`). Riesgo Alto aceptado por el responsable, pendiente
  de un cambio dedicado (`auth-token-backend`).
- Warnings de bundle no bloqueantes: fuentes de Google inlined (`css-inline-fonts`, >10 kB) y
  `home.component.scss` (preexistente); candidatos a optimización futura.