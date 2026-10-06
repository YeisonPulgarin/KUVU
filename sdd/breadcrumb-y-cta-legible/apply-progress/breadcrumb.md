# Apply progress — slice `breadcrumb` (T3 a T9)

```
test_mode: test-after
test_command: $env:CHROME_BIN='C:\Program Files\Google\Chrome\Application\chrome.exe'; npx ng test --watch=false --browsers=ChromeHeadless   (desde frontend/proyecto_angular)
tests_status: verde (178 / 178; al cerrar el slice cta-banda: 161 / 161)
tests_agregados:
  - frontend/proyecto_angular/src/app/components/public/breadcrumb/breadcrumb.component.spec.ts (nuevo: 5 tests del componente + 2 de breadcrumbFor)
  - frontend/proyecto_angular/src/app/services/page-meta.service.spec.ts (describe 'breadcrumb JSON-LD', 4 tests)
  - frontend/proyecto_angular/src/app/components/pages/nosotros/nosotros.component.spec.ts (describe 'breadcrumb', 3 tests)
  - frontend/proyecto_angular/src/app/components/pages/preguntas-frecuentes/preguntas-frecuentes.component.spec.ts (describe 'breadcrumb', 3 tests)
excepciones_sin_test: ninguna. Contraste y overflow a 360 px se verifican en navegador (abajo)
logs_conforme: sí (sin logs: componente presentacional y servicio de metadatos del cliente)
```

No había `apply-progress/breadcrumb.md` previo: el slice arrancó desde cero.

## Estado de tareas

| # | Estado | Detalle |
|---|---|---|
| T3 | completa | `breadcrumbFor(href)` en `content/site.ts`: `[Inicio, página]` desde `pageNavLinks`; lanza error si `href` no es una página interna (también para `/`) |
| T4 | completa | `PageMetaService.setBreadcrumb(items)` / `clearBreadcrumb()`: `inject(DOCUMENT)`, script único `#kuvu-breadcrumb-jsonld` en `<head>`, `item = document.location.origin + href`, `JSON.stringify` asignado a `textContent`. `setPage` sin cambios |
| T5 | completa | `BreadcrumbComponent` (`app-breadcrumb`, standalone, OnPush, `input.required<readonly NavItem[]>()`), template inline con `@for`: `nav[aria-label="Ruta de navegación"] > ol > li`, separador `span[aria-hidden]`, último ítem `span[aria-current="page"]`, resto `a[routerLink]`. `ngOnInit` publica y `ngOnDestroy` limpia el JSON-LD. SCSS con `@reference`, `flex-wrap`, centrado, 0.875rem, colores con fallback literal |
| T6 | completa | spec del componente y de `breadcrumbFor` |
| T7 | completa | `/nosotros`: imports, `readonly breadcrumb = breadcrumbFor('/nosotros')`, `<app-breadcrumb>` antes del `h1`, `describe` al final de la spec |
| T8 | completa | `/preguntas-frecuentes`: mismo patrón |
| T9 | completa | suite, build, guarda de tokens, diff compartido y archivos intactos (abajo) |

## Archivos tocados en este slice

| Archivo | Cambio |
|---|---|
| `src/app/content/site.ts` | + `breadcrumbFor` (+14 −1; el −1 es el salto de línea final agregado) |
| `src/app/services/page-meta.service.ts` | + `setBreadcrumb`, `clearBreadcrumb`, `DOCUMENT` |
| `src/app/services/page-meta.service.spec.ts` | + `describe('breadcrumb JSON-LD')` |
| `src/app/components/public/breadcrumb/breadcrumb.component.{ts,scss,spec.ts}` | nuevos (47 + 41 + 82 líneas) |
| `src/app/components/pages/nosotros/nosotros.component.{ts,html,spec.ts}` | integración (ver hunks) |
| `src/app/components/pages/preguntas-frecuentes/preguntas-frecuentes.component.{ts,html,spec.ts}` | integración (+4 −1, +1, +27) |

## Working tree compartido (D-1) — `git diff HEAD -U0` resultante

