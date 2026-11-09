# Arquitectura del proyecto

Esta es la arquitectura de alto nivel de **KUVU (ArrendApp)**: componentes, capas, flujos
principales y decisiones estructurales. La mantiene al día la fase `document` del flujo SDD en
cada cambio que toca la arquitectura. No reemplaza a `docs/{change-name}.md` (que documenta un
cambio puntual): esto es la vista estable del sistema.

## Vista de componentes

| Componente | Rol | Tecnología |
|---|---|---|
| Frontend Angular | Sitio público de marketing + app autenticada de gestión | Angular (standalone, signals), Tailwind CSS v4 |
| Backend API | API REST de la app de gestión (auth, empresas, usuarios, locales, contratos, pagos, mantenimiento) | Node.js + Express |
| Base de datos | Persistencia del backend de gestión | MySQL / MariaDB (`bd_arrendamientos.sql`) |

El frontend es la fuente de verdad observable: el sitio público es contenido estático servido
por la propia SPA (sin API), y la app autenticada hoy consume datos mock (los métodos de
`DataService` conectarán con la API REST del backend).

## Componentes del frontend — dos clústeres

### Clúster público (marketing)

Sitio multipágina con una sola navegación: `/`, `/servicios`, `/nosotros`,
`/preguntas-frecuentes`, `/contacto`, `/legal` y una 404 pública (detalle en
`docs/home-profesional.md`).

- `src/app/content/` — contenido institucional en módulos TS tipados (site, pages,
  responsible, legal-index, legal, contact, services, companies, howItWorks, benefits,
  security, origin, about, faq, team, headlines, logo), fuente única del texto.
  `headlines.ts` declara los titulares partidos para resaltar una parte (`Headline` =
  `title` + `parts`, con a lo sumo un fragmento `accent` o `tape`); un spec garantiza que
  `parts` concatena exactamente `title`. `site.ts` declara
  `sitePages` y `siteNavLinks` (la navegación única) y `pages.ts` los meta de cada página.
  El barrel `content/index.ts` no reexporta `legal.ts` ni `contact.ts`: solo `/legal` y
  `/contacto` los importan, así quedan en su chunk lazy.
- `src/app/components/public/site-header/` y `site-footer/` — chrome compartido. El header
  lee `siteNavLinks`, es `sticky`, se compacta pasados 24 px de scroll y por debajo de
  1024 px muestra un menú a pantalla completa (bloquea el scroll del fondo, cierra con Escape,
  botón, enlace o navegación). El footer tiene columnas marca / Sitio / Legal / Contacto, la
  nota académica y el copyright. El logo tiene 2 variantes (web y responsive) y se alterna por
  viewport con el breakpoint `768px`; el tema no interviene en su selección.
- `src/app/components/public/public-page/` — `app-public-page`: layout de las páginas internas
  (header, hero con breadcrumb, título y lead, `<ng-content>`, footer). Lo usan todas las
  páginas públicas salvo la home.
- `src/app/components/public/rich-text/` — `app-rich-text`: renderiza `RichText` (texto, datos
  de `content/responsible.ts` y enlaces internos) solo por interpolación; un dato ausente se
  omite con su frase.
- `src/app/components/public/service-icon/` — `app-service-icon`: SVG de cada servicio,
  compartido por la home y `/servicios`.
- `frontend/proyecto_angular/public/logo-rediseno/` — los 2 PNG del logo (`Logo_Kuvu.png` web,
  `Logo_Responsive.png` símbolo), con rutas centralizadas en `content/logo.ts`; el favicon de
  `src/index.html` apunta al símbolo como PNG.
- `src/app/components/pages/` — las páginas internas, lazy en `app.routes.ts`: `servicios`,
  `nosotros`, `preguntas-frecuentes`, `contacto` (formulario que abre WhatsApp, sin backend ni
  almacenamiento), `legal` (4 documentos con índice y anclas) y `not-found` (404 con
  `noindex`).
