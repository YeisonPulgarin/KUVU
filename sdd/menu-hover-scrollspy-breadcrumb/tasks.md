# Tasks — menu-hover-scrollspy-breadcrumb

Referencias: `spec.md`, `design.md`. Modalidad: `test-after` (de `sdd.config.md`).

## Slices involucrados
`contenido` → `chrome` → `home` → `cierre`. Desvío del default: los specs de home y
`/nosotros` que fijan el orden del equipo se actualizan dentro de `contenido`, junto con el
dato, para que cada commit deje la suite en verde (no se abre el slice `paginas`).

## Tareas

### Slice `contenido`
- T1 `content/team.ts`: `members` en orden Carlos Arciniegas, Wilson Solano, Yeison Pulgarin
  (RF-6). Actualizar `content.spec.ts`, `home.component.spec.ts` y
  `nosotros.component.spec.ts` al orden nuevo (CA-8).
- T2 `content/site.ts`: `homeSpySections` (D1) + test en `content.spec.ts`: `href` en el
  mismo orden que `siteNavLinks` e ids no repetidos.

### Slice `chrome`
- T3 `site-header/section-spy.service.ts`: `activeSectionIndex` puro + servicio (D2).
  Spec: casos de la función (antes de la línea, entre secciones, al fondo, vacío) y del
  servicio (start calcula, scroll recalcula en el frame, stop resetea y quita listeners) con
  los dobles de `motion/testing/` (CA-4, CA-6).
- T4 Header: `pageHref`/`activeHref`, bindings de `is-active`/`aria-current`, span
  `.mobile-label`, rastro (D3, D4). Spec: CA-2, CA-3, CA-5; los tests existentes de página
  activa siguen pasando.
- T5 `scroll-trail.scss` nueva + `styleUrls` (D4); hover/focus de `.mobile-item` en
  `site-header.component.scss` (D6, CA-1).
- T6 `scroll-offset.ts`: sumar el alto de `.scroll-trail` (D5) + spec (CA-7).

### Slice `home`
- T7 `home.component.html`: `id="contacto"` en `.cta-final`. `home.component.ts`: inyecta
  `SectionSpyService`, `start(homeSpySections)` tras el primer render, `stop()` en
  `ngOnDestroy`. Spec: el spy se apaga al destruir la home (CA-6).

### Slice `cierre`
- T8 `sdd/sdd-init.md`: convención del spy/rastro y del orden del equipo.

### Verificación
- T9 `ng test` (Chrome headless) y `ng build` sin errores de presupuesto (CA-9).

## Forecast de riesgo
- Archivos: ~14 (5 nuevos o casi nuevos: servicio + spec, `scroll-trail.scss`; resto
  ediciones), un solo repo, solo frontend.
- Líneas estimadas (tests incluidos): ~500 → **supera el umbral de 300 (riesgo alto)**.
  Estrategia `ask-on-risk`: el pedido es commits locales sin PR; se entrega en un commit por
  slice para revisión incremental y la decisión de PR queda al usuario.

## Alcance previsto de `document`
- `openapi_afectado`: no.
- `changelog_afectado`: sí (cambio visible: hover, scroll-spy, rastro, orden del equipo).
- `readme_afectado`: no.
- `architecture_afectado`: sí (servicio raíz compartido home → header).
- `guidelines_afectado`: no (la convención va a `sdd-init.md`).
