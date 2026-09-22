# Apply progress — slice `frontend`

Cambio: `login-intro-transition` — restructuración del flujo de acceso con intro cinematográfica.

## Estado: COMPLETADO

Modalidad de tests: `test-after` (declarada en `sdd/sdd.config.md`; no se preguntó).

## Tareas ejecutadas

### T1 — `IntroStateService` + spec
- Archivos: `src/app/services/intro-state.service.ts`, `intro-state.service.spec.ts` (nuevos).
- Flag de intro "una sola vez por carga" (no persistente), `debeReproducirse()` respeta
  `prefers-reduced-motion` (matchMedia en constructor, detección una sola vez).
- Spec: 3 tests con stub de `matchMedia`.

### T2 — `AuthIntroComponent` máquina de fases + estructura + spec
- Archivos: `src/app/components/shared/auth-intro/auth-intro.component.ts|html`, + spec.
- Máquina de fases TS: `fase` signal 1..5, timers de `DURACION_FASE_MS = 1000`,
  `output() completada` en fase 5, cleanup de timers en ngOnDestroy.
- Template: `.blueprint` (grid + SVG de líneas técnicas + marca), `.stage` con 12 piezas de
  casa (losas, muros, entrepiso, techos, ventanas, puerta, volado, chimenea) y 12 partículas.
- Uso de `@if` con `fase() >= n` para aplicar clases `.flotando/.ensamblando/.iluminada/.final`.

### T3 — `AuthIntroComponent` visuales CSS 3D
- Archivo: `auth-intro.component.scss` nuevo.
- Blueprint cian/teal (grid + stroke-dashoffset del SVG + partículas), exploded view por
  custom props (`--dx0/--dy0/--dz0/--rot0/--rot1/--z1/--td`), fases `.flotando` (>=2),
  `.ensamblando` (>=3), `.iluminada` (>=4, glow ventanas ámbar + `.glow-interior`),
  `.final` (>=5, sway de cámara + `.intro-glow`), `.saliendo` (fade de salida 650ms),
  responsive 767/480. Sin three.js ni @angular/animations.
- Nota: SCSS usa `@use 'sass:list'` y `list.nth` (evita deprecación global `nth`).

### T4 — `LandingComponent` orquestación + copy + modelo + spec
- Archivos: `landing.component.ts|html|scss` (editados), `landing.component.spec.ts` (nuevo).
- Señales `estado` ('INTRO' | 'SELECTION') y `transicionando`; `completadaIntro()` marca el
  flag en `IntroStateService` y hace transición de 650ms hacia la selección. `ngOnDestroy`
  limpia el timeout.
- Copy nueva PANTALLA 1: "Bienvenido / Gestiona tu operación inmobiliaria desde un solo
  lugar / Selecciona tu inmobiliaria". Buscador + lista existentes conservados, usa el modelo
  `models/empresa.model.ts`.
- Spec: mock de `IntroStateService` + `HttpTestingController`; flujo INTRO→SELECTION con
  `fakeAsync` + `tick(700)`.

### T5 — `LoginComponent` PANTALLA 2 + decorativos + spec
- Archivos: `login.component.ts|html|scss` (editados), `login.component.spec.ts` (nuevo).
- Copy: "Inicia sesión", desc "Usa tu correo y número de cédula".
- Decorativos (decisión del usuario en Gate A): fila con checkbox "Recordarme" (signal local,
  sin persistencia) + enlace "¿Olvidaste tu contraseña?" (sin action, `cursor: default`).
- Botón primario "Iniciar sesión →", back "← Cambiar de inmobiliaria" → `volverAlLanding()`.
- Overlay navy más profundo (alineado a la referencia). Contrato auth sin cambios
  (correo + documento + `empresa_id`); `onLogin()`, `BG_MAP`, badge y manejo de errores
  conservados.
- Spec: 11 tests (render PANTALLA 2, restauración de empresa desde sessionStorage, toggle
  decorativo sin persistir, validación vacíos, `auth.login(correo, documento, id)`, éxito →
  `/dashboard`, 401 → mensaje, otros errores → conexión, back → `/acceder`).

## Verificación del slice

- `cd fronted/proyecto_angular && npx ng test --watch=false` → **TOTAL: 47 SUCCESS** (44
  previos + 13 nuevos: 3 intro-state, 4 auth-intro, 6 landing, 11 login).
- `npx ng build` → exitoso con warnings de budget no bloqueantes: `home.component.scss`
  (preexistente, 15.37 kB) y fonts inline de Google (Syne/Inter embebidas por css-inline),
  ambos sobre warning de 10 kB pero bajo el error de 20 kB.
- Ajustes durante la corrida: specs de `auth-intro` reestructurados para que `detectChanges`
  corra dentro de `fakeAsync` (los `setTimeout` de fases se agendan dentro de esa zona);
  aserción de la lista del landing pasa por `.emp-nombre`; SCSS migrado a `list.nth`.

## Logs

No se agregaron logs: el slice es UI pura (política de `DEVELOPMENT_GUIDELINES.md` aplica a
comportamiento backend). 

## Notas / pendientes

- El flag de intro no es persistente: se repite al recargar (`F5`) aunque no al volver
  `/login → /acceder`. Comportamiento acordado en design.
- `ng build` útil solo para validación; el slice no toca endpoints HTTP → `sdd-document` no
  debe producir OpenAPI/Bruno.