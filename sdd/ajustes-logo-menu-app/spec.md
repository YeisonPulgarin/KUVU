# Spec — ajustes-logo-menu-app

## Requisitos funcionales

### R1 — Logo del header
- **Dado** cualquier página pública, **en** cualquier ancho de viewport y en tema claro u
  oscuro, **el** header muestra una sola imagen de logo: el símbolo (`logo.responsive`).
- La imagen está dentro del enlace a `/`, con el nombre de la marca como texto alternativo.
- El header no muestra la imagen del logo completo (`logo.web`) en ningún ancho.

### R2 — Footer sin logo
- **Dado** el footer del sitio público, **no** muestra ninguna imagen de logo.
- El texto de la marca ("KUVU") sigue visible en el footer.

### R3 — Menú móvil con scroll
- **Dado** un viewport < 1024 px y la página scrolleada más allá del umbral compacto,
  **cuando** el usuario abre el menú, **entonces** el panel ocupa el viewport debajo del header
  (de su borde inferior hasta el fondo de la pantalla) y sus ítems son visibles y clicables.
- El header compacto conserva su superficie translúcida con desenfoque.
- El comportamiento sin scroll se mantiene (abre, cierra con el botón, con Escape y al navegar;
  bloquea el scroll del body mientras está abierto).

### R4 — Estados del menú móvil
- **Cuando** el puntero pasa sobre un ítem del panel móvil (o tiene foco visible), el ítem
  muestra un fondo tintado y su contenido se desplaza levemente a la derecha.
- **El** ítem de la ruta actual muestra una barra lateral de acento y un fondo suave, además del
  color de marca, y conserva `aria-current="page"`.
- Con `prefers-reduced-motion: reduce` no hay desplazamiento animado; el tinte y la barra se
  mantienen.
- El nav de escritorio no cambia.

### R5 — Marca legible en el acceso
- **Dado** `/acceder`, `/login` o `/cambiar-contrasena`, **la** marca se compone del símbolo
  (`logo.responsive`) y del texto "KUVU" en blanco al lado, legible sobre el overlay oscuro.
- En `/acceder` la marca sigue siendo un enlace a `/` con nombre accesible.
- Ninguna de las tres vistas muestra `Logo_Kuvu.png`.

### R6 — Botones de descarte en la app interna
- **Dado** cualquier modal de formulario de la app interna (contratos, locales, pagos,
  mantenimiento, usuarios), para cualquier rol, **el** botón Cancelar usa el estilo de
  Eliminar (`.btn-action--danger`) y muestra el ícono "x" antes del texto.
- **Dado** el diálogo de confirmación compartido, **su** botón de descarte (texto "Cancelar" o
  el `cancelarTexto` recibido, p. ej. "Volver") usa el mismo estilo e ícono.
- El comportamiento no cambia: cerrar el modal, devolver `false` en la confirmación, foco
  inicial en el botón de descarte.
- Los botones Cancelar tienen el mismo alto y relleno que el botón primario del mismo pie.

### R7 — Textura de fondo en la app interna
- **Dado** cualquier pantalla interna, para cualquier rol, **el** fondo de `.main-content`
  muestra un grano sutil sobre `--color-bg`, que no se desplaza con el contenido.
- El grano no intercepta clics ni afecta el contraste del texto.
- Los modales y las tarjetas mantienen su fondo liso.

### R8 — Botón "Volver arriba"
- **Dado** cualquier ruta (sitio público, acceso, app interna; Administrador y Arrendatario),
  **cuando** el contenedor que scrollea la página (la ventana, o `.main-content` en la app
  interna) supera una altura de viewport de desplazamiento, **entonces** aparece un botón
  flotante abajo a la derecha, con transición de entrada.
- **Cuando** vuelve a quedar por debajo de ese umbral, el botón desaparece con transición y no
  es enfocable ni anunciado.
- El botón es un `<button>` con ícono de flecha hacia arriba y nombre accesible
  "Volver arriba".
- **Cuando** se activa (clic, Enter o Espacio), ese contenedor vuelve a `top: 0` con scroll
  suave; con `prefers-reduced-motion: reduce`, el salto es inmediato y la aparición no se
  anima.
- **Al** navegar a otra ruta, el botón arranca oculto.
- Queda por debajo del panel del menú móvil, del sidebar móvil y de su backdrop, y de los
  toasts. Los modales (`<dialog>`) lo cubren.
- Mantiene contraste AA en tema claro y oscuro y respeta el área segura inferior en móvil.
- Los scrolls de otros elementos (tablas, panel del menú, modales) no lo muestran.

## Criterios de aceptación

- CA1: tests del header verifican una sola `<img>` de logo con `src` = `logo.responsive`.
- CA2: test del footer verifica que no hay `<img>` de logo y que el nombre de marca se muestra.
- CA3: el panel móvil no tiene un ancestro con `backdrop-filter` en estado compacto (test que
  aplica `.is-compact` y comprueba el estilo calculado de `.site-header`), y verificación
  manual en navegador con la página scrolleada.
- CA4: test del panel móvil verifica `is-active` + `aria-current` en la ruta actual; los estilos
  de hover/activo se revisan en verificación visual.
- CA5: tests de landing, login y cambiar-contraseña verifican el símbolo y el texto "KUVU".
- CA6: tests de cada modal y del `confirm-host` verifican que el descarte tiene
  `.btn-action--danger` y el ícono "x"; los tests de comportamiento existentes siguen en verde.
- CA7: `.main-content` declara la textura; revisión visual en una pantalla interna.
- CA9: spec del botón: oculto al inicio; visible tras scrollear `.main-content` y la ventana
  más de un viewport; oculto otra vez bajo el umbral y tras `NavigationEnd`; al activarlo
  llama `scrollTo({ top: 0, behavior: 'smooth' })` sobre el contenedor, o `'auto'` con
  movimiento reducido; nombre accesible "Volver arriba"; ignora el scroll de otros elementos.
- CA8: `npx ng test --watch=false --browsers=ChromeHeadless` en verde y `ng build` sin errores
  ni presupuestos excedidos.

## Fuera de alcance / edge cases excluidos

- Navbar interna e intro (`auth-intro`) mantienen el logo completo.
- Navegadores sin `backdrop-filter`: el header compacto se ve sin desenfoque (fallback actual).
- "Cancelar solicitud" del arrendatario en mantenimiento ya es una acción destructiva y no cambia.
- No hay tema oscuro en la app interna; no se agrega.
- No se crea un asset de logo claro.
