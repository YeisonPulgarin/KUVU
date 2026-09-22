---
name: sds-astro-seo
description: Configuración de SEO técnico en Astro — canónicas dinámicas, alternates hreflang, Open Graph, JSON-LD estructurado, robots y sitemaps.
version: 1.1.0
---

# Activation Contract

**Soy:** experto en SEO técnico (Search Engine Optimization) en Astro para proyectos salomondevsystems  
**Activo cuando:** el usuario solicita configurar indexing, sitemaps, robots.txt, etiquetas canonicals, hreflang multilenguaje, Open Graph, meta descripciones, o marcado estructurado Schema.org.  
**Excelente en:** canónicas dinámicas absolutas, alternates multilenguaje coherentes, marcado estructurado JSON-LD, configuración semántica HTML5 y consistencia en robots/sitemaps.

---

# Principios Fundamentales de SEO Técnico en Astro

En Astro, todo el HTML se compila en el servidor, por lo que es el framework ideal para lograr SEO excelente. Para garantizar que los motores de búsqueda indexen correctamente el sitio:

## 1. Indexabilidad, Canonical & hreflang Dinámicos

Toda página indexable debe declarar explícitamente su URL canónica y los enlaces alternativos de idioma de forma **absoluta**.

- **URL canónica absoluta:** Resolver la ruta basándose en el origen de dominio de producción de forma dinámica:
  ```astro
  const canonicalUrl = new URL(Astro.url.pathname, 'https://tusitioweb.com').toString();
  ```
- **Hreflang alternativos:** Declarar enlaces alternativos absolutos de idioma y el `x-default` para todos los idiomas soportados:
  ```astro
  const alternateEsUrl = new URL(Astro.url.pathname.replace(/^\/en/, '') || '/', 'https://tusitioweb.com').toString();
  const alternateEnUrl = new URL(Astro.url.pathname.startsWith('/en') ? Astro.url.pathname : `/en${Astro.url.pathname === '/' ? '' : Astro.url.pathname}`, 'https://tusitioweb.com').toString();
  ```
- **En el Layout principal (`Layout.astro`):**
  ```html
  <link rel="canonical" href={canonicalUrl} />
  <link rel="alternate" hreflang="es" href={alternateEsUrl} />
  <link rel="alternate" hreflang="en" href={alternateEnUrl} />
  <link rel="alternate" hreflang="x-default" href={alternateEsUrl} />
  ```

---

## 2. Meta Description — Presupuesto de Píxeles

Los auditores SEO miden la meta descripción en **píxeles renderizados**, no en caracteres. El límite real es **~920px**, que equivale a ~150-155 caracteres con tipografía de 14px regular.

- **Regla:** Mantener la descripción entre 120 y 155 caracteres.
- **Error frecuente:** escribir descripciones largas y ricas en palabras clave creyendo que "más es mejor". Una descripción de 163 chars (~1000px) se trunca en los SERPs y penaliza la puntuación on-page.
- **Patrón correcto:** priorizar las 2-3 palabras clave más relevantes + localización + diferencial único.

```astro
// ❌ Demasiado larga — 163 chars / ~1000px
description: 'Descansa entre palmeras en Villas de San Sebastián, un hotel campestre en Villavicencio con piscina, zonas verdes, suites y planes para parejas, familias y empresas.'

// ✅ Óptima — 140 chars / ~850px
description: 'Hotel campestre en Villavicencio con piscina, zonas verdes y suites. Planes para parejas, familias y empresas en Villas de San Sebastián.'
```

---

## 3. Metadatos de Redes Sociales (Open Graph & Twitter Cards)

Para controlar cómo se visualizan las páginas cuando se comparten en plataformas (Facebook, WhatsApp, Twitter, LinkedIn):

- **Declarar en el `<head>`:**
  ```html
  <!-- Open Graph -->
  <meta property="og:type" content="website" />
  <meta property="og:url" content={canonicalUrl} />
  <meta property="og:title" content={title} />
  <meta property="og:description" content={description} />
  <meta property="og:image" content={ogImageUrl} />

  <!-- Twitter -->
  <meta property="twitter:card" content="summary_large_image" />
  <meta property="twitter:url" content={canonicalUrl} />
  <meta property="twitter:title" content={title} />
  <meta property="twitter:description" content={description} />
  <meta property="twitter:image" content={ogImageUrl} />
  ```

