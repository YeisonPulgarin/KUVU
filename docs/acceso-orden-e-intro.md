# acceso-orden-e-intro

El selector de inmobiliarias (`/acceder`) lista las empresas activas en el orden de su `id`
(Amarilo, Nido Rent, Balcones de San Soucci, Mi Inmueble), y el filtro por texto conserva ese orden.
La primera vez que se entra en una pestaña, el selector aparece debajo de una intro de unos 3 s: una
hoja de papel con el logo KUVU y una casa dibujada en trazo fino que se curva como la página de un
libro y pasa, con un sonido sintetizado de hoja. La intro se puede saltar y se omite con
`prefers-reduced-motion: reduce`.

## Cómo funciona

### Orden de empresas

`GET /api/empresas` (`backend/routes/empresas.js`) consulta
`SELECT * FROM empresas WHERE activo = 1 ORDER BY id`. `LandingComponent` muestra la lista en el
orden recibido y `empresasFiltradas` solo filtra, sin reordenar. Tests: `backend/test/empresas.route.test.js`.

### Flujo de la intro

```
Clic en "Ingresar" (home) → /acceder
  └─ skipViewTransitionIntoIntro: sin cross-fade del router si la intro va a correr
LandingComponent
  ├─ IntroStateService.debeReproducirse() = false → selector directo
  └─ true → estado INTRO
       ├─ <app-auth-intro> encima del selector (inert)
       ├─ tapado = true hasta TURN_START_MS (600 ms): foto, overlay y selector sin renderizar
       └─ (completed) a los 2900 ms o al saltar → completadaIntro()
            → marca la intro como vista, estado SELECTION, foco en el buscador
```

- **`IntroStateService`** (`frontend/proyecto_angular/src/app/services/intro-state.service.ts`):
  `debeReproducirse()` es `true` si no hay movimiento reducido y la pestaña no la vio todavía. El
  recordado vive en `sessionStorage['kuvu.intro.seen'] = "1"`: sobrevive a F5 y a la navegación
  interna, y una pestaña nueva vuelve a mostrar la intro. Si el storage falla, queda un flag en
  memoria (una vez por carga).
- **`AuthIntroComponent`** (`.../components/shared/auth-intro/`): overlay fijo a pantalla completa.
  Un `setTimeout(INTRO_DURATION_MS = 2900)` emite `completed`; otro a `SOUND_START_MS = 1200` pide el
  sonido. Se salta con clic o tap en cualquier punto, con Escape, Enter o Espacio, o con el botón
  nativo "Saltar" (foco inicial, mínimo 44×44 px): fade de 180 ms y `completed`, sin que el clic
  llegue al selector.
- **`LandingComponent`** (`.../components/landing/`): renderiza el selector siempre, con `inert`
  mientras dura la intro, y lo asienta 8 px al liberarlo.
- **`skipViewTransitionIntoIntro`** (`frontend/proyecto_angular/src/app/intro-view-transition.ts`):
  hook de `withViewTransitions({ onViewTransitionCreated })` en `app.config.ts`. Llama a
  `transition.skipTransition()` cuando el destino es `acceder` y la intro va a correr. Las demás
  navegaciones conservan el cross-fade.

### La hoja

Todo el movimiento es CSS (`auth-intro.component.scss`), con los porcentajes de los keyframes
derivados de milisegundos sobre `$duration: 2900ms`:

| ms | Qué se ve |
|---|---|
| 0–600 | Presentación: hoja plana; la casa se dibuja (120–570) y el logo aparece (120–520) |
| 600–900 | La esquina se levanta (raíz de 0° a −12°) |
| 900–2880 | La hoja pasa (raíz hasta −91°); el selector empieza a verse a ~1,4 s y la hoja sale de vista a ~2,75 s |
| 2900 | Fin: el selector queda interactivo |

- **Franjas.** La hoja son 6 franjas verticales anidadas (`ng-template` recursivo). La raíz gira sobre
  el lomo y cada franja suma una `rotateY` chica (`--i × 1,6°` como máximo), así la hoja se curva en
  vez de girar rígida. Las franjas se solapan 1 px y cada una muestra su tajada de la misma cara
  (`.sheet-face`, desplazada `--i × (100% − 1px)`), sin costuras.
