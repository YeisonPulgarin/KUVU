# Tasks — logo-rediseno

## Tareas

| # | Tarea | Archivos | Verificación |
|---|---|---|---|
| T1 | Constantes de rutas de logo | `content/logo.ts` (nuevo), `content/index.ts` | forma |
| T2 | Header: variante de tema + símbolo responsive | `site-header.component.{html,scss,spec.ts}` | tests |
| T3 | Footer: logo con tema + responsive | `site-footer.component.{ts,html,scss,spec.ts}` | tests |
| T4 | Landing / Login / Navbar → `logo-dark.png` | `landing.component.html`, `login.component.html`, `navbar.component.html` + specs | tests |
| T5 | Favicon PNG en `index.html` | `src/index.html` | grep |
| T6 | Borrar `public/Logo_Kuvu.jpeg` y verificar 0 refs | `public/Logo_Kuvu.jpeg` | `rg "Logo_Kuvu"` = 0 |
| T7 | Suite completa + build | — | 120+ verdes, `ng build` OK |
| T8 | Cierre: docs/CHANGELOG + `docs/logo-rediseno.md` (+ architecture.md, update de assets) | docs + config | — |

## Slices involucrados — desvío del default declarado

`sdd.config.md` declara slices del cambio anterior (`contenido`, `chrome`, `home-expandida`,
`paginas`) que **no describen este cambio**: es un cambio atómico de un solo dominio
(frontend, branding). Se propone **un solo slice `logo-rediseno`** con las 8 tareas, en vez
de los slices declarados. Desvío explícito justificado por el tamaño.

## Forecast de riesgo

- Líneas estimadas (código + tests): ~200 — T1 ~20, T2 ~35, T3 ~45, T4 ~30, T5 ~2, T6 ~1,
  T7 ~0, tests ~70.
- Archivos tocados: ~12 (5 de código, 6 de tests, 1 asset borrado, index.html).
- Repos involucrados: **1** (frontend Angular; backend intacto).
- Riesgo: **bajo** (~200 < umbral 300; un solo repo; sin datos ni lógica nueva).
- Estrategia de entrega: `ask-on-risk` → no dispara (riesgo bajo, un slice).

## Alcance previsto de `document`

- `openapi_afectado`: **false** — sin endpoints HTTP.
- `changelog_afectado`: **true** — el logo nuevo con variantes es cambio visible desde afuera.
- `readme_afectado`: **false** — el README del frontend no documenta `public/` ni el logo.
- `architecture_afectado`: **true** — el clúster público suma `logos multi-variante` +
  favicon (sección de assets del sitio).
- `guidelines_afectado`: **false** — no hay convención de stack nueva.