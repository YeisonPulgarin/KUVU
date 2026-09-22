# Tasks — logo-responsive

## Tareas (orden de dependencia)

| # | Tarea | Archivos | Líneas est. |
|---|---|---|---|
| T01 | Copiar `Logo_Kuvu.jpeg` a `fronted/proyecto_angular/public/` | 1 archivo nuevo | 0 (binario) |
| T02 | Reemplazar logo del HomePage (`.logo-box` → `<img>`) | `home.component.html`, `home.component.scss`, `home.component.spec.ts` | ~70 (incluye tests) |
| T03 | Reemplazar logo del Login (`brand-logo` → `<img>`) | `login.component.html`, `login.component.scss` | ~26 |
| T04 | Reemplazar logo del Landing (activar + `<img>`) | `landing.component.html`, `landing.component.scss` | ~26 |
| T05 | Reemplazar logo del Navbar interno (emoji → `<img>`) | `navbar.component.html`, `navbar.component.scss` | ~18 |
| T06 | Eliminar `kuvu_mobile/` completo | carpeta borrada | 0 |
| T07 | Sidebar móvil con overlay + cierre al navegar | `sidebar.component.ts`, `sidebar.component.html`, `sidebar.component.scss` | ~95 |
| T08 | Responsive del HomePage (hero, grid, CTA, padding) | `home.component.scss` | ~40 |
| T09 | Responsive de Login y Landing (card, inputs, brand) | `login.component.scss`, `landing.component.scss` | ~35 |
| T10 | Responsive del Dashboard (stats 1-col móvil, padding) | `dashboard.component.scss` | ~30 |
| T11 | Breakpoints consistentes en `shared.styles.scss` + scroll indicado de tablas + filtros | `shared.styles.scss` | ~40 |
| T12 | Breakpoint navbar interno 900→767 | `navbar.component.scss` | ~5 |
| T13 | Touch targets 44px globales en móvil + ajustes usuarios/mantenimiento | `styles.css`, `shared.styles.scss` | ~20 |

## Slices involucrados

`tasks` participa solo el slice **`frontend`** (declarado en `sdd.config.md` — es el único slice). No hay desvío del orden default.

## Forecast de riesgo

- **Líneas estimadas:** ~405 (incluye tests)
- **Archivos tocados:** ~15 (más `kuvu_mobile/` borrada)
- **Repos involucrados:** 1 (este repo)
- **Diagnóstico:** **ALTO** (405 > umbral de 300 líneas)

## Alcance previsto de `document`

- `openapi_afectado`: **no** (no se tocan endpoints HTTP)
- `changelog_afectado`: **sí** (cambio visible desde afuera: nuevo logo + responsive)
- `readme_afectado`: **no**
- `architecture_afectado`: **no** (solo cambios de presentación y CSS)
- `guidelines_afectado`: **no**