docs_archivo: docs/sitio-publico-expresivo.md
architecture: actualizado: content (headlines.ts), home (composición por sección, cinta de compañías), nuevas entradas `src/styles/_site.scss` y `components/public/headline/`, imágenes (`TeamSection.photos`, `equipo-kuvu-*`, `--keep-original-as-max`), team-band y galería de Nosotros, decisiones (display autohospedada; "Ingresar" azul)
guidelines: sin cambios (por instrucción del orquestador, DEVELOPMENT_GUIDELINES.md no se toca; no tiene sección de Angular). Las convenciones del sitio público quedan en sdd/sdd-init.md (slice cierre): fuente display autohospedada sin @import de Google, primitivas de _site.scss, Headline/app-headline con su invariante, sin eyebrows numerados, limpieza de tema en specs
openapi: no aplica: el cambio es de presentación del frontend y no toca endpoints HTTP
collections: no aplica: sin endpoints HTTP
changelog: entradas bajo Unreleased: Added (identidad visual, home por secciones, páginas rediseñadas con galería) y Changed (fotos nuevas reemplazan a la de YCW, hero sin entrada palabra por palabra ni indicador, sin numeración de secciones, "Ingresar" conserva el azul)
readme: no aplica: no hay README.md en la raíz (destino declarado en sdd.config.md). El README de frontend/proyecto_angular solo nombra `team-band/` en el árbol de carpetas, que sigue siendo correcto
desvios: ninguno sustantivo entre design y código; los desvíos de implementación están en los apply-progress (headlines en un módulo propio, contenedor 72rem, line-height 1, og:image vertical, botón WhatsApp de Nosotros con .btn-site)
