# Propose — logo-rediseno

## Intent

Reemplazar el logo único actual (`public/Logo_Kuvu.jpeg`) por el nuevo logo de KUVU en sus
cuatro variantes (light, dark, responsive-light, responsive-dark), de modo que el logo del
sitio y de la app se vea correcto en cada tema (claro/oscuro) y en cada tamaño de pantalla
(símbolo solo en móvil), con favicon y footer actualizados, y eliminar el logo viejo del repo.

## Alcance

- Header público (`SiteHeader`): logo sensible al tema (light/dark) según `ThemeService` /
  clase `.dark`, y variante **responsive** (símbolo sin letras) en viewports `< 768px`,
  dimensionada un poco más grande que el actual para que se lea bien.
- Favicon en `index.html`: pasa al símbolo responsive light (`logo-responsive-light.png`),
  `rel="icon"` con `type="image/png"`.
- Footer público (`SiteFooter`): incorpora la imagen del logo (hoy solo tiene marca en texto),
  con variante light/dark según el tema.
- Landing (`/acceder`), Login (`/login`) y Navbar de la app autenticada: reemplazan la
  referencia al logo viejo por la variante **dark** (los tres contextos tienen fondo oscuro:
  foto con overlay, o color-empresa oscuro).
- Borrar `public/Logo_Kuvu.jpeg` y dejar de referenciarlo (4 componentes + favicon).
- Actualizar los tests que fijan el `src` del logo (`site-header.component.spec`,
  `home.component.spec`) y agregar cobertura de las nuevas variantes (tema y responsive).

## No-objetivos

- No rediseñar el header, el footer ni sus layouts (solo el logo dentro de lo que ya existe).
- No tocar el `logo_url` de la empresa ni el sidebar autenticado (avatar de color, sin imagen).
- No crear componente nuevo de logo ni abstracción de imágenes (dos `<img>` en header con
  toggle por CSS y tema, sin JS de media queries).
- No cambiar el bundle ni las dependencias: son 4 PNG estáticos ya copiados en `public/`.
- No tocar el backend ni la app autenticada más allá del reemplazo del `src` en navbar.

## Approach

- Assets: 4 PNG ya en `public/logo-rediseno/` (`logo-light`, `logo-dark`,
  `logo-responsive-light`, `logo-responsive-dark`).
- Header: render del logo completo (light/dark según `.dark`) oculto por CSS en móvil, y del
  símbolo responsive (light/dark según `.dark`) oculto en desktop — ambos con el breakpoint
  `768px` que ya usa el header.
- Footer: mismo patrón (light/dark), símbolo responsive idéntico al header para coherencia.
- Landing/login/navbar: `src` fijo apuntando a `logo-dark.png`, que lee bien sobre sus fondos
  oscuros.
- Favicon: `index.html` apunta a `logo-responsive-light.png` con `type="image/png"`.
- `Logo_Kuvu.jpeg` se elimina al final del apply, después de reemplazar la última referencia.