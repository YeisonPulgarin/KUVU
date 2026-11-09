# apply-progress — intro

Estado: **completo**. No hay progreso previo de este slice.

| Tarea | Estado | Detalle |
|---|---|---|
| I1 | Completa | `IntroStateService`: clave `kuvu.intro.seen` = `"1"` en `localStorage`, lectura y escritura en `try/catch`, flag en memoria como fallback. API pública intacta (`debeReproducirse`, `marcarComoReproducida`). Exporta `INTRO_SEEN_KEY`. 10 tests |
| I2 | Completa | `PageTurnSoundService` nuevo: ruido blanco de 0,9 s → highpass 400 Hz → bandpass con barrido de 900 a 2600 Hz → envolvente (pico 0,18), más un golpe final low-pass de 40 ms (pico 0,25). `play()` es idempotente (un contexto por instancia activa) y `stop()` hace una rampa a 0 en 60 ms y después `close()`. El contexto se cierra solo en el `onended` del golpe. `resume()` y `close()` pasan por `ignoreRejection`. 11 tests |
| I3 | Completa | `AuthIntroComponent`: `setTimeout(950)` → `sound.play()`, `setTimeout(2000)` → `completed`. `skip()` por click en el host, `Escape`/`Enter`/`Space` en `document` y botón, con `preventDefault` + `stopPropagation`. Fade `is-skipping` de 180 ms, guard `done` de emisión única, foco inicial en "Saltar" y `ngOnDestroy` que limpia timers y detiene el sonido |
| I4 | Completa | Markup: `.stage` con `aria-hidden="true"` (sombra proyectada + hoja), botón `<button type="button" aria-label="Saltar introducción">Saltar</button>` fuera de la capa oculta, y 6 franjas anidadas por un `ng-template` recursivo. Cada franja tiene frente (casa SVG en trazo fino + `/logo-rediseno/Logo_Kuvu.png` con `alt=""`, desplazado `-i·100%`), sombreado y dorso. Sin markup de la casa 3D |
| I5 | Completa | SCSS: keyframes `turn-page`, `curl-page`, `shade-page`, `sweep-shadow`, `draw-house`, `reveal-logo` con los easings del design (35 % / 47,5 % / 67,5 % / 87,5 % de 2000 ms). Se animan `transform`/`opacity` (más `stroke-dashoffset` del SVG). `perspective: 2200px` con origen en el lomo, `100dvh` con fallback `100vh`, `clamp()` de logo y casa, `@media (max-height: 480px)`, safe-area en el botón, `:focus-visible` y un mínimo de 44×44. Sin SCSS de la casa 3D |
| I6 | Completa | `auth-intro.component.spec.ts` reescrito: 22 tests (1999/2000 ms, cada forma de salto en ≤ 300 ms con `defaultPrevented` y sin propagación, emisión única con salto + timer y con salto triple, `play` a los 950 ms y una sola vez, `stop` al saltar, nada de sonido si se salta antes de 950 ms, limpieza al destruir, botón nativo/nombre/44×44/foco inicial, capas `aria-hidden` y `alt=""`, 6 franjas anidadas con `--i`, sin restos de la casa 3D) |
| I7 | Completa | `LandingComponent`: `.landing-container` se renderiza siempre, con `[inert]` mientras `estado() === 'INTRO'`. `completadaIntro()` marca la intro, pasa a `SELECTION` en el acto y enfoca `#searchInput` (`viewChild`) con `afterNextRender`. `transicionando`, el timeout de 650 ms y `ngOnDestroy` quedan eliminados. El output del padre se enlaza como `(completed)`. SCSS: `.is-intro-active` (sin scroll bajo la intro) y `.from-intro` (sin fade de entrada, asentamiento de 8 px al liberar `inert`). Tests: orden por id con 4 empresas no alfabéticas, filtro `i` y `n` que preserva el orden, `inert` antes/después, foco en el buscador, fin a los 2000 ms, clic de salto que no selecciona empresa |
| I8 | Completa | Karma completo: 218/218 en verde. `ng build`: éxito, sin warnings nuevos |