- **Perspectiva.** `perspective: max(2200px, 500vw)` con origen en el lomo: la cámara queda a unas 5
  veces el ancho de la pantalla, y en cualquier viewport el selector se descubre durante ~1,3–1,4 s.
- **Sombreado.** Cada franja lleva su tramo de una sola rampa (`--i × 0,05` a `(--i + 1) × 0,05` de
  opacidad), continua de lomo a borde libre. Hay además dorso de papel y una sombra proyectada sobre
  el selector.
- **Presentación en capa plana.** La casa y el logo salen de un `ng-template #faceContent` usado 7
  veces: en las 6 caras y en `.presentation`, una copia plana encima de la hoja. Solo la copia plana
  anima el trazo y el logo; a los 600 ms cede, en el mismo cuadro, a las copias de las franjas, que
  ya están dibujadas.
- **Selector tapado.** Mientras `tapado` es `true`, `.bg-photo` y `.bg-overlay` van con
  `visibility: hidden` y `.landing-container` con `content-visibility: hidden`. Mientras la intro
  está activa, el zoom de la foto queda en pausa.

### Sonido

`PageTurnSoundService` (`.../services/page-turn-sound.service.ts`) sintetiza el efecto con Web Audio,
sin archivos: ruido filtrado con barrido de banda y un golpe final, de 1,4 s, con salida ×3,16 y un
limitador suave (`0,3·tanh(x/0,3)`). El grafo vive en `buildPageTurnGraph(ctx, destination)`, que los
tests renderizan en un `OfflineAudioContext`. `play()` no crea contexto si
`navigator.userActivation.hasBeenActive` es `false` (entrada directa por URL: la intro corre en
silencio). `stop()` baja la ganancia en 60 ms y cierra el contexto. Ningún rechazo de `resume()` o
`close()` queda sin capturar.

## Decisiones

- **CSS con franjas anidadas en vez de canvas, WebGL o librerías.** Anima solo `transform` y
  `opacity` y no suma dependencias. Tradeoff: la curva es poligonal (6 franjas), no una superficie
  continua.
- **Timer en TS para el fin, no `animationend`.** La duración es determinista y testeable con
  `fakeAsync`. Tradeoff: las constantes de TS (`INTRO_DURATION_MS`, `TURN_START_MS`) y las variables de
  SCSS tienen que coincidir; los tests de la coreografía real lo verifican.
- **Perspectiva proporcional al ancho.** Con una perspectiva fija, en desktop el borde libre seguía
  fuera de la pantalla hasta los −63° a −83° y el selector se descubría en 0,2–0,5 s.
- **Capa plana para la presentación, selector tapado y sin cross-fade del router.** Repintar el trazo
  en las 6 capas 3D, el raster del selector (foto con zoom y `backdrop-filter`) y el cross-fade del
  router ocupaban los primeros ~400 ms y la casa aparecía ya dibujada. Tradeoff: el raster del
  selector pasa al levante, con la hoja casi plana.
- **`content-visibility` en el selector, no `visibility`.** Con `visibility` heredada, Chrome puede
  dejar el buscador computado como oculto justo después de que su ancestro vuelve a ser visible, y el
  foco del fin de la intro falla.
- **Recordado por pestaña (`sessionStorage`).** La intro vuelve en cada sesión nueva, pero no en
  recargas ni al volver de `/login`.
- **Movimiento reducido omite la intro y el sonido.** La hoja es movimiento decorativo de gran
  superficie, justo lo que esa preferencia pide evitar.

## Limitaciones conocidas

- Entrando directo por URL (sin un gesto previo en la página) no hay sonido.
- En Chrome headless con render por software hay ~250–300 ms sin cuadros al levante (600–870 ms),
  cuando se renderiza el selector bajo la hoja; con la hoja casi plana, el salto visual es chico.
- Sigue el warning `css-inline-fonts`: la hoja de Google Fonts de `landing.component.scss` supera el
  presupuesto de 17 kB por 2,13 kB.