---

## 4. Datos Estructurados (Schema.org JSON-LD)

Proporcionar a los motores de búsqueda información explícita sobre el negocio de forma estructurada.

- **Inyección en el head:** Usar la directiva `set:html` con un objeto stringificado:
  ```astro
  const baseSchema = {
    "@context": "https://schema.org",
    "@type": ["Hotel", "LodgingBusiness"],   // doble @type: más cobertura en rich results
    "name": "Nombre del Negocio",
    "url": "https://tusitioweb.com",
    "telephone": "+573001234567",
    "priceRange": "$$$",
    "checkinTime": "15:00",                  // Google Hotels Search lo usa
    "checkoutTime": "12:00",
    "numberOfRooms": 30,
    "starRating": {
      "@type": "Rating",
      "ratingValue": "4"
    },
    "amenityFeature": [
      { "@type": "LocationFeatureSpecification", "name": "Piscina", "value": true },
      { "@type": "LocationFeatureSpecification", "name": "WiFi gratuito", "value": true },
      { "@type": "LocationFeatureSpecification", "name": "Parqueadero", "value": true }
    ],
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Dirección física",
      "addressLocality": "Ciudad",
      "addressRegion": "Departamento",
      "addressCountry": "CO"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "4.195034",
      "longitude": "-73.606820"
    },
    "sameAs": [
      "https://www.instagram.com/handle",
      "https://www.facebook.com/handle"
    ]
  };
  ---
  <script type="application/ld+json" set:html={JSON.stringify(baseSchema)} />
  ```

- **Nota:** Algunos auditores on-page (SEOptimer, Seobility) NO detectan el Schema.org inyectado via `set:html` en Astro si usan un headless renderer simplificado. Verificar siempre con **Google Rich Results Test** (`search.google.com/test/rich-results`) como fuente de verdad.

---

## 5. Etiquetas `<strong>` / `<b>` Vacías — Falsos Positivos por JS

Los auditores SEO rastrean el HTML estático (sin ejecutar JS). Si un `<strong>` se rellena vía JavaScript (ej. un calendario que muestra el mes actual), el crawler lo ve vacío y lo reporta como error.

**Solución:** Pre-renderizar el contenido inicial en el frontmatter de Astro. El JS lo sobreescribe igualmente cuando inicializa el componente.

```astro
---
// Frontmatter — se ejecuta en el servidor
const initialMonthLabel = new Date().toLocaleDateString(
  language === 'en' ? 'en-US' : 'es-CO',
  { month: 'long', year: 'numeric' }
);
---

<!-- ❌ Vacío para el crawler -->
<strong id="calendar-title"></strong>

<!-- ✅ El crawler ve texto; JS lo sobreescribe al inicializar -->
<strong id="calendar-title">{initialMonthLabel}</strong>
```

Este patrón aplica a **cualquier elemento** cuyo contenido inicial sea inyectado por JS: títulos de calendarios, labels de selección dinámica, contadores, etc.

---

## 6. Atributo `alt` en Imágenes Dinámicas (Lightbox, Modales)

Un lightbox tiene una `<img>` con `src=""` y `alt=""` vacíos en el HTML estático porque JS carga la imagen al abrirlo. El crawler lo reporta como "imagen sin alt".

**Solución:** Usar un `alt` descriptivo de fallback que JS sobreescribirá:

```astro
<!-- ❌ Crawler ve alt vacío -->
<img id="lightbox-image" src="" alt="" />

<!-- ✅ Alt descriptivo de fallback; JS lo actualiza al abrir el lightbox -->
<img id="lightbox-image" src="" alt={t.rooms.detailTitle} />
```

El JS que abre el lightbox debe actualizar el `alt` con el nombre real de la imagen:
```javascript
lightboxImg.alt = room.name + ', imagen ' + (imageIndex + 1);
```

