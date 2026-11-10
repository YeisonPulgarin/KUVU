## Refinamiento — acceso-volver-inicio

Resultado: **sin cambios necesarios**. El `secure-report` no aplicó controles, así que no hay
nada intocable en la zona.

### Red de seguridad

- Tests preexistentes: `landing.component.spec.ts` con 7 tests del cambio (CA-1 a CA-5) más los
  del selector y la intro; suite completa en 474 SUCCESS.
- Baseline: no aplica optimización (dos enlaces estáticos, sin datos ni cálculo).

### Cambios aplicados

Ninguno.

### Deliberadamente NO tocado

- `:focus-visible` repetido en `.back-home` y `.brand-link` (mismo `outline`) — motivo: dos
  repeticiones; Regla de Tres. Un mixin o selector compartido agrega indirección para cuatro
  líneas.
- El test CA-4 crea el fixture con intro inline en lugar de reusar `createWithIntro()` del
  `describe('intro')` — motivo: el helper está acotado a otro `describe`; subirlo es cosmético
  y toca tests ajenos al cambio. Segunda repetición.
- `margin-bottom: -.8rem` en `.back-home` para compensar el `gap` del contenedor — motivo:
  la alternativa (agrupar enlace y marca en un wrapper nuevo) agrega markup sin ganancia
  visible; KISS.
- El hover con `translateX` de `.empresa-row` sin guarda de reduced motion — motivo: fuera de
  alcance (excluido en la spec) y su corrección cambia comportamiento visible; candidato a work
  item propio.

### Deuda técnica residual (registrada, no resuelta ahora)

- `.empresa-row:hover` y la animación `slowZoom` / `fadeUp` de `/acceder` no respetan
  `prefers-reduced-motion`. Fuera del alcance de este cambio.
