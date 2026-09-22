---
name: sds-astro-optimize
description: Optimización de rendimiento web en Astro — carga no bloqueante, responsive images, deferred scripts, gzip y cache-control en servidor.
version: 1.1.0
---

# Activation Contract

**Soy:** experto en optimización de rendimiento web (PageSpeed/Lighthouse) en Astro para proyectos salomondevsystems  
**Activo cuando:** el usuario solicita mejorar la velocidad de carga (FCP, LCP, Speed Index), optimizar imágenes pesadas, habilitar compresión o caché, o auditar el PageSpeed en proyectos de Astro.  
**Excelente en:** responsive images (`srcset`), diferimiento de scripts, pre-carga asíncrona de fuentes, compresión Gzip/Brotli y configuración de cabeceras HTTP de caché estática.

---

# Principios Fundamentales de Rendimiento en Astro

Astro es súper rápido por defecto, pero las malas prácticas con imágenes pesadas, fuentes sincrónicas y scripts de terceros pueden arruinar el Largest Contentful Paint (LCP) y el First Contentful Paint (FCP).

## 1. Reglas para Imágenes & LCP (Largest Contentful Paint)

Toda imagen visible arriba del pliegue inicial (Fold) es la principal candidata a ser el LCP de la página.

### Imagen del Hero (LCP)
- **SIEMPRE** usar la etiqueta `<Image>` de `astro:assets`.
- **NUNCA** usar `loading="lazy"` para la imagen LCP del Hero. Debe ser `loading="eager"`.
- **SIEMPRE** declarar la directiva `fetchpriority="high"` en la imagen del Hero.
- **SIEMPRE** usar un array de `widths` responsive y un atributo `sizes` acorde al viewport para que los celulares descarguen una variante pequeña (ej. de 360px a 720px) en vez del asset original de alta resolución:
  ```astro
  <Image
    src={heroImage}
    alt="Descripción"
    widths={[360, 720, 1200, 1920]}
    sizes="(max-width: 480px) 360px, (max-width: 768px) 720px, 1200px"
    loading="eager"
    fetchpriority="high"
    format="webp"
  />
  ```

### Imágenes de Fondos en CSS (`background-image`)
- **NUNCA** declarar imágenes pesadas directamente en el CSS como `background-image` (ej. `url('...')`), ya que esto salta el motor de optimización de Astro y el navegador descargará la versión pesada cruda.
- **SOLUCIÓN:** Refactorizar el contenedor para usar `position: relative; overflow: hidden;` y colocar el componente `<Image>` de forma absoluta por debajo del contenido:
  ```astro
  <section class="relative overflow-hidden">
    <Image
      src={bgImage}
      alt=""
      widths={[480, 800, 1200, 1920]}
      sizes="100vw"
      class="absolute inset-0 h-full w-full object-cover z-0"
      loading="lazy"
    />
    <div class="relative z-10">Contenido</div>
  </section>
  ```

---

## 2. Carga Asíncrona de Fuentes (Google Fonts)

Por defecto, la importación sincrónica de Google Fonts bloquea el renderizado (FCP) mientras el navegador descarga los archivos tipográficos.

### Patrón no bloqueante de Fuentes
Para permitir que la página dibuje texto instantáneamente usando fuentes de fallback:
```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  rel="preload"
  as="style"
  href="https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600;700&display=swap"
/>
<link
  rel="stylesheet"
  href="https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600;700&display=swap"
  media="print"
  onload="this.media='all'"
/>
<noscript>
  <link
    rel="stylesheet"
    href="https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600;700&display=swap"
  />
</noscript>
```

---

## 3. Diferimiento de Scripts de Terceros

Los scripts pesados de terceros (YouTube, Google Maps, chats interactivos, widgets) saturan el hilo principal del navegador.

### Lógica para Diferir Scripts
- **NUNCA** inyectar scripts de terceros directamente al inicio de la carga.
- **SIEMPRE** diferir su carga envolviéndolos hasta que se dispare el evento `load` de la ventana (`window.addEventListener('load')`):
  ```javascript
  const initThirdParty = () => {
    const script = document.createElement('script');
    script.src = 'https://www.youtube.com/iframe_api';
    document.head.append(script);
  };

  if (document.readyState === 'complete') {
    initThirdParty();
  } else {
    window.addEventListener('load', initThirdParty);
  }
  ```

---

## 4. Compresión y Caché del Servidor Estático (Node.js)

