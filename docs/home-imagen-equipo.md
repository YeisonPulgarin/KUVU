# Foto del equipo en la home y en Nosotros

El sitio público muestra la foto del equipo YCW Systems, los tres creadores de KUVU (Wilson
Solano, Carlos Arciniegas y Yeison Pulgarin), en dos lugares:

- La home tiene una banda a ancho completo, "El equipo detrás de KUVU", con la foto de fondo, una bajada, los nombres y un link a `/nosotros`.
- `/nosotros` muestra la foto completa con los nombres al pie.

Las dos instancias salen de un patrón reutilizable para imágenes responsive: la imagen se
declara como contenido tipado y un componente compartido la sirve en WebP con respaldo JPEG, en
varios anchos y con carga diferida.

## Cómo funciona

### Assets

Las imágenes del sitio público viven en `frontend/proyecto_angular/public/Imagenes_web/` con la
convención `{nombre-base}-{ancho}.{webp|jpeg}`:

| Archivo | Ancho × alto |
|---|---|
| `equipo-ycw-640.{webp,jpeg}` | 640 × 427 |
| `equipo-ycw-1024.{webp,jpeg}` | 1024 × 683 |
| `equipo-ycw-1536.{webp,jpeg}` | 1536 × 1024 (el JPEG es el original sin recomprimir) |

Las variantes las genera `frontend/proyecto_angular/scripts/generate-image-variants.py` (Python
3 + Pillow). Para cada ancho de `(640, 1024, 1536)` que no supere el del original escribe un WebP
(calidad 80) y un JPEG progresivo (calidad 82), conservando el aspecto. Con
`--keep-original-as-max`, el JPEG del ancho original es una copia exacta del archivo de origen.
El script se corre a mano y no forma parte del build. El README del frontend explica cómo usarlo.

### Contenido

- `src/app/content/types.ts` define `SiteImage` (`basePath`, `widths`, `width`, `height`, `alt`, `caption?`) y `TeamSection` (`title`, `lead`, `linkLabel`, `members`, `image`).
- `src/app/content/team.ts` es la fuente única de la banda y de la foto:
  - título "El equipo detrás de KUVU";
  - bajada: "Somos YCW Systems, los tres estudiantes universitarios que crearon KUVU en la biblioteca de su universidad.", sostenida por `content/origin.ts`;
  - botón "Conocé al equipo";
  - integrantes en el orden de la foto, de izquierda a derecha;
  - `image` con `basePath: '/Imagenes_web/equipo-ycw'` y un caption derivado de los integrantes (`Wilson Solano · Carlos Arciniegas · Yeison Pulgarin`).

### Componente de imagen

`src/app/components/public/responsive-image/` (`app-responsive-image`) recibe un `SiteImage` y
renderiza:

```html
<picture>
  <source type="image/webp" srcset="{base}-640.webp 640w, …" sizes="…">
  <img src="{base}-{ancho mayor}.jpeg" srcset="{base}-640.jpeg 640w, …" sizes="…"
       width="{width}" height="{height}" alt="…" loading="lazy" decoding="async">
</picture>
```

Inputs:
- `image` (requerido).
- `sizes` (default `100vw`).
- `decorative`: renderiza `alt=""`.
- `fit`: `contain` por default; `cover` recorta para llenar el contenedor.

El encuadre del modo `cover` se ajusta desde afuera con la custom property
`--responsive-image-position`.

### Banda de la home

`src/app/components/home/team-band/` es un componente con selector de atributo
(`section[app-team-band]`). La home lo aplica sobre su propio `<section id="equipo">`, ubicado
entre `#companias` y `#origen`, así que la sección sigue siendo hija directa de `.home-layout`.

