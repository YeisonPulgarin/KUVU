# apply-progress — app

- [x] T2 `app-layout.component.ts`: `tema` computado y cuatro bindings `[style.--…]` en el host.
  Comentario de `--color-primario-contraste` en `shared.styles.scss` actualizado (lo
  sobrescribe `<app-layout>`).
- [x] T3 Regresión en `app-layout.component.spec.ts`: empresa amarilla activa →
  `.btn-primary` fuera del layout con el gradiente azul KUVU y sin amarillo; dentro, amarillo;
  sin empresa, el host no declara tokens.

test_mode: test-after
test_command: npx ng test --watch=false --browsers=ChromeHeadless + npx ng build
tests_status: verde (709/709)
tests_agregados: components/shared/app-layout/app-layout.component.spec.ts
excepciones_sin_test: —
logs_conforme: sí (sin logs)
