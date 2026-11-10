# apply-progress — intro

```
test_mode: test-after
test_command: $env:CHROME_BIN=...chrome.exe; npx ng test --watch=false --browsers=ChromeHeadless (frontend/proyecto_angular) + npx ng build
tests_status: verde (499 specs, 0 fallos; build OK)
tests_agregados:
  - src/app/services/password-policy.spec.ts (nuevo)
  - src/app/services/auth.service.spec.ts (nuevo)
  - src/app/guards/auth.guard.spec.ts (nuevo)
  - src/app/components/cambiar-password/cambiar-password.component.spec.ts (nuevo)
  - src/app/components/login/login.component.spec.ts (actualizado)
  - src/app/app.routes.spec.ts (actualizado)
excepciones_sin_test: ninguna
logs_conforme: sí (el slice no agrega logs; el frontend no registra credenciales)
```

## Tareas

| Tarea | Estado |
|---|---|
| T-15 `services/password-policy.ts` | completa |
| T-16 `AuthService` (`login` con contraseña, `cambioPendiente`, `cambiarPassword`, `MENSAJE_ACCESO`) | completa |
| T-17 `cambioPasswordGuard` + ruta lazy `cambiar-contrasena` | completa |
| T-18 `components/cambiar-password/` | completa |
| T-19 `/login` | completa |

## Desvíos y notas

- `AuthService.login` recibe un quinto parámetro opcional `empresa`: la empresa elegida en
  `/acceder` no está en la caché de empresas del servicio, y la pantalla de cambio la usa para su
  marca (nombre y fondo) mientras no hay sesión.
- `MENSAJE_ACCESO` vive en `auth.service.ts` (igual al 401 del backend) para que el login y la
  pantalla de cambio lo compartan sin que un chunk lazy importe al otro.
- El mapa de fondos por subdominio se extrae a `components/login/login-background.ts` (lo usan las
  dos pantallas). La pantalla de cambio reutiliza `login.component.scss` y agrega el suyo.
- Salir del cambio obligatorio hace `logout()` (termina en `/login` → `/acceder`).
- `auth.service.ts` no agrega imports (los tipos nuevos van en el mismo archivo) para no chocar con
  la línea de import que agrega `app-interna-ux`. `auth.service.spec.ts` sí choca con el suyo
  (ambos lo crean): al integrar, se unen los dos specs.
- `ng build`: warning de presupuesto `css-inline-fonts` (Google Fonts en `index.html`), que este
  cambio no toca.
