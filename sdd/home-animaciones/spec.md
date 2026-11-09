# spec — home-animaciones

Fuente: `sdd/home-animaciones/propose.md` (alcance 1–5) y las decisiones de clarify en
`sdd/home-animaciones/explore.md`. Describe **qué** hace el sitio público; el **cómo** (nombres de
directivas, variables CSS, estructura de archivos) queda para `design`.

## Definiciones

- **Movimiento reducido:** el navegador informa `prefers-reduced-motion: reduce`.
- **Puntero fino:** el dispositivo cumple `(hover: hover) and (pointer: fine)` (mouse o trackpad).
  Un dispositivo táctil o un lápiz sin hover no lo cumple.
- **Sitio público:** `/`, `/servicios`, `/nosotros`, `/preguntas-frecuentes`, `/contacto`,
  `/legal` y la página 404. No incluye `/acceder`, `/login` ni las rutas autenticadas.
- **Efecto ligado al scroll:** un estado visual que depende de la posición de scroll y avanza o
  retrocede con ella (barra de progreso, parallax, recorrido de pasos, texto por palabra).
- **Desktop:** viewport de 1024 px de ancho o más (`width >= 1024px`), el breakpoint `lg` que el
  proyecto ya usa en sus estilos. **Mobile/tablet:** por debajo de 1024 px. Es el mismo corte para
  todos los requisitos que lo mencionan.

## Decisiones confirmadas por el usuario

| # | Decisión |
|---|---|
| 1 | La banda de compañías tiene un botón visible de pausa y reanudación (RF-08), además de pausarse con hover y foco |
| 2 | El bundle inicial crece como máximo 15 kB respecto de la base (≤ 439,5 kB) (RNF-02) |
| 3 | La barra de progreso existe solo en la home (RF-03, RF-12) |
| 4 | El parallax del hero y de la banda de equipo existe solo en desktop (≥ 1024 px) y nunca con movimiento reducido (RF-04, RF-09) |

## Requisitos funcionales

### RF-01 — Lenguaje de movimiento común

El sitio público usa un único conjunto de curvas de easing, duraciones y distancias de
desplazamiento. La home, el header, el footer y la transición entre páginas toman sus valores de
ese conjunto y no definen valores propios sueltos.

- **Given** cualquier animación nueva del cambio, **when** se revisa su definición, **then** usa
  un valor del conjunto común.

### RF-02 — Scroll suave nativo para anclas

Un enlace interno a un ancla de la misma página desplaza con scroll suave nativo del navegador. No
hay suavizado de scroll por JavaScript ni intercepción de la rueda, el touchpad o el teclado.

- **Given** movimiento reducido, **when** se sigue un ancla, **then** el salto es instantáneo.
- **Given** cualquier configuración, **when** se usa la rueda o el teclado, **then** el scroll
  responde igual que sin el cambio.
- El ancla queda visible debajo del header fijo (se conserva el offset de scroll existente).

### RF-03 — Barra de progreso de scroll

La home, y solo la home, muestra una barra fina, del color de marca, fija en el borde superior de la ventana, cuyo
largo representa la fracción de la página ya recorrida (0 arriba de todo, completa al final).

- **Given** la home en la parte superior, **then** la barra está vacía.
- **When** el usuario baja hasta el final, **then** la barra está completa; al subir, retrocede.
- La barra es decorativa: no recibe foco, no intercepta clics y los lectores de pantalla la
  ignoran.
- **Given** movimiento reducido, **then** la barra sigue indicando el progreso, sin transición
  animada entre estados.

### RF-04 — Hero con más protagonismo

- **Entrada del título:** al cargar la home, el h1 del hero aparece palabra por palabra en orden
  de lectura. El resto del hero (subtítulo y CTAs) entra después del título. La entrada completa
  dura como máximo 1,5 s.
- **Indicador de scroll:** el hero muestra un indicador animado que invita a bajar. Desaparece o
  se atenúa cuando el usuario empieza a scrollear. Es decorativo (oculto a lectores de pantalla,
  sin foco).
- **Salida con parallax (solo desktop):** en desktop, mientras el hero sale de la vista, su
  contenido se desplaza y se desvanece levemente a una velocidad distinta del scroll. Al volver
  arriba, el hero recupera su estado inicial. Por debajo de 1024 px el hero no tiene parallax y su
  contenido acompaña el scroll normalmente.