Si el sitio corre en un servidor personalizado (como en Dokploy / Docker VPS), el servidor debe comprimir y servir los archivos con cabeceras `Cache-Control` correctas.

### Gzip y Cache-Control en Node (`server.mjs`)
- **Cabeceras de Caché:**
  - Archivos inmutables (`/_astro/*` compilados con hashes): 1 año con inmutabilidad.
  - Imágenes públicas y estáticas: 7 días.
  - Páginas HTML: validación inmediata (`must-revalidate`).
- **Compresión Gzip:** Usar el módulo `node:zlib` para comprimir archivos HTML, CSS, JS, JSON y SVG en caliente si el cliente envía la cabecera `Accept-Encoding: gzip`.

---

## 5. Compresión Global de Compilación (Astro Compiler)

Para asegurar que el motor de compresión de imágenes de Astro sea más óptimo:
- **Calidad de Imagen:** Configurar el parámetro `image.quality` en `astro.config.mjs` en `72` o `75` (el valor por defecto es `80`). Esto reduce el peso de las imágenes WebP compiladas entre un 15% y un 25% sin pérdidas perceptibles:
  ```javascript
  export default defineConfig({
    image: {
      quality: 72,
    },
    // ...
  });
  ```

---

## 6. Privacidad y Cookies de Terceros

Los reproductores embebidos por defecto inyectan cookies de rastreo que degradan la auditoría de Lighthouse.
- **YouTube sin Cookies:** Cargar el script de iframe API y el reproductor utilizando el host alternativo de privacidad mejorada `www.youtube-nocookie.com`:
  ```javascript
  const script = document.createElement('script');
  script.src = 'https://www.youtube-nocookie.com/iframe_api';
  document.head.append(script);

  new (window as any).YT.Player('element-id', {
    host: 'https://www.youtube-nocookie.com',
    videoId: VIDEO_ID,
    playerVars: { ... }
  });
  ```

---

## 7. Auditoría del HTML Generado — Verificación Pre-Deploy

Antes de publicar, auditar el HTML generado en `dist/` con comandos simples. Esto detecta problemas que los auditores on-line (Seobility, SEOptimer) van a encontrar.

### Comandos de Auditoría sobre `dist/`

```bash
# Imágenes con alt vacío — error crítico SEO
grep -rn 'alt=""' dist/

# Todos los img tags — revisar manualmente que todos tengan alt descriptivo
grep -on '<img[^>]*>' dist/index.html | head -30

# Conteo de headings por tipo — detectar inflación de H
grep -o '<h[1-6][^>]*>' dist/index.html | sed 's/>.*//' | sort | uniq -c | sort -rn

# strong/b vacíos — falsos positivos para los crawlers
grep -n '<strong></strong>\|<b></b>' dist/index.html

# Ver contenido de cada heading — identificar cuáles son visuales vs semánticos
grep -on '<h[1-6][^>]*>[^<]*' dist/index.html
```

### Criterios de aceptación antes de deploy

| Check | Comando | Resultado esperado |
|-------|---------|-------------------|
| Sin `alt=""` vacíos | `grep -rn 'alt=""' dist/` | Sin resultados (o solo lightbox vacío con JS) |
| H1 único | conteo de `<h1` | Exactamente 1 |
| Proporción headings/palabras | conteo H total vs word count | < 1 heading por 40 palabras (~25 headings para 1000 palabras) |
| Sin `<strong></strong>` vacíos | grep strong vacíos | Sin resultados |

---

## 8. Tiempo de Respuesta del Servidor — Límite y Alcance

Los auditores on-page reportan el tiempo de respuesta del servidor (TTFB). El límite recomendado es **0.4 segundos**. Un sitio hospedado en Europa siendo visitado desde Colombia tendrá latencia física de ~150-200ms solo por la geografía.

**Lo que se puede mejorar desde el código:**
- Reducir el tamaño del HTML generado (sin scripts inline innecesarios)
- Pre-renderizar todo en build time (Astro SSG — `output: 'static'`)
- No hacer llamadas a APIs externas en el critical path del render

**Lo que depende del hosting (fuera del código):**
- Región del servidor — idealmente US-East o un CDN con PoP en Colombia/Latam
- Configuración de GZip/Brotli a nivel servidor
- HTTP/2 o HTTP/3 habilitado
- Cache-Control headers para assets estáticos

> Un tiempo de 0.53s con servidor en Alemania visitado desde Colombia es **físicamente inevitable** sin CDN o cambio de región. No es un bug de código.
