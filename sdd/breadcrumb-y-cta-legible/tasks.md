# Tasks — breadcrumb-y-cta-legible

Fuentes: `spec.md`, `design.md` (D1 a D6), `propose.md` (D-1 a D-3). Modalidad `test-after`:
cada tarea cierra con sus tests en verde. Rutas relativas a `frontend/proyecto_angular/src/app/`.

## Línea base del working tree compartido (D-1 / design D6)

`git diff HEAD -U0` actual de los archivos que comparte con `home-imagen-equipo`. Esos hunks
**no** son de este cambio:

| Archivo | numstat previo | Hunks previos (lado nuevo) |
|---|---|---|
| `components/home/home.component.spec.ts` (317 l.) | +51 −5 | `@@ +225,2`, `@@ +229,49` |
| `components/pages/nosotros/nosotros.component.ts` (40 l.) | +5 −2 | `+7` (import `ResponsiveImageComponent`), `+9` (import de `content`), `+20,2` (array `imports`), `+32` (`readonly team`) |
| `components/pages/nosotros/nosotros.component.html` (67 l.) | +14 | `+25,14` (sección equipo) |
| `components/pages/nosotros/nosotros.component.spec.ts` (118 l.) | +27 | `+69,27` |

Reglas de ubicación, para que cada adición de este cambio quede en un hunk separado, con al
menos una línea sin cambios de distancia de los hunks previos:

- `nosotros.component.ts`: el import de `BreadcrumbComponent` va inmediatamente después del
  import de `SiteHeaderComponent` (l. 4). `breadcrumbFor` se agrega a ese mismo bloque como
  línea propia: `import { breadcrumbFor } from '../../../content/site';`. No se edita la
  l. 10, que es contigua al hunk previo de la l. 9. En el array `imports`,
  `BreadcrumbComponent` va después de `RouterModule`. El campo `readonly breadcrumb` va
  inmediatamente después de `readonly pageMeta` (l. 27).
- `nosotros.component.html`: `<app-breadcrumb>` dentro de `.page-hero`, antes del `h1` (l. 8).
- Specs (`home`, `nosotros`): `describe` nuevo **al final del archivo**, después de los
  hunks previos.

Al cerrar el slice, `apply-progress` registra el `git diff HEAD -U0` resultante de esos cuatro
archivos y marca qué hunks son de este cambio.

## Guarda de tokens Tailwind

Tailwind v4 emite variables de `@theme` según los nombres que encuentra al escanear archivos.
Ningún archivo nuevo o editado `.ts`/`.html` de este cambio menciona nombres de tokens
`--color-*` / `--radius-*` en comentarios ni strings. En el test de CA-1 el nombre del token
se arma por concatenación (por ejemplo `'--color-' + 'brand-700'`) para no alterar la emisión.
Verificación: la lista de `--color-*` emitidos en `dist/**/styles-*.css` es idéntica antes y
después del cambio (hoy: `brand-700`, `brand-500`, más los overrides de `.dark`).

## Tareas

| # | Tarea | Archivos | Depende de | CA |
|---|---|---|---|---|
| T1 | Banda: `background-color: var(--color-brand-700, #2f4a2f)` en `.cta-final`. En `.cta-button`: `color: #fff`, quitar `background-color: #fff` y el `background-color` del hover, agregar `&:focus-visible { outline: 2px solid #fff; outline-offset: 3px; }` | `components/home/home.component.scss` | — | CA-1, CA-2, CA-2b, CA-2c |
| T2 | Test de la banda: `describe` nuevo al final. Con el token anulado (`initial`), `.cta-final` computa `rgb(47, 74, 47)`; el botón computa texto `rgb(255, 255, 255)` y `background-image` con `linear-gradient`; la home no tiene ninguna región `nav[aria-label="Ruta de navegación"]` ni scripts `application/ld+json` (aserción sobre el DOM, sin importar el componente ni el servicio del slice 2) | `components/home/home.component.spec.ts` | T1 | CA-1, CA-2b, CA-8 |
| T3 | `breadcrumbFor(href)` en `content/site.ts`: devuelve `[Inicio, página]` desde `pageNavLinks` y lanza error si `href` no existe | `content/site.ts` | — | CA-3 |
| T4 | `PageMetaService.setBreadcrumb(items)` y `clearBreadcrumb()` con `inject(DOCUMENT)`, script único `#kuvu-breadcrumb-jsonld`, `item` = `document.location.origin + href`. Tests: forma del JSON, un solo script tras dos llamadas, eliminación | `services/page-meta.service.ts`, `services/page-meta.service.spec.ts` | — | CA-6, CA-7 |
| T5 | `BreadcrumbComponent` (`components/public/breadcrumb/`): input requerido `items`, template inline (`nav[aria-label="Ruta de navegación"] > ol > li`, separador `›` con `aria-hidden`, último ítem `span[aria-current="page"]`, resto `a[routerLink]`). `ngOnInit` llama a `setBreadcrumb` y `ngOnDestroy` a `clearBreadcrumb`. SCSS con `@reference`, `flex-wrap`, centrado, `0.875rem`, colores con fallback (`--color-home-muted, #4c5a4e` / `--color-home-text, #1f2920`) | `breadcrumb.component.ts`, `breadcrumb.component.scss` | T3, T4 | CA-4, CA-5, CA-9 |
| T6 | Tests del componente y de `breadcrumbFor` | `components/public/breadcrumb/breadcrumb.component.spec.ts` | T5 | CA-4, CA-5, CA-7 |
| T7 | Integración en `/nosotros`: import, `readonly breadcrumb = breadcrumbFor('/nosotros')`, `<app-breadcrumb [items]="breadcrumb">` arriba del `h1`, respetando las reglas de ubicación. Test (`describe` al final): texto "Inicio › Nosotros" dentro de `.page-hero` antes del `h1`, y `BreadcrumbList` con 2 ítems | `pages/nosotros/nosotros.component.{ts,html,spec.ts}` | T5 | CA-3, CA-6 |
| T8 | Integración en `/preguntas-frecuentes` (mismo patrón, sin restricciones D-1) | `pages/preguntas-frecuentes/preguntas-frecuentes.component.{ts,html,spec.ts}` | T5 | CA-3, CA-6 |
| T9 | Cierre del slice: suite completa y `ng build` con los comandos de `sdd.config.md`; chequeo de la guarda de tokens; diff de los 4 archivos compartidos registrado en `apply-progress`; `git diff` vacío en `styles.css`, `styles.scss`, `shared.styles.scss`, `site-header/` y el bloque `.hero-cta` | — | T1-T8 | CA-10, CA-11, CA-12 |

