# Performance — Core Web Vitals en Astro

## Imágenes — reglas obligatorias

```astro
---
import { Image, Picture } from 'astro:assets'
import heroImage from '../assets/hero.jpg'
---

<!-- ✅ Imagen local optimizada (comprime, redimensiona, genera WebP/AVIF) -->
<Image
  src={heroImage}
  alt="Descripción de la imagen"
  width={1200}
  height={600}
  loading="eager"     <!-- solo para LCP (primera imagen visible) -->
  decoding="async"
  fetchpriority="high"  <!-- solo para LCP -->
/>

<!-- ✅ Imagen responsive con múltiples formatos -->
<Picture
  src={heroImage}
  formats={['avif', 'webp']}
  alt="Descripción"
  widths={[400, 800, 1200]}
  sizes="(max-width: 768px) 100vw, 50vw"
/>

<!-- ❌ NUNCA: img nativo para imágenes locales -->
<img src="/hero.jpg" alt="..." />
```

**Reglas de loading:**
- Primera imagen visible (hero, LCP): `loading="eager"` + `fetchpriority="high"`
- Todo lo demás: `loading="lazy"` (default de `<Image>`)

## Fuentes — self-hosted para LCP

```css
/* src/styles/global.css */

/* ✅ Self-hosted — sin dependencia de Google Fonts */
@font-face {
  font-family: 'Inter';
  src: url('/fonts/inter-variable.woff2') format('woff2');
  font-weight: 100 900;
  font-style: normal;
  font-display: swap;  /* CRÍTICO: evita FOUT */
}
```

```astro
<!-- En BaseLayout.astro <head> — preload de la fuente principal -->
<link
  rel="preload"
  href="/fonts/inter-variable.woff2"
  as="font"
  type="font/woff2"
  crossorigin
/>
```

**Si Google Fonts es requerido:** usar `font-display: swap` y preconnect:
```astro
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
```

## Scripts de terceros — defer/async siempre

```astro
<!-- Analytics, chat, etc. — NUNCA bloquear el render -->
<script defer src="https://analytics.example.com/script.js" data-domain="{{PROJECT}}.com"></script>

<!-- O cargarlo solo en idle (después del LCP) -->
<script>
  window.addEventListener('load', () => {
    const script = document.createElement('script')
    script.src = 'https://heavy-widget.example.com/embed.js'
    document.head.appendChild(script)
  })
</script>
```

## View Transitions — navegación sin full reload

```astro
---
// src/layouts/BaseLayout.astro
import { ViewTransitions } from 'astro:transitions'
---
<head>
  <ViewTransitions />
</head>
```

Controlar qué elementos transicionan:
```astro
<!-- Imagen que persiste entre páginas (morph) -->
<Image src={post.cover} alt={post.title} transition:name={`cover-${post.id}`} />

<!-- Elemento que se anima al entrar/salir -->
<h1 transition:animate="slide">Título</h1>

<!-- Elemento que NO debe animar (ej: header fijo) -->
<header transition:persist>...</header>
```

## Prefetch — anticipar navegación

Astro 5 prefetchea automáticamente en hover. Configuración:

```js
// astro.config.mjs
export default defineConfig({
  prefetch: {
    prefetchAll: false,       // no prefetch de todas las páginas
    defaultStrategy: 'hover', // prefetch al hacer hover (default)
  },
})
```

En links específicos:
```astro
<!-- Prefetch inmediato de página crítica -->
<a href="/pricing" data-astro-prefetch="load">Precios</a>

<!-- Nunca prefetch -->
<a href="/heavy-page" data-astro-prefetch="false">Dashboard</a>
```

## Checklist Core Web Vitals

### LCP (Largest Contentful Paint) — objetivo < 2.5s
- [ ] Primera imagen con `loading="eager"` + `fetchpriority="high"`
- [ ] Fuentes preloadeadas o self-hosted con `font-display: swap`
- [ ] Sin CSS render-blocking (Tailwind se purga automáticamente)
- [ ] Sin `client:load` en islands que no son above the fold

### CLS (Cumulative Layout Shift) — objetivo < 0.1
- [ ] Todas las imágenes tienen `width` y `height` explícitos
- [ ] Fuentes con `font-display: swap` (puede causar CLS pequeño — aceptable)
- [ ] Elementos dinámicos tienen tamaño reservado (`min-h-*`)
- [ ] Sin inserción de elementos entre el LCP y el viewport en carga

### INP (Interaction to Next Paint) — objetivo < 200ms
- [ ] Islands mínimos — solo los necesarios
- [ ] Scripts de terceros con `defer`
- [ ] Event handlers simples (sin work pesado en el thread principal)

## Análisis de bundle

```bash
# Ver qué JS se está enviando
npx astro build --verbose

# Analizar el bundle
npm install -D rollup-plugin-visualizer
```

En `astro.config.mjs`:
```js
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  vite: {
    plugins: [visualizer({ open: true, filename: 'bundle-stats.html' })],
  },
})
```
