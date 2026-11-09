# Tasks — sitio-publico-expresivo

Fuentes: `spec.md` (R1–R12, CA1–CA12) y `design.md` (D1–D9). Modalidad de tests:
**test-after**. Ninguna tarea cierra sin sus tests en verde. Comando:
`npx ng test --watch=false --browsers=ChromeHeadless` desde `frontend/proyecto_angular`, con
`CHROME_BIN` fijado. Cada slice cierra además con `npx ng build`, que debe dar initial
< 500 kB y ningún `css-inline-fonts` nuevo.

## Slices involucrados

| Orden | Slice | ¿Involucrado? |
|---|---|---|
| 1 | `backend-orden` | No |
| 2 | `contenido` | **Sí** (sugerido) |
| 3 | `chrome` | **Sí** (sugerido) |
| 4 | `paginas` | **Sí** (sugerido) |
| 5 | `home` | **Sí** (sugerido) |
| 6 | `intro` | No: `/acceder` es el cambio `acceso-volver-inicio` |
| — | `cierre` | **Sí** (obligatorio) |

Se sigue el orden default de la tabla. Hay una sola desviación de límites de slice: T2.3
ajusta en `contenido` las dos plantillas que consumen `TeamSection.image`
(`team-band` y `nosotros`), con el cambio mínimo de binding a `photos[0]`. Sin ese ajuste el
build queda roto entre slices. El rediseño de esas plantillas queda en `home` y `paginas`.

## Tareas

### Slice `contenido`

- **T2.1** Agregar a `content/types.ts` el tipo `HeadlinePart` y el campo opcional
  `titleParts` en los tipos de sección y página que lo usan. Cambiar `TeamSection.image` por
  `photos: readonly SiteImage[]` (D4, D7).
- **T2.2** Generar las variantes de las 3 fotos con `scripts/generate-image-variants.py`:
  `equipo-kuvu-1` con `--keep-original-as-max` (640, 1024, 1200) y `equipo-kuvu-2|3`
  (640, 960), en WebP y JPEG, dentro de `public/Imagenes_web/`. Borrar las 6
  `equipo-ycw-*` (D7, R8.1, R8.2).
- **T2.3** Actualizar `content/team.ts`: 3 `photos` con `alt` descriptivo sin nombres y
  `members` sin cambios. Ajustar con el mínimo binding los consumidores `team-band` y
  `nosotros` (`photos[0]`) (R8.3, R8.5).
- **T2.4** Agregar `titleParts` sin reescribir palabras en estos titulares:
  - el título del hero (moverlo del componente a `content/`, si hoy vive en `HERO_TITLE`);
  - qué es, servicios, seguridad, origen y CTA final;
  - el `pageTitle` de las 4 páginas de marketing en `pages.ts`.

  (D4, R6.5)
- **T2.5** Tests en `content/content.spec.ts`:
  - invariante `titleParts` → `title` para cada titular;
  - 3 fotos;
  - cada `alt` no vacío y sin ningún nombre de `members`;
  - ninguna `basePath` contiene `equipo-ycw`.

  Actualizar los specs de `team-band` y `nosotros` al binding nuevo (CA7).

### Slice `chrome`

- **T3.1** Copiar `big-shoulders-display-latin.woff2` (subset latin, eje 800–900) y `OFL.txt`
  a `public/fonts/`. Declarar la `@font-face` (`swap`, `unicode-range` latin) y
  `--font-display` en `src/styles.css`, sin `@import` de Google ni `preload` (D1, R1.3, R11.2).
- **T3.2** Escribir los tokens de escala D2 en `@theme static`, más `--grain-opacity` y el
  alias `--color-on-brand` (claro y `.dark`) (D2, D3, R4.1).
- **T3.3** Crear `src/styles/_site.scss` e incluirlo en `styles.scss`, sin `@apply`. Contiene:
  - `.site-root` con el grano en `::before` fijo;
  - `.surface-dots`, `.surface-tint`, `.block-brand` y `.display-title(-xl|-l|-m)`;
  - `em` y `.tape`, con la entrada "sello" bajo reduced motion;
  - `.btn-site` y su variante `--ghost`, con hover y active hacia la sombra solo con puntero
    fino, y foco visible sobre fondo y sobre bloque.

  `.section-eyebrow` queda para `/legal` (D3, D6, R3, R5.2, R9, R10.3, R10.4).
