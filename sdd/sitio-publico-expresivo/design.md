# Design — sitio-publico-expresivo

Implementa `spec.md` (R1–R12). Dirección visual con la skill `sds-design-taste`.

## Design read y diales

**Leyendo esto como:** rediseño *overhaul* del sitio de marketing de un SaaS inmobiliario
académico, para gerentes de inmobiliarias y evaluadores de la universidad. Lenguaje de
**rótulo de fachada** (los letreros "SE ARRIENDA" pintados a mano y las placas de edificio),
orientado a CSS nativo + Tailwind v4 + las piezas de movimiento propias de `src/app/motion/`.

- Registro **Brand** en el sitio público. La app interna no se toca.
- Diales: `DESIGN_VARIANCE 7 / MOTION_INTENSITY 6 / VISUAL_DENSITY 4`. Es un overhaul (+2)
  sobre la base actual (5/4/4) con densidad igual.
- Estrategia de color **Committed**: el verde de marca cubre entre el 25 % y el 35 % de la
  superficie de la home (cinta, banda del equipo, CTA final, énfasis). Sobre fondo papel
  granulado. Referencia: el verde de los letreros de obra y arriendo sobre revoque.
- Las tres palabras de voz son **rótulo + ladrillo + ordenado**. Las fotos nuevas, frente a un
  edificio de ladrillo, sostienen esa lectura.

## Decisiones

### D1. Familia display: Big Shoulders Display (OFL), autohospedada

- Es una grotesca condensada de rotulación urbana. Se usa en MAYÚSCULAS, peso 800–900.
- **Por qué esta:**
  - Es condensada. "ADMINISTRACIÓN" e "INMOBILIARIAS" caben a 375 px con un tamaño display
    real (R2.5); una display ancha obligaría a bajar el tamaño o a cortar palabras.
  - Encaja con la voz de rótulo.
  - Tiene los glifos del español: tildes, ñ, ¿ y ¡. Están verificados en el render de prueba
    de `scratchpad/fonttest/t.png`.
  - No está en la lista de rechazo de la skill ni en la referencia.
- **Descartadas:**
  - Archivo Black, por ser la de la referencia.
  - Anton y Bebas Neue, por sobreusadas.
  - Unbounded y Syne, por anchas o ya usadas en `/acceder` y en la lista de rechazo.
  - Geist 900 sola: el usuario pidió una tipografía distinta y no alcanza contraste de voz.
- **Carga:**
  - El subset latin del eje 800–900 se copia a
    `public/fonts/big-shoulders-display-latin.woff2` (35 KB), junto con su `OFL.txt`.
  - La `@font-face` va en `src/styles.css` con `font-display: swap` y
    `unicode-range` latin.
  - **No hay `@import` de Google Fonts** para esta familia. Así no entra al mecanismo de
    inline de fuentes y el warning `css-inline-fonts` no cambia (R11.2).
  - **Sin `preload`**: el navegador solo descarga la fuente cuando una regla la usa, así que
    `/acceder`, `/login` y la app interna nunca la piden. El LCP de la home es texto y
    `swap` lo muestra de inmediato con el respaldo.
- **Respaldo métrico:** `"Big Shoulders Display", "Arial Narrow", "Roboto Condensed",
  Impact, sans-serif`. Es una fuente angosta, así que el salto al llegar la display es
  menor (R1.3).
- **Token:** `--font-display` en el bloque `@theme static` de `src/styles.css`, junto a
  `--font-sans` (Geist sigue igual).

### D2. Escala tipográfica fluida como tokens

Los tokens van en `@theme static` y todos son `clamp(min, rem + vw, max)`, que escala de forma
continua (R2.4):

| Token | Valor | 375 px | 1280 px |
|---|---|---|---|
| `--text-display-xl` (hero, CTA final) | `clamp(2.75rem, 1.2rem + 7.6vw, 7.5rem)` | ≈ 47 px | ≈ 116 px |
| `--text-display-l` (h1 de página, h2 de sección) | `clamp(2.25rem, 1.4rem + 4.6vw, 5rem)` | ≈ 40 px | ≈ 81 px |
| `--text-display-m` (h3 display, numerales) | `clamp(1.75rem, 1.2rem + 2.2vw, 3rem)` | ≈ 28 px | ≈ 47 px |
| `--text-lead` | `clamp(1.25rem, 1rem + 0.9vw, 1.75rem)` | ≈ 20 px | ≈ 27 px |
| `--text-body-site` | `clamp(1rem, 0.93rem + 0.35vw, 1.1875rem)` | ≈ 16 px | 19 px |

