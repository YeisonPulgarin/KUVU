# Design — home-imagen-equipo

Referencias: `spec.md` (RF-1 a RF-7, CA-1 a CA-11), `propose.md`, `explore.md`,
`docs/architecture.md` (clúster público), `DEVELOPMENT_GUIDELINES.md`.

`DEVELOPMENT_GUIDELINES.md` no tiene una sección de Angular. Este design sigue las convenciones
que ya usa el clúster público: contenido tipado en `content/`, componentes standalone en
`components/public/`, estilos con Tailwind `@apply` y tokens de `styles.css`.

## Componentes que se tocan

| Pieza | Tipo | Rol |
|---|---|---|
| `public/Imagenes_web/equipo-ycw-{640,1024,1536}.{webp,jpeg}` | assets nuevos | variantes de la foto (RF-1) |
| `public/Imagenes_web/Equipo YCW.jpeg` | se elimina | el original queda como `equipo-ycw-1536.jpeg` |
| `frontend/proyecto_angular/scripts/generate-image-variants.py` | herramienta nueva | genera las variantes de cualquier imagen de `Imagenes_web/` (RF-7) |
| `src/app/content/types.ts` | modificado | tipos `SiteImage` y `TeamSection` |
| `src/app/content/team.ts` | nuevo | textos de la banda, integrantes y declaración de la foto |
| `src/app/content/index.ts` | modificado | re-exporta `team` |
| `src/app/components/public/responsive-image/` | componente nuevo | renderiza un `SiteImage` como `<picture>` (RF-5, RF-7) |
| `src/app/components/home/` | modificado | sección `#equipo` + estilos + tests |
| `src/app/components/pages/nosotros/` | modificado | figura con la foto + caption + tests |
| `docs/architecture.md` | modificado (en `document`) | carpeta `Imagenes_web/`, componente de imagen, decisión de `<picture>` |

## Flujo de datos

```
content/team.ts  (TeamSection { title, lead, linkLabel, members[], image: SiteImage })
      │
      ├── HomeComponent ──► <section id="equipo"> ──► <app-responsive-image [image] decorative sizes="100vw">
      │                                              + H2, lead, caption (members), link /nosotros
      │
      └── NosotrosComponent ──► <figure> ──► <app-responsive-image [image] sizes="...">
                                            + <figcaption> (members)
```

Fuente única: las rutas, dimensiones, alt y nombres viven solo en `content/team.ts`.

## Decisiones técnicas

### D1 — Modelo de imagen como contenido tipado

```ts
interface SiteImage {
  readonly basePath: string;          // '/Imagenes_web/equipo-ycw'
  readonly widths: readonly number[]; // [640, 1024, 1536]
  readonly width: number;             // 1536 (intrínseco, para reservar espacio)
  readonly height: number;            // 1024
  readonly alt: string;
  readonly caption?: string;
}
```

La convención de nombres de archivo es `{basePath}-{ancho}.{webp|jpeg}`. El componente arma
`srcset` a partir de `basePath` y `widths`, así que sumar una imagen nueva es generar sus
variantes con el script y declarar un `SiteImage`. El caption de la foto se deriva de
`members.join(' · ')`, en el orden de la foto de izquierda a derecha.

*Descartado:* listar cada archivo explícitamente en el contenido. Es más verboso y propenso a
errores de tipeo, y la convención la garantiza el script.

### D2 — Componente `app-responsive-image` con `<picture>` nativo

- Inputs: `image: SiteImage` (requerido), `sizes: string` (default `100vw`), `decorative: boolean` (default `false`, renderiza `alt=""`), `fit: 'cover' | 'contain'` (default `contain`).
- Renderiza `<picture>` con `<source type="image/webp" [srcset] [sizes]>` y `<img>` JPEG con `srcset`, `src` del ancho mayor, `width`/`height` intrínsecos, `loading="lazy"` y `decoding="async"`.
- Sin estado y sin servicios. Estilos mínimos: `display:block; width:100%; height:100%` más `object-fit` según `fit`.

*Descartado:*
- `NgOptimizedImage`: no resuelve el cambio de formato con `<source type>` y pide configurar un loader para rutas locales.
- `background-image` / `image-set()` en CSS: no tiene carga diferida nativa, no expone alt y no es testeable desde el DOM.
- El patrón del logo (`<img>` por variante con swap por CSS): ahí la variante depende del tema; acá depende del ancho y del formato, que es exactamente lo que resuelve `<picture>`.

### D3 — Posición de la banda en la home: entre `#companias` y `#origen`

Orden resultante: `… seguridad → companias → equipo → origen → faq`. La banda es el puente
narrativo: después de la prueba social ("Compañías que confían") aparecen las personas, y
enseguida su historia ("El origen de KUVU"). El test de orden de ids queda con
`['como-funciona','beneficios','seguridad','equipo','origen','faq']`.

### D4 — Layout de la banda

- **≥ 768px**: sección full-bleed, fuera de `.container`. `position: relative`, `min-height: clamp(28rem, 72vh, 44rem)`, `overflow: hidden`. La imagen va `position:absolute; inset:0` con `fit="cover"` y `object-position: center 35%`, para mantener las caras y el logo YCW dentro del recorte. El contenido (H2, lead, caption, link) va en un `.container` alineado abajo a la izquierda, con `data-reveal`.
- **< 768px**: un recorte `cover` en pantallas angostas deja afuera a los integrantes laterales. Por eso la banda se apila: la imagen en su aspecto natural 3:2 (`aspect-ratio: 3 / 2`, se ven los tres) y debajo el bloque de texto sobre un fondo `--color-brand-700`. Los nombres siguen alineados con la foto.
- En la banda la imagen es `decorative` (RF-4), porque H2 y caption ya nombran al equipo y a los integrantes.
- `sizes="100vw"`.

