# Spec — logo-rediseno

Extensión `validate` no activa — no hay contrato externo contra el que contrastar esta spec.

## Requisitos funcionales

### RF1 — Header público sensible al tema
- En tema **claro**, el header del sitio público muestra el logo completo
  (`/logo-rediseno/logo-light.png`).
- En tema **oscuro**, muestra el logo completo (`/logo-rediseno/logo-dark.png`).
- El cambio ocurre al alternar el tema existente (toggle de `SiteHeader`), sin recargar.

### RF2 — Header público responsive en móvil
- En viewports **< 768px** (el corte que ya usa el header), el header muestra el **símbolo**
  sin letras (`logo-responsive-light.png` / `logo-responsive-dark.png` según tema), con un
  tamaño que se lea bien (un poco mayor que el logo completo actual en móvil).
- En viewports **≥ 768px** se muestra el logo completo (variante de tema).
- El `alt` del logo es el nombre de marca en ambas variantes.

### RF3 — Footer público con logo
- El footer muestra el logo (completo light/dark según tema) junto a la marca; en móvil
  (< 768px) usa el símbolo responsive, alineado al comportamiento del header.

### RF4 — Landing y Login
- `/acceder` y `/login` muestran `logo-dark.png` (sus fondos son oscuros: foto con overlay /
  familia glassmorphism) en lugar del logo viejo.

### RF5 — Navbar de la app autenticada
- La navbar post-login muestra `logo-dark.png` (fondo color-empresa oscuro por defecto) en
  lugar del logo viejo.

### RF6 — Favicon
- `index.html` apunta el favicon a `/logo-rediseno/logo-responsive-light.png` con
  `type="image/png"` (el viejo era JPEG). No cambia con el tema.

### RF7 — Eliminación del logo viejo
- `public/Logo_Kuvu.jpeg` se borra del repo y no queda ninguna referencia a él en el código.

## Criterios de aceptación

1. Header, tema claro: renderiza un `<img>` con `src="/logo-rediseno/logo-light.png"` y
   `alt` = nombre de marca.
2. Header, tema oscuro: ese mismo `<img>` (o su equivalente) tiene
   `src="/logo-rediseno/logo-dark.png"`.
3. Header: existe la variante simbolo con `src` `logo-responsive-light.png` /
   `logo-responsive-dark.png` según tema; ambas variantes (completa y símbolo) conviven en el
   DOM y la visibilidad está resuelta por CSS con el breakpoint `768px` (símbolo en móvil,
   completo en desktop).
4. Alternar el tema (toggle existente) cambia las `src` del header y del footer sin recargar
   la página.
5. Footer: renderiza el logo con variante light/dark del tema y convive con el símbolo
   responsive para móvil.
6. Landing (`/acceder`): el `brand-logo-img` usa `/logo-rediseno/logo-dark.png`.
7. Login (`/login`): el `brand-logo-img` usa `/logo-rediseno/logo-dark.png`.
8. Navbar: `navbar__logo-img` usa `/logo-rediseno/logo-dark.png`.
9. `index.html`: `<link rel="icon" type="image/png" href="/logo-rediseno/logo-responsive-light.png">`
   (sin referencias al JPEG viejo).
10. `rg "Logo_Kuvu"` sobre el **código en producción** (`frontend/proyecto_angular/src/`),
    `index.html` y los documentos nuevos/modificados de este cambio devuelve cero coincidencias.
    Referencias en artifacts de cambios anteriores archivados (`sdd/logo-responsive/`,
    `sdd/sitio-contenido/`, `docs/logo-responsive.md`) y entradas históricas de `CHANGELOG.md`
    son registro legítimo del estado anterior y no se editan.
11. `public/Logo_Kuvu.jpeg` no existe.
12. Suite de tests completa en verde (119+ verdes, sin skips) y `ng build` compila.

## No-objetivos y edge cases excluidos

- El sidebar de la app autenticada (avatar de color de empresa) no se toca; `logo_url` de la
  empresa no se modifica.
- El favicon no sigue el tema: es light fijo hasta que se decida otra cosa (comportamiento
  conocido, no un bug).
- Landing/login/navbar no tienen variante responsive ni breakpoint propio (solo reemplazo de
  `src`).
- No hay animación sobre el logo: `prefers-reduced-motion` no aplica.
- Los tamaños exactos (alto en px) del símbolo responsive son decisión de `design`; la spec
  solo exige que se lea bien y sea ligeramente mayor al logo actual en móvil.
- No se rediseña el layout del header/footer/landing/login/navbar.