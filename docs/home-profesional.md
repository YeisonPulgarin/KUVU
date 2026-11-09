# Sitio público multipágina — KUVU

El sitio público de KUVU es un sitio multipágina con una sola navegación: inicio (`/`),
servicios (`/servicios`), nosotros (`/nosotros`), preguntas frecuentes
(`/preguntas-frecuentes`), contacto (`/contacto`), legal (`/legal`) y una página 404 pública
para cualquier ruta desconocida. La home funciona como escaparate: resume cada bloque y
deriva a su página. Todo el texto vive en `src/app/content/*.ts`, el sitio no consume
backend y se escribe en tuteo colombiano.

Rutas relativas a `frontend/proyecto_angular/src/app/` salvo que se indique otra cosa.

## Cómo funciona

### Rutas

`app.routes.ts` declara `''` → `HomeComponent` (eager) y, con `loadComponent` (lazy),
`servicios`, `nosotros`, `preguntas-frecuentes`, `contacto`, `legal` y el comodín `**` →
`NotFoundComponent`. El comodín muestra la 404 y deja la URL pedida en la barra; no redirige
a `/login`. Los guards y el login navegan a `/login` de forma explícita, así que el acceso
autenticado no depende del comodín. `/acceder` y `/login` también son lazy.

Las rutas no declaran `title`: cada página publica su título y sus meta con
`PageMetaService` en `ngOnInit`, desde `content/pages.ts`.

### Navegación única

`content/site.ts` declara `sitePages` (todas las páginas con `label`/`href`, incluida
`/legal`) y `siteNavLinks`, el subconjunto ordenado del menú: Inicio · Servicios · Nosotros ·
Preguntas frecuentes · Contacto. Legal aparece solo en el footer. `breadcrumbFor(href)`
resuelve el breadcrumb sobre `sitePages`, así que menú y breadcrumb no pueden divergir.

### Chrome compartido

- `components/public/site-header/` — lee `siteNavLinks` (sin input). Marca la página activa
  con `routerLinkActive` y `aria-current="page"`; `/` solo coincide exacto. Es
  `position: sticky` y, pasados 24 px de scroll (`HEADER_COMPACT_THRESHOLD`), el host recibe
  `is-compact`: menos padding y fondo semiopaco con `backdrop-filter`. El listener de scroll
  es pasivo, se registra en `afterNextRender` y se retira al destruirse.
- **Menú móvil** (por debajo de 1024 px; desde 1024 px la navegación va en línea): panel a
  pantalla completa con los enlaces, "Ingresar" y el toggle de tema. Al abrir, bloquea el
  scroll del `body` y lleva el foco al primer enlace; los ítems entran escalonados
  (`--i` × 40 ms). Se cierra con Escape, con el botón de menú, al elegir un enlace o con
  cualquier `NavigationEnd`. **Foco al cerrar (CA-08.2):** con Escape o con el botón, el foco
  vuelve al botón de menú; al elegir un enlace la página navega y el foco no vuelve al botón
  (`closeMenu(false)`). No hay focus trap: el panel cubre la pantalla y se cierra con Escape.
- `components/public/site-footer/` — columnas marca / Sitio (`siteNavLinks`) / Legal (los 4
  documentos, `legalIndex` → `/legal` + `fragment`) / Contacto (WhatsApp y formulario; la
  línea de correo solo aparece si `responsible.email` existe). Debajo, la nota académica
  (`academicNote` de `content/site.ts`) y el copyright. Colapsa a una columna en móvil.
- `components/public/public-page/` — `app-public-page`: layout de las páginas internas
  (header, hero con breadcrumb, título y lead, contenido proyectado, footer). Lo usan
  `/servicios`, `/nosotros`, `/preguntas-frecuentes`, `/contacto`, `/legal` y la 404. La home
  no lo usa (no lleva breadcrumb).
- `components/public/service-icon/` — `app-service-icon`: el SVG de cada servicio, compartido
  entre la home y `/servicios`.
- `components/public/rich-text/` — `app-rich-text`: renderiza un `RichText` (ver Contenido).

### Contenido (`content/*.ts`)

| Módulo | Qué contiene |
|---|---|
| `site.ts` | `siteInfo`, `sitePages`, `siteNavLinks`, `breadcrumbFor`, contacto por WhatsApp (`buildWhatsAppLink`), `academicNote` |
| `pages.ts` | `pageMeta`: título, descripción, `path` y `noindex` de cada página (títulos y descripciones únicos) |
| `responsible.ts` | `responsible` (responsable del tratamiento), `resolveRichText`, `isEmptyRichText` |
| `legal-index.ts` | anclas y títulos de los 4 documentos legales y `legalIndex` (índice liviano) |
| `legal.ts` | `legalDocuments`: los 4 documentos completos |
| `contact.ts` | asuntos, pasos, etiquetas, errores y texto de consentimiento del formulario |
| `faq.ts`, `services.ts`, `benefits.ts`, … | contenido de la home y las páginas |

