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
  security, origin, about, faq, team, logo), fuente única del texto. `site.ts` declara
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
  página, header y footer compartidos, JSON-LD `Organization` + `WebSite`.
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
- `src/app/directives/reveal.directive.ts` — reveals `[data-reveal]` con
  `IntersectionObserver` y respeto de `prefers-reduced-motion`.
- `frontend/proyecto_angular/public/Imagenes_web/` — imágenes del sitio público en variantes
  responsive `{nombre-base}-{ancho}.{webp|jpeg}` (640/1024/1536), generadas con
  `scripts/generate-image-variants.py` (Python + Pillow, fuera del build). Cada imagen se declara
  como `SiteImage` en `content/` (hoy: `content/team.ts`, la foto del equipo YCW).
- `src/app/components/public/responsive-image/` — `app-responsive-image`: renderiza un
  `SiteImage` como `<picture>` (WebP + respaldo JPEG, `srcset`/`sizes`, `width`/`height`,
  `loading="lazy"`), con modos `contain`/`cover` y `decorative`.
- `src/app/components/home/team-band/` — banda full-bleed "El equipo detrás de KUVU" de la home
  (selector de atributo sobre `<section id="equipo">`); `/nosotros` muestra la misma foto como
  `<figure>`.

### Clúster autenticado (app de gestión)

- `components/landing/` (`/acceder`) — selección de inmobiliaria, orquesta la intro.
- `components/login/` (`/login`) — credenciales de la empresa seleccionada (correo + documento).
- `components/dashboard|locales|contratos|pagos|mantenimiento|usuarios/` — módulos de gestión,
  lazy, protegidos por `authGuard`/`adminGuard`.
- `services/auth.service.ts`, `data.service.ts`, `intro-state.service.ts` — sesión, datos
  (mock) y estado de la intro.

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
reveals se disparan por IntersectionObserver. Las páginas internas muestran `app-breadcrumb`
arriba del `h1`, que mientras está montado mantiene un único `BreadcrumbList` en `<head>` con
URLs absolutas sobre `location.origin`. Al cambiar de página el scroll vuelve arriba; un
fragmento lleva a su sección con el offset de `scroll-offset.ts`.

### Acceso autenticado

```
Usuario → '/acceder' (selección de empresa, lazy) → '/login' (correo + documento, lazy)
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
- **Tokens de Tailwind v4 solo usados en componentes no existen en runtime**: Tailwind emite al
  CSS global únicamente los tokens de `@theme` cuyo nombre encuentra en los archivos que escanea.
  En modo claro faltan `--color-home-*`, `--radius-*` y `--color-brand-100/200/300/600`, y
  `--color-brand-700` se emite solo de forma incidental (ver el patrón `var(--token, valor)` más
  abajo). Un componente que depende de uno de ellos lo referencia con fallback literal, en una
  custom property local (`--team-band-green: var(--color-brand-700, #2f4a2f)` en `team-band`) o
  en la propia declaración (fondo de `cta-final`). Tradeoff: el valor se repite en cada punto, a
  cambio de no alterar los CTA del hero y del header, que no llevan fallback y se ven con el
  gradiente de `.btn-primary`.
- **Sitio público sin API**: textos estáticos en el bundle. Tradeoff: el contenido no cambia
  sin redeploy; nada que proteger expuesto ni latencia de red en el sitio.
- **Patrón `var(--token, valor)` para tokens de marca en estilos de componentes**: Tailwind v4
  emite una variable de `@theme` solo si encuentra su nombre en los archivos que escanea
  (`.ts`/`.html`), y los usos en SCSS de componentes no cuentan. En modo claro el build emite
  `--color-brand-700` (porque su nombre figura en un archivo escaneado) y `--color-brand-500`,
  pero no `--color-home-*`, `--radius-*` ni el resto de `--color-brand-*`. La banda `cta-final`,
  `team-band` y `app-breadcrumb` declaran fallback literal. Los nombres de tokens no se
  escriben en `.ts`/`.html`: los tests los arman por partes. Tradeoff: el valor se repite en
  cada punto que lo necesita, a cambio de no cambiar el aspecto del resto de la home.
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