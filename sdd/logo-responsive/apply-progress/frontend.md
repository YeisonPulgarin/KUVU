# Apply Progress — slice: frontend

```
test_mode: test-after
test_command: npx ng test --watch=false --browsers=ChromeHeadless
tests_status: verde (19/19)
tests_agregados: fronted/proyecto_angular/src/app/components/home/home.component.spec.ts
excepciones_sin_test: login, landing, navbar — cambios puramente de template/SCSS (HTML estático + estilos), sin lógica de componente nueva que testear; se cubren en verify vía criterios de aceptación visuales
logs_conforme: sí (no se agregó código de log — cambios solo visuales)
```

## Bloque 1 — PR Logo ✅ COMPLETO

| Tarea | Estado | Notas |
|---|---|---|
| T01 | ✅ | `Logo_Kuvu.jpeg` copiado a `public/` (783x387, ratio ~2:1) |
| T02 | ✅ | HomePage `.logo-box` → `<img src="/Logo_Kuvu.jpeg">` + 2 tests nuevos |
| T03 | ✅ | Login `brand-logo` (gradiente "K") → `<img>` 120px/96px |
| T04 | ✅ | Landing logo activado + `<img>` 140px/112px |
| T05 | ✅ | Navbar interno emoji 🏢 → `<img>` 28px |
| T06 | ✅ | `kuvu_mobile/` eliminada por completo (git rm -r -f + Remove-Item) |

Desvíos del plan: el logo del sidebar del admin se mantiene como avatar con inicial (es el brand de la *empresa* del usuario, no el de KUVU — ver D-05 en design).

Ajuste post-revisión del usuario (recorte del texto redundante): se eliminó el texto "KUVU" que acompañaba al logo en HomePage (`.logo-text`), Login (`.brand-name`) y Landing (`.brand-name`), porque la imagen del logo ya lo contiene. El tagline se conserva. Logo agrandado en los 3 (HomePage 40/48px alto, Login 140/120px, Landing 160/132px). El text del navbar interno se mantiene porque es el nombre de la empresa (no KUVU) — RF-01→04 en spec se consideran satisfechos con el texto de marca removido por decisión del usuario.

## Bloque 2 — PR Responsive público ✅ COMPLETO

| Tarea | Estado | Notas |
|---|---|---|
| T08 | ✅ | HomePage: `overflow-x-hidden`, hamburger 44px, botones del drawer 44px, `overflow-wrap` en hero-title |
| T09 | ✅ | Login/Landing: `100dvh` + `overflow-x-hidden`, cards con padding reducido en móvil, inputs/rows touch target 44-48px |
| T12 | ✅ | Navbar interno: breakpoint 900→767px + hamburger 44px |

Tests: 19/19 verde. Cambios puramente SCSS/HTML, sin lógica nueva testable.

**Nota:** el navbar interno no se usa en el layout admin real (ahí está el sidebar) — ver audit — así que T12 es defensivo. Hacer que el menú se cierre al navegar en el navbar: el admin real no depende de él, se omite (YAGNI, cubierto por el sidebar de T07).

## Bloque 3 — PR Responsive admin ✅ COMPLETO

| Tarea | Estado | Notas |
|---|---|---|
| T07 | ✅ | Sidebar TS: señales `menuAbierto`/`esMobile`, matchMedia 767px + listener, cierre en NavigationEnd, métodos `abrirMenu`/`cerrarMenu`, computed `mostrarTexto` (para que en móvil se vea expandido aunque `colapsado` venga del desktop). HTML: hamburger flotante `.sidebar__mobile-toggle` 44px (`@if !menuAbierto`) + backdrop `.sidebar__backdrop` (`@if menuAbierto`, `(click)=cerrarMenu`) + clase `sidebar--mobile-open`. SCSS: media query 768→767px, sidebar overlay full width 240px con z-index 200, backdrop z-index 150, toggle flotante z-index 250 (desktop `display:none`), `.sidebar__toggle` desktop oculto en móvil. `styles.css`: `.main-content` `padding-top: 4.5rem` en móvil (gutter para el hamburger flotante). |
| T10 | ✅ | Dashboard: stats-grid 1 col móvil/2 cols 640-1023/4 cols desktop, `__content` 2→1 col a 767px (antes 900px), `.panel` overflow-x auto, `.tabla min-width: 560px` para scroll horizontal, `.dashboard` padding 1rem móvil, `.quick-btn` min-height 44px |
| T11 | ✅ | shared.styles: breakpoints unificados 500→639px (form-grid) y 700→767px/639px (page/header/mant-stats), `.tabla min-width: 600px` + scrollbar fino global (ya existía), `.card` overflow-x auto, filtros bar apilados en móvil (inputs width 100%, min-width 0), `.mant-card` columna en móvil, touch targets `.btn-* min-height: 44px` móvil |
| T13 | ✅ | Touch targets + grids: `.usuarios-grid minmax(min(100%, 320px), 1fr)`, `.usuario-card flex-wrap`, `.btn-icon` 44px móvil, `.header-actions` pagos `flex-wrap`, limpieza de CSS muerto en locales.component.scss (`.usuarios-grid` sin uso) |

Tests: 19/19 verde (corridas tras el bloque completo). Cambios puramente SCSS/TS de plantilla, sin lógica de negocio nueva testable; el bloque de sidebar se cubre en verify vía criterios visuales.

Layout derivado de la revisión: alta fidelidad (overlay drawer, justificada por los 13 gates de diseño y la infra de signals ya existente).

## DONE