# Spec — ajustes-hover-movil-y-textura

Referencia: `propose.md`.

## Requisitos funcionales

**RF-1 — Feedback al tocar.** Con el menú hamburguesa abierto, mientras una opción está
presionada (`:active`) muestra el mismo estado que con hover o foco: texto en color de marca,
tinte, subrayado bajo el texto y, con movimiento permitido, el subrayado crece y la opción se
desplaza.

**RF-2 — Pausa de cierre.** Given el menú abierto, when el usuario elige una opción, then la
navegación ocurre como hoy, la opción elegida conserva el estado de "elegida" y el panel se
cierra tras una pausa breve (≤ 400 ms). La pausa aplica también con movimiento reducido (el
cambio de color y subrayado se ve, sin animación). Cerrar con Escape o con el botón sigue
siendo inmediato. Un `NavigationEnd` durante la pausa no corta el cierre programado.

**RF-3 — En todo ancho del menú.** RF-1 y RF-2 aplican en cualquier ancho donde existe el
menú hamburguesa (< 1024 px), con puntero o táctil.

**RF-4 — Textura de la app interna.** El fondo de la columna principal de la app interna
(todas las pantallas, ambos roles) muestra un grano perceptible y un degradado suave del color
de la empresa activa. Tarjetas, tablas y modales siguen con fondo liso. El fondo medio se
mantiene cercano a `--color-bg` (sin oscurecer el texto que va directo sobre él).

**RF-5 — Feedback en el sidebar de la app interna.** En el sidebar (`<app-layout>`, ambos
roles), cada enlace de navegación en hover, `:focus-visible`, `:active` o recién elegido
muestra: texto en un acento del color de la empresa legible sobre el fondo oscuro (≥ 4.5 : 1),
tinte del color de la empresa, subrayado bajo la etiqueta (cuando hay texto) y, con movimiento
permitido, el subrayado crece y el enlace se desplaza. El ítem activo conserva su barra y
negrita. Con movimiento reducido, el cambio de color, tinte y subrayado se ve sin animación.

**RF-6 — Pausa del drawer móvil.** En el drawer móvil (< 768 px), elegir un enlace navega al
instante, marca el enlace como elegido y cierra el drawer tras la misma pausa del menú
público; un `NavigationEnd` durante la pausa no lo corta. En escritorio no hay pausa (el
sidebar no se cierra).

## Criterios de aceptación
- CA-1: las reglas de `:active` y de la opción elegida aplican color, tinte y subrayado fuera
  del bloque de movimiento; desplazamiento y transición, solo con `no-preference`.
- CA-2: al hacer clic en una opción el panel sigue abierto, la opción tiene la marca de
  "elegida" y el panel se cierra al vencer la pausa; Escape cierra al instante.
- CA-3: un `NavigationEnd` durante la pausa no cierra antes de tiempo y el cierre final libera
  el bloqueo de scroll.
- CA-4: `.main-content` dentro de `<app-layout>` tiene tres capas de fondo: degradado de
  empresa, grano y `--color-bg`; sin velo opaco encima del grano.
- CA-5: el grano tiene media de oscurecimiento baja (≤ 6 %) y picos visibles; comprobado en
  una captura en navegador.
- CA-6: suite y build en verde.
- CA-7: un enlace del sidebar marcado como elegido tiene color distinto al de reposo,
  subrayado completo en su etiqueta y tinte; reglas fuera del bloque de movimiento (CSS
  compilado).
- CA-8: el acento de texto mezcla el color de la empresa con blanco (30 % / 70 %), así su
  contraste sobre `#133937` es ≥ 4.5 : 1 para cualquier color de empresa.
- CA-9: en móvil, elegir un enlace deja el drawer abierto con el enlace marcado hasta que vence
  la pausa; `NavigationEnd` en medio no lo cierra; en escritorio no se programa cierre.

## Fuera de alcance
- Hover en dispositivos sin puntero fuera del menú hamburguesa.
- Tema oscuro de la app interna.
