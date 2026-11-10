# Apply progress — intro

## Tareas

- [x] T5 `/acceder`: `.brand-lockup` (símbolo `logo.responsive` con `alt=""` + `.brand-wordmark`
      "KUVU") dentro de `a.brand-link`, que conserva su `aria-label`.
- [x] T6 `/login` y `/cambiar-contrasena`: el mismo lockup; estilos en `login.component.scss`
      (compartido por las dos vistas). La imagen es decorativa y el texto visible nombra la marca.

## Desvíos

- Los estilos del lockup viven en una hoja propia, `components/login/brand-lockup.scss`,
  que comparten landing, login y cambiar-contraseña por `styleUrls`. El design los ubicaba
  dentro de `landing.component.scss` y `login.component.scss`, pero ahí la hoja de landing
  (que ya incrusta Google Fonts por su `@import` de Syne/Inter) pasaba de 19,96 kB a
  20,24 kB y `ng build` fallaba por el presupuesto `anyComponentStyle` (error en 20 kB).
  Con la hoja aparte, landing queda en 19,80 kB, por debajo de su línea base.
- El lockup mide lo mismo en las tres vistas: símbolo de 56 px (48 px en móvil).
- En login y cambiar-contraseña el lockup es un `<div>` porque la marca no es un enlace. En
  landing es un `<span>` dentro del `<a>`.

test_mode: test-after
test_command: npx ng test --watch=false --browsers=ChromeHeadless (con CHROME_BIN)
tests_status: verde (669/669)
tests_agregados:
  - frontend/proyecto_angular/src/app/components/landing/landing.component.spec.ts
  - frontend/proyecto_angular/src/app/components/login/login.component.spec.ts
  - frontend/proyecto_angular/src/app/components/cambiar-password/cambiar-password.component.spec.ts
excepciones_sin_test: el contraste final sobre la foto se revisa visualmente en verify
logs_conforme: sí (sin logs nuevos)
