# design — acceso-orden-e-intro

Referencias: `propose.md` (alcance, no-objetivos), `spec.md` (R1–R8, CA1–CA10).

## Componentes involucrados

| Pieza | Cambio |
|---|---|
| `backend/routes/empresas.js` | `ORDER BY nombre` → `ORDER BY id` en `GET /` |
| `backend/test/empresas.route.test.js` (nuevo) | Test de la ruta con `db` falso |
| `frontend/.../services/intro-state.service.ts` | Recordado por sesión (`sessionStorage` + fallback en memoria) |
| `frontend/.../services/page-turn-sound.service.ts` (nuevo) | Sonido sintetizado con Web Audio |
| `frontend/.../components/shared/auth-intro/*` | Escena "hoja que pasa": reemplaza por completo markup, SCSS y lógica de la casa 3D |
| `frontend/.../components/landing/*` | Selector renderizado debajo de la intro desde el inicio, `inert` mientras la intro está activa, foco al buscador al terminar |

`LoginComponent`, `AuthService` y el resto de las rutas del backend no cambian.

## 1. Orden de empresas (R1)

La consulta usa `ORDER BY id ASC`. El frontend no reordena: `empresasFiltradas` es un `filter`,
que preserva el orden. Sin cambios de esquema ni de datos.

**Test backend (`node --test`, sin dependencias nuevas, Node 22):** antes de cargar la ruta, el test
reemplaza `require.cache[require.resolve('../db')]` por un `db` falso cuyo `execute` registra el SQL
y devuelve filas fijas. Después monta el router en un `express()` sobre el puerto `0` y lo llama con
el `fetch` nativo. Verifica que el SQL ordena por `id`, que la respuesta respeta ese orden y que un
error del `db` produce 500 con `{ error }`. Así se prueba la ruta real sin MariaDB.

## 2. Técnica de la curva de página (R2)

**Elegida: CSS 3D por franjas anidadas.** La hoja es un `div` a pantalla completa dividido en
**6 franjas verticales anidadas**: cada franja es hija de la anterior, tiene
`transform-origin: left center` y queda a `left: calc(100% - 1px)` de su madre, así cada franja
**solapa 1 px** a la anterior y no hay costura por antialiasing. El giro de la franja raíz sobre el
lomo (borde izquierdo) da la vuelta de página. Cada franja suma una rotación `rotateY` pequeña
(`--i × 1,6°` como máximo, unos 24° acumulados en el borde libre), así la hoja se **curva**
suavemente en vez de girar como un cartón rígido o plegarse como persiana. Cada franja muestra su
tajada del mismo contenido: una copia del frente desplazada `--i × (100% − 1px)` dentro de un
`overflow: hidden`, alineada con el solape. La raíz mide `(100% + 6px) / 6`, de modo que las 6
franjas cubren el viewport completo con 1 px de margen para el redondeo.

- Sombreado: cada franja lleva su tramo de una única rampa que cruza la hoja entera: un gradiente
  horizontal que va de `--i × 0,05` a `(--i + 1) × 0,05` de opacidad. El final de una franja coincide
  con el comienzo de la siguiente, así que el sombreado aumenta de forma continua hacia el borde
  libre, sin escalones de tono en los bordes de franja (R2.6). La `opacity` de la capa acompaña la
  curvatura.
- Dorso: `backface-visibility: hidden` en el frente, con un dorso de tono papel levemente más oscuro.
- Sombra proyectada: una capa de gradiente sobre el selector, debajo de la hoja, que se desplaza y se
  desvanece con `transform` y `opacity`.
- Todo lo que se anima es `transform` u `opacity`, así que corre en el compositor sin repintar a
  pantalla completa por frame. `will-change: transform` va solo en las franjas, mientras dura la
  intro.

**Descartadas**
- *Rotación rígida de un panel + gradiente*: es barata pero se lee como una tarjeta que gira, no como
  un libro, que es lo que pidió el usuario.
- *`clip-path` + pliegue en esquina (peel 2D)*: anima `clip-path`, que en una superficie de pantalla
  completa repinta cada frame y tironea en móviles de gama baja. Además solo convence como despegue de
  esquina, no como paso de página.
- *Canvas/WebGL o librerías (turn.js, GSAP, three.js)*: fuera de alcance por no-objetivo.

