# Apply progress — tema-claro-tokens / chrome

Rama: `fix/tema-claro-tokens` (desde `feat/home-animaciones`, `e16d732`).

```
test_mode: test-after
test_command: $env:CHROME_BIN='C:\Program Files\Google\Chrome\Application\chrome.exe'; npx ng test --watch=false --browsers=ChromeHeadless (desde frontend/proyecto_angular)
tests_status: verde (467/467, igual que la red de seguridad previa al cambio)
tests_agregados: ninguno
excepciones_sin_test: T-1 y T-2 — cambio de estilos sin comportamiento testeable en unidad (design D-4; el test de presencia de los 15 tokens es un no-objetivo aceptado). La cobertura automatizada es la regresión de color resuelto de steps-journey.component.spec.ts, que sigue en verde; el resto se verifica por CDP.
logs_conforme: sí (no se agregan logs; solo CSS/SCSS)
```

## Tareas

| Tarea | Estado | Detalle |
|---|---|---|
| T-0 | Completa | Build base de `feat/home-animaciones` copiado a `scratchpad/base`. Script `scratchpad/qa.mjs` (servidor estático con fallback SPA, Chrome headless por CDP, `prefers-reduced-motion: reduce`, tema por `localStorage['kuvu-theme']`). 36 escenarios capturados en `scratchpad/shots-base` (9 rutas × 2 viewports × 2 temas) con `results.json` |
| T-1 | Completa | `src/styles.css`: el bloque de tokens de marca es `@theme static` |
| T-2 | Completa | Fallbacks quitados en `styles.scss` (2), `site-header` (12), `site-footer` (11), `public-page` (6), `breadcrumb` (3) y `rich-text` (1). El comentario de `breadcrumb` queda solo con la ubicación del componente |
| T-3 | Completa | Build y Karma en verde (ver abajo) |

## Evidencia

- **Base (T-0):** en tema claro solo resuelven `brand-500` y `brand-700`. En la tarjeta de paso,
  fondo transparente, borde de 0 px y radio de 0 px; el número de paso es blanco sobre
  transparente. En oscuro, radios y `brand-200/300` están vacíos.
- **`ng build`:** los 15 tokens están en el `:root, :host` de `styles-*.css`. El CSS global pasa
  de 28.775 a 29.100 B (+325 B) y el total inicial de 438,51 a 438,62 kB. Sin warnings nuevos:
  sigue solo `css-inline-fonts` (P-4).
- **CDP sobre el build del slice** (`scratchpad/shots-chrome`): 0 de 36 escenarios con tokens
  vacíos. En la home a 1280, tema claro: tarjeta de paso con fondo `rgb(255,255,255)`, borde 1 px
  `rgb(205,220,205)` y radio de 16 px; número de paso con fondo `rgb(62,92,64)` y radio de 12 px;
  ícono de servicio con fondo `rgb(232,239,232)` y radio de 12 px. En oscuro, los valores de
  `.dark` se mantienen y se suman los radios (16 y 12 px).

## Desvíos

- Ninguno respecto de `tasks`. El crecimiento del CSS (+325 B) es menor que el del experimento
  de design (+343 B), porque los fallbacks de `styles.scss` también salen del CSS global.
