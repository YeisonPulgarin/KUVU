# tasks — acceso-orden-e-intro

Referencias: `spec.md` (R1–R8, CA1–CA10), `design.md` (§1–§13). Modalidad: `test-after`: cada tarea
de código cierra con sus tests en verde dentro del mismo slice.

## Slices de este cambio

Este cambio no usa los slices de la tabla de `sdd.config.md` (`contenido`, `chrome`,
`home-expandida`, `paginas`), que pertenecen al cambio de contenido del sitio y no aplican acá. Lo
declara `propose.md`, y la tarea C1 corrige la tabla.

| Orden | Slice | Depende de | Sugerido |
|---|---|---|---|
| 1 | `backend-orden` | — | Sí |
| 2 | `intro` | — (independiente del backend; los tests usan datos fijos) | Sí |
| 3 | `cierre` | 1 y 2 | Sí |

`backend-orden` e `intro` son independientes entre sí: se pueden aplicar en cualquier orden o en PRs
separados.

## Slice 1 — `backend-orden`

| # | Tarea | Archivos | Spec |
|---|---|---|---|
| B1 | Cambiar `ORDER BY nombre` por `ORDER BY id` en `GET /api/empresas` | `backend/routes/empresas.js` | R1.1 |
| B2 | Test de la ruta con un `db` falso vía `require.cache`, `express()` en el puerto 0 y `fetch`: SQL con `ORDER BY id`, orden de la respuesta, 500 ante error del `db`, y `GET /:id` intacto (200/404) | `backend/test/empresas.route.test.js` (nuevo) | R1.1, R1.4, CA1 |
| B3 | Correr `npm test` en `backend/` (suite completa en verde) | — | CA10 |

## Slice 2 — `intro`

Orden obligatorio: I1 → I2 → I3 → I4 → I5 → I6 → I7 (I1 e I2 son independientes entre sí).

| # | Tarea | Archivos | Spec / design |
|---|---|---|---|
| I1 | `IntroStateService`: recordado en `localStorage` (`kuvu.intro.seen`) con `try/catch` y fallback en memoria; API pública sin cambios. Tests: storage con la clave → `false`, `marcar` escribe la clave, storage que lanza → fallback, reduced-motion → `false` | `services/intro-state.service.ts`, `services/intro-state.service.spec.ts` (nuevo) | R5, R7, design §8 |
| I2 | `PageTurnSoundService`: síntesis Web Audio (ruido + highpass + bandpass con barrido, envolvente, golpe final, pico ≤ 0,3), `play()`/`stop()` a prueba de fallos. Tests: sin `AudioContext`, constructor que lanza, `resume()` rechazado, `stop()` sin `play()` | `services/page-turn-sound.service.ts` (nuevo), `.spec.ts` (nuevo) | R6, design §9 |
| I3 | `AuthIntroComponent`, lógica: un timer de 2000 ms que emite `completed`, sonido a los 950 ms, `skip()` por clic en el host, `Escape`/`Enter`/`Space` y botón, con `preventDefault`/`stopPropagation`, fade de 180 ms, guard de emisión única, foco inicial en "Saltar" y limpieza en `ngOnDestroy` | `auth-intro.component.ts` | R2.2, R3, design §4–§5 |
| I4 | `AuthIntroComponent`, markup: overlay `aria-hidden` + botón "Saltar" accesible, hoja de 6 franjas anidadas con su tajada del frente (casa SVG en trazo fino + logo), dorso, sombreado y sombra proyectada. Reemplaza todo el markup de la casa 3D | `auth-intro.component.html` | R2.1, R2.3, R8, design §2–§3, §6 |
| I5 | `AuthIntroComponent`, estilos: keyframes de la coreografía (presentación, anticipación, paso, asentamiento) con sus easings, solo `transform`/`opacity`, perspectiva en px, `100dvh`, `clamp()` de logo y casa, `@media (max-height: 480px)`, safe-area en el botón, `:focus-visible`, 44×44. Reemplaza todo el SCSS de la casa 3D | `auth-intro.component.scss` | R2, R4, R8, design §2, §4, §10 |
| I6 | Tests de `AuthIntroComponent` reescritos: no emite a los 1999 ms y sí a los 2000; cada forma de salto emite en ≤ 300 ms; emisión única; `play` a los 950 ms y `stop` al saltar (stub); `type=button` + `aria-label`; capas `aria-hidden`; sin restos de la casa 3D | `auth-intro.component.spec.ts` | CA3, CA4, CA6, CA8 |
| I7 | `LandingComponent`: selector siempre renderizado, `[inert]` con la intro activa, `completadaIntro()` pasa a `SELECTION` sin el timeout de 650 ms (se elimina `transicionando`), foco al buscador por `viewChild`, ajuste del SCSS para superponer la intro. Tests: orden recibido con ids 1–4 en orden no alfabético, filtro que preserva el orden, `inert` antes y después, foco, sin retardo | `landing.component.{ts,html,scss,spec.ts}` | R1.2, R1.3, R2.4, R3.6, CA2, CA7 |
| I8 | Correr la suite Karma completa y `ng build` (sin errores nuevos) | — | CA10 |

