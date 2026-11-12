# Design — ajustes-hover-movil-y-textura

Referencias: `propose.md`, `spec.md`. Rutas relativas a `frontend/proyecto_angular/src/`.

## D1 — Estado "elegida" en el header (RF-1, RF-2)

`app/components/public/site-header/site-header.component.ts`:
- `MENU_TAP_FEEDBACK_MS = 320` (exportada): pausa de cierre. Cubre el crecimiento del
  subrayado (`--dur-base`, 350 ms, con curva expo que llega a ~95 % antes de 320 ms).
- `pressedHref = signal<string | null>(null)`: opción elegida.
- `chooseLink(href)`: reemplaza el `(click)="closeMenu(false)"` de los enlaces del panel. Fija
  `pressedHref` y programa `closeMenu(false)` con `setTimeout(MENU_TAP_FEEDBACK_MS)`.
- `closeMenu()` cancela el timer pendiente y limpia `pressedHref`, así Escape o el botón
  cierran al instante y no queda un cierre colgado.
- El cierre por `NavigationEnd` se saltea si hay un cierre programado (CA-3); `ngOnDestroy`
  (vía `DestroyRef`) cancela el timer.
- "Ingresar" del panel conserva su cierre inmediato (va a `/acceder`, fuera del sitio).

Template: `[class.is-pressed]="pressedHref() === link.href"` y `(click)="chooseLink(link.href)"`.

## D2 — Estilos de toque (RF-1, RF-3)

En `site-header.component.scss`, el selector de estado pasa a
`&:hover, &:focus-visible, &:active, &.is-pressed` en las dos ubicaciones (estado visual
fuera del bloque de movimiento; desplazamiento y transición dentro de `no-preference`).
`-webkit-tap-highlight-color: transparent` en `.mobile-item`, para que el resaltado gris del
navegador no tape el estado propio. Sin media queries de puntero ni de ancho.

- Descartado: demorar la navegación hasta que termine la animación. Hace la app más lenta
  para mostrar un efecto; la pausa solo afecta al panel.
- Descartado: confiar en el hover "pegajoso" de los navegadores táctiles: no es uniforme y
  el panel se cierra igual en el `click`.

## D3 — Grano de la app interna (RF-4)

`styles/_grain.scss` declara además `$grain-specks`: el mismo `feTurbulence` (180 px), con un
`feColorMatrix` que da color pizarra (`rgb(30, 41, 59)`) y alfa `= 0.33 − 0.6·R`: motas
oscuras donde el ruido es bajo y transparencia donde es alto. Con el ruido fractal (media
~0.5, desvío ~0.1) la media de alfa ronda 4 % y los picos 12–15 %: textura visible con un
oscurecimiento medio chico.

`.app-layout .main-content` en `shared.styles.scss`:
```
background:
  radial-gradient(120% 70% at 100% 0%, color-mix(in srgb, var(--color-primario) 8%, transparent), transparent 70%),
  $grain-specks,
  var(--color-bg);
background-size: auto, 180px 180px;
```
El degradado usa `--color-primario`, que `<app-layout>` declara en su host
(`ingresar-color-marca`); sin empresa cae en el azul de `:root`.

- Descartado: bajar el velo sobre el `$grain` gris. El gris medio del ruido arrastra la media
  del fondo hacia `#DCDFE2` y baja el contraste del texto gris sobre el fondo.
- Descartado: `background-blend-mode: overlay`. Sobre un fondo casi blanco el overlay
  comprime la variación a ±5 niveles: vuelve a ser imperceptible.

## D4 — Sidebar de la app interna (RF-5, RF-6)

- `app/motion/tap-feedback.ts` exporta `TAP_FEEDBACK_MS = 320`, fuente única de la pausa; el
  header publica `MENU_TAP_FEEDBACK_MS = TAP_FEEDBACK_MS` (mismo valor, sin romper su API).
- `SidebarComponent`: `elegido = signal<string | null>(null)` y `elegir(ruta)`, enlazado al
  `(click)` de cada `.sidebar__link`. En móvil fija `elegido` y programa
  `cerrarMenu()` tras `TAP_FEEDBACK_MS`; en escritorio no hace nada (no hay cierre). El cierre
  por `NavigationEnd` se saltea con un cierre pendiente; `cerrarMenu()` y el destroy cancelan
  el timer y limpian `elegido`. Template: `[class.is-pressed]` y la etiqueta en
  `<span class="sidebar__label">`.
- Estilos en hoja aparte `sidebar/sidebar-feedback.scss` (sumada por `styleUrls`):
  - `--sidebar-acento: color-mix(in srgb, var(--color-primario, #3a6fd8) 30%, #fff)`. Con el
    peor caso (empresa negra) el acento es `#b3b3b3`: 7.3 : 1 sobre `#133937`; con colores
    claros es aún más claro. Así se usa el color de la empresa sin depender de su luminancia.
  - Estado (`:hover`, `:focus-visible`, `:active`, `.is-pressed`): `color: var(--sidebar-acento)`,
    fondo `color-mix(--color-primario 18 %, transparent)`, ícono con el acento, y
    `.sidebar__label` con subrayado de gradiente `0 → 100% 2px` (mismo truco que
    `.mobile-label`).
  - Con `no-preference`: transición del subrayado y `translateX(4px)` (el sidebar es angosto).
  - `.active` conserva barra de empresa y negrita; el `:hover` local de `sidebar.component.scss`
    queda superado por especificidad de la hoja nueva (misma clase + pseudo, cargada después).
- Descartado: usar `--color-primario` puro como color de texto: con empresas oscuras (p. ej.
  `#2B4C8C`) da < 2 : 1 sobre el fondo del sidebar.

## Verificación visual
`verify` toma una captura en Chrome headless de una página que reproduce las capas de fondo
con los valores compilados, y revisa el CSS del bundle para confirmar que las reglas llegan.

## Logs
Sin logs (UI).
