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

### Slice `app` (ampliación: sidebar)
- T8 `app/motion/tap-feedback.ts`; header reexpone `MENU_TAP_FEEDBACK_MS` desde ahí.
- T9 `SidebarComponent`: `elegido`, `elegir`, timer, salteo de `NavigationEnd`, destroy;
  template con `is-pressed`, `(click)` y `.sidebar__label`.
- T10 `sidebar-feedback.scss` + `styleUrls` (D4).
- T11 Spec del sidebar: CA-7 (estilos medidos con `getComputedStyle`), CA-8 (contraste del
  acento con `color-contrast.ts`), CA-9 (pausa en móvil, sin pausa en escritorio).

### Slice `cierre`
- T6 `sdd/sdd-init.md`: convención de pausa de cierre del menú y grano de la app.

### Verificación
- T7 `ng test`, `ng build`, CSS compilado y captura en Chrome headless del fondo.

## Forecast de riesgo
~13 archivos, ~300 líneas con tests (con la ampliación del sidebar), un repo. En el umbral
de 300: **bajo-medio**; se entrega en commits por slice.

## Alcance previsto de `document`
changelog: sí (Fixed). architecture: no (sin componentes ni límites nuevos; se registra
"sin cambios"). readme: no. openapi: no. guidelines: no.
