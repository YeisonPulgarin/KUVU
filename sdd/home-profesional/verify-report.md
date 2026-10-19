# Verify report — home-profesional

Rama: `feat/home-profesional` (HEAD `741202a`, base `a94a5f9`). Estado verificado: los 5
slices (`contenido`, `chrome`, `paginas`, `home`, `cierre`) con los ajustes A1–A3 de
`apply-progress/cierre.md`. Slices omitidos: ninguno. Extensión `git` inactiva: sin CI check.

## Veredicto: **FAIL**

Un defecto con causa única hace fallar 2 criterios: los enlaces a una sección de `/legal`
(`/legal#cookies`, índice, footer) dejan el título de la sección tapado por el header fijo
(CA-12.2 y la parte de "destino de un enlace interno" de CA-07.3). El arreglo es chico (ver
H1). Todo lo demás pasa: suite y build verdes, sin logs nuevos, contraste AA en ambos temas,
sin voseo ni marcadores.

## Suite y build

| Comando (desde `frontend/proyecto_angular`) | Resultado |
|---|---|
| `npx ng test --watch=false --browsers=ChromeHeadless` | **304 / 304 SUCCESS, 0 FAILED** |
| `npx ng build` | compila; **Initial total 421.02 kB** (presupuesto 500 kB; transfer 110.63 kB) |

Único warning del build: `css-inline-fonts` 19.14 kB vs 17 kB (preexistente). Chunks lazy
confirmados en el build: `servicios-component`, `contacto-component`, `legal-component`,
`nosotros-component`, `preguntas-frecuentes-component`, `landing-component`,
`login-component`; la 404 es `loadComponent` en `app.routes.ts` (spec de rutas lo cubre).

Cobertura por slice: cada `apply-progress` declara `tests_agregados` y el código de producción
de cada slice tiene spec. Excepciones declaradas: `index.html` y `styles.scss` (chrome) y la
config SDD (cierre); se revisan abajo por código y en runtime.

### Verificación en runtime (Chrome headless sobre `dist/`)

Para los CAs visuales se sirve el build con fallback SPA y se mide con Chrome DevTools
Protocol (script fuera del repo):

- Ancho 360 px, las 7 páginas públicas: `scrollWidth = clientWidth = 360` (sin scroll
  horizontal). Cada página con 1 solo `canonical`, title propio; la 404 con `robots=noindex`.
- Sticky: tras `scrollTo(0, 1500)` en `/legal`, el header está en `top: 0` y tiene
  `is-compact`, a 1280 y a 360 px.
- Contenido inicial: en las 7 páginas el `h1` arranca debajo del header (header bottom 81 px;
  `h1` en 185–315 px).
- Anclas de `/legal`: ver H1.
- Reduced motion emulado: entradas del menú móvil `transition 0s`, `transform: none`; flechas
  `0s`; reveal `0s`, opacidad 1. Quedan activas la transición de altura del header (0.25 s) y
  la del subrayado de la nav (0.3 s), ver H3.

## Criterios de aceptación

Total contado: **69** (el resumen de `spec.md` dice 68: la fila `/legal` suma 13, no 12).
**67 cumplidos** (4 con observación), **2 fallidos**, **0 no verificables** (la anulación de
view transitions bajo `reduce` se verifica solo por código, ver CA-16.3).

