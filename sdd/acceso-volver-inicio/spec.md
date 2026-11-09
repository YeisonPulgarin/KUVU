# Spec — acceso-volver-inicio

## Requisitos funcionales

**RF-1 — Enlace "Volver al inicio".** `/acceder` muestra, arriba del selector de inmobiliaria y
fuera de la card, un enlace con el texto visible "Volver al inicio" y un ícono de flecha
izquierda decorativo.
- Given el usuario está en `/acceder` con el selector visible,
  When activa el enlace (clic, Enter),
  Then la aplicación navega a `/` (la home).

**RF-2 — Logo como enlace.** El logo de KUVU en `/acceder` es un enlace a `/`.
- Given el selector visible, When el usuario activa el logo, Then la aplicación navega a `/`.
- El nombre accesible del enlace del logo es "KUVU, volver al inicio".

**RF-3 — Semántica.** Ambos controles son enlaces reales (`href="/"`): se pueden abrir en otra
pestaña y se anuncian como enlaces.

**RF-4 — Teclado y foco.** Ambos enlaces son alcanzables con Tab y muestran un indicador de foco
visible al recibir foco por teclado, con contraste suficiente sobre el fondo oscuro.
El foco inicial del selector sigue en el buscador.

**RF-5 — Intro.** Mientras la intro cubre la pantalla, los enlaces no reciben foco ni clic
(quedan dentro de la región inerte del selector). Al terminar la intro quedan operables.

**RF-6 — Movimiento reducido.** El hover de los enlaces cambia solo color/opacidad; con
`prefers-reduced-motion: reduce` no hay transiciones en ellos.

**RF-7 — Lenguaje visual.** El enlace de texto reproduce el estilo "volver" de `/login`
(texto chico blanco translúcido con chevron, más claro en hover) y el área de toque mínima es de
44px de alto.

## Criterios de aceptación

- CA-1: en `/acceder` existe un enlace con texto "Volver al inicio" y `href="/"`.
- CA-2: el logo está dentro de un enlace con `href="/"` y `aria-label="KUVU, volver al inicio"`.
- CA-3: activar cualquiera de los dos enlaces navega a `/`.
- CA-4: con la intro en curso, los enlaces están dentro del contenedor con `inert`; sin intro,
  no lo están.
- CA-5: el ícono del enlace de texto es `aria-hidden`.
- CA-6: la suite Karma y `ng build` pasan.

## No-objetivos / edge cases excluidos

- No se agrega un "volver" en la intro misma (la intro ya se puede saltar según su propio
  comportamiento).
- No cambia el orden ni el estilo de card, buscador, lista o fondo.
- No se agrega confirmación al salir: `/acceder` no tiene estado que perder salvo el texto del
  buscador.
- El hover con `translateX` de `.empresa-row`, que hoy no respeta reduced motion, queda fuera
  de este cambio.
