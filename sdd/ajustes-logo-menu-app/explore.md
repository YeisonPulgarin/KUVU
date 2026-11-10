# Explore — ajustes-logo-menu-app

## Pedido

Cinco ajustes de UI en el frontend Angular (`frontend/proyecto_angular`):

1. Usar el logo responsive (símbolo) también en escritorio, en tema claro y oscuro.
2. Bug: el menú móvil no abre cuando la página está scrolleada.
3. Más dinamismo en el menú: que el hover y la opción activa se noten.
4. El logo de KUVU casi no se ve en `/acceder` (búsqueda de inmobiliarias).
5. Botones "Cancelar" con mejor estilo, a la altura de los "Eliminar", y una textura de fondo
   en las vistas de la app interna, **para todos los roles** (Administrador y Arrendatario).

## Contexto del proyecto

`sdd/sdd-init.md`: Angular 21 + Tailwind v4, tests Karma (`ng test`), modalidad `test-after`,
almacenamiento `files`. Slices involucrados: `contenido` (`content/logo.ts`), `chrome`
(site-header, site-footer), `intro` (landing `/acceder`, login), `app` (shared.styles,
confirm, pantallas internas), `cierre`.

Los cambios `bd-docker` y `mejorar-home` no tienen `archive-report`, pero su trabajo está
mergeado en ramas/PRs previos y no se retoman (ver memoria: nada en curso).

## Qué existe hoy

### Logos

- `content/logo.ts` exporta `logo.web` (`/logo-rediseno/Logo_Kuvu.png`, 703×271, símbolo +
  wordmark "KUVU" en gris muy oscuro) y `logo.responsive` (`/logo-rediseno/Logo_Responsive.png`,
  284×223, solo el símbolo K en verdes). Los dos PNG tienen fondo transparente (88 % y 78 % de
  píxeles con alfa < 10). No hay variantes por tema.
- `site-header`: dos `<img>`; `.logo-img--full` (web) visible desde 768 px, `.logo-img--responsive`
  visible por debajo de 768 px. Mismo asset en claro y oscuro.
- `site-footer`: el mismo par, con el mismo corte en 768 px.
- Usan `Logo_Kuvu.png` con ruta literal (no `content/logo.ts`): `landing` (`/acceder`),
  `login`, `cambiar-password`, `navbar` (app interna) y `auth-intro` (logo revelado en la intro).

### Menú móvil (site-header)

- `:host` es `position: sticky; top: 0`. El panel `.mobile-menu` es `position: fixed;
  inset: 64px 0 0 0` (56 px en compacto) dentro de `.site-header`.
- Al pasar 24 px de scroll el host recibe `.is-compact`, y `.site-header` gana
  `backdrop-filter: saturate(1.4) blur(12px)` (bajo `@supports`).
- **Causa raíz del bug:** un `backdrop-filter` distinto de `none` convierte al elemento en
  bloque contenedor de sus descendientes `position: fixed`. Con la página scrolleada, el panel
  deja de posicionarse contra el viewport y queda contra `.site-header` (56 px de alto):
  con `inset-block-start: 56px; bottom: 0` su alto es ≤ 0, así que se "abre" pero no se ve.
  En el tope de la página (sin `.is-compact`) funciona, que es lo que reporta el usuario.
- Estados actuales: en escritorio, `.nav-item` tiene subrayado que crece (`::after scaleX`)
  y color de marca en hover/activo. En el panel móvil, `.mobile-item` solo cambia de color en
  hover/activo; no hay fondo, indicador ni movimiento. `routerLinkActive="is-active"` y
  `aria-current="page"` ya están en ambos.

### Landing `/acceder`

- Fondo: foto (`/login-backgrounds/kuvu.webp`) + overlay oscuro `rgba(7,5,20,.75)`–`.80`.
- `.brand-logo-img` (160 px; 132 px en móvil) muestra `Logo_Kuvu.png` transparente: el
  wordmark gris oscuro y el verde oscuro del símbolo quedan sobre un fondo casi negro, por eso
  "prácticamente no se ve". Tiene `border-radius` y `box-shadow` que no aportan nada sobre un
  PNG transparente.