## Evidencia

- Red de seguridad previa: Karma 178/178 en verde. `ng build` de base con un único warning
  preexistente (`css-inline-fonts`: la hoja de Google Fonts de `landing.component.scss` supera el
  presupuesto de 17 kB por 2,13 kB).
- Suite final: `TOTAL: 218 SUCCESS` (+40 tests: intro-state +7, sound +11, auth-intro +17 netos,
  landing +5 netos).
- `ng build` final: "Application bundle generation complete", con el mismo warning preexistente y
  ninguno nuevo. Initial total de 496,88 kB raw / 120,16 kB transfer, contra 493,37 / 118,92 de base
  (+3,5 kB raw, +1,2 kB transfer), dentro del presupuesto de 30 kB de R6.4.
- Mutación de control en `PageTurnSoundService`: con `void ctx.resume()` en lugar de
  `ignoreRejection(ctx.resume())`, el test "con resume() rechazado..." falla. El código queda
  restaurado.

## Desvíos del plan

- **`intro-state.service.spec.ts` ya existe** (tasks lo marca como nuevo). Se extiende con los casos
  de storage, y los 3 casos existentes se conservan.
- **Detección de promesas rechazadas:** zone.js intercepta los rechazos de `ZoneAwarePromise`, así
  que el evento nativo `unhandledrejection` no se dispara en Karma y una mutación pasa
  desapercibida. Los tests usan un thenable rechazado (`TrackedRejection`) que registra si se le
  adjuntó un handler de rechazo, y se queda el listener de `unhandledrejection` como segunda red.
- **Asentamiento del selector:** en lugar de un keyframe entre 1750 y 2000 ms, el selector lleva
  `translateY(8px)` mientras está `inert` y una `transition: transform .25s ease-out` que corre al
  liberarse. Así el mismo asentamiento sirve para el fin natural y para el salto, sin que el selector
  salte de posición mientras el usuario ya interactúa. El selector es interactivo a los 2000 ms
  (R2.2) y el desplazamiento de 8 px termina a los 2250 ms.
- **Foco al buscador con `afterNextRender`:** `inert` se quita en el render siguiente a
  `estado.set('SELECTION')`, así que un `focus()` síncrono no surte efecto. El test lo verifica con
  `TestBed.tick()` (tick de aplicación, el mismo camino que en la app real).
- **Hoja que desaparece:** además del giro a -180° (que deja la hoja fuera de vista hacia la
  izquierda), la franja raíz baja su `opacity` a 0 entre 87,5 % y 95 % como resguardo.
- **`(document:keydown)`:** solo hace `preventDefault` mientras la intro no terminó. Después no
  intercepta teclas (también lo cubre un test).
- **`autofocus` del buscador se mantiene** para las visitas sin intro, que ya enfocan así. Con la
  intro, el foco lo pone `completadaIntro()`.
- **Color navy:** el proyecto no define un token de marca navy. Se usa `#0f2a4a` (texto del botón
  contra `rgba(255,255,255,.92)` sobre papel: contraste de ~14:1).

## Pendiente para `verify` (manual)

- CA9: revisión visual en 360×640, 390×844, 768×1024, 1024×768, 1366×768 y 1920×1080 (sin scroll,
  sin recortes, botón visible), en vertical y horizontal.
- Safari/iOS si hay dispositivo (riesgo de z-fighting con `preserve-3d`).
- Sonido audible con activación previa (navegando desde la home) y mudo sin ella (carga directa).
  El carácter del "frrr" es una apreciación subjetiva del usuario.