- `src/app/components/home/` — la home como escaparate: hero + resúmenes que derivan a cada
  página, header y footer compartidos, JSON-LD `Organization` + `WebSite`. Provee
  `ScrollMotionService` para sus efectos ligados al scroll. Las secciones con estructura y
  movimiento propios son componentes con selector de atributo sobre su `<section>`:
  `hero/` (`app-home-hero`), `steps-journey/` (recorrido sticky de "¿Cómo funciona?"),
  `companies-marquee/` (cinta de marca en bucle, con nombres en display y botón de pausa) y
  `team-band/`; además, `scroll-progress/` (barra de progreso de lectura). `_section-heading.scss`
  comparte `.container`, `.section-title` (titular display) y `.section-lead` entre la home y
  esas secciones. Cada sección usa una composición propia (manifiesto tipográfico, statement,
  recorrido sticky, bento, lista sobre trama, cinta, foto en marco, editorial, CTA en bloque de
  marca); detalle en `docs/sitio-publico-expresivo.md`. Detalle en
  `docs/home-animaciones.md`.
- `src/app/services/theme.service.ts` — tema claro/oscuro persistido en `kuvu-theme`.
- `src/app/services/page-meta.service.ts` — `setPage(meta)`: title, description, Open Graph,
  Twitter card, un único canonical y `robots: noindex` cuando corresponde, todo actualizado en
  su lugar. `setJsonLd(id, data)`/`clearJsonLd(id)`: un `<script type="application/ld+json">`
  por id, escrito con `textContent`; `setBreadcrumb`/`clearBreadcrumb` (`BreadcrumbList`) se
  apoyan en él.
- `src/app/scroll-offset.ts` — `headerScrollOffset(doc)`: altura real de `app-site-header` +
  16 px (88 px si no tiene altura, 0 sin header público). `app.config.ts` lo registra con
  `provideAppInitializer` como offset del `ViewportScroller`, junto a
  `withInMemoryScrolling({ scrollPositionRestoration: 'top', anchorScrolling: 'enabled' })`:
  las anclas (`/legal#cookies`) quedan debajo del header sticky. El router hace ese scroll con
  `window.scrollTo`, que ignora `scroll-padding-top`.
- `src/app/components/public/breadcrumb/` — `app-breadcrumb`: "Inicio › {Página}" en el hero
  de `app-public-page`. Los ítems salen de `breadcrumbFor(href)` (`content/site.ts`, sobre
  `sitePages`). El componente publica el JSON-LD al montarse y lo retira al destruirse.
- `src/app/directives/reveal.directive.ts` — reveals `[data-reveal]` (fade-up) y
  `[data-reveal="clip"]` (apertura con `clip-path`) con `IntersectionObserver` y respeto de
  `prefers-reduced-motion`.
- `src/app/motion/` — piezas de movimiento reutilizables, sin dependencias:
  `motion-preferences.ts` (única fuente en TS de las media queries de reduced motion, puntero
  fino y desktop ≥ 1024 px, con emisión de cambios), `ScrollMotionService` (bucle único de
  scroll con rAF e `IntersectionObserver`, no `providedIn: 'root'`), `[appScrollProgress]`
  (publica `--p`), `<app-split-text>` (texto por palabra con copia accesible) y `[appMagnetic]`
  (publica `--mx` / `--my`). `motion/testing/` tiene los dobles de `matchMedia`,
  `requestAnimationFrame` e `IntersectionObserver` para specs.
- `src/styles/_site.scss` — primitivas visuales del sitio público, incluidas por
  `styles.scss`: `.site-root` (raíz de la home y de `app-public-page`: cuerpo fluido y grano
  fijo decorativo), `.surface-dots`, `.surface-tint`, `.block-brand` (texto en el alias
  `--color-on-brand`), `.display-title(--xl|l|m)`, `.tape`, `.lead-site`, `.btn-site(--ghost)`,
  `.site-section(-head)` y `.site-cta`. Tipografía display: Big Shoulders Display
  autohospedada (`public/fonts/`, `@font-face` en `styles.css`) en `--font-display`, con la
  escala fluida `--text-display-xl/l/m`, `--text-lead` y `--text-body-site` en `@theme static`.
- `src/app/components/public/headline/` — `<app-headline [parts] [title]>`: contenido en línea
  de un titular partido (`em` para `accent`, `.tape` para `tape`), con el texto una sola vez en
  el DOM. Lo usan el hero, los títulos de la home, `app-public-page` (`titleParts`) y Nosotros.
- `src/styles/_motion.scss` — tokens de movimiento en `:root` (curvas, duraciones, distancias),
  incluidos por `styles.scss`, que también define las reglas globales de reveal, `.hover-lift`,
  `.magnetic`, la transición `html.vt-public` y `html.smooth-anchors`.
