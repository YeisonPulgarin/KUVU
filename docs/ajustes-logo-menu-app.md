# Ajustes de logo, menú y app interna

Ajustes de marca, navegación y acabado visual del frontend Angular
(`frontend/proyecto_angular`):

- el header público usa un solo logo (el símbolo);
- el menú móvil abre en cualquier punto del scroll y marca la página actual;
- la marca del acceso es legible sobre la foto oscura;
- un botón flotante "Volver arriba" acompaña a todas las páginas;
- en la app interna, los botones de descarte tienen la misma presencia que Eliminar y el
  fondo lleva una textura sutil.

Lo de la app interna vale para Administrador y Arrendatario.

## Cómo funciona

### Marca

- **Header público** (`components/public/site-header/`): una sola `<img class="logo-img">`
  con `logo.responsive` (`/logo-rediseno/Logo_Responsive.png`). Mide `h-12` en todos los
  anchos y es la misma en tema claro y oscuro.
- **Footer público** (`components/public/site-footer/`): no lleva imagen de logo. La marca
  es el texto `.footer-name` ("KUVU.") en la fuente display.
- **Acceso** (`/acceder`, `/login`, `/cambiar-contrasena`):
  - La marca es `.brand-lockup`: el símbolo (`alt=""`) más `.brand-wordmark` con "KUVU" en
    blanco, en `--font-display`.
  - Los estilos están en `components/login/brand-lockup.scss`, que las tres vistas suman en
    sus `styleUrls`. El símbolo mide 56 px de alto (48 px por debajo de 640 px).
  - En `/acceder` el lockup va dentro del enlace a `/`, que conserva
    `aria-label="KUVU, volver al inicio"`.
- **Navbar interna e intro** (`auth-intro`): muestran el logo completo
  (`Logo_Kuvu.png`).
- `content/logo.ts` expone `web` y `responsive`.

### Menú móvil

- La superficie del header (color, translucidez del estado compacto y
  `backdrop-filter: saturate(1.4) blur(12px)`) vive en `.site-header::before`
  (`position: absolute; inset: 0; z-index: -1`). `.site-header` es `position: relative` y no
  lleva filtros ni transformaciones.
- Así, el panel `.mobile-menu` (`position: fixed; inset: 64px 0 0 0`, 56 px en compacto) se
  mide contra el viewport y ocupa la pantalla debajo del header con cualquier scroll.
- Estados de los ítems del panel (`.mobile-item`):
  - **hover / `:focus-visible`:** fondo de marca al 8 % y desplazamiento de 6 px a la
    derecha. El desplazamiento solo ocurre con `prefers-reduced-motion: no-preference`.
  - **activo (`.is-active`, `aria-current="page"`):** fondo de marca al 12 % y barra lateral
    de acento (`box-shadow: inset 3px 0 0`).
- El separador de cada opción está en el `<li>`, para que el desplazamiento del enlace no
  arrastre la línea. El nav de escritorio conserva su subrayado animado.

### Botón "Volver arriba"

`components/back-to-top/back-to-top.component.ts` se monta una vez en `AppComponent`
(`app.ts`), así que está en todas las rutas.

- **Contenedor que sigue:** un listener `scroll` en `document` con
  `{ capture: true, passive: true }`. El scroll de un elemento no burbujea, pero sí pasa por
  la fase de captura.
  - Si el target es el documento, el contenedor es la ventana.
  - Si es un elemento que cumple `.main-content` (`APP_SCROLLER_SELECTOR`, el contenedor con
    scroll de la app interna), el contenedor es ese elemento.
  - Cualquier otro scroll (tablas, panel del menú, modales) se ignora.
- **Visibilidad:** el botón aparece cuando el contenedor bajó más de un viewport
  (`BACK_TO_TOP_VIEWPORTS = 1`). Al navegar (`NavigationEnd`) vuelve a quedar oculto.
- **Acción:** `scrollTo({ top: 0, behavior })`. `behavior` es `'smooth'`, o `'auto'` con
  movimiento reducido (`reducedMotion()` de `motion/motion-preferences.ts`).
