# Logo real y responsive

El frontend Angular de KUVU usa la imagen `Logo_Kuvu.jpeg` como marca real en las cuatro
superficies públicas (HomePage, Login, Landing y navbar interno), reemplazando los placeholders
CSS/emoji anteriores, y la aplicación es responsiva para navegador móvil en toda la app
(área pública y panel admin). La antigua app Flutter (`kuvu_mobile/`) se eliminó del repo.

## Cómo funciona

### Logo

- El logo vive en `fronted/proyecto_angular/public/Logo_Kuvu.jpeg` y se sirve como `/Logo_Kuvu.jpeg`.
- Se renderiza con `<img>` en `home.component.html`, `login.component.html`, `landing.component.html` y `navbar.component.html`, con tamaños adaptados por contexto (clases `brand-logo-img`, `logo-img`, `navbar__logo-img`).
- El texto "KUVU" que acompañaba a la imagen se removió porque la imagen ya lo contiene; los taglines se conservan. En el navbar interno se mantiene el nombre de la empresa del usuario (no KUVU).

### Responsive

- **Breakpoints estándar del proyecto** (definidos en la fase design): `<640px` móvil, `640–767px` tablet pequeña, `768–1023px` tablet, `>=1024px` desktop, `>=1280px` desktop grande. Móvil se declara con `max-width` y desktop con `min-width`.
- **Área pública:** HomePage (`home.component.scss`), Login y Landing (`login/landing.component.scss`) usan `overflow-x: hidden`, tapetes de 44–48px y layouts en 1 columna en móvil.
- **Sidebar admin** (`sidebar.component.ts|html|scss`): en móvil (`≤767px`) funciona como overlay — hamburger flotante de 44px (`.sidebar__mobile-toggle`, solo en móvil), backdrop oscuro (`.sidebar__backdrop`, cierra al tocar fuera), el sidebar ocupa el ancho completo (240px) con z-index 200 y se cierra automáticamente al navegar (`NavigationEnd`). El estado lo manejan las signals `menuAbierto` y `esMobile` (matchMedia 767px con listener limpiado por `DestroyRef`). `mostrarTexto` computa que en móvil se muestren siempre los textos aunque el sidebar venga colapsado del desktop.
- **Dashboard:** stats 1 columna en móvil, 2 en tablet, 4 en desktop; tablas con scroll horizontal dentro de su contenedor (`.tabla min-width: 560px`).
- **Tablas (contratos, pagos, locales):** scroll horizontal indicado vía scrollbar fina global dentro de `.card`/`.panel` (`overflow-x: auto`, `.tabla min-width: 600px`).
- **Filtros y cards:** en móvil los filtros se apilan (inputs `width: 100%`), `.mant-card` es columna y `.usuario-card` hace wrap; botones `.btn-*` y `.btn-icon` tienen `min-height/width 44px`.
- **Touch targets:** todos los elementos interactivos tienen tamaño mínimo 44×44px en móvil.
- El `.main-content` del admin recibe `padding-top: 4.5rem` en móvil para no quedar cubierto por el hamburger flotante.

## Decisiones

- **Sidebar como overlay (drawer) en móvil, no colapsado** — el estado colapsado es exclusivo de desktop; en móvil siempre ancho completo y expandido. Tradeoff: requiere dos modelos de estado (signals `menuAbierto`/`esMobile`), pero preserva el área de trabajo.
- **Scroll de tablas con scrollbar fina estilo indicador**, en vez de sombra degradada — más simple y consistente con la estética actual.
- **`styleUrls` de logout del sidebar con `mostrarTexto`** (computed) para que textos de links y usuario queden visibles en móvil aunque venga del estado colapsado de desktop.

## Limitaciones conocidas

- `home.component.scss` supera el budget de style (warning 10 kB en el build) — pendiente de revisión futura.
- `docs/architecture.md` sigue siendo el template del instalador sin completar (pendiente de un cambio mayor).
- La versión anterior en Flutter (`kuvu_mobile/`) sigue en el historial de git; fue eliminada del working tree.
- Google Fonts se cargan inline y superan el budget de warning (preexistente).