# Verify-report — logo-web-responsive

- **Slices completados:** `logo-web-responsive` (único, con `apply-progress`).
- **Slices omitidos:** ninguno.
- **Modo de verificación:** completo (spec + design + suite + build).

## Criterios de aceptación

| # | Criterio | Estado | Evidencia |
|---|---|---|---|
| 1 | `logo.web` / `logo.responsive` con las rutas de los 2 PNG, valores distintos | ✅ | `content.spec.ts:134-146` verde |
| 2 | Header: `.logo-img--full` = `logo.web`, `.logo-img--responsive` = `logo.responsive`, `alt` = `KUVU` | ✅ | `site-header.component.spec.ts:34-50` verde; template `site-header.component.html:7-16` |
| 3 | Header: alternar el tema **no** cambia las `src` | ✅ | `site-header.component.spec.ts:52-60` verde |
| 4 | Footer: `.footer-logo--full` = `logo.web`, `.footer-logo--responsive` = `logo.responsive`, invariante ante el tema | ✅ | `site-footer.component.spec.ts:30-46` verde |
| 5 | Landing `.brand-logo-img` → `/logo-rediseno/Logo_Kuvu.png` | ✅ | `landing.component.spec.ts:93-99` verde |
| 6 | Login `.brand-logo-img` → `/logo-rediseno/Logo_Kuvu.png` | ✅ | `login.component.spec.ts:63-68` verde |
| 7 | Navbar `.navbar__logo-img` → `/logo-rediseno/Logo_Kuvu.png` | ✅ | `navbar.component.spec.ts:32-37` verde |
| 8 | Home `.logo-img--full` → `/logo-rediseno/Logo_Kuvu.png` | ✅ | `home.component.spec.ts:260-266` verde |
| 9 | `index.html`: favicon `Logo_Responsive.png`, `type="image/png"` | ✅ | `index.html:17` |
| 10 | 0 referencias a los 4 PNG ni a sus claves en `src/` y `public/` | ✅ | búsqueda sobre `.ts/.html/.scss/.json` en `src` y `public` → **0 coincidencias** |
| 11 | Los 2 PNG se sirven desde `public/` | ✅ | `dist/proyecto-dss/browser/logo-rediseno/` contiene `Logo_Kuvu.png` (147 KB) y `Logo_Responsive.png` (57 KB), y ningún PNG anterior |
| 12 | `ng build` compila | ✅ | `Application bundle generation complete` (7.5 s) |
| 13 | Suite completa en verde, sin skips | ✅ | **TOTAL: 128 SUCCESS** (0 fallos, 0 skips) |
| 14 | Verificación visual del contraste en tema claro/oscuro y móvil | ⏳ | **Requiere revisión humana** — ver abajo |

## Criterio 14: pendiente de revisión visual

El agente no puede interpretar imágenes, así que la legibilidad del logo sobre los fondos no se
puede automatizar aquí. La persona debe confirmar en el navegador (`ng serve`):

- [ ] header en tema **claro** con `Logo_Kuvu.png`
- [ ] header en tema **oscuro** con `Logo_Kuvu.png`
- [ ] header en viewport **< 768px** con `Logo_Responsive.png`
- [ ] `/login` y `/acceder` con `Logo_Kuvu.png`
- [ ] navbar autenticada con `Logo_Kuvu.png`
- [ ] favicon del navegador

Es el mismo criterio que la persona confirmó en `clarify` al decidir que un solo juego de logos
alcanza para ambos temas; queda como confirmación de cierre, no como supuesto sin cubrir.

## Consistencia con el design

| Decisión de `design.md` | Estado |
|---|---|
| `logo.ts` con claves `web` / `responsive` | ✅ aplicado |
| Header y footer con binding estático (sin `isDark()` en la selección del logo) | ✅ aplicado |
| `site-footer.component.ts` sin `isDark`; `theme` conservado | ✅ aplicado |
| `site-header.component.ts` sin cambios | ✅ aplicado |
| SCSS sin cambios (breakpoint `768px` intacto) | ✅ sin diff |
| Landing/login/navbar con string literal, sin importar `logo` | ✅ aplicado |
| Nombres de los assets sin cambiar | ✅ aplicado |

## Drift detectado

Ninguno entre `spec.md`, `design.md` y el código construido.

Fuera del alcance declarado pero colateral al cambio: `docs/logo-rediseno.md`,
`docs/logo-responsive.md`, `docs/architecture.md:26-32` y `docs/sitio-contenido.md:81` describen
el sistema de 4 variantes (o el logo único JPEG) y quedan desactualizados. Se corrigen en la
fase `document`, que es la fase owner de la documentación.

## Notas

- El warning de presupuesto de Google Fonts en `ng build` es preexistente y ajeno al cambio.
- La suite no cambió de cantidad total (128 antes y después): los tests de swap por tema se
  reescribieron, no se eliminaron.
- No se regeneraron los PNG: se usan los archivos entregados, con su peso original.

## Estado

**Verificación técnica en verde** (criterios 1-13). El cambio queda condicionado al criterio 14
(revisión visual humana) antes de cerrar `archive`.
