## Refinamiento — ajustes-hover-movil-y-textura

`secure-report`: sin controles aplicados; nada intocable que preservar.

### Red de seguridad
- Specs del header (pausa, opción elegida, color y subrayado), del sidebar (estado elegido
  medido con `getComputedStyle`, contraste del acento, pausa en móvil y escritorio) y de
  `app-layout` (capas del fondo). Suite 720/720 antes del cambio.
- Baseline: sin métricas de rendimiento relevantes (estilos y dos timers).

### Cambios aplicados
- **Tipo:** Refactor (borrado de código muerto).
  **Qué:** se quita el `&:hover { background; color }` de `.sidebar__link` en
  `sidebar.component.scss`. `sidebar-feedback.scss` redefine el mismo estado con la misma
  especificidad y se carga después, así que esas dos declaraciones nunca se aplicaban.
  **Lente:** C (contención). Borrar es más simple que mantener dos fuentes del mismo estado.
  **Beneficio:** una sola fuente del estado de hover; −17 bytes en la hoja.
  **Riesgo y verificación:** el spec del sidebar mide el color y el fondo del estado elegido,
  que comparte regla con `:hover`; re-verificación con la suite completa.

### Deliberadamente NO tocado
- Lógica de cierre con pausa repetida en el header y en el sidebar (dos copias, con APIs
  distintas: `closeMenu` con foco y `cerrarMenu`). Regla de Tres: no se extrae todavía; la
  constante ya es única (`TAP_FEEDBACK_MS`).
- Subrayado por gradiente repetido en `.mobile-label` y `.sidebar__label` (dos componentes con
  encapsulado propio). Regla de Tres.
- Alias `MENU_TAP_FEEDBACK_MS` en el header: mantiene estable el nombre que usan sus specs.
- `transition: background, color` base de `.sidebar__link`: sin movimiento, sigue dando un
  fundido de color aun con movimiento reducido (no es desplazamiento); se deja.

### Deuda técnica residual
- Si aparece un tercer menú que cierra al elegir, extraer la pausa de cierre a una pieza común.
