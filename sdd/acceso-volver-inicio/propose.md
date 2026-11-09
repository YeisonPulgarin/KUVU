# Propose — acceso-volver-inicio

## Intent

Quien llega a `/acceder` (tras la intro o desde la home) no tiene forma visible de volver a la
home: depende del botón atrás del navegador. El cambio agrega una salida clara a `/`.

## Alcance

- Un enlace "Volver al inicio" en `/acceder`, arriba del selector, con el lenguaje visual del
  "volver" que ya usa `/login`.
- El logo de `/acceder` pasa a ser enlace a `/`.
- Ambos accesibles por teclado (foco visible) y con nombre accesible; el enlace queda inerte
  mientras corre la intro, como el resto del selector.
- Su movimiento (hover) se limita a cambios de color y se anula con
  `prefers-reduced-motion: reduce`.
- Tests Karma que cubren los dos enlaces.

## No-objetivos

- No rediseña `/acceder` (card, buscador, lista, fondo e intro quedan iguales).
- No toca `/login`, el sitio público (home, páginas, header, footer) ni la app interna.
- No toca `route-view-transition.ts` ni la lógica de la intro.
- No toca `sdd/sitio-publico-expresivo/`.

## Approach

Cambio local a `LandingComponent`: dos `routerLink="/"` en el template (enlace de texto y logo),
el import de `RouterLink` en el standalone y estilos propios en su SCSS. Slices: `intro` y
`cierre`.
