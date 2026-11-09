# Explore — tema-claro-tokens

Origen: pendiente P-2 de `sdd/home-animaciones/archive-report.md`, hallazgo F-1 de
`sdd/home-animaciones/verify-report.md`.

## Contexto (init)

`sdd/sdd-init.md` existe y sigue vigente: Angular 21.2 + Tailwind CSS 4.3.3 (`@tailwindcss/postcss`),
TypeScript 5.9, Karma con ChromeHeadless. Modalidad de tests declarada: `test-after`.
Almacenamiento: `files`. Sin extensiones activas. No se regenera. La inconsistencia
`expone_api_http` (P-5) queda fuera de este cambio.

## Qué existe hoy

### Definición de los tokens

`frontend/proyecto_angular/src/styles.css` (primer archivo de `styles` en `angular.json`, tanto en
`build` como en `test`) define en un bloque `@theme` normal:

- `--color-brand-100/200/300/500/600/700`
- `--color-home-bg`, `-surface`, `-surface-alt`, `-text`, `-muted`, `-border`
- `--radius-pill`, `--radius-card`, `--radius-icon`

Debajo, un bloque `.dark { ... }` (sin capa) redefine `brand-600/500/100` y los seis `home-*`. El
modo oscuro lo activa `ThemeService` (`src/app/services/theme.service.ts`) agregando la clase
`dark` a `<html>`, más un script inline en `index.html` que la aplica antes del primer render. Lo
consumen `site-header` y `site-footer` (botón de tema del sitio público).

### Qué emite Tailwind (medido en el build de producción actual)

Tailwind v4 solo emite en `:root, :host` (capa `theme`) las variables de `@theme` que usa alguna
utilidad escaneada. En `styles-*.css` del build quedan en `:root` solo `--color-brand-700` y
`--color-brand-500`. Resultado:

| Token | Tema claro | Tema oscuro (`.dark`) |
|---|---|---|
| `--color-brand-500`, `--color-brand-700` | definido | definido (700 conserva el valor claro) |
| `--color-home-*` (6) | **indefinido** | definido |
| `--color-brand-100`, `--color-brand-600` | **indefinido** | definido |
| `--color-brand-200`, `--color-brand-300` | **indefinido** | **indefinido** |
| `--radius-pill/card/icon` | **indefinido** | **indefinido** |

El modo oscuro funciona porque `.dark` declara los valores a mano; los radios y `brand-200/300`
faltan en los dos temas.

### Consumo de los tokens

Todos los usos son `var(--token)` en SCSS de componentes. Las utilidades de Tailwind con estos
tokens aparecen solo vía `@apply rounded-pill` / `rounded-icon` en SCSS con
`@reference "../../../../styles.css"` (que no emite variables). Ningún template HTML usa
utilidades `*-home-*` / `*-brand-*`. La app interna (landing, login, dashboard) no usa estos
tokens: el alcance es el sitio público.

**Usos sin fallback (rotos en tema claro)** — 79 líneas:

| Archivo | Efecto visible en claro |
|---|---|
| `components/home/home.component.scss` | fondos de sección (`home-bg`/`home-surface`) transparentes, bordes de filas ausentes, íconos de servicios sin fondo `brand-100` ni radio, colores de texto heredados del `body` (`#1f444e`) |
| `components/home/steps-journey/steps-journey.component.scss` | tarjetas de "¿Cómo funciona?" sin borde, fondo ni radio; **número de paso blanco sobre fondo transparente (invisible)**; borde activo `brand-600` ausente |
| `components/home/hero/home-hero.component.scss` | fondo y borde inferior del hero, puntos decorativos `brand-100`, colores de título y párrafo |
| `components/home/companies-marquee/companies-marquee.component.scss` | fondo de la banda y color del texto |
| `components/home/_section-heading.scss` | color de títulos y bajadas |
| `components/pages/nosotros/nosotros.component.scss` | fondos, bordes y colores de texto |
| `components/pages/preguntas-frecuentes/preguntas-frecuentes.component.scss` | fondos, bordes, colores de pregunta y respuesta |
| `components/public/site-header/site-header.component.scss` | botón de tema e ítems del menú (superficie, borde, hover `surface-alt`, colores) |

`src/styles.css` (`:focus-visible`) y `team-band` usan `brand-500`, que sí está definido.

Las utilidades `@apply rounded-pill` / `rounded-icon` (en `nosotros`, `site-header`,
`site-footer`) resuelven a `var(--radius-*)`, indefinido en los dos temas: esos elementos quedan
sin redondeo.

**Usos con fallback literal (89 ocurrencias)** — en `contacto`, `legal`, `servicios`,
`not-found`, `breadcrumb`, `public-page`, `rich-text`, `site-footer`, `site-header`,
`companies-marquee`, `team-band`, `steps-journey` (línea y riel del recorrido, V-3),
`home.component.scss` (banda final), `home-hero` (radio pill) y `styles.scss`
(`.section-eyebrow`). Todos los literales coinciden exactamente con el valor de `@theme`
(verificado token por token: `#1f2920`, `#cddccd`, `#4c5a4e`, `#ffffff`, `#eef1ec`, `#f6f7f4`,
`#3e5c40`, `#2f4a2f`, `#a3bfa3`, `9999px`). Con los tokens en `:root`, el fallback deja de
aplicarse en los dos temas y es redundante. En oscuro el fallback hoy no actúa (la variable está
definida), salvo `brand-300` y `radius-pill`, que dependen del literal en ambos temas.

