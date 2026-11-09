# Propose — tema-claro-tokens

Referencias: `sdd/tema-claro-tokens/explore.md` (decisiones del Gate A),
`sdd/home-animaciones/archive-report.md` P-2, `sdd/home-animaciones/verify-report.md` F-1.

## Intent

Los tokens de marca del sitio público (`--color-home-*`, `--color-brand-100/200/300/600`,
`--radius-*`) están declarados en `@theme`, pero Tailwind solo emite los que usa alguna utilidad.
En tema claro quedan sin definir: superficies transparentes, tarjetas de "¿Cómo funciona?" sin
borde ni fondo, números de paso invisibles, íconos de servicios sin fondo y botones pill sin
redondeo. Este cambio hace que los tokens existan siempre en `:root` y que `styles.css` sea la
única fuente de sus valores.

## Alcance

- `frontend/proyecto_angular/src/styles.css`: el bloque de tokens de marca pasa a `@theme static`,
  así los 15 tokens se emiten en `:root` sin depender del uso de utilidades. El bloque `.dark`
  conserva sus overrides.
- Quitar los 89 fallbacks literales `var(--token, #literal)` de los SCSS del sitio público y de
  `src/styles.scss`. Los literales coinciden con los valores de `@theme`, así que no hay cambio
  visual en las piezas que hoy los usan.
- Tema claro y tema oscuro: los radios y `brand-200/300`, que faltan en los dos, quedan
  definidos.
- Cambio visual esperado y aceptado en tema claro (home, nosotros, preguntas frecuentes, header):
  fondos `#f6f7f4`/blanco alternados, texto `#1f2920`, tarjetas con borde y radio, números de paso
  visibles, íconos con fondo verde y pills redondeados. En oscuro, solo se suman los radios.
- Revisión en navegador con capturas de todo el sitio público en los dos temas, con un script CDP
  recreado en el scratchpad de la sesión.
- Suite Karma en verde. La regresión de V-3 en `steps-journey.component.spec.ts` (color resuelto
  de línea y riel) pasa a validar la corrección sin fallbacks.
- Documentación del cambio en `docs/tema-claro-tokens.md` y entrada en `CHANGELOG.md`.

## No-objetivos

- Cambiar los valores de los tokens o rediseñar la paleta.
- Agregar un test de guardia que compruebe los 15 tokens en `:root`.
- Tocar la app interna (landing, login, dashboard) y sus tokens (`--color-primario`, `--radius`,
  etc.).
- Agregar overrides de `brand-200/300/700` o de radios al bloque `.dark`: heredan el valor claro.
- Pendientes P-1 (Angular), P-3 (ritmo del recorrido), P-4 (`css-inline-fonts`) y P-5
  (`expone_api_http`) de `home-animaciones`.
- Migrar SCSS a utilidades de Tailwind o cambiar el uso de `@apply`.

## Approach

Una corrección en el origen (`@theme static`) y una limpieza mecánica de los fallbacks, que dejan
de aportar. Se verifica midiendo en el build de producción que los 15 tokens están en `:root`, con
la suite de tests y con capturas comparadas contra la base en tema claro y oscuro.

## Entrega

- Rama: `fix/tema-claro-tokens`, apilada sobre `feat/home-animaciones` (PR #5 sobre #4). Todavía
  no está creada.
- Slices probables: `chrome` (`styles.css`, `styles.scss`, header, footer y piezas públicas
  compartidas), `paginas` (fallbacks de páginas), `home` (fallbacks y verificación de la home) y
  `cierre`.
- Tamaño estimado: una línea modificada por fallback más el bloque de `styles.css`, del orden de
  180-200 líneas de diff contando altas y bajas: por debajo del umbral de 300.
