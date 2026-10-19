# Design — home-profesional

Fuentes: `spec.md` (HP-01..HP-20), `propose.md` (D1–D6), `explore.md`,
`DEVELOPMENT_GUIDELINES.md` (naming y política de logs) y `docs/architecture.md`
(clúster público). Restricciones: RNF-03 (reduced motion), RNF-04 (lazy), RNF-14 (textos en
`content/*.ts`), RNF-15 (tests). **No se agregan dependencias:** todo se resuelve con Angular
21 (router, `@angular/forms`, signals), SCSS y APIs del navegador.

Rutas relativas a `frontend/proyecto_angular/src/app/` salvo que se indique otra cosa.

---

## 1. Vista general

```
app.config.ts ── provideRouter(routes, withComponentInputBinding(), withViewTransitions(),
                                withInMemoryScrolling({ scrollPositionRestoration: 'top',
                                                        anchorScrolling: 'enabled' }))
              provideAppInitializer → ViewportScroller.setOffset(headerScrollOffset)
                                      (app/scroll-offset.ts: altura del header + 16 px)
app.routes.ts
  ''                     → HomeComponent (eager, como hoy)
  'servicios'            → pages/servicios        (lazy)   NUEVO
  'nosotros'             → pages/nosotros          (lazy)   modificado
  'preguntas-frecuentes' → pages/preguntas-frecuentes (lazy) modificado
  'contacto'             → pages/contacto          (lazy)   NUEVO
  'legal'                → pages/legal             (lazy)   NUEVO
  'acceder', 'login', rutas con guard              (sin cambios)
  '**'                   → pages/not-found         (lazy)   NUEVO (reemplaza redirectTo '/login')

Cada página pública:
  <app-site-header/>  ← lee siteNavLinks de content/site.ts (sin input)
  [app-breadcrumb]    ← páginas internas
  secciones con .section-eyebrow + [data-reveal]
  <app-site-footer/>  ← columnas Sitio / Legal / Contacto
  ngOnInit → PageMetaService.setPage(pageMeta[ruta])
```

Ningún código fuera de `app.routes.ts` depende del comodín `**` (los guards y el login navegan
explícitamente a `/login`), así que reemplazar la redirección por la 404 no altera el acceso
autenticado (CA-04.4).

---

## 2. Contenido (`content/*.ts`)

Todo texto nuevo vive en módulos tipados (RNF-14); los componentes solo leen. Tipos nuevos en
`content/types.ts`.

| Módulo | Qué contiene | Estado |
|---|---|---|
| `site.ts` | `siteInfo`; **`sitePages`** (todas las páginas con `label`/`href`, incluida `/legal`); **`siteNavLinks`** = las 5 de HP-01 (subconjunto ordenado de `sitePages`); `contact` (WhatsApp); `buildWhatsAppLink`; `breadcrumbFor(href)` resuelto sobre `sitePages` | modificado: `navLinks` (anclas) y `pageNavLinks` se eliminan y se reemplazan por `siteNavLinks` |
| `responsible.ts` | **`responsible`** de la empresa ficticia KUVU: razón social, domicilio, teléfono (el WhatsApp publicado), área de atención y vigencia. NIT, dirección y correo son campos opcionales del modelo y no se definen (HP-13). `resolveRichText` e `isEmptyRichText` aplican esos datos a un `RichText` | nuevo — fuente única de D1/CA-13.1 |
| `legal.ts` | `legalNotice` (aviso "no es asesoría legal"); **`legalDocuments`**: 4 documentos `{ id, title, blocks[] }` con `id` = ancla de HP-12; cada bloque `{ heading?, paragraphs: RichText[], items?: RichText[] }` | nuevo |
| `contact.ts` | `contactSubjects` (4 asuntos de HP-11), `contactSteps` (3 pasos), `consentText` (texto de la casilla con su enlace), etiquetas y mensajes de error del formulario | nuevo |
| `pages.ts` | **`pageMeta`**: `Record<PageKey, PageMeta>` con `title`, `description`, `path`, `noindex?` para home, servicios, nosotros, preguntas-frecuentes, contacto, legal, not-found | nuevo — permite testear unicidad (CA-17.2) |
| `legal-index.ts` | `legalAnchors`, `legalTitles` y `legalIndex` (4 entradas `label`/`href`/`fragment`): índice liviano que usan footer y `/contacto` | nuevo |
| `faq.ts` | grupo nuevo "Contacto y datos" con ≥ 3 preguntas (HP-19); `homeFaqCount = 4` sin cambios | modificado |
| `services.ts`, `benefits.ts` | sin cambios de contenido; los consume `/servicios` (y la home, resumen) | sin cambios |