- Display: `line-height: .92`, `letter-spacing: -0.005em` (la condensada no necesita
  tracking negativo) y `text-wrap: balance`. Cuerpo: `line-height: 1.6` y
  `max-width: 65ch`.
- El máximo de 7,5 rem supera el techo de 6 rem de la skill a propósito. Una condensada a
  120 px ocupa el ancho de una grotesca normal a unos 80 px, así que el techo efectivo se
  respeta.
- El `body` global sigue en 14 px para la app interna. El sitio público toma
  `--text-body-site` desde la raíz de sitio (D3).

### D3. Raíz de sitio y primitivas globales (`src/styles/_site.scss`)

Es un parcial nuevo, incluido por `styles.scss` y escrito sin `@apply`. Concentra lo que
heredan las 7 rutas públicas, incluidas `/legal` y la 404 (R5.1):

- **`.site-root`**: va en el elemento raíz de `home.component.html` y de `app-public-page`.
  Fija `font-size: var(--text-body-site)`, el fondo `--color-home-bg` y el grano.
- **Grano (R3):** un `::before` de `.site-root` con `position: fixed; inset: 0;
  pointer-events: none`, `z-index` en la escala documentada (debajo del header), sobre un SVG
  `feTurbulence` inline en data-URI (sin descarga, R3.4).
  - Va en un pseudo-elemento fijo y no en contenedores con scroll, para no repintar.
  - Opacidad en el token `--grain-opacity`: `.06` en claro y `.05` en `.dark`.
- **`.surface-dots`**: una trama `radial-gradient` de 1 px cada 14 px con
  `color-mix(in oklab, var(--color-brand-600) 22%, transparent)`.
- **`.surface-tint`**: fondo `--color-brand-100`.
- **`.block-brand`**: bloque a sangre completa con fondo `--color-brand-700` y texto
  `--color-on-brand`.
- **`--color-on-brand`** es un alias, no un valor nuevo (R4.1): `var(--color-home-bg)` en
  claro y `var(--color-home-text)` en `.dark`. `--color-brand-700` no tiene override oscuro,
  así que el bloque es el mismo verde en ambos temas.
- **`.display-title`** (y sus variantes `-xl`, `-l` y `-m`): `font-family: var(--font-display)`,
  uppercase y escala D2.
- **Énfasis (R4.3):**
  - `.display-title em` se pinta en `--color-brand-600` y queda en la misma familia, como pide
    la skill.
  - `.tape` es una cinta de fondo `--color-brand-700` con texto `--color-on-brand`,
    `rotate(-1.5deg)` estático y `box-decoration-break: clone`.
- **`.btn-site`** y **`.btn-site--ghost`** (R5.2):
  - Mantienen la forma pill del Shape Lock documentado ("botones pill, cards 16, íconos 12").
  - Lo que cambia la lectura es el borde de 2 px en `--color-home-text` y una **sombra dura
    sin blur** (`4px 4px 0` en `--color-home-text`).
  - En hover con puntero fino, el botón se desplaza hacia su sombra con `translate`, y en
    `:active` la toca.
  - Aplica a todos los CTAs salvo "Ingresar" (R5.4). El primario usa relleno `--color-brand-700` con `--color-on-brand`; el ghost es
    transparente con texto `--color-home-text`.
  - El foco visible es un anillo `--color-brand-600` con offset de 3 px. Sobre `.block-brand`
    pasa a `--color-on-brand` (R10.3).
- **`.section-eyebrow`** se conserva solo para `/legal`. Las páginas rediseñadas lo
  eliminan: los eyebrows numerados ("01", "02") están vetados por la skill y el titular
  display alcanza.

**Contraste de los pares que usa el diseño** (calculado con los tokens; R10.1):

| Par | Claro | Oscuro |
|---|---|---|
| Texto / fondo | 15+ | 15+ |
| `brand-600` (em) / fondo | 6.95 | 7.52 |
| `on-brand` / `brand-700` | 9.12 | 8.55 |
| muted / fondo | 6.78 | 8.08 |
| Texto / `brand-100` | 12.85 | (brand-100 oscuro `#22301f`) ≥ 10 |

