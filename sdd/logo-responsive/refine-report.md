# Refine Report — logo-responsive

## Refinamiento — logo-responsive

### Red de seguridad
- Tests preexistentes: 19/19 (home.component.spec.ts cierra el comportamiento del logo de HomePage).
- Zonas sin tests: cambios de CSS/Signals de plantilla (sidebar, dashboard, login, landing, navbar) — comportamiento fijado por los criterios de aceptación visuales de `verify` y por el build.
- Baseline: build OK, tests 19/19, `npm audit` 0 vulns.

### Cambios aplicados
- **Tipo:** Refactor
- **Qué:** eliminada la animación `backdropIn` (keyframes) del `.sidebar__backdrop` en `sidebar.component.scss`.
- **Principio / lente:** KISS (contención C) + cumplimiento de spec — el no-objetivo declarado en `spec` prohíbe animaciones nuevas ("No se agregan animaciones nuevas").
- **Beneficio concreto:** alinea el código con el alcance declarado; borra ~7 líneas y un efecto no requerido.
- **Riesgo y verificación:** el backdrop aparece instantáneo en vez de con fade de 0.15s — sin impacto funcional. Cobertura visual; suite 19/19 tras el cambio.

### Deliberadamente NO tocado
- **`home.component.scss` sobre budget (15.4 kB vs 10 kB warn)** — la página es, por diseño, la más cargada de reglas responsive; el warning no rompe el build. Recortar CSS conlleva riesgo visual por un beneficio marginal. Registrado como deuda.
- **Warnings `css-inline-fonts` (Google Fonts inline, 16-18 kB)** — preexistente, fuera del alcance de este cambio.
- **`.brand-logo-img` duplicado en login y landing** — Regla de Tres: solo 2 ocurrencias, cada una scoped a su componente (idiomático en Angular). No se abstrae.
- **Hamburger SVG duplicado (navbar vs sidebar)** — 2 ocurrencias, mismas razones. No se extrae a componente compartido.
- **`.tabla` min-width 560px (dashboard) vs 600px (shared)** — tablas con contenido de distinto ancho; valores deliberados. Unificarlos no agrega valor.
- **`mostrarTexto` computed en sidebar** — necesario (móvil expandido aunque `colapsado` venga del desktop); no es sobre-ingeniería.

### Deuda técnica residual (registrada, no resuelta ahora)
- `home.component.scss` supera el budget de warning de 10 kB → revisar extracción de rules responsive o subir el budget en `angular.json` en un cambio futuro.
- Warnings de budget por CSS de Google Fonts inline — revisar carga de fuentes (local vs CDN) fuera de este cambio.

## Resultado
Un solo cambio contenido (supresión de animación fuera del alcance declarado). Resto sin cambios por YAGNI/KISS/Regla de Tres. Se re-corre `verify` obligatoriamente tras tocar código.