```
test_mode: test-after
test_command: CHROME_BIN="C:/Program Files/Google/Chrome/Application/chrome.exe" npx ng test --watch=false --browsers=ChromeHeadless (en frontend/proyecto_angular); npx ng build
tests_status: verde
tests_agregados: frontend/proyecto_angular/src/app/services/intro-state.service.spec.ts, frontend/proyecto_angular/src/app/services/page-turn-sound.service.spec.ts (nuevo), frontend/proyecto_angular/src/app/components/shared/auth-intro/auth-intro.component.spec.ts, frontend/proyecto_angular/src/app/components/landing/landing.component.spec.ts
excepciones_sin_test: I5 (SCSS: coreografía, curvatura, responsive, safe-area) no tiene aserciones de layout más allá del área de 44×44 del botón; la cubre la revisión visual manual de CA9 en verify. La audibilidad real del sonido (R6.1) se verifica a mano; los tests cubren el pico de ganancia ≤ 0,3 y la degradación silenciosa
logs_conforme: sí (no se agregan logs en el frontend; el audio bloqueado se degrada en silencio, según design §11)
commit: — (sin commit, no pedido)
```

## Enmienda — corrección de la intro (I9–I14)

Estado: **completo**. Este bloque se suma al progreso de arriba sin reemplazarlo. Lo origina
`verify-report.md` (D1–D4, D6), con las decisiones del usuario ya volcadas en `spec.md`, `design.md`
y `tasks.md`.

| Tarea | Estado | Detalle |
|---|---|---|
| I9 | Completa | `IntroStateService` usa `sessionStorage` con la misma clave, el mismo `try/catch` y el fallback en memoria. +2 tests (vive en `sessionStorage` y no en `localStorage`; una clave en `localStorage` no evita la intro) |
| I10 | Completa | `buildPageTurnGraph(ctx, destination)` exportado. Efecto de 1,4 s con salida ×3,16 (+10 dB) y limitador suave `0,3·tanh(x/0,3)` (`WaveShaperNode`). Tests offline con `OfflineAudioContext`: pico ≤ 0,3 (3 renders), RMS ≥ −27 dBFS, sin señal después de 1,5 s |
| I11 | Completa | `INTRO_DURATION_MS = 2900`, `TURN_START_MS = 600` (empieza a levantarse), `SOUND_START_MS = 1200` |
| I12 | Completa | Coreografía de 2900 ms con porcentajes derivados en SCSS (`sass:math`). Easing del pase `cubic-bezier(.5,0,.75,1)`, raíz de −6° a −92°, `fade-page` separado del giro. Curvatura máxima `--i × 1,6°`, solape de 1 px con tajadas alineadas, tinte plano por franja y casa con `stroke-width: .6` sin `non-scaling-stroke`. La cara de franja usa la clase `sheet-face` |
| I13 | Completa | `auth-intro.component.spec.ts`: fin a 2899/2900, `play` a `SOUND_START_MS`, 4 tests sobre la animación CSS real (pausada y recorrida con `currentTime`: duración, levante ≤ 1 s, pase visible ≥ 1,2 s, cierre ≤ 250 ms tras salir de vista, giro más lento al comienzo), trazo sin `non-scaling-stroke`, geometría de franjas sin costuras y sin clase `.page`. Ajuste de tiempos en `landing.component.spec.ts` |
| I14 | Completa | Karma 229/229 en verde. `ng build` OK, con el mismo warning `css-inline-fonts` que ya existía |

## Evidencia de la enmienda

- Medición en la franja raíz: se levanta a los 600 ms, sale de vista (−90°) unos 2,7 s después del
  inicio y la intro cierra a los 2900 ms. Los valores exactos los mide `verify`.
- **Causa adicional encontrada:** la cara de cada franja usaba la clase `.page`, y
  `shared/shared.styles.scss` le da a `.page` `max-width: 1280px`, padding y `margin: 0 auto`. En un
  viewport de 1366 px la hoja medía 1280 px: quedaba una banda oscura de ~88 px a la derecha, la casa
  descentrada y las tajadas desalineadas en las costuras. Karma no carga los estilos globales, por
  eso los tests no lo detectaban. Con la clase `sheet-face`, la cara mide lo mismo que el viewport y
  la franja derecha queda cubierta (0 px oscuros en la captura).
