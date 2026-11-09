# spec — acceso-orden-e-intro

Breakpoints de referencia: **móvil** < 768 px, **tablet** 768–1023 px, **desktop** ≥ 1024 px.
Viewports mínimos de verificación: 360×640, 390×844, 768×1024, 1024×768, 1366×768, 1920×1080.

## Requisitos funcionales

### R1 — Orden de empresas por id

- **R1.1** `GET /api/empresas` devuelve las empresas activas ordenadas por `id` ascendente.
- **R1.2** El selector `/acceder` muestra las empresas en el orden recibido.
- **R1.3** Al filtrar con el buscador, los resultados conservan el orden por `id`.
- **R1.4** `GET /api/empresas/:id` y el resto de las rutas no cambian su comportamiento.

### R2 — Intro "hoja que pasa"

- **R2.1** En la primera visita a `/acceder` (sin intro vista y sin movimiento reducido), se muestra
  una hoja a pantalla completa con el logo KUVU y una casa dibujada en trazo fino; la hoja se curva
  como una página de libro, con sombra suave, y al pasar revela el selector.
- **R2.2** Duración: desde que la intro aparece hasta que el selector queda visible e interactivo
  pasan entre 2,8 s y 3,2 s.
- **R2.2.1** Pase visible: desde que el selector empieza a descubrirse bajo la hoja hasta que la hoja
  sale por completo de la vista pasan al menos 1,2 s, en todos los viewports. El giro es más lento al comienzo del tramo visible que al final.
- **R2.2.2** Sin tiempo muerto: el selector queda interactivo a lo sumo 250 ms después de que la hoja
  sale de la vista.
- **R2.2.3** Presentación: la hoja empieza a levantarse a lo sumo 1 s después de que aparece la
  intro.
- **R2.5** La casa se ve dibujada completa al terminar la presentación, en todos los breakpoints.
- **R2.5.1** El trazo de la casa se ve dibujarse: la hoja aparece en pantalla antes de que el trazo
  empiece, sin que la página anterior quede a la vista durante la presentación.
- **R2.6** La hoja se ve como una sola superficie: sin costuras visibles ni tajadas del dibujo
  desalineadas entre las franjas que la componen.
- **R2.3** La intro no contiene la animación de ensamblaje de la casa 3D (piezas, blueprint,
  partículas).
- **R2.4** Al terminar, el foco del teclado queda en el buscador del selector.

### R3 — Salto de la intro

- **R3.1** Durante la intro, un clic o tap en cualquier punto la salta.
- **R3.2** Durante la intro, Escape, Enter o Espacio la saltan.
- **R3.3** Un botón "Saltar" visible la salta.
- **R3.4** Al saltar, el selector queda visible e interactivo en ≤ 300 ms, el sonido en curso se
  detiene y el foco queda en el buscador.
- **R3.5** Saltarla cuenta como intro vista (R5).
- **R3.6** La interacción que salta la intro no selecciona una empresa ni dispara otra acción del
  selector.

### R4 — Responsive

- **R4.1** En los tres breakpoints la hoja cubre todo el viewport, sin barras de scroll ni
  recortes del logo y la casa, en orientación vertical y horizontal.
- **R4.2** El logo y la casa escalan con el viewport y quedan centrados; el logo nunca es más
  angosto que 140 px ni más ancho que el 60 % del viewport.
- **R4.3** El botón "Saltar" queda dentro del área visible y segura (respeta notch / safe-area en
  móvil) y no tapa el logo.
- **R4.4** Ningún breakpoint cambia la duración ni las formas de saltar la intro.

### R5 — Recordado persistente

- **R5.1** Cuando la intro termina o se salta, la sesión de la pestaña recuerda que se vio.
- **R5.2** Con la intro ya vista en la sesión, `/acceder` muestra el selector directamente, también
  tras recargar (F5) o navegar `/login → /acceder`. En una sesión nueva (pestaña nueva, o cerrar y
  reabrir el navegador) la intro se muestra otra vez.
- **R5.3** Si el almacenamiento del navegador no está disponible (modo privado restringido,
  bloqueado), la intro se muestra a lo sumo una vez por carga de la app y la página no falla.

### R6 — Sonido

- **R6.1** Junto con el pase de la hoja suena un efecto sutil de hoja que pasa, de ≤ 1,5 s y a
  volumen bajo pero audible: la señal de salida tiene un pico de muestra ≤ 0,3 (−10,5 dBFS) y un RMS
  ≥ −27 dBFS durante el efecto. Ambos se miden sobre la señal de salida real, no sobre la ganancia
  de la envolvente.
