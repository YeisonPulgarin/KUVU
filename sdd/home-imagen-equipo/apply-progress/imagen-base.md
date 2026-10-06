# Apply progress — imagen-base

Slice 1 de 2 (`imagen-base`, tareas T1 a T5). No existía un `apply-progress` previo para este
slice. Sin commits, porque la extensión `git` no está activa y el usuario no los pidió.

## Estado de tareas

| # | Estado | Detalle |
|---|---|---|
| T1 | completa | `frontend/proyecto_angular/scripts/generate-image-variants.py`: Pillow, anchos 640/1024/1536 (solo los ≤ original), WebP q80 `method=6`, JPEG progresivo q82, flag `--keep-original-as-max` |
| T2 | completa | Variantes `equipo-ycw-{640,1024,1536}.{webp,jpeg}` en `public/Imagenes_web/`. Aspecto 1.499 a 1.5. `equipo-ycw-1536.jpeg` es una copia byte a byte del original (verificado con `cmp`). `Equipo YCW.jpeg` eliminado. Pesos: WebP 21 / 38 / 63 KB, JPEG 39 / 79 / 236 KB |
| T3 | completa | `SiteImage` y `TeamSection` en `src/app/content/types.ts` |
| T4 | completa | `src/app/content/team.ts` + export en `index.ts` + 6 tests en `content.spec.ts` |
| T5 | completa | `src/app/components/public/responsive-image/` (ts con template inline, scss, spec con 10 tests). Inputs con signals (`input`, `computed`), `OnPush` |

## Desvíos del plan

- **Template inline** en `responsive-image.component.ts`, en lugar de un `.html` separado (tasks lo dejaba abierto). Son 3 archivos en lugar de 4.
- **`object-position` configurable** con la custom property `--responsive-image-position` (default `center`). Así la banda de `imagen-ui` puede fijar `center 35%` (design D4) sin un input extra.
- **Lead de la banda**: el copy es "Somos YCW Systems: tres estudiantes que convirtieron una idea de biblioteca en una plataforma para inmobiliarias." Es coherente con `origin.ts`; el design no fijaba el texto.
- **Tamaño del slice**: unas 300 líneas (239 en archivos nuevos + 62 en modificados), frente a las ~240 estimadas, porque el spec del componente salió más extenso. Se mantiene en torno al umbral de 300.
- **Safety net**: la suite no se corrió antes de modificar `types.ts`, `index.ts` y `content.spec.ts`. Los cambios son aditivos y la corrida final completa está en verde.

## Bloque para verify / document

```
test_mode: test-after
test_command: $env:CHROME_BIN='C:\Program Files\Google\Chrome\Application\chrome.exe'; npx ng test --watch=false --browsers=ChromeHeadless  (desde frontend/proyecto_angular)
tests_status: verde (144 de 144 SUCCESS)
tests_agregados:
  - frontend/proyecto_angular/src/app/content/content.spec.ts (describe 'team', 6 tests)
  - frontend/proyecto_angular/src/app/components/public/responsive-image/responsive-image.component.spec.ts (10 tests, nuevo)
excepciones_sin_test:
  - T1 scripts/generate-image-variants.py: herramienta de desarrollo fuera de la suite de Angular. Se verifica por su salida (T2: anchos, aspecto 3:2, copia byte a byte del original), según design.md
logs_conforme: sí (no se agregan logs: UI estática y script de desarrollo, según design D9)
```

## Verificaciones adicionales

- `grep "Equipo YCW|Equipo%20YCW" src/` → sin resultados (CA-2).

## Pendiente para `imagen-ui`

T6 (banda `#equipo` en la home), T7 (`/nosotros`), T8 (suite completa + `ng build`).
