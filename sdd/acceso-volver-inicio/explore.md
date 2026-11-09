# Explore — acceso-volver-inicio

## Qué existe hoy

`/acceder` es `LandingComponent` (`frontend/proyecto_angular/src/app/components/landing/`),
cargado lazy desde `app.routes.ts` y sin el flag `data.publicSite`. Muestra la intro
(`<app-auth-intro>`) la primera vez por sesión y debajo el selector de inmobiliaria:
marca (logo + tagline), una card glassmorphism con buscador y lista de empresas, y un pie
`© 2026 KUVU · YCW`.

- No hay ningún enlace a `/` en la pantalla. El logo es un `<img>` sin enlace. La única salida
  es el botón atrás del navegador.
- Mientras corre la intro, `.landing-container` lleva `[inert]`, así que cualquier control que
  viva dentro queda fuera del foco y del clic hasta que la intro termina.
- Al terminar la intro, `completadaIntro()` mueve el foco al buscador (`afterNextRender`), y el
  buscador también tiene `autofocus`.
- El componente no importa `RouterLink`; navega con `Router.navigate` (`/login` al elegir
  empresa).
- `/login` tiene un `.back-btn` ("Cambiar de inmobiliaria") que lleva a `/acceder`: texto chico
  `rgba(255,255,255,.4)` con chevron SVG de 14px, hover a `.75`. Es el lenguaje visual de
  "volver" del flujo de acceso.
- La SCSS de `/acceder` no tiene bloques `prefers-reduced-motion`; las transiciones de hover son
  cortas (`.2s`) y de color/transform.
- Navegar de `/acceder` a `/` usa el cross-fade por defecto de `withViewTransitions`
  (`route-view-transition.ts` solo marca `vt-public` entre dos rutas `publicSite`). Volver a
  `/acceder` después no repite la intro: `IntroStateService` ya la marcó como reproducida.

## Archivos relevantes

| Archivo | Rol |
|---|---|
| `components/landing/landing.component.html` | Template del selector; acá van el enlace de volver y el logo-enlace |
| `components/landing/landing.component.ts` | Imports del standalone (falta `RouterLink`) |
| `components/landing/landing.component.scss` | Estilos glassmorphism del selector |
| `components/landing/landing.component.spec.ts` | Tests Karma del selector (con `RouterTestingModule`) |
| `components/login/login.component.scss` (`.back-btn`) | Referencia visual del control "volver" |
| `route-view-transition.ts` | Transición entre rutas; no requiere cambios |

## Ambigüedades para el Gate A

1. Ubicación del control: arriba a la izquierda, fuera de la card (encima de la marca), o
   dentro de la card.
2. Elemento: enlace (`<a routerLink="/">`) o botón con `Router.navigate`.
3. Texto del control ("Volver al inicio", "Ir al inicio", "Inicio").
4. Si el logo pasa a ser enlace a `/` además del control explícito.

## Resolución del Gate A (modo automático, decisiones por default)

El cambio corre en modo automático sin consulta al usuario; ninguna ambigüedad bloquea, así
que se resuelven con estos defaults, que el usuario puede revisar:

1. Ubicación: arriba del selector, fuera de la card, alineado al borde izquierdo del contenedor
   (encima de la marca). La card no cambia.
2. Elemento: enlace `<a routerLink="/">`. Es navegación, no una acción: permite abrir en otra
   pestaña y lo anuncia el lector de pantalla como enlace.
3. Texto: "Volver al inicio", con chevron izquierdo como el `.back-btn` de `/login`.
4. Logo: pasa a ser enlace a `/` con nombre accesible "KUVU, volver al inicio".
