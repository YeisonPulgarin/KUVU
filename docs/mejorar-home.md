# Mejorar Home Page

La página de inicio (`HomeComponent`) pasa a un layout responsivo mobile-first con navegación
por menú hamburguesa en pantallas pequeñas y Tailwind CSS v4 como sistema de estilos. La página
muestra el hero "Quienes Somos" y el contenido principal (sidebar + banner) apilados en una
columna en móvil y en dos columnas desde 768px.

## Cómo funciona

### Integración de Tailwind CSS v4

Tailwind v4 se integra vía PostCSS con el plugin `@tailwindcss/postcss`, declarado en
`fronted/proyecto_angular/postcss.config.json` (Angular 21 solo lee la config de PostCSS en
JSON). El punto de entrada global es `src/styles.css`:

- `@import "tailwindcss"` — carga las capas base/componentes/utilities.
- `@theme` — define los tokens de marca (`--color-brand-green`, `--color-brand-green-dark`).

No existe `tailwind.config.js`: en v4 la configuración vive en CSS (`@theme`), y Angular 21
solo lo usa como plugin de PostCSS si existe, lo que rompía el build.

Los estilos de componentes usan `@apply` dentro de cada `.scss`. Para que `@apply` resuelva
las utilidades de Tailwind en stylesheets de componente, cada archivo que lo use declara:

```scss
@reference "../../../styles.css";
```

`@reference` da acceso al theme y a las utilities sin duplicar el CSS de Tailwind en la salida.

### Menú móvil (`HomeComponent`)

- `isMobileMenuOpen: boolean` — estado del drawer móvil, inicial `false`.
- `toggleMenu()` — alterna el estado.
- En el HTML, el botón `#hamburger-toggle` (visible solo en móvil) bindea `[attr.aria-expanded]`
  y `aria-controls="mobile-menu"`; el drawer `#mobile-menu` usa
  `[class.hidden]="!isMobileMenuOpen"`. En `md:` (≥768px) el botón hamburguesa se oculta y el
  menú de escritorio (`nav-links`, `nav-actions`) se muestra en línea.

### Layout

- `.layout-grid` — 1 columna por defecto; desde 768px `grid-template-columns: 250px 1fr`
  (sidebar + banner).
- `@media (width >= 768px)` (sintaxis nativa de v4) reemplaza el breakpoint `md:` de v3.

## Decisiones

- **Tailwind v4 en vez de v3** — se instaló la versión 4.3.3. Cambia la forma de configurar
  (CSS-first con `@theme`, sin `tailwind.config.js`) y las media queries (`width >= 768px` en
  lugar de `@screen md`).
- **`@apply` en `.scss`, no clases utilitarias en el HTML** — se mantienen las clases
  semánticas (`.navbar`, `.layout-grid`, `.btn-primary`) y su estilo se compone con `@apply`.
  Tradeoff: el HTML queda limpio, pero el `.scss` de componentes require `@reference` y crece
  en tamaño (el componente excede el budget de 10 kB por ~830 bytes).
- **Menú hamburguesa nativo, sin librería UI** — se descartó Angular Material u otra librería
  para mantener el proyecto ligero y acoplado al diseño existente.

## Limitaciones conocidas

- `home.component.scss` supera el budget `anyComponentStyle` (10 kB) por ~830 bytes
  (10.83 kB). No rompe el build; si se quiere volver al budget puede consolidarse en un
  refactor futuro.
- La verificación de ausencia de overflow horizontal en 320–1920px queda pendiente de
  revisión visual en navegador real (no automatizada en la suite).
- `docs/architecture.md` es el template del instalador sin completar; la arquitectura del
  proyecto no está descripta todavía en ese archivo.