- Con el ancho de la raíz en `(100% + 5px) / 6` quedaban 3 px sin cubrir por redondeo de subpíxel.
  Con `(100% + 6px) / 6` quedan 0.

## Desvíos

- `TURN_START_MS` vale 600 (el instante en que la hoja empieza a levantarse) en lugar del 900 que
  figuraba en un borrador de la enmienda. `design.md` y `tasks.md` quedan alineados.
- El ángulo final es −92° y no −95°: con −95° la hoja salía de vista 260 ms antes del fin (el test de
  R2.2.2 lo detectó).
- No se pre-crea el `AudioContext` en la home (S3d): entrando por "Ingresar" el contexto ya arranca
  `running` por la activación persistente, así que no cambia lo que se oye (design §9).
- La enmienda suma unas 500 líneas (≈ 330 netas), por encima de las ~200 previstas. `tasks.md`
  queda corregido.

```
test_mode: test-after
test_command: CHROME_BIN="C:/Program Files/Google/Chrome/Application/chrome.exe" npx ng test --watch=false --browsers=ChromeHeadless (en frontend/proyecto_angular); npx ng build
tests_status: verde (229/229)
tests_agregados: services/intro-state.service.spec.ts, services/page-turn-sound.service.spec.ts, components/shared/auth-intro/auth-intro.component.spec.ts, components/landing/landing.component.spec.ts
excepciones_sin_test: la apariencia visual (página vs persiana) y la audibilidad subjetiva se miden en verify con Chrome headless; los tests cubren la geometría, los tiempos de la animación real y el nivel de salida renderizado
logs_conforme: sí (sin logs nuevos)
```

## Corrección de D7, D8 y D10 (I15–I17)

Retoma el slice sobre el working tree de la enmienda (I9–I14). El progreso anterior queda intacto.

| Tarea | Estado | Detalle |
|---|---|---|
| I15 | Completa | `perspective: max(2200px, 500vw)`, levante de la raíz a −12° (600–900 ms), pase con `cubic-bezier(.3,0,.8,1)` hasta −91° a los 2880 ms, `fade-page` 2780–2880. Parámetros elegidos con un modelo geométrico de la cadena de franjas (proyección de cada esquina con la perspectiva) que reproduce las mediciones del verify anterior (0,5 s a 1366 y 0,2 s a 1920 con 2200 px fijos) y confirmados en Chrome sobre el build. Tests: el test de cobertura por caja (`getBoundingClientRect` de frentes y dorsos) queda en verde y se suma "perspectiva ≥ 5× el ancho del host" |
| I16 | Completa | `.strip-shade` con un gradiente de `--i × 0,05` a `(--i + 1) × 0,05`: una rampa continua repartida entre las 6 franjas. Test nuevo: cada franja oscurece hacia el borde libre y empieza donde termina la anterior |
| I17 | Completa | `play()` sale sin crear contexto si `navigator.userActivation.hasBeenActive` es `false`. El spec simula la activación en `beforeEach` (`hasBeenActive = true` por defecto) porque Chrome headless reporta `false` y 8 tests de la suite fallaban por eso; el caso sin activación pone `false` |

### Evidencia

```
test_mode: test-after
test_command: CHROME_BIN="C:/Program Files/Google/Chrome/Application/chrome.exe" npx ng test --watch=false --browsers=ChromeHeadless (en frontend/proyecto_angular); npx ng build
tests_status: verde (234/234)
tests_agregados: auth-intro.component.spec.ts (perspectiva proporcional, sombreado continuo), page-turn-sound.service.spec.ts (activación simulada por defecto)
excepciones_sin_test: la cobertura en viewports de desktop se mide en verify con Chrome sobre el build (Karma corre en un viewport chico y la perspectiva depende de vw)
logs_conforme: sí (sin logs nuevos)
```