**Frontera del barrel:** `content/index.ts` reexporta `responsible`, `legal-index` y `pages`,
pero no `legal.ts` ni `contact.ts`. Solo `/legal` y `/contacto` los importan directo, así los
textos legales quedan en el chunk lazy de su página y no en el bundle inicial. Un test de
`content.spec.ts` lo verifica.

**`RichText`** es un arreglo de segmentos: texto plano, `{ field, prefix?, suffix? }` (un dato
de `responsible`) o `{ link, label, fragment? }` (enlace interno). `app-rich-text` interpola
cada segmento, nunca usa `innerHTML`. Si el campo no existe en `responsible`, se omite la frase
completa con su prefijo y sufijo; `/legal` no renderiza los ítems que quedan vacíos.

### `/servicios`

Lista los servicios (con `app-service-icon`) y los beneficios por rol, más un CTA secundario
"Contactar" a `/contacto`. Beneficios por rol se muestra aquí, no en la home.

### `/contacto` → WhatsApp

Formulario reactivo (`@angular/forms`): nombre, empresa, correo, teléfono, asunto, mensaje y
casilla de autorización. Nombre, asunto y mensaje son obligatorios, y hace falta correo o
teléfono (validador de grupo `emailOrPhone`). La casilla de consentimiento arranca desmarcada,
es obligatoria (`requiredTrue`) y enlaza a la política de datos de `/legal`. Los errores
aparecen tras enviar o al salir del campo, con `aria-invalid` y `aria-describedby`.

Al enviar, `buildContactMessage` (`components/pages/contacto/contact-message.ts`, función
pura) arma el texto sin los campos opcionales vacíos, y `window.open` abre `wa.me` con el
mensaje prellenado en una pestaña nueva. Se abre sin la feature `noopener` para detectar un
bloqueador de pop-ups (resultado `null`) y el `opener` se corta a mano. Si el navegador
bloquea la pestaña, la confirmación ofrece el enlace directo. La confirmación vive en una
región `aria-live="polite"`.

No hay backend: no se envía nada a un servidor, no se guarda nada en `localStorage` ni
`sessionStorage` y no se loguea nada (los datos son personales).

### `/legal`

Una página con índice y anclas que reúne cuatro documentos:

| Documento | Ancla |
|---|---|
| Política de tratamiento de datos personales (Ley 1581 de 2012, Decreto 1377 de 2013) | `#tratamiento-datos` |
| Aviso de privacidad | `#aviso-privacidad` |
| Términos de uso | `#terminos-uso` |
| Política de cookies y almacenamiento local | `#cookies` |

Arriba del índice van el aviso y la fecha de vigencia. El aviso aclara que KUVU es un proyecto
académico desarrollado en la Universidad Cooperativa de Colombia y que los textos son una base
de referencia, no asesoría legal. La política de cookies describe el almacenamiento que el
sitio usa realmente: el tema (`kuvu-theme` en `localStorage`), la sesión de la app de gestión
(`localStorage`) y la empresa preseleccionada (`empresaPreseleccionada` en `sessionStorage`).

**Empresa ficticia.** KUVU es una empresa ficticia. `content/responsible.ts` publica solo datos
que no pueden pertenecer a un tercero real: razón social `KUVU`, domicilio `Bogotá D.C.,
Colombia`, el teléfono del WhatsApp ya publicado, el área de atención y la fecha de vigencia.
NIT, dirección y correo son campos opcionales del modelo que no se definen, y los textos que
los mencionarían omiten la frase. Consultas y reclamos se canalizan por el formulario de
contacto o el WhatsApp.

### SEO (`services/page-meta.service.ts`)

- `setPage(meta)` publica `title`, `description`, Open Graph (`og:title`, `og:description`,
  `og:type`, `og:url`, `og:locale = es_CO`, `og:image`), Twitter card
  (`summary_large_image`), un único `<link rel="canonical">` y `robots: noindex` solo si
  `meta.noindex` (la 404). Todo se actualiza en su lugar: navegar no duplica tags.
- `setJsonLd(id, data)` / `clearJsonLd(id)` mantienen un `<script type="application/ld+json">`
  por id, escrito con `textContent`. La home publica `Organization` y `WebSite` y los retira
  al salir; el breadcrumb (`setBreadcrumb`) usa el mismo mecanismo.
- URLs absolutas sobre `document.location.origin`. `og:image` es
  `/Imagenes_web/equipo-ycw-1024.jpeg`.
- `src/index.html` trae los meta por defecto de KUVU (title, description, `og:*`,
  `twitter:*`), que son los que leen los crawlers sociales.

### Anclas bajo el header

