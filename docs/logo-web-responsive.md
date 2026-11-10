# Logo web + responsive

El branding de KUVU se compone de **dos imágenes**: el logo web (completo, con wordmark) y el
logo responsive (símbolo). El logo se adapta al **viewport**, no al tema — el mismo asset se usa
en tema claro y oscuro — y el favicon es el símbolo responsive.

## Cómo funciona

Los assets viven en `frontend/proyecto_angular/public/logo-rediseno/`:

| Archivo | Uso | Dimensiones |
|---|---|---|
| `Logo_Kuvu.png` | Logo web: símbolo + wordmark | 703×271 |
| `Logo_Responsive.png` | Logo responsive: solo símbolo (móvil + favicon) | 284×223 |

Las rutas se centralizan en `src/app/content/logo.ts` (constante `as const`) y se exportan desde
`content/index.ts`; `content.spec.ts` garantiza que existan las 2 entradas y que no se dupliquen.

- **Header** (`site-header`): una sola `<img>` con `[src]="logo.responsive"` (el símbolo) en
  todos los anchos; el `alt` es el nombre de marca. El **footer** no lleva imagen: la marca es el
  texto "KUVU." (ver `docs/ajustes-logo-menu-app.md`).
- **Acceso** (`/acceder`, `/login`, `/cambiar-contrasena`): símbolo (`logo.responsive`) más el
  texto "KUVU" en blanco (`.brand-lockup`, estilos en `components/login/brand-lockup.scss`).
- **Navbar interna e intro**: usan el logo web con la ruta literal `/logo-rediseno/Logo_Kuvu.png`.
- **Favicon**: `src/index.html` apunta a `/logo-rediseno/Logo_Responsive.png` con
  `type="image/png"`.

## Decisiones

- **El tema no participa en la selección del logo.** Con un solo juego de assets, el binding
  `isDark() ? logo.dark : logo.light` desapareció de header y footer: el logo se ve bien en
  ambos temas y no hace falta una variante por tema ni un filtro CSS. El toggle de tema del
  header sigue funcionando (los iconos de sol/luna dependen de `isDark()`).
- **Claves `web` y `responsive`, no `light`/`dark`**: nombran el uso real de cada asset. Con el
  tema fuera del contrato, nombres de tema serían engañosos.
- **Nombres de archivo sin kebab-case**: se conservan los nombres entregados (`Logo_Kuvu.png`,
  `Logo_Responsive.png`), que siguen la convención `Logo_*` que el proyecto ya usó para su
  asset de marca.
- **Navbar e intro con ruta literal**: no son parte del sistema de contenido público y sus specs
  comparan contra la ruta.

## Limitaciones conocidas

- **Un solo logo para ambos temas**: si en el futuro hay una versión del wordmark que no
  contraste sobre el header oscuro, hace falta volver a una variante por tema (o un filtro CSS
  en `.dark`).
- **El favicon no es cuadrado** (284×223, ratio 1.27): el navegador lo encaja en un cuadrado y
  deja bandejas laterales. Tampoco hay un `.ico` multi-resolución.
- **Peso de los assets**: 144 KB el logo web y 56 KB el símbolo, servidos tal cual desde
  `public/`. No hay derivados WebP/AVIF ni `srcset`.
- **Navbar e intro no tienen variante responsive**: en pantallas muy estrechas muestran el logo
  web completo.
- La legibilidad sobre cada fondo (header claro/oscuro, móvil, login, navbar) se revisa a mano
  en el navegador; no hay test automatizado de contraste.