- Antes de los cambios de esta tanda, la suite estaba en 223/232: el test de cobertura (1070 ms
  contra 1200) y 8 tests de `PageTurnSoundService` sin activación simulada.
- `ng build`: OK, initial 497,58 kB / 120,34 kB transfer, con el mismo warning `css-inline-fonts`.

## Corrección de D9 (I18–I20)

Retoma el slice después de I15–I17. El progreso anterior queda intacto.

**Causa.** Con screencast y trace de Chrome sobre el build, entrando por "Ingresar" desde la home, el
primer cuadro de la intro llegaba a los ~390–460 ms del montaje, con la casa ya dibujada. Había tres
costos encadenados:
1. El cross-fade de `withViewTransitions` mantenía la home a la vista los primeros ~340 ms
   (`ViewTransition::ProcessCurrentState` en el trace).
2. Sin el cross-fade, la hoja aparecía a los ~10–100 ms, pero después había ~370 ms sin cuadros: el
   GPU rasterizaba y componía el selector de abajo (foto de fondo con zoom en loop, overlay y tarjeta
   con `backdrop-filter`). Con el selector oculto el hueco bajaba a ~90 ms. Pre-decodificar el logo no
   cambiaba nada.
3. El trazo de la casa se repintaba en las 6 capas 3D de las franjas.

| Tarea | Estado | Detalle |
|---|---|---|
| I18 | Completa | `ng-template #faceContent` (casa y logo) usado en las 6 caras y en `.presentation`, una capa plana sobre la hoja (`inset: 0 -1px 0 0`). Solo la capa plana anima el trazo (450 ms desde 120 ms; `draw-house` lleva el `stroke-dasharray` en sus keyframes) y el logo (400 ms desde 120 ms). A `TURN_START_MS`, `hand-over-out` / `hand-over-in` (`step-end`) cambian la capa plana por las copias de las franjas en el mismo cuadro. 2 tests nuevos |
| I19 | Completa | `LandingComponent`: señal `tapado` (true hasta `TURN_START_MS` o `completadaIntro()`, timer limpio con `DestroyRef`) y clase `tapado`: foto y overlay con `visibility: hidden`, selector con `content-visibility: hidden`. Con `visibility` heredada sobre el selector, Chrome dejaba el buscador computado como `hidden` después de volver a visible y el test de foco fallaba. Zoom de la foto en pausa mientras la intro está activa. 2 tests nuevos |
| I20 | Completa | `app/intro-view-transition.ts`: `skipViewTransitionIntoIntro`, conectado en `withViewTransitions({ onViewTransitionCreated })`. 3 tests nuevos |

### Evidencia

```
test_mode: test-after
test_command: CHROME_BIN="C:/Program Files/Google/Chrome/Application/chrome.exe" npx ng test --watch=false --browsers=ChromeHeadless (en frontend/proyecto_angular); npx ng build
tests_status: verde (241/241)
tests_agregados: auth-intro.component.spec.ts (presentación en capa plana, traspaso), landing.component.spec.ts (tapado hasta el levante, tapado al saltar), intro-view-transition.spec.ts (3)
excepciones_sin_test: la llegada del primer cuadro y el dibujo visible se miden en verify con screencast de Chrome sobre el build
logs_conforme: sí (sin logs nuevos)
```

- `ng build`: OK. Initial 499,98 kB / 120,82 kB transfer, 20 bytes por debajo del warning de
  presupuesto de 500 kB. Para entrar se recortó CSS de la intro (sin reglas redundantes con el
  `fill` de las animaciones) y se usaron nombres cortos (`tapado`). Sigue el warning
  `css-inline-fonts` de siempre.

### Desvíos

- El raster del selector pasa al levante: en headless hay ~250–300 ms sin cuadros entre los 600 y los
  ~870 ms, con la hoja casi plana (levante de 0 a −12°). La diferencia visual entre el cuadro de
  antes y el de después es del orden de dos cuadros normales de movimiento.
- El margen contra el presupuesto de 500 kB queda en 20 bytes.

