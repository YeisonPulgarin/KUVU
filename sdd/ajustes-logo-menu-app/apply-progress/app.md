# Apply progress — app

## Tareas

- [x] T7 `src/styles/_grain.scss` (nuevo, solo declara `$grain`); `_site.scss` y
      `shared.styles.scss` lo cargan con `@use`.
- [x] T8 `shared.styles.scss`: `.app-layout .main-content` con el grano bajo un velo de
      `--color-bg` al 93 %; medida del primario para los `.btn-action` de descarte.
- [x] T9 `confirm-host`: descarte con `btn-action btn-action--danger` + ícono `x` (vale para
      "Cancelar" y para `cancelarTexto`, p. ej. "Volver"). `autofocus` sin cambios.
- [x] T10 Cancelar de `contratos`, `locales`, `pagos`, `mantenimiento`, `usuarios` (×2): clase
      + ícono.

## Desvíos

- El Cancelar de `pagos` (pasarela del arrendatario) no está en `.modal__footer` sino en
  `.pasarela-actions`. Por eso la regla de medida es
  `.modal__footer .btn-action, .pasarela-actions .btn-action`, fuera del bloque `.modal`
  (el design la anidaba solo en `.modal__footer`).
- El SVG del grano queda dos veces en `styles.css` compilado (en `.site-root::before` y en
  `.main-content`), unos 400 B. El parcial evita duplicar el código fuente; el CSS emitido
  repite el literal porque son dos reglas distintas. Initial total: 474,53 kB, sin cambio
  relevante.

test_mode: test-after
test_command: npx ng test --watch=false --browsers=ChromeHeadless (con CHROME_BIN)
tests_status: verde (677/677)
tests_agregados:
  - frontend/proyecto_angular/src/app/components/shared/confirm/confirm.spec.ts
  - frontend/proyecto_angular/src/app/components/shared/app-layout/app-layout.component.spec.ts
  - frontend/proyecto_angular/src/app/components/contratos/contratos.component.spec.ts
  - frontend/proyecto_angular/src/app/components/locales/locales.component.spec.ts
  - frontend/proyecto_angular/src/app/components/pagos/pagos.component.spec.ts
  - frontend/proyecto_angular/src/app/components/mantenimiento/mantenimiento.component.spec.ts (admin y arrendatario)
  - frontend/proyecto_angular/src/app/components/usuarios/usuarios.component.spec.ts (los dos modales)
excepciones_sin_test: la intensidad visual del grano se revisa en verify
logs_conforme: sí (sin logs nuevos)