### Tests que tocan esto

- `steps-journey.component.spec.ts` (líneas ~95-96): regresión de V-3, compara el color resuelto
  de la línea (`rgb(62, 92, 64)`) y del riel (`rgb(205, 220, 205)`). Karma carga `styles.css`,
  así que estas aserciones siguen valiendo si los tokens pasan a `:root` y se quitan los
  fallbacks; pasan a cubrir la corrección.
- No hay tests que verifiquen la emisión de tokens en `:root` ni el aspecto de las tarjetas.

### Presupuesto y build

- `angular.json`: presupuesto `initial` 500 kB warning / 2 MB error. El build actual compila;
  único warning `css-inline-fonts` (P-4, fuera de alcance). `styles-*.css`: 28,8 kB.
- Emitir los 13 tokens que faltan en `:root` suma del orden de 0,5 kB al CSS global.
- `@theme static` aplica solo al bloque donde se declara: no fuerza la emisión de la paleta por
  defecto de Tailwind.

### QA visual

No existe un script CDP en el scratchpad de esta sesión. Node v22.20.0 está disponible
(WebSocket nativo) y Chrome en `C:\Program Files\Google\Chrome\Application\chrome.exe`. Hay que
recrearlo para las capturas.

### Ramas

- `main` (`a94a5f9`) tiene el bloque `@theme` con los mismos tokens: el defecto existe ahí.
- La pila `feat/home-profesional` (#1) → `feat/acceso-orden-e-intro` (#2) →
  `feat/home-animaciones-base` (#3) → `feat/home-animaciones` (#4) cambia 123 archivos de
  `frontend/proyecto_angular/src` contra `main`, incluidos casi todos los SCSS afectados
  (`steps-journey`, `companies-marquee`, `team-band`, header, footer, páginas). Ninguna está
  mergeada.

## Archivos relevantes

| Archivo | Rol |
|---|---|
| `frontend/proyecto_angular/src/styles.css` | bloque `@theme` y bloque `.dark`: punto único de la corrección |
| `frontend/proyecto_angular/angular.json` | orden de estilos globales en build y test; presupuestos |
| `frontend/proyecto_angular/src/app/services/theme.service.ts`, `src/index.html` | activación de `.dark` |
| SCSS de `components/home/*`, `components/pages/*`, `components/public/*`, `src/styles.scss` | consumidores, con y sin fallback |
| `components/home/steps-journey/steps-journey.component.spec.ts` | único test de color resuelto |

## Decisiones del Gate A (clarify)

Resueltas por el usuario:

| # | Tema | Decisión |
|---|---|---|
| 1 | Mecanismo | `@theme static` en `styles.css`: una sola fuente de los tokens |
| 2 | Fallbacks literales | Se quitan los 89 de los SCSS |
| 3 | Valores de los tokens | Se aceptan los actuales; el cambio visual en tema claro es esperado |
| 4 | Tema oscuro | Dentro del alcance (radios y `brand-200/300`), con capturas de ambos temas en `verify` |
| 5 | Rama | `fix/tema-claro-tokens`, apilada sobre `feat/home-animaciones` (PR #5 sobre #4) |
| 6 | Test de guardia de los 15 tokens | No se agrega; la regresión de V-3 en `steps-journey` sigue vigente |

Modo de ejecución de la sesión: interactivo. Modalidad de tests: `test-after`.

## Ambigüedades planteadas en el Gate A

1. **Mecanismo:** `@theme static` (Tailwind emite siempre el bloque en `:root`; una sola fuente)
   frente a duplicar los tokens en un `:root` propio (independiente de Tailwind, dos fuentes que
   pueden divergir).
2. **Fallbacks literales (89):** quitarlos todos (redundantes, una sola fuente de verdad, diff en
   ~15 SCSS) o dejarlos (red de seguridad, diff mínimo). Es la decisión que más mueve el tamaño
   del cambio frente al umbral de 300 líneas.
3. **Cambio visible:** la corrección cambia el aspecto en tema claro de home, nosotros, preguntas
   frecuentes y header (fondos `#f6f7f4`/blanco alternados en lugar del `#F0F4F8` del `body`,
   texto `#1f2920` en lugar de `#1f444e`, tarjetas con borde y radio, números de paso visibles,
   redondeo en botones pill). ¿Se aceptan los valores de los tokens tal como están o se revisa
   alguno en este mismo cambio?
4. **Tema oscuro:** los radios y `brand-200/300` tampoco existen en oscuro. ¿Entra en el alcance
   (sale con la misma corrección) con capturas en los dos temas, o solo tema claro?
5. **Rama base:** apilado sobre `feat/home-animaciones` (PR #5 sobre #4) o esperar el merge de la
   pila y salir de `main`.
6. **Tests:** además de las aserciones existentes, ¿se agrega un test que verifique que los 15
   tokens resuelven en `:root` en tema claro (guardia contra la regresión de F-1)?
