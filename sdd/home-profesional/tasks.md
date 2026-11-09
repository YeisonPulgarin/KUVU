# Tasks — home-profesional

Fuentes: `spec.md` (HP-01..HP-20) y `design.md` (secciones 1–10). Modalidad: `test-after`.
Cada tarea incluye sus tests, que se escriben antes de cerrarla. Rutas relativas a
`frontend/proyecto_angular/src/` salvo que se indique otra.

Comando de verificación de cada slice (Windows):
`$env:CHROME_BIN='C:\Program Files\Google\Chrome\Application\chrome.exe'; npx ng test --watch=false --browsers=ChromeHeadless`
y `npx ng build`, desde `frontend/proyecto_angular`.

**Extensiones:** `analyze`, `branch`, `validate` y `git` están inactivas en `sdd.config.md`
de esta rama: no se corren. La rama de trabajo ya existe: `feat/home-profesional`.

---

## Slices

`sdd.config.md` (en `main`) declara `contenido → chrome → home-expandida → paginas → cierre`,
de un cambio anterior. Este cambio **se desvía**: usa `contenido → chrome → paginas → home →
cierre`. `home-expandida` no aplica (no se agregan secciones a la home; se reduce a
escaparate), y `home` va **después** de `paginas` porque la home y las páginas internas
enlazan a `/servicios` y `/contacto`, y migran al layout `app-public-page`. El slice `cierre`
registra estos slices en la config.

Regla transversal: **cada slice cierra con build y suite en verde**. Por eso
`navLinks`/`pageNavLinks` se conservan hasta que su último consumidor migra (slice `home`).

---

### Slice 1 — `contenido` (content/*.ts + tests)

| # | Tarea | Req | Archivos |
|---|---|---|---|
| T1.1 | Tipos nuevos: `PageMeta`, `PageKey`, `Responsible`, `RichSegment`/`RichText`, `LegalDocument`/`LegalBlock`, `ContactSubject`, `ContactStep` | — | `app/content/types.ts` |
| T1.2 | `sitePages` (6 páginas + `/legal`) y `siteNavLinks` (5, orden de HP-01); `breadcrumbFor` resuelto sobre `sitePages`. `navLinks`/`pageNavLinks` se mantienen (se retiran en T4.4) | HP-01, HP-06 | `app/content/site.ts` |
| T1.3 | `responsible.ts`: todos los campos `null` + `placeholderLabel` por campo | HP-13 | `app/content/responsible.ts` |
| T1.4 | `legal.ts`: `legalNotice` + 4 documentos (anclas de HP-12) con los 13 puntos de HP-14 y el contenido de HP-15 en `RichText` | HP-12..15 | `app/content/legal.ts` |
| T1.5 | `contact.ts`: 4 asuntos, 3 pasos, texto de consentimiento con enlace a `/legal#tratamiento-datos`, etiquetas y mensajes de error | HP-11, 11b, 11c | `app/content/contact.ts` |
| T1.6 | `pages.ts`: `pageMeta` de las 7 páginas (404 con `noindex`) | HP-17, HP-04 | `app/content/pages.ts` |
| T1.7 | FAQ: grupo "Contacto y datos" con ≥ 3 preguntas consistentes con `/legal` y `/contacto`; `homeFaqCount` sin cambios | HP-19 | `app/content/faq.ts` |
| T1.8 | Barrel y tests de contenido: nav, `breadcrumbFor`, unicidad de `pageMeta`, 4 anclas, normas y plazos citados, 13 puntos, 3 categorías de almacenamiento, `responsible` todo `null`, FAQ | HP-20 | `app/content/index.ts`, `app/content/content.spec.ts` |

Forecast: **~750 líneas, 9 archivos** (4 nuevos). La mayor parte es `legal.ts` (~350).

### Slice 2 — `chrome` (servicios transversales y chrome compartido)

Depende de: `contenido`.

