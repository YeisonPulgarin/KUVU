# Apply progress — slice `cta-banda` (T1, T2)

```
test_mode: test-after
test_command: $env:CHROME_BIN='C:\Program Files\Google\Chrome\Application\chrome.exe'; npx ng test --watch=false --browsers=ChromeHeadless   (desde frontend/proyecto_angular)
tests_status: verde (161 / 161; línea base previa al slice: 157 / 157)
tests_agregados: frontend/proyecto_angular/src/app/components/home/home.component.spec.ts (describe 'cta final legible', 4 tests)
excepciones_sin_test: ninguna. Contraste en hover y foco se verifica con medición en navegador (abajo), no con test unitario
logs_conforme: sí (sin logs: cambio solo de estilos)
```

## Estado de tareas

| # | Estado | Detalle |
|---|---|---|
| T1 | completa | `.cta-final`: `background-color: var(--color-brand-700, #2f4a2f)`. `.cta-button`: `color: #fff`; eliminados `background-color: #fff` y el `background-color` del hover; `transition` pasa a `transform, opacity` (la opacidad del hover de `.btn-primary` ahora transiciona); `&:focus-visible { outline: 2px solid #fff; outline-offset: 3px; }` |
| T2 | completa | 4 tests: fondo verde con el token anulado (`initial`), `h2`/`p` blancos, botón con texto blanco + `linear-gradient` + destino `/acceder`, y home sin `nav[aria-label="Ruta de navegación"]` ni `script[type="application/ld+json"]` (independiente del slice 2) |

Prueba de mutación de CA-1: sin el fallback, el test del fondo falla (`1 FAILED, 36 SUCCESS`
en la spec de home). Con el fallback restaurado, pasa.

## Archivos tocados

| Archivo | Cambio de este slice |
|---|---|
| `frontend/proyecto_angular/src/app/components/home/home.component.scss` | bloque `.cta-final` únicamente (+12 −8). Sin cambios previos de `home-imagen-equipo` en este archivo |
| `frontend/proyecto_angular/src/app/components/home/home.component.spec.ts` | `describe` nuevo al final del archivo |

Sin cambios en `.hero-cta`, `styles.css`, `styles.scss`, `shared.styles.scss` ni `site-header/`.

## Working tree compartido (D-1) — `git diff HEAD -U0` resultante

`home.component.spec.ts`:

| Hunk (lado nuevo) | Pertenece a |
|---|---|
| `@@ -225 +225,2` | `home-imagen-equipo` (sin cambios respecto de la línea base) |
| `@@ -228,4 +229,49` | `home-imagen-equipo` (sin cambios respecto de la línea base) |
| `@@ -271,0 +318,40` | **este cambio** (líneas 318-357, `describe('cta final legible')`) |

Los hunks quedan separados por líneas sin cambios, así que `git add -p` los separa con `n`/`y`
sin editar.

`home.component.scss`: todos sus hunks (`+380,2`, `+403`, `+406,2`, `+409`, `+412,6`) son de
este cambio.

## Guarda de tokens

`--color-*` emitidos en `dist/proyecto-dss/browser/styles-*.css`, antes y después del slice:
idénticos (`brand-700`, `brand-500` ×2, `brand-600`, `brand-100`, `home-bg`, `home-border`,
`home-muted`, `home-surface`, `home-surface-alt`, `home-text`; todo salvo `brand-700` y un
`brand-500` corresponde al bloque `.dark`). El test arma el nombre del token por partes
(`['--color', 'brand', '700'].join('-')`).

## Build

`npx ng build`: OK. Único warning `css-inline-fonts` (19.14 kB > 17 kB), que ya existía.

## Mediciones en navegador (build actual, Chrome headless vía CDP)

Estilos computados en 1440 y 390 claro, 1440 oscuro y 1440 claro con el token anulado. Los
cuatro casos son idénticos:

| Elemento / estado | Computado | Contraste |
|---|---|---|
| Fondo `.cta-final` | `rgb(47, 74, 47)` (también con el token anulado) | — |
| `h2` | `rgb(255, 255, 255)` | 9.81 : 1 |
| `p` | `rgba(255, 255, 255, 0.85)` | 7.63 : 1 |
| Botón en reposo | texto blanco, `linear-gradient(135deg, #2b4c8c, #3a6fd8)`, opacidad 1 | 8.35 : 1 a **4.72 : 1** (mínimo en `#3a6fd8`) |
| Botón en hover | texto blanco, opacidad 0.92 sobre la banda, `translateY(-2px)` | mínimo 5.03 : 1 |
| Botón con foco por Tab | `:focus-visible` verdadero, `outline: solid 2px #fff`, offset 3px | 9.81 : 1 contra la banda |

Capturas (scratchpad de la sesión): `apply-{1440,390,1440-dark,1440-sintoken}-{reposo,hover,foco}.png`;
datos en `apply-measure.json`.

## Desvíos

- `transition` del botón: además de lo previsto en design D2, se cambia `background-color`
  por `opacity` en la lista de transiciones, porque el hover visible pasa a ser la opacidad de
  `.btn-primary`. Sin impacto en contraste.
- Se agregan dos comentarios SCSS explicativos en `.cta-final`. Son `.scss`, así que no
  afectan la emisión de tokens: lo confirma la guarda.
- Incidente durante la prueba de mutación: el `sed` de restauración tocó por error también la
  l. 79 (`.hero-cta`). Se detectó en el diff y se revirtió en el acto: el diff final de
  `.hero-cta` está vacío.
