# Design — breadcrumb-y-cta-legible

Referencias: `propose.md` (alcance, D-1 a D-3) y `spec.md` (RF-1 a RF-5, CA-1 a CA-12). Este
documento no repite los requisitos. Extensión `validate`: no activa.

## Vista general

| Pieza | Archivo | Tipo de cambio |
|---|---|---|
| Banda `cta-final` y su botón | `components/home/home.component.scss` (bloque `.cta-final`) | edición local |
| Tests de la banda | `components/home/home.component.spec.ts` | `describe` nuevo |
| Breadcrumb | `components/public/breadcrumb/breadcrumb.component.{ts,scss,spec.ts}` | nuevo, template inline |
| Ítems del breadcrumb | `content/site.ts` (`breadcrumbFor`) | función nueva |
| JSON-LD | `services/page-meta.service.ts` (+ spec) | dos métodos nuevos |
| Páginas | `pages/nosotros/*`, `pages/preguntas-frecuentes/*` (`.ts`, `.html`, `.spec.ts`) | una línea de template, un campo, un import y tests |

No cambian `styles.css`, `styles.scss`, `shared.styles.scss` (`.btn-primary`), `site-header/`
ni el bloque `.hero-cta`.

## D1 — Fondo de la banda: fallback local (RF-1)

`.cta-final { background-color: var(--color-brand-700, #2f4a2f); }`

Es el mismo patrón que `team-band` (`--team-band-green`). El color sale del `@theme` y el
fallback solo actúa cuando Tailwind no emite el token.

- Descartado: `@theme static` o mover tokens a `:root`. Es el arreglo de raíz, pero cambia
  toda la home en modo claro (fondo, hovers, radios) y es no-objetivo de `propose`.
- Descartado: escribir `#2f4a2f` a secas, porque desconecta la banda del token de marca.

## D2 — Botón "Ingresar" de la banda: azul con texto blanco (RF-1b, D-3)

El enlace conserva `class="btn-primary cta-button"`, así que el gradiente sale de
`.btn-primary`, igual que en hero y header. En `.cta-final .cta-button`:

- `color: #fff`, en lugar de `var(--color-brand-700)`.
- Se eliminan `background-color: #fff` y el `background-color: var(--color-brand-100)` del
  hover. Quedan debajo del gradiente, no aportan nada visible y el segundo usa un token
  inexistente en modo claro. El hover queda con el de `.btn-primary` (opacidad 0.92 y sombra)
  más el `translateY(-2px)` local, que se mantiene.
- `&:focus-visible { outline: 2px solid #fff; outline-offset: 3px; }`. El contorno global
  `--color-brand-500` da 2.66 : 1 sobre la banda; el blanco da 9.81 : 1. El offset deja el
  contorno sobre la banda verde, no sobre el azul del botón.
- Forma pill, padding y tamaño locales (`rounded-pill px-10 py-4 text-base font-bold`) se
  mantienen.

Mediciones con la fórmula WCAG, sobre un muestreo del gradiente cada 5 %:

| Estado | Mínimo | Dónde |
|---|---|---|
| Reposo, blanco sobre `#2b4c8c → #3a6fd8` | 4.72 : 1 | extremo `#3a6fd8` (margen de 0.22 sobre 4.5) |
| Hover (opacidad 0.92 sobre `#2f4a2f`) | 5.03 : 1 | extremo claro mezclado con la banda |
| Foco, blanco sobre la banda | 9.81 : 1 | — |

El margen en reposo depende de `--color-secundario` (`#3A6FD8`, en `:root`). Si ese token se
aclara, el botón deja de cumplir. Queda anotado en `docs/architecture.md` (fase `document`).

- Descartado: quitar `btn-primary` del enlace y copiar el gradiente localmente, porque duplica
  el estilo de los botones primarios y diverge del hero y el header.

## D3 — Breadcrumb: componente presentacional que también publica el JSON-LD (RF-2 a RF-4)

`BreadcrumbComponent` (`app-breadcrumb`, standalone, `components/public/breadcrumb/`):

- Input requerido `items: readonly NavItem[]`. Reutiliza `NavItem { label, href }` de
  `content/types.ts`, sin tipo nuevo. El último ítem es la página actual.
- Template inline, como `team-band`:
  `<nav aria-label="Ruta de navegación"><ol>`, un `<li>` por ítem. Los no finales llevan
  `<a [routerLink]="href">` y los finales `<span aria-current="page">`. El separador va como
  `<span aria-hidden="true">›</span>`, dentro del `<li>` y antes de cada ítem salvo el primero.
- Ciclo de vida: en `ngOnInit` llama a `PageMetaService.setBreadcrumb(items)` y en
  `ngOnDestroy` a `clearBreadcrumb()`.

Por qué el componente publica el JSON-LD: visual y estructurado salen del mismo `items` en el
mismo lugar, así que no pueden divergir (RF-4), y la limpieza queda atada a la vida de la
página sin que cada página implemente `OnDestroy`. También minimiza las líneas nuevas en
archivos compartidos con `home-imagen-equipo` (D-1).

- Descartado: breadcrumb derivado del router (`data.breadcrumb` + `ActivatedRoute`). Hay dos
  páginas de un nivel, así que es abstracción sin uso (no-objetivo).
- Descartado: que cada página llame al servicio. Duplica la llamada y la limpieza, y abre la
  puerta a que visual y JSON-LD diverjan.

### Fuente de los ítems

`content/site.ts` exporta `breadcrumbFor(href: string): readonly NavItem[]`, que devuelve
`[Inicio, página]` tomando ambos de `pageNavLinks`. Si `href` no está en `pageNavLinks`, lanza
error: es un error de programación y lo detectan los tests de las páginas. Cada página declara
`readonly breadcrumb = breadcrumbFor('/nosotros')` (o `'/preguntas-frecuentes'`).

