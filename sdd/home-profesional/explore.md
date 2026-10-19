# Explore — home-profesional

**Cambio:** elevar el sitio público de KUVU (home y páginas públicas) a un nivel más
profesional en estructura, navegación, animaciones, apartados de contenido y páginas legales,
tomando como referencia de patrones (no de marca ni textos) a https://actitudtravelcolombia.com/.

**No-objetivo explícito del pedido:** la parte administrativa (dashboard, locales, contratos,
pagos, mantenimiento, usuarios) y el flujo de acceso (`/acceder`, `/login`).

**Contexto de stack:** `sdd/sdd-init.md` + `sdd/sdd.config.md` — Angular 21 standalone +
Tailwind v4 / SCSS, sin librerías de animación (solo `@angular/animations` instalado). Tests:
Karma/Jasmine (`test-after`, declarado en config). Artifacts en archivos.

**Base de trabajo:** rama `feat/home-profesional`, creada desde `main` (a94a5f9). Verificado
contra `main`: el commit 2058d41 de `feat/acceso-orden-e-intro` no toca ningún archivo del
sitio público (home, `public/*`, `content/*`, `app.routes.ts`, `index.html`, `styles.scss`);
solo toca `/acceder`, `auth-intro`, `intro-state.service`, `page-turn-sound.service` (no
existe en `main`), `backend/routes/empresas.js` y la config SDD. Nada de este explore depende
de ese commit. Diferencia que sí importa: en `main`, `sdd/sdd.config.md` declara el stack
"Node.js backend / PostgreSQL" y los slices `contenido`, `chrome`, `home-expandida`,
`paginas`, `cierre` (los de `feat/acceso-orden-e-intro` son otros). Este cambio usa la config
de `main`; `test-after` está declarado en ambas.

---

## 1. Lo que KUVU tiene hoy en el sitio público

### Rutas públicas (`frontend/proyecto_angular/src/app/app.routes.ts`)

| Ruta | Componente | Rol |
|---|---|---|
| `/` | `HomeComponent` | Home de una sola página con anclas |
| `/nosotros` | `NosotrosComponent` (lazy) | Página interna con breadcrumb + JSON-LD |
| `/preguntas-frecuentes` | `PreguntasFrecuentesComponent` (lazy) | Página interna con breadcrumb |
| `/acceder`, `/login` | Landing / Login | Fuera de alcance |
| `**` | redirige a `/login` | Una URL pública inexistente cae en el login (no hay 404) |

### Home (`components/home/home.component.html`, 188 líneas; `.scss` 458 líneas)

Secciones en orden: Hero (texto + botón "Ingresar", sin imagen) → ¿Qué es KUVU? (párrafo) →
¿Cómo funciona? (4 pasos numerados) → Servicios (5 filas con ícono SVG) → Beneficios por rol
(tarjetas) → Seguridad y soporte (lista) → Compañías que confían (nombres en texto) → Equipo
(banda full-bleed con foto, `team-band`) → Origen de KUVU → FAQ corto (enlace a la página) →
CTA final ("Ingresar") → Footer.

Todo el texto vive en módulos tipados `content/*.ts` (RNF-14): `site.ts`, `about.ts`,
`benefits.ts`, `companies.ts`, `faq.ts`, `howItWorks.ts`, `origin.ts`, `security.ts`,
`services.ts`, `team.ts`, `logo.ts`, `types.ts`, con `content.spec.ts`.

### Header (`components/public/site-header/`)

- Barra estática con logo (dos variantes responsive), nav, botón "Ingresar", ícono WhatsApp y
  toggle de tema claro/oscuro.
- En la home la nav son **7 anclas a secciones** (`navLinks` en `content/site.ts`: Inicio, Qué
  es KUVU, Cómo funciona, Servicios, Beneficios, Seguridad, Compañías). En páginas internas usa
  `pageNavLinks` (Inicio, Nosotros, Preguntas frecuentes). Las dos navs son distintas según la
  página.
- Móvil: hamburguesa que muestra/oculta un drawer (sin bloqueo de scroll, sin cierre con
  Escape, sin animación de entrada).
- No cambia al hacer scroll (sin header compacto ni ocultamiento).

### Footer (`components/public/site-footer/`)

Logo + nombre + tagline, nav (Inicio, Nosotros, Preguntas frecuentes, Acceso), CTA WhatsApp y
copyright "© {año} KUVU · YCW". **No hay** enlaces legales, correo, redes sociales, ni
identificación de la empresa.