**Frontera del barrel:** `content/index.ts` exporta `responsible`, `pages` y `legal-index`,
pero **no** `legal.ts` ni `contact.ts`. Solo las páginas lazy `/legal` y `/contacto` los
importan directo (`content/legal`, `content/contact`). Con el barrel, el build dejaba los
textos legales en el chunk compartido del bundle inicial (+10 kB, por encima del presupuesto
de 500 kB); separados, quedan en el chunk de su página (RNF-04). Un test verifica que el
barrel no los reexporta.

### Texto con datos del responsable (`RichText`)

Los textos legales necesitan intercalar datos del responsable y enlaces internos sin usar
`innerHTML`. Un `RichText` es un arreglo de segmentos:

```ts
type RichSegment =
  | string                                            // texto plano
  | { field: keyof Responsible; prefix?: string; suffix?: string } // dato del responsable
  | { link: string; fragment?: string; label: string }; // enlace interno (routerLink + fragment)
```

Lo renderiza un componente presentacional nuevo, `public/rich-text/` (`app-rich-text`): texto
como interpolación, `field` como `prefix + valor + suffix` y, si el campo no existe, el
segmento completo se omite (así no queda "NIT: " vacío ni una frase cortada); `link` como
`<a routerLink fragment>`. `/legal` no renderiza los ítems de lista que quedan vacíos. Un dato
cambiado en `responsible.ts` aparece en `/legal`, footer y `/contacto` a la vez (CA-13.1), y
nada se interpreta como HTML.

Alternativas descartadas: (a) HTML en strings + `[innerHTML]` — pasa por el sanitizer pero
mezcla marcado con contenido y abre la puerta a XSS si un dato real trae `<`; (b) plantillas
con `{razonSocial}` y reemplazo por regex — omitir la frase de un dato ausente obliga a
parsear el texto o a usar `innerHTML` de nuevo.

El correo del footer y de `/contacto` usa el mismo `responsible.email` (D2): como no existe,
la línea de correo no se renderiza y no hay `mailto:`; los canales son el formulario de
`/contacto` y el WhatsApp.

---

## 3. Componentes

### Nuevos

| Componente | Ruta | Responsabilidad |
|---|---|---|
| `ServiciosComponent` | `components/pages/servicios/` | Lista `services` y `benefitsByRole` (HP-10), CTA secundario a `/contacto`, breadcrumb |
| `ContactoComponent` | `components/pages/contacto/` | Formulario (HP-11), casilla de autorización (HP-11b), canales y 3 pasos (HP-11c) |
| `LegalComponent` | `components/pages/legal/` | Índice + 4 secciones con `id` = ancla (HP-12..15), aviso, fecha de vigencia |
| `NotFoundComponent` | `components/pages/not-found/` | Mensaje 404, enlace a `/`, `noindex` (HP-04) |
| `RichTextComponent` | `components/public/rich-text/` | Render de `RichText` (sección 2) |

El ícono SVG de cada servicio está hoy inline con `ngSwitch` en la home y pasa a usarse
también en `/servicios`. Se extrae a `components/public/service-icon/` (`app-service-icon`,
input `icon`) para no duplicar el switch: es la segunda aparición y el markup es largo.

### Modificados