## Slice `cierre`

| # | Tarea | Archivos |
|---|---|---|
| C1 | `sdd.config.md`: stack con MariaDB 10.4 + Express, tabla de slices con los de este cambio, comando de test del backend (`npm test` en `backend/`) | `sdd/sdd.config.md` |
| C2 | `sdd-init.md`: `expone_api_http: true` | `sdd/sdd-init.md` |
| C3 | Lo ejecuta la fase `document` (ver el alcance previsto abajo) | — |

## Forecast de riesgo

| Métrica | Estimación |
|---|---|
| Archivos tocados | 15 (5 nuevos): backend 2 · intro-state 2 · sound 2 · auth-intro 4 · landing 4 · sdd 2 (más los docs de `document`) |
| Líneas cambiadas (tests incluidos) | ~750–900 |
| Por slice | `backend-orden` ~70 · `intro` ~700–820 (SCSS ~250, HTML ~70, TS intro ~90, sound ~70, intro-state ~30, landing ~40, tests ~250–300; más borrado de ~380 líneas de la casa 3D) · `cierre` ~15 |
| Repos | 1 (monorepo: `backend/` + `frontend/`) |
| Umbral (`sdd.config.md`) | 300 líneas |
| **Riesgo** | **Alto**: el slice `intro` solo ya supera el umbral |

Estrategia de entrega declarada en `sdd.config.md`: **`ask-on-risk`**. Opciones naturales:
- **Un PR**: los tres slices juntos (~850 líneas). Revisión única, más pesada.
- **Dos PRs**: PR 1 con `backend-orden` (~70 líneas, chico y aislado); PR 2 con `intro` + `cierre`.
  Recomendado: el cambio de backend se revisa y se mergea solo, sin esperar a la intro.

Las ramas no las crea esta fase (la extensión `branch` está inactiva).

## Alcance previsto de `document`

| Flag | Valor | Motivo |
|---|---|---|
| `openapi_afectado` | `false` | `sdd.config.md` declara "Spec OpenAPI: No aplica". El orden de `GET /api/empresas` cambia, pero no existe una spec OpenAPI ni colección Bruno que actualizar; se documenta en el doc del cambio |
| `changelog_afectado` | `true` | Cambio visible: orden del selector e intro nueva |
| `readme_afectado` | `false` | No hay `README.md` en la raíz y el cambio no altera instalación ni uso |
| `architecture_afectado` | `true` (menor) | `docs/architecture.md` lista los servicios de `frontend/.../services/`: suma `page-turn-sound.service.ts` y precisa el recordado de la intro |
| `guidelines_afectado` | `false` | No introduce convenciones nuevas |

Docs adicionales: `docs/acceso-orden-e-intro.md` (doc del cambio) y actualización de
`docs/login-intro-transition.md`, que describe la casa 3D y tiene que quedar en presente con la intro
nueva.

## Decisión de entrega (Gate C)

- **Slices confirmados:** `backend-orden`, `intro`, `cierre`.
- **Entrega:** una sola entrega con los tres slices juntos. El usuario la aprueba explícitamente,
  aun con el riesgo alto pronosticado (~750–900 líneas contra un umbral de 300) y la recomendación
  de dos PRs.