El estado atenuado del word-reveal (D6) usa `--dim: .55` sobre texto display (≥ 24 px). Su
contraste se mide en `verify` y debe ser ≥ 3:1.

### D4. Titulares con énfasis desde el contenido

- Hay un tipo nuevo en `content/types.ts`:
  `HeadlinePart = string | { readonly text: string; readonly em: 'accent' | 'tape' }`.
- Los módulos de contenido declaran `titleParts` junto al `title` existente; `title` sigue
  siendo la fuente para meta, `aria` y tests.
- **Invariante testeada:** la concatenación de los textos de `titleParts` es igual a `title`.
  Así se parte sin reescribir (R6.5).
- **`<app-headline [parts] [title]>`** (`components/public/headline/`):
  - Renderiza spans en línea dentro del `h1`/`h2` del llamador.
  - El texto queda en el DOM una sola vez, sin `aria-label` ni copias (R4.3, CA8).
  - Sin `parts`, renderiza `title`.
- Por ahora lo usan el hero, cuatro titulares de la home y el h1 de las 4 páginas de
  marketing (vía `app-public-page`, que recibe `titleParts` opcional).

### D5. Composición: una familia de layout por sección

Se aplican las reglas de la skill: sin split-header, sin tres cards iguales, sin zigzag 3+,
un solo marquee por página, sin scroll cue y sin numeración de secciones. Todo lo multicolumna
colapsa a una columna por debajo de 768 px.

**Home** (orden y anclas sin cambios, R6.1):

| Sección | Tratamiento | Familia de layout |
|---|---|---|
| Hero | Fondo granulado. Alineado a la izquierda, `display-xl` con una palabra en `.tape`, lead y `.btn-site` + enlace. Se quitan `.hero-scroll-cue` y el centrado | Manifiesto tipográfico |
| Qué es | Lead gigante (`--text-display-m` en Geist 500) con word-reveal scrub | Statement de una columna |
| Cómo funciona | `steps-journey` sticky existente, con números de paso en display y su panel sobre `.surface-dots` | Scroll-pinned |
| Servicios | Bento de exactamente 5 celdas (5 servicios), con 2 celdas `.surface-tint` y 1 `.surface-dots` | Bento |
| Seguridad | Titular apilado y lista de definiciones con regla superior, sobre `.surface-dots` a sangre completa | Lista definida |
| Compañías | `companies-marquee` como cinta `.block-brand` con nombres en display y separador ✳ SVG `aria-hidden`; conserva el botón de pausa (R6.3) | Marquee (único) |
| Equipo | `team-band` sobre `.surface-tint`: foto destacada (Ima1, 3:4) en marco con borde de 2 px, sombra dura y `rotate(-2deg)` estático, junto al titular, el lead, los nombres y el enlace | Split imagen-texto (único) |
| Origen | Titular display con word-reveal scrub (R6.4); el primer párrafo como pull-quote en `--text-lead` y el resto en 2 columnas de texto | Editorial |
| FAQ | Lista con regla superior por ítem y pregunta en Geist 600 a `--text-lead` | Lista Q/A |
| CTA final | `.block-brand` a sangre completa, `display-xl`, el botón "Ingresar" con su `.btn-primary` azul (R5.4) | CTA a sangre |

**Páginas de marketing** (R7), todas sobre `app-public-page`:

- **Hero común:** breadcrumb, h1 `display-l` con `titleParts` y lead, alineado a la
  izquierda, sobre `.surface-dots` con borde inferior de 2 px.
- **`/servicios`:**
  - Servicios en filas a ancho completo (ícono a 56 px, h3 `display-m`, descripción) con
    regla superior.
  - Beneficios por rol en 2 columnas `.surface-tint`.
  - Cierra con un CTA `.block-brand`.
- **`/nosotros`:**
  - Secciones editoriales con el titular `sticky` a la izquierda y el texto a la derecha.
    Es un layout de lectura larga, no un split-header de sección.
  - **Galería del equipo:** grilla asimétrica con Ima1 ocupando 2 filas, e Ima2 e Ima3
    apiladas, cada una con `<figure>`. Los nombres van en un `figcaption` común debajo.
  - Origen y CTA `.block-brand`.
- **`/preguntas-frecuentes`:** el título de grupo `display-m` va `sticky` a la izquierda y las
  preguntas a la derecha con regla superior. El markup de pregunta/respuesta no cambia (R7.3).