Perspectiva: `perspective: max(2200px, 500vw)` en el escenario, con `perspective-origin` en el lomo.
La cámara queda a unas 5 veces el ancho del viewport en cualquier pantalla: el borde libre se acerca
al espectador al levantarse, pero su proyección apenas se agranda, y el selector empieza a
descubrirse en cuanto la hoja gira unos 20°. Con una perspectiva fija, en desktop el borde libre
proyectado seguiría fuera del viewport hasta −63° (1366 px) o −83° (1920 px) y el descubrimiento se
reduciría a 0,2–0,5 s. La hoja gira de derecha a izquierda, como al leer.

## 3. Contenido de la hoja

Fondo papel cálido muy claro (no blanco puro), con textura sutil por gradiente y sin imagen. En el
centro va una casa SVG inline en trazo fino (`stroke-width: .6` en unidades del `viewBox`, entre
~0,75 y ~1,8 px según el tamaño; color navy de marca) sobre el logo `/logo-rediseno/Logo_Kuvu.png`.
El trazo **no** usa `vector-effect: non-scaling-stroke`: combinado con `pathLength="1"` y
`stroke-dasharray: 1`, Chrome mide el dash en px de pantalla y la casa queda dibujada a medias
cuando el SVG escala más de 1×. La cara de cada franja usa la clase `sheet-face` y no `page`,
porque los estilos compartidos del sitio (`shared.styles.scss`) le dan a `.page` un `max-width` de
1280 px y padding, que acortan la hoja y desalinean las tajadas. El SVG y el logo son decorativos (`aria-hidden="true"`, `alt=""` en
las copias por franja).

**Presentación en una capa plana (R2.5.1).** La casa y el logo salen de un solo `ng-template`
(`faceContent`) que se usa 7 veces: en las 6 caras de franja y en `.presentation`, una copia plana que
va encima de la hoja con el mismo layout que la cara completa (`inset: 0 -1px 0 0`). Solo
`.presentation` anima el trazo y el logo. Las copias de las franjas están dibujadas desde el inicio y
ocultas con una animación de `opacity` (`hand-over-in`, `step-end`, que además les da su propia capa
chica). A los 600 ms, en el mismo cuadro, `.presentation` pasa a `opacity 0` (`hand-over-out`) y las
copias a `opacity 1`: con la hoja todavía plana, el cambio no se nota. Así el repintado del trazo
ocurre en una sola capa chica y no en las 6 capas 3D de las franjas.

## 4. Coreografía y easing (R2.2, total 2900 ms)

| Tramo | ms | Qué pasa | Easing |
|---|---|---|---|
| Presentación | 0–600 | En la capa plana: la casa se dibuja (`stroke-dashoffset`, 120–570) y el logo pasa de `opacity 0→1` y `scale 1.02→1` (120–520). Los primeros ~100 ms son el primer raster de la hoja. A los 600 la capa plana cede a las copias de las franjas | `cubic-bezier(.22,1,.36,1)` |
| Anticipación | 600–900 | La esquina se levanta: raíz `rotateY 0→-12°`, curvatura leve de franjas | `cubic-bezier(.33,0,.2,1)` |
| Paso de hoja | 900–2880 | La raíz va de `-12°` a `-91°`; la curvatura crece hasta la mitad del tramo y se relaja; la sombra proyectada barre y se desvanece. El selector empieza a descubrirse a ~1,4 s y la hoja queda fuera de vista a ~2,75 s; la raíz cruza `-90°` a ~2,8 s | `cubic-bezier(.3,0,.8,1)`: lento al comienzo del tramo visible y más rápido al salir |
| Salida | 2780–2880 | La raíz baja `opacity` a 0 como resguardo | lineal |
| Fin | 2900 | `completed`; el selector se libera de `inert` y hace su asentamiento de 8 px | ease-out |

El pase visible dura ≥ 1,2 s medido de las dos formas (R2.2.1): por rotación (del levante a los
600 ms al cruce de −90°, ~2,2 s) y por descubrimiento (desde que el selector empieza a verse hasta que
la hoja sale por completo de la vista, ~1,3–1,4 s en todos los viewports de CA9). Entre la salida de vista y el fin pasan ≤ 250 ms (R2.2.2). El sonido arranca a los
1200 ms, ya con la hoja en movimiento, y dura 1,4 s.

**Control del tiempo:** el movimiento son keyframes CSS sobre la duración total (`$duration: 2900ms`),
con los porcentajes derivados en SCSS de los ms de la tabla, aplicados por una clase `is-playing`.
El fin lo marca **un solo `setTimeout(INTRO_DURATION_MS)`** en TS que emite `completed`. Se usa timer
y no `animationend` para que la duración sea determinista y testeable con `fakeAsync`. El sonido usa
otro `setTimeout(SOUND_START_MS)`. Las constantes de TS (`INTRO_DURATION_MS = 2900`,
`TURN_START_MS = 600`, el instante en que la hoja empieza a levantarse; `SOUND_START_MS = 1200`) coinciden con las variables de SCSS; un test sobre la
animación CSS real lo verifica (§13).