CA-2, CA-2c y CA-9 (mediciones en navegador) los cubre `verify` con el script CDP de explore.

## Slices (Gate C) — decisión del usuario

Dos slices propios de este cambio, en este orden. Reemplazan el mapeo a los slices genéricos de
`sdd.config.md` (`chrome`, `paginas`, `home-expandida`), que son del cambio `sitio-contenido`:

| Orden | Slice | Tareas | Independencia |
|---|---|---|---|
| 1 | `cta-banda` | T1, T2 | No depende del breadcrumb: T2 verifica CA-8 sobre el DOM (sin región de navegación "Ruta de navegación" ni JSON-LD), sin importar código del slice 2. La aserción es trivialmente verdadera en el slice 1 y sigue protegiendo la home en el slice 2 |
| 2 | `breadcrumb` | T3 a T9 | T9 cierra el cambio completo (suite, build, guarda de tokens, diff compartido) |

Cada slice cierra con suite y build en verde y su propio `apply-progress/{slice}.md`. La
entrega queda partida en dos PRs/commits posibles, uno por slice.

## Forecast de riesgo

| Archivo | Líneas estimadas |
|---|---|
| `home.component.scss` | ~8 |
| `home.component.spec.ts` | ~40 |
| `content/site.ts` | ~12 |
| `page-meta.service.ts` + spec | ~35 + ~50 |
| `breadcrumb.component.ts` + `.scss` + spec | ~45 + ~45 + ~110 |
| `nosotros.component.{ts,html,spec.ts}` | ~4 + 1 + ~22 |
| `preguntas-frecuentes.component.{ts,html,spec.ts}` | ~4 + 1 + ~22 |
| **Código + tests** | **~400 líneas, 14 archivos** (3 nuevos) |
| Docs (`docs/breadcrumb-y-cta-legible.md`, `architecture.md`, `CHANGELOG.md`) | ~90 líneas, 3 archivos |

- Umbral de `sdd.config.md`: 300 líneas → **riesgo ALTO por volumen** (~400 código + tests,
  ~490 con docs). El código de producción solo es ~155 líneas; el exceso viene de los tests
  obligatorios.
- Repos: 1. Complejidad baja (sin backend, sin rutas nuevas, sin dependencias nuevas).
- Riesgo cualitativo adicional: working tree compartido con `home-imagen-equipo` (D-1),
  mitigado por las reglas de ubicación.
- Estrategia de entrega configurada: `ask-on-risk` → el orquestador consulta al usuario.
  Partición natural si se quiere: PR 1 = banda (T1-T2, ~50 líneas), PR 2 = breadcrumb (T3-T9).

## Alcance previsto de `document`

| Clave | Valor | Motivo |
|---|---|---|
| `openapi_afectado` | no | sin endpoints HTTP |
| `changelog_afectado` | sí | breadcrumb y legibilidad de la banda son visibles |
| `readme_afectado` | no | no cambia uso ni comandos |
| `architecture_afectado` | sí | breadcrumb y JSON-LD en el clúster público; patrón de fallback de tokens; dependencia del contraste del botón con `--color-secundario` |
| `guidelines_afectado` | no | sin convención nueva de código |
| Documento del cambio | sí | `docs/breadcrumb-y-cta-legible.md` |
