# Verify report — home-profesional

Rama: `feat/home-profesional` (HEAD `80d86a1`, base `a94a5f9`). Estado verificado: los 5
slices (`contenido`, `chrome`, `paginas`, `home`, `cierre`) con los ajustes A1–A4 de
`apply-progress/cierre.md`. A4 corrige los hallazgos H1–H5 del verify anterior (FAIL). Slices
omitidos: ninguno. No hay `secure-report` ni `refine-report`. Extensión `git` inactiva: sin CI
check.

## Veredicto: **PASS con observaciones**

Los 69 criterios de aceptación se cumplen. H1 (anclas de `/legal` tapadas por el header) está
resuelto y medido en runtime en las 12 combinaciones pedidas. H2, H3, H4 y H5 están resueltos;
el ícono de WhatsApp del header usa `#1a7a43`. Las observaciones que quedan son informativas o
de documentación (`design.md` describe el mecanismo anterior de anclas y de foco), y se
atienden en `document`.

## Suite y build

| Comando (desde `frontend/proyecto_angular`) | Resultado |
|---|---|
| `npx ng test --watch=false --browsers=ChromeHeadless` | **309 / 309 SUCCESS, 0 FAILED** |
| `npx ng build` | compila; **Initial total 421.41 kB** (presupuesto 500 kB; transfer 110.76 kB) |

Único warning del build: `css-inline-fonts` 19.14 kB vs 17 kB (preexistente). Chunks lazy en el
build: `servicios-component`, `contacto-component`, `legal-component`, `nosotros-component`,
`preguntas-frecuentes-component`, `landing-component`, `login-component`; la 404 es
`loadComponent` en `app.routes.ts`.

Cobertura: cada `apply-progress` declara `tests_agregados`; el código de producción de A4
(`app/scroll-offset.ts` y el initializer de `app.config.ts`) tiene `app/scroll-offset.spec.ts`
(5 tests: altura del header + 16 px, header compacto, fallback 88 px, 0 sin header, y registro
del offset en `ViewportScroller` al arrancar). Excepciones declaradas: `index.html` y
`styles.scss` (chrome) y la config SDD (cierre); se revisan por código y en runtime.

### Verificación en runtime (Chrome headless sobre `dist/`)

El build se sirve con fallback SPA y se mide con Chrome DevTools Protocol (script en el
scratchpad de la sesión, sin dependencias en el repo).

**Anclas de `/legal` (CA-12.2, CA-07.3).** El `h2` de la sección queda por debajo del borde
inferior del header en todos los casos:

| Ancho | Entrada | Ancla | Header bottom | `h2` top | Tapado |
|---|---|---|---|---|---|
| 1280 | URL directa | `#tratamiento-datos` | 65 | 112 | no |
| 1280 | URL directa | `#cookies` | 65 | 114 | no |
| 1280 | índice de `/legal` | `#tratamiento-datos` | 65 | 129 | no |
| 1280 | índice de `/legal` | `#cookies` | 65 | 130 | no |
| 1280 | footer desde `/servicios` | `#tratamiento-datos` | 65 | 129 | no |
| 1280 | footer desde `/servicios` y desde `/` | `#cookies` | 65 | 130 | no |
| 360 | URL directa | `#tratamiento-datos` | 57 | 106 | no |
| 360 | URL directa | `#cookies` | 57 | 106 | no |
| 360 | índice de `/legal` | `#tratamiento-datos` | 57 | 113 | no |
| 360 | índice de `/legal` | `#cookies` | 57 | 114 | no |
| 360 | footer desde `/servicios` | `#tratamiento-datos` | 57 | 113 | no |
| 360 | footer desde `/servicios` y desde `/` | `#cookies` | 57 | 114 | no |

La sección (`<section id>`) arranca en 73–81 px, siempre debajo del header compacto.

- **Sticky + compacto:** tras `scrollTo(0, 1500)` en `/legal`, el header está en `top: 0` con
  `is-compact`, a 1280 y a 360 px.
- **Contenido inicial:** en las 7 páginas públicas el `h1` arranca en 185–315 px; el header
  termina en 81 px.
