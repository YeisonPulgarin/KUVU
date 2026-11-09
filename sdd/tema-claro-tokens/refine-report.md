## Refinamiento — tema-claro-tokens

**Resultado: sin cambios necesarios.** Ningún candidato supera el gate de contención. Como no se
tocó código, esta fase no obliga a re-verificar.

Alcance: diff de `fix/tema-claro-tokens` contra `feat/home-animaciones` (Boy Scout: solo lo que
este cambio tocó). `secure-report` sin controles aplicados, así que no hay nada intocable que
respetar.

### Red de seguridad

- Tests preexistentes: suite Karma 467/467 (`verify-report`). La regresión de color resuelto de
  `steps-journey`, `team-band` y `.cta-final` fija los colores de los puntos que perdieron su
  fallback.
- Baseline: CSS global de 29.100 B, total inicial de 438,52 kB, y capturas de las 9 rutas en los
  dos temas (`scratchpad/shots-r1`).

### Cambios aplicados

Ninguno.

### Deliberadamente NO tocado

- **Alias `--team-band-green`** (`team-band.component.scss:6`, 4 usos y aserción en el spec).
  Nació para alojar el fallback y hoy es solo un alias de `--color-brand-700`. Inlinearlo saca
  una línea a cambio de repetir el token en 4 `color-mix()` y reescribir la aserción del spec.
  Motivo: KISS sin ganancia neta. El alias nombra el color de la banda en un solo lugar.
- **Alias `--header-surface` / `--header-border`** (`site-header.component.scss:14-15`). Este
  cambio no los introdujo: solo les quitó el fallback. Motivo: fuera de alcance, riesgo mayor
  que el beneficio.
- **`.dark` sin overrides de `brand-200/300/700` ni de radios.** Es decisión del usuario
  (spec RF-02), no un smell.
- **Unificar `.dark` dentro de un `@theme`/`@custom-variant`.** Sería una re-arquitectura del
  sistema de temas sin problema presente. Motivo: YAGNI. No se propone como work item.

### Deuda técnica residual (registrada, no resuelta ahora)

- Ninguna nueva. Siguen abiertos P-1, P-3, P-4 y P-5 de `home-animaciones`. P-4
  (`css-inline-fonts`) volvió a fallar una vez durante este cambio (`verify-report` V-4).
