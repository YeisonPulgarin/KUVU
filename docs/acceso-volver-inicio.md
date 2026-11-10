# Volver al inicio desde /acceder

La pantalla de selección de inmobiliaria (`/acceder`) tiene dos salidas a la home (`/`): un
enlace "Volver al inicio" arriba de la marca y el logo de KUVU, que también es enlace. Sin
ellas, la única forma de volver es el botón atrás del navegador.

## Cómo funciona

Todo vive en `frontend/proyecto_angular/src/app/components/landing/`:

- `landing.component.html` — `a.back-home` (chevron SVG `aria-hidden` + "Volver al inicio") es
  el primer hijo de `.landing-container`; el logo está envuelto en `a.brand-link` con
  `aria-label="KUVU, volver al inicio"` y el `<img>` lleva `alt=""`. Los dos usan
  `routerLink="/"`, así que son enlaces reales (`href="/"`), navegan sin recargar y se pueden
  abrir en otra pestaña.
- `landing.component.ts` — importa `RouterLink` en el standalone.
- `landing.component.scss` — `.back-home` sigue el patrón del botón de volver de `/login`
  (`.back-btn`): texto `.78rem` blanco translúcido con chevron de 14px, más claro en hover, con
  `min-height: 44px` como área de toque y `align-self: flex-start` para quedar en el borde
  izquierdo de la columna. Ambos enlaces tienen foco visible celeste
  (`rgba(140, 215, 255, .9)`) y transiciones solo de color u opacidad, anuladas con
  `prefers-reduced-motion: reduce`.

Al estar dentro de `.landing-container`, los enlaces heredan el `[inert]` y el
`content-visibility: hidden` que ese contenedor tiene mientras corre la intro: no reciben foco
ni clic hasta que la intro termina. El foco inicial sigue en el buscador.

Salir a `/` no selecciona empresa ni escribe en `sessionStorage`. La navegación usa el
cross-fade por defecto de View Transitions (`/acceder` no es ruta `publicSite`), y volver a
`/acceder` en la misma pestaña no repite la intro.

Tests: `landing.component.spec.ts`, bloque `volver al inicio`.

## Decisiones

- **Enlaces, no botones.** Es navegación sin efectos: el `<a>` da semántica de enlace y abrir en
  otra pestaña. `/login` usa un botón para volver a `/acceder`; cambiarlo acá a botón pierde
  esas dos cosas.
- **Dentro del contenedor del selector**, no fijo en la esquina del viewport. Así comparte el
  bloqueo de la intro sin lógica propia; un control fijo afuera tendría que replicarla.
- **Foco celeste propio.** El `:focus-visible` global usa `--color-brand-500`, sin contraste
  garantizado sobre la foto oscurecida.
- **Texto a opacidad .55** (más que el `.4` de `/login`) para mantener contraste AA del texto
  chico sobre la foto.

## Limitaciones conocidas

- El hover con desplazamiento de las filas de empresa (`.empresa-row`) y las animaciones
  `slowZoom` / `fadeUp` de `/acceder` no respetan `prefers-reduced-motion`.