- **Sin scroll horizontal a 360 px:** `scrollWidth = clientWidth = 360` en `/`, `/servicios`,
  `/nosotros`, `/preguntas-frecuentes`, `/contacto`, `/legal` y `/no-existe`. Cada página con
  title propio y un solo `canonical`; la 404 con `robots=noindex`.
- **Reduced motion emulado (`reduce`):** entradas del menú móvil `0s` y `transform: none`;
  flechas `0s`; reveal `0s` y opacidad 1; `.nav-container` `0s`; subrayado `.nav-item::after`
  `0s`. Con `no-preference` las dos transiciones del header vuelven (`0.25s` y `0.3s`).
- **WhatsApp del header:** `.icon-btn.wa` con fondo `rgb(26, 122, 67)` (`#1a7a43`) y ícono
  blanco.

## Criterios de aceptación

**69 cumplidos** (3 con observación), **0 fallidos**, **0 no verificables**.

| CA | Estado | Evidencia |
|---|---|---|
| 01.1 | cumplido | `site-header.component.spec.ts` "five site pages in order…"; specs de nosotros, faq, 404, home |
| 01.2 | cumplido | mismo test ("never as anchors"); `home.component.spec.ts` "single site navigation" |
| 01.3 | cumplido (obs.) | header spec "keep Ingresar, WhatsApp and theme toggle". Obs.: el menú móvil (< 1024 px) no tiene WhatsApp; HP-08 no lo pide y el footer y `/contacto` lo ofrecen |
| 02.1 | cumplido | header spec "only Servicios as current on /servicios" |
| 02.2 | cumplido | header spec "only Inicio as current on /…" (`exact` solo para `/`) |
| 02.3 | cumplido | `site-header.component.scss` `.nav-item.is-active` (color de marca + subrayado) y `.mobile-item.is-active` |
| 03.1 | cumplido | home spec "link to every internal page" |
| 03.2 | cumplido | home spec "leave benefits by role to /servicios" + servicios spec "every benefit by role" |
| 03.3 | cumplido | home spec "Ingresar as the only primary CTA", "hero CTA to /acceder" |
| 04.1 | cumplido | `app.routes.spec.ts` "404 page for an unknown URL and stay on it"; runtime `/no-existe` queda en `/no-existe` |
| 04.2 | cumplido | not-found spec "link back to the home", "single site navigation" |
| 04.3 | cumplido | not-found spec "own title and robots noindex"; runtime title "Página no encontrada \| KUVU", `noindex` |
| 04.4 | cumplido | routes spec "access flow lazily", "keep the guards" |
| 05.1 | cumplido | routes spec "public pages as lazy routes"; chunks lazy en el build |
| 06.1 | cumplido | specs de servicios, contacto, legal (breadcrumb "Inicio › …") |
| 06.2 | cumplido | page-meta spec "single script… / remove on clear"; breadcrumb spec "clear them on destroy" |
| 07.1 | cumplido | header spec "initial state at the top" |
| 07.2 | cumplido | header spec "compact past the threshold and recover"; runtime `is-compact` a 1280 y 360 px |
| 07.3 | cumplido | runtime: `h1` debajo del header en las 7 páginas; destino de enlaces internos a ancla debajo del header (tabla de anclas); `scroll-offset.spec.ts` |
| 08.1 | cumplido | header spec "open: aria-expanded, body scroll locked, focus on the first link" |
| 08.2 | cumplido | specs de Escape y botón (foco al botón) y de enlace (navega, `closeMenu(false)`); coincide con el texto vigente de CA-08.2 |
| 08.3 | cumplido | header spec "stay closed after navigating" |
| 08.4 | cumplido | header spec "index each entry"; scss bajo `no-preference`; runtime `0s` con `reduce` |
| 09.1 | cumplido | footer spec "four legal documents to their anchors" |
| 09.2 | cumplido | footer spec "WhatsApp and the contact form" |
| 09.3 | cumplido | footer spec "no email line nor mailto", "academic project" |
| 09.4 | cumplido | footer spec "no social links nor empty #" |
| 09.5 | cumplido | runtime 360 px sin scroll horizontal; grid de 1 columna en móvil |
| 10.1 | cumplido | servicios spec "every service with title, description and icon" |
| 10.2 | cumplido | servicios spec "every benefit by role" |
| 10.3 | cumplido | servicios spec "own page meta"; content spec "never repeat a title or a description"; runtime "Servicios \| KUVU" |
| 10.4 | cumplido | servicios spec "secondary Contactar link to /contacto" (`btn-secondary link-arrow`) |
| 11.1 | cumplido | contacto spec "flag every missing field", "aria-invalid and aria-describedby", "not send without the consent" |
| 11.2 | cumplido | contacto spec "reject a malformed email even if there is a phone" |
| 11.3 | cumplido | contacto spec "open WhatsApp in a new tab with the composed message"; contact-message spec |
| 11.4 | cumplido | contact-message spec "leave out empty optional fields" |
| 11.5 | cumplido | contacto spec "neither store the data in the browser nor log it"; el componente no inyecta `HttpClient` |
| 11.6 | cumplido | contacto spec "…and confirm it"; `aria-live="polite"` en el template |
| 11.7 | cumplido | contacto spec "label every field"; `<label for>` en cada campo |
| 11b.1 | cumplido | contacto spec "consent unchecked" |
| 11b.2 | cumplido | contacto spec y content spec "link the consent text to the data policy" |
| 11c.1 | cumplido | contacto spec "other channels and the three numbered steps" |
| 12.1 | cumplido | legal spec "index the four documents with links to their anchors"; runtime: los enlaces del índice llevan a su sección |
| 12.2 | cumplido | runtime: tabla de anclas (12 casos, ninguno tapado); `scroll-offset.spec.ts` |
| 12.3 | cumplido | legal spec "show the effective date" |
| 12.4 | cumplido | legal spec "warn at the top…" |
| 13.1 | cumplido | `content/responsible.ts` fuente única; footer, `/contacto` y `/legal` leen de ahí; content spec ata `phone` a `contact.whatsappNumber` |
| 13.2 | cumplido | legal spec "not show a tax id, an address or an email, nor empty lines"; content spec "no incomplete sentence" |
| 13.3 | cumplido | legal spec y rich-text spec "no placeholder marks"; grep sin `[…]` en contenido ni templates |
| 14.1 | cumplido | content spec "thirteen minimum points"; legal spec "every block heading" |
| 14.2 | cumplido | content spec "cite the governing rules" |
| 14.3 | cumplido | content spec "…and the response terms" (10 y 15 días hábiles) |
| 15.1 | cumplido | content spec y legal spec "privacy notice to the data policy" |
| 15.2 | cumplido | content spec "exactly the browser storage the site uses"; coincide con `theme.service`, `auth.service` y `empresaPreseleccionada` en `sessionStorage` |
| 15.3 | cumplido | content spec "Colombian law as applicable" |
| 16.1 | cumplido | specs de home, servicios, nosotros, faq "correlatively from 01"; contacto 01–03 y legal `number(i)` |
| 16.2 | cumplido | mismos specs ("hidden from assistive tech"); home spec "arrows… hidden" |
| 16.3 | cumplido (obs.) | runtime con `reduce`: sin entradas, escalonados, desplazamientos ni transiciones del header. Obs.: la anulación de view transitions bajo `reduce` (`styles.scss`) se verifica por código; sus pseudo-elementos no se miden con CDP |
| 16.4 | cumplido | runtime 360 px en las 7 páginas: `scrollWidth = 360` |
| 17.1 | cumplido | page-meta spec "update every tag in place, without duplicates", "single canonical"; runtime 1 canonical por página |
| 17.2 | cumplido | content spec "never repeat a title or a description"; runtime 7 titles distintos |
| 17.3 | cumplido (obs.) | page-meta spec "image that exists"; `public/Imagenes_web/equipo-ycw-1024.jpeg` existe. Obs.: `og:image` de `index.html` es relativa (sin dominio de producción), desvío registrado en `apply-progress/chrome.md` |
| 18.1 | cumplido | home spec "exactly one Organization and one WebSite", "remove… when leaving" |
| 18.2 | cumplido | home spec "…as text"; page-meta spec "as text" |
| 19.1 | cumplido | content spec "at least three contact and data questions" (son 4); coherentes con `/legal` y `/contacto` (ver Texto) |
| 19.2 | cumplido | content spec "without inventing figures" |
| 19.3 | cumplido | content spec "home subset at four questions" |
| 20.1 | cumplido | 309/309 |
| 20.2 | cumplido | build OK, 421.41 kB |

