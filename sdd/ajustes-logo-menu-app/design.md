# Design — ajustes-logo-menu-app

Requisitos: ver `spec.md` (R1–R7). Rutas relativas a `frontend/proyecto_angular/src/`.

## D1 — Header y footer (R1, R2)

- `site-header.component.html`: una sola `<img [src]="logo.responsive" class="logo-img">` en
  `.logo-link`. Se eliminan `.logo-img--full`/`--responsive` y sus reglas por breakpoint en el
  SCSS. Alto: `h-12` en todos los anchos (el símbolo es casi cuadrado, 284×223).
- `site-footer.component.html`: se elimina `.footer-logo` y sus reglas. `.footer-name`
  ("KUVU.") queda como marca.
- `content/logo.ts` no cambia: `logo.web` sigue en el contrato porque lo describen
  `docs/` y los tests de contenido. Navbar e intro usan su ruta literal y no cambian.

## D2 — Bug del panel móvil (R3)

**Causa:** `backdrop-filter` en `.site-header` (estado compacto) crea un bloque contenedor
para los descendientes `position: fixed`; el panel `.mobile-menu` pasa a medirse contra un
header de 56 px y queda con alto ≤ 0.

**Decisión:** la superficie del header (color, translucidez y desenfoque) pasa a un
`.site-header::before` absoluto (`inset: 0; z-index: -1; pointer-events: none`). `.site-header`
queda `position: relative` sin fondo propio ni `backdrop-filter`, y el panel vuelve a medirse
contra el viewport. El `:host` sticky con `z-index: 50` ya es el contexto de apilamiento, así
que el `::before` con `z-index: -1` queda detrás del contenido del header y delante de la
página. No se agrega `isolation` ni `z-index` en `.site-header` para no introducir otra raíz de
backdrop que anule el desenfoque. El `box-shadow` del estado compacto se queda en
`.site-header` (no crea bloque contenedor).

**Descartado:** sacar el panel fuera de `<header>` (portal o hermano). Cambia la estructura,
los tests de foco/inert y el `aria-controls`, para el mismo resultado.

## D3 — Estados del panel móvil (R4)

- El separador inferior pasa de `.mobile-item` a `.mobile-entry` (el `<li>`), para que el
  desplazamiento del enlace no arrastre la línea.
- `.mobile-item`: `padding-inline: .75rem`, `border-radius: 10px`.
  - Hover / `:focus-visible`: fondo `color-mix(in srgb, var(--color-brand-600) 8%, transparent)`
    y color de marca; dentro de `prefers-reduced-motion: no-preference`, `translateX(6px)` con
    `--dur-fast`/`--ease-out-expo`.
  - `.is-active`: fondo `color-mix(... 12% ...)` y barra lateral de acento con
    `box-shadow: inset 3px 0 0 var(--color-brand-600)` (sin elemento extra ni cambio de layout).
- Todo con tokens existentes de `styles.css`; en `.dark` los tokens de marca ya se
  redefinen, sin reglas nuevas por tema.

## D4 — Marca del acceso (R5)

- Plantillas de `landing`, `login` y `cambiar-password`: `.brand-lockup` con
  `<img [src]="logo.responsive" alt="" class="brand-logo-img">` y
  `<span class="brand-wordmark">KUVU</span>`. En landing va dentro del `a.brand-link` (que
  conserva su `aria-label`); en login/cambiar-password el texto visible da el nombre (la imagen
  es decorativa, `alt=""`). Los tres componentes importan `logo` de `content/logo.ts`.
- Estilos en `landing.component.scss` y `login.component.scss` (este último lo comparte
  `cambiar-password`): `.brand-lockup` flex en fila; símbolo de 56 px de alto (48 px en
  móvil), sin `border-radius` ni `box-shadow`, con `filter: drop-shadow` suave para separarlo
  del fondo; `.brand-wordmark` en `var(--font-display)`, blanco, 700, `letter-spacing: .08em`,
  `clamp(2rem, 6vw, 2.6rem)`, con `text-shadow` leve.
- **Descartado:** `filter: invert/brightness` sobre el PNG completo (altera los verdes del
  símbolo) y placa clara (no pedida).

## D5 — Botones de descarte (R6)

- Plantillas: `class="btn-action btn-action--danger"` + `<app-icon name="x" />` en los
  Cancelar de `contratos`, `locales`, `pagos`, `mantenimiento`, `usuarios` (×2) y en el
  descarte de `confirm-host`. Todos ya importan `IconComponent`. `(click)`, `autofocus` y
  textos no cambian.
