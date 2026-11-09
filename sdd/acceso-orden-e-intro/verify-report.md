# verify-report — acceso-orden-e-intro

**Corrida posterior a I18–I20 (corrección de D9).** Estado verificado: commit `2058d41` más el
working tree (enmienda I9–I14, corrección I15–I17 y corrección I18–I20), rama
`feat/acceso-orden-e-intro`, build de producción `dist/proyecto-dss/browser`. Slices completados:
`backend-orden`, `intro` (con I9–I20), `cierre`. Omitidos: ninguno. Modalidad: `test-after`.
Extensión `git` inactiva: no hay CI check. La spec mide R2.2.1 / CA3.1 por lo que se ve descubrirse
(decisión del usuario) y suma R2.5.1 / CA3.3 (la casa se ve dibujarse).

## Veredicto

**PASA.** Backend 10/10, Karma 241/241, `ng build` OK sin warnings nuevos (initial 499,98 kB, 20 bytes
bajo el presupuesto de 500 kB). D7, D8, D9 y D10 quedan cerrados.

- **D9 cerrado.** Entrando por "Ingresar" desde la home, la hoja aparece a los 12–93 ms del montaje y
  la casa se ve dibujarse: hay cuadros con el trazo a medio hacer entre ~220 y ~410 ms, y completo
  antes del levante. Antes, el primer cuadro de la intro llegaba a los ~390–460 ms con la casa ya
  dibujada.
- **D7 sigue cerrado** con el selector ahora renderizado desde el levante: pase visible en vivo de
  1332–1400 ms en 360, 1366 y 1920 px.
- **Residual (aceptado, sin CA):** el raster del selector se hace al levante. En headless hay
  ~250–300 ms sin cuadros entre los 600 y los ~870 ms, con la hoja casi plana.

## Corrida I18–I20

Herramientas (scratchpad `intro/`, fuera del repo): `d9.js` carga la home en Chrome 156 headless
(GPU Intel UHD por ANGLE), hace clic real en "Ingresar" por CDP, graba un screencast y registra el
montaje de la intro con un `MutationObserver`. `d9frames.py` mide en cada cuadro el papel visible y
los píxeles oscuros del trazo en el centro. `d9trace.js` suma un trace del navegador.

**Diagnóstico (antes de I18–I20).** El primer cuadro de la intro llegaba a los ~390–460 ms con la casa
completa. En el trace: un cross-fade del router (`ViewTransition::ProcessCurrentState`) con la home a
la vista unos 340 ms y, después, el hilo del GPU ocupado ~370 ms rasterizando y componiendo el
selector de abajo (foto con zoom, overlay y tarjeta con `backdrop-filter`). Pruebas de descarte con
CSS inyectado (hueco sin cuadros después de la primera hoja): base ~370 ms · sin zoom ~330 ms · sin
`backdrop-filter` ~200 ms · selector oculto ~90–120 ms. Pre-decodificar el logo no cambiaba nada.

**Después de I18–I20 (clic en "Ingresar", 2 corridas por viewport)**

| Viewport | Primer cuadro de la hoja | Hueco hasta el cuadro siguiente | Casa a medio dibujar | Hueco al levante |
|---|---|---|---|---|
| 1366×768 | 12 / 93 ms | ~150 / ~140 ms | ~220–410 ms | 614 → 870 ms / 626 → 862 ms |
| 1920×1080 | 68 / 19 ms | ~90 / ~125 ms | visible desde ~160 ms | 622 → 872 ms / 621 → 898 ms |
| 360×640 | 29 / 30 ms | ~90 / ~97 ms | visible desde ~120 ms | 610 → 915 ms / 612 → 862 ms |

- Traspaso de la capa plana a las franjas: diferencia media de luminancia de 0,34 niveles entre los
  cuadros de 593 y 614 ms (1366). La casa no salta.
- Contacto a 1366 (226, 282, 365 y 593 ms): trazo parcial, más avanzado, completo, completo con logo.
- Pase visible en vivo (rAF, carga directa): 1366 → 1336 ms (fin a 138 ms de la salida de vista);
  1920 → 1332–1336 ms (25–118 ms); 360 → 1399–1400 ms (83–111 ms). Una corrida a 360 no registró el
  cuadro final ≤ 2 % antes del desmontaje (variación del headless).
- `prefers-reduced-motion`, salto y recordado: cubiertos por los tests (sin cambios de lógica).

## Corrida I15–I17 (estado previo a I18–I20)