- `src/app/route-view-transition.ts` — hook `onViewTransitionCreated` del router
  (`onRouteViewTransition`): compone el salteo de la intro (`intro-view-transition.ts`) con la
  transición entre dos rutas públicas, marcadas con `data: { publicSite: true }` en
  `app.routes.ts`. El flag es de presentación y no interviene en autorización.
- `src/app/anchor-smooth-scroll.ts` — initializer: scroll suave solo mientras el router lleva a
  un ancla de la misma página pública.
- `frontend/proyecto_angular/public/Imagenes_web/` — imágenes del sitio público en variantes
  responsive `{nombre-base}-{ancho}.{webp|jpeg}` (640/1024/1536 y, con
  `--keep-original-as-max`, el ancho original), generadas con
  `scripts/generate-image-variants.py` (Python + Pillow, fuera del build). Cada imagen se declara
  como `SiteImage` en `content/`: `content/team.ts` declara las tres fotos del equipo
  (`TeamSection.photos`, `equipo-kuvu-1|2|3`, verticales 3:4, `alt` sin nombres).
- `src/app/components/public/responsive-image/` — `app-responsive-image`: renderiza un
  `SiteImage` como `<picture>` (WebP + respaldo JPEG, `srcset`/`sizes`, `width`/`height`,
  `loading="lazy"`), con modos `contain`/`cover` y `decorative`.
- `src/app/components/home/team-band/` — sección "El equipo detrás de KUVU" de la home (selector
  de atributo sobre `<section id="equipo">`): la foto destacada (`photos[0]`) en un marco girado
  junto al titular, los nombres y el enlace a Nosotros. `/nosotros` muestra las tres fotos en
  una galería asimétrica dentro de un `<figure>`.

### Clúster autenticado (app de gestión)

- `components/landing/` (`/acceder`) — selección de inmobiliaria (empresas en orden de `id`),
  orquesta la intro.
- `components/shared/auth-intro/` — intro "hoja que pasa" (~2,9 s, CSS 3D con 6 franjas anidadas,
  salto por clic/teclado/botón). Detalle en `docs/acceso-orden-e-intro.md`.
- `src/app/intro-view-transition.ts` — `skipViewTransitionIntoIntro`: saltea el cross-fade de
  View Transitions al entrar a `/acceder` con la intro pendiente. Lo invoca
  `onRouteViewTransition` (`route-view-transition.ts`), registrado en el router.
- `components/login/` (`/login`) — credenciales de la empresa seleccionada (correo + documento).
- `components/dashboard|locales|contratos|pagos|mantenimiento|usuarios/` — módulos de gestión,
  lazy, protegidos por `authGuard`/`adminGuard`.
- `services/auth.service.ts`, `data.service.ts`, `intro-state.service.ts` — sesión, datos
  (mock) y estado de la intro (recordada por pestaña en `sessionStorage['kuvu.intro.seen']`).
- `services/page-turn-sound.service.ts` — sonido de la intro sintetizado con Web Audio, sin
  archivos; no crea contexto sin un gesto previo del usuario.

## Capas

- **Frontend standalone**: cada componente declara sus imports; no hay NgModules. Los datos
  viven en servicios (`providedIn: 'root'`) y los textos del sitio público en módulos de
  contenido puros sin estado.
- **Backend Express**: capa de rutas (`routes/{auth,empresas,usuarios,locales,contratos,pagos,mantenimiento}.js`)
  sobre `db.js` (mysql2). API REST JSON bajo `/api/*`, CORS habilitado para el frontend.

## Flujos principales

### Navegación pública

```
Visitante → SPA →
  '/'                     → HomeComponent (eager; resúmenes + JSON-LD Organization/WebSite)
  '/servicios'            → ServiciosComponent (lazy)
  '/nosotros'             → NosotrosComponent (lazy)
  '/preguntas-frecuentes' → PreguntasFrecuentesComponent (lazy)
  '/contacto'             → ContactoComponent (lazy) → wa.me en pestaña nueva
  '/legal'                → LegalComponent (lazy; #tratamiento-datos, #aviso-privacidad,
                                                  #terminos-uso, #cookies)
  '**'                    → NotFoundComponent (lazy, noindex)
  cada página → PageMetaService.setPage(pageMeta[página]) en ngOnInit
```