### Animaciones y microinteracciones existentes

- `directives/reveal.directive.ts` + `styles.scss`: scroll-reveal con `IntersectionObserver`
  (threshold 0.15), escalonado por `--reveal-index`, respeta `prefers-reduced-motion` (RNF-03).
  Es la única animación de la home.
- Hover básicos en botones/links. No hay carruseles, contadores, parallax, transiciones de
  ruta, ni animación de hero.

### SEO y confianza

- `index.html`: `<title>` y `meta description` genéricos ("Gestión de arriendos"); sin Open
  Graph, Twitter card, canonical ni `lang`-alternates. Favicon PNG.
- `services/page-meta.service.ts`: `setPage(title, description)` y `BreadcrumbList` JSON-LD
  en las páginas internas. La home no publica JSON-LD de `Organization`/`WebSite`.
- SPA sin SSR/prerender: los crawlers reciben el `index.html` vacío.

### Almacenamiento en el navegador (relevante para la política de cookies)

No hay cookies propias ni analítica/terceros. En `main` se usa `localStorage` para tema
(`kuvu-theme`) y sesión (`auth.service.ts`: `empresa_id`, `usuario`, `empresa`), y
`sessionStorage` para la empresa preseleccionada. `intro-state.service.ts` guarda la intro
vista solo en memoria. Todo es almacenamiento técnico o de preferencia.

Nota: en `feat/acceso-orden-e-intro` (commit 2058d41) la intro vista se persiste en
`localStorage`; cuando esa rama se integre, la política de cookies suma esa entrada.

### Documentos de requisitos del repo (sin trackear)

- `docs/KUVU-Requerimientos.docx`: RF-01..RF-04 definen el sitio público actual (home,
  Nosotros, FAQ, WhatsApp, tema). RNF-01 (un solo CTA principal por pantalla), RNF-03
  (reduced motion), RNF-04 (lazy loading de páginas secundarias), RNF-14 (textos en
  `content/*.ts`), RNF-15 (todo cambio con tests).
- `docs/KUVU-Mapa-Experiencia-Usuario.xlsx` (etapas Descubrimiento/Evaluación): dolores "no hay
  precios ni demo visible", "no hay formulario de contacto, solo WhatsApp", "la seguridad se
  describe de forma general"; oportunidades "demo guiada o video corto", "casos de uso o
  testimonios", "detallar cómo se protegen los datos por empresa", "ampliar el FAQ con costos,
  soporte y migración de datos".

### Archivos relevantes

| Archivo | Rol |
|---|---|
| `src/app/app.routes.ts` | Rutas públicas; aquí entran páginas nuevas y el 404 |
| `src/app/components/home/home.component.{html,scss,ts,spec.ts}` | Home |
| `src/app/components/home/team-band/*` | Banda de equipo |
| `src/app/components/public/site-header/*` | Header público |
| `src/app/components/public/site-footer/*` | Footer público |
| `src/app/components/public/breadcrumb/*`, `responsive-image/*` | Piezas públicas reutilizables |
| `src/app/components/pages/nosotros/*`, `preguntas-frecuentes/*` | Páginas internas (patrón a seguir para páginas nuevas) |
| `src/app/content/*.ts` + `content.spec.ts` | Todo el contenido del sitio |
| `src/app/directives/reveal.directive.ts`, `src/styles.scss` | Scroll-reveal global |
| `src/app/services/page-meta.service.ts` | Title/description/JSON-LD |
| `src/app/services/theme.service.ts` | Tema claro/oscuro |
| `src/index.html` | Meta base, favicon, tema pre-bootstrap |
| `public/Imagenes_web/` | Imágenes del sitio: solo la foto del equipo (`equipo-ycw-{640,1024,1536}.{jpeg,webp}`) |

Datos de contacto en el repo: solo el número de WhatsApp (`content/site.ts`). No hay correo,
redes sociales, razón social, NIT ni domicilio.

---

## 2. Análisis del sitio de referencia (actitudtravelcolombia.com)

Lectura hecha sobre el HTML servido (`/` y `/es`), los bundles de sus islas JS/CSS, y las
páginas `/es/nosotros`, `/es/contacto` y `/es/legal`. Todas se pudieron leer. Lo que no se
puede confirmar sin navegador real: tiempos exactos de easing de cada hover y el
comportamiento visual del mapa interactivo.

### Stack y enfoque técnico