| CA | Estado | Evidencia |
|---|---|---|
| 01.1 | cumplido | `site-header.component.spec.ts` "five site pages in order…"; specs de nosotros, faq, 404, home |
| 01.2 | cumplido | mismo test ("never as anchors"); `home.component.spec.ts` "single site navigation" |
| 01.3 | cumplido (obs.) | header spec "keep Ingresar, WhatsApp and theme toggle". Obs.: en < 1024 px el menú móvil no tiene WhatsApp (igual que antes del cambio; HP-08 no lo pide) |
| 02.1 | cumplido | header spec "only Servicios as current on /servicios" |
| 02.2 | cumplido | header spec "only Inicio as current on /…" (`exact` solo para `/`) |
| 02.3 | cumplido | `site-header.component.scss` `.nav-item.is-active` (color de marca + subrayado) y `.mobile-item.is-active` |
| 03.1 | cumplido | home spec "link to every internal page" |
| 03.2 | cumplido | home spec "leave benefits by role to /servicios" + servicios spec "every benefit by role" |
| 03.3 | cumplido | home spec "Ingresar as the only primary CTA", "hero CTA to /acceder" |
| 04.1 | cumplido | `app.routes.spec.ts` "404 page for an unknown URL and stay on it"; runtime `/no-existe` queda en `/no-existe` |
| 04.2 | cumplido | not-found spec "link back to the home", "single site navigation" |
| 04.3 | cumplido | not-found spec "own title and robots noindex"; runtime title "Página no encontrada \| KUVU" |
| 04.4 | cumplido | routes spec "access flow lazily", "keep the guards" |
| 05.1 | cumplido | routes spec "public pages as lazy routes"; chunks lazy en el build |
| 06.1 | cumplido | specs de servicios, contacto, legal (breadcrumb "Inicio › …") |
| 06.2 | cumplido | page-meta spec "single script… / remove on clear"; breadcrumb spec "clear them on destroy" |
| 07.1 | cumplido | header spec "initial state at the top" |
| 07.2 | cumplido | header spec "compact past the threshold and recover"; runtime `is-compact` |
| 07.3 | **fallido** | Contenido inicial OK en las 7 páginas, pero el destino de un enlace interno a ancla queda tapado (H1) |
| 08.1 | cumplido | header spec "open: aria-expanded, body scroll locked, focus on the first link" |
| 08.2 | cumplido (obs.) | specs de Escape (foco al botón), botón y enlace. Obs.: al elegir un enlace el foco no vuelve al botón (`closeMenu(false)`, H4) |
| 08.3 | cumplido | header spec "stay closed after navigating" |
| 08.4 | cumplido | header spec "index each entry"; scss bajo `no-preference`; runtime `0s` con `reduce` |
| 09.1 | cumplido | footer spec "four legal documents to their anchors" |
| 09.2 | cumplido | footer spec "WhatsApp and the contact form" |
| 09.3 | cumplido | footer spec "no email line nor mailto", "academic project" |
| 09.4 | cumplido | footer spec "no social links nor empty #" |
| 09.5 | cumplido | runtime 360 px sin scroll horizontal; `site-footer.component.scss` grid de 1 columna en móvil |
| 10.1 | cumplido | servicios spec "every service with title, description and icon" |
| 10.2 | cumplido | servicios spec "every benefit by role" |
| 10.3 | cumplido | servicios spec "own page meta"; content spec "never repeat a title or a description" |
| 10.4 | cumplido | servicios spec "secondary Contactar link to /contacto" (`btn-secondary link-arrow`) |
| 11.1 | cumplido | contacto spec "flag every missing field", "aria-invalid and aria-describedby", "not send without the consent" |
| 11.2 | cumplido | contacto spec "reject a malformed email even if there is a phone" |
| 11.3 | cumplido | contacto spec "open WhatsApp in a new tab with the composed message"; contact-message spec |
| 11.4 | cumplido | contact-message spec "leave out empty optional fields" |
| 11.5 | cumplido | contacto spec "neither store the data in the browser nor log it"; el componente no inyecta `HttpClient` |
| 11.6 | cumplido | contacto spec "…and confirm it"; `contacto.component.html:119` `aria-live="polite"` |
| 11.7 | cumplido | contacto spec "label every field"; `<label for>` en las líneas 11–111 del template |
| 11b.1 | cumplido | contacto spec "consent unchecked" |
| 11b.2 | cumplido | contacto spec y content spec "link the consent text to the data policy" |
| 11c.1 | cumplido | contacto spec "other channels and the three numbered steps" |
| 12.1 | cumplido | legal spec "index the four documents with links to their anchors" |
| 12.2 | **fallido** | Runtime: `/legal#cookies` y `#tratamiento-datos`, entrada directa y desde el footer, a 1280 y 360 px: la sección queda en `top: 0`, el `h2` en 32–33 px y el header termina en 57–65 px → título tapado (H1) |
| 12.3 | cumplido | legal spec "show the effective date" |
| 12.4 | cumplido | legal spec "warn at the top…" |
| 13.1 | cumplido | `content/responsible.ts` fuente única; footer, `/contacto` y `/legal` leen de ahí; content spec ata `phone` a `contact.whatsappNumber` |
| 13.2 | cumplido | legal spec "not show a tax id, an address or an email, nor empty lines"; content spec "no incomplete sentence" |
| 13.3 | cumplido | legal spec y rich-text spec "no placeholder marks"; grep sin `[…]` en contenido ni templates |
| 14.1 | cumplido | content spec "thirteen minimum points"; legal spec "every block heading" |
| 14.2 | cumplido | content spec "cite the governing rules" |
| 14.3 | cumplido | content spec "…and the response terms" (10 y 15 días hábiles) |
| 15.1 | cumplido | content spec y legal spec "privacy notice to the data policy" |
| 15.2 | cumplido | content spec "exactly the browser storage the site uses"; coincide con el código (`theme.service`, `auth.service`, `empresaPreseleccionada` en `sessionStorage`) |
| 15.3 | cumplido | content spec "Colombian law as applicable" |
| 16.1 | cumplido | specs de home, servicios, nosotros, faq "correlatively from 01"; contacto 01–03 y legal `number(i)` en templates |
| 16.2 | cumplido | mismos specs ("hidden from assistive tech"), home spec "arrows… hidden" |
| 16.3 | cumplido (obs.) | Runtime con `reduce`: sin entradas, escalonados ni desplazamientos (menú, flechas, reveal, hover-lift). View transitions: `styles.scss` las anula bajo `reduce` (verificado por código; los pseudo-elementos no se pueden medir con el método usado). Obs.: H3 |
| 16.4 | cumplido | runtime 360 px en las 7 páginas: `scrollWidth = 360` |
| 17.1 | cumplido | page-meta spec "update every tag in place, without duplicates", "single canonical"; runtime 1 canonical por página |
| 17.2 | cumplido | content spec "never repeat a title or a description" |
| 17.3 | cumplido | page-meta spec "image that exists"; `public/Imagenes_web/equipo-ycw-1024.jpeg` existe |
| 18.1 | cumplido | home spec "exactly one Organization and one WebSite", "remove… when leaving" |
| 18.2 | cumplido | home spec "…as text"; page-meta spec "as text" |
| 19.1 | cumplido (obs.) | content spec "at least three contact and data questions" (son 4). Obs.: H5 |
| 19.2 | cumplido | content spec "without inventing figures" |
| 19.3 | cumplido | content spec "home subset at four questions" |
| 20.1 | cumplido | 304/304 |
| 20.2 | cumplido | build OK, 421.02 kB |

