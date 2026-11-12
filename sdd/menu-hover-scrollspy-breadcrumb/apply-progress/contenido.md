# apply-progress — contenido

- [x] T1 Orden del equipo en `content/team.ts` (Carlos Arciniegas, Wilson Solano, Yeison
  Pulgarin); specs de contenido, home y `/nosotros` con el orden nuevo. El título del test de
  la banda dice ahora "team order" porque el orden pedido no se garantiza igual al de la foto.
- [x] T2 `homeSpySections` en `content/site.ts` + test de orden contra `siteNavLinks`.

Desvío: los specs de home y `/nosotros` que fijan el orden se tocan en este slice (ver tasks).

test_mode: test-after
test_command: npx ng test --watch=false --browsers=ChromeHeadless (frontend/proyecto_angular, CHROME_BIN fijado) + npx ng build
tests_status: verde (702/702; build sin errores de presupuesto)
tests_agregados: content/content.spec.ts, components/home/home.component.spec.ts (orden), components/pages/nosotros/nosotros.component.spec.ts (orden)
excepciones_sin_test: —
logs_conforme: sí (sin logs: cambio de UI)