| Archivo | Hunks de **este cambio** (lado nuevo) | Hunks de `home-imagen-equipo` (sin cambios respecto de la línea base) |
|---|---|---|
| `nosotros.component.ts` | `+5,2` (imports de `BreadcrumbComponent` y `breadcrumbFor`), `+20` (`BreadcrumbComponent` en `imports`), `+31` (`readonly breadcrumb`) | `+9`, `+11`, `+23,2`, `+36` |
| `nosotros.component.html` | `+8` (`<app-breadcrumb>`) | `+26,14` |
| `nosotros.component.spec.ts` | `+119,27` (`describe('breadcrumb')`) | `+69,27` |
| `home.component.spec.ts` | `+318,40` (slice `cta-banda`) | `+225,2`, `+229,49` |

Todos los hunks quedan separados por al menos una línea sin cambios, así que `git add -p`
los separa con `y`/`n`, sin editar. `nosotros.component.scss` (+25) es enteramente de
`home-imagen-equipo`: este cambio no lo toca.

## Verificaciones (T9)

- **Suite:** 178 / 178.
- **Build:** `npx ng build` OK. Único warning `css-inline-fonts` (19.14 kB > 17 kB), que ya
  existía.
- **Guarda de tokens:** los `--color-*` emitidos en `dist/proyecto-dss/browser/styles-*.css`
  son idénticos a los de antes del cambio. Ningún `.ts`/`.html` nuevo o editado contiene
  nombres de tokens (los fallbacks están solo en el `.scss`).
- **Archivos que no deben cambiar:** `git diff HEAD` vacío en `styles.css`, `styles.scss`,
  `shared.styles.scss` y `site-header/`; ningún hunk de `home.component.scss` toca `.hero-cta`.

## Verificación en navegador (build actual, Chrome headless vía CDP)

`/nosotros` y `/preguntas-frecuentes`, en 1440 y 360, en claro y oscuro (8 casos):

| Chequeo | Resultado |
|---|---|
| Breadcrumb visible dentro de `.page-hero`, antes del `h1` | sí en los 8 casos ("Inicio › Nosotros" / "Inicio › Preguntas frecuentes"; capturas `bc-*.png`) |
| Scripts `application/ld+json` | exactamente 1 en cada caso |
| JSON-LD | `BreadcrumbList`, `position` 1-2, `name` igual a la etiqueta, `item` absoluto sobre el origen (`http://127.0.0.1:4319/`, `…/nosotros`, `…/preguntas-frecuentes`) |
| Navegación SPA: click en "Inicio" desde `/nosotros` | llega a `/` sin recarga (1 sola entrada de navegación); scripts JSON-LD: 1 → 0 |
| Scroll horizontal a 360 px | no: `scrollWidth` 360 = `innerWidth` 360. En 1440, 1435 < 1440 (la diferencia es la barra de scroll) |

Contraste (colores computados y fondo efectivo):

| Tema | Fondo efectivo | Enlace "Inicio" / página actual | Separador | Foco (contorno global) |
|---|---|---|---|---|
| Claro | `#f0f4f8` | `#1f2920`, 13.61 : 1 | `#4c5a4e`, 6.60 : 1 | `#6b8e6b`, 3.33 : 1 |
| Oscuro | `#1b231b` | `#eef0ec`, 14.05 : 1 | `#a8b2a8`, 7.37 : 1 | `#7fa17f`, 5.61 : 1 |

Datos en `bc-measure.json` (scratchpad de la sesión). Nota: el campo `text` de ese JSON
aparece deformado ("No otro") por un error de escape en el script de medición: reemplazaba la
letra `s` en lugar de espacios. El texto real lo confirman los tests unitarios y las capturas.

## Desvíos

- **Separador con espacios (`" › "`).** Angular descarta los nodos de texto que son solo
  espacios entre elementos, y sin esto el `textContent` del breadcrumb quedaba
  "Inicio›Nosotros" (copiar/pegar, lectura de texto plano). Los tests de las páginas fallaron
  por eso; se corrigió la implementación. Visualmente no cambia nada: el separador es un ítem
  flex, así que esos espacios no ocupan lugar y la separación la da `gap`. Se ajustó la
  aserción del separador a `textContent.trim()`.
- **Error en `breadcrumbFor` también para `/`**: además de un href desconocido, pedir la
  propia home lanza error, porque "Inicio › Inicio" no es una ruta válida. Está cubierto por
  test.
- **`DOCUMENT` se importa de `@angular/common`.** Compila sin warnings en Angular 21.
  Angular también lo exporta desde `@angular/core`; `refine` puede unificarlo si se prefiere.
- Los contrastes del foco de la tabla son cálculos sobre el color del contorno global
  (`:focus-visible` de `styles.css`) y el fondo efectivo medido, no una captura con foco.
