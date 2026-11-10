# design — app-interna-ux

Referencias: `sdd/app-interna-ux/spec.md` (R1–R7, CA1–CA17), `propose.md`, `explore.md`.
Rutas relativas a `frontend/proyecto_angular/src/app/` salvo indicación.

## Vista general

```
components/shared/
  app-layout/        <app-layout>  sidebar + main + hosts de toast y confirmación (nuevo)
  modal/             <app-modal>   <dialog> nativo con entrada/salida, Escape, foco (nuevo)
  confirm/           ConfirmService + <app-confirm-host> (nuevo)
  toast/             ToastService  + <app-toast-host>   (nuevo)
  icon/              <app-icon name="trash">  SVG inline (nuevo)
  skeleton/          <app-skeleton variant="table|cards|stats"> (nuevo)
  count-up/          <app-count-up [value] [format]> (nuevo)
  stagger.directive.ts   [appStagger] entrada escalonada una sola vez (nuevo)
  badges.ts          mapeo estado/prioridad/tipo de pago → { clase, etiqueta } (nuevo)
  color-contrast.ts  textoSobreMarca(colores) → '#1a202c' | '#ffffff' (nuevo)
  shared.styles.scss tokens semánticos, botones, badges, skeleton, movimiento, view transitions
  sidebar/           confirmación de logout, íconos, view-transition-name
services/
  data.service.ts    eliminarContrato, eliminarMantenimiento, estado de carga confiable
  auth.service.ts    publica --color-primario-contraste
components/{dashboard,locales,contratos,pagos,mantenimiento,usuarios}/  migradas a lo anterior
```

Nada de esto toca `src/styles.css`, `src/styles.scss`, `src/styles/_motion.scss`,
`app.routes.ts`, `app.config.ts`, `route-view-transition.ts`, el backend ni la BD (R7.1).

## Decisiones

### D-1 Tokens semánticos en `shared.styles.scss`, prefijo `--sem-*`

`shared.styles.scss` ya entra global por `@use` en `styles.scss`; un bloque `:root` al inicio
del parcial publica los tokens sin editar `styles.css` (que edita `sitio-publico-expresivo`).

- Cinco roles: `danger`, `success`, `warning`, `info`, `neutral`, cada uno con `-fg` (texto e
  ícono), `-bg` (tinte), `-border` y `-solid` (relleno para el botón de confirmación).
  Valores de partida: danger `#B42318`/`#FEF3F2`/`#FECDCA`/`#D92D20`; success
  `#067647`/`#ECFDF3`/`#ABEFC6`/`#079455`; warning `#B54708`/`#FFFAEB`/`#FEDF89`/`#B54708`;
  info `#175CD3`/`#EFF8FF`/`#B2DDFF`/`#1570EF`; neutral `#475467`/`#F2F4F7`/`#D0D5DD`/`#344054`.
  Todos los pares texto/fondo y blanco/`-solid` ≥ 4.5:1 (se mide en verify).
- Prefijo `--sem-*` y no `--color-*`: `--color-*` es el namespace de tema de Tailwind v4 y
  ya lo usan los tokens de marca y de la app.
- Descartado: tokens en el `@theme static` de `styles.css` (choca con el cambio en paralelo
  y los convertiría en utilidades Tailwind que nadie usa).

### D-2 Jerarquía de botones

- `.btn-primary` (único CTA de marca): relleno con el degradado de marca y
  `color: var(--color-primario-contraste)`. Sombra con `color-mix` del primario.
- `.btn-secondary`: neutro con borde.
- `.btn-action` + modificador (`--danger`, `--success`, `--warning`, `--info`, `--neutral`):
  tinte `-bg`, texto `-fg`, borde `-border`, ícono + texto. Reemplaza `.btn-sm` + `.btn-edit`/
  `.btn-blue`/`.btn-green`/`.btn-gray`/`.btn-red`, que se eliminan junto con `.btn-icon` de
  usuarios. `.btn-action--icon` es la variante cuadrada de solo ícono (con `aria-label`).
- `.btn-solid--danger`/`--warning`: relleno `-solid` y texto blanco, solo dentro del diálogo
  de confirmación.
- Mapeo de acciones (R1.3): Editar → `info`; Eliminar → `danger`; Iniciar → `info`;
  Completar → `success`; Cancelar solicitud → `danger` (enmienda 1).