## Estado de los hallazgos del verify anterior

| # | Hallazgo | Estado | Evidencia |
|---|---|---|---|
| H1 | Anclas de `/legal` bajo el header (media) | **resuelto** | `app.config.ts` registra con `provideAppInitializer` `ViewportScroller.setOffset(() => headerScrollOffset(doc))`; `app/scroll-offset.ts` mide `app-site-header` en cada scroll + 16 px (fallback 88, 0 sin header). Runtime: 12/12 casos con el `h2` debajo del header |
| H2 | Comentarios en español en código nuevo (baja) | **resuelto** | `app.routes.ts`, `home.component.scss`, `content/site.ts`, `page-meta.service.ts`, `styles.scss` en inglés; grep de comentarios agregados en `a94a5f9..HEAD` sin comentarios en español (solo cita la etiqueta visible "Inicio › Página") |
| H3 | Transiciones del header activas con reduced motion (baja) | **resuelto** | `height 0.25s` de `.nav-container` y `transform 0.3s` de `.nav-item::after` dentro de `@media (prefers-reduced-motion: no-preference)`; runtime `0s` con `reduce`, `0.25s`/`0.3s` sin él |
| H4 | Foco al elegir un enlace del menú (baja) | **resuelto en la spec** | CA-08.2 describe el comportamiento implementado; sin cambio de código. `design.md` §"Menú móvil" sigue diciendo que el foco vuelve en todos los cierres (ver O2) |
| H5 | FAQ incoherente con `/legal` (baja) | **resuelto** | `content/faq.ts`: "¿KUVU usa cookies?" lista tema, sesión y empresa preseleccionada (las 3 categorías de `/legal`); "¿Cómo me contacto?" remite a Contacto y al WhatsApp +57 322 319 2760, sin ubicarlo en el encabezado |
| Extra | Ícono WhatsApp del header | **resuelto** | `.icon-btn.wa` fondo `#1a7a43`, hover `#146236`; runtime `rgb(26, 122, 67)` |