Herramientas: scripts en el scratchpad de la sesión (`intro/`, fuera del repo). `serve.js` sirve el
build con fallback SPA y `/api/*` vacío. `probe.js` abre Chrome 156 headless por CDP, pausa todas las
animaciones de la intro al montarse y las recorre con `currentTime` cada 50 ms, guardando una captura
y el borde derecho de la caja de la hoja (frentes y dorsos) por paso; el timer de fin se estira para
que la intro no se desmonte mientras se recorre. `cover.py` calcula la cobertura de papel (luminancia
≥ 120 y croma ≤ 40) por captura. `live.js` mide en tiempo real (sin pausar) el borde de la hoja por
rAF entre el montaje y el desmontaje.

**Pase visible en vivo (rAF, carga directa de `/acceder`)**

| Viewport | Montaje → desmontaje | Empieza a descubrir (< 98 % del ancho) | Fuera de vista (≤ 2 %) | Pase visible | Fuera de vista → fin |
|---|---|---|---|---|---|
| 1366×768 | 2874 ms | 1433 ms | 2770 ms | 1337 ms | 104 ms |
| 1920×1080 | 2875 ms | 1442 ms | 2777 ms | 1335 ms | 98 ms |
| 360×640 | 2874 ms | 1371 ms | 2770 ms | 1399 ms | 104 ms |

**Pase visible por cobertura de papel (línea de tiempo recorrida, pasos de 50 ms)**

| Viewport | < 98 % de papel | ≤ 3 % de papel | Pase |
|---|---|---|---|
| 1366×768 | 1450 ms | 2750 ms | 1,30 s |
| 1920×1080 | 1400 ms | 2750 ms | 1,35 s |
| 1280×720 | 1400 ms | 2750 ms | 1,35 s |
| 844×390 | 1450 ms | 2800 ms | 1,35 s |
| 360×640 | 1400 ms | 2800 ms | 1,40 s |

**Sombreado.** Luminancia a lo largo de y ≈ 12 % de la altura: 1920 a 1500 ms
`244, 238, 231, 224, 217, 210, 203, 195` cada 240 px; 1366 a 1500 ms
`244, 237, 232, 224, 217, 209, 202, 195` cada 170 px. Los únicos saltos ≥ 3 niveles entre píxeles
vecinos son el borde de la hoja contra el selector (más uno de 3 niveles a 1366 y 1900 ms). La
captura a 1366 y 1900 ms muestra la casa y el logo completos, la hoja sin paneles y el selector
descubierto a la derecha.

## Antes / después de la enmienda (I9–I14)

| Medición (Chrome 155 headless sobre el build) | Antes (`2058d41`) | Después (enmienda) |
|---|---|---|
| Duración montaje → desmontaje, entrando por clic en "Ingresar" | 1969–1990 ms | 2843–2879 ms (4 corridas) |
| Inicio del levante (rotación de la franja raíz, rAF) | ~950 ms | 626–755 ms (CSS: 600 ms) |
| Cruce de −90° (rAF) | ~1350 ms | 2729–2749 ms |
| Pase visible por rotación (levante → −90°) | ~375 ms | ~2,0–2,1 s |
| Barrido de descubrimiento por cobertura (< 98 % → ~0) | no medido | 1920×1080: ~0,2 s · 1366×768: ~0,47–0,58 s · 360×640: ~1,18 s |
| Fuera de vista → fin (tiempo muerto) | ~650 ms | 30–150 ms |
| Pico de muestra de la salida | 0,098 (−20,2 dBFS) | 0,237–0,248 (−12,1 a −12,5 dBFS) |
| RMS de la salida durante el efecto | −33,3 dBFS | −24,0 dBFS (offline) / −23,7 dBFS (en vivo) |
| Casa en desktop | dibujada a medias | completa (`stroke-dashoffset: 0px`, sin `vector-effect`) en los 9 viewports |
| Hoja | persiana, tajadas desalineadas | tajadas alineadas, sin huecos; bandas de tono escalonadas (D8) |
| Banda oscura en el borde derecho | ~88 px a 1366 (según `apply-progress/intro`) | 0 px en vivo en 1280, 1366, 1920 y 360 |
| Recordado | `localStorage` (para siempre) | `sessionStorage` (por pestaña) |
| Karma | 218/218 | 229/229 |
| Initial bundle | 496,88 kB / 120,16 kB transfer | 497,40 kB / 120,30 kB transfer |

## Tests y build

| Suite | Resultado |
|---|---|
| Backend `npm test` (`node --test`) | 10/10 en verde |
| Frontend Karma (ChromeHeadless 156) | 241/241 en verde |
| `ng build` | OK. Único warning: `css-inline-fonts` (el que ya existía, 2,13 kB sobre el presupuesto de 17 kB). Initial 499,98 kB / 120,82 kB transfer (bajo el presupuesto de 500 kB) |

