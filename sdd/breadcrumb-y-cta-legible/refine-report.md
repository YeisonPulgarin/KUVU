## Refinamiento — breadcrumb-y-cta-legible

**Resultado: sin cambios necesarios.** Ningún candidato supera el gate de contención. No se
modificó código, así que esta fase no exige re-verificación.

`secure-report.md` no aplicó controles en este cambio (sin vulnerabilidades confirmadas), así
que no hay controles intocables que considerar. El uso de `textContent` en lugar de
`innerHTML` en `PageMetaService` se trata igual como decisión de seguridad que no se toca.

### Red de seguridad

- Tests preexistentes que fijan el comportamiento de toda la zona: 178 / 178 en verde
  (`verify-report.md`), con 21 tests propios de este cambio (`home.component.spec.ts` ›
  'cta final legible', `breadcrumb.component.spec.ts`, `page-meta.service.spec.ts` ›
  'breadcrumb JSON-LD', y los `describe('breadcrumb')` de las dos páginas). No hace falta
  caracterización adicional.
- Baseline: no se proponen optimizaciones. Un breadcrumb de dos ítems y un script por
  navegación no tienen costo medible, así que no hay métrica que capturar.

### Cambios aplicados

Ninguno.

### Deliberadamente NO tocado

| Candidato | Evidencia | Motivo del descarte |
|---|---|---|
| Importar `DOCUMENT` de `@angular/core` en lugar de `@angular/common` | `services/page-meta.service.ts:2`. Es el único uso de `DOCUMENT` en el repo | Ambos son exports públicos de Angular 21 y compila sin warnings. No hay convención previa en el repo con la que alinearse ni beneficio medible. KISS / riesgo > beneficio (nulo, pero también ganancia nula) |
| `RouterLink` en lugar de `RouterModule` en `BreadcrumbComponent` | `components/public/breadcrumb/breadcrumb.component.ts` | Los componentes del clúster público (`team-band`, páginas) importan `RouterModule`, y 14 componentes siguen esa convención. Ser consistente con el repo pesa más; el impacto en el bundle no es medible |
| Extraer un helper común para los tests de breadcrumb de `nosotros` y `preguntas-frecuentes` | Dos `describe('breadcrumb')` casi iguales en las specs de las páginas | Regla de Tres: hay dos repeticiones. Además, extraerlo crearía una dependencia compartida entre specs que conviven con hunks de `home-imagen-equipo` (D-1) |
| Unificar el breadcrumb visual y el JSON-LD en un servicio de "datos estructurados" | Diseño D3/D4 | Re-arquitectura sin fuerza: un único tipo de dato estructurado. Ya se descartó en design (YAGNI) |
| Escapar `<` en el JSON-LD | `page-meta.service.ts` | No es un refactor, es hardening. `secure` ya lo evaluó y lo descartó (sin SSR) |
| Quitar `min-width: 0` / `overflow-wrap: anywhere` de los ítems del breadcrumb | `breadcrumb.component.scss` | Protegen el ancho de 360 px ante etiquetas largas (CA-9). Borrarlos ahorra dos líneas a cambio de riesgo de overflow |
| Redundancia `page === home` en `breadcrumbFor` | `content/site.ts` | Es el caso `breadcrumbFor('/')`, que tiene test propio y está documentado como desvío aceptado. Quitarlo cambia el comportamiento observable (dejaría de lanzar error) |
| Override local de `transition` en `.cta-button` | `home.component.scss` (bloque `.cta-final`) | Ya lo declaró apply como desvío. Mantiene el `translateY` con el easing del sistema, y fusionarlo con `.btn-primary` tocaría estilos globales (no-objetivo) |

### Deuda técnica residual (registrada, no resuelta ahora)

- Tokens de Tailwind v4 que no se emiten en modo claro (`--color-home-*`, `--radius-*`,
  `brand-100/200/300/600`). Se compensan con fallbacks locales caso por caso. El arreglo de
  raíz (`@theme static` o valores en `:root`) es un cambio propio y alteraría la home entera
  en modo claro. Ya está registrado en propose/explore.
- `@angular/*` < 21.2.24 (H-1 de `secure-report.md`): cambio pendiente por decisión del
  usuario.
