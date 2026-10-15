# design — acceso-orden-e-intro

Referencias: `propose.md` (alcance, no-objetivos), `spec.md` (R1–R8, CA1–CA10).

## Componentes involucrados

| Pieza | Cambio |
|---|---|
| `backend/routes/empresas.js` | `ORDER BY nombre` → `ORDER BY id` en `GET /` |
| `backend/test/empresas.route.test.js` (nuevo) | Test de la ruta con `db` falso |
| `frontend/.../services/intro-state.service.ts` | Recordado persistente (`localStorage` + fallback en memoria) |
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
`transform-origin: left center` y queda a `left: 100%` de su madre. El giro de la franja raíz sobre
el lomo (borde izquierdo) da la vuelta de página. Cada franja suma una rotación `rotateY` pequeña y
creciente hacia el borde libre, así la hoja se **curva** de verdad en vez de girar como un cartón
rígido. Cada franja muestra su tajada del mismo contenido: una copia del frente desplazada con
`left: -k·(100%/6)` dentro de un `overflow: hidden`.

- Sombreado: cada franja tiene una capa `linear-gradient` (oscuro hacia el pliegue, brillo especular
  en la cresta) cuya `opacity` acompaña la curvatura.
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

Perspectiva: `perspective: 2200px` en el escenario, con `perspective-origin` en el lomo, de modo que
el borde libre se acerca al espectador al levantarse. La hoja gira de derecha a izquierda, como al
leer.

## 3. Contenido de la hoja

Fondo papel cálido muy claro (no blanco puro), con textura sutil por gradiente y sin imagen. En el
centro va una casa SVG inline en trazo fino (`stroke-width` ~1.25 con
`vector-effect: non-scaling-stroke`, color navy de marca) sobre el logo
`/logo-rediseno/Logo_Kuvu.png`. El SVG y el logo son decorativos (`aria-hidden="true"`, `alt=""` en
las copias por franja).

## 4. Coreografía y easing (R2.2, total 2000 ms)

| Tramo | ms | Qué pasa | Easing |
|---|---|---|---|
| Presentación | 0–700 | La casa se dibuja (`stroke-dashoffset`); el logo pasa de `opacity 0→1` y `scale 1.02→1` (0–450) | `cubic-bezier(.22,1,.36,1)` |
| Anticipación | 700–950 | La esquina se levanta: raíz `rotateY 0→-10°`, curvatura leve de franjas | `cubic-bezier(.33,0,.2,1)` |
| Paso de hoja | 950–1750 | La raíz va de `-10°` a `-180°`; la curvatura crece hasta el 50 % y se relaja al aterrizar; la sombra proyectada barre y se desvanece | `cubic-bezier(.65,.05,.36,1)` |
| Asentamiento | 1750–2000 | La hoja sale de vista; el selector hace `translateY 8px→0` (ya visible debajo) | ease-out |

El sonido arranca a los 950 ms, sincronizado con el paso. El selector está debajo desde el instante 0
(§7), así que al llegar a 2000 ms ya es interactivo: no hay crossfade adicional y desaparece el fade de
650 ms de `LandingComponent`.

**Control del tiempo:** el movimiento son keyframes CSS con `animation-delay`, aplicados por una clase
`is-playing`. El fin lo marca **un solo `setTimeout(2000)`** en TS que emite `completed`. Se usa timer
y no `animationend` para que la duración sea determinista y testeable con `fakeAsync`, como el patrón
vigente del proyecto. El sonido usa otro `setTimeout(950)`.

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
- El fetch de empresas arranca en `ngOnInit`, en paralelo a la intro: en 2 s la lista suele estar
  cargada; si no, se ve el skeleton existente.

## 8. Recordado persistente (R5)

`IntroStateService` conserva su API pública (`debeReproducirse()`, `marcarComoReproducida()`), que
`LandingComponent` y sus tests ya consumen.
- Clave `localStorage`: `kuvu.intro.seen` = `"1"`.
- `debeReproducirse()` devuelve `!reducedMotion && !vistoEnMemoria && !vistoEnStorage`.
- `marcarComoReproducida()` pone el flag en memoria e intenta escribir en storage.
- Toda lectura o escritura de `localStorage` va en `try/catch`. Si falla, queda solo el flag en
  memoria: como mucho una vez por carga (R5.3).
- Reduced-motion se sigue leyendo una vez en el constructor (R7.1). No marca la intro como vista.

## 9. Sonido (R6) — Web Audio sintetizado