- Estados comunes: `:hover` (tinte un paso más fuerte), `:active` (`scale(.97)`), `:disabled`,
  `:focus-visible` con anillo `color-mix` del `-fg` del rol (no el verde de KUVU), y
  `[aria-busy="true"]` con spinner CSS.

### D-3 Contraste del primario por luminancia (R1.6)

`color-contrast.ts` exporta funciones puras: luminancia relativa WCAG, ratio, y
`textoSobreMarca(colores: string[])`, que devuelve `#1a202c` o `#ffffff` según cuál tenga el
mayor contraste **mínimo** contra todos los colores dados (primario y secundario, porque el
botón es un degradado). `AuthService.aplicarTemaEmpresa()` publica el resultado como
`--color-primario-contraste`; `resetearTema()` lo quita. Default en `shared.styles.scss`:
`#ffffff`.

- Amarilo (`#F5A623`→`#F0851A`) → oscuro (≈ 8.9:1 y 6.3:1); las otras tres → blanco.
- Se usa también en el badge de rol del dashboard y los avatares del sidebar.
- Descartado: `contrast-color()` de CSS (soporte insuficiente) y editar `color_texto` en la BD
  (el usuario conserva sus datos).

### D-4 Íconos: `<app-icon>` con mapa de paths SVG

Un componente standalone con `input.required<IconName>()` y un mapa `Record<IconName, string>`
de paths de trazo 24×24 (estilo Lucide, como los SVG del sidebar): `plus`, `pencil`, `trash`,
`check`, `play`, `x`, `ban`, `download`, `credit-card`, `search`, `log-out`, `alert-triangle`,
`info`, `check-circle`, `wrench`, `file-text`, `home`, `users`, `wallet`, `map-pin`, `user`,
`calendar`, `mail`, `phone`, `lock`. `stroke="currentColor"`, `aria-hidden="true"`, tamaño
por `--icon-size` (default `1em`). Sin dependencias nuevas.

- Descartado: librería de íconos (dependencia y peso por ~25 íconos) y sprite externo
  (requiere tocar `public/` e `index.html`).

### D-5 Modal sobre `<dialog>` nativo (R5, R6.2)

`<app-modal>` envuelve un `<dialog>` y se usa para los formularios, la pasarela y el diálogo
de confirmación.

- API: `open = input<boolean>()`, `titulo = input.required<string>()`,
  `size = input<'md'|'lg'>()`, `closed = output<void>()`; proyecta cuerpo y
  `[modal-footer]`. Encabezado propio con `<h2 [id]>` + botón cerrar con `aria-label`.
- Abrir: `showModal()` (top layer, fondo inerte, foco atrapado por el navegador, nombre por
  `aria-labelledby`). Foco inicial: el elemento con `[autofocus]` proyectado, si no el primer
  campo. Guarda `document.activeElement` y lo restaura al cerrar (R5.2).
- Cerrar (✕, fondo, Escape vía evento `cancel` con `preventDefault`): pone
  `data-state="closing"`, espera `animationend` del panel (con tope de 300 ms) y recién ahí
  llama `close()` y emite `closed`. Con movimiento reducido cierra en el acto. Así sale
  animado sin `@angular/animations`.
- Clic en fondo: `click` cuyo `target` es el propio `<dialog>` (el panel ocupa el interior).
- `view-transition-name` en `main` no afecta al modal porque el top layer está fuera del flujo.
- Las pantallas siempre cierran por `closed` → `cerrarFormulario()`, que resetea estado
  (corrige R4.2). "Nuevo" siempre llama `abrirFormulario()` sin argumento.
- Descartado: overlay `div` actual (requiere trampa de foco, inert y Escape a mano) y
  `animate.leave` de Angular (se prefiere un mecanismo explícito y fácil de testear).

### D-6 Confirmación: `ConfirmService` + `<app-confirm-host>` (R3.1, R3.2)

`ConfirmService` (`providedIn: 'root'`) expone
`confirmar(opts: { titulo, mensaje, confirmarTexto, variante: 'danger'|'warning'|'neutral' }):
Promise<boolean>`. Guarda una solicitud en un signal; el host la pinta con `<app-modal>` y
resuelve `true` al confirmar y `false` al cancelar o cerrar. Una solicitud nueva resuelve la
anterior con `false`. Foco inicial en "Cancelar".