Astro 7 + Tailwind + islas React (`client:load/idle/visible`): solo hidratan el slider del
hero, la nav, el carrusel de sellos, el mapa de regiones y el buscador paso a paso. Sin
librerías de animación (ni GSAP, AOS, Swiper, Framer): todo es CSS (transiciones Tailwind,
`@keyframes`) + `IntersectionObserver`/`requestAnimationFrame`. Tipografía de dos familias
(serif display "Fraunces" para títulos + sans "Instrument Sans" para UI) cargada con
`preconnect`. Bilingüe ES/EN.

### Estructura y navegación (multipágina)

- **Nav por páginas, no por anclas**: Nosotros · Servicios (desplegable con 5 subpáginas, una
  por servicio) · Sostenibilidad · Contacto · selector de idioma. Cada servicio tiene su propia
  página y URL.
- **Home** = escaparate que resume y deriva a páginas: hero slider → 5 servicios numerados
  `01–05` con CTA "Solicitar propuesta" (prellena el asunto del formulario vía
  `?asunto=`) y "Explorar servicios" → mapa interactivo por regiones → carrusel de categorías →
  bloque "¿A dónde vamos?" (buscador guiado por preguntas) → 4 pilares de valor → footer.
- **Etiquetas de sección numeradas** ("02", "03") en mayúsculas con tracking amplio sobre
  títulos grandes en serif: es lo que da sensación editorial/ordenada.
