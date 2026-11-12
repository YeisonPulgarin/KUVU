# Verify report — ajustes-hover-movil-y-textura

Estado verificado: `bf61958` (chrome), `bf9784c` (app), `e46c408` (artifacts) sobre
`release/integracion`. Slices completados: `chrome`, `app`, `cierre`. Omitidos: ninguno.

## Tests y build
- `npx ng test --watch=false --browsers=ChromeHeadless`: **714/714 en verde**.
- `npx ng build`: sin errores (warnings `css-inline-fonts` preexistentes de landing/login).

## Comprobación del CSS compilado (`dist/proyecto-dss/browser/`)
- Chunk del header: `.mobile-menu .mobile-item:active` y `.mobile-item.is-pressed` llevan
  `color: var(--color-brand-600)` y el tinte, y `... .mobile-label { background-size: 100% 2px }`,
  fuera de cualquier media query; `translateX(12px)` solo dentro de `no-preference`.
- `styles-*.css`: `.app-layout .main-content { background: radial-gradient(… var(--color-primario)
  8% …), url("…feColorMatrix values='0 0 0 0 .12 … -.6 0 0 0 .33'…") var(--color-bg);
  background-size: auto, 180px 180px }`. Gana sobre `.main-content { background:
  var(--color-bg) }` de `styles.css` por especificidad (0,2,0 contra 0,1,0). Ningún wrapper de
  página (`.page`, `.dashboard`) tiene fondo propio en las seis pantallas internas.

## Comprobación visual
Captura en Chrome headless de una página con las dos versiones del fondo lado a lado (mismos
valores compilados, tarjeta blanca y texto secundario `#718096`): con el velo del 93 % el fondo
se ve plano; con las motas el grano se percibe con claridad y el brillo de empresa aparece
arriba a la derecha, con el texto secundario igual de legible y la tarjeta lisa. Captura:
`C:\Users\wilso\AppData\Local\Temp\claude\9a0788992cf34c3e\79324649-6d0f-4701-833d-690b50462b63\scratchpad\bg.png`.

## Criterios de aceptación
| CA | Resultado | Evidencia |
|---|---|---|
| CA-1 estado al tocar fuera del bloque de movimiento | pasa | CSS compilado + spec de color y subrayado con `is-pressed` |
| CA-2 pausa de cierre; Escape inmediato | pasa | specs "after the tap feedback pause", "keep the chosen option marked", "Escape during the pause" |
| CA-3 `NavigationEnd` no corta; libera scroll | pasa | spec "should not cut the feedback pause" |
| CA-4 capas del fondo sin velo | pasa | spec de `app-layout` (radial + motas, `auto, 180px 180px`, sin `linear-gradient`) |
| CA-5 grano perceptible con media baja | pasa | captura; alfa medio estimado ~4 % por diseño (no se midió por píxel: PIL no está instalado) |
| CA-6 suite y build | pasa | arriba |

## Ejes del protocolo
- Documentación declarada: CHANGELOG (Fixed); architecture sin cambios (declarado en tasks).
- Guidelines: convenciones de `sdd-init.md` (estado visual fuera del bloque de movimiento,
  grano en `_grain.scss` sin emitir CSS). OK.
- Logs: sin logs. OK.

## Desvíos y observaciones
- El `:active` real de un toque no se reproduce en Karma; se cubre con `.is-pressed`, que
  comparte las reglas (excepción en `apply-progress/chrome`).
- Para verlo en local: el dev server recompila solo; no hace falta reiniciar `ng serve`.
  Recargar la pestaña (o Ctrl+F5 si el navegador conserva estilos viejos). En DevTools con
  emulación táctil, el cambio se ve al tocar y dura ~320 ms antes de que el panel se cierre.
