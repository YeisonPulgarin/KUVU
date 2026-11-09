stack: Angular 21, TypeScript, RxJS
test_command: ng test
test_mode: test-after
config_found: true
slices_declarados: [backend-orden, contenido, chrome, paginas, home, intro, cierre]
expone_api_http: true
docs_existentes: docs/

## Convenciones del frontend relevantes para próximos cambios

- `frontend/proyecto_angular/src/app/motion/`: piezas de movimiento reutilizables y sin
  dependencias. `motion-preferences.ts` es la única fuente de las media queries de movimiento
  en TS (`reducedMotion`, `finePointer`, `desktop`). Además están `ScrollMotionService`,
  `[appScrollProgress]`, `<app-split-text>` y `[appMagnetic]`. Los dobles de test
  (`matchMedia`, `requestAnimationFrame`, `IntersectionObserver`) están en `motion/testing/`.
- `ScrollMotionService` no es `providedIn: 'root'`: lo provee el componente que lo usa (hoy
  `HomeComponent`), así que el injector de ese componente lo destruye junto con sus listeners.
  Un componente que use `[appScrollProgress]` necesita un ancestro que lo provea.
- Movimiento: el JS publica variables CSS (`--p`, `--page-progress`, `--mx`/`--my`) y el CSS
  anima, siempre dentro de `prefers-reduced-motion: no-preference`. Los tokens de duración,
  curva y distancia están en `src/styles/_motion.scss`.
- Rutas del sitio público: llevan `data: { publicSite: true }` en `app.routes.ts`.
  `route-view-transition.ts` (transición propia entre páginas públicas, compuesta con el salteo
  de la intro) y `anchor-smooth-scroll.ts` solo actúan entre rutas con ese flag.
- Estilos de componentes: evitá `@apply` de Tailwind cuando el componente va en el bundle
  inicial. Tailwind v4 lo expande con fallbacks y un bloque `@layer properties` en cada
  componente, y el presupuesto inicial es ajustado.
- Tokens de marca del sitio público (`--color-brand-*`, `--color-home-*`, `--radius-*`): se
  declaran en el bloque `@theme static` de `src/styles.css`, así que Tailwind los emite siempre
  en `:root` aunque ninguna utilidad los use. Los overrides oscuros están en `.dark` del mismo
  archivo. Los componentes los consumen con `var(--token)`, sin fallback literal, y sus nombres
  pueden escribirse tal cual en `.ts`/`.html` (el escaneo de Tailwind no cambia lo que se emite).
  Un token nuevo de marca va en ese bloque, no en un `:root` aparte.

## Convenciones de la app interna (slice `app`)

- Cada pantalla interna se envuelve en `<app-layout pagina="…">`
  (`components/shared/app-layout/`): sidebar, columna principal, breadcrumb
  `{Empresa} › {Página}` (`nav[aria-label="Ruta"]`) y los hosts de toasts y confirmaciones.
  En el dashboard la página es `Inicio` y la empresa no es enlace.
- Colores semánticos fijos `--sem-{danger,success,warning,info,neutral}-{fg,bg,border,solid}`
  al inicio de `shared.styles.scss` (prefijo `--sem-*`, fuera del namespace `--color-*` de
  Tailwind). El color de marca (`--color-primario`) solo rellena el CTA principal
  (`.btn-primary`), con texto `--color-primario-contraste`, que `AuthService` calcula por
  luminancia (`components/shared/color-contrast.ts`).
- Botones: `.btn-primary` (un CTA por pantalla), `.btn-secondary` (descartar/cancelar,
  neutro AA), `.btn-action--{rol}` para acciones de fila (`--icon` para solo ícono, con
  `aria-label`) y `.btn-solid--{rol}` solo en el diálogo de confirmación. Mapeo: editar e
  iniciar → `info`, completar → `success`, eliminar y cancelar solicitud → `danger`.
- Íconos: `<app-icon name="…">` (SVG inline, `aria-hidden`); sin emoji en la app interna.
- Nada de `confirm()`/`alert()`/`prompt()`: `ConfirmService.confirmar({...})` (promesa) y
  `ToastService.exito()/error()`. Toda acción da feedback: toast de éxito o error, o
  `.error-msg[role=alert]` en el modal con `aria-invalid` en los campos.
- Modales: `<app-modal titulo>` sobre `<dialog>` dentro de un `@if`; se cierra con
  `modal()?.cerrar()` (anima la salida) y el padre resetea su estado en `(closed)`.
- Badges: `badges.ts` (`badgeEstado`, `badgePrioridad`, `badgeTipoPago`, `badgeVigencia`) →
  `.badge--{rol}`. Fechas y moneda: `formato.ts`.
- Carga: `DataService.esperandoDatos()` muestra `<app-skeleton>`; `errorCarga()` dispara el
  toast desde `<app-layout>`.
- Movimiento: todo dentro de `prefers-reduced-motion: no-preference` con los tokens de
  `_motion.scss`. `[appStagger]` (entrada escalonada solo en el primer pintado),
  `<app-count-up>` (cifras) y la transición entre pantallas con View Transitions: los nombres
  `app-sidebar` y `app-main` están reservados para `.sidebar` y `.main-content`.
- Specs de pantallas: dobles en `components/shared/testing/app-doubles.ts` y
  `MatchMediaStub({ reducedMotion: true })` para que los modales cierren sin esperar la
  animación.