## 5. Salto (R3)

- La intro es un overlay `position: fixed; inset: 0` con `z-index` por encima del selector. Escucha
  `click` en el host (cubre clic y tap) y `keydown` en `document` para `Escape`, `Enter` y `Space`,
  solo mientras está activa.
- **Sin propagación al selector:**
  1. El selector tiene `inert` mientras la intro está activa: no recibe foco, clic ni lectura de
     lector de pantalla.
  2. El salto se dispara en `click`, no en `pointerdown`, y llama a `preventDefault()` +
     `stopPropagation()`. Como el overlay sigue en el DOM durante la salida, el `click` que salta
     nunca puede aterrizar en un botón de empresa (sin ghost click).
  3. En `keydown`, `preventDefault()` evita que Enter o Espacio activen otro control.
- **Salida:** la clase `is-skipping` hace un fade del overlay `opacity 1→0` en 180 ms y luego emite
  `completed` (≤ 300 ms, R3.4). El sonido se detiene con una rampa de ganancia a 0 en 60 ms. Un guard
  `done` garantiza que `completed` se emita una sola vez aunque coincidan el salto y el timer, o haya
  salto doble. `ngOnDestroy` limpia timers y listeners.
- **Foco:** al montarse la intro, el foco va al botón "Saltar". Al terminar, `LandingComponent` quita
  `inert` y enfoca el buscador por `viewChild` (el atributo `autofocus` no sirve dentro de un
  contenedor `inert`).

## 6. Botón "Saltar" (R8)

`<button type="button" aria-label="Saltar introducción">Saltar</button>`, con texto navy sobre papel
claro (contraste muy superior a 4,5:1), `min-width/min-height: 44px` y `:focus-visible` con anillo de
2 px más offset. Queda fuera de las capas `aria-hidden`; el resto del overlay es `aria-hidden="true"`.

## 7. Integración con `LandingComponent`

- El selector (`.landing-container`) se renderiza siempre. La intro, cuando corresponde, se superpone
  encima.
- `estado` conserva `INTRO | SELECTION`. `completadaIntro()` marca la intro como vista, pasa a
  `SELECTION` en el acto (sin timeout de 650 ms; `transicionando` deja de ser necesario) y enfoca el
  buscador.
- El fetch de empresas arranca en `ngOnInit`, en paralelo a la intro: en 3 s la lista suele estar
  cargada; si no, se ve el skeleton existente.
- **Selector sin renderizar durante la presentación (R2.5.1).** Mientras la hoja cubre la página
  plana, la foto de fondo (con su zoom en loop y el overlay con `backdrop-filter`) y la tarjeta con
  blur cuestan unos 250–350 ms de raster en el primer cuadro, y eso congelaba justo el dibujo de la
  casa. La señal `tapado` vale `true` desde el montaje hasta `TURN_START_MS` (un `setTimeout`, limpio
  en `DestroyRef`) o hasta `completadaIntro()`, lo que llegue primero. Con la clase `tapado`,
  `.bg-photo` y `.bg-overlay` van con `visibility: hidden` y `.landing-container` con
  `content-visibility: hidden`. El selector no usa `visibility` heredada: Chrome puede dejar el
  buscador computado como oculto justo después de que su ancestro vuelve a ser visible, y el foco del
  fin de la intro falla. El raster pasa al levante, todavía bajo la hoja, donde la hoja casi no se
  mueve. Mientras la intro está activa, el zoom de la foto queda en pausa.
- **Sin cross-fade del router al entrar a la intro (R2.5.1).** `withViewTransitions` hace un cross-fade
  de ~250 ms entre páginas, y al entrar a `/acceder` mantenía la home a la vista durante los primeros
  ~350 ms de la intro. `skipViewTransitionIntoIntro` (`app/intro-view-transition.ts`, en
  `onViewTransitionCreated`) llama a `transition.skipTransition()` cuando el destino es `acceder` y
  `IntroStateService.debeReproducirse()` es `true`. Las demás navegaciones conservan el cross-fade.

## 8. Recordado persistente (R5)

`IntroStateService` conserva su API pública (`debeReproducirse()`, `marcarComoReproducida()`), que
`LandingComponent` y sus tests ya consumen.
- Clave `sessionStorage`: `kuvu.intro.seen` = `"1"`. El recordado dura lo que la sesión de la
  pestaña: sobrevive a F5 y a la navegación interna, y una pestaña o sesión nueva vuelve a mostrar la
  intro.
