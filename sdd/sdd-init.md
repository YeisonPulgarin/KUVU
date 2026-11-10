stack: Angular 21, TypeScript, RxJS (frontend/proyecto_angular) / Node.js 22 + Express 4 + mysql2 + bcryptjs (backend/) / MariaDB 10.4 en Docker
test_command: ng test (frontend) / npm test (backend, node --test)
test_mode: test-after
config_found: true
slices_declarados: [backend-orden, contenido, chrome, paginas, home, intro, app, cierre]
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
- Sitio público expresivo: los titulares usan `--font-display` (Big Shoulders Display,
  autohospedada en `public/fonts/` con `@font-face` en `styles.css`). Una fuente display nueva
  se autohospeda; nunca se agrega con `@import` de Google en un componente (se incrusta y
  dispara `css-inline-fonts`). La escala fluida (`--text-display-xl/l/m`, `--text-lead`,
  `--text-body-site`) está en `@theme static`.
- `src/styles/_site.scss` concentra las primitivas del sitio público: `.site-root` (raíz de
  home y `app-public-page`: cuerpo fluido y grano fijo), `.surface-dots`, `.surface-tint`,
  `.block-brand` (texto en el alias `--color-on-brand`), `.display-title(--xl|l|m)`, `.tape`,
  `.btn-site(--ghost)`, `.site-section`, `.site-cta`. Los botones "Ingresar" conservan
  `.btn-primary` azul.
- Titulares con énfasis: `content/headlines.ts` (`Headline`, `HeadlinePart`) y
  `<app-headline>`. La invariante `headlineText(parts) === title` está testeada: partir un
  titular no cambia sus palabras.
- Las páginas rediseñadas no usan eyebrows numerados (`.section-eyebrow` queda solo en
  `/legal`). Los specs que cambian el tema limpian `kuvu-theme` y `.dark` en `afterEach`.
- Flujo de acceso (`/acceder`, `/login`): las salidas son enlaces o botones de texto chico con
  chevron (`.back-btn` en `/login` → `/acceder`; `.back-home` y el logo `.brand-link` en
  `/acceder` → `/`). En `/acceder` viven dentro de `.landing-container`, así heredan el `inert`
  de la intro sin lógica propia. Sobre la foto oscurecida, el foco visible usa el celeste
  `rgba(140, 215, 255, .9)` en lugar del `--color-brand-500` global.
- Marca: el header público muestra solo el símbolo (`logo.responsive`) en todos los anchos y
  temas, y el footer no lleva imagen de logo (la marca es el texto `.footer-name`). En
  `/acceder`, `/login` y `/cambiar-contrasena` la marca es `.brand-lockup` (símbolo +
  `.brand-wordmark` "KUVU" en blanco), con estilos en `components/login/brand-lockup.scss`,
  que las tres vistas suman por `styleUrls`. Las hojas de landing y login incrustan Google
  Fonts y están cerca del presupuesto `anyComponentStyle` (error en 20 kB), así que los
  estilos nuevos de esas vistas van en una hoja aparte. Navbar e intro usan el logo completo.
- Header público: la superficie (color, translucidez y `backdrop-filter`) vive en
  `.site-header::before`. Ningún ancestro del panel `.mobile-menu` (`position: fixed`) lleva
  `backdrop-filter`, `filter` ni `transform`, porque se volvería su bloque contenedor y el
  panel colapsaría con la página scrolleada.
- `<app-back-to-top>` (`components/back-to-top/`): un solo botón "Volver arriba" montado en
  `AppComponent` para todas las rutas. Sigue la ventana o `.main-content`
  (`APP_SCROLLER_SELECTOR`) con un listener `scroll` en captura sobre `document`, y usa
  `z-index: 45` (debajo del header 50, el sidebar móvil 150–250 y los toasts 400). Un
  contenedor de scroll nuevo de página entera se agrega a ese selector.
- Grano: `$grain` se declara en `src/styles/_grain.scss`, que no emite CSS. Lo usan
  `_site.scss` (`.site-root`) y `shared.styles.scss` (`.app-layout .main-content`) con
  `@use`.

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
- Botones: `.btn-primary` (un CTA por pantalla), `.btn-action--{rol}` para acciones de fila
  (`--icon` para solo ícono, con `aria-label`) y `.btn-solid--{rol}` solo en el diálogo de
  confirmación. Mapeo: editar e iniciar → `info`, completar → `success`, eliminar y
  cancelar solicitud → `danger`. Los botones de descarte de modales y del diálogo de
  confirmación ("Cancelar", "Volver") son `.btn-action--danger` con `<app-icon name="x">`
  (decisión del usuario). En `.modal__footer` y `.pasarela-actions` toman la medida del
  primario. `.btn-secondary` queda para acciones neutras como "Descargar PDF".
- Fondo: `.app-layout .main-content` lleva grano bajo un velo de `--color-bg` al 93 %; los
  modales y las tarjetas son lisos.
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

## Convenciones del backend relevantes para próximos cambios

- `backend/auth/`: contraseñas (`password.js`, bcryptjs costo 12), política (`password-policy.js`,
  lista negra en `common-passwords.js`), credenciales y bloqueo por intentos (`credentials.js`),
  autorización de administrador por re-verificación de credenciales (`admin.js`) y logs JSON de
  autenticación con allowlist de campos (`auth-log.js`). La API no tiene sesión: una operación
  sensible se autoriza con las credenciales completas de quien la pide.
- Las consultas de `usuarios` enumeran columnas: nunca `SELECT u.*` (el hash y el estado de bloqueo
  no salen del servidor).
- Esquema de BD: `db/init/01-02` son el dump base; los cambios de esquema van en scripts
  idempotentes y solo aditivos (`03-…`), que corren en una instalación nueva y se aplican a mano a
  una BD existente después de un respaldo en `db/backups/`.
- Tests de rutas: `backend/test/helpers/fake-db.js` (doble de `mysql2` que responde por forma de
  SQL) y `route-harness.js` (Express efímero con el doble instalado en `require.cache`).
