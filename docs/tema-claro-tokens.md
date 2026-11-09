# Tokens de marca del sitio público

Los colores y radios de marca del sitio público (home, servicios, nosotros, preguntas
frecuentes, contacto, legal, 404, header y footer) salen de 15 variables CSS que existen siempre
en `:root`, en tema claro y en tema oscuro. Un solo archivo declara sus valores.

## Cómo funciona

- **Declaración:** `frontend/proyecto_angular/src/styles.css`, bloque `@theme static`:
  - `--color-brand-100/200/300/500/600/700`: verde de marca.
  - `--color-home-bg`, `-surface`, `-surface-alt`, `-text`, `-muted`, `-border`: superficies y
    texto del sitio público.
  - `--radius-pill` (9999px), `--radius-card` (16px), `--radius-icon` (12px).

  Con `static`, Tailwind v4 emite todas las variables del bloque en `:root, :host` (capa
  `theme`), las use o no una utilidad. Sin `static`, solo emite las que encuentra al escanear
  `.ts`/`.html`, y los usos en SCSS de componentes no cuentan.
- **Tema oscuro:** el bloque `.dark { … }` del mismo archivo, sin capa, redefine
  `brand-100/500/600` y los seis `home-*`. Por estar fuera de capa gana sobre `@layer theme`.
  `brand-200/300/700` y los radios conservan el valor claro. `ThemeService`
  (`src/app/services/theme.service.ts`) y el script inline de `index.html` aplican la clase
  `dark` a `<html>` según `localStorage['kuvu-theme']`.
- **Consumo:** los SCSS de componentes usan `var(--token)` sin fallback literal. Los componentes
  con `@reference "…/styles.css"` (`@apply rounded-pill`, `rounded-icon`) no emiten un `:root`
  propio: leen las variables del CSS global.
- **Tests:** Karma carga `styles.css` igual que el build. Los specs de `steps-journey` (línea y
  riel del recorrido), `team-band` y `home` (banda final) comprueban el color resuelto desde los
  tokens globales. Si el bloque deja de emitirlos, esos specs fallan.

## Decisiones

- **`@theme static` en lugar de un `:root` propio.** Una sola fuente de valores. Repetir los
  tokens en un `:root` aparte los desacopla de Tailwind, pero crea dos fuentes que pueden
  divergir. Tradeoff: el CSS global lleva siempre los 15 tokens (~0,3 kB).
- **Sin fallbacks literales en los componentes.** Con los tokens siempre presentes, un
  `var(--token, #literal)` repite el valor sin aportar nada y puede quedar desactualizado si
  cambia la paleta.
- **`.dark` no redefine `brand-200/300/700` ni los radios.** En oscuro usan el valor claro: los
  radios no dependen del tema y esos tres verdes no tienen variante oscura.

## Limitaciones conocidas

- No hay un test que compruebe la presencia de los 15 tokens en `:root`. La cobertura
  automatizada son las aserciones de color resuelto de `steps-journey`, `team-band` y `home`.
- En tema oscuro, los botones `rounded-pill` / `rounded-icon` del header, del footer y de nosotros
  tienen radio, pero su contorno casi no contrasta con el fondo, así que el redondeo apenas se
  nota.
- Los tokens de la app interna (`--color-primario`, `--radius`, etc.) siguen en el `:root`
  propio de `styles.css` y no forman parte de este sistema.