### Estilos

`breadcrumb.component.scss` con `@reference "../../../../styles.css"`, como el resto del
clúster público:

- Lista en fila con `flex-wrap` y `gap` chico, centrada. `.page-hero` es `text-center`.
  `margin-bottom` antes del `h1`. Texto `0.875rem`.
- Colores con fallback, porque `--color-home-*` no existe en modo claro:
  - texto y separador: `var(--color-home-muted, #4c5a4e)`;
  - enlace: `var(--color-home-text, #1f2920)` con subrayado en hover;
  - página actual: `var(--color-home-text, #1f2920)`, `font-weight: 600`.
- Contrastes calculados: en claro, sobre el fondo real del hero (`#f0f4f8`, porque
  `--color-home-surface` tampoco existe), `#4c5a4e` da 6.60 : 1 y `#1f2920` 13.61 : 1. En
  oscuro, sobre `#1b231b`, `#a8b2a8` da 7.37 : 1 y `#eef0ec` 14.05 : 1. `verify` lo mide en
  navegador (CA-9).
- El foco usa el `:focus-visible` global (`--color-brand-500`): 3.33 : 1 en claro y
  5.61 : 1 en oscuro, ambos ≥ 3 : 1.
- `flex-wrap` evita el scroll horizontal a 360 px.

## D4 — JSON-LD en `PageMetaService` (RF-4, D-2)

Métodos nuevos:

- `setBreadcrumb(items: readonly NavItem[]): void` arma el objeto
  `{ "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [...] }`,
  con `ListItem` `{ position: i + 1, name: label, item: origin + href }`. Busca un `<script>`
  existente con id `kuvu-breadcrumb-jsonld` en `<head>`: si existe, reemplaza su `textContent`;
  si no, lo crea con `type="application/ld+json"`. Esto garantiza un único bloque (CA-6).
- `clearBreadcrumb(): void` elimina ese `<script>` si existe (CA-7).

Detalles:

- Se usa `inject(DOCUMENT)` en lugar de `document` global. El origen se lee de
  `this.document.location.origin` (D-2), y los tests verifican la URL contra
  `document.location.origin` del runner.
- El contenido va por `JSON.stringify` asignado a `textContent`, nunca como HTML, así que no
  hay vía de inyección. Las etiquetas igual son estáticas.
- `setPage` no cambia (RF-5).
- Descartado: un servicio nuevo `StructuredDataService`. `PageMetaService` ya es el punto
  donde cada página declara sus metadatos, y una sola responsabilidad más no justifica otro
  servicio.

## D5 — Tests (`test-after`)

| Spec | Qué cubre | CA |
|---|---|---|
| `home.component.spec.ts` | Con `--color-brand-700` anulado en el host del test, `.cta-final` computa `rgb(47, 74, 47)`. El botón computa `color: rgb(255, 255, 255)` y `background-image` con gradiente. La home no tiene `app-breadcrumb` ni el script JSON-LD | CA-1, CA-2b, CA-8 |
| `breadcrumb.component.spec.ts` | Estructura `nav`/`ol`/`li`, `aria-label`, enlace "Inicio" a `/`, último ítem sin enlace con `aria-current`, separador `aria-hidden`, llamada a `setBreadcrumb` al iniciar y a `clearBreadcrumb` al destruir | CA-4, CA-5, CA-7 |
| `page-meta.service.spec.ts` | Forma del JSON (`@type`, `position`, `name`, `item` absoluto), un solo script tras dos llamadas, eliminación con `clear` | CA-6, CA-7 |
| `nosotros` / `preguntas-frecuentes` spec | El breadcrumb renderiza el texto correcto dentro de `.page-hero` antes del `h1`, y existe un `BreadcrumbList` con dos ítems | CA-3, CA-6 |
| `breadcrumbFor` | Pares correctos y error ante un href desconocido. Va en `breadcrumb.component.spec.ts`, para no sumar diff a `content.spec.ts`, que comparte cambios con `home-imagen-equipo` | — |

Para anular el token en CA-1 se fija `--color-brand-700: initial` en un estilo del test. Así
`var()` toma el fallback independientemente de lo que emita Tailwind en el bundle de Karma.

## D6 — Convivencia con `home-imagen-equipo` (D-1)

Los archivos con cambios previos sin commitear que este cambio toca son
`home.component.spec.ts`, `nosotros.component.ts`, `nosotros.component.html` y
`nosotros.component.spec.ts`. Las adiciones de este cambio se agrupan en bloques contiguos y
reconocibles, para que `git add -p` las separe sin mezclar hunks:

- un `describe('breadcrumb y cta legible …')` propio en cada spec;
- una línea `<app-breadcrumb>` en el HTML;
- un import y un campo en el `.ts`.

`tasks` fija la línea base (`git diff HEAD` actual por archivo) y `apply-progress` registra
las líneas exactas agregadas. `home.component.scss` no tiene cambios previos de
`home-imagen-equipo` (lo confirma su `verify-report`), así que no tiene ese riesgo.

## Documentación (alcance declarado para `document`)

- `docs/breadcrumb-y-cta-legible.md`: documento del cambio.
- `docs/architecture.md`: breadcrumb y JSON-LD en el clúster público, el patrón de fallback
  `var(--token, valor)` para tokens de Tailwind v4 que pueden no emitirse, y la dependencia
  del contraste del botón de `cta-final` con `--color-secundario`.
- `CHANGELOG.md`: sí, el cambio es visible. `README.md`: no (no cambia cómo se usa ni cómo se
  corre). OpenAPI/Bruno: no aplica. `DEVELOPMENT_GUIDELINES.md`: sin cambios.
