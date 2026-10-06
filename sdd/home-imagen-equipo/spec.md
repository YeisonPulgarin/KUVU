# Spec — home-imagen-equipo

Fuentes: `explore.md` (incluye decisiones del Gate A) y `propose.md`.

## Requisitos funcionales

### RF-1 — Asset publicado sin espacios y en formatos optimizados

- La foto del equipo está disponible en `public/Imagenes_web/` con nombre base `equipo-ycw` (sin espacios).
- Existe al menos una variante WebP y una JPEG de respaldo, cada una en más de un ancho, sin superar el ancho del original (1536 px).
- Cada variante conserva el aspecto 3:2 del original.
- Ninguna parte del sitio referencia el nombre de archivo con espacios.

### RF-2 — Banda "El equipo detrás de KUVU" en la home

- **Given** un visitante en la home (`/`), **when** la página carga, **then** existe una sección propia con `id="equipo"` que:
  - ocupa el ancho completo del viewport (sin márgenes laterales del contenedor);
  - muestra la foto del equipo como fondo visual, cubriendo la sección sin deformarse;
  - aplica sobre la foto un velo oscuro con tono verde de marca;
  - contiene un encabezado H2 con el texto "El equipo detrás de KUVU";
  - contiene un caption con los nombres en este orden: Wilson Solano, Carlos Arciniegas, Yeison Pulgarin;
  - contiene un link a `/nosotros`.
- El texto sobre la foto cumple contraste WCAG AA (≥ 4.5:1 para texto normal) contra el velo, en modo claro y en modo oscuro.
- La sección aparece entre "Compañías que confían" (`#companias`) y el FAQ (`#faq`); su posición exacta respecto de `#origen` la fija `design`.

### RF-3 — Foto en `/nosotros`

- **Given** un visitante en `/nosotros`, **when** la página carga, **then** la foto del equipo se muestra completa (sin recortar a los integrantes), con el mismo caption de nombres en el mismo orden.

### RF-4 — Accesibilidad de la imagen

- Toda instancia de la foto que transmite contenido tiene texto alternativo descriptivo que menciona al equipo YCW y a sus tres integrantes.
- Si en la banda la foto es puramente decorativa porque el caption ya nombra a los integrantes, se marca como decorativa (alt vacío o equivalente) para no duplicar la lectura.
- El link a `/nosotros` tiene un texto accesible que describe su destino.

### RF-5 — Carga eficiente

- El navegador recibe la variante WebP cuando la soporta y la JPEG en caso contrario.
- El navegador elige el ancho de variante según el tamaño de pantalla.
- Ninguna de las dos instancias de la foto bloquea el primer render del hero: se cargan de forma diferida.
- La imagen reserva su espacio antes de cargar (sin saltos de layout visibles).

### RF-6 — Movimiento

- La banda usa la animación de aparición existente del sitio (`data-reveal`).
- Con `prefers-reduced-motion: reduce`, la banda y su contenido se muestran sin animación.

### RF-7 — Patrón reutilizable

- Los datos de una imagen (fuentes por formato y ancho, dimensiones, alt, caption opcional) se declaran como contenido tipado en `content/`.
- La home y `/nosotros` renderizan la foto a partir de esa misma declaración, sin duplicar rutas de archivo ni textos.
- Sumar una imagen nueva de `Imagenes_web/` requiere solo agregar sus archivos y su declaración de contenido, y usar la pieza compartida, sin escribir markup `<picture>` nuevo.

## Criterios de aceptación

| # | Criterio | Cómo se verifica |
|---|---|---|
| CA-1 | Existen las variantes `equipo-ycw` en WebP y JPEG, en ≥ 2 anchos, aspecto 3:2, ancho ≤ 1536 px | Inspección de `public/Imagenes_web/` |
| CA-2 | `grep` por `Equipo YCW` y `Equipo%20YCW` en `src/` no devuelve resultados | Búsqueda en el repo |
| CA-3 | La home renderiza `#equipo` con H2 "El equipo detrás de KUVU", los tres nombres en orden y un link a `/nosotros` | Test unitario de `HomeComponent` |
| CA-4 | El test de orden de ids de secciones incluye `equipo` en la posición que define `design` y pasa | Test unitario de `HomeComponent` |
| CA-5 | `/nosotros` renderiza la foto y el caption con los tres nombres en orden | Test unitario de `NosotrosComponent` |
| CA-6 | La declaración de la imagen en `content/` tiene fuentes WebP y JPEG, dimensiones, alt no vacío y caption con los tres nombres | Test de forma en `content.spec.ts` |
| CA-7 | La pieza compartida renderiza `<picture>` con `<source>` WebP con `srcset` de varios anchos, `<img>` JPEG de respaldo con `width`/`height`, `loading="lazy"` y el alt recibido | Test unitario del componente compartido |
| CA-8 | El contraste del texto de la banda sobre el velo es ≥ 4.5:1 en claro y oscuro | Revisión manual en `verify` con los colores efectivos del velo |
| CA-9 | Con reduced motion activo, la banda es visible sin animación | Revisión de estilos (`@media (prefers-reduced-motion)`) |
| CA-10 | La suite completa del frontend pasa | `npx ng test --watch=false --browsers=ChromeHeadless` |
| CA-11 | El build de producción compila sin errores ni warnings nuevos | `npx ng build` |

## No-objetivos / edge cases excluidos

- Cambios en el hero y en el resto de las secciones existentes, salvo el orden de ids por la sección nueva.
- Galerías, carruseles, lightbox o zoom de la foto.
- Incorporar otras imágenes de `Imagenes_web/`: solo queda el patrón.
- Formato AVIF, CDN, backend de imágenes o pipeline de build automático.
- Retoque de la foto más allá de redimensionado y compresión.
- Navegadores sin soporte de `<picture>`: reciben el JPEG por el `<img>` de respaldo, sin otro tratamiento.
- No se agrega `#equipo` a la navegación del header.
