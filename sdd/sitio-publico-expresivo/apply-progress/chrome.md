# Apply progress — chrome

| Tarea | Estado | Nota |
|---|---|---|
| T3.1 | Completa | `public/fonts/big-shoulders-display-latin.woff2` (35 KB, eje 800–900) + `OFL.txt`; `@font-face` con `swap` y `unicode-range` latin en `styles.css`, sin `@import` ni `preload` |
| T3.2 | Completa | `--font-display`, escala `--text-display-xl/l/m`, `--text-lead`, `--text-body-site`, `--color-on-brand` (alias) y `--grain-opacity` en `@theme static` / `.dark` |
| T3.3 | Completa | `src/styles/_site.scss` (incluido por `styles.scss`): `.site-root` + grano fijo, `.surface-dots`, `.surface-tint`, `.block-brand`, `.display-title(--xl/l/m)`, `em`, `.tape` (entrada sello con movimiento), `.lead-site`, `.btn-site(--ghost)`, `.site-container` |
| T3.4 | Completa | `components/public/headline/` + spec |
| T3.5 | Completa | `app-public-page`: `.site-root`, h1 display con `titleParts`, hero a la izquierda sobre trama, sin `@apply` |
| T3.6 | Completa | Header: contenedor 72rem y nav a 15 px; "Ingresar" sin cambios (`.btn-primary` azul, R5.4). Footer: nombre de marca en display |
| T3.7 | Completa | Barra de progreso con `--color-brand-600` → `--color-brand-700` |
| T3.8 | Completa | `ng build`: initial 443,91 kB (styles 33,35 kB), solo el `css-inline-fonts` preexistente (19,14 kB). QA CDP de las 9 rutas × 375/1280 × claro/oscuro: h1 en Big Shoulders Display en las 6 rutas internas (80 px a 1280, 39,65 px a 375), sin scroll horizontal, un `h1` por página, "Ingresar" con el mismo gradiente azul que la base. `/acceder` idéntico píxel a píxel; `/login` difiere en 17 px (cursor de texto del input, varía entre corridas) |

## Desvíos

- Contenedor de 72rem en header, footer, hero de página y `.site-container` (D2/D5 no fijaban
  ancho): coincide con el contenedor de las páginas, así hero y contenido alinean su borde.
- Breadcrumb alineado a la izquierda, a juego con el hero (antes centrado).
- El grano va por encima del contenido (`z-index: 60`, `pointer-events: none`) para texturar
  también bloques y superficies.

```
test_mode: test-after
test_command: npx ng test --watch=false --browsers=ChromeHeadless (frontend/proyecto_angular)
tests_status: verde (476/476)
tests_agregados: src/app/components/public/headline/headline.component.spec.ts, src/app/components/public/public-page/public-page.component.spec.ts
excepciones_sin_test: estilos globales (_site.scss, tokens, @font-face) y gradiente de la barra de progreso: verificados por QA CDP (font-family/font-size computados, capturas), no por Karma
logs_conforme: sí (sin logs nuevos)
```