## Hallazgos

### Media

**H1 — Las anclas de `/legal` quedan bajo el header fijo (CA-12.2, CA-07.3).**
`withInMemoryScrolling({ anchorScrolling: 'enabled' })` hace scroll con
`ViewportScroller.scrollToAnchor`, que en Angular 21.2 llama a
`window.scrollTo({ top: rect.top + pageYOffset - offset[1] })`
(`node_modules/@angular/common/fesm2022/common.mjs:156-166`). `window.scrollTo` con
coordenadas explícitas **no aplica `scroll-padding-top`** (solo lo aplican `scrollIntoView` y
la navegación nativa a fragmento; comprobado en Chrome headless: `scrollTo` deja el elemento en
0, `scrollIntoView` lo deja en 88 px). Nadie llama a `ViewportScroller.setOffset`, así que el
offset es `[0, 0]` y `html { scroll-padding-top: 88px }` (`styles.scss`) no tiene efecto en
este flujo. Afecta la entrada directa a `/legal#…`, los enlaces del footer y los del índice de
`/legal`. Los tests no lo detectan porque Karma no mide layout.
Fix sugerido: fijar el offset del scroller una vez al arrancar, por ejemplo en `app.config.ts`
con `provideAppInitializer(() => inject(ViewportScroller).setOffset([0, 88]))` (o una función
que mida la altura de `app-site-header` + margen), y dejar `scroll-padding-top` para
navegación nativa. Agregar un spec que verifique que el offset queda configurado.

