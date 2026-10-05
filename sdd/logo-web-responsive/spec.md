# Spec — logo-web-responsive

Extensión `validate` no activa — no hay contrato externo duro contra el que contrastar esta
spec.

## Requisitos funcionales

### RF1 — Header público con logo único por viewport

- El header del sitio público muestra el logo **web** (`/logo-rediseno/Logo_Kuvu.png`) en
  viewports `>= 768px` y el logo **responsive** (`/logo-rediseno/Logo_Responsive.png`) en
  viewports `< 768px`.
- Ambas imágenes conviven en el DOM; la visibilidad las resuelve el SCSS del componente en el
  breakpoint `768px`.
- El `alt` de ambas es el nombre de marca (`KUVU`).
- El logo **no cambia con el tema**: en tema claro y oscuro la `src` es la misma.
- El logo web es legible sobre el fondo del header en tema claro y en tema oscuro.

### RF2 — Footer público con logo único por viewport

- El footer aplica el mismo criterio del header: logo web en `>= 768px`, logo responsive por
  debajo, sin swap por tema.
- El `alt` de ambas es el nombre de marca.

### RF3 — Landing, login y navbar con logo web

- `/acceder` y `/login` muestran el logo web (`/logo-rediseno/Logo_Kuvu.png`).
- La navbar post-login muestra el logo web.
- Ninguno de los tres tiene variante responsive ni breakpoint propio.

### RF4 — Favicon

- `index.html` declara el favicon con `type="image/png"` apuntando a
  `/logo-rediseno/Logo_Responsive.png`.

### RF5 — Contrato de contenido

- `content/logo.ts` expone exactamente dos entradas: `web` y `responsive`, con esas rutas, y
  sus valores son distintos entre sí.

### RF6 — Eliminación de las variantes anteriores

- No queda ninguna referencia en el código de producción a `logo-light.png`, `logo-dark.png`,
  `logo-responsive-light.png` ni `logo-responsive-dark.png`, ni a las claves `light`, `dark`,
  `responsiveLight`, `responsiveDark` del objeto de logo.

## Criterios de aceptación

1. `content.spec.ts`: `logo.web` es `/logo-rediseno/Logo_Kuvu.png` y `logo.responsive` es
   `/logo-rediseno/Logo_Responsive.png`; el conjunto de valores tiene 2 entradas distintas.
2. `site-header.component.spec.ts`: `.logo-img--full` tiene `src` = `logo.web` y
   `.logo-img--responsive` tiene `src` = `logo.responsive`, ambos con `alt` = `KUVU`.
3. `site-header.component.spec.ts`: tras alternar el tema, las dos `src` del header **siguen
   siendo** `logo.web` y `logo.responsive`.
4. `site-footer.component.spec.ts`: `.footer-logo--full` = `logo.web` y
   `.footer-logo--responsive` = `logo.responsive`; alternar el tema no las cambia.
5. `landing.component.spec.ts`: `.brand-logo-img` = `/logo-rediseno/Logo_Kuvu.png`.
6. `login.component.spec.ts`: `.brand-logo-img` = `/logo-rediseno/Logo_Kuvu.png`.
7. `navbar.component.spec.ts`: `.navbar__logo-img` = `/logo-rediseno/Logo_Kuvu.png`.
8. `home.component.spec.ts`: `.logo-img--full` = `/logo-rediseno/Logo_Kuvu.png`.
9. `index.html`: `<link rel="icon" type="image/png" href="/logo-rediseno/Logo_Responsive.png">`.
10. Búsqueda de `logo-light|logo-dark|logo-responsive-light|logo-responsive-dark` sobre
    `frontend/proyecto_angular/src/` y `public/`: cero coincidencias.
11. Búsqueda de `logo.responsiveLight|logo.responsiveDark|logo.light|logo.dark` sobre
    `frontend/proyecto_angular/src/`: cero coincidencias.
12. Ambos PNG existen en `public/logo-rediseno/` y `ng build` los copia a `dist/`.
13. Suite de tests completa en verde, sin skips.
14. Verificación visual: el logo web se lee sobre el header en tema claro y en tema oscuro, y
    el responsive sobre el fondo del header en móvil.

## No-objetivos y edge cases excluidos

- El favicon no sigue el tema: es el símbolo responsive fijo.
- Landing, login y navbar no reciben variante responsive.
- No hay medición ni test automático de legibilidad del logo sobre el fondo (criterio 14 es
  revisión visual humana).
- No se reduce el peso de los PNG ni se generan derivados (WebP/AVIF, favicon `.ico`).
- No se rediseña el layout ni se ajustan alturas de las imágenes más allá de lo que ya define
  el SCSS.
- No hay animación sobre el logo: `prefers-reduced-motion` no aplica.
