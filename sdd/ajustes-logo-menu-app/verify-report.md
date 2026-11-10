# Verify report — ajustes-logo-menu-app

Estado verificado: commits `1c9dd7d` (chrome), `39cd25a` (intro), `9a2b352` (app) y
`3ae78b3` (cierre) sobre `release/integracion`. Slices completados: `chrome`, `intro`, `app`
y `cierre`; no hay slices omitidos. Primera corrida, sin `secure` ni `refine`.

## Tests y build

| Chequeo | Comando | Resultado |
|---|---|---|
| Suite frontend | `npx ng test --watch=false --browsers=ChromeHeadless` (con `CHROME_BIN`) | **677/677 verde** (línea base 654/654; +23 casos) |
| Build | `npx ng build` | **OK**. Solo el warning conocido de `css-inline-fonts`: landing 19,80 kB (línea base 19,96 kB) y login 17,62 kB (línea base 17,80 kB), contra un warning en 17 kB. Initial total 474,53 kB (presupuesto 500 kB) |
| Navegador real | build de producción servido localmente + Chrome headless por CDP (script en scratchpad, no versionado) | Ver CA3, CA5 y CA9 |

Backend: no se toca. Su suite no aplica a este cambio.

## Criterios de aceptación

| CA | Resultado | Evidencia |
|---|---|---|
| CA1 — header con una sola imagen, `logo.responsive` | **Pasa** | `site-header.component.spec.ts` y `home.component.spec.ts`. En navegador: 390 px y 1280 px muestran solo `Logo_Responsive.png` (`display: block`), también con `.dark` |
| CA2 — footer sin imagen de logo y con el nombre de marca | **Pasa** | `site-footer.component.spec.ts`. En navegador, el footer tiene 0 `<img>` |
| CA3 — panel móvil con la página scrolleada | **Pasa** | Spec: `.site-header` sin `backdrop-filter`/`filter`/`transform` en estado compacto y la superficie con blur en `::before`. En navegador a 390×844, con `scrollY` = 1492 y el header compacto, el panel queda en `top` = 56 y alto 788 (= viewport − 56). `elementFromPoint` dentro del panel resuelve al panel, así que es clicable. La superficie conserva `saturate(1.4) blur(12px)` |
| CA4 — activo/hover del panel móvil | **Pasa** | Spec: `is-active` + `aria-current="page"` en la ruta actual. En navegador, el activo "Servicios" tiene barra `inset 3px` y fondo de marca al 12 %. El hover/foco (tinte 8 % y `translateX(6px)` solo con `no-preference`) se revisó en código; no se emula hover por CDP |
| CA5 — símbolo + "KUVU" en blanco en `/acceder`, `/login` y `/cambiar-contrasena` | **Pasa** | Specs de las tres vistas. En navegador, `/acceder` y `/login` muestran `Logo_Responsive.png` (48 px en móvil), la palabra "KUVU" en `rgb(255,255,255)` y la fuente Big Shoulders Display de 32 px. El enlace a `/` y su `aria-label` se conservan |
| CA6 — Cancelar con `.btn-action--danger` + ícono `x` | **Pasa** | Specs de contratos, locales, pagos (arrendatario), mantenimiento (admin y arrendatario), usuarios (dos modales) y `confirm` ("Cancelar" y "Volver", con el foco inicial en el descarte). Los tests de comportamiento previos siguen verdes |
| CA7 — grano en `.main-content`, modales lisos | **Pasa** | `app-layout.component.spec.ts`: `background-image` con `linear-gradient` + SVG `feTurbulence` y sin `::before`/`::after`. CSS compilado verificado. La intensidad visual queda para revisión del usuario (no hay sesión de la app interna en el navegador automatizado) |
| CA8 — tests y build | **Pasa** | Tabla anterior |
| CA9 — botón "Volver arriba" | **Pasa** | `back-to-top.component.spec.ts` (10 casos: ventana, `.main-content`, otros scrolls ignorados, `smooth`/`auto`, reinicio al navegar, limpieza del listener, capa). En navegador a 1280×800: oculto arriba, visible con `scrollY` = 1200, `aria-label` "Volver arriba", a 25/20 px de la esquina; el clic vuelve a `scrollY` = 0 y el botón se oculta. En `.dark`: fondo `rgb(47,74,47)` y texto blanco (AA) |

## Ejes del protocolo

- **Documentación declarada:** `tasks.md` anticipa `docs/ajustes-logo-menu-app.md`, la
  revisión de `docs/logo-web-responsive.md` y una entrada en `CHANGELOG.md`. No toca
  `architecture`, `guidelines`, OpenAPI ni README. Conforme.
- **Guidelines:** `DEVELOPMENT_GUIDELINES.md` no tiene sección de Angular (es la plantilla
  Go/Next/Astro). Por eso el contraste se hizo contra las convenciones de `sdd/sdd-init.md`:
  - sin `@apply` en piezas del bundle inicial (el botón usa estilos inline planos);
  - tokens de marca con `var()` y sin fallbacks;
  - movimiento solo bajo `prefers-reduced-motion: no-preference`;
  - `<app-icon>` en la app interna;
  - nada de fuentes de Google nuevas.

  Conforme.
- **Logs:** no se agregan logs. Los cuatro `apply-progress` declaran `logs_conforme: sí`.
- **Cobertura:** cada slice con código declara `tests_agregados`. Las `excepciones_sin_test`
  son solo de apariencia visual (hover, transición, intensidad del grano), todas documentadas.

## Desvíos respecto del design (todos registrados en apply-progress)

1. **Hoja `components/login/brand-lockup.scss`.** El lockup del acceso vive ahí y no dentro
   de las hojas de landing/login. Con los estilos dentro, `ng build` fallaba: la hoja de
   landing (que incrusta Google Fonts) pasaba a 20,24 kB, sobre el error de 20 kB. Además,
   el lockup mide 56/48 px en las tres vistas.
2. **Pasarela de pagos.** Su Cancelar está en `.pasarela-actions`, no en `.modal__footer`.
   La regla de medida cubre los dos contenedores.
3. **Accesibilidad del botón oculto.** Mientras está oculto, el botón lleva además
   `tabindex="-1"` y `aria-hidden`, para que no se pueda enfocar durante el fade de salida.
4. **SVG del grano duplicado en el CSS compilado.** Aparece dos veces (sitio y app), unos
   400 B. La fuente del SVG es una sola (`_grain.scss`).

## Pendientes de revisión humana

- Visual: el hover del panel móvil, la intensidad del grano en la app interna y Cancelar en
  rojo junto a la confirmación sólida roja del diálogo de borrado (riesgo aceptado en
  `propose.md`).
- El botón "Volver arriba" en la app interna con datos reales: está cubierto por spec, pero
  no se probó en navegador porque requiere sesión.

**Resultado: verify en verde.**

## Re-verificación tras `secure` y `refine`

`secure` (`secure-report.md`) cerró sin hallazgos accionables y `refine`
(`refine-report.md`) cerró con "sin cambios necesarios": ninguna de las dos fases tocó código.
Igual se corrió la verificación final sobre `3ae78b3`:

- `npx ng test --watch=false --browsers=ChromeHeadless`: **677/677 verde**.
- `npx ng build`: **OK**, Initial total 474,53 kB. Solo el warning conocido de
  `css-inline-fonts`.

Los criterios CA1–CA9 siguen pasando, ninguna métrica empeoró y no hay cambios de
comportamiento declarados por `secure`. **Verify final en verde: autoriza `document` y
`archive`.**
