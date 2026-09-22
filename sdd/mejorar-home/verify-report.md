# Verify Report: Mejorar Home Page

**Estado:** ✅ **VERDE (re-verificación tras extensión de contenido — hero fullsize + secciones)**

## Resumen

El reporte cubre el estado final del cambio `mejorar-home`, que incluye el cambio original
(integración Tailwind v4 + menú hamburguesa + refactor SCSS) y la **extensión de contenido
aprobada en Gate A** (hero fullsize, "¿Qué es KUVU?", Servicios, Compañías, CTA final, navbar
ajustado a anclas). Se mergea con la verificación anterior: esta re-corrida valida el estado
post-extensión.

## Historial de verificación

1. **Verificación inicial (cambio original):** bloqueada por build (`tailwindcss` como plugin
   directo de PostCSS, roto en v4). Corregido en re-campaña de `apply` (ver
   `apply-progress/slice-unico.md` → "Corrección post-verify"). Resultó en **9/9 SUCCESS**.
2. **Desvío visual reportado por el usuario** ("los estilos no se están aplicando"): se
   diagnosticó que el dev server corría una config vieja (sin `postcss.config.json`) y que el
   CSS global `.main-content` colisionaba con la home. El usuario confirmó que tras reiniciar
   el servidor los estilos funcionan; la extensión de contenido **eliminó** `<main
   class="main-content">` de la home, resolviendo la colisión de raíz.
3. **Esta re-verificación (extensión de contenido):** **17/17 SUCCESS** + build de producción
   compila.

## Desvío resuelto (cambio original) — Configuración de Tailwind

- **Síntoma:** build abortaba con `Error: It looks like you're trying to use 'tailwindcss'
  directly as a PostCSS plugin`.
- **Causa raíz:** Angular 21 (`@angular/build`) detecta `tailwind.config.js` y lo usa como
  plugin de PostCSS directo, roto en Tailwind v4. Angular solo lee config de PostCSS en JSON,
  así que el `postcss.config.js` (JS) se ignoraba.
- **Corrección:** eliminado `tailwind.config.js`; creado `postcss.config.json` con
  `@tailwindcss/postcss`; agregado `@reference` en `home.component.scss`; reordenado el import
  de fuente en `styles.css`. Resultado: build OK + tests verdes.

## Desvío visual (reportado por el usuario, resuelto)

- **Síntoma:** "los estilos no se están aplicando" en `localhost:4200`.
- **Causas:** (1) dev server arrancado antes de la corrección de PostCSS, sin Tailwind
  procesado — resuelto reiniciando el servidor; (2) regla global
  `.main-content { margin-left: var(--sidebar-w); height: 100vh; ... }` de `src/styles.css`
  aplicada a la home — resuelto en la extensión al eliminar `<main class="main-content">` del
  template. La home ya no usa la clase que colisiona.

## Criterios de aceptación (spec de la extensión)

1. **El hero ocupa al menos el alto de la ventana (`min-h-screen`) y se adapta en móvil sin
   overflow horizontal** — ✅ **PASA** en CSS (`min-height: calc(100vh - navbar)`, grid
   centrada, `overflow: hidden`). El sin-overflow en rangos concretos queda cubierto por el
   criterio 6 (visual).
2. **Todas las secciones presentes y visibles en `home.component.html`** — ✅ **PASA.** Hero,
   `#que-es`, `#servicios` (5 tarjetas), `#companias` (4 compañías), `.cta-final`; cubierto
   por tests.
3. **El CTA (y el CTA final) navega a `/acceder`** — ✅ **PASA.** Tests verifican
   `href="/acceder"` en `.hero-cta` y `.cta-button`.
4. **Los enlaces del menú apuntan a las anclas correspondientes** — ✅ **PASA.** Navbar
   desktop y drawer móvil apuntan a `#inicio`, `#que-es`, `#servicios`, `#companias`;
   cubierto por tests.
5. **El contenido anterior de la home ya no está (sin "Quienes Somos", sidebar ni banner
   como estructura principal)** — ✅ **PASA.** El template nuevo elimina `.sidebar`,
   `.image-banner`, `.layout-grid` y la banda `.hero-title` vieja.
6. **Sin overflow horizontal en 320px–1920px** — ⏳ pendiente de verificación visual en
   navegador real (no ejecutable en la verificación automatizada). Se reporta como limitación,
   no como fallo — igual que en la verificación anterior.
7. **La suite de tests del componente home pasa en verde; selectores usados por tests se
   mantienen o se ajustan** — ✅ **PASA.** **17/17 SUCCESS**; `#hamburger-toggle`,
   `#mobile-menu`, `[class.hidden]` y `aria-expanded` conservados.

## Resultado de tests

- **Comando:** `ng test --watch=false --browsers=ChromeHeadless`
- **Resultado:** ✅ **verde** — 17 de 17 tests SUCCESS.
- Cobertura ampliada en `home.component.spec.ts` (de 9 a 17 tests): hero, CTA, secciones de
  contenido, compañías, navbar y drawer. Coincide con el bloque `tests_agregados` /
  `excepciones_sin_test` (sin excepciones).

## Build de producción

`ng build` (producción) compila correctamente. Quedan warnings de budget **no bloqueantes**:
- `home.component.scss` excede `anyComponentStyle` (10 kB) por ~5.61 kB (15.61 kB total) —
  creció con las secciones nuevas. No rompe el build; opción registrada para `refine`.
- Fuentes inline (pre-existentes, ajenas a este cambio).

## Documentación declarada (eje verify)

`tasks.md` declara: `openapi_afectado: false`, `changelog_afectado: true`,
`readme_afectado: false`, `architecture_afectado: false`, `guidelines_afectado: false`.
Coincide con lo observado: cambio visual de contenido estático en un único componente, sin
API HTTP ni cambios de arquitectura. ✅ alcance de documentación declarado.

## Guidelines y logs (eje verify)

- `logs_conforme: sí` — la extensión no agrega logs (UI de Angular), coherente con la política.
- Guidelines de stack: componente standalone Angular, lógica en el componente, estilos scoped
  con `@apply` de Tailwind v4, HTML semántico con anclas y `aria-*` conservados. ✅
- Contenido estático sin datos sensibles ni procesamiento de inputs. ✅

## Desvíos reportados al orquestador

1. (Resuelto) Bloqueo de build de Tailwind del cambio original.
2. (Resuelto) Desvío visual de estilos — dev server reiniciado + colisión `.main-content`
   eliminada de raíz al quitar la clase de la home.
3. **Pendiente de cuidado (no bloqueante):** budget de `home.component.scss` (15.61 kB vs
   10 kB) por las secciones nuevas. Candidato a consolidar en `refine`; no bloquea archivar.
4. **Pendiente visual:** criterio 6 (overflow 320–1920px) requiere mirada del usuario en
   navegador — el dev server sirve la home nueva y corregida.

## Conclusión

La fase **verify da verde** para el estado final del cambio: **17/17 tests passing** + build
de producción OK. Criterios 1–5 y 7 de la extensión pasan; el criterio 6 queda como
verificación visual pendiente con el dev server ya actualizado (los estilos funcionan según
confirmación del usuario). Listo para ofrecer `secure` / `refine` y pasar a `document`.