| # | Tarea | Req | Archivos |
|---|---|---|---|
| T2.1 | `PageMetaService`: `setPage(PageMeta)` con og/twitter/canonical/robots sin duplicar; `setJsonLd`/`clearJsonLd`; breadcrumb reimplementado encima. Specs | HP-17, HP-18, HP-06 | `app/services/page-meta.service{,.spec}.ts`, `app/components/public/breadcrumb/*.ts` (adaptar llamada y spec) |
| T2.2 | `app.config.ts`: `withInMemoryScrolling({ scrollPositionRestoration: 'top', anchorScrolling: 'enabled' })` | HP-12 | `app/app.config.ts` |
| T2.3 | `index.html`: title, description, og y twitter por defecto de KUVU | HP-18 | `index.html` |
| T2.4 | `styles.scss`: `scroll-padding-top`, `.section-eyebrow`, `.link-arrow`, hover de tarjetas, `:focus-visible`, anulación de view transitions bajo `reduce`, `mark.placeholder` | HP-16, HP-12 | `styles.scss` |
| T2.5 | `app-rich-text` (texto, marcador si `null`, valor si hay dato, enlace con fragment; sin `innerHTML`) + spec | HP-13 | `app/components/public/rich-text/*` (ts, scss, spec) |
| T2.6 | `app-service-icon` (switch de 5 íconos extraído de la home) + spec | HP-10 | `app/components/public/service-icon/*` |
| T2.7 | `site-header`: nav única desde `siteNavLinks` (input `navLinks` se mantiene como opcional hasta T4.4), `routerLinkActive` + `aria-current`, estado compacto por scroll, menú móvil a pantalla completa (Escape, botón, enlace, `NavigationEnd`, scroll lock, foco, escalonado con reduced motion). Spec | HP-01, 02, 07, 08 | `app/components/public/site-header/*` (4) |
| T2.8 | `site-footer`: 4 bloques (marca, Sitio, Legal con fragment, Contacto con WhatsApp y correo vía `app-rich-text`), grid responsive. Spec | HP-09 | `app/components/public/site-footer/*` (4) |
| T2.9 | `app-public-page` (header + breadcrumb opcional + `<ng-content>` + footer) + spec | design §3 | `app/components/public/public-page/*` |

Forecast: **~1.550 líneas, ~24 archivos** (9 nuevos). Lo más pesado: header (~480 con spec)
y `PageMetaService` (~200 con spec).

### Slice 3 — `paginas` (páginas nuevas + rutas)

Depende de: `chrome`.

| # | Tarea | Req | Archivos |
|---|---|---|---|
| T3.1 | `/servicios`: servicios con `app-service-icon`, beneficios por rol, CTA secundario a `/contacto`, eyebrows, reveal, `setPage`. Spec | HP-10, HP-16 | `app/components/pages/servicios/*` (4) |
| T3.2 | `buildContactMessage` (pura, omite opcionales vacíos) + spec | HP-11 | `app/components/pages/contacto/contact-message{,.spec}.ts` |
| T3.3 | `/contacto`: Reactive Form (validadores, `emailOrPhone`, `requiredTrue`), errores accesibles, `window.open` + fallback, `aria-live`, canales, 3 pasos. Spec | HP-11, 11b, 11c | `app/components/pages/contacto/*` (4) |
| T3.4 | `/legal`: aviso, fecha de vigencia, índice con fragment, 4 secciones con `id`, `app-rich-text`. Spec | HP-12..15 | `app/components/pages/legal/*` (4) |
| T3.5 | 404: mensaje, enlace a `/`, `noindex`. Spec | HP-04 | `app/components/pages/not-found/*` (4) |
| T3.6 | Rutas: `servicios`, `contacto`, `legal` lazy; `**` → `NotFoundComponent` lazy. Spec de rutas | HP-04, HP-05 | `app/app.routes.ts`, `app/app.routes.spec.ts` (nuevo) |

Forecast: **~1.400 líneas, ~23 archivos** (22 nuevos). Lo más pesado: `/contacto` (~630 con
specs).

### Slice 4 — `home` (home escaparate + páginas existentes)

Depende de: `paginas`.

