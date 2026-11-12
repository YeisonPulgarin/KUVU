# Tasks — ajustes-hover-movil-y-textura

Modalidad `test-after`. Slices: `chrome` (header) → `app` (fondo interno) → `cierre`. Orden
default; los dos slices son independientes.

### Slice `chrome`
- T1 Header: `MENU_TAP_FEEDBACK_MS`, `pressedHref`, `chooseLink`, cancelación del timer en
  `closeMenu`/destroy y salteo del cierre por `NavigationEnd` con cierre pendiente (D1).
  Template: `is-pressed` y `chooseLink`.
- T2 SCSS: `:active` y `.is-pressed` en los estados; `-webkit-tap-highlight-color` (D2).
- T3 Spec del header: CA-1 (reglas en hojas: estado aplicado con `.is-pressed`, medido por
  `getComputedStyle` del subrayado), CA-2, CA-3. Ajustar los tests existentes de cierre al
  elegir una opción.

### Slice `app`
- T4 `styles/_grain.scss`: `$grain-specks`. `shared.styles.scss`: capas de `.main-content`
  (D3).
- T5 Spec de `app-layout`: tres capas (degradado, SVG de motas, color), sin velo; el
  degradado usa el color de la empresa del host.

### Slice `cierre`
- T6 `sdd/sdd-init.md`: convención de pausa de cierre del menú y grano de la app.

### Verificación
- T7 `ng test`, `ng build`, CSS compilado y captura en Chrome headless del fondo.

## Forecast de riesgo
~8 archivos, ~150 líneas con tests, un repo. **Bajo**.

## Alcance previsto de `document`
changelog: sí (Fixed). architecture: no (sin componentes ni límites nuevos; se registra
"sin cambios"). readme: no. openapi: no. guidelines: no.