### Baja

**H2 — Comentarios en español en código nuevo** (guideline: comentarios en inglés):
`app.routes.ts` (3 comentarios de las rutas públicas y la 404; el archivo ya tenía comentarios
en español), `home.component.scss` ("Home como escaparate…"), doc comment de `breadcrumbFor`
en `content/site.ts`. Las clases `ServiciosComponent`/`ContactoComponent` siguen el criterio
preexistente de nombrar componentes por su ruta (`NosotrosComponent`, `PagosComponent`).

**H3 — Dos transiciones del header no se apagan con reduced motion:** `transition: height
0.25s` de `.nav-container` (cambio a compacto) y `transition: transform 0.3s` del subrayado
`.nav-item::after` (`site-header.component.scss`). No son entradas, escalonados ni
desplazamientos, así que CA-16.3 se cumple, pero RNF-03 pide "todo movimiento nuevo"
desactivado. Fix: moverlas al bloque `@media (prefers-reduced-motion: no-preference)` del
mismo archivo.

**H4 — Foco al elegir un enlace del menú móvil.** `closeMenu(false)` no devuelve el foco al
botón cuando se navega; CA-08.2 y `design.md` §"Menú móvil" dicen que el foco vuelve al botón
en todos los cierres. El comportamiento implementado es razonable (tras navegar, el foco en el
botón de menú no aporta) pero no está registrado como desvío. Sugerido: ajustar CA-08.2/design
en `document`, sin tocar código.

**H5 — FAQ "¿KUVU usa cookies?" y "¿Cómo me contacto?"** (`content/faq.ts`): la primera dice
que "solo" guarda tema y sesión, y `/legal` lista además la empresa preseleccionada; la segunda
remite al WhatsApp "desde el encabezado", que en < 1024 px no está en el header. Fix de texto:
sumar "y la empresa elegida al acceder" y decir "desde el pie de página o la página de
Contacto".

### Informativas

- El resumen de `spec.md` cuenta 68 CAs; son 69 (fila `/legal`: 13).
- Ícono de WhatsApp del header: blanco sobre `#25d366` = 1.98 : 1 (gráfico, umbral 3 : 1).
  Preexistente, fuera del alcance del cambio; el footer y `/nosotros` ya usan `#1a7a43`.
- `og:image` de `index.html` es relativa (no hay dominio de producción declarado); los crawlers
  sociales necesitan URL absoluta. Desvío ya registrado en `apply-progress/chrome.md`.
- Hover de `.origin-link`/`.faq-link` en claro usa `--color-brand-500` `#6b8e6b`: 3.42 : 1
  sobre `#f6f7f4` (solo en hover, el estado normal pasa). Preexistente.

## Contraste (WCAG 2.x)

| Elemento | Tema | Colores | Ratio | Umbral | Resultado |
|---|---|---|---|---|---|
| `.section-eyebrow` | claro | `#3e5c40` / `#f6f7f4` (home-bg) | 6.95 | 4.5 | pasa |
| `.section-eyebrow` | claro | `#3e5c40` / `#ffffff` (surface) | 7.47 | 4.5 | pasa |
| `.section-eyebrow` | claro | `#3e5c40` / `#eef1ec` (surface-alt) | 6.56 | 4.5 | pasa |
| `.section-eyebrow` | claro | `#3e5c40` / `#f0f4f8` (fondo real medido en la home: `body`) | 6.76 | 4.5 | pasa |
| `.section-eyebrow` | oscuro | `#8fb28f` / `#141a14` (home-bg) | 7.52 | 4.5 | pasa |
| `.section-eyebrow` | oscuro | `#8fb28f` / `#1b231b` (surface, medido en runtime) | 6.86 | 4.5 | pasa |
| `.section-eyebrow` | oscuro | `#8fb28f` / `#222c22` (surface-alt) | 6.15 | 4.5 | pasa |
| `.link-arrow` | claro / oscuro | mismo token que el eyebrow | 6.56–7.52 | 4.5 | pasa |
| `.cta-secondary` (CTA final) | ambos | `#ffffff` / `#2f4a2f` | 9.81 | 4.5 | pasa |
| Botón WhatsApp footer y `/nosotros` | ambos | `#ffffff` / `#1a7a43` | 5.37 | 4.5 | pasa |
| Aviso de `/legal` | claro | `#5c3b00` / `#fff4d6` | 9.21 | 4.5 | pasa |
| Aviso de `/legal` | oscuro | `#fde7b0` / `#3a2a0c` | 11.36 | 4.5 | pasa |