- `login` (`/login`) y `cambiar-password` usan el mismo patrón (foto + overlay oscuro +
  `Logo_Kuvu.png`), con el mismo problema de contraste.

### App interna — botones y fondo (ambos roles)

Roles: `esAdmin()` decide entre Administrador y Arrendatario. Sidebar: Dashboard, Contratos,
Pagos y Mantenimiento para los dos; Locales y Usuarios solo para Administrador.

Botones "Cancelar" (todos `.btn-secondary`, en `.modal__footer`):

| Vista | Rol que la ve | Ubicación |
|---|---|---|
| `contratos` | Admin (formulario de contrato) | `contratos.component.html:122` |
| `locales` | Admin | `locales.component.html:99` |
| `pagos` | Admin (registro de pago) | `pagos.component.html:119` |
| `mantenimiento` | Admin ("Registrar") y Arrendatario ("Solicitar mantenimiento") | `mantenimiento.component.html:179` |
| `usuarios` | Admin (dos modales) | `usuarios.component.html:167`, `:212` |
| `confirm-host` (diálogo de confirmación compartido) | Ambos — "Cancelar" o "Volver" (`cancelarTexto`) | `shared/confirm/confirm-host.component.ts:30` |

- `.btn-secondary` en `.app-layout`: fondo blanco, borde `--sem-neutral-border`, texto
  `#344054`, hover a `--sem-neutral-bg`. Sin ícono. Se ve plano al lado del primario.
- "Eliminar" usa `.btn-action--danger` (tinte semántico `--sem-danger-*` en reposo, hover más
  intenso, ícono `trash`); el diálogo confirma con `.btn-solid--danger`. "Cancelar solicitud"
  del arrendatario en mantenimiento ya es `.btn-action--danger` (no es un botón de descartar).
- `.btn-primary`/`.btn-secondary` globales (fuera de `.app-layout`) también los usa el sitio
  público; el refinamiento de la app vive scopeado en `.app-layout` (`shared.styles.scss:222`).
- Fondo: `.main-content` (`styles.css:132`) es `background: var(--color-bg)` (`#F0F4F8`),
  plano. `.modal` es blanco con footer `#fafbfc`. La app interna no tiene tema oscuro.
- Ya existe una textura reutilizable: `$grain` (SVG `feTurbulence` inline) en
  `src/styles/_site.scss`, usada por `.site-root` con `--grain-opacity`; y las primitivas
  `.surface-dots` / `.surface-tint`. Son del sitio público, no se cargan en la app interna
  por scope.

## Archivos relevantes

| Archivo | Rol |
|---|---|
| `src/app/content/logo.ts` | contrato de rutas de logo |
| `src/app/components/public/site-header/site-header.component.{html,scss,ts,spec.ts}` | logo del header, nav escritorio, panel móvil (bug) |
| `src/app/components/public/site-footer/site-footer.component.{html,scss}` | logo del footer |
| `src/app/components/landing/landing.component.{html,scss,spec.ts}` | logo poco visible en `/acceder` |
| `src/app/components/login/login.component.{html,scss}`, `cambiar-password/*` | mismo patrón de logo sobre fondo oscuro |
| `src/app/components/shared/navbar/navbar.component.html`, `auth-intro/*` | otros usos de `Logo_Kuvu.png` |
| `src/app/components/shared/shared.styles.scss` | `.btn-secondary`, `.btn-action--*`, `.modal`, `.confirm` |
| `src/app/components/shared/confirm/confirm-host.component.ts` | Cancelar/Volver del diálogo de confirmación |
| `src/app/components/{contratos,locales,pagos,mantenimiento,usuarios}/*.html` | modales con Cancelar |
| `src/styles.css` (`.main-content`, tokens), `src/styles/_site.scss` (`$grain`) | fondo de la app y textura existente |

## Ambigüedades para el Gate A

1. **Alcance del logo responsive.** El pedido nombra "escritorio y responsive, en sus dos
   modos": se entiende header del sitio público, tema claro y oscuro. ¿Aplica también al
   footer (hoy tiene el mismo swap web/responsive)? ¿Y a landing, login, cambiar-contraseña,
   navbar e intro, que hoy muestran el logo completo con wordmark?