- **Estado oculto:** `visibility: hidden` + `opacity: 0`, más `tabindex="-1"` y
  `aria-hidden` mientras se desvanece. Las transiciones solo corren con
  `prefers-reduced-motion: no-preference`.
- **Apariencia y capa:** círculo de 48 px en `--color-brand-700` con flecha blanca y
  `aria-label="Volver arriba"`. Está a 1,25 rem de la esquina inferior derecha (respeta
  `safe-area-inset`) con `z-index: 45`: queda debajo del header público y su panel (50), del
  sidebar móvil (150–250) y de los toasts (400). Los `<dialog>` lo cubren desde el top layer.

### App interna: descarte y fondo

- **Botones de descarte:** los Cancelar de los modales (contratos, locales, pagos,
  mantenimiento, usuarios) y el botón de descarte del diálogo de confirmación
  (`confirm-host`, que muestra "Cancelar" o el `cancelarTexto`, como "Volver") son
  `btn-action btn-action--danger` con `<app-icon name="x">`.
  - Comparten el tinte rojo semántico de Eliminar (`--sem-danger-*`).
  - En `.modal__footer` y `.pasarela-actions` toman la medida del botón primario
    (`shared.styles.scss`).
  - El comportamiento no cambia: cierran el modal, devuelven `false` al confirm y reciben el
    foco inicial del diálogo.
- **Fondo:** `.app-layout .main-content` pinta `$grain` bajo un velo de `--color-bg` al
  93 %. Es solo fondo, sin capa encima del contenido, y el grano queda quieto mientras el
  contenido se desplaza. Los modales y las tarjetas son lisos.
  - `$grain` está declarado en `src/styles/_grain.scss`, un parcial que no emite CSS.
  - Lo cargan con `@use` `src/styles/_site.scss` (grano de `.site-root`) y
    `components/shared/shared.styles.scss`.

## Decisiones

- **Superficie del header en `::before` en vez de mover el panel fuera del `<header>`.**
  Corrige el bloque contenedor sin cambiar la estructura ni la gestión de foco e `inert` del
  menú. Tradeoff: ningún ancestro del panel puede llevar `backdrop-filter`, `filter` ni
  `transform`. Un spec lo comprueba.
- **Un único botón "Volver arriba" global con listener en captura.** La alternativa era una
  instancia por layout (home, `app-public-page`, `app-layout`, acceso). Tradeoff: un
  contenedor de scroll de página nuevo tiene que sumarse a `APP_SCROLLER_SELECTOR`.
- **Cancelar en rojo** es una decisión del usuario. En el diálogo de borrado, descarte y
  confirmación comparten color y se distinguen por relleno: tintado frente a sólido.
- **`brand-lockup.scss` como hoja aparte.** Las hojas de landing y login incrustan Google
  Fonts (Syne/Inter) y están a pocos bytes del presupuesto `anyComponentStyle` (error en
  20 kB). Una hoja propia evita superarlo y centraliza los estilos de las tres vistas.
- **Markup del lockup repetido en las tres plantillas, sin un componente.** Son 3–4 líneas
  estáticas por vista y los estilos ya están centralizados.

## Limitaciones conocidas

- Landing y login conservan el `@import` de Google Fonts (Syne/Inter): `ng build` muestra el
  warning `css-inline-fonts` y esas hojas quedan cerca del límite de presupuesto.
  Autohospedar esas fuentes es trabajo pendiente.
- El SVG del grano aparece dos veces en el `styles.css` compilado (unos 320 B cada uno). En
  gzip la diferencia es de 4 B, así que no se unifica.
- La legibilidad del lockup sobre las fotos del acceso, la intensidad del grano y los
  estados hover se revisan a mano: no hay test automatizado de contraste ni de apariencia.
- La app interna no tiene tema oscuro. El botón "Volver arriba" usa los tokens de marca, que
  funcionan en los dos temas del sitio público.