- **`/contacto`:**
  - El formulario va en una superficie con borde de 2 px, radio 16 y sombra dura.
  - El aside de canales va en `.surface-tint`.
  - Los pasos llevan su numeral en display, porque son contenido ordinal y no eyebrow.
  - La lógica, los campos y los specs no cambian (R7.4).
- **`/legal` y la 404:** sin cambios de plantilla. Heredan `.site-root` (fondo, grano y
  cuerpo) y el h1 `display-l` de `app-public-page` (R5.1).
- **Header y footer:**
  - Wordmark y navegación en Geist; "Ingresar" conserva `.btn-primary` azul (R5.4).
  - Footer: el titular de marca en display y las columnas sin cambios.
  - Todos los comportamientos de R5.3 quedan intactos (solo cambia el CSS).

### D6. Movimiento (sin dependencias nuevas, R9)

- Se reusan `[data-reveal]`, `<app-split-text>` (`enter` en el hero y `scrub` en "Qué es" y
  "Origen"), `ScrollMotionService`, `[appScrollProgress]` y `[appMagnetic]` (CTA del hero y
  CTA final).
- **Nuevo, solo CSS:**
  - Entrada "sello" de `.tape`: escala de 1.08 a 1 y rotación de -4° a -1.5°, una vez, al
    revelarse.
  - Desplazamiento de `.btn-site` hacia su sombra.
  - La foto destacada del equipo endereza su rotación unos 2° según `--p`.

  Todo esto queda dentro de `@media (prefers-reduced-motion: no-preference)`, y lo de puntero
  además dentro de `(hover: hover) and (pointer: fine)` (R9.2, R9.3).
- El word-reveal scrub de titulares usa `--dim: .55` (D3). Sin JS, `--p` vale 1 por defecto y
  el texto queda pleno (R9.4).
- La barra de progreso de lectura cambia el gradiente `--color-primario` →
  `--color-secundario` (los tokens de la app) por `--color-brand-600` → `--color-brand-700`,
  para cumplir el Color Consistency Lock.

### D7. Fotos del equipo

- **Variantes:** se generan con `scripts/generate-image-variants.py`:
  - `Ima1.jpeg` (1200×1600) → `equipo-kuvu-1-{640,1024}` y el original de 1200 con
    `--keep-original-as-max`.
  - `Ima2.jpeg` e `Ima3.jpeg` (960×1280) → `equipo-kuvu-2|3-{640}` y el de 960 como máximo.
  - Todas en WebP y JPEG dentro de `public/Imagenes_web/`. Los originales no tienen EXIF, así
    que no hay metadatos que limpiar.
- **Se eliminan** las 6 variantes `equipo-ycw-*` (decisión del Gate).
- **Contenido** (`content/team.ts` y `types.ts`):
  - `TeamSection.image` pasa a `photos: readonly SiteImage[]` con 3 elementos, y la
    destacada es `photos[0]`.
  - `members` se mantiene y los nombres se muestran como texto (R8.5).
  - Los `alt` son descriptivos y sin nombres, por ejemplo: "Los tres estudiantes del equipo
    KUVU, de pie frente a un muro de ladrillo, con mochilas", y variantes con el edificio de
    vidrio para Ima2 e Ima3 (R8.3).
- **Render:** con `app-responsive-image` existente (`width`/`height` declarados,
  `loading="lazy"`, R8.2). En la home, `sizes="(min-width: 768px) 40vw, 90vw"`; en
  `/nosotros`, según la celda de la grilla.

### D8. Presupuesto (R11): sin tocar `angular.json`

- **Línea base**, medida en un worktree de `fix/tema-claro-tokens` con `ng build`:
  - initial **438,52 kB** (styles 29,10 kB), 62 kB por debajo del warning de 500 kB;
  - los únicos `css-inline-fonts` son los de `/acceder` y `/login` (19,14 kB y 18,32 kB, Syne +
    Inter, preexistentes).
- **Estimado del cambio:** global +4–6 kB (`_site.scss` y tokens) y home +6–9 kB (estilos de
  componente en el chunk inicial). Total ≈ 450–455 kB. Los estilos de las páginas de
  marketing van en sus chunks lazy. La fuente es un asset de `public/` y no cuenta en el
  bundle.
