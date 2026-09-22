# Rediseño de la Home (UI/UX)

La página de inicio (`HomeComponent`, ruta `''`) pasa a un rediseño visual y de experiencia
completo sobre la identidad de KUVU: tipografía Geist, paleta verde de una sola escala,
espaciado con más aire, animaciones de entrada sutiles y un tema claro/oscuro conmutable por el
usuario. El contenido y los destinos no cambian: la página sigue mostrando hero, servicios,
compañías y llamada a la acción, todo dentro del mismo componente standalone.

## Cómo funciona

### Tokens de diseño (`src/styles.css`)

Es la única fuente de los tokens; los componentes los consumen vía `var(--color-*)` o `@apply`.

- `@import "tailwindcss"` + `@theme` definen la paleta:
  - Marca: `--color-brand-700` (`#2f4a2f`, CTA), `--color-brand-600` (`#3e5c40`), `--color-brand-500`
    (`#6b8e6b`, verde KUVU original), `--color-brand-100/200/300`.
  - Superficies de la home: `--color-home-bg`, `--color-home-surface`, `--color-home-surface-alt`,
    `--color-home-border`, `--color-home-text`, `--color-home-muted` (neutros tintados al verde).
  - Forma: `--radius-pill` (9999px), `--radius-card` (16px), `--radius-icon` (12px).
- `@custom-variant dark (&:where(.dark, .dark *))` habilita la variante `dark:` en Tailwind v4
  basada en la clase `.dark` del `<html>`.
- Los overrides de modo oscuro viven en un bloque `.dark { ... }` que redefine los tokens
  (`--color-home-bg`, `--color-brand-500`, `--color-brand-600`, `--color-brand-100`, etc.), de
  modo que las reglas de los componentes no necesitan condicionales por tema.
- `:focus-visible` global (outline 2px `brand-500`, offset 2px) garantiza foco visible en todos
  los elementos interactivos.

### Tema claro/oscuro (`home.component.ts` + `index.html`)

- `index.html` incluye un script inline en `<head>` que lee `localStorage['kuvu-theme']` y aplica
  la clase `.dark` **antes** de que cargue el bundle, evitando el destello de tema claro (FOUC).
  El script está envuelto en `try/catch`.
- `HomeComponent` mantiene `isDark`, lo inicializa en `ngOnInit` desde el storage y lo alterna con
  `toggleTheme()`, que llama a `applyTheme()` y persiste la preferencia.
- `readStoredTheme()` y `persistTheme()` envuelven el acceso a `localStorage` en `try/catch`: si
  el almacenamiento no está disponible (modo privado, storage deshabilitado), la home renderiza
  igual en lugar de romperse. La constante `THEME_KEY` (`'kuvu-theme'`) se duplica a propósito en
  el script inline: son dos runtimes distintos y el script corre antes del bundle.

### Animaciones y reveals (`home.component.ts`)

- El hero usa keyframes `rise-in` con stagger por elemento (0.12/0.24/0.36s).
- Los bloques de servicios y la lista de compañías se revelan al entrar en viewport: un
  `IntersectionObserver` observa los `[data-reveal]`, calcula `--reveal-index` por elemento y
  agrega la clase de revelado. El observer se desconecta en `ngOnDestroy`.
- Todo el movimiento está dentro de `@media (prefers-reduced-motion: no-preference)`; el bloque
  opuesto deja el contenido visible sin transición. `prefersReducedMotion` se evalúa una sola vez
  al construir el componente.

### Estructura de la página (`home.component.html` + `home.component.scss`)

- Navbar con botón de tema, CTA "Ingresar" y botón "Pagar" (estilo `.btn-outline`), más drawer
  móvil (`#mobile-menu`, `#hamburger-toggle` con `aria-expanded`).
- Servicios en split `lg:grid-cols-[1fr_1.5fr]` con lista `divide-y` de cinco `.service-row`
  (sin tarjetas idénticas).
- Compañías como wordmarks tipográficos (Amarilo, Nido Rent, Balcones de San Soucci, Mi Inmueble)
  en `.companies-list`, que también es un bloque con reveal.
- El SCSS usa `@apply` con `@reference "../../../styles.css"` (obligatorio en Angular 21 para que
  `@apply` resuelva el theme en stylesheets de componente).

## Decisiones

- **Dark mode por clase `.dark` con botón manual, no por `prefers-color-scheme`** — el usuario
  controla el tema y la elección persiste. Tradeoff: hace falta el script inline anti-FOUC y la
  duplicación de `THEME_KEY` entre el HTML y el componente.
- **Geist como tipografía del sistema, vía Google Fonts** — reemplaza a Syne/Inter en la home. La
  fuente se carga por red; una CSP futura que bloquee orígenes externos requiere self-hosting.
- **Una sola escala de verde (marca KUVU) con neutros tintados al verde** — el acento verde
  `#6b8e6b` se conserva como color principal y se evita mezclar escalas. Tradeoff: obliga a
  definir overrides de tokens en `.dark` para mantener contraste AA.
- **Servicios como lista editorial en lugar de tarjetas repetidas** — rompe el patrón de "N cards
  idénticas" que la guía de diseño prohíbe. Tradeoff: el componente no tiene cards, por lo que el
  token `--radius-card` queda definido sin uso.
- **Verdes sobre blanco en `brand-700` (`#2f4a2f`, ≈9.8:1)** para CTA y `brand-600` para hover de
  texto — garantiza contraste AA incluso cuando el token se ancla en el bloque `.dark`.

## Limitaciones conocidas

- `--radius-card` (16px), `--color-brand-200` y `--color-brand-300` están definidos en `@theme`
  sin uso actual en la home: son parte de la escala documentada del sistema.
- El botón de WhatsApp muestra el glifo blanco sobre `#25d366` (contraste ≈1.99:1). Es un botón
  solo-ícono (no texto) y conserva la convención de marca de WhatsApp.
- El budget `anyComponentStyle` en `angular.json` está en 17 kB (warning) / 20 kB (error):
  `home.component.scss` compila en ≈16 kB y lo roza. Un crecimiento del diseño puede volver a
  dispararlo.
- `docs/architecture.md` sigue siendo el template del instalador sin completar: la arquitectura
  del proyecto todavía no está descripta ahí.
- La verificación visual en navegador real (320–1920px) no está automatizada; la suite cubre
  comportamiento, no layout.
- `sdd/sdd.config.md` apunta el comando de test a `fronted/proyecto_angular` (directorio que ya no
  existe); el real es `frontend/proyecto_angular`.