El router hace el scroll a anclas con `window.scrollTo`, que ignora `scroll-padding-top`.
`app.config.ts` usa `withInMemoryScrolling({ scrollPositionRestoration: 'top',
anchorScrolling: 'enabled' })` y, con `provideAppInitializer`, registra
`ViewportScroller.setOffset(() => headerScrollOffset(document))`. `app/scroll-offset.ts` mide
la altura real de `app-site-header` en cada scroll y le suma 16 px (`ANCHOR_GAP`); si el
header no tiene altura usa 88 px, y en páginas sin header público el offset es 0. Así
`/legal#cookies` deja la sección debajo del header, entrando por URL directa, desde el índice
o desde el footer. El `scroll-padding-top: 88px` de `styles.scss` cubre solo la navegación
nativa a fragmento.

### Lenguaje visual y movimiento

Utilidades globales en `src/styles.scss`: `.section-eyebrow` (número de sección "01", "02"…,
`aria-hidden`), `.link-arrow` (flecha que se desplaza en hover y foco), hover de tarjetas y
`:focus-visible` visible. Todo el movimiento (entradas del menú, flechas, hover de tarjetas,
reveal, transiciones de altura y subrayado del header) está dentro de
`@media (prefers-reduced-motion: no-preference)`; con `reduce` además se anulan las
animaciones de `withViewTransitions`.

## Decisiones

- **Header `sticky`, no `fixed`.** Ocupa su lugar en el flujo, así no hace falta espaciador ni
  tapa el contenido inicial. Tradeoff: las anclas necesitan el offset del `ViewportScroller`.
- **Offset medido en cada scroll, no un valor fijo.** El header cambia de altura al
  compactarse y según el breakpoint. Tradeoff: una consulta al DOM por scroll a ancla.
- **Foco que no vuelve al botón al elegir un enlace.** La página cambia y el foco sigue a la
  navegación; devolverlo al botón de menú lo dejaría en un control que ya no es el contexto.
- **Sin focus trap en el menú móvil.** El panel cubre la pantalla y se cierra con Escape; un
  trap agrega código sin un caso que falle.
- **Contacto por WhatsApp, sin backend.** No hay servidor que proteger ni datos que almacenar.
  Tradeoff: el mensaje viaja en la query de `wa.me` y depende de que el visitante tenga
  WhatsApp; lo acepta con el consentimiento.
- **`RichText` en lugar de HTML en strings.** Los textos legales intercalan datos y enlaces sin
  `innerHTML`. Tradeoff: el contenido legal es más verboso de escribir.
- **Datos del responsable omitidos, no inventados ni marcados.** Un NIT, una dirección o un
  correo inventados podrían pertenecer a un tercero real. Tradeoff: los documentos no son
  adoptables tal cual por una empresa real (lo dice el aviso).
- **`legal.ts` y `contact.ts` fuera del barrel.** Mantienen el bundle inicial bajo el
  presupuesto de 500 kB. Tradeoff: esas dos páginas importan por ruta directa.
- **Meta en `content/pages.ts` + `setPage` en `ngOnInit`, sin `title` de ruta.** Una sola
  fuente testeable (títulos únicos) y el título no diverge de `og:title`.
- **Movimiento con CSS e `IntersectionObserver`**, sin `@angular/animations` ni dependencias
  nuevas.

## Limitaciones conocidas

- **SPA sin prerender:** los meta que fija `PageMetaService` no los ven los crawlers sociales;
  comparten los de `index.html`. El `og:image` de `index.html` es relativo porque no hay
  dominio de producción declarado, y los crawlers necesitan una URL absoluta.
- **Offset al entrar por URL directa:** el offset se calcula con el header todavía en su
  estado inicial (más alto), así que la sección queda unos 16 px más abajo que al navegar con
  el header ya compacto. Siempre queda por debajo del header.
- **Contraste en hover:** el hover de `.origin-link` y `.faq-link` en tema claro (`#6b8e6b`
  sobre `#f6f7f4`) da 3.42 : 1; el estado normal cumple.
- **Política de cookies incompleta al integrar el acceso:** cuando se integre
  `feat/acceso-orden-e-intro`, el estado "intro vista" que esa rama guarda en el navegador
  debe sumarse a la política de cookies y almacenamiento local de `content/legal.ts`.
- **Textos legales de referencia:** no tienen validez jurídica ni son asesoría legal.
- El menú móvil no incluye el acceso por WhatsApp; el footer y `/contacto` lo ofrecen.
- Sin banner de cookies (el sitio no usa cookies de analítica ni de terceros), sin versión en
  inglés, sin redes sociales ni envío de correo desde el formulario.

### Roadmap

- Actualizar `@angular/router` (aviso GHSA-ff3f-86qr-9cv3, DoS que afecta solo a Angular SSR;
  hoy no es alcanzable porque no hay SSR).
- Al definir el hosting, servir con headers de seguridad: `Content-Security-Policy` (el script
  inline de tema de `index.html` necesita hash o nonce), `X-Content-Type-Options: nosniff`,
  `Referrer-Policy: strict-origin-when-cross-origin` y `frame-ancestors 'none'`.
- Con un dominio de producción, volver absoluto el `og:image` de `index.html`.
