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

## Enmienda del slice `intro` — corrección de la intro

Origen: `verify-report.md` (D1–D4, D6) y las decisiones del usuario sobre la spec (R2.2, R2.2.1–R2.2.3,
R2.5, R2.6, R5, R6.1). Pertenece al slice `intro` y corre en `test-after`. I1 e I2 quedan reemplazadas
en lo que estas tareas modifican.

| # | Tarea | Archivos | Spec / design |
|---|---|---|---|
| I9 | `IntroStateService` usa `sessionStorage` (misma clave, mismo `try/catch` y fallback en memoria). Tests: clave en `sessionStorage` → `false`, `marcar` escribe en `sessionStorage` y no en `localStorage`, storage que lanza → fallback | `services/intro-state.service.ts`, `.spec.ts` | R5, design §8 |
| I10 | `PageTurnSoundService`: grafo en `buildPageTurnGraph(ctx, destination)` exportado, efecto de 1,4 s, salida ×3,16 + limitador suave a 0,3. Tests: render offline con pico ≤ 0,3, RMS ≥ −27 dBFS y sin señal después de 1,5 s; los tests de degradación siguen | `services/page-turn-sound.service.ts`, `.spec.ts` | R6.1, design §9 |
| I11 | `AuthIntroComponent`: `INTRO_DURATION_MS = 2900`, `TURN_START_MS = 600`, `SOUND_START_MS = 1200` | `auth-intro.component.ts` | R2.2, design §4 |
| I12 | SCSS: coreografía de 2900 ms con porcentajes derivados de ms, easing `cubic-bezier(.5,0,.75,1)` en el pase, curvatura máxima `--i × 1,6°`, franjas solapadas 1 px con tajadas alineadas, tinte plano por franja, trazo de la casa sin `non-scaling-stroke` (`stroke-width: .6`), cara de franja con la clase `sheet-face` (no `.page`, que tiene `max-width` en los estilos compartidos) | `auth-intro.component.scss` | R2.2.1–R2.2.3, R2.5, R2.6, design §2–§4 |
| I13 | Tests de `AuthIntroComponent`: fin a 2899/2900 ms, `play` a `SOUND_START_MS`, animación CSS real de la franja raíz (duración, comienzo del levante ≤ 1 s, cruce de −90° ≥ 1,2 s después del levante y ≤ 250 ms antes del fin) y trazo sin `non-scaling-stroke`. Ajuste de los tiempos en `landing.component.spec.ts` | `auth-intro.component.spec.ts`, `landing.component.spec.ts` | CA3, CA3.1, CA3.2 |
| I14 | Suite Karma completa y `ng build` | — | CA10 |
| I15 | D7: descubrimiento ≥ 1,2 s en desktop. Perspectiva proporcional al ancho (`max(2200px, 500vw)`), levante a −12°, easing del pase `cubic-bezier(.3,0,.8,1)`, raíz hasta −91° a los 2880 ms y `fade-page` 2780–2880. Tests: cobertura por caja de la hoja ≥ 1,2 s y perspectiva ≥ 5× el ancho | `auth-intro.component.scss`, `.spec.ts` | R2.2.1, R2.2.2, CA3.1 |
| I16 | D8: sombreado como una sola rampa continua repartida entre las franjas. Test: cada franja empieza su rampa donde termina la anterior | `auth-intro.component.scss`, `.spec.ts` | R2.6, CA3.2 |
| I17 | D10: `PageTurnSoundService` no crea el `AudioContext` sin activación previa del usuario (`navigator.userActivation.hasBeenActive`). Tests con la activación simulada por defecto y un caso sin activación | `services/page-turn-sound.service.ts`, `.spec.ts` | R6.2 |
| I18 | D9: presentación en la capa plana `.presentation` (casa 120–570 ms, logo 120–520 ms) con traspaso a las copias de las franjas a `TURN_START_MS`. Tests: trazo animado solo en la capa plana, con retardo ≥ 100 ms y fin ≤ `TURN_START_MS`; copias sin animación de trazo; traspaso en el mismo instante | `auth-intro.component.html`, `.scss`, `.spec.ts` | R2.5.1, CA3.3 |
| I19 | D9: `LandingComponent` con la señal `tapado` hasta `TURN_START_MS` o el fin de la intro (foto y overlay con `visibility: hidden`, selector con `content-visibility: hidden`) y zoom de la foto en pausa durante la intro. Tests: ocultos hasta el levante y visibles después; visibles en el acto si se salta antes | `landing.component.ts`, `.html`, `.scss`, `.spec.ts` | R2.5.1, CA3.3 |
| I20 | D9: `skipViewTransitionIntoIntro` en `onViewTransitionCreated`. Tests: salta el cross-fade solo al entrar a `/acceder` con la intro pendiente | `app/intro-view-transition.ts`, `.spec.ts`, `app.config.ts` | R2.5.1, CA3.3 |

Forecast de la enmienda: 8 archivos de código y unas 500 líneas cambiadas (≈ 330 netas), con los
tests incluidos. Supera el umbral de 300, y el usuario aprueba el paquete completo en la misma
entrega.

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