- **T3.4** Crear `components/public/headline/` (`<app-headline [parts] [title]>`) con su spec:
  el texto aparece una vez en el DOM y `em`/`tape` según la parte (D4, CA8).
- **T3.5** En `app-public-page`:
  - poner `.site-root` en la raíz;
  - h1 `display-l` con `titleParts` opcional vía `app-headline`;
  - hero alineado a la izquierda sobre `.surface-dots`.

  Actualizar el spec: un solo `h1`, con el texto completo (R5.1, R7.1).
- **T3.6** Header y footer: escala y tipografía nuevas; el titular de marca del footer va
  en display. "Ingresar" (desktop y menú) conserva `.btn-primary` azul (R5.4). Los specs de
  comportamiento existentes quedan intactos (R5.3).
- **T3.7** Cambiar el gradiente de `home/scroll-progress` a `--color-brand-600` →
  `--color-brand-700` (D6).
- **T3.8** Correr `ng build` y medir initial, styles y `css-inline-fonts` contra la línea base
  de D8. Hacer QA rápido de `/legal` y la 404 (herencia, CA1 parcial).

### Slice `paginas`

- **T4.1** `/servicios`:
  - servicios en filas a ancho completo con h3 `display-m`;
  - beneficios por rol en 2 columnas `.surface-tint`;
  - CTA `.block-brand`;
  - sin eyebrows.

  Actualizar el spec (R7.2).
- **T4.2** `/nosotros`:
  - secciones editoriales con el titular sticky;
  - galería asimétrica de 3 `<figure>` (Ima1 en 2 filas) y nombres en `figcaption`;
  - origen y CTA `.block-brand`;
  - sin eyebrows.

  Spec con 3 imágenes del equipo y los nombres visibles (R7.5, R8.4, R8.5).
- **T4.3** `/preguntas-frecuentes`: título de grupo `display-m` sticky, preguntas con regla
  superior y markup de pregunta y respuesta sin cambios. El spec existente sigue en verde
  (R7.3).
- **T4.4** `/contacto`:
  - formulario en superficie con borde de 2 px y sombra dura;
  - aside en `.surface-tint`;
  - pasos con numeral display;
  - sin eyebrows.

  Los specs de formulario y WhatsApp quedan sin cambios (R7.4, CA12).
- **T4.5** Verificar que ningún texto visible de las plantillas tocadas tenga `—` ni `–`
  (pre-flight de la skill).

### Slice `home`

- **T5.1** Hero: alineado a la izquierda, h1 `display-xl` vía `app-headline` con `.tape`,
  "Ingresar" con su `.btn-primary` azul + `[appMagnetic]` (R5.4) y el enlace secundario. Quitar `.hero-scroll-cue` y el
  centrado. Actualizar el spec (R6, R2.1).
- **T5.2** "Qué es": lead `display-m` en Geist con `split-text` en modo `scrub` y
  `--dim: .55`. "Origen": titular display con word-reveal, pull-quote y 2 columnas (R6.4).
- **T5.3** `steps-journey`: números de paso en display y panel sobre `.surface-dots`. El
  comportamiento sticky no cambia (spec existente en verde).
- **T5.4** Servicios en bento de 5 celdas, con 2 `.surface-tint` y 1 `.surface-dots`.
  Seguridad como lista definida sobre `.surface-dots` a sangre completa (R6.2).
- **T5.5** `companies-marquee` como cinta `.block-brand` con nombres en display y separador
  SVG `aria-hidden`. El botón de pausa se mantiene. Spec de pausa y de reduced motion
  (dobles de `motion/testing/`) (R6.3, R9.2, CA6).
- **T5.6** `team-band` sobre `.surface-tint`: foto destacada en marco con sombra dura y
  rotación estática, enderezado por `--p` solo con movimiento, y los nombres como texto.
  Spec con foto, `alt`, nombres y enlace (R8.4, R8.5).
