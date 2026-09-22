# Logo rediseño

El sitio usa un sistema de logo de 4 variantes en lugar de una única imagen: variante
completa (símbolo + nombre) y símbolo responsive, cada una en tema claro y oscuro. El logo se
adapta al tema activo y al tamaño de viewport, y el favicon es un PNG del símbolo light.

## Cómo funciona

Los assets viven en `frontend/proyecto_angular/public/logo-rediseno/`:

| Archivo | Uso |
|---|---|
| `logo-light.png` | Logo completo, tema claro |
| `logo-dark.png` | Logo completo, tema oscuro |
| `logo-responsive-light.png` | Símbolo, tema claro (móvil + favicon) |
| `logo-responsive-dark.png` | Símbolo, tema oscuro (móvil) |

Las rutas se centralizan en `src/app/content/logo.ts` (constante `as const`) y se exportan
desde `content/index.ts`; `content.spec.ts` garantiza que existan las 4 variantes y que no se
dupliquen.

- **Header y footer** (`site-header` / `site-footer`): cada uno renderiza dos `<img>` que
  conviven en el DOM — `.logo-img--full` (completo) y `.logo-img--responsive` (símbolo) — con
  `[src]` bindeado a `isDark() ? logo.dark : logo.light` (y su par responsive). El SCSS
  muestra el completo en `@media (width >= 768px)` y el símbolo por debajo. El `alt` es el
  nombre de marca.
- **Landing (`/acceder`), Login (`/login`) y Navbar**: usan `logo-dark.png` fijo (sus fondos
  son oscuros); sin variante responsive ni breakpoint propio.
- **Favicon**: `src/index.html` apunta a `/logo-rediseno/logo-responsive-light.png` con
  `type="image/png"`.

## Decisiones

- **Dos `<img>` + toggle por CSS** en el breakpoint `768px` en vez de `<picture>`/`srcset`: la
  variante activa depende del tema (estado de TS), no solo del viewport, y el toggle mantiene
  ambas imágenes en el DOM con `display` resuelto por el SCSS existente. Ver
  `refine-report` (`sin cambios necesarios`).
- **Rutas en una sola constante** (`content/logo.ts`): único punto de verdad testeable; los
  componentes consumen el objeto, no strings sueltos.
- **Sin `rounded-icon`**: los PNG tienen su propia forma; redondearlos los distorsionaría.

## Limitaciones conocidas

- El favicon **no cambia con el tema**: es el símbolo light fijo (decisión acordada).
- La variante responsive (símbolo) existe solo en header y footer; landing, login y navbar
  usan siempre el logo completo dark.
- El logo dark se generó por chroma-key a partir de exports JPEG del editor (que no traen
  transparencia real); el resultado es un PNG con alpha, pero si se re-generan los assets en
  el editor conviene exportar directamente a PNG transparente.