- El h1 es una sola unidad para lectores de pantalla: se anuncia como el texto completo, no
  palabra por palabra.
- **Given** movimiento reducido, **then** el título, el subtítulo y los CTAs son visibles al
  cargar, sin entrada escalonada, sin indicador animado y sin parallax.

### RF-05 — Apariciones expresivas de secciones

Las secciones de la home y sus elementos marcados aparecen al entrar en la vista con más
recorrido y mejor easing que el fade actual, una sola vez por carga.

- Hay al menos dos variantes: **fade-up** para bloques de texto y filas, y **apertura con
  clip-path redondeado** para la imagen de la banda de equipo.
- Un elemento que ya está en la vista al cargar la página aparece sin esperar al scroll.
- **Given** movimiento reducido, **then** todos los elementos son visibles desde el inicio, sin
  desplazamiento ni recorte.
- **Given** que el navegador no soporta `IntersectionObserver` o el JS falla, **then** el
  contenido queda visible (nunca oculto de forma permanente).

### RF-06 — "¿Qué es KUVU?": texto que se enciende por palabra

El párrafo principal de la sección 01 empieza atenuado y sus palabras pasan a opacidad completa
en orden de lectura a medida que la sección avanza por la vista. Al subir, se vuelven a atenuar.

- El texto atenuado mantiene contraste suficiente para leerse (no baja de 3:1 sobre su fondo).
- El texto es idéntico al del contenido actual y se anuncia como un párrafo continuo.
- **Given** movimiento reducido, **then** el párrafo está a opacidad completa todo el tiempo.

### RF-07 — "¿Cómo funciona?" como recorrido

- **Desktop:** la sección queda fija mientras el usuario recorre los 4 pasos. Una línea de
  progreso se llena según el avance y el paso correspondiente queda resaltado como activo; los
  demás se ven atenuados pero legibles. Al terminar el último paso, el scroll continúa con la
  sección siguiente.
- **Mobile:** los 4 pasos se muestran como lista vertical sin fijación; cada paso aparece con la
  variante fade-up (RF-05).
- El paso activo se expone a tecnologías de asistencia (por ejemplo, como paso actual).
- Los 4 pasos están en el DOM y son legibles por lectores de pantalla en cualquier posición de
  scroll; ninguno se oculta con `aria-hidden` ni `display: none`.
- **Given** movimiento reducido, **then** la sección se muestra como lista estática con los 4
  pasos visibles, sin fijación, sin línea animada y sin paso resaltado.
- Los textos de los pasos no cambian.

### RF-08 — "Compañías que confían" como banda infinita

- La lista de compañías se desplaza horizontalmente en bucle continuo y lento, sin saltos
  visibles en el punto de reinicio.
- La banda se pausa mientras el puntero está sobre ella y mientras cualquier elemento dentro de
  ella tiene foco.
- La banda tiene un control visible y operable con teclado para pausarla y reanudarla, con nombre
  accesible que refleja el estado (pausar/reanudar).
- Los lectores de pantalla leen cada compañía **una sola vez**: las copias que existen solo para
  el bucle quedan ocultas a tecnologías de asistencia y fuera del orden de foco.
- La banda no anima mientras está fuera de la vista.
- **Given** movimiento reducido, **then** la banda es estática, muestra la lista sin duplicados
  visibles y todas las compañías son legibles (con ajuste de línea o scroll horizontal manual si
  no entran).

### RF-09 — Banda de equipo con parallax

En desktop, la imagen de la banda de equipo se desplaza levemente (del orden de ±12 px, valor
final en `design`) en sentido opuesto al scroll mientras la banda está en la vista, además de su
apertura con clip-path (RF-05).

- El desplazamiento nunca deja ver bordes vacíos de la imagen.
- Por debajo de 1024 px la imagen no tiene parallax (conserva la apertura con clip-path).
- Si el viewport cruza el breakpoint (rotación, cambio de tamaño), el parallax se activa o se
  desactiva sin recargar y la imagen vuelve a su posición neutra al desactivarse.
- **Given** movimiento reducido, **then** la imagen está quieta y sin recorte.

### RF-10 — Botones que siguen al puntero

