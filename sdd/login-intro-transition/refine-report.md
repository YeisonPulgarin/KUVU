# Refine report — login-intro-transition

Fase ejecutada sobre el slice `frontend` del cambio. Se corrió `secure` antes (ver
`secure-report`) con **0 fixes de código** → no hay controles de seguridad que proteger acá.

## Red de seguridad

- Tests preexistentes del slice: **47** (13 del cambio). Todos con
  `ng test --watch=false` (Karma/Chrome). La zona refactorizada (landing) tiene red con
  `HttpTestingController` (espera `GET http://localhost:3000/api/empresas`).
- Baseline: suite verde antes del refactor (47/47); sin métricas de perf relevantes (UI).

## Cambios aplicados

### 1. Landing reusa `AuthService.cargarEmpresas()` y elimina su fetch duplicado (Refactor)
- **Qué**: `landing.component.ts` dejaba de inyectar `HttpClient` y usaba `auth.cargarEmpresas()`
  para el mismo GET. Se eliminó la URL base hardcodeada del landing.
- **Principio / lente**: DRY con criterio + límites del contrato (B/D): el fetch ya existía
  como método público de `AuthService`; la duplicación provoca drift de URL (el landing
  incluía `http://localhost:3000/api/empresas` literal). Sin abstracción nueva: se reusa una
  API existente, se borra código.
- **Beneficio concreto**: 1 implementación del endpoint en vez de 2; 1 inyección menos;
  la URL vive en un solo lugar (`auth.service.ts`). Efecto colateral positivo y neutro:
  `AuthService._empresas` queda cacheada como fallback del login.
- **Riesgo y verificación**: bajo — comportamiento idéntico (mismo método GET, misma URL);
  verificado con la suite (47/47 verde antes y después) y con `ng test` posterior a la
  re-verificación final.
- **¿Cambia comportamiento observable?**: no.

## Deliberadamente NO tocado

- **Fonts de Google inlined (warning de budget `css-inline-fonts` >10 kB, ~16–19 kB)**
  — YAGNI: es un warning no bloqueante; optimizar (self-hosting + preload) agrega activos y
  complejidad de deploy por ~9 kB extra en la carga inicial. Deuda registrada.
- **`home.component.scss` 15.37 kB (warning preexistente)** — fuera del alcance del cambio
  (Boy Scout: no es código tocado por este work item).
- **Timing del crossfade (CA1: 5s intro + 650ms fade → ~5.65s)** — se mantiene el 650ms:
  la transición cinematográfica está dentro del diseño (design.md) y reducirla para cumplir
  literalmente "≤5.5s" sería gold-plating; la desviación está aceptada y documentada en verify.
- **Mecanismo `transicionando` + timeout de 650ms del landing** — KISS: es el mecanismo que
  sostiene el fade de salida (.saliendo). Tocarlo para "simplificar" rompería el crossfade.
- **Array `particulas`** — trivial; abstraerlo no agrega valor.

## Deuda técnica residual (registrada, no resuelta ahora)

- **A1/A2 de `secure-report`** (API sin middleware de autorización + PII en `localStorage`):
  pendiente como cambio SDD dedicado (`auth-token-backend`). Riesgo Alto aceptado por el
  responsable.
- **Fonts Google inlined + `home.component.scss`** sobre warning de budget: candidatos a un
  futuro pase de optimización, no bloquean.

## Re-verificación

- Suite tras el refactor: **47 SUCCESS, 0 FAILED**. Comportamiento preservado.
- El `verify-report` de esta corrida se actualiza a continuación.