Ningún eyebrow está sobre la banda verde (`--color-brand-700`): el CTA final no lleva eyebrow
y su enlace secundario usa blanco.

## Logs

- `git diff a94a5f9..HEAD` no agrega `console.*` ni logger en `frontend/`.
- `/contacto` no registra ni guarda los datos: spec "neither store the data in the browser nor
  log it" (espía `console` y verifica `localStorage`/`sessionStorage` vacíos); el componente
  solo arma el enlace `wa.me` y llama a `window.open`.
- `logs_conforme: sí` en los 5 `apply-progress`: consistente.

## Guidelines

| Regla | Resultado |
|---|---|
| Identificadores en inglés | cumple (salvo nombres de componente por ruta, criterio preexistente) |
| Comentarios en inglés | desvío menor, H2 |
| Textos visibles en `content/*.ts` (RNF-14) | cumple: páginas nuevas leen de `content/contact.ts`, `legal.ts`, `pages.ts`, `site.ts`, `faq.ts`; en templates quedan etiquetas cortas de UI (encabezados de sección, "Volver al inicio", textos de botón), mismo criterio que la home previa |
| Rutas lazy (RNF-04) | cumple: `servicios`, `contacto`, `legal`, `**`, más `acceder` y `login` |
| Reduced motion (RNF-03) | cumple en menú, flechas, hover-lift, reveal y view transitions; H3 para dos transiciones del header |
| Dependencias nuevas | ninguna: `package.json` y `package-lock.json` sin cambios |
| Estructura | páginas en `components/pages/*`, piezas compartidas en `components/public/*`, contenido en `content/` |

## Texto del sitio público

- Voseo: grep de formas voseantes (imperativos y presentes acentuados, enclíticos, "vos") sobre
  `content/`, `components/home`, `components/pages`, `components/public` e `index.html`: sin
  resultados. Las palabras con tilde final encontradas son todas tuteo o neutras ("está",
  "más", "así", "Bogotá"…). Test de regresión en `content.spec.ts` ("Colombian tuteo, never
  voseo").
- Marcadores `[...]`: ninguno en contenido ni templates.
- NIT, dirección y correo: no existen en `responsible.ts` (campos opcionales sin definir); la
  frase "identificado con NIT" es un `prefix` que solo se renderiza si hay NIT, y no hay
  ningún `mailto:` ni dominio de correo en el sitio público.

## Alcance de documentación (declarado en `tasks.md`)

| Destino | Declarado | Coincide con el cambio |
|---|---|---|
| `CHANGELOG.md` | sí | sí (páginas, navegación, legales, 404 visibles) |
| `docs/architecture.md` | sí, con detalle de qué actualizar | sí |
| `README.md` | "sí, si lista las rutas del sitio público" (a verificar en `document`) | correcto |
| OpenAPI / Bruno | no | correcto (sin endpoints) |
| `DEVELOPMENT_GUIDELINES.md` | no | correcto |
| Documento del cambio | `docs/home-profesional.md` | — |

`document` todavía no corrió: que los documentos no estén actualizados no es una falla de esta
fase. Para `document`: registrar H4 (foco en el menú) y el breakpoint de 1024 px del menú
móvil.