Los CTAs principales de la home (hero y CTA final) se desplazan levemente hacia el puntero cuando
este está encima y vuelven a su lugar al salir.

- El desplazamiento máximo es acotado (valor en `design`, del orden de pocos píxeles) y nunca
  saca el área clicable de debajo del puntero.
- **Given** un dispositivo sin puntero fino (táctil), **then** el efecto no se activa: no hay
  desplazamiento ni listeners de puntero activos para él.
- **Given** movimiento reducido, **then** el efecto no se activa, aunque haya puntero fino.
- El efecto no altera el foco, el clic, el anillo de foco ni la navegación con teclado.

### RF-11 — Elevación en hover de filas y tarjetas

Las filas de servicios y las tarjetas de la home se elevan levemente con sombra en hover y en
foco visible (`:focus-visible` o `:focus-within`), con el mismo comportamiento que la utilidad de
elevación existente en `/servicios`.

- **Given** un dispositivo sin hover, **then** no queda un estado elevado "pegado" tras tocar.
- **Given** movimiento reducido, **then** el cambio de estado es instantáneo (sin desplazamiento
  animado); la indicación de foco se mantiene.

### RF-12 — Header y footer coherentes con el lenguaje común

- El paso del header a su estado compacto, la apertura y cierre del menú móvil, los enlaces y el
  CTA del footer usan el lenguaje común (RF-01).
- El header conserva su comportamiento: sticky, compactación tras el umbral de scroll, subrayado
  del ítem activo y menú móvil a pantalla completa con foco gestionado.
- La barra de progreso (RF-03) existe solo en la home: el header de las páginas internas no la
  muestra.
- **Given** movimiento reducido, **then** header y footer cambian de estado sin animación.

### RF-13 — Transición propia entre páginas del sitio público

Al navegar entre dos rutas del sitio público, la transición deja el header quieto en su lugar y
anima solo el contenido (por ejemplo, desplazamiento corto más fundido), en lugar del cross-fade
genérico de página completa.

- Aplica en navegación hacia adelante y hacia atrás (botón atrás del navegador).
- **Given** un navegador sin View Transitions API, **then** la navegación ocurre sin transición y
  sin errores.
- **Given** movimiento reducido, **then** la navegación ocurre sin animación.
- El foco y el anuncio de cambio de página se comportan igual que sin la transición.

### RF-14 — No-regresión de la intro de `/acceder`

- Navegar desde cualquier página pública hacia `/acceder` sigue salteando la transición de vista:
  la intro "hoja que pasa" arranca sin cross-fade ni la transición nueva de RF-13 superpuesta.
- La intro se ve y se comporta igual que en la base (`3e48726`), incluido su modo de movimiento
  reducido y su salida hacia el formulario.
- Los tests existentes de la intro y de `intro-view-transition` pasan sin modificar su
  expectativa.

### RF-15 — No-regresión de `/login` y la app autenticada

- `/login`, el dashboard y los módulos autenticados no reciben la barra de progreso, el scroll
  suave, los efectos de puntero, las apariciones nuevas ni la transición de RF-13.
- Navegar entre rutas autenticadas, o del sitio público hacia `/login`, se comporta igual que en
  la base.
- Los tests existentes de esas áreas pasan sin cambios en sus expectativas.

### RF-16 — Contenido intacto

Todos los textos de la home, header y footer son exactamente los de `src/app/content/*`; los tests
de contenido existentes pasan sin cambios. No se agregan imágenes, videos, fuentes ni assets.

## Requisitos no funcionales

### RNF-01 — Sin dependencias nuevas

`package.json` no suma dependencias de runtime ni de desarrollo. Sin GSAP, Lenis, Motion,
three.js ni equivalentes.

### RNF-02 — Presupuestos de build

- El build de producción (`ng build`) termina **sin warnings ni errores de presupuesto**.
- Los estilos compilados de `home.component.scss` no superan su tamaño actual (~16,8 kB) y quedan
  bajo el warning de 17 kB de `anyComponentStyle`. Todo componente nuevo también queda bajo 17 kB.
- El bundle inicial queda bajo el warning de 500 kB y crece como máximo 15 kB respecto de la base
  (424,49 kB → ≤ 439,5 kB raw).

### RNF-03 — Rendimiento

