# Design — logo-rediseno

## Arquitectura del cambio

Se tocan 6 componentes/archivos + 2 de infra:

| Archivo | Cambio |
|---|---|
| `content/logo.ts` (nuevo) + export en `content/index.ts` | Constantes tipadas de las 4 rutas de logo |
| `components/public/site-header/*` | Logo con variante de tema + símbolo responsive |
| `components/public/site-footer/*` | Logo con variante de tema + símbolo responsive (inyecta `ThemeService`) |
| `components/landing/landing.component.html` | `src` → `logo-dark.png` |
| `components/login/login.component.html` | `src` → `logo-dark.png` |
| `components/shared/navbar/navbar.component.html` | `src` → `logo-dark.png` |
| `src/index.html` | Favicon → `logo-responsive-light.png`, `type="image/png"` |
| `public/Logo_Kuvu.jpeg` | Se elimina al final del apply |

## Decisiones técnicas

### D1 — Rutas de imágenes: constante centralizada `content/logo.ts`
Objeto tipado `as const` con las 4 rutas (`light`, `dark`, `responsiveLight`,
`responsiveDark`), exportado por `content/index.ts`. Consistente con el resto del contenido
del sitio (fuente única, testeable). No es una abstracción de componentes: es un literal de
rutas, igual que `siteInfo`.

### D2 — Variante de tema vía signal `isDark`, responsive vía CSS (sin JS de media queries)
Header y footer montan **dos `<img>`** en el DOM:
- `.logo-*-full` con `[src]="isDark() ? logo.dark : logo.light"`, visible solo en
  `width >= 768px` (CSS `display: none` por debajo).
- `.logo-*-responsive` con `[src]="isDark() ? logo.responsiveDark : logo.responsiveLight"`,
  visible solo en `width < 768px`.

El tema lo resuelve el binding al signal que ya existe (`SiteHeader` lo usa para los íconos
sol/luna; `SiteFooter` inyecta `ThemeService` nuevo). El breakpoint lo resuelve CSS con el
mismo corte `768px` que ya usa el header (altura 64→80px). `display:none` saca el logo oculto
del árbol de accesibilidad, así ambos `alt` = marca no duplican lectura.

Por qué así: no hay media query JS ni componente nuevo; el patrón ya existe en el proyecto
(`isDark()` en el header). Alternativa descartada: 4 `<img>` con toggle puro CSS por clase
`.dark` + media query — duplica nodos sin ganancia, y el binding por signal es el patrón del
proyecto.

### D3 — Tamaños
- Header, completo: mantiene `h-10` (móvil) / `h-12` (≥768px) actual.
- Header, símbolo responsive: `h-12` (48px) — un poco más grande que el `h-10` actual del
  móvil, como pidió el usuario, y entra en el container de 64px.
- Footer: completo `h-10`; símbolo responsive `h-10` (mismo corte; en el footer el espacio es
  holgado y no se pidió agrandar).
- Ambos con `object-fit: contain; width: auto; flex-shrink: 0` (patrón ya presente).

### D4 — Landing / Login / navbar: solo reemplazo de `src`
Estas tres pantallas tienen fondo oscuro fijo (foto con overlay; color-empresa oscuro por
default), así que usan `logo-dark.png` sin binding de tema ni variante responsive (RF4/RF5).

### D5 — Favicon
`index.html`: `rel="icon" type="image/png" href="/logo-rediseno/logo-responsive-light.png"`.
El símbolo es legible en 16/32px (el logo completo no) y light es la variante por defecto del
tab; no sigue el tema (comportamiento aceptado en spec).

### D6 — Footer: cómo entra el logo
Dentro de `.footer-brand`, arriba de `.footer-name` (que se conserva junto al tagline): los
dos `<img>` (full + responsive) con los mismos toggle CSS y de tema que el header. No se
rediseña el layout del footer.

### D7 — Eliminación del logo viejo
`public/Logo_Kuvu.jpeg` se borra después de reemplazar las 4 referencias y el favicon
(criterio 10/11 de spec: `rg "Logo_Kuvu"` = 0).

## Estrategia de tests (modalidad `test-after`)

- `content.spec.ts`: describe `logo` — las 4 rutas existen en el objeto, empiezan con
  `/logo-rediseno/` y son únicas.
- `site-header.component.spec.ts`: reemplaza la aserción del `src` viejo por la nueva —
  `.logo-img-full` = `logo.light` y `.logo-img-responsive` = `logo.responsiveLight` en tema
  claro; al togglear `ThemeService`, los dos pasan a sus variantes dark; `alt` = marca.
- `home.component.spec.ts`: actualiza el bloque `logo` al nuevo `src` (`logo.light`.
- `site-footer.component.spec.ts`: agrega caso — logo presente con variante light (y dark al
  togglear) y clase responsive.
- `landing`/`login`/`navbar` specs: aserción de que `brand-logo-img` / `navbar__logo-img`
  usan `logo.dark`.

## Riesgos

- `h-12` en el header móvil toca el container de 64px: el logo es `object-fit: contain`, no
  desborda; si el diseño del usuario pide más, se ajusta el alto en apply (dentro del
  criterio "que se lea bien").
- Las imágenes son PNG (135-153 KB); se sirven estáticas, sin peso extra de bundle.
- Test arms: `ThemeService` es root-signal; los tests que toggleen tema deben resetear a
  light al terminar para no contaminar otros specs.