Para borrar, el componente hace `if (!(await confirm.confirmar(...))) return;` y después
llama a `DataService`. El estado de carga del botón (R2.4) vive en la pantalla:
`eliminandoId = signal<number|null>()`, que pone `aria-busy` y `disabled` en el botón de la
fila. El diálogo se cierra al confirmar, no espera la respuesta del backend; la fila queda
ocupada hasta que llega.

- Descartado: diálogo que espera al backend con spinner propio (acopla el servicio a cada
  operación) y un diálogo por pantalla (duplicación).

### D-7 Toasts: `ToastService` + `<app-toast-host>` (R3.3)

`ToastService` (root) mantiene `toasts = signal<Toast[]>()` con `exito(texto)` y
`error(texto)`; cada toast tiene id, tipo e ícono, y se quita solo a los 4 s (éxito) o 6 s
(error) con `setTimeout` limpiable, o con su botón cerrar. Máximo 3 visibles (el más viejo
sale). El host es una región fija abajo a la derecha (arriba en móvil, sin tapar la
hamburguesa), `aria-live="polite"`; los de error llevan `role="alert"`. La salida usa el
mismo patrón `data-state="closing"` + `animationend` que el modal.

Mensajes en español, tuteo: "Local eliminado", "No se pudo eliminar el contrato. Puede tener
pagos asociados.", "Pago registrado", "No pudimos cargar los datos. Revisa tu conexión."

### D-8 `<app-layout>`: un único shell para las seis pantallas

Cada pantalla repite `.app-layout > app-sidebar + main.main-content`. `<app-layout>` lo
encapsula y suma `<app-toast-host>` y `<app-confirm-host>`, así los hosts existen en toda la
app interna sin tocar `app.ts` ni las rutas. Las clases `.app-layout`/`.main-content` de
`styles.css` se reutilizan tal cual. Los servicios son root: un toast lanzado justo antes de
navegar sigue visible en la pantalla siguiente.

- Descartado: ruta padre con `children` (cambia `app.routes.ts`, que toca el otro cambio y
  rompe las URLs planas del guard) y poner los hosts dentro del sidebar (responsabilidad
  ajena).

### D-9 Transición entre pantallas internas con View Transitions (R6.2)

El router ya corre con `withViewTransitions`; entre rutas internas `onRouteViewTransition` no
hace nada y queda el fundido por defecto de toda la página. En `shared.styles.scss`:

- `.sidebar { view-transition-name: app-sidebar }` y `.main-content { view-transition-name:
  app-main }`. El sidebar es idéntico entre pantallas: queda quieto.
- `::view-transition-old(app-main)` sale con fundido (`--dur-fast`) y
  `::view-transition-new(app-main)` entra con fundido + `translateY(12px)` (`--dur-base`,
  `--ease-out-expo`), dentro de `prefers-reduced-motion: no-preference`.
- Bajo `reduce`: `animation: none` para `app-main` y `app-sidebar` (el fundido de `root`
  queda solo sobre el fondo, sin contenido visible).
- Navegadores sin View Transitions: navegación instantánea (caso excluido en la spec).
- Descartado: animación de entrada de `.page` en cada montaje (se duplica con el fundido del
  router) y modificar `route-view-transition.ts` (archivo del sitio público).

### D-10 Entrada escalonada: `[appStagger]` (R6.2)

Directiva en el contenedor (tbody, grilla, lista, stats). En `ngAfterViewInit`, si no hay
movimiento reducido, asigna `--stagger-i` a los primeros 12 hijos (`min(i, 11)`) y agrega
`.is-staggering`; la quita a los 700 ms. El CSS anima `fade + translateY(8px)` con
`animation-delay: calc(var(--stagger-i) * 40ms)` (12 × 40 ms + `--dur-fast` ≤ 700 ms).
Filas que aparecen después (filtro, alta) no animan porque la clase ya no está. Como los
contenedores se montan cuando terminan de cargar (D-12), la entrada coincide con la llegada
de los datos.

### D-11 `<app-count-up>` (R6.1, R6.2)

`value = input.required<number>()`, `format = input<'number'|'currency'>()`. Con
`requestAnimationFrame` interpola de 0 (o del valor anterior) al nuevo en 900 ms con
`easeOutExpo` y formatea con `Intl.NumberFormat('es-CO')` (moneda COP sin decimales). El
último frame escribe el valor exacto. Con `reducedMotion()` (de `motion/motion-preferences.ts`)
escribe el final sin frames. Texto visible con `aria-hidden` + `<span class="sr-only">` con el
valor final, para que el lector de pantalla no lea los intermedios. Cancela el frame al
destruirse.

