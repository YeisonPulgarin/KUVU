# Tasks — tema-claro-tokens

Referencias: `sdd/tema-claro-tokens/spec.md`, `sdd/tema-claro-tokens/design.md`.
Modalidad de tests: `test-after`. Rama prevista: `fix/tema-claro-tokens` sobre
`feat/home-animaciones`. La crea el orquestador antes de `apply`; `branch` no está activa.

Rutas de archivos relativas a `frontend/proyecto_angular/src/`.

## Tarea previa (antes del primer slice)

- **T-0 — Base para las capturas.** Build de producción de `feat/home-animaciones` sin el cambio,
  copiado a una carpeta del scratchpad. Recrear el script CDP en el scratchpad (design D-5) y
  correrlo sobre esa base: 7 rutas públicas más la landing y `/login`, 1280×800 y 375×800, tema
  claro y oscuro. Se guardan las capturas y las mediciones de tokens y de estilos calculados. Es
  QA fuera del repo y no suma líneas al diff.

## Slice `chrome` (1º)

- **T-1** — `styles.css`: `@theme {` → `@theme static {` en el bloque de tokens de marca (D-1).
  Depende de: T-0.
- **T-2** — Quitar los fallbacks literales (D-2) de `styles.scss` (2),
  `app/components/public/site-header/site-header.component.scss` (12),
  `site-footer.component.scss` (11), `public-page.component.scss` (6),
  `breadcrumb.component.scss` (3) y `rich-text.component.scss` (1), y el comentario de fallback de
  `breadcrumb` (l. 4-5). Depende de: T-1.
- **T-3** — Verificación del slice: `ng build` (los 15 tokens en `:root` de `styles-*.css`, CSS
  global con menos de 1 kB de crecimiento, sin warnings nuevos) y suite Karma completa en verde.
  `apply-progress/chrome` registra la excepción de cobertura: cambio visual sin comportamiento
  testeable, cubierto por CDP en `verify` (D-4).

## Slice `paginas` (2º)

- **T-4** — Quitar los fallbacks de `app/components/pages/contacto` (15), `servicios` (15),
  `legal` (10) y `not-found` (3). Depende de: T-1.
- **T-5** — Verificación: build y Karma en verde; `apply-progress/paginas` con la misma excepción.

## Slice `home` (3º)

- **T-6** — Quitar los fallbacks de `app/components/home/companies-marquee` (4), `team-band` (2),
  `steps-journey` (2), `home.component.scss` (2) y `hero` (1), y los comentarios de fallback de
  `companies-marquee` (~l. 56), `home.component.scss` (~l. 235), `steps-journey` (~l. 108) y
  `team-band` (~l. 6-8). Depende de: T-1.
- **T-7** — Verificación: Karma en verde, con atención a las aserciones de color resuelto de
  `steps-journey.component.spec.ts` (l. ~95-96), que pasan a depender del token y no del fallback.
  Búsqueda de CA-04: cero `var(--color-home-*|--color-brand-*|--radius-*, …)` en `src`.
  `apply-progress/home`.

## Slice `cierre` (4º)

- **T-8** — `sdd/sdd-init.md`: convención "tokens de marca en `@theme static`, consumo con
  `var(--token)` sin fallback; los nombres de tokens ya no necesitan ocultarse del escaneo".
  `apply-progress/cierre`.

## Fuera de `apply` (previsto para fases posteriores)

- `verify`: CDP sobre el build del cambio con los mismos escenarios de T-0, comparado contra la
  base (CA-02, -03, -05, -06, -07), más CA-01, -04, -08 y -09.
- `document`: ver alcance abajo (CA-10).

## Slices involucrados

| Slice | Involucrado | Motivo |
|---|---|---|
| `backend-orden` | No | No toca el backend |
| `contenido` | No | No cambian textos ni datos |
| `chrome` | **Sí (sugerido)** | `styles.css` (el arreglo), `styles.scss`, header, footer, `app-public-page`, `app-rich-text` y breadcrumb |
| `paginas` | **Sí (sugerido)** | Fallbacks de contacto, servicios, legal y 404 |
| `home` | **Sí (sugerido)** | Fallbacks y comentarios de la home |
| `intro` | No | La app interna no usa estos tokens |
| `cierre` | **Sí (obligatorio)** | Convención en `sdd-init.md` |

El orden es el de la tabla de `sdd.config.md`, sin desvío: `chrome` → `paginas` → `home` →
`cierre`. `paginas` y `home` dependen solo de T-1 y podrían ir en cualquier orden entre sí.

Breadcrumb no figura en la lista de `chrome` de `sdd.config.md`, pero es una pieza pública
compartida (`components/public/`), así que se agrupa con sus vecinas.

## Forecast de riesgo

| Métrica | Estimación |
|---|---|
| Archivos de producción | 16 (`styles.css` + 15 SCSS) |
| Tests | 0 archivos nuevos o modificados (la regresión de V-3 existente cubre; no-objetivo aceptado) |
| Líneas de código (diff, altas + bajas) | ~180-200: ~89 líneas modificadas (≈178), ~10 de comentarios borrados, 2 de `styles.css` |
| Documentación (`document`) | ~60-90 líneas en 3 archivos (`docs/tema-claro-tokens.md`, `CHANGELOG.md`, `docs/architecture.md`) |
| Artifacts SDD | `sdd/tema-claro-tokens/*` y `sdd/sdd-init.md` (no cuentan para la revisión de código) |
| Repos | 1 |
| **Riesgo** | **Bajo**: el código queda por debajo del umbral de 300 líneas. Con la documentación el total ronda 250-290, todavía por debajo. Los cambios son mecánicos y repetitivos, así que se revisan rápido |

Estrategia de entrega `ask-on-risk`: con riesgo bajo no hace falta consultar. Un solo PR (#5,
apilado sobre #4).

## Alcance previsto de `document`

| Clave | Valor | Detalle |
|---|---|---|
| `openapi_afectado` | false | No toca endpoints HTTP |
| `changelog_afectado` | true | Cambio visible: Unreleased → Fixed |
| `readme_afectado` | false | No cambian instalación, comandos ni stack |
| `architecture_afectado` | true | Reemplazar las dos decisiones sobre tokens no emitidos y el patrón de fallback por la decisión `@theme static` (design D-6) |
| `guidelines_afectado` | false | `DEVELOPMENT_GUIDELINES.md` no tiene sección de Angular; la convención va en `sdd-init.md` (T-8) |
