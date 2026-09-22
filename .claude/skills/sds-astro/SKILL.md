---
name: sds-astro
description: Desarrollo de sitios Astro — islands con React, Content Collections, SEO, Tailwind. Cubre landings, blogs, docs y sitios corporativos con contenido desde Markdown o API Go.
version: 1.0.0
---

# Activation Contract

**Soy:** experto en sitios Astro para proyectos salomondevsystems  
**Activo cuando:** trabajo en proyectos Astro con App Router, contenido editorial o sitios orientados a SEO y rendimiento  
**Excelente en:** islands architecture, Content Collections, SEO técnico, optimización de imágenes, integración con backend Go

---

# Principio fundamental — Astro es diferente a Next.js

Astro es un **MPA** (multi-page app). No hay router del lado cliente por defecto.  
Cada página es una request HTTP nueva — eso es una ventaja para SEO, no un problema.

```
Next.js → React en todo → "quitar JS donde no se necesita"
Astro   → cero JS por defecto → "agregar JS solo donde se necesita"
```

La decisión más importante en Astro es **qué NO convertir en island**.

---

# Fase 1 — Entrevista (SIEMPRE primero)

## Pregunta 1 — Nombre del proyecto
```
¿Cuál es el nombre del proyecto?
```

## Pregunta 2 — Tipo de sitio (puede ser múltiple)
```
¿Qué tipo de sitio es? (seleccionar todos los que apliquen)
  [ ] Landing / marketing       — conversión, animaciones, CTA
  [ ] Blog / contenido          — artículos en Markdown/MDX
  [ ] Documentación             — guías técnicas, referencias
  [ ] Sitio corporativo         — about, servicios, contacto
  [ ] Sitio completo con menús  — varias secciones integradas
```
→ Determina qué layouts, integraciones y Content Collections crear.

## Pregunta 3 — Renderizado
```
¿El sitio necesita datos en tiempo real (SSR) o todo se puede generar en build (SSG)?

  a) SSG puro — todas las páginas son estáticas, deploy como archivos HTML.
     Máximo rendimiento. Ideal para contenido que no cambia frecuentemente.

  b) Híbrido — la mayoría estático, pero algunas páginas usan SSR para datos
     dinámicos del backend Go (usuario logueado, precios, inventario).

  c) SSR completo — el servidor Astro renderiza cada request. Necesario para
     contenido altamente dinámico o autenticación por sesión.
```

## Pregunta 4 — Plataforma de deploy
```
¿Dónde se despliega el sitio?
  a) Vercel
  b) Netlify
  c) Cloudflare Pages
  d) Node.js (servidor propio / Docker)
  e) GitHub Pages / S3 / CDN estático
```
→ Determina el adapter de Astro a instalar.

## Pregunta 5 — Contenido (puede ser múltiple)
```
¿De dónde viene el contenido?
  [ ] Markdown / MDX en el repo   — Content Collections
  [ ] API del backend Go          — fetch en build time o runtime
  [ ] Ambos
```

---

# Hard Rules

## 1. Stack fijo (NO negociable)

✅ **SIEMPRE:**
- Astro 5+ (última versión estable)
- TypeScript (`strict: true`)
- Tailwind CSS via `@astrojs/tailwind`
- React para islands interactivos (`@astrojs/react`)
- `astro:assets` para toda imagen local
- Content Collections con schema Zod para contenido Markdown
- `@astrojs/sitemap` para SEO

❌ **NUNCA:**
- `<img>` para imágenes locales — siempre `<Image>` de `astro:assets`
- `client:load` salvo que la interacción sea crítica en el primer render
- React en componentes puramente visuales — usar `.astro`
- Estado global en React Context entre islands — Nanostores si es necesario
- Lógica de negocio en el template `.astro` — extraer a `src/lib/`

## 2. .astro por defecto, React solo para islands

```astro
---
// ✅ CORRECTO: componente Astro para contenido visual
import Card from './Card.astro'
---
<Card title="Hola" />

// ✅ CORRECTO: React solo para interactividad
import SearchBar from './SearchBar.tsx'
---
<SearchBar client:visible />

// ❌ INCORRECTO: React sin interactividad
import StaticCard from './StaticCard.tsx'
---
<StaticCard />   {/* no hay client: directive = render en servidor sin hydration */}
```

## 3. Directiva client: mínima necesaria

| Situación | Directiva |
|-----------|-----------|
| Island visible al hacer scroll | `client:visible` ✅ por defecto |
| Island en el hero (above the fold) | `client:idle` |
| Island crítico para la interacción inmediata | `client:load` |
| Island que no debe renderizarse en servidor | `client:only="react"` |
| Island controlado por media query | `client:media="(max-width: 768px)"` |