Todas renderizan `SiteHeader` + `SiteFooter` (las internas a través de `app-public-page`); los
reveals se disparan por IntersectionObserver. Entre dos rutas públicas, la View Transition
deja el header quieto y desliza solo el contenido (`html.vt-public`); hacia `/acceder`,
`/login` o la app autenticada se mantiene el cross-fade por defecto (o el salteo de la intro).
Las páginas internas muestran `app-breadcrumb`
arriba del `h1`, que mientras está montado mantiene un único `BreadcrumbList` en `<head>` con
URLs absolutas sobre `location.origin`. Al cambiar de página el scroll vuelve arriba de forma
instantánea; un fragmento lleva a su sección con el offset de `scroll-offset.ts`, con scroll
suave si es un ancla de la misma página y no hay reduced motion.

### Acceso autenticado

```
Usuario → '/acceder' (lazy; intro la primera vez en la pestaña → selección de empresa) → '/login' (correo + documento, lazy)
  → dashboard / contratos / pagos / mantenimiento (/ locales, /usuarios si admin)
```

Las rutas de gestión pasan por `authGuard` (cualquier rol) y, locales/usuarios, por
`adminGuard` (idRol === 1). Los guards y el login navegan a `/login` de forma explícita; el
comodín `**` muestra la 404 pública y no forma parte del flujo de acceso.

## Decisiones estructurales

- **Contenido del sitio en módulos TS tipados** (`content/*.ts`) en lugar de texto embebido.
  Tradeoff: un cambio de copy toca código, pero el texto queda testeable y reutilizable entre
  la home y las páginas (el FAQ corto es subconjunto del completo).
- **Chrome compartido del sitio** (header/footer/theme/reveal) con una sola navegación por
  rutas (`siteNavLinks`), sin anclas ni input en el header, y `app-public-page` como layout
  de las páginas internas. Tradeoff: la home no usa el layout (no lleva breadcrumb) y monta
  header y footer por su cuenta.
- **Meta por página en `content/pages.ts`** aplicados con `setPage` en `ngOnInit`, sin `title`
  de ruta. Tradeoff: cada página debe llamar al servicio, a cambio de una fuente única
  testeable (títulos y descripciones únicos) donde `title` y `og:title` no divergen.
- **Offset de anclas medido en runtime** (`scroll-offset.ts` + `ViewportScroller.setOffset`)
  en lugar de un valor fijo: el header sticky cambia de altura al compactarse y por
  breakpoint. Tradeoff: una medición del DOM por cada scroll a ancla.
- **Contacto sin backend**: el formulario arma el mensaje y abre WhatsApp; no hay endpoint,
  almacenamiento ni logs de los datos. Tradeoff: depende de que el visitante use WhatsApp.
- **Rutas del sitio público lazy** (`loadComponent`), también `/acceder`, `/login` y la 404;
  solo la home es eager. Tradeoff: un poco de latencia al navegar; no se paga el bundle de
  las páginas en la home.
- **Tema oscuro por clase `.dark`** (no `prefers-color-scheme`): el toggle es manual y se
  persiste en `localStorage`; `index.html` aplica la clase antes del bootstrap para evitar el
  flash.
- **Logo multi-variante con swap por CSS+TS**: dos `<img>` por punto de marca con `[src]`
  bindeado al tema y visibilidad resuelta en el breakpoint `768px`. Tradeoff: duplica el
  markup del logo en header y footer (2 usos, se revisa ante un tercero) a cambio de no
  pagar `<picture>`/`srcset` ni recarga al alternar tema.
- **Imágenes responsive con `<picture>` + contenido tipado** (`SiteImage` + `app-responsive-image`)
  en lugar de `NgOptimizedImage` o `background-image`: formato y ancho por `<source>`/`srcset`,
  lazy nativo, `alt` real y testeable. Tradeoff: las variantes se generan a mano con un script y
  la declaración en `content/` debe coincidir con los anchos generados. El logo mantiene su
  patrón propio (swap por viewport), porque su variante depende del breakpoint, no del ancho.
- **Tokens de marca en `@theme static`**: `src/styles.css` declara los tokens del sitio público
  (`--color-brand-*`, `--color-home-*`, `--radius-*`) en un bloque `@theme static`, así que
  Tailwind v4 los emite siempre en `:root`, aunque ninguna utilidad los use. El bloque `.dark`
  (sin capa, gana sobre `@layer theme`) redefine `brand-100/500/600` y los `home-*`; el resto
  conserva el valor claro en los dos temas. Los componentes los consumen con `var(--token)`, sin
  fallback literal, y sus nombres pueden escribirse en `.ts`/`.html`. Tradeoff: los 15 tokens
  viajan siempre en el CSS global (~0,3 kB), a cambio de una sola fuente de valores. Un token
  nuevo de marca va en ese bloque.
