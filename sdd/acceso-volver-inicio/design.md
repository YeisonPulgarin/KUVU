# Design — acceso-volver-inicio

Satisface RF-1 a RF-7 de `spec.md` con un cambio local a `LandingComponent`.

## Componentes que se tocan

| Archivo | Cambio |
|---|---|
| `components/landing/landing.component.ts` | Agrega `RouterLink` a `imports` |
| `components/landing/landing.component.html` | Enlace `.back-home` como primer hijo de `.landing-container`; el `<img>` del logo envuelto en `<a class="brand-link">` |
| `components/landing/landing.component.scss` | Estilos `.back-home` y `.brand-link`, con su bloque `prefers-reduced-motion: reduce` |
| `components/landing/landing.component.spec.ts` | Tests de CA-1 a CA-5 |

No hay servicios, rutas ni estado nuevos. No hay logs: es navegación en el cliente sin evento
operativo (la política de logs de `DEVELOPMENT_GUIDELINES.md` no aplica).

## Decisiones

**D-1 — `routerLink` en un `<a>`, no `Router.navigate` en un `<button>`.** Es navegación: el
`<a>` da `href="/"`, abrir en otra pestaña y el rol de enlace (RF-3) sin código. `/login` usa
un botón para su "volver" porque además limpia el contexto de empresa; acá no hay nada que
limpiar. Descartado: botón con `navigate`, que pierde la semántica de enlace.

**D-2 — Dentro de `.landing-container`.** Así hereda `[inert]` durante la intro (RF-5) y el
`content-visibility: hidden` de `.tapado`, sin lógica nueva. El enlace usa
`align-self: flex-start` para quedar en el borde izquierdo de la columna (el contenedor centra
sus hijos). Descartado: posición fija en la esquina del viewport, que queda fuera del `inert`
y obliga a replicar la lógica de la intro.

**D-3 — Estilo.** `.back-home` replica el `.back-btn` de `/login` (texto `.78rem`,
`rgba(255,255,255,.55)`, chevron SVG de 14px `aria-hidden`, hover a `.9`). El tono base sube de
`.4` a `.55` para que el texto chico sobre la foto oscurecida tenga contraste AA. `min-height:
44px` con `display: inline-flex` da el área de toque (RF-7) sin cambiar el tamaño visual.

**D-4 — Foco visible.** El `:focus-visible` global usa `--color-brand-500`, que no tiene
contraste garantizado sobre el overlay oscuro. Ambos enlaces sobrescriben con
`outline: 2px solid rgba(140, 215, 255, .9)` (el celeste de `.card-label`) y
`outline-offset: 3px`; el del logo respeta su `border-radius: 12px`.

**D-5 — Logo.** `<a routerLink="/" class="brand-link" aria-label="KUVU, volver al inicio">`
envuelve el `<img>`, que pasa a `alt=""` (el nombre lo da el `aria-label`, evita la doble
lectura). El `<a>` es `display: inline-flex` para que su caja coincida con la imagen. Sin efecto
de hover con transform; solo `opacity`.

**D-6 — Movimiento.** Las transiciones de ambos enlaces son de `color`/`opacity` (`.2s`). Con
`prefers-reduced-motion: reduce` se anulan (`transition: none`).

**D-7 — Foco inicial.** El buscador conserva `autofocus` y el foco de `completadaIntro()`; los
enlaces quedan antes en el orden de tabulación (Shift+Tab desde el buscador).

## Tests

En `landing.component.spec.ts`, con el `RouterTestingModule` ya configurado: `href` de ambos
enlaces, `aria-label` del logo, `aria-hidden` del ícono, navegación a `/` al hacer clic
(`router.navigateByUrl` vía `RouterLink`, verificado con spy o con `router.url` tras
`fixture.whenStable`), y presencia de los enlaces dentro del contenedor `inert` con intro.
