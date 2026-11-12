# Spec — menu-hover-scrollspy-breadcrumb

Referencia: `propose.md`. Extensión `validate`: no activa.

## Requisitos funcionales

**RF-1 — Hover y foco visibles en el menú móvil.** Con el menú abierto, la opción bajo el
cursor o con foco de teclado (`:focus-visible`) se distingue a simple vista de las demás:
cambia el color del texto a la marca, aparece un subrayado bajo el texto y, con movimiento
permitido, el subrayado crece de izquierda a derecha y el texto se desplaza. Con
`prefers-reduced-motion: reduce` no hay desplazamiento ni transición, pero el color y el
subrayado se aplican igual.

**RF-2 — Scroll-spy en la home.** En `/`, mientras el usuario scrollea, el ítem resaltado
del menú (escritorio y móvil) corresponde a la sección visible:

| Secciones de la home | Ítem resaltado |
|---|---|
| hero, qué es, cómo funciona | Inicio |
| servicios, seguridad, compañías | Servicios |
| equipo, origen | Nosotros |
| preguntas frecuentes | Preguntas frecuentes |
| banda final de contacto (y el final de la página) | Contacto |

Exactamente un ítem queda resaltado. `aria-current="page"` sigue en "Inicio" (la página real).
Los ítems siguen navegando a sus rutas.

**RF-3 — Resaltado por ruta fuera de la home.** En las demás páginas públicas el resaltado y
`aria-current="page"` siguen a la ruta, como hoy. Al salir de la home el scroll-spy se apaga.

**RF-4 — Breadcrumb acumulativo en la home.** Given el usuario en `/` y el header compacto
(scroll pasado el umbral), when está en la sección del ítem N del menú, then bajo la barra del
header se ve el rastro con los ítems 1..N del menú en orden ("Inicio › Servicios › Nosotros").
Al subir, el rastro se recorta. Arriba de todo (header no compacto) no se muestra. El último
ítem es texto con `aria-current="location"`; los anteriores son enlaces a su sección de la home.
Es un `nav` con nombre accesible propio. No se muestra con el menú móvil abierto. No desplaza
el contenido de la página al aparecer. Con movimiento permitido, cada ítem nuevo entra con una
animación corta; con movimiento reducido aparece sin animación.

**RF-5 — Anclas bajo el header y el rastro.** Al saltar a una sección desde el rastro, la
sección queda visible debajo del header y del rastro.

**RF-6 — Orden del equipo.** En la home y en `/nosotros` los nombres aparecen como
"Carlos Arciniegas · Wilson Solano · Yeison Pulgarin".

## Criterios de aceptación
- CA-1: hover/focus del ítem móvil aplica color de marca y subrayado visible (regla presente
  fuera del bloque de movimiento); desplazamiento y transición solo con `no-preference`.
- CA-2: en `/` con la sección "servicios" activa, el ítem Servicios tiene `is-active` y
  Inicio no; Inicio conserva `aria-current="page"`.
- CA-3: en `/servicios` sin scroll-spy, Servicios tiene `is-active` y `aria-current="page"`.
- CA-4: la sección activa se calcula: última sección cuyo borde superior pasó la línea de
  lectura; al final de la página, la última.
- CA-5: el rastro muestra 1, 2 o 3 ítems según la sección activa; el último con
  `aria-current="location"`; no aparece sin compacto, sin spy o con el menú abierto.
- CA-6: al destruir la home el spy queda apagado (sin ítem de spy ni rastro).
- CA-7: el offset de anclas suma el alto del rastro cuando está visible.
- CA-8: `team.members` y los textos de home y `/nosotros` siguen el orden de RF-6.
- CA-9: `ng test` en verde y `ng build` sin errores de presupuesto.

## Fuera de alcance / edge cases
- Breadcrumb y scroll-spy en páginas internas.
- Sincronizar la URL con la sección (`/#servicios`) al scrollear.
- Secciones de la home sin ítem en el menú no agregan pasos al rastro.
