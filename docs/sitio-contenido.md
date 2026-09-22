# Sitio de contenido — KUVU

El sitio público de marketing de KUVU (la página de inicio y sus páginas secundarias) muestra
contenido institucional en español, versionado en el repositorio como módulos TypeScript
tipados en `src/app/content/`, separado del markup de los componentes. Vive dentro del
frontend Angular (`frontend/proyecto_angular`) y no expone API pública: todo el texto viaja
por interpolación Angular desde constantes TS.

## Cómo funciona

### Contenido centralizado — `src/app/content/`

Cada módulo exporta una constante tipada, fuente única del texto:

- `site.ts` — nombre, tagline, navegación de anclas (`navLinks`) y de páginas
  (`pageNavLinks`), contacto por WhatsApp (`contact`, `buildWhatsAppLink`,
  `contactWhatsAppLink`).
- `services.ts`, `companies.ts` — la oferta de servicios y las compañías que aparecían
  hardcodeadas en la home.
- `howItWorks.ts`, `benefits.ts`, `security.ts`, `origin.ts` — las secciones nuevas de la
  home, reutilizadas por las páginas.
- `about.ts` — las secciones de `/nosotros` (quién es, cómo opera, con quién trabaja) y el
  origen (`aboutOrigin`).
- `faq.ts` — preguntas agrupadas por tema; la home usa un subconjunto (`homeFaqItems`), la
  página `/preguntas-frecuentes` usa el conjunto completo (`faqGroups`).
- `types.ts` — las interfaces compartidas por todos los módulos.

### Chrome compartido del sitio público

- `components/public/site-header/` — header con logo, navegación (anclas o páginas según el
  `navLinks` que recibe por `input()`), CTA "Ingresar", link de WhatsApp y toggle de tema.
- `components/public/site-footer/` — footer con marca, tagline, navegación de páginas y
  contacto por WhatsApp.
- `services/theme.service.ts` — estado de tema claro/oscuro, persistido en `kuvu-theme` y
  aplicado con la clase `.dark`; evita el flash al cargar desde `index.html`.
- `directives/reveal.directive.ts` — selector `[data-reveal]`: aplica `is-visible` al entrar
  al viewport respetando `prefers-reduced-motion`.
- `services/page-meta.service.ts` — fija `title` y `<meta name="description">` por página.

La home reusa el mismo chrome que las páginas; las tres páginas públicas comparten header y
footer.

### Rutas públicas

En `app.routes.ts`, antes del wildcard:

- `''` → `HomeComponent` (commit del bundle inicial).
- `nosotros` → lazy `NosotrosComponent`, `title: 'Nosotros · KUVU'`.
- `preguntas-frecuentes` → lazy `PreguntasFrecuentesComponent`, `title: 'Preguntas frecuentes · KUVU'`.

Cada página fija además su `meta description` en `ngOnInit` vía `PageMetaService`.

### Contacto

El CTA de contacto es WhatsApp: `https://wa.me/573223192760?text=<mensaje prellenado>` desde
`buildWhatsAppLink`, con `target="_blank"` y `rel="noopener"` en header, footer y página
`/nosotros`.

## Decisiones

- **Contenido en `content/*.ts`, no en el markup** — fuente única reutilizable (el FAQ corto
  de la home es un subconjunto del completo), testeable y con HTML limpio.
- **Chrome compartido (`SiteHeader`/`SiteFooter`/`ThemeService`/`RevealDirective`)** — tres
  páginas públicas usan el mismo header/footer y el toggle; evita duplicar el toggle de tema y
  los reveals. Tradeoff: el header debe cubrir dos modos de nav (anclas en la home, rutas en
  las páginas), resuelto con el `input()` `navLinks`.
- **Páginas nuevas lazy (`loadComponent`)** — consistente con el resto de la app; `/nosotros`
  no paga bundle en la home.
- **`title` por ruta + `PageMetaService` para description** — la ruta declara un `title` como
  fallback; `ngOnInit` asienta título y description juntos vía el servicio.
- **Reveal con selector `[data-reveal]`** — es el selector real de `RevealDirective`
  (la propuesta de diseño los llamaba `appReveal`); la home ya lo usaba.
- **CTA a WhatsApp como destino de contacto** — decisión del usuario; sin formulario de
  contacto propio.

## Limitaciones conocidas

- No hay formulario de contacto ni página `/contacto`: el contacto es WhatsApp.
- No hay blog, legal (T&C / política de datos) ni precios/planes en este cambio.
- No hay SEO avanzado: solo `title`, `meta description` y el favicon existente
  (`/Logo_Kuvu.jpeg`). Sin JSON-LD, sitemap ni Open Graph.
- El contenido de seguridad es solo descriptivo: no se publica ningún mecanismo interno.
- Deuda registrada en `refine` y `secure`: la columna de chrome (`.page-layout`,
  `.container`, `.page-hero`) está duplicada entre `nosotros` y `preguntas-frecuentes`
  (extraer `PageShellComponent` cuando llegue una tercera página del mismo tipo), y
  `pagos.component.ts` usa `document.write` (work item de seguridad dedicado, fuera de este
  alcance).