- **T5.7** FAQ como lista con regla y CTA final `.block-brand` con `display-xl`; su botón
  "Ingresar" conserva `.btn-primary` azul (R5.4). Quitar todos los `.section-eyebrow` de la home (R4.2).
- **T5.8** Spec de la home: anclas y orden sin cambios, un solo `h1`, ningún
  `.section-eyebrow` ni `.hero-scroll-cue` (CA11, CA8).
- **T5.9** Correr `ng build`, la suite completa y QA visual con `qa.mjs` extendido:
  - `font-family` y `font-size` computados en 375 y 1280;
  - sin scroll horizontal;
  - 7 rutas × claro/oscuro;
  - diff de `/acceder`, `/login` y `/dashboard`.

  (CA1–CA3, CA9, CA10)

### Slice `cierre`

- **T6.1** Actualizar `sdd/sdd-init.md` (convenciones) con:
  - `--font-display` y la regla de autohospedar fuentes display;
  - `.site-root` y las primitivas de `_site.scss`;
  - `HeadlinePart` y la invariante `titleParts`;
  - el veto a eyebrows numerados en páginas rediseñadas.

## Forecast de riesgo

| Slice | Líneas estimadas (con tests) | Archivos |
|---|---|---|
| `contenido` | ~180 | ~8 de texto, 12 imágenes nuevas y 6 borradas |
| `chrome` | ~520 | ~14 (más el woff2 y la licencia) |
| `paginas` | ~470 | ~12 |
| `home` | ~750 | ~16 |
| `cierre` | ~20 | 1 |
| **Total** | **~1.940** | **~50 de texto y 20 binarios** |

- Umbral de `sdd.config.md`: 300 líneas. **Riesgo ALTO** (unas 6,5 veces el umbral).
- Hay un solo repo (el monorepo frontend). No se toca el backend.
- Riesgo técnico: presupuesto del bundle inicial. Home y chrome van en initial; la estimación
  es de 450–455 kB contra el warning de 500 kB (D8). `T3.8` y `T5.9` lo miden.
- El build intermedio queda verde entre slices: T2.3 mantiene compilando a los consumidores
  de `TeamSection`.

### Propuesta de PRs (estrategia `ask-on-risk`)

Son 3 PRs apilados sobre #5 (`fix/tema-claro-tokens`), en ramas encadenadas.

| PR | Rama | Slices | Líneas aprox. | Qué se revisa |
|---|---|---|---|---|
| A | `feat/sitio-publico-expresivo` | `contenido` + `chrome` | ~700 | Fuente, tokens, textura, botones, `app-headline` y fotos. Lo heredan legal y la 404 |
| B | `feat/sitio-publico-expresivo-paginas` | `paginas` | ~470 | Las 4 páginas de marketing |
| C | `feat/sitio-publico-expresivo-home` | `home` + `cierre` | ~770 | La home completa |

- La alternativa es 1 PR único de unas 1.940 líneas, que excede 6 veces el umbral.
- El paso intermedio de A deja las páginas con la tipografía nueva sobre composición vieja:
  es coherente y navegable, pero no es el estado final.
- **Nota de coordinación:** `feat/acceso-volver-inicio` sale de la misma base y toca solo
  `components/landing/`. No hay solapamiento de archivos con este cambio.

## Alcance previsto de `document`

- `openapi_afectado`: **no** (sin endpoints HTTP).
- `changelog_afectado`: **sí**, es un cambio visible del sitio público (tipografía, fondo,
  rediseño y fotos).
- `readme_afectado`: **no**, salvo que el README tenga capturas o una mención de la foto del
  equipo (lo revisa `document`).
- `architecture_afectado`: **sí**, por varios puntos:
  - `components/public/headline/`;
  - `src/styles/_site.scss` y `.site-root`;
  - `public/fonts/`;
  - `TeamSection.photos`;
  - el reemplazo de la foto YCW en la sección de imágenes.
- `guidelines_afectado`: **sí**, si `DEVELOPMENT_GUIDELINES.md` cubre estilos del sitio
  público. Hay que agregar la convención de autohospedar fuentes display, la de no usar
  `@import` de Google en componentes y las primitivas de `_site.scss`. Lo confirma `document`.
- Documento del cambio: `docs/sitio-publico-expresivo.md`.
