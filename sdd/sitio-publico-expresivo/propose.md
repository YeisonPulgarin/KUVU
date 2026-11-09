# Propose — sitio-publico-expresivo

## Intent

El sitio público de KUVU se lee como una plantilla: una sola tipografía, texto chico que no
aprovecha el ancho, fondo plano y secciones con el mismo ritmo. Este cambio le da una
identidad editorial propia (titulares grandes con una display pesada, escala fluida, fondo con
textura, secciones con carácter y movimiento) **sin cambiar los colores de marca**, y muestra
al equipo real con sus fotos nuevas.

## Alcance

- **Sistema tipográfico:** una familia display pesada, distinta de la de la referencia, solo
  para titulares; Geist sigue para cuerpo e interfaz. Escala fluida con `clamp()` para display,
  títulos de sección, leads y cuerpo, con un cuerpo de lectura más grande que el actual.
- **Fondo y textura:** fondo tipo papel con grano de ruido y trama de puntos, construidos con
  los tokens existentes (`--color-brand-*`, `--color-home-*`). Claro y oscuro reciben el mismo
  tratamiento, textura incluida.
- **Uso del color:** sin valores nuevos. El verde de marca pasa a usarse también en bloques a
  sangre completa, cintas y el CTA final, y como color de énfasis dentro de los titulares.
- **Rediseño completo** (composición, jerarquía y movimiento) de la home y de `/servicios`,
  `/nosotros`, `/preguntas-frecuentes` y `/contacto`, incluido el chrome compartido (header,
  footer, `app-public-page`, botones/enlaces del sitio).
- **Herencia sin rediseño** en `/legal` y la 404: toman la nueva tipografía, la escala y el
  fondo a través del chrome compartido, sin cambios de composición propios.
- **Movimiento:** recursos inspirados en la referencia (palabras que se revelan con el scroll,
  cintas marquee, énfasis tipo "cinta", hover con desplazamiento), sobre las piezas de
  `src/app/motion/` existentes y siempre respetando `prefers-reduced-motion`.
- **Fotos del equipo:** las 3 fotos de `Downloads/Equipo Kuvu` reemplazan a la foto YCW de
  traje en la banda del equipo de la home y en `/nosotros`, con variantes responsive generadas
  por el script existente y `alt` descriptivo sin nombres. La foto YCW sale del sitio.

## No-objetivos

- Cambiar valores de color de marca o agregar colores nuevos al sitio público.
- Copiar textos, marca, logos, ilustraciones o la composición literal de salomondevsystems.com.
- Reescribir el contenido textual del sitio (`content/*.ts`) más allá de lo que la nueva
  composición requiera (por ejemplo, partir un titular para resaltar una palabra).
- Agregar dependencias de animación (GSAP u otras) o 3D/WebGL.
- Rediseñar la composición de `/legal` y la 404.
- Nombrar a los integrantes en el `alt` de las fotos nuevas (queda para cuando el usuario dé
  el orden).
- **Trabajo futuro, cambios separados en este orden:**
  - `acceso-volver-inicio` — botón para volver a la home desde `/acceder`.
  - `app-interna-ux` — botones con semántica visual, diálogos y animaciones en la app interna
    (admin y arrendatario).

## Approach

1. **Base compartida primero:** tokens tipográficos (familia display, escala fluida), fondo con
   textura y estilos de botón/enlace en el chrome global, para que todas las páginas públicas
   (incluidas legal y 404) los hereden de una vez.
2. **Componentes de sección reutilizables** para los recursos nuevos (titular con énfasis,
   cinta/marquee, word-reveal), apoyados en `<app-split-text>`, `ScrollMotionService` y los
   reveals existentes.
3. **Home**, luego **páginas de marketing** (servicios, nosotros, FAQ, contacto) aplicando esa
   base; la banda del equipo y `/nosotros` estrenan las fotos nuevas.
4. **Presupuesto bajo control:** el bundle inicial está en ~500 kB (límite de warning) y ya
   existe el warning `css-inline-fonts`. La fuente display se carga de forma que no empeore
   ninguno de los dos; texturas en CSS/SVG inline, sin imágenes de fondo nuevas.
5. Dirección visual guiada por la skill `sds-design-taste` en `design`.

Rama: `feat/sitio-publico-expresivo` desde `fix/tema-claro-tokens`, con el PR apilado sobre
#5. Riesgo de revisión alto (más de 300 líneas): `tasks` evalúa si se parte en 2 PRs (base y
chrome / home y páginas).
