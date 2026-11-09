# Spec — tema-claro-tokens

Referencias: `sdd/tema-claro-tokens/propose.md`, `sdd/tema-claro-tokens/explore.md`.

Rutas del sitio público (flag `publicSite`): `/`, `/servicios`, `/nosotros`,
`/preguntas-frecuentes`, `/contacto`, `/legal` y la página 404 (`**`).

Tokens de marca (15): `--color-brand-100`, `-200`, `-300`, `-500`, `-600`, `-700`;
`--color-home-bg`, `-surface`, `-surface-alt`, `-text`, `-muted`, `-border`;
`--radius-pill`, `--radius-card`, `--radius-icon`.

## Requisitos funcionales

### RF-01 — Los tokens existen en tema claro

- **Dado** el sitio público cargado sin la clase `dark` en `<html>`,
- **cuando** se lee el valor calculado de cada uno de los 15 tokens en `:root`,
- **entonces** cada token resuelve al valor declarado en el bloque de tokens de `styles.css`
  (`#e8efe8`, `#cddccd`, `#a3bfa3`, `#6b8e6b`, `#3e5c40`, `#2f4a2f`; `#f6f7f4`, `#ffffff`,
  `#eef1ec`, `#1f2920`, `#4c5a4e`, `#cddccd`; `9999px`, `16px`, `12px`).

### RF-02 — Los tokens existen en tema oscuro

- **Dado** el sitio público con la clase `dark` en `<html>`,
- **cuando** se leen los 15 tokens,
- **entonces** los nueve que redefine `.dark` (`brand-100/500/600` y los seis `home-*`) resuelven
  a sus valores oscuros, y `brand-200`, `brand-300`, `brand-700` y los tres radios resuelven al
  mismo valor que en tema claro.

### RF-03 — Una sola fuente de valores

Los valores de los 15 tokens se declaran solo en `styles.css` (bloque de tokens y bloque
`.dark`). Ningún SCSS del sitio público ni `src/styles.scss` repite esos valores como fallback
literal en `var(--token, …)`.

### RF-04 — Superficies y componentes visibles en tema claro

En tema claro:

- Las secciones de la home, nosotros y preguntas frecuentes muestran su fondo de token
  (`home-bg` o `home-surface`) en lugar del fondo del `body`, y su texto usa `home-text` /
  `home-muted`.
- Las tarjetas de "¿Cómo funciona?" muestran borde `home-border`, fondo `home-surface` y radio de
  16 px.
- El número de cada paso es legible: texto blanco sobre fondo `brand-600`, con radio de 12 px.
- Los íconos de servicios de la home muestran fondo `brand-100` y radio de 12 px.
- Los elementos que toman su forma de `rounded-pill` / `rounded-icon` (botones del header, del
  footer y de nosotros) se ven redondeados. Los pills del hero, de la banda de empresas, de la
  banda del equipo y de la banda final ya se ven redondeados y siguen igual (RF-05).

### RF-05 — Sin cambio en lo que ya se veía bien

Las piezas que hoy usan fallback literal (contacto, legal, servicios, 404, breadcrumb,
`app-public-page`, `app-rich-text`, footer, header, banda de empresas, banda del equipo, línea y
riel del recorrido, banda final, `.section-eyebrow`) se ven igual que en la base, en los dos
temas.

### RF-06 — Tema oscuro sin regresiones

En tema oscuro el sitio público se ve igual que en la base, salvo los elementos que usan
`--radius-*` sin fallback (tarjetas y números de paso de "¿Cómo funciona?", íconos de servicios,
`rounded-pill` / `rounded-icon` del header, del footer y de nosotros), que ahora muestran su
redondeo.

### RF-07 — App interna sin cambios

La landing, `/acceder`, `/login` y el dashboard con sus módulos se ven igual que en la base: no
usan estos tokens.

## Criterios de aceptación

| CA | Criterio | Verificación |
|---|---|---|
| CA-01 | Los 15 tokens están declarados en `:root` en el CSS global del build de producción, con los valores de RF-01 | Inspección de `styles-*.css` en `dist/` |
| CA-02 | En navegador, tema claro, los 15 tokens resuelven según RF-01 en las 7 rutas públicas | Script CDP: `getComputedStyle(document.documentElement)` |
| CA-03 | En navegador, tema oscuro, los 15 tokens resuelven según RF-02 | Script CDP con la clase `dark` aplicada |
| CA-04 | No queda ningún `var(--color-home-*, …)`, `var(--color-brand-*, …)` ni `var(--radius-*, …)` con fallback en `frontend/proyecto_angular/src` | Búsqueda en el código: cero coincidencias |
| CA-05 | RF-04 se cumple en la home, nosotros y preguntas frecuentes a 1280×800 y 375×800 | Capturas en tema claro y medición del color de fondo, del borde y del radio calculados de una tarjeta de paso, un número de paso y un ícono de servicio |
| CA-06 | RF-05 y RF-06: las 7 rutas públicas en los dos temas no muestran diferencias contra la base fuera de lo descrito en RF-04 y del redondeo de RF-06 | Capturas comparadas contra la base (`feat/home-animaciones` sin el cambio) a 1280×800 y 375×800 |
| CA-07 | RF-07: la landing y `/login` se ven igual que en la base | Capturas comparadas a 1280×800 |
| CA-08 | La suite Karma está en verde, incluidas las aserciones de color resuelto de `steps-journey.component.spec.ts` (línea `rgb(62, 92, 64)`, riel `rgb(205, 220, 205)`) | `npx ng test --watch=false --browsers=ChromeHeadless` |
| CA-09 | `ng build` de producción compila sin warnings nuevos (se mantiene solo `css-inline-fonts`) y el CSS global crece menos de 1 kB | Salida de `ng build` y tamaño de `styles-*.css` contra 28,8 kB |
| CA-10 | El cambio queda documentado en `docs/tema-claro-tokens.md` y en `CHANGELOG.md` (Unreleased, Fixed) | Revisión de archivos |

## No-objetivos y casos excluidos

- No cambian los valores de ningún token ni se agregan tokens nuevos.
- `.dark` no gana overrides: `brand-200/300/700` y los radios usan el valor claro en los dos temas
  (decisión del usuario).
- No hay test automatizado que compruebe la presencia de los 15 tokens en `:root`; la cobertura
  automatizada es la regresión de V-3 en `steps-journey`, y el resto se verifica en navegador.
- No se cubren estados de interacción más allá de lo que muestran las capturas estáticas (hover y
  foco se revisan solo donde los fallbacks quitados los afectan: hover `surface-alt` del header).
- Fuera de alcance: tokens de la app interna (`--color-primario`, `--radius`, etc.), los
  pendientes P-1, P-3, P-4 y P-5 de `home-animaciones`, y cualquier migración de SCSS a utilidades
  de Tailwind.
- Limitación conocida: la comparación visual contra la base es por inspección de capturas y
  medición puntual de estilos calculados, no por diff de píxeles automatizado.