- Los estilos de componente se mantienen por debajo de 17 kB (el más grande hoy es la home,
  con 7,7 kB).
- `angular.json` **no se modifica**. Si `apply` midiera más de 495 kB, primero mueve estilos
  de secciones bajo el pliegue a componentes `@defer` y lo reporta; no sube el umbral.

### D9. Tests y QA (R12, CA1–CA12)

- **Karma (test-after, por slice):**
  - **Contenido:**
    - invariante `titleParts` → `title`;
    - 3 fotos con `alt` no vacío que no incluye ningún nombre de `members`;
    - ninguna ruta de imagen contiene `equipo-ycw`.
  - **`app-headline`:** el texto aparece una vez, con `em`/`tape` según la parte.
  - **`team-band`:** renderiza la foto destacada, los nombres y el enlace.
  - **`/nosotros`:** 3 `<img>` del equipo.
  - **Home:** anclas y orden de secciones sin cambios, sin `.section-eyebrow` y sin
    `.hero-scroll-cue`; un solo `h1`.
  - **`companies-marquee`:** el botón de pausa sigue funcionando y, con reduced motion
    simulado (dobles de `motion/testing/`), no anima.
  - **`/contacto`:** los specs existentes quedan sin cambios.
- **QA visual:** `qa.mjs` se extiende con mediciones de `font-family` y `font-size`
  computados (hero, h1, h2, párrafo y lead), `scrollWidth > clientWidth` y capturas de las 7
  rutas × 375/1280 × claro/oscuro, más el diff de `/acceder`, `/login` y `/dashboard` contra
  la línea base (CA10).
- **Pre-flight de la skill en `verify`:**
  - grep de `—` y `–` en las plantillas y el contenido tocados;
  - conteo de eyebrows;
  - un solo marquee por página;
  - CTAs sin intención duplicada: "Ingresar" es el único CTA principal y "Contáctanos" el
    secundario.

## Archivos por slice

| Slice | Archivos |
|---|---|
| `contenido` | `content/types.ts` (`HeadlinePart`, `TeamSection.photos`), `content/team.ts`, módulos con `titleParts` (`about`, `services`, `security`, `origin`, `pages` y el título del hero), `content/content.spec.ts`; `public/Imagenes_web/equipo-kuvu-*` (nuevos) y `equipo-ycw-*` (borrados) |
| `chrome` | `src/styles.css` (`@font-face`, `--font-display`, escala), `src/styles/_site.scss` (nuevo), `src/styles.scss` (`@use`), `public/fonts/` (woff2 y OFL), `components/public/headline/` (nuevo), `site-header`, `site-footer`, `public-page` (`.site-root`, `titleParts`), `home/scroll-progress` (gradiente) |
| `paginas` | `components/pages/{servicios,nosotros,preguntas-frecuentes,contacto}` (plantilla, scss y spec) |
| `home` | `components/home/home.component.*`, `hero/`, `steps-journey/`, `companies-marquee/`, `team-band/`, `_section-heading.scss` |
| `cierre` | `sdd/sdd-init.md` (convenciones: `--font-display`, `.site-root`, primitivas de `_site.scss`, `HeadlinePart`) |

## Riesgos y alternativas descartadas

- **GSAP/ScrollTrigger** (los usa la referencia): descartado por el no-objetivo de no sumar
  dependencias y porque `motion/` ya cubre pin, scrub y reveal.
- **Google Fonts `@import` de la display:** descartado, porque haría crecer el CSS inline y el
  warning `css-inline-fonts`.
- **Grano como imagen PNG:** descartado (R3.4); el SVG inline cuesta menos de 400 bytes.
- **Raíz de sitio vía clase en `<html>` por ruta:** descartada. `.site-root` en los dos layouts
  públicos alcanza y no necesita lógica de router.
- **Riesgo:** sin un ancho reservado para la display, el `swap` puede mover líneas del h1.
  Se mitiga con el respaldo condensado y `text-wrap: balance`; `verify` lo mide con CLS en
  QA.
- **"Ingresar" azul (decisión del usuario, R5.4):** los botones "Ingresar" mantienen
  `.btn-primary` con el gradiente `--color-primario` → `--color-secundario`, como excepción
  explícita al lock de acento único: es el puente visual hacia la app, que usa esos tokens.
  `.btn-site` cubre el resto de los CTAs ("Contáctanos", enlaces de sección, formulario).