La cobertura corrida coincide con `tests_agregados` de cada `apply-progress`. Las excepciones
declaradas (apariencia visual y audibilidad subjetiva, `C1`/`C2` de configuración) están
documentadas. Los dos defectos abiertos caen en la zona sin aserción automática: los tests de
CA3.1 miden el ángulo de la franja raíz, no el área que la hoja cubre en pantalla.

## Criterios de aceptación

| CA | Resultado | Evidencia |
|---|---|---|
| CA1 | Pasa | Test de la ruta: `ORDER BY id`, orden 1–4 |
| CA2 | Pasa | Test de `LandingComponent`: orden recibido y filtro que lo preserva |
| CA3 | Pasa | Test 2899/2900 ms. En Chrome, de montaje a desmontaje: 2843–2879 ms entrando por clic y 2873 ms por carga directa |
| CA3.1 | Pasa | Medido por descubrimiento, como dice la spec. Tests de la animación real en verde (cobertura por caja ≥ 1,2 s, perspectiva proporcional). En vivo, después de I18–I20: pase visible de 1332–1400 ms (~2,2 s por rotación) y fin a 25–138 ms de la salida de vista |
| CA3.2 | Pasa | Casa completa (`stroke-dashoffset` 0, sin `non-scaling-stroke`). Sin huecos ni tajadas desalineadas, y sombreado continuo sin escalones de tono (test de rampa continua + perfil de luminancia) |
| CA3.3 | Pasa | Tests: trazo animado solo en la capa plana (retardo ≥ 100 ms, fin ≤ 600 ms), traspaso en el mismo instante, selector `tapado` hasta el levante y cross-fade salteado al entrar a `/acceder`. Screencast: hoja a los 12–93 ms y casa a medio dibujar entre ~120 y ~410 ms según el viewport |
| CA6.1 | Pasa | Render offline del grafo actual (5 renders): pico 0,237–0,247, RMS −24,0 dBFS, efecto activo de 0 a 1,36 s, 0 señal después de 1,5 s. En vivo: pico 0,2476, RMS −23,7 dBFS |
| CA4 | Pasa | Tests de salto (clic, teclas, botón, ≤ 300 ms, marcada como vista) |
| CA5 | Pasa | Tests de servicio. En Chrome: `kuvu.intro.seen = "1"` en `sessionStorage`, `null` en `localStorage`; F5 y `/login → /acceder` no la muestran; pestaña nueva y contexto de navegador nuevo sí |
| CA6 | Pasa | Tests con API simulada y sin activación del usuario. Sin activación no se crea el `AudioContext` (test de I17). En Chrome, la carga directa corre la intro completa (2874 ms) sin errores de página; esta corrida no instrumenta el audio |
| CA7 | Pasa | Test. En Chrome con `prefers-reduced-motion: reduce`: sin intro, 0 `AudioContext`, selector interactivo |
| CA8 | Pasa | Botón nativo "Saltar introducción", 80×44 px en los 9 viewports, contraste ~14:1 |
| CA9 | Pasa | 360×640, 640×360, 390×844, 844×390, 768×1024, 1024×768, 1366×768, 1920×1080 (y 1280×720): sin scroll a 600, 1500 y 2300 ms; logo y casa adentro; logo de 140–320 px y ≤ 38,9 % del ancho; botón visible de 80×44 que no tapa logo ni casa; 0 px oscuros en el borde derecho en vivo |
| CA10 | Pasa | Ver la tabla de tests y build |

Requisitos sin CA directo:
- **R2.2.2:** pasa (98–104 ms entre la salida de vista y el fin).
- **R2.2.3:** pasa en la línea de tiempo (600 ms). El primer frame visible de la intro llega
  535–845 ms después del montaje (D9).
- **R6.2:** pasa. Sin activación previa no se crea el `AudioContext` (D10 cerrado).

## Mediciones de la corrida anterior (estado I9–I14)

Son las mediciones de la enmienda, antes de I15–I17. Las de **b** (pase visible) y **d** (costuras)
quedan reemplazadas por la sección "Corrida I15–I17"; el resto (duración, casa, sonido, movimiento
reducido, recordado y viewports) no cambia con I15–I17, que solo tocan la coreografía de la hoja, el
sombreado y la creación del contexto de audio.