| Componente | Cambio |
|---|---|
| `public/site-header` | Sin input `navLinks`: lee `siteNavLinks`. `routerLink` + `routerLinkActive` con `ariaCurrentWhenActive="page"` y `exact: true` solo para `/` (HP-02). Estado compacto por scroll y menú móvil a pantalla completa (sección 4). |
| `public/site-footer` | Cuatro bloques: marca / Sitio (`siteNavLinks`) / Legal (`legalDocuments` → `/legal` + `fragment`) / Contacto (WhatsApp + `responsible.email` vía `app-rich-text`). Grid que colapsa a una columna < 768 px. |
| `home` | Servicios como resumen (títulos + enlace "Ver servicios →" a `/servicios`). Beneficios por rol se muestra en `/servicios` y sale de la home; seguridad, compañías y origen se quedan en la home (no tienen otra página, CA-03.2). Eyebrows numerados. Enlace secundario a `/contacto` junto al CTA final. `setPage(pageMeta.home)` + JSON-LD (sección 5). |
| `pages/nosotros`, `pages/preguntas-frecuentes` | Dejan de pasar `[navLinks]` al header; usan `pageMeta`; eyebrows numerados. |
| `services/page-meta.service.ts` | API ampliada (sección 5). |
| `app.routes.ts`, `app.config.ts` | Rutas nuevas lazy (HP-05) y `withInMemoryScrolling` (anclas de `/legal`, scroll arriba al cambiar de página). |
| `src/index.html` | Meta por defecto de KUVU (HP-18). |
| `src/styles.scss` | Utilidades globales del sitio público (sección 4). |

Con este cambio la columna de chrome de las páginas internas (header + breadcrumb + footer)
aparece en 6 páginas; architecture.md la registra como deuda "hasta una tercera página". Se resuelve
con un componente de layout `public/public-page/` (`app-public-page`, con `<ng-content>` y
input `breadcrumb`) que envuelven `/servicios`, `/nosotros`, `/preguntas-frecuentes`,
`/contacto`, `/legal` y la 404. La home no lo usa (no lleva breadcrumb).

---

## 4. Header, menú móvil y movimiento

### Header compacto (HP-07)
- `position: sticky; top: 0` (no `fixed`): el header sigue ocupando su lugar en el flujo, así
  no hace falta un espaciador y no tapa el contenido inicial (CA-07.3).
- Un signal `isCompact` se actualiza con un listener `scroll` pasivo sobre `window`
  (`scrollY > 24`), registrado en `afterNextRender` y retirado en `DestroyRef`. El host recibe
  `[class.is-compact]`. El estado compacto reduce el padding y aplica fondo semiopaco +
  `backdrop-filter: blur(...)`.
- Las anclas (`/legal#cookies`) no quedan tapadas (CA-12.2): el router hace el scroll a
  anclas con `window.scrollTo`, que ignora `scroll-padding-top`, así que `app.config.ts`
  registra con `provideAppInitializer` un offset del `ViewportScroller`
  (`setOffset(() => headerScrollOffset(document))`). `app/scroll-offset.ts` mide la altura
  real de `app-site-header` en cada scroll y suma 16 px; usa 88 px si el header no tiene
  altura y 0 en páginas sin header público. El `scroll-padding-top: 88px` de `styles.scss`
  cubre solo la navegación nativa a fragmento.

### Menú móvil (HP-08)
- Panel `position: fixed; inset: 0` con los enlaces, "Ingresar" y tema.
- El panel aplica por debajo de 1024 px; desde 1024 px la navegación va en línea.
- Abrir: `isMenuOpen` (signal) → `document.body.style.overflow = 'hidden'` y foco al primer
  enlace (`viewChild` + `focus()` tras render). Cerrar (Escape vía `@HostListener
  ('document:keydown.escape')`, botón, clic en enlace, o `NavigationEnd` del router):
  restaura `overflow`. El foco vuelve al botón de menú solo al cerrar con Escape o con el
  botón (CA-08.2); al elegir un enlace la página navega y `NavigationEnd` cierra con
  `closeMenu(false)`, sin devolver el foco.
- Cada ítem lleva `--i` (índice) y entra con `transition-delay: calc(var(--i) * 40ms)`
  dentro de `@media (prefers-reduced-motion: no-preference)`.
- No se implementa focus trap completo: el panel cubre la pantalla y se cierra con Escape;
  un trap agrega código sin un caso que hoy falle. Queda anotado como límite.

### Utilidades globales (`styles.scss`)
Globales porque las usan 7 páginas (mismo criterio que el reveal):
- `.section-eyebrow` — número de dos dígitos en mayúsculas con tracking amplio y color de
  marca, `aria-hidden="true"` en el template (CA-16.2). El número sale del índice de la
  sección en el template (`01`, `02`…), no del contenido.
- `.link-arrow` — enlace con `→` en un `<span aria-hidden="true">` que se desplaza
  `translateX(4px)` en `:hover` y `:focus-visible`.
