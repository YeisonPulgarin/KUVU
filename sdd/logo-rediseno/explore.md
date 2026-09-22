# Explore — logo-rediseno

## Qué existe hoy

El proyecto tiene **una única imagen de logo**: `public/Logo_Kuvu.jpeg` (JPEG), referenciada
por 4 componentes y el favicon, siempre con el mismo `src` fijo, sin variantes de tema ni de
tamaño. El logo actual no reacciona a `.dark` ni a breakpoints.

## Cómo está armado el tema y el logo

- `ThemeService` mantiene un signal `isDark`, persiste `kuvu-theme` en `localStorage` y
  aplica/togglea la clase `.dark` en `<html>`. El toggle vive en `SiteHeader`.
- `src/index.html`:
  - script pre-bootstrap que aplica `.dark` antes de montar la app (evita flash).
  - `<link rel="icon" type="image/jpeg" href="/Logo_Kuvu.jpeg">`.

## Ubicaciones del logo (todas con `/Logo_Kuvu.jpeg`)

| # | Ubicación | Selector/class | Contexto visual | Rutas que lo usan |
|---|---|---|---|---|
| 1 | `components/public/site-header` (chrome público) | `.logo-img` | header claro/oscuro según tema, `h-10` móvil / `h-12` ≥768px | `/`, `/nosotros`, `/preguntas-frecuentes` |
| 2 | `components/landing` (selección de empresa) | `.brand-logo-img` | fondo = foto con overlay oscuro (glassmorphism), logo claro en la imagen | `/acceder` |
| 3 | `components/login` (credenciales empresa) | `.brand-logo-img` | misma familia visual que landing | `/login` |
| 4 | `components/shared/navbar` (app autenticada) | `.navbar__logo-img` | fondo = `--color-primario` de la empresa (default `#2B4C8C`) | rutas de gestión post-login |

El footer público usa **marca en texto** (`footer-name`), no imagen. El `sidebar` autenticado
usa avatar de color, no imagen de logo.

## Assets nuevos ya en el repo

`public/logo-rediseno/` con los 4 PNG copiados (nombres normalizados): `logo-light.png`,
`logo-dark.png`, `logo-responsive-light.png`, `logo-responsive-dark.png`. El respaldo con todos
los logos (`Logos Kuvu.png`) quedó afuera del repo, en la carpeta de diseño del usuario.

## Tests que fijan el src actual del logo (se actualizan en apply)

- `components/public/site-header/site-header.component.spec.ts:38` — `expect(img.getAttribute('src')).toBe('/Logo_Kuvu.jpeg')`.
- `components/home/home.component.spec.ts:264` — idem (busca `.logo-img` renderizado vía el header).

`landing`/`login` no afirman el `src` del logo (el mock `logo_url: ''` es otro campo, el logo
de la empresa, no el de KUVU).

## Ambigüedades para el Gate A

1. **Alcance de ubicaciones** — ¿la variante por tema/responsive va solo en el **header
   público** (chrome), o también en landing, login y navbar de la app autenticada?
2. **Variante correcta en fondos fijos** — landing/login tienen fondo de foto oscuro y navbar
   tiene fondo color-empresa variable: ¿qué variante (light/dark) lee bien en cada una?
3. **Breakpoint de la variante "responsive"** (símbolo sin letras) en el header: ¿bajo qué
   ancho? El header ya usa `768px` para altura (64→80px); el responsive podría alinearse a ese
   mismo corte.
4. **Favicon** — el viejo es JPEG 1:1; los nuevos son PNG. ¿Usar el **símbolo responsive**
   como favicon (y pasar el link a `type="image/png"`)? La variante light o dark según tema no
   es viable para el favicon del tab (no sigue el tema hasta cargar) — probablemente light.
5. **Logo viejo** — `public/Logo_Kuvu.jpeg`: confirmar reemplazo total (4 referencias +
   favicon) y borrarlo.
6. **Footer** — se mantiene con marca en texto (sin imagen) como está hoy, o se le agrega el
   logo.