- Las animaciones y efectos ligados al scroll modifican solo `transform`, `opacity` y `clip-path`
  (y variables CSS que se traducen en esas propiedades); no animan propiedades de layout.
- Todos los listeners de scroll y puntero son pasivos y la lectura del scroll se agrupa en como
  máximo una actualización por frame.
- Los efectos de una sección no se calculan mientras está fuera de la vista.
- Al salir de la home, todos los listeners, observers y frames pendientes que creó el cambio se
  liberan (sin fugas al navegar).
- El cambio no introduce desplazamiento de layout visible al cargar la home (CLS del hero no
  empeora respecto de la base).

### RNF-04 — Accesibilidad

- **Movimiento reducido:** con `prefers-reduced-motion: reduce`, no queda ningún movimiento
  automático, ligado al scroll ni al puntero en el sitio público, y todo el contenido es visible
  y completo desde el primer render.
- **Contenido nunca oculto para lectores de pantalla:** ningún texto queda con `aria-hidden`,
  `visibility: hidden` o `display: none` por estar "pendiente de animar". Un texto partido en
  palabras para animar se anuncia como el texto original continuo. Solo se ocultan a tecnologías
  de asistencia los elementos puramente decorativos (barra de progreso, indicador de scroll,
  copias del bucle de la banda).
- **Foco:** todo elemento interactivo conserva un anillo de foco visible durante y después de
  cualquier animación; ninguna animación lo recorta ni lo tapa. El orden de tabulación no cambia
  respecto de la base, salvo la incorporación del control de pausa de la banda (RF-08).
- **Pausable:** todo movimiento continuo que dure más de 5 s (la banda de compañías, el indicador
  de scroll si es continuo) se puede pausar.
- **Sin flashes:** ningún efecto parpadea más de 3 veces por segundo.

### RNF-05 — Robustez

Si el JS del movimiento falla o una API no está disponible (`IntersectionObserver`, View
Transitions, `matchMedia`), la página es legible, navegable y con todo el contenido visible.

## Criterios de aceptación

Cada criterio es verificable con un test automatizado (Karma) o con una comprobación manual
indicada. `verify` los recorre uno por uno.