### D-12 Estado de carga confiable y skeleton (R6.3)

`DataService`:
- `cargarTodo()` usa `finalize(() => _cargando.set(false))` (hoy un error deja `cargando`
  en `true` para siempre) y marca `_empresaCargada` solo en éxito.
- `listo = computed(() => !_cargando() && _empresaCargada() !== null)`.
- Las pantallas muestran `<app-skeleton>` mientras `!data.listo()` y el estado vacío solo con
  `listo()` y lista vacía. El error de carga dispara un toast desde la pantalla.

`<app-skeleton>`: variantes `table` (filas de barras), `cards` (tarjetas), `stats`
(indicadores). Brillo (`shimmer`) solo con `no-preference`; con `reduce`, bloques estáticos.
`aria-busy="true"` en la región y texto oculto "Cargando…".

### D-13 `DataService`: eliminar faltantes

`eliminarContrato(id, empresaId)` y `eliminarMantenimiento(id, empresaId)` siguen el patrón
existente (`http.delete` + `tap(recargar…)`). `eliminarLocal`, `eliminarPago`,
`eliminarUsuario` ya existen. Borrar un contrato recarga contratos; los indicadores del
dashboard son `computed` sobre los signals, así que se actualizan solos.

### D-14 Badges: `badges.ts`

Funciones puras `badgeEstado`, `badgePrioridad`, `badgeTipoPago` → `{ clase, etiqueta }` con
las clases `.badge--{danger|success|warning|info|neutral}` sobre los tokens `--sem-*`
(R1.5). Reemplazan `getBadgeClass`/`getPrioridadClass`/`getEstadoClass` y el
`'badge--' + tipo` del dashboard (R4.1). Las clases de color viejas (`--blue`, `--green`…) se
quitan.

### D-15 Formularios accesibles (R5.4)

`id` explícito por campo (`{pantalla}-{campo}`) y `for` en el `<label>`; obligatorios con
`required` + `aria-required` y el asterisco `aria-hidden`; `.error-msg` con `role="alert"`.
Locales muestra `errorMsg` y usa `guardando()` como las demás (R4.3).

### D-16 Pasarela sin doble pago (R4.4)

`pagando = signal(false)`; `confirmarPago()` sale si ya es `true`, lo pone en `true`, y lo
vuelve a `false` en `finalize`. El botón usa `[disabled]` y `aria-busy`. Éxito → cierra la
pasarela y `toast.exito('Pago registrado')`; error y "sin contrato" → `toast.error`.

### D-17 Movimiento: tokens y guardia

Toda animación y transición nueva de la app interna usa `--dur-fast`/`--dur-base`/
`--ease-out-expo`/`--ease-in-out` de `_motion.scss` y vive dentro de
`@media (prefers-reduced-motion: no-preference)`. Fuera de esa media query solo quedan
cambios de color instantáneos. Se reemplaza `transition: all` por propiedades explícitas.
Los keyframes `fadeIn`/`slideUp` se renombran con prefijo (`app-fade-in`, `app-rise-in`,
`app-sink-out`) para no chocar con keyframes del sitio público.

### D-18 Sidebar

Íconos pasan a `<app-icon>`; `aria-label` en colapsar y cerrar sesión; cerrar sesión pasa por
`ConfirmService` (variante neutral, "Cerrar sesión"). Avatares con
`color: var(--color-primario-contraste)`.

## Tests (test-after, Karma/Jasmine)