- **≥ 768px**: la foto es fondo (`fit="cover"`, decorativa, `sizes="100vw"`, encuadre `center 10%` para que el logo YCW entre en el recorte). Encima va un velo `::after` en verde de marca, denso en el 60 % inferior, donde va el texto, y liviano arriba, donde están las caras y el logo. El texto va abajo a la izquierda.
- **< 768px**: la banda se apila. Arriba, la foto completa en 3:2; abajo, el texto sobre fondo verde sólido.
- El texto es blanco fijo y la banda se ve igual en tema claro y oscuro. El contraste medido es ≥ 6:1 en todos los anchos.
- El bloque de texto usa `data-reveal`. `aria-labelledby` apunta al H2.

### Página Nosotros

`src/app/components/pages/nosotros/` agrega una sección `.team` entre las secciones "about" y
"Origen":
- un `<figure>` con la foto completa (`fit="contain"`, `sizes="(min-width: 1152px) 1104px, 100vw"`), bordes redondeados y sombra;
- un `<figcaption>` con los nombres.

Acá la imagen no es decorativa: su `alt` describe al equipo.

### Tests

- `content.spec.ts`: forma de `team`.
- `responsive-image.component.spec.ts`: `srcset`, `sizes`, dimensiones, carga diferida, `alt`, `fit`.
- `team-band.component.spec.ts`: verde resuelto, texto blanco, encuadre, velo.
- `home.component.spec.ts`: contenido de la banda y orden de las secciones.
- `nosotros.component.spec.ts`: figura y caption.

## Decisiones

- **Verde de la banda con fallback propio** (`--team-band-green: var(--color-brand-700, #2f4a2f)`). Tailwind v4 solo emite al CSS global los tokens de `@theme` que usa, y `--color-brand-700` aparece solo en estilos de componentes, así que en runtime no existe. Sin el fallback, la banda queda sin velo ni fondo y el texto blanco se vuelve ilegible. Tradeoff: el valor del token se repite como literal en un lugar. La alternativa (emitir el token globalmente) cambia el color de otros CTA del sitio que hoy dependen de que no exista.
- **Velo denso hasta el 60 % de la altura.** Garantiza ≥ 4.5:1 en todo el bloque de texto aun sobre las camisas blancas de la foto. Tradeoff: tiñe de verde la parte baja de las caras en escritorio. Para mostrar más foto, conviene achicar el bloque de texto antes que aclarar el velo.
- **`<picture>` nativo en lugar de `NgOptimizedImage` o `background-image`.** Resuelve formato y ancho con `<source type>` y `srcset`, carga diferida nativa, `alt` real y es testeable desde el DOM. `NgOptimizedImage` no cambia de formato y pide un loader. Un `background-image` no tiene carga diferida ni `alt`.
- **Banda en componente propio.** Con sus estilos dentro de `home.component.scss`, la home supera el budget `anyComponentStyle` de 17 kB. El selector de atributo evita un wrapper extra en el DOM.
- **Layout apilado en mobile.** Un recorte `cover` en pantallas angostas deja afuera a los integrantes laterales.
- **Variantes generadas a mano con Pillow.** No suma una dependencia nativa (`sharp`) ni un paso de build para una tarea esporádica. Tradeoff: quien agrega una imagen necesita Python + Pillow.

## Limitaciones conocidas

- Sin AVIF: los formatos son WebP y JPEG.
- El script no se ejecuta en el build. Si se reemplaza una imagen hay que volver a correrlo, y la declaración en `content/` tiene que coincidir con los anchos generados.
- Los anchos de variante están fijos en el script (640, 1024, 1536). Una imagen de menos de 640 px de ancho no genera variantes.
- Tailwind v4 no emite al CSS global varios tokens de marca en modo claro (`--color-brand-200` y `--color-brand-300`, entre otros), y `--color-brand-700` aparece solo de forma incidental. El fondo de `cta-final` usa valor de respaldo; los CTA del hero y del header no lo llevan y se ven con el gradiente de `.btn-primary`. El arreglo global de tokens es deuda fuera de este cambio.