| # | Criterio | Cubre | Verificación |
|---|---|---|---|
| CA-01 | Las animaciones nuevas toman easing/duración/distancia del conjunto común | RF-01, RF-12 | Revisión de código |
| CA-02 | `html` tiene scroll suave y pasa a `auto` con movimiento reducido | RF-02 | Test de estilos o manual con emulación de reduced motion |
| CA-03 | La barra de progreso existe solo en la home, refleja 0 arriba y completo al final, y es `aria-hidden` sin foco | RF-03 | Test unitario (progreso simulado) + manual |
| CA-04 | El h1 del hero se anuncia como texto completo (nombre accesible = texto de contenido) aunque esté partido en palabras | RF-04, RNF-04 | Test unitario |
| CA-04b | El parallax del hero solo se activa con viewport ≥ 1024 px y sin movimiento reducido; por debajo de 1024 px o con reduced motion el contenido del hero no recibe desplazamiento ligado al scroll | RF-04 | Test unitario con `matchMedia` simulado + manual en ambos anchos |
| CA-05 | Con movimiento reducido, hero, título, CTAs y todos los `data-reveal` son visibles en el primer render | RF-04, RF-05, RNF-04 | Test unitario con `matchMedia` simulado |
| CA-06 | Sin `IntersectionObserver`, los elementos con aparición quedan visibles | RF-05, RNF-05 | Test unitario |
| CA-07 | El párrafo de "¿Qué es KUVU?" conserva el texto exacto y se anuncia continuo; con reduced motion está a opacidad completa | RF-06 | Test unitario |
| CA-08 | Los 4 pasos de "¿Cómo funciona?" están en el DOM y accesibles en toda posición; el activo se marca para tecnologías de asistencia; con reduced motion no hay paso activo ni fijación | RF-07 | Test unitario + manual en desktop y mobile |
| CA-09 | Cada compañía se expone una sola vez a lectores de pantalla; las copias del bucle son `aria-hidden` y no enfocables | RF-08 | Test unitario |
| CA-10 | El control de pausa de la banda alterna el estado y su nombre accesible; la banda se pausa con hover y foco | RF-08 | Test unitario + manual |
| CA-11 | Con reduced motion la banda es estática y sin duplicados visibles | RF-08 | Test unitario |
| CA-12 | La imagen de la banda de equipo no muestra bordes vacíos en el rango de parallax; con reduced motion está quieta | RF-09 | Manual |
| CA-12b | El parallax de la banda de equipo solo se activa con viewport ≥ 1024 px y sin movimiento reducido; al cruzar el breakpoint se activa o desactiva sin recargar | RF-09 | Test unitario con `matchMedia` simulado (incluido evento de cambio) + manual |
| CA-13 | Con puntero no fino o con reduced motion, los CTAs no se desplazan ni registran listeners de puntero | RF-10 | Test unitario con `matchMedia` simulado |
| CA-14 | El desplazamiento magnético está acotado y no rompe clic ni foco | RF-10 | Test unitario + manual |
| CA-15 | Filas y tarjetas se elevan en hover y foco visible; sin animación con reduced motion | RF-11 | Manual |
| CA-16 | Header: sticky, compactación, subrayado activo y menú móvil con foco gestionado siguen funcionando | RF-12 | Tests existentes del header en verde + manual |
| CA-17 | Entre dos rutas públicas, el header no participa de la animación y el contenido sí; sin View Transitions la navegación no falla | RF-13 | Test unitario del hook de transición + manual |
| CA-18 | Público → `/acceder` sigue salteando la transición; tests de intro e `intro-view-transition` en verde sin cambiar expectativas | RF-14 | Tests existentes + test nuevo del salteo + manual |
| CA-19 | `/login` y rutas autenticadas no reciben ninguno de los efectos ni la transición nueva; sus tests en verde | RF-15 | Tests existentes + test del hook + manual |
| CA-20 | Tests de contenido existentes en verde sin cambios; no hay assets nuevos | RF-16 | Suite de tests + `git diff --stat` |
| CA-21 | `package.json` y `package-lock.json` sin dependencias nuevas | RNF-01 | `git diff` |
| CA-22 | `ng build` sin warnings de presupuesto; `home.component.scss` ≤ tamaño base y < 17 kB; bundle inicial ≤ 439,5 kB | RNF-02 | Salida de `ng build` |
| CA-23 | Al destruir la home no quedan listeners, observers ni frames activos del cambio | RNF-03 | Test unitario (destroy) |
| CA-24 | Solo se animan `transform`, `opacity` y `clip-path`; listeners pasivos; una actualización por frame | RNF-03 | Revisión de código |
| CA-25 | Con reduced motion no queda ningún movimiento en el sitio público | RNF-04 | Manual con emulación de reduced motion en DevTools |
| CA-26 | El anillo de foco es visible en todos los interactivos de home, header y footer durante y después de las animaciones; orden de tabulación igual a la base más el control de pausa | RNF-04 | Manual con teclado |
| CA-27 | La suite completa de frontend (`ng test`) pasa en verde | Todos | Suite |

## No-objetivos y edge cases excluidos

- Librerías de animación o scroll, suavizado por JS y secuestro de la rueda.
- Cambios de textos, branding, paleta, tipografía o assets; WebGL, canvas o video.
- Animaciones propias en las páginas internas, más allá de la transición entre rutas y lo heredado
  de header y footer.
- Cualquier cambio en la intro de `/acceder`, `/login` o la app autenticada.
- Reproducción de elementos propios de los sitios de referencia (rueda de universos, cursor
  custom, terminal tipeada, ilustraciones).
- Personalizar la transición según la dirección de navegación (adelante y atrás animan igual).
- Navegadores sin soporte de View Transitions: navegan sin transición (degradación aceptada, no
  se agrega un polyfill).
- Afinado visual de duraciones y distancias más allá de los rangos de esta spec: se decide en
  `design` y en la revisión manual.
- Métricas de rendimiento con herramientas de laboratorio (Lighthouse) como gate: el control es
  el presupuesto de build y la revisión de propiedades animadas.

## Limitaciones conocidas

- Las duraciones y easings de las referencias salen del código fuente leído, no de observarlas en
  un navegador; la sensación final se valida en la revisión manual de `verify`.
- Karma corre en ChromeHeadless sin scroll real de usuario: los efectos ligados al scroll se
  prueban simulando el progreso o el observer; la verificación visual es manual.