- **R6.2** Si el navegador bloquea el audio (política de autoplay sin interacción previa, API no
  disponible), la intro corre completa en silencio, sin errores no capturados en consola ni avisos
  al usuario.
- **R6.3** El sonido nunca suena fuera de la intro ni se repite.
- **R6.4** El sonido no agrega dependencias nuevas ni más de 30 kB a la descarga inicial.

### R7 — Movimiento reducido

- **R7.1** Con `prefers-reduced-motion: reduce`, `/acceder` muestra el selector directamente, sin
  intro, sin fundido y sin sonido.

### R8 — Accesibilidad del botón "Saltar"

- **R8.1** Es un elemento `button` nativo, enfocable con Tab, con nombre accesible
  "Saltar introducción".
- **R8.2** Tiene foco visible y un contraste de texto ≥ 4,5:1 contra su fondo.
- **R8.3** Su área táctil mide al menos 44×44 px.
- **R8.4** Las capas decorativas de la intro (hoja, dibujo, sombra) quedan ocultas a lectores de
  pantalla; el botón no.

## Criterios de aceptación

| # | Verificación |
|---|---|
| CA1 | Con el seed actual, `GET /api/empresas` responde `[Amarilo(1), Nido Rent(2), Balcones de San Soucci(3), Mi Inmueble(4)]` (test backend). |
| CA2 | El selector renderiza los nombres en ese orden; filtrando "i" el orden relativo se mantiene (test de `LandingComponent`). |
| CA3 | En una primera visita la intro emite su fin entre 2,8 s y 3,2 s y el selector queda visible (test con reloj simulado + prueba manual). |
| CA3.1 | La animación CSS real de la hoja cumple R2.2.1–R2.2.3 medida por lo que se ve: empieza a levantarse a ≤ 1 s; desde que el selector empieza a descubrirse (la hoja deja de cubrir el 98 % del ancho) hasta que la hoja sale por completo de la vista (cubre ≤ 2 %) pasan ≥ 1,2 s, y la intro cierra ≤ 250 ms después (test sobre la caja de la hoja con la animación real + medición en Chrome en los viewports de CA9). |
| CA3.2 | La casa se dibuja completa a 1280 y 360 px de ancho, y la hoja no muestra costuras (test del estilo de trazo + capturas en `verify`). |
| CA3.3 | Entrando por "Ingresar" desde la home, el primer cuadro de la hoja llega antes de que empiece el trazo de la casa y hay cuadros con la casa a medio dibujar (tests de la presentación y del cross-fade + screencast en `verify`). |
| CA6.1 | El render offline del efecto da pico de muestra ≤ 0,3, RMS ≥ −27 dBFS y duración ≤ 1,5 s (test con `OfflineAudioContext`). |
| CA4 | Clic, tap, Escape, Enter, Espacio y el botón saltan la intro; el selector aparece en ≤ 300 ms y la intro queda marcada como vista (tests). |
| CA5 | Tras ver o saltar la intro, recargar en la misma sesión muestra el selector directo; el recordado vive en `sessionStorage`; con el almacenamiento lanzando excepción la página carga igual (tests de servicio). |
| CA6 | Con el audio rechazado o ausente, la intro termina igual y no hay errores no capturados (test con API de audio simulada). |
| CA7 | Con reduced-motion simulado no se renderiza la intro ni se intenta reproducir audio (test). |
| CA8 | Botón: rol `button`, nombre "Saltar introducción", enfocable, ≥ 44×44 px, contraste ≥ 4,5:1 (test + inspección). |
| CA9 | Revisión visual en los 6 viewports de referencia: sin scroll, sin recortes, botón visible (manual, en `verify`). |
| CA10 | Suite frontend (Karma) y backend (`node --test`) en verde; `ng build` sin errores nuevos. |

## No-objetivos y edge cases excluidos

- Sin controles de mute o volumen; el sonido respeta el volumen del sistema.
- No hay forma en la UI ni por URL de "volver a ver" la intro dentro de la misma sesión; se repite
  al abrir una sesión nueva.
- El recordado es por sesión de pestaña, no por usuario ni sincronizado entre dispositivos.
- Las empresas inactivas siguen sin aparecer; no hay orden configurable.
- Sin cambios en `/login`, en `POST /api/auth/login` ni en el theming por empresa.
- No se garantiza que el sonido se escuche en la primera visita: depende de la política de autoplay
  de cada navegador (R6.2).
