# Propose — home-imagen-equipo

## Intent

La home de KUVU es solo texto y no muestra a las personas detrás del producto. Este cambio
incorpora la foto del equipo YCW como un momento visual de alto impacto en la home y en
`/nosotros`, y deja un patrón para sumar las próximas imágenes de `Imagenes_web/`.

## Alcance

- **Asset**: `Equipo YCW.jpeg` se publica como `public/Imagenes_web/equipo-ycw.jpeg` (sin espacios), con variantes WebP y tamaños responsive. El JPEG queda como fallback.
- **Home — sección nueva "El equipo detrás de KUVU"**: banda a ancho completo con la foto de fondo, velo oscuro con verde de marca, frase principal, caption con los nombres de izquierda a derecha (Wilson Solano, Carlos Arciniegas, Yeison Pulgarin) y link a `/nosotros`. Mantiene legibilidad en modo claro y oscuro y respeta reduced motion.
- **`/nosotros`**: la misma foto aparece en la página, con el mismo caption.
- **Patrón reutilizable**: la imagen y sus metadatos (fuentes por formato y tamaño, alt, caption) viven en el contenido tipado de `content/` y se renderizan con una pieza de UI compartida, para que agregar una imagen nueva sea declarar datos y no repetir markup.
- **Tests (test-after)**: sección nueva en la home, test de orden de ids de secciones actualizado, foto en `/nosotros`, forma del contenido de imagen.
- **Documentación**: `docs/home-imagen-equipo.md`, CHANGELOG y README si aplica.

## No-objetivos

- Rediseñar el hero o cualquier otra sección existente de la home.
- Galerías, carruseles o lightbox.
- Integrar las imágenes futuras de `Imagenes_web/`: solo queda el patrón para hacerlo.
- Servir imágenes desde un CDN o backend, o crear un pipeline de build para imágenes. Las variantes se generan una vez y se versionan en `public/`.
- Retocar la foto (recorte artístico, color grading) más allá del redimensionado y la compresión.

## Approach

1. Generar los derivados de la foto (WebP y JPEG en varios anchos) y dejarlos en `public/Imagenes_web/`.
2. Modelar la imagen como contenido tipado en `content/` y crear un componente de imagen compartido (`<picture>` con fuentes por formato y tamaño, carga diferida).
3. Insertar la banda del equipo en la home, en una posición que `design` define, y usar el componente en `/nosotros`.
4. Actualizar los tests y la documentación.

## Riesgo

Bajo a medio. Es un cambio de frontend acotado (home, nosotros, contenido, un componente compartido, assets), por debajo del umbral de 300 líneas. Los binarios de imagen agregan peso al repo pero no a la revisión de código.

## Preguntas abiertas para `design`

- La posición de la banda dentro de la home (por ejemplo después de "Compañías que confían" y antes de "El origen de KUVU", como puente narrativo) y dentro de `/nosotros`.
- Los anchos de las variantes responsive y la herramienta para generarlas.