Herramientas: los scripts de `scratchpad/diag2/` (fuera del repo). `probe2.js` maneja Chrome 155
headless por CDP con `--autoplay-policy=document-user-activation-required`. `instr2.js` instrumenta
`AudioContext`, muestrea por rAF la rotación de `.strip-root` y registra montaje y desmontaje.
`coverage2.py` calcula la cobertura de papel por frame. `audio_stats.py` y `summarize.js` hacen el
análisis. `graph.js` es `buildPageTurnGraph` transpilado del `.ts` actual. El bundle contiene las
mismas constantes (`3.16`, `Math.tanh`).

**a. Duración.** Clic real en "Ingresar" desde la home (navegación SPA). El montaje ocurre 72–116 ms
después del clic, y de montaje a desmontaje pasan 2869, 2864 (1366×768), 2843 (1920×1080) y
2879 ms (360×640). Por carga directa: 2873 ms.

**b. Pase visible.** Screencast de frames del compositor (`Page.startScreencast`) durante ~4,3 s
desde 0,4 s antes del montaje, a media resolución. La cobertura es la fracción de píxeles con
luminancia ≥ 120 y croma ≤ 40, que incluye papel sombreado y dorso. El fondo del selector da 0,4–3 %.

| Viewport | Primer frame de la intro | < 98 % (descubre) | ~0 (fuera de vista) | Pase por cobertura | Rotación rAF (levante → −90°) | Fuera de vista → desmontaje |
|---|---|---|---|---|---|---|
| 1366×768 (corrida 1) | 535 ms | 2273–2287 ms | 2837–2848 ms | ~0,57 s | ~630 → ~2750 ms | ~25–30 ms |
| 1366×768 (corrida 2) | 750 ms | 2291–2319 ms | 2714–2768 ms | ~0,45 s | 690 → 2735–2742 ms | ~100–150 ms |
| 1920×1080 | 845 ms | 2557–2617 ms | 2750–2836 ms | ~0,2 s | 755 → 2735–2747 ms | ~10–90 ms |
| 360×640 | 830 ms | 1567–1588 ms | ~2738–2750 ms | ~1,17 s | 688 → 2729–2736 ms | ~130 ms |

Por rotación, el giro es más lento al comienzo: entre 900 y 1440 ms va de −6° a −8°, y al final
gira a ~60°/s. La causa de la diferencia con la cobertura es geométrica: con `perspective: 2200px`
fija y el origen en el lomo, el borde libre se acerca a la cámara al girar. Su proyección
(`W·cosθ·p / (p − W·sinθ)`) sigue más allá del borde derecho hasta θ ≈ 63° con W = 1366 y hasta
θ ≈ 83° con W = 1920. En desktop, la mayor parte del giro se ve como una hoja que se inclina y se
oscurece sin descubrir nada, y el selector aparece en el último tramo. En las corridas hay huecos del
compositor de 80–140 ms (por ejemplo 2711 → 2828 ms a 1366 y 2750 → 2836 ms a 1920), justo en la
salida.

**c. Casa completa.** Con las animaciones pausadas a 600 ms (fin de la presentación) y en vivo:
casa completa a 1280×720 y 360×640, con `stroke-dashoffset: 0px` y `vector-effect: none` en los 9
viewports. Las capturas se revisan a ojo.

**d. Sin costuras.** Hojas de contacto con 16 frames del pase a 1366×768. La casa y el logo
cruzan los bordes de franja sin cortes ni desplazamientos, y no hay huecos al fondo. Desde ~1,1 s,
cada franja tiene un tono plano distinto, con escalones nítidos en los bordes. A 1920×1080 y
1500 ms, en y = 100, la luminancia es 246 | 237 | 225 | 222→216 | 210→206 en x = 319, 669, 1052,
1474: se ven 5 líneas verticales y la hoja se lee como 6 paneles. El design (§2) describe un
sombreado "que aumenta de forma continua", pero lo implementado es escalonado.

**e. Nivel del sonido.** Hay dos métodos, los dos sobre el grafo actual:
1. *En vivo.* `instr2.js` envuelve `AudioNode.prototype.connect`. Cuando un nodo se conecta al
   `AudioDestinationNode` real, conecta también ese nodo a un `ScriptProcessorNode` que copia las
   muestras que llegan al destino. Entrando por clic: contexto `running` desde el inicio
   (`hasBeenActive = true`), creado a ~1440 ms del montaje (timer de 1200 ms más el bloqueo del hilo
   principal) y cerrado a ~1,5 s de creado. Pico 0,2476 (−12,1 dBFS) y RMS −23,7 dBFS sobre 1,206 s
   de señal. El tap pierde los primeros ~150 ms del ataque, así que el RMS en vivo queda un poco
   alto. En una de las corridas (1366, corrida 2) el tap no capturó muestras, aunque el contexto
   estuvo `running`.