---

## 7. Estructura de Encabezados (H1–H6) — Proporción vs Contenido

Los auditores SEO evalúan la **proporción** de encabezados respecto al texto. Una página con ~1000 palabras y 27 headings (H1+H2+H3) falla el check porque la relación heading/texto es demasiado alta.

**Regla de decisión: ¿es un heading semántico o una etiqueta visual?**

| Elemento | ¿Heading? | Razonamiento |
|----------|-----------|--------------|
| Título de sección de contenido | ✅ H2/H3 | Estructura real del documento |
| Nombre de habitación en catálogo | ✅ H3 | Ítem de contenido indexable |
| Título de columna en footer de nav | ❌ `<p>` | Etiqueta de navegación, no contenido |
| Paso numerado (01/02/03) de formulario | ❌ `<p>` | Label visual de UI, no estructura de documento |
| Título de modal/lightbox | ❌ `<p>` o `aria-label` | Contenido efímero no indexable |

```astro
<!-- ❌ Footer con h3 — infla artificialmente el conteo -->
<h3 class="footer-title">Explora</h3>
<h3 class="footer-title">Legal</h3>
<h3 class="footer-title">Contacto</h3>

<!-- ✅ La clase mantiene los estilos; se elimina la semántica de heading -->
<p class="footer-title">Explora</p>
<p class="footer-title">Legal</p>
<p class="footer-title">Contacto</p>
```

```astro
<!-- ❌ Pasos de formulario como headings -->
<div class="form-step"><span>01</span><h3>Datos del evento</h3></div>

<!-- ✅ Pasos de formulario como párrafos estilizados -->
<div class="form-step"><span>01</span><p class="form-step-title">Datos del evento</p></div>
```

Cuando se cambia el tag, extender el selector CSS para no romper estilos:
```css
/* Antes */
.event-form-question h3 { font-size: clamp(2rem, 6vw, 3.4rem); }

/* Después — soporta ambos para no romper otros formularios */
.event-form-question h3,
.event-form-question .event-form-question-title {
  font-size: clamp(2rem, 6vw, 3.4rem);
}
```

---

## 8. Robots.txt y Sitemap.xml

Tanto el archivo de directivas de rastreo como el mapa del sitio deben vivir en la raíz pública (`/public/`) y estar perfectamente alineados:

- **Robots.txt (`public/robots.txt`):**
  ```txt
  User-agent: *
  Allow: /

  Sitemap: https://tusitioweb.com/sitemap.xml
  ```
- **Sitemap.xml (`public/sitemap.xml`):** Debe mapear de forma absoluta cada URL física indexable (ES y EN), incluyendo los links de lenguaje cruzados (`xhtml:link`) para evitar advertencias de indexación en Google Search Console:
  ```xml
  <?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
          xmlns:xhtml="http://www.w3.org/1999/xhtml">
    <url>
      <loc>https://tusitioweb.com/</loc>
      <xhtml:link rel="alternate" hreflang="es" href="https://tusitioweb.com/" />
      <xhtml:link rel="alternate" hreflang="en" href="https://tusitioweb.com/en" />
      <xhtml:link rel="alternate" hreflang="x-default" href="https://tusitioweb.com/" />
      <changefreq>weekly</changefreq>
      <priority>1.0</priority>
    </url>
  </urlset>
  ```
- **Favicons:** Asegurar que `favicon.ico` y `favicon-32.png` existan en la raíz pública `/public/` para descubrimiento automático de crawlers.

---

## 9. Lo que NO depende del código (SEO Off-page)

Registrar estas limitaciones para no confundir al cliente:

| Factor | Responsable | Acción |
|--------|-------------|--------|
| Redirección www ↔ non-www (301) | Hosting/Nginx/Cloudflare | Configurar redirect a nivel servidor |
| Tiempo de respuesta > 0.4s | Hosting + latencia geográfica | Cambiar región del servidor o usar CDN |
| Backlinks / dominios de referencia | Marketing / SEO off-page | Estrategia de link building externa |
| Dominio "demasiado largo" | Nombre del negocio | No aplica cambio técnico |