- `debeReproducirse()` devuelve `!reducedMotion && !vistoEnMemoria && !vistoEnStorage`.
- `marcarComoReproducida()` pone el flag en memoria e intenta escribir en storage.
- Toda lectura o escritura de `sessionStorage` va en `try/catch`. Si falla, queda solo el flag en
  memoria: como mucho una vez por carga (R5.3).
- Reduced-motion se sigue leyendo una vez en el constructor (R7.1). No marca la intro como vista.

## 9. Sonido (R6) — Web Audio sintetizado

**Elegido: síntesis con Web Audio API en `PageTurnSoundService`** (0 bytes de asset, muy por debajo
del presupuesto de 30 kB). El grafo vive en una función exportada,
`buildPageTurnGraph(ctx: BaseAudioContext, destination: AudioNode)`, que usan el servicio (con
`AudioContext`) y los tests (con `OfflineAudioContext`).
- Ruido blanco de 1,4 s → `highpass` de 400 Hz → `bandpass` con barrido de 900 a 2600 Hz (el "frrr"
  del papel) → envolvente que sube en 80 ms, ondula y cae a 0 a los 1,3 s. Un golpe corto final
  low-pass de 40 ms (la hoja que asienta) arranca a 1,32 s.
- **Nivel de salida:** ganancia de salida ×3,16 (+10 dB) seguida de un limitador suave
  (`WaveShaperNode`, curva `0,3·tanh(x/0,3)`). El limitador garantiza un pico de muestra ≤ 0,3 aunque
  el ruido aleatorio genere un pico mayor, y deja el RMS del efecto por encima de −27 dBFS (R6.1).
- Si el contexto está `suspended`, intenta `resume()` con `.catch(() => {})`.
- `stop()`: rampa de ganancia a 0 en 60 ms y `close()` del contexto.
- **Degradación silenciosa (R6.2):** sin `AudioContext`/`webkitAudioContext`, con un constructor que
  lanza o con un `resume()` que se rechaza, `play()` y `stop()` no hacen nada y nunca propagan
  excepciones ni dejan promesas rechazadas sin capturar.
- `play()` lo llama solo `AuthIntroComponent` a los `SOUND_START_MS`, una vez por intro (R6.3).

**Descartado: asset (OGG/MP3 corto con licencia libre).** Entra en 30 kB, pero exige curar la licencia
y suma una request en el camino crítico. La política de autoplay lo bloquea igual, así que no da
ventaja funcional. La síntesis además permite cortar el sonido en el instante del salto.

**Autoplay:** si el usuario llega a `/acceder` navegando dentro del SPA después de un clic (por
ejemplo, "Ingresar" en la home), el documento tiene activación de usuario persistente y el
`AudioContext` arranca en `running`. Por eso no se pre-crea el contexto en la home: no cambia lo que
se oye y sumaría acoplamiento entre la home y la intro. Si llega en una carga directa de URL, el
contexto queda suspendido y la intro corre muda. Es el comportamiento esperado por R6.2.

## 10. Responsive y safe-area (R4)

- Overlay: `position: fixed; inset: 0; height: 100dvh`, con `100vh` como fallback y `overflow: hidden`.
- Contenido centrado con flex. Tamaños:
  - Logo: `width: clamp(140px, 34vw, 320px)`. Respeta el mínimo de 140 px y el máximo del 60 % del
    viewport desde los 234 px de ancho.
  - Casa: `width: clamp(150px, 38vmin, 360px)`.
- `@media (max-height: 480px)` (móvil horizontal): casa en `28vmin` y menos separación, para que logo y
  casa entren sin recorte.
- Botón: `top: max(16px, env(safe-area-inset-top))`, `right: max(16px, env(safe-area-inset-right))`.
  **No se agrega `viewport-fit=cover`** a `index.html`, porque cambiaría el layout de todo el sitio en
  iPhone. Sin él, el navegador ya mantiene el contenido dentro del área segura, y el `max()` es inocuo.
- La perspectiva se fija en px y no depende del ancho, para que la curvatura se vea igual en móvil y
  desktop. En retrato angosto la hoja es alta; el giro sobre el lomo funciona igual.

## 11. Logs (DEVELOPMENT_GUIDELINES → Logging & Observability)

- **Backend:** no se agregan logs. El `console.error('Error empresas:', …)` existente queda como está.
  Migrarlo a logs estructurados es una deuda transversal del backend Express, fuera de alcance.
