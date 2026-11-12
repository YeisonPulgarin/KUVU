# apply-progress — chrome

- [x] T3 `SectionSpyService` + `activeSectionIndex` (section-spy.service.ts + spec).
- [x] T4 Header: `pageHref`/`activeHref`, `is-active` y `aria-current` calculados (deja
  `routerLinkActive`), `.mobile-label`, rastro `nav.scroll-trail`.
- [x] T5 `scroll-trail.scss` (hoja aparte en `styleUrls`); hover/foco del menú móvil:
  color de marca, tinte 14 %, subrayado que crece, desplazamiento 12 px (solo con movimiento).
- [x] T6 `headerScrollOffset` suma el alto de `.scroll-trail` + test.

test_mode: test-after
test_command: npx ng test --watch=false --browsers=ChromeHeadless (frontend/proyecto_angular, CHROME_BIN fijado) + npx ng build
tests_status: verde (702/702; build sin errores de presupuesto)
tests_agregados: components/public/site-header/section-spy.service.spec.ts, components/public/site-header/site-header.component.spec.ts, scroll-offset.spec.ts
excepciones_sin_test: la animación visual (crecimiento del subrayado, entrada de pasos) no se testea en Karma; se valida por inspección de reglas en verify.
logs_conforme: sí (sin logs)
