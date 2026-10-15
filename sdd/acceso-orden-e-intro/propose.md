# propose — acceso-orden-e-intro

## Intent

El selector de inmobiliarias (`/acceder`) muestra las empresas en el orden de su `id`, y la
entrada al portal es un pase de hoja breve, sutil y elegante en lugar de la animación pesada
de ensamblaje de una casa.

## Alcance

1. **Orden por id** — `GET /api/empresas` devuelve las empresas activas ordenadas por `id`
   ascendente (Amarilo, Nido Rent, Balcones de San Soucci, Mi Inmueble). El frontend conserva
   ese orden y el filtro por texto lo respeta.
2. **Intro "hoja que pasa"** — reemplaza la intro de la casa 3D por una hoja que se curva
   como la página de un libro real, con sombra suave, y revela el selector.
   - La hoja lleva el logo KUVU y una casa dibujada en trazo fino, como detalle sutil.
   - Dura alrededor de 2 s, con el selector visible al terminar.
   - Se puede saltar con clic/tap, con una tecla (Escape/Enter/Espacio) y con un botón
     "Saltar" visible y accesible.
   - Se ve bien en móvil, tablet y desktop, con proporciones y legibilidad adaptadas a cada
     ancho y orientación.
   - Solo se muestra la primera vez: el navegador recuerda que ya se vio y no la repite en
     recargas ni visitas posteriores.
   - Suena un efecto sutil de hoja que pasa, a volumen bajo. Si el navegador bloquea el audio
     sin una interacción previa, la intro sigue en silencio, sin errores ni avisos.
   - **Movimiento reducido** (`prefers-reduced-motion: reduce`): la intro y el sonido se
     omiten y el selector aparece directamente. Criterio: el pase de hoja es movimiento
     decorativo de gran superficie, justo lo que esa preferencia pide evitar, y omitirlo
     mantiene el comportamiento que ya tiene el proyecto.
3. **Higiene SDD** — `sdd/sdd.config.md` declara MariaDB 10.4 como base y los slices de este
   cambio, y `sdd/sdd-init.md` registra `expone_api_http: true`, porque Express expone `/api/*`
   al SPA.
4. Tests (`test-after`) del orden del endpoint, de la intro (duración, salto, recordado,
   reduced-motion, degradación del audio) y documentación actualizada
   (`docs/login-intro-transition.md` o el doc del cambio, CHANGELOG).

## Slices

| Orden | Slice | Qué cubre |
|---|---|---|
| 1 | `backend-orden` | Orden por `id` en `GET /api/empresas` + test |
| 2 | `intro` | Componente de la intro "hoja que pasa", sonido, salto, recordado, responsive + tests |
| — | `cierre` | Corrección de `sdd.config.md` / `sdd-init.md` + docs/CHANGELOG |

## No-objetivos

- **Migrar el selector o el login a Astro** (ni a otro framework): el selector vive en la app
  Angular junto con `AuthService` y el theming por empresa, y cambiar de framework es un
  cambio de arquitectura desproporcionado frente a una animación de 2 s.
- Agregar librerías de animación, 3D o audio (three.js, GSAP, Lottie, Howler): se resuelve
  con CSS + Angular + APIs nativas del navegador.
- Un orden configurable de empresas (columna `orden`, drag & drop en un admin): el criterio es
  el `id`.
- Cambiar el contrato de autenticación (`POST /api/auth/login`), la pantalla `/login` o la
  deuda de autorización registrada (`auth-token-backend`).
- Controles de sonido (mute/volumen) en la UI.

## Approach

- Backend: un cambio puntual en la cláusula de orden de la consulta existente.
- Frontend: rehacer `AuthIntroComponent` como escena de pase de hoja con CSS 3D (curvatura +
  sombra) dirigida por Angular. `LandingComponent` conserva su orquestación `INTRO → SELECTION`.
  `IntroStateService` pasa de recordar "visto en esta carga" a "visto en este navegador".
  El sonido se reproduce con una API nativa del navegador, y el design elige entre sintetizarlo
  (Web Audio, ruido filtrado) o usar un asset corto con licencia libre.
- Los detalles de timing, breakpoints, accesibilidad del botón y almacenamiento se definen en
  `spec` y `design`.