| Pieza | Qué cubre | CA |
|---|---|---|
| `color-contrast.spec` | ratio WCAG, las 4 empresas | CA2 |
| `badges.spec` | todos los valores + desconocido | CA3 |
| `icon.component.spec` | path por nombre, `aria-hidden` | CA1 |
| `modal.component.spec` | `showModal`, nombre, Escape/fondo/✕ emiten `closed`, foco inicial y de retorno, cierre inmediato con reduce (doble `MatchMediaStub`) | CA12 |
| `confirm.service.spec` + host | resuelve true/false, reemplazo, variante y texto | CA6 |
| `toast.service.spec` + host | alta, autocierre (`jasmine.clock`), máximo 3, cierre manual, `aria-live`/`role=alert` | CA7 |
| `count-up.component.spec` | valor final exacto (`AnimationFrameStub`), reduce sin frames, moneda | CA13 |
| `stagger.directive.spec` | clase e índices, nada con reduce, quita la clase | CA13 |
| `skeleton.component.spec` | variantes, `aria-busy` | CA14 |
| `app-layout.component.spec` | proyecta contenido, monta hosts | — |
| `data.service.spec` | `eliminarContrato`/`eliminarMantenimiento` (`HttpTestingController`), `cargando` vuelve a false con error, `listo` | CA4, CA14 |
| `auth.service.spec` (parcial) | publica y quita `--color-primario-contraste` | CA2 |
| `sidebar.component.spec` | logout pide confirmación; cancelar no sale | R3.2 |
| specs de las 6 pantallas | visibilidad por rol, flujo de eliminar (confirmar/cancelar/error), bugs R4.2–R4.4, skeleton/vacío, clases semánticas, sin emoji | CA1, CA4, CA5, CA9–CA11, CA14 |

Las pantallas se testean con `DataService`, `AuthService` y `ConfirmService` dobles
(signals controlables) para no depender de HTTP. CA8, CA15 y CA17 se verifican en `verify`
(búsqueda, `git diff --stat` y capturas CDP con Amarilo).

## Riesgos

- **Volumen:** muchas plantillas y specs nuevos; ver forecast en `tasks`.
- **Presupuesto de bundle:** las piezas nuevas entran en chunks lazy de la app interna;
  `AuthService` (inicial) solo suma `color-contrast.ts` (< 1 kB). `shared.styles.scss` es CSS
  global inicial: crece por tokens, botones, skeleton y view transitions (estimado + 3–4 kB
  sin comprimir); se mide en verify contra el presupuesto de `angular.json`.
- **Conflicto con `sitio-publico-expresivo`:** sin archivos en común salvo que ese cambio
  toque `shared.styles.scss` o `_motion.scss` (hoy no lo planifica). Si renombra o cambia
  tokens de `_motion.scss`, el rebase lo detecta.
- **`<dialog>` en Karma:** Chrome Headless soporta `showModal()`; las specs no dependen de
  animaciones reales (cierre inmediato con reduce o `animationend` disparado a mano).
- **Logs:** la política de `DEVELOPMENT_GUIDELINES.md` es de backend; en el frontend los
  errores inesperados se informan con toast y se mantiene `console.error` con contexto, sin
  datos personales.

## Enmienda 1 — breadcrumb, retroalimentación y botones de cancelar

### D-19 Breadcrumb propio en `<app-layout>` (R8)

`<app-layout>` recibe `pagina = input.required<string>()` y pinta, al inicio de
`main.main-content`, un `nav.app-breadcrumb[aria-label="Ruta"]` con `{empresa} › {pagina}`
(empresa desde `AuthService.empresaActiva`, enlace a `/dashboard` salvo cuando
`pagina === 'Inicio'`). Ícono `building` decorativo delante de la empresa.

- Descartado: reusar `components/public/breadcrumb`: publica JSON-LD `BreadcrumbList` vía
  `PageMetaService` (SEO del sitio público, sin sentido detrás del login) y usa los tokens de
  marca de KUVU en vez de los de la empresa.

### D-20 Retroalimentación (R9)

Sobre D-6/D-7: éxito de crear/editar/eliminar/cambiar estado/pagar → `ToastService.exito`;
errores de guardado se muestran en el modal (`.error-msg[role=alert]`) y además los de borrado
y cambio de estado → `ToastService.error`; error de carga → toast desde `<app-layout>`
observando un `errorCarga` de `DataService`. Validación: mensaje en el modal y
`aria-invalid` en los campos que faltan. Cerrar sesión ya navega a `/login` (la señal es la
navegación).

### D-21 Botones de cancelar y cerrar (R10)

Inventario: "Cancelar" de los modales de locales, contratos, mantenimiento, usuarios y de la
pasarela; "Cancelar" del diálogo de confirmación; ✕ de todos los modales (`.modal__close`);
"✕ Cancelar" de estado en mantenimiento. Los de descartar usan `.btn-secondary` (texto
`#344054` sobre blanco, ≈ 10:1) y `.modal__close` pasa a texto `--sem-neutral-fg` (≈ 7:1)
con hover `--sem-neutral-bg` (deja de ponerse rojo). "Cancelar solicitud" pasa a
`.btn-action--danger` con ícono `ban` y confirmación `danger`.
