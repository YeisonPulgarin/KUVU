# Templates — sds-astro

Placeholders usados en todos los templates:

| Placeholder | Ejemplo | Descripción |
|-------------|---------|-------------|
| `{{PROJECT}}` | `taplog` | nombre del proyecto (siteName, OG, etc.) |

## Templates disponibles

| Template | Destino | Cuándo usarlo |
|----------|---------|---------------|
| `BaseLayout.astro.template` | `src/layouts/BaseLayout.astro` | Siempre — es el layout raíz |
| `content-config.ts.template` | `src/content/config.ts` | Cuando hay Markdown/MDX |
| `api.ts.template` | `src/lib/api.ts` | Cuando se conecta al backend Go |

## Estructura de directorios completa

```
src/
  pages/index.astro               ← landing principal
  layouts/
    BaseLayout.astro              ← de template
    BlogLayout.astro              ← hereda BaseLayout
    DocsLayout.astro              ← hereda BaseLayout
  components/
    ui/                           ← componentes Astro puros
    react/                        ← islands React (solo interactivos)
    sections/                     ← Hero, Features, CTA, etc.
    layout/                       ← Header, Footer, Nav
  content/
    config.ts                     ← de template
    blog/                         ← archivos .md o .mdx
    docs/
  lib/
    api.ts                        ← de template
    utils.ts
    seo.ts
  assets/                         ← imágenes locales
  styles/global.css               ← Tailwind base

public/
  favicon.svg
  robots.txt
  og-default.jpg                  ← imagen OG por defecto (1200×630)
```