- `shared.styles.scss`: `.modal__footer .btn-action` toma la medida del primario del pie
  (`padding: .6rem 1.3rem; font-size: .84rem; border-radius: 9px; font-weight: 700`). El
  `min-height: 44px` táctil existente ya cubre a `.btn-action`.
- `.btn-secondary` queda definido (lo usa el sitio público y otros botones), solo deja de
  usarse en estos pies.

## D6 — Textura de la app interna (R7)

- `$grain` se mueve de `styles/_site.scss` a un parcial nuevo `styles/_grain.scss` que solo
  declara la variable (sin CSS emitido). `_site.scss` y `shared.styles.scss` lo cargan con
  `@use`, así el SVG queda en una sola fuente y no se duplican reglas.
- `shared.styles.scss`: `.app-layout .main-content` con
  `background: linear-gradient(color-mix(in srgb, var(--color-bg) 93%, transparent) 0 0), $grain var(--color-bg);`
  y `background-size: auto, 180px 180px`. Es solo fondo: no hay capa encima del contenido, no
  intercepta eventos y no afecta el contraste. `.main-content` es el contenedor con scroll y
  su fondo usa `background-attachment: scroll` (default), así que el grano queda quieto
  mientras el contenido se desplaza.
- **Descartado:** pseudo-elemento fijo como en `.site-root`: con el sidebar y el margen
  variable (colapsado/móvil) habría que replicar el `inset`, y pinta encima del contenido.

## D7 — Botón "Volver arriba" (R8)

- Componente standalone `components/back-to-top/back-to-top.component.ts` (estilos
  inline, sin `@apply`: va en el bundle inicial), montado una sola vez en `AppComponent`
  después de `<router-outlet>`.
- **Seguimiento del contenedor:** un único listener `scroll` en `document` con
  `{ capture: true, passive: true }` (el evento `scroll` de un elemento no burbujea, pero sí
  pasa por la fase de captura). Si el `target` es el `document`, el contenedor es la ventana
  (`scrollY` vs `innerHeight`); si es un elemento que cumple `.main-content`, es ese elemento
  (`scrollTop` vs `clientHeight`); cualquier otro target se ignora. Se registra en
  `afterNextRender` y se quita en `DestroyRef`. Una señal `visible` guarda el estado y el
  contenedor activo se guarda en un campo privado.
- `NavigationEnd` reinicia: `visible = false` y contenedor = ventana (la vista nueva
  arranca arriba y el `.main-content` anterior se destruye).
- **Acción:** `contenedor.scrollTo({ top: 0, behavior: reducedMotion() ? 'auto' : 'smooth' })`.
- **Estado oculto:** `visibility: hidden; opacity: 0; transform: translateY(12px) scale(.9)`,
  con la transición dentro de `prefers-reduced-motion: no-preference` (y el retardo de
  `visibility` para que el fade de salida se vea). Oculto también es no enfocable y sale del
  árbol de accesibilidad por `visibility`.
- **Apariencia:** círculo de 48 px, fondo `var(--color-brand-700)`, ícono blanco (SVG inline de
  flecha, `aria-hidden`), sombra; hover `translateY(-2px)`; `:focus-visible` con anillo. Los
  tokens de marca existen en `:root` y en `.dark`, así que el botón funciona en los dos temas y
  en la app interna. Posición: `right/bottom: max(1.25rem, env(safe-area-inset-*))`.
- **Capas:** `z-index: 45`. Debajo del header público (50, que contiene el panel móvil),
  del sidebar móvil (150–250) y de los toasts (400); los `<dialog>` van en el top layer.
- **Descartado:** una instancia por layout (`app-public-page`, home, `app-layout`, acceso):
  cuatro montajes y la misma lógica repetida. Un `IntersectionObserver` sobre un centinela:
  necesita un centinela distinto por contenedor.
- El SVG va inline en el componente y no se agrega al `IconComponent` porque este vive en el
  scope de la app interna.

## Tests (test-after, Karma)

Specs a ajustar o ampliar: `site-header`, `home` (logo del header), `site-footer`,
`landing`, `login`, `cambiar-password`, `confirm`, los de cada pantalla con Cancelar y uno
nuevo para `back-to-top`.
No hay logs nuevos (solo plantillas y estilos), por lo que la política de logs de
`DEVELOPMENT_GUIDELINES.md` no aplica.

## Documentación (alcance para `document`)

`docs/ajustes-logo-menu-app.md`, actualización de `docs/logo-web-responsive.md` si describe el
header/footer, entrada en `CHANGELOG.md`. `docs/architecture.md` no cambia (sin cambios
estructurales).
