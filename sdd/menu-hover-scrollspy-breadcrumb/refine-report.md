## Refinamiento — menu-hover-scrollspy-breadcrumb

`secure-report`: sin controles aplicados; nada intocable que preservar.

### Red de seguridad
- Tests del cambio: `section-spy.service.spec.ts`, specs "home scroll-spy" y "scroll trail" del
  header, "scroll-spy" de la home, `scroll-offset.spec.ts` y contenido. Suite 702/702 en verde.
- Baseline: sin métricas de rendimiento relevantes; el trabajo por scroll es un frame
  coalescido con 5 lecturas de `getBoundingClientRect`.

### Cambios aplicados
- Ninguno: **sin cambios necesarios**.

### Deliberadamente NO tocado
- `pathOf` existe en `anchor-smooth-scroll.ts` y en `site-header.component.ts` (dos copias de
  una línea). Regla de Tres: no se extrae todavía.
- El spy y `ScrollMotionService` leen layout en callbacks de frame distintos. Unificarlos
  acoplaría el spy (raíz, compartido con el header) al servicio de movimiento de la home
  (provisto por componente); con 5 lecturas por frame no hay ganancia medible. KISS.
- `getElementById` por frame en lugar de cachear elementos: cachear agrega invalidación
  (secciones que se re-renderizan) por un costo despreciable. KISS.
- Fallback `?? section.href` en las etiquetas del rastro: el test de contenido ya garantiza
  que cada `href` existe en `sitePages`; quitarlo no simplifica nada material.

### Deuda técnica residual
- Ninguna nueva.
