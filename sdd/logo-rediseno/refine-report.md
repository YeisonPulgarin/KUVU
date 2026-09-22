# Refine-report — logo-rediseno

## Refinamiento — logo-rediseno

### Red de seguridad
- Tests preexistentes: suite completa **128/128 verde** (Karma/Jasmine + ChromeHeadless) que
  fija el comportamiento del header/footer (tema+responsive), landing/login/navbar (src fija),
  `content/logo.ts` (4 variantes + unicidad) y `index.html` (favicon).
- Baseline capturado: ninguno aplicable — no hay ruta de rendimiento en este cambio (assets
  estáticos ya redimensionados en apply a 703x250 / 284x257).

### Cambios aplicados

**Sin cambios necessarios.** Todos los candidatos detectados fueron rechazados en el gate de
contención:

| Candidato | Gate que lo descarta | Motivo |
|---|---|---|
| Extraer el patrón "2 `<img>` + swap `isDark()` + toggle CSS" en un componente/mixin compartido (header + footer) | Regla de Tres (DRY con criterio) | Solo **2** ocurrencias reales. La abstracción equivocada es más cara que la duplicación; si aparece un tercer uso, se revisa. |
| Helper `logoFor(theme)` que centralice `isDark() ? logo.dark : logo.light` | KISS / fuerza | 2 use sites (header, footer) con una expresión legible ya cubierta por tests. Agrega indirección sin ganancia neta. |
| SCSS variable/mixin para el breakpoint `768px` | YAGNI + consistencia | El proyecto usa `@media (width >= 768px)` literal en 6+ componentes (home, nosotros, preguntas, header, footer). No existe convención de variables de breakpoint; crear una solitaria para 2 literales introduce más de lo que saca. |
| Cambiar a `<picture>`/`srcset` para el responsive | KISS | El enfoque actual (2 `<img>` + CSS) es correcto, cubierto por tests y sencillo. Reemplazarlo cambia estructura sin beneficio medido. |
| Optimización de los PNG (compresión) | Sin baseline que lo justifique | Fueron redimensionados en apply; tamaño actual 279 KB / 97 KB para imágenes 4-5x el tamaño de despliegue. Optimizar más sin medición real es especulativo. |
| Tocar la duplicación de `aria-label` de tema en header | Regla de Tres | 2 usos (desktop/mobile). Sin tercer uso, no se abstrae. |

### Deliberadamente NO tocado
- Controles de `secure` (ninguno hubo — sin hallazgos). Deuda conocida fuera de alcance:
  `document.write` en `pagos.component.ts` (work item del ciclo anterior). No se toca acá
  porque excede el alcance Boy Scout de este cambio y requiere su propio ciclo.
- `logo_url` de empresa y sidebar: fuera de spec (no se tocaron).

### Deuda técnica residual (registrada, no resuelta ahora)
- Patrón header/footer duplicado (tema + responsive): aceptado hasta una tercera ocurrencia
  (regla de Tres).
- Breakpoints like `768px`/`639px`/`767px` mezclados como literales sin variables: preexistente
  en todo el frontend, no es deuda introducida por este cambio.
- `document.write` en `pagos.component.ts` — work item de seguridad abierto (registrado en
  ciclos anteriores), pendiente de su propio cambio.