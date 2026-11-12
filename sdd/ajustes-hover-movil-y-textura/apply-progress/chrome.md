# apply-progress — chrome

- [x] T1 Header: `MENU_TAP_FEEDBACK_MS` (320), `pressedHref`, `chooseLink`; `closeMenu` cancela
  el cierre pendiente; `NavigationEnd` no cierra si hay cierre programado; destroy cancela.
- [x] T2 SCSS: `:active` e `.is-pressed` en las reglas de estado y de movimiento;
  `-webkit-tap-highlight-color: transparent`.
- [x] T3 Spec: cierre tras la pausa, opción marcada, `NavigationEnd` no corta, Escape
  inmediato, y color + subrayado completo medidos con `getComputedStyle` en la opción elegida.

test_mode: test-after
test_command: npx ng test --watch=false --browsers=ChromeHeadless (frontend/proyecto_angular) + npx ng build
tests_status: verde (714/714)
tests_agregados: components/public/site-header/site-header.component.spec.ts
excepciones_sin_test: el `:active` real de un toque no se reproduce en Karma; se cubre con
  `.is-pressed` (mismas reglas) y con la revisión del CSS compilado en verify.
logs_conforme: sí (sin logs)
