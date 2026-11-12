## Refinamiento — ingresar-color-marca

`secure-report`: sin controles aplicados; nada intocable que preservar.

### Red de seguridad
- Tests: `temaDeEmpresa` (4), regresión de `AuthService` sin tokens en `<html>` (2) y
  "company brand" de `app-layout` (4), más la suite completa (709/709).
- Baseline: sin métricas de rendimiento relevantes (cuatro bindings de estilo por layout).

### Cambios aplicados
- Ninguno: **sin cambios necesarios**.

### Deliberadamente NO tocado
- `components/shared/navbar/` no se usa en ningún template y es el único consumidor de
  `--color-primario` fuera de `<app-layout>`. Borrarlo es limpieza de código muerto ajeno a
  este cambio (no lo tocó). Fuera de alcance; queda registrado abajo.
- Comentarios `✅ FIX` en `AuthService.restaurarSesion()`: cosméticos y previos al cambio;
  reescribirlos no aporta comportamiento ni claridad medible.
- Cuatro bindings `[style.--…]` en el host en lugar de un `[style]` con objeto: explícitos,
  testeados uno por uno; colapsarlos no reduce complejidad real. KISS.

### Deuda técnica residual
- `components/shared/navbar/` sin uso: candidato a borrarse en un cambio de limpieza.
