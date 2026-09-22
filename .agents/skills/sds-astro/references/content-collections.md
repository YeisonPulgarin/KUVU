# Content Collections

## Configuración (src/content/config.ts)

```ts
import { defineCollection, z } from 'astro:content'

const blog = defineCollection({
  type: 'content',  // Markdown o MDX
  schema: ({ image }) => z.object({
    title: z.string(),
    description: z.string(),
    publishedAt: z.coerce.date(),
    updatedAt: z.coerce.date().optional(),
    author: z.string().default('Equipo {{PROJECT}}'),
    featured: z.boolean().default(false),
    draft: z.boolean().default(false),
    // image() valida que el path existe y permite optimización con astro:assets
    cover: image().optional(),
    tags: z.array(z.string()).default([]),
    canonicalUrl: z.string().url().optional(),
  }),
})

const docs = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    order: z.number().optional(),
    section: z.string(),
    draft: z.boolean().default(false),
  }),
})

// Datos estructurados (YAML o JSON)
const team = defineCollection({
  type: 'data',
  schema: ({ image }) => z.object({
    name: z.string(),
    role: z.string(),
    bio: z.string(),
    avatar: image(),
    linkedin: z.string().url().optional(),
  }),
})

const testimonials = defineCollection({
  type: 'data',
  schema: z.object({
    author: z.string(),
    company: z.string(),
    text: z.string(),
    rating: z.number().min(1).max(5),
  }),
})

export const collections = { blog, docs, team, testimonials }
```

## Queries de colecciones

```astro
---
import { getCollection, getEntry, render } from 'astro:content'

// Todos los posts publicados, ordenados por fecha
const posts = await getCollection('blog', ({ data }) => !data.draft)
const sorted = posts.sort((a, b) =>
  b.data.publishedAt.getTime() - a.data.publishedAt.getTime()
)

// Post individual
const post = await getEntry('blog', slug)   // slug = nombre del archivo sin extensión
if (!post) return Astro.redirect('/404')

// Renderizar contenido Markdown/MDX
const { Content, headings, remarkPluginFrontmatter } = await render(post)
---

<article>
  <h1>{post.data.title}</h1>
  <Content />
</article>
```

## Página dinámica por slug

```astro
---
// src/pages/blog/[slug].astro
import type { GetStaticPaths } from 'astro'
import { getCollection, render } from 'astro:content'
import BlogLayout from '../../layouts/BlogLayout.astro'

export const getStaticPaths: GetStaticPaths = async () => {
  const posts = await getCollection('blog', ({ data }) => !data.draft)
  return posts.map(post => ({
    params: { slug: post.id },
    props: { post },
  }))
}

const { post } = Astro.props
const { Content, headings } = await render(post)
---

<BlogLayout
  title={post.data.title}
  description={post.data.description}
  publishedAt={post.data.publishedAt}
  cover={post.data.cover}
>
  <Content />
</BlogLayout>
```

## Docs con catch-all route

```astro
---
// src/pages/docs/[...slug].astro
import type { GetStaticPaths } from 'astro'
import { getCollection, render } from 'astro:content'

export const getStaticPaths: GetStaticPaths = async () => {
  const docs = await getCollection('docs', ({ data }) => !data.draft)
  return docs.map(doc => ({
    params: { slug: doc.id },  // "getting-started", "api/authentication", etc.
    props: { doc },
  }))
}

const { doc } = Astro.props
const { Content, headings } = await render(doc)
---
```

## MDX — componentes personalizados

```mdx
---
title: Instalación
---
import { Callout } from '../../components/ui/Callout.astro'
import { CodeBlock } from '../../components/ui/CodeBlock.astro'

# Instalación

<Callout type="info">
  Requiere Node.js 18 o superior.
</Callout>
```

Registrar componentes MDX globalmente (evita importarlos en cada archivo):

```js
// astro.config.mjs
import mdx from '@astrojs/mdx'

export default defineConfig({
  integrations: [
    mdx({
      components: {
        // Reemplaza elementos Markdown con componentes Astro
        pre: './src/components/ui/CodeBlock.astro',
        blockquote: './src/components/ui/Callout.astro',
      },
    }),
  ],
})
```

## Datos YAML para contenido estructurado

```yaml
# src/content/team/salomon.yaml
name: Joan Salomon
role: CTO
bio: Co-fundador de salomondevsystems
avatar: ../../assets/team/salomon.jpg
linkedin: https://linkedin.com/in/salomon
```

```astro
---
import { getCollection } from 'astro:content'
import { Image } from 'astro:assets'

const team = await getCollection('team')
---

{team.map(member => (
  <div>
    <Image src={member.data.avatar} alt={member.data.name} width={200} height={200} />
    <h3>{member.data.name}</h3>
    <p>{member.data.role}</p>
  </div>
))}
```
