# Tasks — logo-web-responsive

## Slices

Un solo slice. `sdd.config.md` declara `contenido`, `chrome`, `home-expandida`, `paginas` y
`cierre`, pero este cambio no agrega secciones ni páginas: toca `contenido` (`logo.ts`) y
`chrome` (header/footer) más tres templates de la app autenticada. Partirlo en dos slices
obligaría a dejar el repo con tests rojos en el punto de corte intermedio.

**Slice: `logo-web-responsive`** — sistema de logo de 2 assets (contenido + chrome + app
autenticada + favicon + tests).

## Tareas

| # | Tarea | Archivo(s) | Tipo |
|---|---|---|---|
| T1 | Exponer `web` y `responsive` con las rutas de los 2 PNG | `app/content/logo.ts` | impl |
| T2 | Header: `logo.web` / `logo.responsive` sin swap por tema | `site-header.component.html` | impl |
| T3 | Footer: ídem + limpiar `isDark` sin uso | `site-footer.component.html`, `.ts` | impl |
| T4 | Landing, login y navbar → logo web | `landing.component.html`, `login.component.html`, `navbar.component.html` | impl |
| T5 | Favicon → `Logo_Responsive.png` | `src/index.html` | impl |
| T6 | Tests de contenido: 2 rutas + 2 valores distintos | `content/content.spec.ts` | tests |
| T7 | Tests de header y footer: rutas nuevas + invariancia ante el tema | `site-header.component.spec.ts`, `site-footer.component.spec.ts` | tests |
| T8 | Tests de landing, login, navbar y home → logo web | 4 specs | tests |
| T9 | Verificación: `0` referencias viejas, suite verde, `ng build` | — | verify |

Orden: T1 → T2/T3 → T4/T5 → T6/T7/T8 → T9. T6 depende de T1 (las claves deben existir para
compilar); el resto de las tareas de test dependen de su implementación correspondente.

## Pronóstico de revisión

| Métrica | Estimación |
|---|---|
| Archivos de producción | 8 |
| Specs | 7 |
| Docs | 4 (`docs/logo-web-responsive.md`, `architecture.md`, `sitio-contenido.md`, `CHANGELOG.md`) + 2 docs consolidados |
| Líneas cambiadas | ~90 (mayormente asserts y `src`) |

**Riesgo: bajo** — muy por debajo del umbral de 300 líneas de `sdd.config.md`. No aplica
`ask-on-risk` ni division en PRs.

## Test de humo por tarea

- T1 → T6 (el spec de contenido no compila hasta que existe la clave).
- T2/T3 → T7.
- T4 → specs de landing, login y navbar; T8 incluye home (header embebido).
- T5 → sin test (HTML estático); cubierto por el criterio 9 de `spec.md` y el build.

## Fuera de alcance

Optimización de peso de los PNG, derivados WebP/AVIF, favicon `.ico`, y cualquier cambio de
layout. Ver `propose.md`.
