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
