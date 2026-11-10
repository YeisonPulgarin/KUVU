# Verify report — acceso-volver-inicio

Estado verificado: commit `679f8c9` (slices `intro` y `cierre` completos, ninguno omitido).

## Tests y build

- Karma (`npx ng test --watch=false --browsers=ChromeHeadless`, `CHROME_BIN` fijado):
  **474 SUCCESS**, 0 fallos (baseline antes del cambio: 467).
- `npx ng build`: **completo**. Solo el warning conocido de presupuesto `css-inline-fonts`
  (Google Fonts Syne/Inter, pendiente P-4), que no es error ni lo introduce este cambio.

## Criterios de aceptación

| CA | Resultado | Evidencia |
|---|---|---|
| CA-1 enlace "Volver al inicio" con `href="/"` | Pasa | test "renders a \"Volver al inicio\" link to the home" |
| CA-2 logo en enlace `href="/"` con `aria-label="KUVU, volver al inicio"` | Pasa | test "makes the logo a home link…" y "should render the KUVU web logo, named by its home link" |
| CA-3 ambos navegan a `/` | Pasa | test "navigates to / when either link is activated" (spy de `navigateByUrl`, URL serializada `/`) |
| CA-4 inertes con intro, operables sin ella | Pasa | test "leaves the links inert while the intro runs and operable after it" |
| CA-5 ícono `aria-hidden` | Pasa | test "hides the chevron icon…" |
| CA-6 Karma y `ng build` | Pasa | arriba |

Requisitos sin test automatizado, verificados por inspección del SCSS:

- RF-4 foco visible: `:focus-visible` con `outline: 2px solid rgba(140,215,255,.9)` y offset 3px
  en ambos enlaces; el foco inicial sigue en el buscador (`autofocus`, test).
- RF-6 reduced motion: transiciones solo de `color` (`.back-home`) y `opacity` (`.brand-link`),
  anuladas en `@media (prefers-reduced-motion: reduce)`.
- RF-7 lenguaje visual: mismo patrón que `.back-btn` de `/login` (`.78rem`, chevron 14px,
  blanco translúcido más claro en hover); `min-height: 44px`. Texto `rgba(255,255,255,.55)`
  sobre el overlay oscuro (≥ `rgba(7,5,20,.65)` sobre la foto) queda por encima de 4.5:1.

## Ejes del protocolo

- **Documentación declarada:** `tasks.md` prevé CHANGELOG (`Added`), la línea de
  `components/landing/` en `docs/architecture.md`, `docs/acceso-volver-inicio.md`; README no
  existe en la raíz; guidelines no afectados. Conforme.
- **Guidelines:** cambio local al standalone existente, sin rutas ni servicios nuevos; estilos
  propios del componente sin `@apply` (el componente es lazy igual). Conforme.
- **Logs:** no se agregan logs (`logs_conforme: sí` en ambos slices). Conforme.
- **Cobertura:** `intro` declara tests y la excepción de CSS no observable; `cierre` declara
  su excepción (Markdown). Sin desvíos.
- **Alcance:** solo `components/landing/*`, `sdd/sdd-init.md` y `sdd/acceso-volver-inicio/`.
  No se tocan `/login`, el sitio público, la app interna ni `sdd/sitio-publico-expresivo/`.

## Desvíos

Ninguno.
