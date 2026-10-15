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
  pasan entre 1,8 s y 2,2 s.
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

- **R5.1** Cuando la intro termina o se salta, el navegador recuerda que se vio.
- **R5.2** Con la intro ya vista, `/acceder` muestra el selector directamente, también tras
  recargar (F5), cerrar y reabrir el navegador o navegar `/login → /acceder`.
- **R5.3** Si el almacenamiento del navegador no está disponible (modo privado restringido,
  bloqueado), la intro se muestra a lo sumo una vez por carga de la app y la página no falla.

### R6 — Sonido

- **R6.1** Junto con el pase de la hoja suena un efecto sutil de hoja que pasa, de ≤ 1,5 s y a
  volumen bajo (pico ≤ 30 % de la escala completa).
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
| CA3 | En una primera visita la intro emite su fin entre 1,8 s y 2,2 s y el selector queda visible (test con reloj simulado + prueba manual). |
| CA4 | Clic, tap, Escape, Enter, Espacio y el botón saltan la intro; el selector aparece en ≤ 300 ms y la intro queda marcada como vista (tests). |
| CA5 | Tras ver o saltar la intro, recargar muestra el selector directo; con el almacenamiento lanzando excepción la página carga igual (tests de servicio). |
| CA6 | Con el audio rechazado o ausente, la intro termina igual y no hay errores no capturados (test con API de audio simulada). |
| CA7 | Con reduced-motion simulado no se renderiza la intro ni se intenta reproducir audio (test). |
| CA8 | Botón: rol `button`, nombre "Saltar introducción", enfocable, ≥ 44×44 px, contraste ≥ 4,5:1 (test + inspección). |
| CA9 | Revisión visual en los 6 viewports de referencia: sin scroll, sin recortes, botón visible (manual, en `verify`). |
| CA10 | Suite frontend (Karma) y backend (`node --test`) en verde; `ng build` sin errores nuevos. |

## No-objetivos y edge cases excluidos

- Sin controles de mute o volumen; el sonido respeta el volumen del sistema.
- No hay forma en la UI de "volver a ver" la intro; para repetirla hay que borrar los datos del
  sitio en el navegador.
- El recordado es por navegador y dispositivo, no por usuario ni sincronizado entre dispositivos.
- Las empresas inactivas siguen sin aparecer; no hay orden configurable.
- Sin cambios en `/login`, en `POST /api/auth/login` ni en el theming por empresa.
- No se garantiza que el sonido se escuche en la primera visita: depende de la política de autoplay
  de cada navegador (R6.2).