- Hover de tarjetas: `translateY(-2px)` + sombra, solo en `no-preference`.
- `:focus-visible` visible en enlaces y botones del sitio público.
- Reduced motion (CA-16.3): todo lo anterior dentro de `@media (prefers-reduced-motion:
  no-preference)`; además se anulan las animaciones de `withViewTransitions` con
  `::view-transition-old(*), ::view-transition-new(*), ::view-transition-group(*) {
  animation: none }` bajo `reduce`.
- Tokens: en SCSS de componentes se usa el patrón `var(--token, valor)` que registra
  architecture.md (Tailwind v4 no emite tokens solo referenciados desde SCSS).

Descartado: `@angular/animations` para el menú y el header — CSS cubre los casos, respeta
reduced motion con una media query, y el paquete además está deprecado en favor de
`animate.enter/leave` nativos.

---

## 5. SEO (`PageMetaService`)

API resultante (identificadores en inglés, como pide el guideline):

```ts
setPage(meta: PageMeta): void          // title, description, og:*, twitter:*, canonical, robots
setJsonLd(id: string, data: object): void   // un <script type="application/ld+json" id=...>
clearJsonLd(id: string): void
setBreadcrumb(items) / clearBreadcrumb()    // se reimplementan sobre setJsonLd
```

- `setPage` usa `Meta.updateTag` con selector por `name`/`property` (`og:title`,
  `twitter:card`, …), así navegar no duplica tags (CA-17.1). `canonical` es un único
  `<link rel="canonical">` que se crea una vez y se actualiza. `robots: noindex` se agrega
  solo si `meta.noindex` y se quita en las demás páginas.
- URLs absolutas sobre `document.location.origin` + `meta.path`, igual que el breadcrumb (no
  hay dominio de producción declarado).
- `og:image`: `/Imagenes_web/equipo-ycw-1024.jpeg` (imagen existente, D4), con
  `og:locale = es_CO`, `twitter:card = summary_large_image`.
- Home: `setJsonLd('kuvu-home-jsonld', { '@context', '@graph': [Organization, WebSite] })`
  con nombre, URL y logo (`/logo-rediseno/Logo_Kuvu.png`); sin teléfono ni dirección
  (la empresa ficticia no publica dirección). Se retira en `ngOnDestroy` (CA-18.1). Se escribe con
  `textContent` (CA-18.2).
- `index.html`: title "KUVU · Administración inmobiliaria multiempresa", description, `og:*`
  y `twitter:*` estáticos — los únicos que leen los crawlers sociales (SPA sin prerender).

Descartado: meta en `data` de cada ruta + listener global del router. Centraliza, pero
cambia el patrón ya establecido (`setPage` en `ngOnInit`) y obliga a mover el título de las
rutas; `pageMeta` en `content/pages.ts` ya da la fuente única y testeable.

---

## 6. Formulario de contacto

- Reactive Forms (`@angular/forms`, ya instalado): `name` (required, trim), `company`,
  `email` (`Validators.email`), `phone` (patrón de dígitos, espacios y `+`), `subject`
  (required, uno de `contactSubjects`), `message` (required), `consent`
  (`Validators.requiredTrue`, inicia en `false`, CA-11b.1). Validador de grupo
  `emailOrPhone` (CA-11.1).
- Errores: se muestran tras `submit` o `touched`; cada control con `aria-invalid` y
  `aria-describedby` al id de su mensaje (CA-11.1, CA-11.7).
- `buildContactMessage(values): string` es una función pura (en
  `components/pages/contacto/contact-message.ts`) que arma el texto omitiendo los opcionales
  vacíos (CA-11.3/11.4). El enlace sale de `buildWhatsAppLink(contact.whatsappNumber, …)`.
- Envío: `window.open(url, '_blank')` y `opener = null` a mano (con el feature `noopener`,
  `window.open` devuelve siempre `null` y no se puede detectar el bloqueo). Si devuelve `null` (bloqueador de
  pop-ups) la confirmación incluye el enlace directo como alternativa. La confirmación vive en
  una región `aria-live="polite"` (CA-11.6).
- No hay `HttpClient`, `localStorage` ni `console.*` en el flujo (CA-11.5). Política de
  logs: el sitio público no emite logs; en particular nunca se registran los datos del
  formulario (datos personales).

---

## 7. Página `/legal`