- **Display autohospedada, sin `@import` de Google**: la fuente de titulares es un woff2 de
  `public/` con `@font-face` global y sin `preload`. No se incrusta en el CSS (no suma al
  warning `css-inline-fonts`) y solo se descarga en las páginas que la usan; `/acceder`, `/login`
  y la app interna nunca la piden. Tradeoff: el `swap` puede mover líneas al llegar la fuente
  (respaldo angosto para acotarlo).
- **"Ingresar" conserva el azul de la app** (`.btn-primary`, `--color-primario` →
  `--color-secundario`) como excepción explícita al acento verde único del sitio: es el puente
  visual hacia la app. El resto de los CTAs usa `.btn-site`.
- **Movimiento: JS mide, CSS anima.** El JS solo publica variables CSS (`--p`,
  `--page-progress`, `--mx` / `--my`) y toda la presentación vive en CSS dentro de
  `prefers-reduced-motion: no-preference` (y de `width >= 1024px` o puntero fino según el
  efecto); el estado base es estático. El movimiento ligado al scroll vive en un
  `ScrollMotionService` que provee el componente que lo usa (la home), así que salir de ella
  libera listeners, observer y frame. Tradeoff: `[appScrollProgress]` necesita un ancestro que
  provea el servicio. Se eligió JS + rAF sobre `animation-timeline` de CSS por soporte desigual
  en Safari y Firefox; el CSS ya consume `--p`, así que la migración no toca estilos.
- **Sin `@apply` en los estilos de la home y sus secciones**: Tailwind v4 expande cada
  `@apply` con fallbacks y un bloque `@layer properties` por componente, y la home es eager
  (va en el bundle inicial). Tradeoff: valores literales en lugar de utilidades.
- **Sitio público sin API**: textos estáticos en el bundle. Tradeoff: el contenido no cambia
  sin redeploy; nada que proteger expuesto ni latencia de red en el sitio.
- **Breadcrumb visual y JSON-LD desde una sola fuente**: `app-breadcrumb` recibe los ítems y
  los publica vía `PageMetaService`. Tradeoff: un componente presentacional escribe en
  `<head>`, a cambio de que el visual y los datos estructurados no puedan divergir.
- **Botones primarios con gradiente global**: los botones "Ingresar" del hero, el header y
  `cta-final` toman el gradiente de `.btn-primary` (`--color-primario` → `--color-secundario`)
  con texto blanco. El de `cta-final` da 4.72 : 1 en el extremo claro (`#3A6FD8`): aclarar
  `--color-secundario` lo baja de 4.5 : 1.

## Límites y no-goals

- El sitio público no consume backend: el contacto es un formulario que abre WhatsApp, sin
  envío a servidor ni correo. No hay blog, precios, multilingüismo, banner de cookies ni
  SSR/prerender.
- KUVU es una empresa ficticia de un proyecto académico de la Universidad Cooperativa de
  Colombia: `/legal` omite NIT, dirección y correo, y sus textos son una base de referencia
  sin validez jurídica.
- Sin prerender, los crawlers sociales solo leen los meta por defecto de `index.html`, cuyo
  `og:image` es relativo mientras no haya dominio de producción.
- No hay configuración de hosting en el repo: los headers de seguridad (CSP con hash o nonce
  para el script inline de tema, `nosniff`, `Referrer-Policy`, `frame-ancestors`) se definen
  al elegirlo.
- La app autenticada usa datos mock en `DataService`; la conexión a la API REST es trabajo
  pendiente.
- La seguridad del contenido es solo descriptiva: no se publican mecanismos internos.
- Deuda registrada: `pagos.component.ts` usa `document.write` (work item de seguridad
  dedicado).
- El JSON-LD del breadcrumb usa el origen donde corre la app: sin dominio de producción, las
  URLs son locales. No hay SSR, así que el JSON-LD existe después del render en el cliente.
- Deuda registrada: actualizar `@angular/*` a ≥ 21.2.24, incluido `@angular/router`
  (GHSA-ff3f-86qr-9cv3, DoS solo en SSR, no alcanzable hoy; prioridad alta si se agrega SSR).