## 4. Datos en el frontmatter, no en el template

```astro
---
// ✅ CORRECTO: todo el fetch y lógica en el frontmatter (server-side)
const posts = await getCollection('blog')
const featured = posts.filter(p => p.data.featured)
---
<ul>
  {featured.map(p => <li>{p.data.title}</li>)}
</ul>

// ❌ INCORRECTO: lógica en el template
{posts.filter(p => p.data.featured).sort(...).slice(0, 3).map(...)}
```

## 5. Image siempre de astro:assets

```astro
---
import { Image } from 'astro:assets'
import heroImage from '../assets/hero.jpg'
---

// ✅ CORRECTO
<Image src={heroImage} alt="Hero" width={1200} height={600} />

// ❌ INCORRECTO
<img src="/hero.jpg" alt="Hero" />
```

## 6. Nunca hardcodear meta tags por página

Toda página debe pasar metadatos al layout — el layout es el único que escribe `<head>`.

---

# Arquitectura

## Estructura de directorios

```
src/
  pages/                      ← routing (archivos .astro, .md, .mdx)
    index.astro               → /
    blog/
      index.astro             → /blog
      [slug].astro            → /blog/post-slug
    docs/
      [...slug].astro         → /docs/cualquier/ruta
    api/                      ← endpoints (SSR/híbrido)
      contact.ts              → /api/contact

  layouts/
    BaseLayout.astro          ← HTML base + SEO head + scripts globales
    BlogLayout.astro          ← layout para posts (hereda BaseLayout)
    DocsLayout.astro          ← layout para docs con sidebar

  components/
    ui/                       ← componentes Astro reutilizables
      Button.astro
      Card.astro
      Badge.astro
    react/                    ← islands React (solo si son interactivos)
      SearchModal.tsx
      ContactForm.tsx
      Carousel.tsx
    sections/                 ← secciones de landing/corporativo
      Hero.astro
      Features.astro
      Testimonials.astro
      CTA.astro
    layout/                   ← header, footer, nav
      Header.astro
      Footer.astro
      Nav.astro

  content/                    ← Content Collections
    config.ts                 ← schemas Zod de todas las colecciones
    blog/
      post-1.md
    docs/
      getting-started.mdx
    team/                     ← datos estructurados (JSON/YAML)

  lib/
    api.ts                    ← fetch al backend Go
    utils.ts                  ← helpers (formatDate, slugify, cn)
    seo.ts                    ← helpers para generar meta tags

  assets/                     ← imágenes locales (optimizadas por astro:assets)
    hero.jpg
    og-default.jpg

  styles/
    global.css                ← Tailwind base + custom CSS

public/
  favicon.svg
  robots.txt
  fonts/                      ← fuentes self-hosted
```

## Layouts y herencia

```
BaseLayout.astro              ← único responsable del <head>
  ├── BlogLayout.astro        ← añade breadcrumb, author, reading time
  ├── DocsLayout.astro        ← añade sidebar de navegación
  └── LandingLayout.astro     ← sin nav, hero full-width
```

---

# Decision Gates

## ¿SSG o SSR para una página?

| La página necesita | Usar |
|-------------------|------|
| Contenido que no cambia o cambia en deploy | SSG (default) |
| Datos del backend que no varían por usuario | SSG + fetch en build |
| Datos personalizados por usuario autenticado | SSR (`export const prerender = false`) |
| Formulario que escribe en el backend | SSR endpoint o action |
| Precios / stock en tiempo real | SSR |

## ¿Componente .astro o island React?

| Necesita | Usar |
|----------|------|
| Solo mostrar contenido | `.astro` |
| onClick, onChange, estado | `tsx` + `client:visible` |
| Animaciones CSS | `.astro` + CSS/Tailwind |
| Animaciones complejas (GSAP, Framer) | `tsx` + `client:load` |
| Formulario con validación en tiempo real | `tsx` + `client:visible` |
| Formulario simple sin validación real-time | `.astro` con `action` POST |

## ¿Content Collection o fetch al backend?

| Contenido | Usar |
|-----------|------|
| Artículos, posts, docs, FAQs | Content Collections (Markdown) |
| Productos, usuarios, pedidos | Fetch al backend Go |
| Equipo, clientes, testimonios | Content Collections (YAML/JSON) o fetch |
| Datos que cambian en prod sin redeploy | Fetch al backend en SSR |

---

# Execution Steps

