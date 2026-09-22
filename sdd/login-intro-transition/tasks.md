# Tasks — login-intro-transition

## Tareas atómicas (orden de dependencia)

### T1 — `IntroStateService`
- Crear `src/app/services/intro-state.service.ts` (`providedIn: 'root'`): flag `introVistoEnEstaCarga` + `debeReproducirse()` (respeta `prefers-reduced-motion` vía `matchMedia`) + `marcarComoReproducida()`.
- **Test (test-after)**: `intro-state.service.spec.ts` con stub de `matchMedia` — reproduce en primera carga sin reduced-motion; no reproduce tras `marcarComoReproducida()`; no reproduce con reduced-motion.

### T2 — `AuthIntroComponent`: máquina de fases + estructura
- Crear `src/app/components/shared/auth-intro/auth-intro.component.{ts,html,scss}`: signal `fase` (1..5) avanzada por timers (1000/2000/3000/4000/5000ms), `output() completa`, cleanup de timers en `ngOnDestroy`. Template con stage 3D y piezas (marcado básico), clases por fase en el host.
- **Test (test-after)**: `auth-intro.component.spec.ts` con `fakeAsync` — `fase()` avanza 1→5 en ticks de 1000ms, `completa` se emite a los 5s, destroy limpia timers.

### T3 — `AuthIntroComponent`: visuales (blueprint, piezas 3D, ensamblaje, iluminación, glow)
- SCSS: fondo navy + grid cian/teal + líneas SVG + partículas (fase 1); 12 piezas CSS (losa, 4 muros, 2 planos techo, 2 ventanas, puerta, volado) con `--desde`/`--hasta` y flotado (fase 2); ensamblaje por `transition` (fase 3); glow ventanas en capas pseudo-elemento (fase 4); glow cálido global + sway de cámara (fase 5); responsive 640/767; respeto de la estética de la referencia. Sin `filter` en elementos 3D (rompe `preserve-3d`).

### T4 — `LandingComponent`: orquestación + copy PANTALLA 1
- Modificar `landing.component.{ts,html,scss}`: estado `INTRO|SELECTION`; monta la intro si `introState.debeReproducirse()`, al `completa` marca flag y pasa a SELECTION; entrada `fadeUp` de la tarjeta; copy nuevo (Bienvenido / Gestión… / Selecciona tu inmobiliaria); reemplazar interfaz `Empresa` local por `models/empresa.model.ts`; `seleccionar()` intacto (sessionStorage + navigate `/login`).
- **Test (test-after)**: `landing.component.spec.ts` — (a) debe reproducir → estado INTRO + intro montada; (b) `completa` → SELECTION + flag marcado; (c) no debe → SELECTION directo; (d) `seleccionar()` setea sessionStorage y navega. Mock Http (`provideHttpClientTesting`) y `IntroStateService`.

### T5 — `LoginComponent`: PANTALLA 2
- Modificar `login.component.{ts,html,scss}`: header "Inicia sesión"; fila decorativa (checkbox "Recordarme" toggle local sin persistencia + `<span>` "¿Olvidaste tu contraseña?" sin handler); botón `Iniciar sesión →`; back `← Cambiar de inmobiliaria` → `volverAlLanding()`; overlay navy alineado a la referencia. Mantiene campos correo/documento, badge, `BG_MAP`, `onLogin()`, manejo de errores.
- **Test (test-after)**: `login.component.spec.ts` — render de campos/decorativos/botones; `onLogin()` llama `auth.login(correo, documento, empresa.id)` (mock `AuthService`); 401 → mensaje; éxito → navega `/dashboard`.

> Modalidad: **test-after** (declarada en `sdd.config.md`). Cada tarea no se considera completa sin su spec en verde.

## Slices involucrados

- Cambio pertenece al slice `frontend` (único declarado, obligatorio). No se desvía el orden default.

## Forecast de riesgo

- Líneas estimadas: **~1170** (incluye tests) — T1 ~60, T2 ~150, T3 ~500, T4 ~240, T5 ~220.
- Archivos tocados: **8** (3 nuevos + 3 modificados + 3 spec nuevos — cuenta 1 solapado).
- Repos: **1** (solo `fronted/proyecto_angular`).
- Umbral declarado: **300 líneas** → **riesgo ALTO**.

## Alcance previsto de `document`

- `openapi_afectado`: **false** — no hay API pública.
- `changelog_afectado`: **true** — el flujo de acceso es visible desde afuera.
- `readme_afectado`: **false** — no cambian instrucciones de uso/build.
- `architecture_afectado`: **true** — se agregan componentes/servicio al flujo auth; `docs/architecture.md` se completa/actualiza.
- `guidelines_afectado`: **false** — no se introduce una convención de código nueva.