- Índice `<ol>` con `routerLink="/legal"` + `fragment` por documento; secciones
  `<section [id]="doc.id">` con `<h2>`. Con `anchorScrolling` el router lleva al ancla al
  entrar desde el footer o el índice, y el offset del `ViewportScroller`
  (`app/scroll-offset.ts`, sección 4) compensa el header.
- El aviso de "texto base, no asesoría legal" y la fecha de vigencia (`responsible.effectiveDate`
  vía `app-rich-text`) van arriba del índice (CA-12.3, CA-12.4).
- El contenido de los 4 documentos (HP-14, HP-15) se redacta en `content/legal.ts` siguiendo
  los 13 puntos de HP-14. Los puntos que la spec exige (normas citadas, plazos de 10 y 15 días
  hábiles, 3 categorías de almacenamiento) se verifican con tests de contenido.

---

## 8. Tests (test-after, RNF-15)

| Área | Tests |
|---|---|
| `content.spec.ts` | `siteNavLinks` = 5 rutas en orden; `breadcrumbFor` sobre `sitePages`; `pageMeta` sin titles/descriptions repetidos; `legalDocuments` con las 4 anclas; HP-14 (normas, plazos, 13 puntos por `heading`); cookies con 3 categorías; `responsible` sin valores inventados (todos `null`); FAQ ≥ 3 nuevas |
| `rich-text` | texto, valor con prefix/suffix, campo ausente omitido con su frase, enlace con fragment; sin `innerHTML` |
| `site-header` | 5 enlaces sin `#`; `aria-current` en la ruta activa (incluye `/` exacto); compacto tras scroll; menú: abre/cierra con Escape, botón, navegación; `overflow` del body; foco |
| `site-footer` | 4 enlaces legales con fragment; WhatsApp; sin línea de correo ni `mailto:`; nota académica; sin `href="#"` |
| `contacto` + `contact-message` | validaciones (CA-11.1/11.2), casilla requerida, mensaje armado con y sin opcionales, `window.open` espiado, fallback con `null`, región `aria-live` |
| `legal`, `servicios`, `not-found` | estructura, enlaces, `noindex` en 404 |
| `page-meta.service` | `setPage` actualiza sin duplicar; canonical único; robots on/off; `setJsonLd`/`clearJsonLd` |
| `home` | enlaces a las 4 páginas; resumen de servicios; JSON-LD montado/retirado; eyebrows correlativos |
| `app.routes` | `**` resuelve a `NotFoundComponent`; rutas nuevas con `loadComponent` |

Los specs existentes que usan `navLinks`/`pageNavLinks` o el input `navLinks` del header se
actualizan a `siteNavLinks`.

---

## 9. Riesgos

- **Volumen**: muy por encima del umbral de 300 líneas (los textos legales solos rondan las
  250–350). `tasks` debe pronosticarlo y aplicar `ask-on-risk`; el corte natural es por slice
  (contenido / chrome / páginas / home).
- **Rotura de specs existentes** al quitar `navLinks`/`pageNavLinks` y el input del header:
  acotado y previsto en sección 8.
- **`anchorScrolling` + lazy loading**: el scroll al ancla ocurre tras `NavigationEnd`; como
  el contenido de `/legal` es estático en el template, el ancla existe en ese momento. Se
  verifica con test y a mano.
- **`backdrop-filter`** sin soporte → el fondo semiopaco sigue legible (degradación limpia).
- **Contraste** del eyebrow y del aviso de `/legal` en tema claro y oscuro: verificar ≥ 4.5 : 1 en
  `verify`.
- **Merge con `feat/acceso-orden-e-intro`**: ambas ramas tocan `sdd/sdd.config.md`; el
  código del sitio público no se pisa.
- **Validez legal**: el diseño garantiza estructura y datos sin inventar de terceros, no suficiencia jurídica
  (no-objetivo).

## 10. Slices sugeridos para `tasks`

La config en `main` declara slices de un cambio anterior; para este cambio se sugieren:
`contenido` (content/*.ts + tipos + tests) → `chrome` (PageMetaService, app.config, rutas,
index.html, styles, header, footer, public-page, rich-text, service-icon) → `paginas`
(servicios, contacto, legal, 404) → `home` (home + nosotros + preguntas-frecuentes) →
`cierre` (config SDD). `tasks` los confirma en Gate C.