## 1. Setup inicial

```bash
npm create astro@latest {{PROJECT}} -- --template minimal --typescript strict

cd {{PROJECT}}

# Integraciones
npx astro add tailwind react sitemap

# Si SSR/híbrido — elegir adapter según plataforma:
npx astro add vercel       # Vercel
npx astro add netlify      # Netlify
npx astro add cloudflare   # Cloudflare
npx astro add node         # Node.js / Docker

# Dependencias React (para islands)
npm install react react-dom
npm install react-hook-form @hookform/resolvers zod
```

## 2. astro.config.mjs base

```js
import { defineConfig } from 'astro/config'
import tailwind from '@astrojs/tailwind'
import react from '@astrojs/react'
import sitemap from '@astrojs/sitemap'

export default defineConfig({
  site: 'https://{{PROJECT}}.com',  // requerido para sitemap y URLs absolutas
  integrations: [
    tailwind({ applyBaseStyles: false }),  // false si usás global.css propio
    react(),
    sitemap(),
  ],
  // Si SSR/híbrido:
  // output: 'hybrid',  // 'static' por defecto
  // adapter: vercel(),
})
```

## 3. BaseLayout con SEO

Ver `assets/templates/BaseLayout.astro.template`.

## 4. Nueva sección de landing

```astro
---
// src/components/sections/Features.astro
interface Props {
  features: Array<{ title: string; description: string; icon: string }>
}
const { features } = Astro.props
---

<section class="py-24 bg-white">
  <div class="container mx-auto px-4">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
      {features.map(feature => (
        <div class="flex flex-col gap-4">
          <span class="text-4xl">{feature.icon}</span>
          <h3 class="text-xl font-semibold">{feature.title}</h3>
          <p class="text-gray-600">{feature.description}</p>
        </div>
      ))}
    </div>
  </div>
</section>
```

## 5. Fetch al backend Go (build time)

```astro
---
// src/pages/products/[slug].astro
import type { GetStaticPaths } from 'astro'
import { fetchProducts, fetchProduct } from '../../lib/api'

export const getStaticPaths: GetStaticPaths = async () => {
  const products = await fetchProducts()
  return products.map(p => ({
    params: { slug: p.slug },
    props: { product: p },
  }))
}

const { product } = Astro.props
---

<BaseLayout title={product.name} description={product.description}>
  <h1>{product.name}</h1>
</BaseLayout>
```

## 6. Island React interactivo

```astro
---
import ContactForm from '../components/react/ContactForm.tsx'
---

<!-- Se hidrata cuando el componente entra al viewport -->
<ContactForm client:visible />
```

## 7. View Transitions (navegación suave)

```astro
---
// En BaseLayout.astro
import { ViewTransitions } from 'astro:transitions'
---
<head>
  <ViewTransitions />
</head>
```

Añadir a la página si se quiere transición específica:
```astro
<img transition:name="product-hero" src={product.image} />
```

---

# Output Contract

**Entrego al crear un sitio:**
- ✅ `astro.config.mjs` — integraciones según tipo de sitio y plataforma
- ✅ `src/layouts/BaseLayout.astro` — head con SEO completo
- ✅ Content Collections config si hay contenido Markdown
- ✅ `src/lib/api.ts` si se conecta al backend Go
- ✅ Secciones .astro para landing/corporativo (Hero, Features, CTA)
- ✅ `public/robots.txt` y sitemap configurado

**Entrego al añadir una página:**
- ✅ Archivo en `src/pages/` con layout aplicado
- ✅ Meta tags específicos de la página pasados al layout
- ✅ Imagen OG si la página es pública

**Garantizo:**
- Cero JS en componentes puramente visuales
- `client:visible` por defecto (nunca `client:load` sin justificación)
- `<Image>` de astro:assets siempre para imágenes locales
- `alt` en todas las imágenes
- Sin meta tags hardcodeados fuera de BaseLayout
- Sitemap generado automáticamente

---

# References

- `references/islands.md` — islands architecture, client: directives, Nanostores
- `references/content-collections.md` — schemas Zod, queries, MDX components
- `references/seo.md` — meta tags, OG, JSON-LD, sitemap, robots.txt
- `references/styling.md` — Tailwind en Astro, scoped CSS, dark mode
- `references/performance.md` — Image optimization, fonts, Core Web Vitals
- `assets/templates/README.md` — catálogo de templates y placeholders
- `DEVELOPMENT_GUIDELINES.md` (raíz) — el documento que define cómo se construye en este
  proyecto: estructura de features, islands y la política de logs (Logging & Observability)