- **Frontend:** no se agregan logs. Que el navegador bloquee el audio es un comportamiento esperado y
  frecuente, no algo sobre lo que alguien deba actuar. Loguearlo sería ruido o, en el mejor caso,
  materia de métrica, y la spec (R6.2) pide consola limpia. No se loguean datos sensibles.

## 12. Naming

DEVELOPMENT_GUIDELINES pide identificadores en inglés. El código nuevo (`PageTurnSoundService`,
internals de `AuthIntroComponent`: `completed`, `skip()`, `isSkipping`, clases CSS) va en inglés. Las
APIs públicas existentes en español (`IntroStateService.debeReproducirse/marcarComoReproducida`,
`LandingComponent.completadaIntro/estado`) se mantienen para no ampliar el diff ni romper sus tests.

## 13. Estrategia de tests (`test-after`)

**Karma/Jasmine** (el comando de `sdd.config.md`; el proyecto usa Karma aunque el template de
guidelines mencione Vitest):

| Suite | Casos |
|---|---|
| `AuthIntroComponent` | `completed` no se emite a los 2899 ms y sí a los 2900 ms (`fakeAsync`); la animación CSS real de la franja raíz (pausada y recorrida con `currentTime`) dura `INTRO_DURATION_MS`, empieza a levantarse a ≤ 1 s, cruza −90° ≥ 1,2 s después y a ≤ 250 ms del fin; el trazo de la casa no usa `non-scaling-stroke`; `click` en host, `Escape`/`Enter`/`Space` y botón saltan y emiten en ≤ 300 ms; emite una sola vez (salto + timer, doble salto); `sound.play` una vez a los `SOUND_START_MS` y `sound.stop` al saltar (stub del servicio); botón con `type=button` y `aria-label` correcto; capas decorativas con `aria-hidden` |
| `PageTurnSoundService` | Render offline de `buildPageTurnGraph`: pico ≤ 0,3, RMS ≥ −27 dBFS, sin señal después de 1,5 s; sin `AudioContext` no lanza; con un constructor que lanza no lanza; con `resume()` rechazado no deja una promesa rechazada sin capturar; `stop()` antes de `play()` no lanza |
| `IntroStateService` | `sessionStorage` con `seen` → `false`; `marcar` escribe la clave en `sessionStorage` y no en `localStorage`; `getItem`/`setItem` que lanzan → fallback en memoria; reduced-motion → `false` |
| `LandingComponent` | Renderiza las empresas en el orden recibido (ids 1–4 con nombres no alfabéticos); el filtro preserva el orden; el selector está `inert` con la intro activa y se libera al completar; foco en el buscador al completar; pasa a `SELECTION` sin el retardo de 650 ms |

**`node --test`**: `empresas.route.test.js` según §1.

**Medición en `verify` (Chrome headless sobre el build)**: los viewports de referencia (CA9), casa
completa a 1280 y 360 px y hoja sin costuras (CA3.2), pase visible por cobertura de píxeles en el
screencast (CA3.1) y nivel de salida real entrando por clic en "Ingresar". Safari/iOS si hay
dispositivo.

## Riesgos

| Riesgo | Mitigación |
|---|---|
| Flicker o z-fighting de `preserve-3d` en Safari/iOS | `backface-visibility`, `translateZ(0.1px)` por franja, prueba en dispositivo; fallback aceptable: la hoja se ve más rígida |
| Jank en móviles de gama baja con 6 copias del contenido | Solo `transform`/`opacity`, contenido liviano (SVG + un PNG), `will-change` acotado a la intro, overlay removido del DOM al terminar |
| El sonido no suena en una carga directa (autoplay) | Aceptado por spec (R6.2); se documenta |
| Ghost click o tecla que llega al selector | `inert` + salto en `click` con `preventDefault/stopPropagation` + overlay presente durante el fade |
| Storage bloqueado | `try/catch` + fallback en memoria |
| Usuarios que ya vieron la intro vieja la ven una vez más (la clave es nueva) | Esperado: es la primera vez de la intro nueva |
| Navegadores que tienen `kuvu.intro.seen` en `localStorage` | La clave de `sessionStorage` es independiente: la intro se muestra en su próxima sesión, que es lo pedido |
| Tamaño del diff: TS/HTML/SCSS de la intro + servicio + tests ≈ 600–700 líneas, por encima del umbral de 300 | `tasks` lo marca como riesgo alto; se aplica `ask-on-risk` (los slices `backend-orden` e `intro` permiten PRs separados) |
| Doc vigente (`docs/login-intro-transition.md`) describe la casa 3D | `document` la actualiza al comportamiento nuevo |
