# Refine-report — sitio-contenido

## Red de seguridad

- Suite completa **119/119 verde** que fija el comportamiento de todo el alcance (content,
  chrome, home expandida y las 2 páginas nuevas). No hizo falta agregar tests de
  caracterización: la cobertura del cambio ya es de comportamiento, antes → después.
- Baseline: sin métricas de rendimiento a medir — el cambio es contenido estático renderizado
  por Angular; no hay querys, I/O ni cómputo medible.

## Cambios aplicados

**Sin cambios aplicados.** Ningún candidato superó el gate de contención. Detalle de cada
descarte:

| # | Hallazgo (evidencia) | Lente | Fallo en el gate → motivo |
|---|---|---|---|
| 1 | `nosotros.component.{html,scss}` y `preguntas-frecuentes.component.{html,scss}` comparten la columna de chrome (`.page-layout`, `.container`, `.page-hero`) casi idéntica | DRY (Regla de Tres) / KISS | **Regla de Tres no se cumple** (2 instancias). Extraer un `PageShellComponent` introduce una abstracción antes de la tercera repetición; la home no entra (es una página-scroll, layout distinto). La duplicación es más barata que la abstracción equivocada. |
| 2 | `.container` definido con el mismo cuerpo en 5 SCSS (home, site-header, site-footer, nosotros, faq) | DRY | Real, pero moverlo a `styles.css` global amplía la superficie a toda la app (clase genérica de posible conflicto con módulos internos) con beneficio solo cosmético. **Riesgo > beneficio**; además es el patrón local idiomático ya preexistente. Se registra como deuda. |
| 3 | `aboutOrigin` en `content/about.ts` es un alias de `origin` (2 exports del mismo objeto) | YAGNI / indirección | No duplica contenido: es un alias de naming del dominio "about". Removerlo sería eliminar indirección "porque se ve mal", sin ganancia neta; agregaría un import distinto en `nosotros`. **Sin ganancia neta.** Dejado. |
| 4 | Loop de nav renderizado dos veces en `site-header.component.html` (desktop `.nav-links` y drawer `.mobile-menu`) | DRY | Corresponde al slice `chrome` (cerrado) y son 2 instancias con markup distinto (el drawer agrega acciones). Extraer un `<ng-template>` comparte markup pero agrega indirección estructural; se mantiene el actual. **Regla de Tres + KISS.** Dejado. |
| 5 | `pagos.component.ts:167` usa `document.write(html)` | Seguridad | No es refactor: es un **hallazgo de seguridad** fuera del alcance de `sitio-contenido` y preexistente. Ya registrado en `secure-report` como work item dedicado. No se toca acá. |

## Deliberadamente NO tocado

- Página home y sus desvíos cerrados (`home-expandida`), `chrome` y `content/*`: el
  `apply-progress` de esos slices y la continuación instruyen **no re-decidir**. Criterio 1 y 4
  del gate tocan eso y se descartaron.
- Control de seguridad: el CTA externo con `rel="noopener"` y `aria-label` (de `secure`) se
  deja intacto por la regla de defensa en profundidad.

## Deuda técnica residual (registrada, no resuelta ahora)

- `.container` duplicado en 5 SCSS de componentes del sitio público (ver descarte 2). Si llega
  una tercera página de tipo "subpágina" (misma columna de chrome), es el momento de extraer
  `PageShellComponent` (descartado hoy por Regla de Tres).
- `document.write` en `pagos.component.ts` → work item de seguridad dedicado (externo a este
  cambio).

## Veredicto

**Sin cambios necesarios.** El resultado correcto de `refine` en este cambio es no tocar:
contenido estático, respuestas de contenido en `content/*.ts`, las 2 páginas siguen el patrón
del sitio, y todos los candidatos de mejora caen antes de la Regla de Tres o fuera del alcance.

```
refine_status: sin cambios necesarios
comportamiento_observable_cambiado: no
re_verify_pendiente: no — ni secure ni refine tocaron código; no se re-verifica por una fase cerrada sin cambios (regla del orquestador)
```