# Apply progress — tema-claro-tokens / paginas

Rama: `fix/tema-claro-tokens`. Se apoya en el slice `chrome` (T-1, `@theme static`).

```
test_mode: test-after
test_command: $env:CHROME_BIN='C:\Program Files\Google\Chrome\Application\chrome.exe'; npx ng test --watch=false --browsers=ChromeHeadless (desde frontend/proyecto_angular)
tests_status: verde (467/467)
tests_agregados: ninguno
excepciones_sin_test: T-4 — quitar fallbacks cuyo literal es idéntico al token no cambia comportamiento ni estilo calculado; se verifica por diff de píxeles (abajo). El test de presencia de tokens es un no-objetivo aceptado (design D-4).
logs_conforme: sí (sin logs; solo SCSS)
```

## Tareas

| Tarea | Estado | Detalle |
|---|---|---|
| T-4 | Completa | Fallbacks quitados en `pages/contacto` (15), `pages/servicios` (15), `pages/legal` (10) y `pages/not-found` (3). Ninguno de estos archivos tiene comentarios sobre fallbacks |
| T-5 | Completa | Build y Karma en verde, más diff de píxeles |

## Evidencia

- **`ng build`:** compila. Total inicial de 438,62 kB, igual que tras `chrome`: los SCSS de páginas
  van en chunks lazy. Sin warnings nuevos (solo `css-inline-fonts`).
- **Karma:** la primera corrida dio 466/467 con 1 fallo. La segunda no mostró el fallo y tres
  corridas más seguidas dieron 467/467. No se pudo identificar el spec que falló. El slice solo
  cambia SCSS de chunks lazy cuyo estilo calculado no cambia, así que se registra como
  intermitencia ajena al cambio y queda para observar en `verify`.
- **Diff de píxeles** (`scratchpad/diff.mjs`, tolerancia de 24 en la suma RGB) entre
  `shots-chrome` y `shots-paginas` para contacto, legal, servicios y 404, en 1280/375 y
  claro/oscuro: **16 de 16 iguales, 0 px de diferencia**. El slice es visualmente neutro, como
  pide RF-05.
- **Contra la base** (`shots-base`): esas cuatro rutas solo difieren en 196 px de las filas 20-59
  a 1280 en tema claro. Es el redondeo de los botones de WhatsApp y de tema del header
  (`rounded-icon`), que introduce el slice `chrome` (RF-04). No proviene de este slice.

## Desvíos

- Ninguno respecto de `tasks`.
- Se agrega `scratchpad/diff.mjs` (fuera del repo) para comparar capturas por píxel en vez de a
  ojo. Reemplaza la limitación declarada en spec ("comparación por inspección") por una medición.
  Queda disponible para `verify`.
