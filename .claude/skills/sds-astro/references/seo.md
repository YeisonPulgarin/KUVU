# SEO Técnico en Astro

## BaseLayout — la fuente de verdad del <head>

```astro
---
// src/layouts/BaseLayout.astro
import { SEO } from '../lib/seo'

interface Props {
  title: string
  description: string
  canonicalUrl?: string
  ogImage?: string       // URL absoluta
  ogType?: 'website' | 'article'
  noindex?: boolean
  publishedAt?: Date
  author?: string
}

const {
  title,
  description,
  canonicalUrl = new URL(Astro.url.pathname, Astro.site).toString(),
  ogImage = new URL('/og-default.jpg', Astro.site).toString(),
  ogType = 'website',
  noindex = false,
  publishedAt,
  author,
} = Astro.props

const siteName = '{{PROJECT}}'
const fullTitle = title === siteName ? title : `${title} — ${siteName}`
---

<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />

  <!-- Primary SEO -->
  <title>{fullTitle}</title>
  <meta name="description" content={description} />
  <link rel="canonical" href={canonicalUrl} />
  {noindex && <meta name="robots" content="noindex, nofollow" />}

  <!-- Open Graph -->
  <meta property="og:type" content={ogType} />
  <meta property="og:title" content={fullTitle} />
  <meta property="og:description" content={description} />
  <meta property="og:url" content={canonicalUrl} />
  <meta property="og:image" content={ogImage} />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:site_name" content={siteName} />
  <meta property="og:locale" content="es_ES" />

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={fullTitle} />
  <meta name="twitter:description" content={description} />
  <meta name="twitter:image" content={ogImage} />

  <!-- Article meta (blog posts) -->
  {publishedAt && <meta property="article:published_time" content={publishedAt.toISOString()} />}
  {author && <meta property="article:author" content={author} />}

  <!-- Favicon -->
  <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
  <link rel="apple-touch-icon" href="/apple-touch-icon.png" />

  <!-- Sitemap -->
  <link rel="sitemap" href="/sitemap-index.xml" />

  <slot name="head" />
</head>
<body>
  <slot />
</body>
</html>
```

## JSON-LD — datos estructurados

```astro
---
// Inyectar en BaseLayout o en páginas específicas
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: '{{PROJECT}}',
  url: Astro.site?.toString(),
  logo: new URL('/logo.svg', Astro.site).toString(),
  sameAs: [
    'https://linkedin.com/company/{{PROJECT}}',
    'https://twitter.com/{{PROJECT}}',
  ],
}
---

<script type="application/ld+json" set:html={JSON.stringify(jsonLd)} />
```

Para artículos de blog:
```astro
---
const articleJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: post.data.title,
  description: post.data.description,
  datePublished: post.data.publishedAt.toISOString(),
  dateModified: (post.data.updatedAt ?? post.data.publishedAt).toISOString(),
  author: {
    '@type': 'Person',
    name: post.data.author,
  },
  image: ogImageUrl,
  url: canonicalUrl,
}
---
```

## Sitemap automático

```js
// astro.config.mjs
import sitemap from '@astrojs/sitemap'

export default defineConfig({
  site: 'https://{{PROJECT}}.com',  // OBLIGATORIO para sitemap
  integrations: [
    sitemap({
      changefreq: 'weekly',
      priority: 0.7,
      // Excluir páginas del sitemap
      filter: (page) => !page.includes('/admin') && !page.includes('/draft'),
      customPages: ['https://{{PROJECT}}.com/feed.xml'],
    }),
  ],
})
```

## robots.txt

```
# public/robots.txt
User-agent: *
Allow: /

Disallow: /admin/
Disallow: /api/

Sitemap: https://{{PROJECT}}.com/sitemap-index.xml
```

## OG Image dinámica (SSR o build-time)

Para imágenes OG generadas dinámicamente (con texto del post):

```ts
// src/pages/og/[slug].png.ts
import type { APIRoute } from 'astro'
import { getEntry } from 'astro:content'

export const GET: APIRoute = async ({ params }) => {
  const post = await getEntry('blog', params.slug!)
  if (!post) return new Response('Not found', { status: 404 })

  // Generar imagen con @vercel/og o satori
  // Ver: https://docs.astro.build/en/guides/endpoints/
  // Opción simple: usar una imagen estática por categoría
  return new Response(/* imagen generada */)
}
```

## Canonical URL — reglas

| Caso | canonical |
|------|-----------|
| Página principal | `https://sitio.com/` |
| Ruta con slug | `https://sitio.com/blog/mi-post` |
| Contenido duplicado | URL de la versión preferida |
| Paginación `/blog?page=2` | Mantener cada página con su propia canonical |

## Checklist SEO por página

- [ ] `<title>` único y descriptivo (50-60 chars)
- [ ] `<meta name="description">` descriptivo (150-160 chars)
- [ ] `<link rel="canonical">` apunta a sí misma (o a la URL preferida)
- [ ] OG image 1200×630px
- [ ] Alt en todas las imágenes
- [ ] Headings jerárquicos (un solo H1, H2 para secciones)
- [ ] JSON-LD para Organization/Article según corresponda
- [ ] No hay duplicate content entre variantes de URL
