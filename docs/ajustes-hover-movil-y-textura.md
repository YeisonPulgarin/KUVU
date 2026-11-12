# Feedback táctil de los menús y textura de la app interna

Los dos menús que se cierran al elegir (el menú hamburguesa del sitio público y el drawer
móvil del menú lateral de la app interna) muestran la opción elegida también en pantallas
táctiles, donde no hay hover. El menú lateral de la app interna comparte el lenguaje visual
del menú público. El fondo de la app interna tiene una textura de grano perceptible y un
brillo suave del color de la empresa.

## Cómo funciona

Rutas relativas a `frontend/proyecto_angular/src/`.

### Pausa de cierre
- `app/motion/tap-feedback.ts` exporta `TAP_FEEDBACK_MS = 320`.
- Menú público (`app/components/public/site-header/`): cada opción del panel llama a
  `chooseLink(href)`. El router navega en el acto; la opción queda con `is-pressed` y el panel
  se cierra al vencer la pausa. `closeMenu()` (Escape, botón) cancela la pausa y cierra al
  instante. El cierre por `NavigationEnd` se saltea mientras hay un cierre programado.
  `MENU_TAP_FEEDBACK_MS` es el mismo valor.
- Menú lateral (`app/components/shared/sidebar/`): cada enlace llama a `elegir(ruta)`. Solo
  actúa en el drawer móvil abierto (< 768 px): marca el enlace (`elegido`, clase
  `is-pressed`) y llama a `cerrarMenu()` tras la pausa. En escritorio el sidebar no se cierra
  y no hay pausa.

### Estados visuales
- Menú público (`site-header.component.scss`): `:hover`, `:focus-visible`, `:active` e
  `.is-pressed` dan color `--color-brand-600`, tinte al 14 % y subrayado de 2 px en
  `.mobile-label` (gradiente con `background-size` de `0` a `100%`). Con movimiento, el
  subrayado crece y la opción se desplaza 12 px.
- Menú lateral (`sidebar-feedback.scss`, hoja aparte): los mismos estados usan
  `--sidebar-acento = color-mix(--color-primario 30 %, #fff)`, tinte del color de empresa al
  18 %, ícono con el acento y subrayado en `.sidebar__label`. Con movimiento, desplazamiento
  de 4 px. El enlace activo conserva su barra y su negrita.
- Ambos: `-webkit-tap-highlight-color: transparent`, para que el destello gris del navegador
  no tape el estado propio. Con movimiento reducido, color, tinte y subrayado se ven igual,
  sin transición ni desplazamiento.

### Fondo de la app interna
`app/components/shared/shared.styles.scss`, `.app-layout .main-content`:
- Capa 1: `radial-gradient` desde la esquina superior derecha con `--color-primario` al 8 %.
- Capa 2: `$grain-specks` (`styles/_grain.scss`), 180 px, sobre `--color-bg`. Es ruido
  fractal convertido en motas pizarra con alfa `0.33 − 0.6·R`: media de ~4 % y picos de
  12–15 %.
- `--color-primario` lo declara `<app-layout>` en su host (`docs/ingresar-color-marca.md`).
  Tarjetas, tablas y modales tienen fondo propio liso.

## Decisiones

- **Se demora el cierre, no la navegación.** Mostrar el estado elegido no cuesta tiempo de
  carga; solo el panel queda abierto 320 ms sobre la pantalla nueva.
- **Acento aclarado en el menú lateral.** El color de empresa puro no se lee sobre el fondo
  oscuro del sidebar (`#133937`) cuando la empresa es oscura. Mezclado con 70 % de blanco
  conserva el tono y da ≥ 4.5 : 1 para cualquier color (el spec lo prueba con negro, azul
  puro, blanco y las empresas del seed).
- **Motas con transparencia en vez de velo.** Un velo sobre ruido gris o deja el grano
  invisible o arrastra la media del fondo al gris y baja el contraste del texto secundario.
  Las motas transparentes dan textura con un oscurecimiento medio chico. El sitio público
  conserva su `$grain`.

## Limitaciones conocidas

- La lógica de pausa está en dos componentes (header y sidebar). Si aparece un tercer menú
  que cierra al elegir, conviene extraerla a una pieza común.
- El subrayado por gradiente se repite en `.mobile-label` y `.sidebar__label`, cada uno en el
  estilo encapsulado de su componente.
- El `:active` real de un toque no se reproduce en los tests unitarios. Lo cubren
  `.is-pressed`, que comparte las reglas, y la revisión del CSS compilado.