## Hallazgos

Sin hallazgos de severidad alta, media ni baja.

### Observaciones (informativas)

- **O1 — `design.md` describe el mecanismo anterior de anclas** (líneas ~140 y ~233:
  `scroll-padding-top` compensa el header). El mecanismo real es el offset del
  `ViewportScroller` (`app/scroll-offset.ts`); `scroll-padding-top` queda para la navegación
  nativa a fragmento. Para `document`: reflejarlo en `docs/home-profesional.md` y
  `docs/architecture.md`.
- **O2 — `design.md` §"Menú móvil"** (línea ~148) dice que el foco vuelve al botón en todo
  cierre; la spec (CA-08.2) y el código lo devuelven solo con Escape y con el botón. Para
  `document`: explicarlo en `docs/home-profesional.md`, junto con el breakpoint de 1024 px del
  menú móvil.
- **O3 — `og:image` relativa en `index.html`** (crawlers sociales necesitan URL absoluta);
  depende de un dominio de producción que no está declarado. Desvío ya registrado en
  `apply-progress/chrome.md`.
- **O4 — Hover de `.origin-link`/`.faq-link` en claro** usa `#6b8e6b`: 3.42 : 1 sobre
  `#f6f7f4` (solo en hover; el estado normal pasa). Preexistente, fuera del alcance.
- **O5 — Offset medido antes del cambio a compacto:** en una entrada directa el offset se
  calcula con el header aún en estado inicial (más alto), así que la sección queda 15–16 px
  más abajo que en una navegación con el header ya compacto (112 vs 129 px a 1280). Es
  inofensivo: siempre queda por debajo del header.

## Contraste (WCAG 2.x)

Los tokens de `styles.css` no cambian desde el verify anterior; los fondos se confirman en
runtime.