2. **Cómo hacer visible el logo en `/acceder`.** Opciones: (a) usar el símbolo responsive y
   agregar el nombre "KUVU" como texto claro; (b) mantener el logo completo sobre una placa
   clara (pastilla/tarjeta blanca translúcida); (c) aclarar el logo con CSS (`filter`) solo en
   esa vista; (d) un asset nuevo en versión clara (requiere que el usuario lo provea). ¿Se
   extiende el mismo arreglo a `/login` y `/cambiar-contrasena`, que tienen el mismo problema?
3. **Dinamismo del menú.** ¿Va en el panel móvil y también en el nav de escritorio (que ya
   tiene subrayado animado)? Para el móvil, ¿indicador de opción activa tipo barra lateral +
   fondo tintado y leve desplazamiento en hover, o alguna referencia concreta?
4. **Estilo de "Cancelar".** ¿Neutral tintado en reposo con ícono (equivalente gris a
   `btn-action--danger`), o contorno más marcado sin ícono? ¿Incluye "Volver" del diálogo de
   confirmación (mismo botón)?
5. **Dónde va la textura.** ¿Fondo de página de la app interna (`.main-content`, todas las
   pantallas de ambos roles), también dentro de modales/tarjetas, o solo en modales?
   ¿Tipo grano (como el sitio público) o patrón de puntos/líneas sutil?

## Decisiones del Gate A

Modo de ejecución: automático (los Gates C y E se respetan). Modalidad de tests: `test-after`.

1. **Header:** muestra solo el símbolo (`logo.responsive`) en escritorio y móvil, claro y
   oscuro. **Footer:** sin logo; el bloque de marca conserva el texto "KUVU".
   Navbar interna e intro (`auth-intro`) mantienen el logo completo.
2. **`/acceder`, `/login` y `/cambiar-contrasena`:** símbolo + el texto "KUVU" en blanco.
   El usuario pidió que estas tres vistas "dejen el logo completo" y también que lleven el
   arreglo (a); prevalece el pedido más específico (a), que es el que resuelve la
   visibilidad.
3. **Panel móvil:** hover con leve desplazamiento a la derecha y fondo tintado; ítem activo
   con barra lateral de acento y fondo suave. El nav de escritorio queda igual. Se corrige el
   bug del panel con scroll (bloque contenedor creado por `backdrop-filter`).
4. **Cancelar:** mismo estilo que Eliminar (`.btn-action--danger`, tinte rojo semántico) con
   ícono "x", en todos los roles; incluye "Cancelar"/"Volver" del diálogo de confirmación.
5. **Textura:** grano reutilizando `$grain` en el fondo de `.main-content` (todas las
   pantallas internas, ambos roles). Los modales quedan lisos.

## Requisito sumado: botón "Volver arriba"

El usuario suma al mismo cambio un botón flotante "Volver arriba" para todas las páginas
(sitio público, acceso y app interna, todos los roles). Lo que existe hoy:

- `app.ts` (`AppComponent`) solo monta `<router-outlet>`; no hay pieza global flotante.
- **Contenedores de scroll distintos:** el sitio público y el acceso (`/acceder`, `/login`,
  `/cambiar-contrasena`) scrollean la ventana. La app interna scrollea `.main-content`
  (`height: 100vh; overflow-y: auto`, `styles.css:132`), no la ventana.
- **Elementos flotantes y capas:** header público sticky (`z-index: 50`, panel móvil
  adentro); barra de progreso de la home (`z-index: 60`, arriba); grano de `.site-root`
  (`z-index: 60`, decorativo, sin eventos); toasts de la app (`z-index: 400`, abajo a la
  derecha en escritorio y arriba en móvil); sidebar móvil (toggle `250` arriba a la
  izquierda, backdrop `150`, panel `200`); intro de acceso (`z-index: 200`, pantalla
  completa). No hay botón de WhatsApp flotante (está en el header).
- Movimiento: `motion/motion-preferences.ts` expone `reducedMotion()`; dobles de
  `matchMedia` en `motion/testing/match-media.stub.ts`. `IconComponent` no tiene una flecha
  hacia arriba (sí `x`, `trash`, `ban`, …).