- **Página Nosotros**: hero con foto + titular + CTA → misión/visión ("Lo que hacemos" / "Hacia
  dónde va") → proceso en 3 pasos numerados → banda de imagen con parallax → principios de
  trabajo → CTA de cierre.
- **Página Contacto**: hero parallax → intro → formulario (asunto desplegable, nombre, correo
  *o* teléfono, fechas opcionales, mensaje) que al enviar abre WhatsApp con los datos
  prellenados → bloque "Qué pasa cuando envías" (3 pasos).
- **Página Legal única** `/legal` con índice numerado y anclas por sección.

### Header

- Header transparente posicionado sobre el hero; al pasar `scrollY > 150` aparece una **barra
  fija compacta** (`translate-y-full → 0`, fondo crema 95 % + `backdrop-blur`).
- Menú a **pantalla completa** con ítems que entran escalonados (`translate-y-8 → 0`), cierre
  con `Escape`, **bloqueo del scroll del body** y `aria-expanded`.
- Enlace activo resaltado; anillo `:focus-visible` de marca en todo el sitio.

### Animaciones y microinteracciones

| Patrón | Cómo lo hace | Reduced motion |
|---|---|---|
| Hero slider de pantalla completa (`100dvh`) | Crossfade de opacidad 900 ms entre 5 imágenes, autoplay cada 6 s, **pausa en hover/foco**, texto del slide con fade 500 ms, **barra de progreso** del slide (`@keyframes hero-avance` 6 s) | Sí: desactiva autoplay y animaciones |
| Ken Burns en la imagen activa | `@keyframes hero-ken` 14 s `scale(1.06→1.14)` + leve translate | Sí |
| Degradado sobre imagen | `linear-gradient` oscuro de abajo hacia arriba para legibilidad del texto | — |
| Carrusel horizontal | `scroll-snap-x mandatory` + `snap-center`, flechas que hacen `scrollBy` suave, flechas se deshabilitan en los extremos, indicador de progreso | Nativo |
| Separador con parallax | Banda de imagen full-bleed entre secciones | — |
| Hover de tarjetas/links | Flecha `→` que se desplaza (`group-hover:translate-x-1`), `scale-105`, cambios de color, `drop-shadow`; duraciones 300/500/700 ms | — |
| Imágenes | `<picture>` AVIF + WebP + `srcset`, primera eager/`fetchpriority=high`, resto lazy (18 lazy en la home) | — |
| Impresión | `@media print` oculta nav y footer | — |

No hay contadores animados, testimonios, newsletter, botón flotante de WhatsApp ni banner de
cookies.

### Footer

Fondo oscuro, bloque de marca (nombre + descripción), columna **"Legal y compromisos"** con 8
enlaces a anclas de `/legal`, columna **Contacto** (correo), copyright y crédito del
desarrollador. Íconos de redes como enlaces vacíos (`#`).

### Páginas legales (`/legal`)

Índice numerado + secciones: tratamiento de datos personales, términos de reservas, trata de
personas, protección de menores, turismo responsable, cookies, proyección social. Muestra
"última actualización" y aclara que está sujeto a revisión jurídica.

Debilidades observadas (para **no** replicarlas): la sección de datos no cita la **Ley 1581 de
2012** ni el **Decreto 1377 de 2013** (hoy compilado en el Decreto 1074 de 2015), no identifica
formalmente al responsable del tratamiento (NIT, dirección, canal), no detalla finalidades ni
el procedimiento y plazos de consultas/reclamos, ni la vigencia; la política de cookies no
clasifica tipos ni ofrece mecanismo de consentimiento; el formulario de contacto **no tiene
casilla de autorización de tratamiento de datos**; los enlaces "Privacidad" y "Términos" del
pie apuntan a `#`.

### SEO y confianza

`title`/`description` por página, `canonical`, `hreflang` es/en/x-default, Open Graph
(`og:locale es_CO`) y `twitter:card`. Sin JSON-LD. Señales de confianza basadas en contenido
(principios explícitos, compromisos, páginas legales visibles), no en logos ni certificaciones.

---

## 3. Gap analysis — qué tiene la referencia y KUVU no, y qué es adaptable

Prioridad: **A** = alto impacto en percepción profesional y bajo riesgo; **B** = valioso,
esfuerzo medio; **C** = opcional o depende de decisiones/insumos.

| # | Gap | En la referencia | En KUVU hoy | Adaptación a KUVU | Prio |
|---|---|---|---|---|---|
| 1 | Páginas legales | `/legal` con índice y anclas | No existen | Política de tratamiento de datos personales conforme a Ley 1581/2012 y Decreto 1377/2013 (responsable, finalidades, derechos del titular, procedimiento de consultas 10 días hábiles / reclamos 15 días hábiles, canal, vigencia), aviso de privacidad, términos y condiciones de uso de la plataforma, política de cookies/almacenamiento local (técnico y de preferencia, sin analítica). Hacerlo **mejor** que la referencia | A |
| 2 | Footer completo | Columnas marca / legal / contacto, fondo oscuro | 1 fila de links + WhatsApp | Columnas: marca + descripción · Producto (secciones/páginas) · Legal · Contacto (WhatsApp, correo) · redes si existen; copyright | A |
| 3 | Header con comportamiento al scroll | Transparente sobre hero → barra fija compacta con blur tras 150 px | Estático | Header sticky que se compacta/gana fondo con blur al hacer scroll; enlace/sección activa resaltada | A |
| 4 | Menú móvil pro | Pantalla completa, ítems escalonados, Escape, scroll lock | Drawer simple | Overlay con entrada escalonada, `Escape`, bloqueo de scroll, foco gestionado | A |
| 5 | Lenguaje visual editorial | Etiquetas de sección numeradas (`01`, `02`) en mayúsculas + títulos grandes, CTA con flecha animada | Títulos simples | Eyebrow numerado por sección, jerarquía tipográfica más marcada, CTAs con flecha `→` y hover | A |
| 6 | Hero con imagen y movimiento | Slider 100dvh, crossfade, Ken Burns, barra de progreso, pausa en hover | Hero de solo texto | Hero con imagen/mockup del producto (o slider de 3 mensajes: locales, contratos, pagos) con Ken Burns suave y respetando reduced motion. Requiere imágenes | B |
| 7 | Arquitectura multipágina | Servicios y contacto como páginas con URL propia | Home de una página con 7 anclas; nav distinta en home y páginas | Decidir: (a) mantener home de una página pero con nav unificada, o (b) llevar Servicios y Contacto a páginas propias (`/servicios`, `/contacto`) y dejar la home como escaparate que deriva a ellas | B |
| 8 | Página/formulario de contacto | Formulario que arma el mensaje y abre WhatsApp | Solo link de WhatsApp | `/contacto` con formulario (nombre, empresa, correo o teléfono, asunto, mensaje) que abre WhatsApp prellenado — no requiere backend — **con casilla obligatoria de autorización de tratamiento de datos** enlazada a la política | B |
| 9 | Carrusel con scroll-snap | Snap + flechas + progreso | No hay | Aplicable a "Compañías que confían" o a capturas del producto | B |
| 10 | Separador parallax / banda de imagen | Entre secciones | Solo la banda de equipo | Una banda de imagen entre bloques largos (respetando reduced motion) | C |
| 11 | SEO técnico | canonical, OG, Twitter card por página | Solo title/description; OG ausente | Open Graph + Twitter card + canonical vía `PageMetaService`; JSON-LD `Organization`/`WebSite` en la home; `meta description` específica | A |
| 12 | Página 404 | Existe (sitio estático) | `**` redirige a `/login` | Página 404 pública con navegación de vuelta | B |
| 13 | Imágenes optimizadas | AVIF/WebP + srcset + fetchpriority | `responsive-image` existe | Reusar `responsive-image` con prioridad en el hero y lazy en el resto | B |
| 14 | Focus visible y print | Anillo de foco de marca global; `@media print` sin nav | No verificado | Anillo `:focus-visible` uniforme; estilos de impresión para páginas legales | C |
| 15 | Bilingüe ES/EN | Sí | No | Fuera de alcance salvo que se pida (RNF-01 exige español) | C |

**Oportunidades de KUVU que la referencia no tiene** (salen del mapa de experiencia del repo):
contadores animados de cifras del producto (requieren cifras reales o se omiten), testimonios o
casos de uso, demo/video corto, FAQ ampliado (costos, soporte, migración de datos), sección de
seguridad más concreta (aislamiento por empresa, roles), banner de consentimiento de cookies
(hoy no es exigible porque KUVU no usa cookies de analítica/terceros; bastaría la política).

**No aplicable al dominio de KUVU**: mapa por regiones, buscador de viajes paso a paso,
políticas de trata/menores/turismo responsable, términos de reservas con anticipos.

**Restricciones que condicionan el cambio:**
- RNF-01 "un solo llamado a la acción principal por pantalla" (hoy "Ingresar"): una página de
  contacto o un CTA "Solicitar demo" compite con él — decisión de producto.
- RNF-03 reduced motion: todas las animaciones nuevas deben respetarlo (la directiva actual ya
  es el patrón).
- RNF-04 lazy loading: páginas nuevas como `loadComponent`.
- RNF-14: textos legales y de secciones nuevas en `content/*.ts` (o `content/legal.ts`).
- Sin librería de animación instalada: lo de la referencia es replicable con CSS +
  `IntersectionObserver`, sin dependencias nuevas.
- Los textos legales deben llevar datos reales del responsable (razón social o nombre, NIT/CC,
  domicilio, correo). La referencia no los publica; KUVU no los tiene en el repo.
- Volumen: el umbral de riesgo es 300 líneas. Este cambio, completo, lo supera con holgura;
  Gate C va a pedir estrategia de entrega (probablemente cortar en varios cambios/PRs).

---

## 4. Ambigüedades para el Gate A

1. **Rama de trabajo**: hay un cambio `acceso-orden-e-intro` pausado en `verify` sobre la rama
   actual `feat/acceso-orden-e-intro` (commit 2058d41). ¿Este cambio va en una rama nueva desde
   `main` o desde la actual?
2. **Arquitectura de navegación** ("la página maneja las secciones"): ¿se interpreta como
   (a) pasar a multipágina (Servicios, Contacto, Legal como páginas con URL propia y nav
   unificada), o (b) mantener la home de una página y profesionalizar la organización visual
   de sus secciones (eyebrows numerados, header con sección activa)?
3. **Páginas legales a incluir**: ¿política de tratamiento de datos (Ley 1581), aviso de
   privacidad, términos y condiciones, política de cookies? ¿Una página `/legal` con anclas
   (como la referencia) o una página por documento?
4. **Datos del responsable del tratamiento**: ¿qué nombre/razón social, NIT o CC, domicilio,
   correo de contacto y fecha de vigencia se publican? Sin esto los textos quedan con
   marcadores. Aclarar también que serán textos base, no asesoría legal.
5. **Contacto**: ¿se agrega página/formulario de contacto que abre WhatsApp con casilla de
   autorización de datos? ¿Hay correo de contacto y redes sociales reales para el footer?
6. **CTA principal (RNF-01)**: ¿se mantiene "Ingresar" como único CTA principal, o se suma
   "Solicitar demo / Contactar" para visitantes?
7. **Hero e imágenes**: ¿hay imágenes o capturas del producto para un hero con imagen/slider,
   o se trabaja con recursos existentes en `public/Imagenes_web/`?
8. **Apartados nuevos**: ¿se incluyen testimonios, cifras (con datos reales), FAQ ampliado
   (costos, soporte, migración)? Sin datos reales no se inventan.
9. **Alcance/entrega**: el conjunto completo supera el umbral de 300 líneas. ¿Se prioriza un
   primer cambio (p. ej. legales + footer + header + SEO) y el resto en cambios siguientes?
10. **Modalidad de tests**: `sdd.config.md` declara `test-after`, no hace falta preguntar.