| Elemento | Tema | Colores | Ratio | Umbral | Resultado |
|---|---|---|---|---|---|
| `.section-eyebrow` | claro | `#3e5c40` / `#f0f4f8` (fondo real medido) | 6.76 | 4.5 | pasa |
| `.section-eyebrow` | claro | `#3e5c40` / `#f6f7f4` · `#ffffff` · `#eef1ec` | 6.95 · 7.47 · 6.56 | 4.5 | pasa |
| `.section-eyebrow` | oscuro | `#8fb28f` / `#1b231b` (fondo real medido) | 6.86 | 4.5 | pasa |
| `.section-eyebrow` | oscuro | `#8fb28f` / `#141a14` · `#222c22` | 7.52 · 6.15 | 4.5 | pasa |
| `.link-arrow` | claro / oscuro | mismo token que el eyebrow | 6.15–7.52 | 4.5 | pasa |
| Botón/ícono WhatsApp (header, footer, `/nosotros`) | ambos | `#ffffff` / `#1a7a43` | 5.37 | 4.5 | pasa |
| Hover WhatsApp del header | ambos | `#ffffff` / `#146236` | 7.42 | 4.5 | pasa |
| `.cta-secondary` (CTA final) | ambos | `#ffffff` / `#2f4a2f` | 9.81 | 4.5 | pasa |
| Aviso de `/legal` | claro | `#5c3b00` / `#fff4d6` | 9.21 | 4.5 | pasa |
| Aviso de `/legal` | oscuro | `#fde7b0` / `#3a2a0c` | 11.36 | 4.5 | pasa |

## Logs

- `git diff a94a5f9..HEAD -- frontend` no agrega `console.*` ni logger.
- `/contacto` no registra ni guarda los datos: spec "neither store the data in the browser nor
  log it" (espía `console` y verifica `localStorage`/`sessionStorage` vacíos); el componente
  solo arma el enlace `wa.me` y llama a `window.open`.
- `app/scroll-offset.ts` no loguea; solo mide el header.
- `logs_conforme: sí` en los 5 `apply-progress`: consistente.

## Guidelines

| Regla | Resultado |
|---|---|
| Identificadores en inglés | cumple (los nombres de componente por ruta, `ServiciosComponent`/`ContactoComponent`, siguen el criterio preexistente) |
| Comentarios en inglés en código nuevo | cumple (H2 resuelto) |
| Textos visibles en `content/*.ts` (RNF-14) | cumple: páginas nuevas leen de `content/contact.ts`, `legal.ts`, `pages.ts`, `site.ts`, `faq.ts`; en templates quedan etiquetas cortas de UI, mismo criterio que la home previa |
| Rutas lazy (RNF-04) | cumple: `servicios`, `contacto`, `legal`, `**`, más `acceder` y `login` |
| Reduced motion (RNF-03) | cumple en menú, flechas, hover-lift, reveal, header y view transitions |
| Dependencias nuevas | ninguna: `package.json` y `package-lock.json` sin cambios |
| Estructura | páginas en `components/pages/*`, piezas compartidas en `components/public/*`, contenido en `content/`, offset de scroll en `app/scroll-offset.ts` junto a `app.config.ts` |

## Texto del sitio público

- Voseo: grep de formas voseantes sobre `content/`, `components/home`, `components/pages`,
  `components/public` e `index.html`: sin resultados. Test de regresión en `content.spec.ts`
  ("Colombian tuteo, never voseo").
- Marcadores `[...]`: ninguno en contenido ni templates.
- NIT, dirección y correo: no existen en `responsible.ts`; sin `mailto:`, dominios de correo,
  NIT ni direcciones en el sitio público.
- FAQ y `/legal`: las 3 categorías de almacenamiento y los canales (formulario de Contacto y
  WhatsApp +57 322 319 2760) coinciden.

## Alcance de documentación (declarado en `tasks.md`)

| Destino | Declarado | Coincide con el cambio |
|---|---|---|
| `CHANGELOG.md` | sí | sí (páginas, navegación, legales, 404 visibles) |
| `docs/architecture.md` | sí, con detalle de qué actualizar | sí; sumar el offset de anclas (O1) |
| `README.md` | "sí, si lista las rutas del sitio público" (a verificar en `document`) | correcto |
| OpenAPI / Bruno | no | correcto (sin endpoints) |
| `DEVELOPMENT_GUIDELINES.md` | no | correcto |
| Documento del cambio | `docs/home-profesional.md` | — |

`document` todavía no corrió: que los documentos no estén actualizados no es una falla de esta
fase. Para `document`: O1, O2 y el breakpoint de 1024 px del menú móvil.