### D5 — Velo y contraste

- Un pseudo-elemento `::after` sobre la imagen (solo ≥ 768px) con `linear-gradient(to top, color-mix(in srgb, var(--color-brand-700) 88%, #000) 0%, color-mix(in srgb, var(--color-brand-700) 70%, transparent) 45%, rgb(0 0 0 / 0.25) 100%)`. El velo es más denso abajo, donde va el texto, y más liviano arriba para que se lean las caras y el logo.
- Texto en `#fff`, sin depender de `--color-home-text`: la banda es oscura en ambos temas y los colores de texto no cambian con `.dark`. `--color-brand-700` (`#2f4a2f`) no se redefine en `.dark`, así que el velo es idéntico en ambos temas. `verify` lo confirma en los dos (CA-8).
- Contraste estimado en la zona de texto, con la camisa blanca detrás (peor caso): velo efectivo ≈ `#253b25` → blanco ≈ 11:1. Holgado para AA.
- El link usa el estilo pill del CTA del hero invertido (borde blanco, texto blanco, hover con fondo `--color-brand-500`), con texto "Conocé al equipo" y `aria-label="Conocé al equipo de KUVU en Nosotros"`.

### D6 — Ubicación en `/nosotros`: entre las secciones "about" y "Origen"

Una sección `.team` con `<figure>` dentro de `.container`: imagen `fit="contain"` en su aspecto
natural (se ve completa, RF-3), bordes `rounded-2xl`, sombra suave y `<figcaption>` con los
nombres. Lleva `data-reveal`. `sizes="(min-width: 1152px) 1104px, 100vw"`, que es el ancho útil
de `max-w-6xl` menos el padding. Acá la imagen no es decorativa: el alt describe al equipo.
Queda pegada a la sección "Origen", que relata a los tres estudiantes.

### D7 — Variantes responsive y herramienta

- Anchos: **640, 1024, 1536**. 640 cubre mobile 1x y 2x de columnas angostas, 1024 cubre tablet y mobile 3x, y 1536 es el original (desktop full-bleed). No se generan anchos mayores al original.
- Formatos: WebP con calidad 80 y JPEG progresivo con calidad 82. El `equipo-ycw-1536.jpeg` es el original sin recomprimir, para no degradar calidad. Peso esperado del WebP de 1536 px: menos de 150 KB.
- Herramienta: **Python + Pillow** (11.0, con soporte WebP, ya disponible en la máquina). El script `scripts/generate-image-variants.py <origen> <nombre-base>` escribe las variantes en `public/Imagenes_web/` y se corre a mano. No forma parte del build: queda versionado para las próximas imágenes.
- *Descartado:* `sharp` como devDependency de Node (suma una dependencia nativa al proyecto Angular para una tarea manual y esporádica) y un pipeline de build (no-objetivo).

### D8 — Movimiento

La banda reutiliza `RevealDirective` (`data-reveal`) solo en el bloque de texto. La imagen no se
anima, para que el fondo no "aparezca" de golpe. Con `prefers-reduced-motion` la directiva ya
deja todo visible (RF-6). No se agregan keyframes nuevos.

### D9 — Logs

El cambio es UI estática, sin eventos de negocio ni errores operativos. Según la política de
`DEVELOPMENT_GUIDELINES.md` → "Logging & Observability" no corresponde loguear nada: un fallo de
carga de imagen no es accionable desde el cliente, y el `<img>` JPEG ya es el respaldo.

## Tests (test-after)

| Archivo | Cubre |
|---|---|
| `responsive-image.component.spec.ts` (nuevo) | `<source type="image/webp">` con 3 entradas `srcset`; `<img>` con `srcset` JPEG, `width`/`height`, `loading="lazy"`, alt recibido; `decorative` → `alt=""` (CA-7) |
| `content.spec.ts` | `team`: título exacto, members en orden, `image.widths` no vacío y ≤ 1536, `width/height` en 3:2, alt no vacío que menciona a YCW (CA-6) |
| `home.component.spec.ts` | `#equipo` con H2, los tres nombres en orden, link a `/nosotros`, `app-responsive-image`; test de orden de ids actualizado (CA-3, CA-4) |
| `nosotros.component.spec.ts` | figura con la imagen y `figcaption` con los nombres en orden (CA-5) |

El script de Python es una herramienta de desarrollo fuera de la suite de Angular. Se verifica
por el resultado (CA-1: archivos, anchos y aspecto) y queda registrado como excepción de tests
en `apply-progress`.

## Slice de `apply`

Los slices declarados en `sdd.config.md` corresponden a un cambio anterior (`sitio-contenido`).
Este cambio corre como un **slice único** `home-imagen-equipo`: assets + contenido + componente
+ home + nosotros + tests. `cierre` (docs) queda para `document`.

## Riesgo

Unas 250 a 300 líneas de código y tests en 10 a 12 archivos, más 6 binarios. Queda en el borde
del umbral de 300 líneas: `tasks` hace el forecast definitivo.