| # | Tarea | Req | Archivos |
|---|---|---|---|
| T4.1 | Home: servicios como resumen con `app-service-icon` y "Ver servicios →"; beneficios por rol sale; seguridad, compañías y origen se quedan; eyebrows; enlace secundario a `/contacto`; `setPage(pageMeta.home)` + JSON-LD `@graph` (retirado en destroy). Spec | HP-03, 16, 17, 18 | `app/components/home/*` (4) |
| T4.2 | `/nosotros` sobre `app-public-page`, `pageMeta`, eyebrows. Spec | HP-01, 06, 16, 17 | `app/components/pages/nosotros/*` (4) |
| T4.3 | `/preguntas-frecuentes` sobre `app-public-page`, `pageMeta`, eyebrows, grupo nuevo visible. Spec | HP-19, 16, 17 | `app/components/pages/preguntas-frecuentes/*` (4) |
| T4.4 | Retirar `navLinks`/`pageNavLinks` de `site.ts` y el input `navLinks` del header; migrar los specs que los usan | HP-01 | `app/content/site.ts`, `content.spec.ts`, `site-header.component{,.spec}.ts`, `breadcrumb.component.spec.ts` |

Forecast: **~550 líneas, ~16 archivos** (0 nuevos).

### Slice — `cierre`

| # | Tarea | Archivos |
|---|---|---|
| T5.1 | `sdd.config.md`: slices de este cambio; `sdd-init.md` coherente | `sdd/sdd.config.md`, `sdd/sdd-init.md` |

Forecast: **~20 líneas, 2 archivos**.

---

## Forecast de riesgo

| Slice | Líneas (tests incl.) | Archivos | Nuevos |
|---|---|---|---|
| `contenido` | ~750 | 9 | 4 |
| `chrome` | ~1.550 | ~24 | 9 |
| `paginas` | ~1.400 | ~23 | 22 |
| `home` | ~550 | ~16 | 0 |
| `cierre` | ~20 | 2 | 0 |
| **Total** | **~4.300** | **~65 únicos (~70 con repetidos entre slices)** | **35** |

- Umbral declarado: 300 líneas → **riesgo ALTO** (≈ 14× el umbral; incluso cada slice por
  separado lo supera).
- Repos involucrados: **1** (este repo, solo frontend). Backend y DB no se tocan.
- Aproximadamente 45 % de las líneas son tests y ~20 % son textos de contenido (legal + FAQ),
  que se revisan como redacción, no como lógica.

## Estrategia de entrega propuesta (`ask-on-risk`)

**Recomendado: PRs encadenados, uno por slice**, cada uno con build y suite en verde:

1. PR1 `contenido` → base `main` (no cambia nada visible: solo agrega módulos).
2. PR2 `chrome` → base PR1. Header/footer nuevos; el footer enlaza a `/legal` que todavía
   no existe (cae en el comodín actual hacia `/login`).
3. PR3 `paginas` → base PR2. Aparecen `/servicios`, `/contacto`, `/legal` y la 404.
4. PR4 `home` + `cierre` → base PR3.

Para que `main` nunca tenga enlaces del footer rotos, mergear PR2 y PR3 juntos (o en
secuencia inmediata). Alternativa: **un solo PR** con commits por slice — requiere aprobación
explícita del responsable del repo por superar el umbral; revisable si se lee commit por
commit.

## Decisión de entrega (Gate C)

- Slices confirmados por el usuario: `todos` (`contenido → chrome → paginas → home → cierre`).
- Estrategia elegida: **un solo PR con un commit por slice** (opción B). El usuario, como
  responsable del repo, **aprueba explícitamente** superar el umbral de 300 líneas
  (forecast ~4.300). Registrado el 2026-10-18.

## Alcance previsto de `document`

- `openapi_afectado`: **no** (no hay endpoints HTTP).
- `changelog_afectado`: **sí** (páginas nuevas, navegación, legales, 404 visibles).
- `readme_afectado`: **sí, si** el README lista las rutas del sitio público (verificar en
  `document`).
- `architecture_afectado`: **sí** — clúster público (páginas, `app-public-page`,
  `rich-text`, `service-icon`, `PageMetaService` ampliado, `**` → 404, `withInMemoryScrolling`,
  deuda de chrome duplicado saldada, límite "sin legal" del sitio).
- `guidelines_afectado`: **no** (no hay convención nueva de código; además el archivo es
  gestionado por el instalador).
- Documento del cambio: `docs/home-profesional.md`.
