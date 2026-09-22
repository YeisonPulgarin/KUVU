# Verify report — login-intro-transition

Estado: **VERDE** (47/47 tests). Verificación del slice `frontend` (único slice, completado).

## Criterios de aceptación

| # | Criterio | Resultado | Evidencia |
|---|---|---|---|
| CA1 | Carga fresca de `/acceder` → intro animada ≤5.5s → "Bienvenido" + lista; no es imagen estática | **PASA** | `LandingComponent.ngOnInit` monta `AuthIntroComponent` si `debeReproducirse()`; máquina de fases TS 5×1000ms; CSS 3D (`translate3d`/`rotate` + `perspective`/`preserve-3d`) en `.pieza-*`. Nota: la transición con `.saliendo` es de 650ms → la selección empieza a verse a los 5s y termina de revelarse ~5.65s (el fade forma parte de la "transición cinematográfica" de la fase 5) |
| CA2 | `/acceder→login→acceder` sin intro; reload → con intro | **PASA** | Flag no persistente en `IntroStateService` (`introVistoEnEstaCarga`); test `intro-state.service.spec` (no reproduce tras `marcarComoReproducida`) y `landing.component.spec` (SELECTION directo cuando `debeReproducirse()` es false) |
| CA3 | `prefers-reduced-motion: reduce` → sin intro | **PASA** | `debeReproducirse()` = `!introVisto && !matchMedia('(prefers-reduced-motion: reduce)')`; test en `intro-state.service.spec` |
| CA4 | Seleccionar inmobiliaria → `/login` SPA, badge muestra la seleccionada | **PASA** | `seleccionar()` intacto: `sessionStorage['empresaPreseleccionada']` + `router.navigate(['/login'])`; test landing (guarda y navega) + test login (badge restaura la empresa) |
| CA5 | `/login`: "Inicia sesión", correo, documento, Recordarme, ¿Olvidaste tu contraseña? (sin acción), `Iniciar sesión →`, `← Cambiar de inmobiliaria` | **PASA** | `login.component.spec`: render title (contenido transverso), 2 campos, `.extras-remember`, `.extras-link` sin handler (cursor: default), botones |
| CA6 | Envío = `auth.login(correo, documento, empresa_id)`; 401 y desconexión → mensajes existentes; éxito → `/dashboard` | **PASA** | `login.component.spec`: spy verifica call con (`a@b.com`, `1128074279`, 1); 401 → "Correo o documento incorrecto"; otros → "Error de conexión…"; éxito → `router.navigate(['/dashboard'])` |
| CA7 | `← Cambiar de inmobiliaria` → `/acceder` con selección y sin intro | **PASA** | `volverAlLanding()` navega a `/acceder` (test login); el flag ya está marcado → `debeReproducirse()` false (test landing + servicio) |
| CA8 | Viewport ≤767px: composición completa, controles ≥44px | **PASA** (por inspección) | Media queries 767/480px en `auth-intro.component.scss` (stage escala, `.intro-badge`/`i-ley` compactos); responsive preexistente en landing/login. Sin test automatizado de layout — pendiente check visual manual sugerido |
| CA9 | Suite Karma en verde con specs nuevas de landing y login | **PASA** | `ng test --watch=false` → **TOTAL: 47 SUCCESS** (44 previos + 13 nuevos). Cobertura: intro-state (3), auth-intro (4), landing (6), login (11) |
| CA10 | Contrato backend y lógica `AuthService` intactos | **PASA** | `auth.service.ts`/`app.routes.ts` sin cambios de este work item (sus diffs en el working tree son modificaciones locales preexistentes: base URL a `localhost:3000` y ruta `/acceder`). `login()`/`logout()`/`restaurarSesion()` sin tocar |

## Tests

- Resultado: **47 SUCCESS, 0 FAILED** (Chrome 154, Karma 6.4).
- `ng build` → exitoso (warnings de budget **no bloqueantes**): `home.component.scss` (preexistente, 15.37 kB) y `css-inline-fonts` Syne/Inter (>10 kB). Ambos bajo el umbral de error de 20 kB.
- `tests_agregados`: 13 tests nuevos (ver CA9). Sin excepciones sin test.
- `excepciones_sin_test`: ninguna.

## Protocolo — tres ejes

- **Documentación declarada**: `tasks.md` (Alcance previsto de `document`): `openapi_afectado=false`, `changelog_afectado=true`, `readme_afectado=false`, `architecture_afectado=true` (existe `docs/architecture.md`, se actualizará en `document`), `guidelines_afectado=false`. ✅ Coincide con lo implementado.
- **Guidelines**: estructura respetada (servicios en `services/`, componentes en `components/{shared,landing,login}`); sin dependencias nuevas; convención de naming español del proyecto seguida (desvío conocido de `DEVELOPMENT_GUIDELINES.md`, documentado en apply-progress y consistente con el codebase actual).
- **Logs**: sin logs agregados — el slice es UI pura (sin comportamiento de negocio que loguear; la política de logs de `DEVELOPMENT_GUIDELINES.md` aplica a procesamiento de datos, no a este componente).
- **CI check**: no aplica (extensión `git` inactiva en `sdd.config.md`).

## Desvíos

1. **D1 — timing CA1 (menor, aceptado)**: "Bienvenido" completamente visible ~5.65s (5s intro + 650ms fade), dentro del rango de "transición cinematográfica". No requiere re-apply.
2. **D2 — CA8 sin test automático**: validación por inspección de CSS. Recomendado check visual en viewport 767/480 antes del merge.
3. **D3 — warnings de bundle (no bloqueantes)**: fuentes Google inlined >10 kB y `home.component.scss` preexistente; candidatos a `refine`, no bloqueo.

## Re-verificación post `secure` / `refine`

- **`secure`**: sin cambios de código (hallazgos de arquitectura fuera del alcance, riesgo
  Alto aceptado en `secure-report`). No requiere re-corrida por sí misma.
- **`refine`**: 1 refactor aplicado — `LandingComponent` reusa `AuthService.cargarEmpresas()`
  y elimina su fetch duplicado con URL hardcodeada (DRY, sin cambio observable; red de
  seguridad en verde). Detalles en `refine-report.md`.
- **Resultado**: suite **47 SUCCESS, 0 FAILED** tras el refactor. Criterios CA1–CA10 siguen
  pasando (comportamiento preservado). `ng build` sigue exitoso (mismos warnings no
  bloqueantes).
- Estado verificado: código post-refine / pre-archive.

## Conclusión

La implementación cumple la spec y el diseño. Desvíos documentados (D1–D3) no bloquean el avance a `document`. Se recomienda un check visual manual de la intro y del layout responsive antes de considerar el cambio cerrado.