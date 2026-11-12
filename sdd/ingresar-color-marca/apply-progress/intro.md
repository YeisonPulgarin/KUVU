# apply-progress — intro

- [x] T1 `services/auth.service.ts`: `temaDeEmpresa` (pura, exportada) + `TemaEmpresa`;
  `AuthService` ya no escribe en `document.documentElement` (se eliminan
  `aplicarTemaEmpresa` y `resetearTema`). Tests: `temaDeEmpresa` (contraste, fallbacks, null)
  y regresión de login y restauración de sesión sin tokens en `<html>`.

test_mode: test-after
test_command: npx ng test --watch=false --browsers=ChromeHeadless (frontend/proyecto_angular) + npx ng build
tests_status: verde (709/709)
tests_agregados: services/auth.service.spec.ts
excepciones_sin_test: —
logs_conforme: sí (sin logs)
