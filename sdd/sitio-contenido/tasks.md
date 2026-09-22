# Tasks — sitio-contenido

## Tareas atómicas (orden por dependencia)

**T01 — Módulos de contenido.** Crear `src/app/content/` con `types.ts` y los módulos
tipados: `site.ts` (nombre, tagline, nav, `contactWhatsApp = '573223192760'`,
`contactWhatsAppMessage`), `services.ts`, `companies.ts`, `howItWorks.ts`, `benefits.ts`
(por rol), `security.ts` (solo destacados descriptivos, sin mecanismos), `origin.ts`
(tres estudiantes, biblioteca de la universidad), `about.ts` (quién es / cómo opera / con
quién trabaja), `faq.ts` (agrupadas). Helper `buildWhatsAppLink(phone, message)` con
`encodeURIComponent`. Tests de forma (interfaces, no vacíos, en español, sin cifras
inventadas).

**T02 — ThemeService.** `src/app/services/theme.service.ts`: estado de tema, `kuvu-theme`,
aplica `.dark`. Tests (`provide`, leer/persistir, tolera `localStorage` fallido).

**T03 — RevealDirective.** `src/app/directives/reveal.directive.ts`: `[appReveal]` con
`IntersectionObserver` y `prefers-reduced-motion`. Tests básicos (reduce motion → visible).

**T04 — SiteHeader y SiteFooter.** Componentes públicos `components/public/site-header/` y
`components/public/site-footer/` (ts+html+scss+spec c/u), portados del header actual de la
home (logo, nav, accesos, toggle de tema vía `ThemeService`, drawer móvil, icono de
WhatsApp convertido en `<a target="_blank" rel="noopener">` al link de contacto). El footer
incluye marca/copyright y navegación (inicio, nosotros, preguntas frecuentes, acceso).
Tests de presencia de enlaces.

**T05 — PageMetaService.** `src/app/services/page-meta.service.ts`: fija `title` y `meta
description` por página (`Meta`/`Title`). Tests.

**T06 — Home refactorizada a chrome compartido.** `home.component` reemplaza header/menú y
lógica de tema por `SiteHeader` y `SiteFooter` (con `appReveal`), manteniendo el resto del
markup y el comportamiento. `index.html`: favicon → `Logo_Kuvu.jpeg` (link `type=image/jpeg`).
Specs ajustadas y en verde.

**T07 — Home expandida.** En `home.component.html`, secciones actuales pasan a leer de
`content/` y se agregan en orden: **cómo funciona**, **beneficios por rol**, **seguridad y
soporte**, **origen de KUVU** y **FAQ corto** (3–5 preguntas, con enlace a
`/preguntas-frecuentes`). Navbar (agregar anclas nuevas y enlace a tengamos "nosotros" /
"preguntas frecuentes"). Tests: secciones presentes, FAQ corto enlaza, origen mencionado,
seguridad sin términos internos.

**T08 — Ruta y página `/nosotros`.** `components/pages/nosotros/` (ts+html+scss+spec), usa
`SiteHeader`/`SiteFooter`/`appReveal`, contenido de `about.ts` + origen + CTA a WhatsApp
(`buildWhatsAppLink`). Ruta lazy en `app.routes.ts` con `title`. Tests de contenido y CTA.

**T09 — Ruta y página `/preguntas-frecuentes`.** `components/pages/preguntas-frecuentes/`
(ts+html+scss+spec), FAQ completa agrupada desde `faq.ts`, `appReveal`, header/footer.
Ruta lazy con `title`. Tests: todas las preguntas renderizadas, agrupadas.

**T10 — Cierre config y docs.** `sdd.config.md` (comando de test → `frontend/proyecto_angular`,
slices del proyecto), `docs/architecture.md`, `docs/sitio-contenido.md`, `CHANGELOG.md` y
`README.md`. Verificación global: `ng test` + `ng build` en verde, y revisión de las rutas
`/`, `/nosotros`, `/preguntas-frecuentes`.

## Slices involucrados

`sdd.config.md` declara un solo slice (`frontend`, "Logo, responsive, eliminación de
kuvu_mobile") — escrito para el cambio anterior, **no aplica** a este. **Desvío del default**:
este trabajo es Angular-only sobre el sitio de marketing, así que propongo slices por
dependencia real, cada uno una tanda entregable:

| Orden | Slice | Tareas | Obligatorio |
|---|---|---|---|
| 1 | `contenido` | T01 | Sí |
| 2 | `chrome` | T02, T03, T04, T05, T06 | Sí |
| 3 | `home-expandida` | T07 | Sí |
| 4 | `paginas` | T08, T09 | Sí |
| — | cierre | T10 (al último slice) | Sí |

Dependencias: `chrome` necesita el contenido (nav/links del footer), `home-expandida` y
`paginas` necesitan `chrome`, `paginas` usa `buildWhatsAppLink` (T01) y el FAQ corto reutiliza
`faq.ts` (T01) por referencia, no por copia.

## Forecast de riesgo

| Métrica | Estimación |
|---|---|
| Archivos nuevos/modificados | ~40 (≈15 nuevos en `src/app/content/`+chrome+pages, ~10 publicados, resto specs/ediciones) |
| Líneas estimadas (tests incluidos) | **~2.000+** |
| Repos involucrados | 1 (`KUVU`), módulos: `frontend/proyecto_angular`, `sdd.config.md`, docs |
| Umbral declarado en `sdd.config.md` | 300 líneas |
| **Riesgo** | **ALTO** — supera el umbral |

Estrategia de entrega del proyecto: `ask-on-risk` → Gate C consulta. El usuario ya eligió
**tandas** (`auto-chain`): entrega por slice, en orden.

## Alcance previsto de `document`

- `openapi_afectado`: **false** — no se tocan endpoints HTTP.
- `changelog_afectado`: **true** — el sitio público gana contenido y páginas (visible desde afuera).
- `readme_afectado`: **true** — se documenta el flujo de instalar/levantar/testear el frontend Angular.
- `architecture_afectado`: **true** — el clúster público cambia (home expandida + 2 páginas; `docs/architecture.md` es plantilla hoy).
- `guidelines_afectado`: **false** — no hay convención de stack nueva (es Angular, ya existente); se opinará en `document`.
- `logs_conforme`: n/a — no hay logging nuevo.