2. *Offline.* `buildPageTurnGraph` (código actual transpilado) renderizado en un
   `OfflineAudioContext` de 48 kHz dentro de la misma página, 5 veces: pico 0,237–0,247, RMS sobre
   la parte activa −24,0 dBFS, RMS sobre 1,4 s entre −24,1 y −24,2 dBFS, efecto activo de 0 a
   1,36 s y 0 señal después de 1,5 s.
Con carga directa de `/acceder`, el contexto se crea `suspended` (`hasBeenActive = false`), no
llega ninguna muestra al destino y se cierra al terminar. La intro corre completa en silencio, sin
excepciones ni rechazos sin capturar.

**f. Movimiento reducido emulado.** Desde la home, con clic en "Ingresar": la ruta es `/acceder`,
no hay montaje de intro ni `AudioContext` y el selector queda interactivo, sin errores.

**g. Recordado por sesión.** Después de la intro, `sessionStorage['kuvu.intro.seen'] = "1"` y
`localStorage` vale `null`. F5 no la muestra, y `/login → /acceder` (cargas completas en la misma
pestaña) tampoco. Una pestaña nueva del mismo perfil la muestra (`sessionStorage` vacío), y un
contexto de navegador nuevo también.

**h. Viewports CA9.** Ver CA9 arriba. En vivo, durante la presentación, la última franja termina en
1281,03 (1280), 1367 (1366), 1920,99 (1920) y 360,92 (360): 0 columnas oscuras en el borde
derecho. En la captura pausada exactamente a 600 ms a 1280×720 aparece una columna oscura de 1 px.
En vivo no aparece, así que es un artefacto de la pausa.

## Ejes del protocolo

- **Documentación declarada:** sí. `tasks` declara `docs/acceso-orden-e-intro.md`, la
  actualización de `docs/login-intro-transition.md`, `architecture_afectado: true` (menor, suma
  `page-turn-sound.service.ts` y el recordado por sesión), `changelog_afectado: true`,
  `readme_afectado: false` y `guidelines_afectado: false`.
- **Guidelines:** conformes. `DEVELOPMENT_GUIDELINES.md` es la plantilla (Go/Next.js/Astro) y no
  tiene sección de Angular. Se aplican sus reglas transversales: identificadores nuevos en inglés
  (`buildPageTurnGraph`, `INTRO_DURATION_MS`, `sheet-face`), APIs existentes en español preservadas
  (design §12), servicios en `services/` y componente standalone.
- **Logs:** conformes (`logs_conforme: sí` en los tres slices). El diff no agrega ningún `console.*`
  ni logger. El `console.error` del backend que ya existía queda como deuda transversal declarada.
- **Diff del working tree:** 13 archivos de código modificados (+659 / −187) y 2 nuevos
  (`app/intro-view-transition.ts` y su spec), 4 artifacts SDD modificados y `verify-report.md` sin
  trackear. Coincide con I9–I20. `architecture_afectado` sigue en `true` (menor): suma el hook de
  view transitions del router. Los `docs/*.xlsx` y `docs/*.docx` sin trackear no son parte del cambio.

## Desvíos

| # | Desvío | Severidad |
|---|---|---|
| D1–D4, D6 | Corregidos por la enmienda (ver la tabla antes/después) | Cerrados |
| D5 | Silencio sin gesto previo: lo resuelve la decisión de recordado por sesión y de silencio en carga directa | Cerrado por decisión |
| D7 | Cerrado por I15: perspectiva `max(2200px, 500vw)`, levante a −12°, easing `cubic-bezier(.3,0,.8,1)` hasta −91° a 2880 ms. Pase visible de 1,34–1,40 s en vivo en 360/1366/1920 | Cerrado |
| D8 | Cerrado por I16: rampa de sombra continua repartida entre las franjas | Cerrado |
| D9 | Cerrado por I18–I20: capa plana para la presentación, selector sin renderizar hasta el levante y sin cross-fade del router al entrar a la intro. Residual: ~250–300 ms sin cuadros al levante (headless) | Cerrado |
| D10 | Cerrado por I17: sin activación previa no se crea el `AudioContext` | Cerrado |

## Requiere decisión

Nada bloqueante. R2.2.1 / CA3.1 ya miden por descubrimiento (decisión del usuario).
- **Presupuesto:** el bundle inicial queda a 20 bytes del warning de 500 kB. El próximo cambio que sume
  código al bundle inicial lo va a disparar.
