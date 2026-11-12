# apply-progress — home

- [x] T7 `id="contacto"` en `.cta-final`; la home arranca el spy con `afterNextRender`
  (no en `ngAfterViewInit`, para no escribir signals del header durante la detección de
  cambios) y lo apaga en `ngOnDestroy`.

test_mode: test-after
test_command: npx ng test --watch=false --browsers=ChromeHeadless (frontend/proyecto_angular, CHROME_BIN fijado) + npx ng build
tests_status: verde (702/702; build sin errores de presupuesto)
tests_agregados: components/home/home.component.spec.ts (describe 'scroll-spy')
excepciones_sin_test: —
logs_conforme: sí (sin logs)