**Elegido: síntesis con Web Audio API en `PageTurnSoundService`** (0 bytes de asset, ~60 líneas de
TS, muy por debajo del presupuesto de 30 kB).
- `play()`: crea un `AudioContext` y un buffer de ruido blanco de ~0,9 s. Lo pasa por un `highpass` de
  ~400 Hz y un `bandpass` con barrido de frecuencia de ~900 a ~2600 Hz (el "frrr" del papel). La
  envolvente de ganancia sube a 0,18 en 60 ms, ondula y cae a 0 a los ~850 ms. Agrega un golpe corto
  final de ~40 ms (la hoja que asienta) con pico ≤ 0,25. Así el pico global queda ≤ 0,3 (R6.1).
- Si el contexto está `suspended`, intenta `resume()` con `.catch(() => {})`.
- `stop()`: rampa de ganancia a 0 en 60 ms y `close()` del contexto.
- **Degradación silenciosa (R6.2):** sin `AudioContext`/`webkitAudioContext`, con un constructor que
  lanza o con un `resume()` que se rechaza, `play()` y `stop()` no hacen nada y nunca propagan
  excepciones ni dejan promesas rechazadas sin capturar.
- `play()` lo llama solo `AuthIntroComponent` a los 950 ms, una vez por intro (R6.3).

**Descartado: asset (OGG/MP3 corto con licencia libre).** Entra en 30 kB, pero exige curar la licencia
y suma una request en el camino crítico. La política de autoplay lo bloquea igual, así que no da
ventaja funcional. La síntesis además permite cortar el sonido en el instante del salto.

**Autoplay:** si el usuario llega a `/acceder` navegando dentro del SPA después de un clic (por
ejemplo, desde la home), hay activación de usuario y el sonido suena. Si llega en una carga directa de
URL, el contexto queda suspendido y la intro corre muda. Es el comportamiento esperado por R6.2.

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
| `AuthIntroComponent` | `completed` no se emite a los 1999 ms y sí a los 2000 ms (`fakeAsync`); `click` en host, `Escape`/`Enter`/`Space` y botón saltan y emiten en ≤ 300 ms; emite una sola vez (salto + timer, doble salto); `sound.play` una vez a los 950 ms y `sound.stop` al saltar (stub del servicio); botón con `type=button` y `aria-label` correcto; capas decorativas con `aria-hidden` |
| `PageTurnSoundService` | Sin `AudioContext` no lanza; con un constructor que lanza no lanza; con `resume()` rechazado no deja una promesa rechazada sin capturar; `stop()` antes de `play()` no lanza |
| `IntroStateService` | Storage con `seen` → `false`; `marcar` escribe la clave; `getItem`/`setItem` que lanzan → fallback en memoria; reduced-motion → `false` |
| `LandingComponent` | Renderiza las empresas en el orden recibido (ids 1–4 con nombres no alfabéticos); el filtro preserva el orden; el selector está `inert` con la intro activa y se libera al completar; foco en el buscador al completar; pasa a `SELECTION` sin el retardo de 650 ms |

**`node --test`**: `empresas.route.test.js` según §1.

**Manual en `verify`**: los 6 viewports de referencia (CA9), Safari/iOS si hay dispositivo, y el
sonido con y sin activación previa.

## Riesgos

| Riesgo | Mitigación |
|---|---|
| Flicker o z-fighting de `preserve-3d` en Safari/iOS | `backface-visibility`, `translateZ(0.1px)` por franja, prueba en dispositivo; fallback aceptable: la hoja se ve más rígida |
| Jank en móviles de gama baja con 6 copias del contenido | Solo `transform`/`opacity`, contenido liviano (SVG + un PNG), `will-change` acotado a la intro, overlay removido del DOM al terminar |
| El sonido no suena en una carga directa (autoplay) | Aceptado por spec (R6.2); se documenta |
| Ghost click o tecla que llega al selector | `inert` + salto en `click` con `preventDefault/stopPropagation` + overlay presente durante el fade |
| Storage bloqueado | `try/catch` + fallback en memoria |
| Usuarios que ya vieron la intro vieja la ven una vez más (la clave es nueva) | Esperado: es la primera vez de la intro nueva |
| Tamaño del diff: TS/HTML/SCSS de la intro + servicio + tests ≈ 600–700 líneas, por encima del umbral de 300 | `tasks` lo marca como riesgo alto; se aplica `ask-on-risk` (los slices `backend-orden` e `intro` permiten PRs separados) |
| Doc vigente (`docs/login-intro-transition.md`) describe la casa 3D | `document` la actualiza al comportamiento nuevo |
