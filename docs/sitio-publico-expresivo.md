# Sitio público expresivo

El sitio público de KUVU (home, `/servicios`, `/nosotros`, `/preguntas-frecuentes`,
`/contacto`, más `/legal` y la 404 por herencia) tiene una identidad editorial propia. Usa
titulares grandes en una tipografía display condensada, una escala fluida que aprovecha el
ancho, fondo con grano y trama, bloques a sangre completa en el verde de marca y movimiento
ligado al scroll. Los colores salen de los tokens de marca existentes: no hay valores nuevos.
La sección del equipo muestra las tres fotos del equipo.

## Cómo funciona

- **Tipografía.**
  - Los titulares usan Big Shoulders Display (SIL OFL), un woff2 del subset latin en
    `frontend/proyecto_angular/public/fonts/` con su `OFL.txt`.
  - La `@font-face` y el token `--font-display` están en `src/styles.css`. El cuerpo y la
    interfaz siguen en Geist (`--font-sans`).
  - La escala fluida vive en `@theme static`: `--text-display-xl` (hero y CTA final),
    `--text-display-l` (h1 de página y h2 de sección), `--text-display-m`, `--text-lead` y
    `--text-body-site`.
  - El `body` global se queda en 14 px para la app interna. El sitio toma su tamaño de cuerpo
    de `.site-root`.
- **Primitivas** (`src/styles/_site.scss`, incluidas por `styles.scss`, sin `@apply`):
  - `.site-root` está en la raíz de `home.component.html` y de `app-public-page`. Fija el
    cuerpo fluido y el fondo, y dibuja el grano en un `::before` fijo
    (`pointer-events: none`, `z-index: 60`) con un SVG `feTurbulence` inline. La opacidad sale
    de `--grain-opacity`.
  - Superficies: `.surface-dots` (trama de puntos) y `.surface-tint` (`--color-brand-100`).
  - `.block-brand` (`--color-brand-700`) lleva el texto en `--color-on-brand`, un alias de
    `--color-home-bg` en claro y de `--color-home-text` en oscuro.
  - `.display-title(--xl|l|m)` va en mayúsculas con `line-height: 1`. Dentro, `em` es el
    énfasis en `--color-brand-600` y `.tape` la cinta de marca girada, con una entrada "sello"
    cuando hay movimiento.
  - `.btn-site` y `.btn-site--ghost` son botones pill con borde de 2 px y sombra dura; con
    puntero fino avanzan hacia la sombra.
  - `.site-section`, `.site-section-head` y `.site-cta` dan el ritmo de las páginas internas.
- **Titulares con énfasis.**
  - `content/headlines.ts` declara cada titular partido (`Headline` = `title` + `parts`).
  - `<app-headline [parts] [title]>` (`components/public/headline/`) lo renderiza en línea
    dentro del `h1`/`h2` del llamador, con el texto una sola vez en el DOM.
  - `app-public-page` acepta `titleParts` para el h1 de cada página.
- **Home** (`components/home/`): cada sección tiene su composición.
  - El hero (`hero/`) es un manifiesto tipográfico alineado a la izquierda, con "empresas" en
    cinta.
  - "Qué es" es un statement que se enciende palabra por palabra con `<app-split-text
    mode="scrub">`.
  - "Cómo funciona" es el recorrido sticky (`steps-journey/`) sobre `.surface-dots`.
  - Servicios es un bento de cinco celdas, una por servicio.
  - Seguridad es una lista con regla sobre trama a sangre completa.
  - Compañías (`companies-marquee/`) es una cinta de marca con los nombres en display y
    separador ✳ decorativo; se pausa con su botón y queda estática con movimiento reducido.
  - El equipo (`team-band/`) muestra la foto destacada en un marco girado que se endereza con
    el scroll en escritorio.
  - Origen tiene un titular con word-reveal, un pull-quote y dos columnas.
  - FAQ es una lista con regla.
  - El CTA final es un `.block-brand` con `display-xl`.
- **Páginas** (`components/pages/`):
  - `/servicios` muestra los servicios en filas con regla y los beneficios por rol en dos
    columnas tintadas.
  - `/nosotros` tiene secciones con el titular sticky y la galería asimétrica de las tres
    fotos.
  - `/preguntas-frecuentes` lleva el título de grupo sticky.
  - `/contacto` presenta el formulario en una tarjeta con sombra dura y los pasos en una banda
    de marca.
  - Cada página termina en un bloque de marca. `/legal` y la 404 heredan `.site-root` y el h1
    display de `app-public-page`.
- **Fotos del equipo.**
  - `content/team.ts` declara `photos` con `equipo-kuvu-1` (1200×1600, variantes
    640/1024/1200) y `equipo-kuvu-2|3` (960×1280, variantes 640/960), en WebP y JPEG dentro de
    `public/Imagenes_web/`.
  - Las variantes se generan con `scripts/generate-image-variants.py --keep-original-as-max`.
  - Los `alt` describen la escena sin nombrar a los integrantes. Los nombres se muestran como
    texto (`team.members`).
  - La imagen para compartir (`SHARE_IMAGE_PATH`) es `equipo-kuvu-1-1024.jpeg`.

## Decisiones

- **Display condensada.** "ADMINISTRACIÓN" e "INMOBILIARIAS" entran a 375 px con tamaño
  display real. El tope de `--text-display-xl` (7,5 rem) supera el de una grotesca normal
  porque una condensada ocupa menos ancho.
- **Fuente autohospedada, sin `@import` ni `preload`.** No se incrusta en el CSS (no toca el
  warning `css-inline-fonts`) y solo la descargan las páginas que la usan. A cambio, el `swap`
  puede mover líneas al llegar la fuente; el respaldo angosto (`Arial Narrow`) lo acota.
- **Grano por encima del contenido.** Textura también bloques e imágenes. Su opacidad baja
  (0,06 en claro, 0,05 en oscuro) mantiene los contrastes medidos con margen.
- **"Ingresar" conserva el azul de la app** (`.btn-primary`) como excepción al acento único
  del sitio. El resto de los CTAs usa `.btn-site`.
- **Sin eyebrows numerados** en las páginas rediseñadas: el titular display ordena la página.
  `.section-eyebrow` se mantiene solo en `/legal`.
- **Movimiento sin dependencias.** Reusa `src/app/motion/`, todo dentro de
  `prefers-reduced-motion: no-preference`. El estado atenuado del word-reveal (`--dim: .65`)
  deja el texto en 4,66:1 en claro y 7,1:1 en oscuro.

## Limitaciones conocidas

- En modo oscuro, la cinta (`.tape` sobre `--color-brand-700`) contrasta poco con el fondo
  oscuro como superficie. El texto se lee (8,55:1), pero el efecto de cinta pierde fuerza.
- La imagen para compartir es vertical (3:4) y las redes la recortan en la vista previa.
- Los `alt` de las fotos no nombran a los integrantes: falta saber su orden en cada foto.
- El bloque `.container` (72rem) se repite en cada componente de página. Unificarlo en una
  primitiva global queda como deuda registrada en el refinamiento.
- La verificación visual de `/dashboard` contra la base se hizo por código, no por captura.
