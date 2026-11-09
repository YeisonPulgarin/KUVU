## Refinamiento — home-animaciones

Estado analizado: `974ccf1`. **Resultado: sin cambios necesarios.** Ningún candidato superó el
gate de contención. Como esta fase no tocó código, no hace falta re-verificar por ella.

### Red de seguridad

- 465 tests en verde (incluye 9 specs nuevos o extendidos del cambio y los dobles de
  `motion/testing/`).
- Baseline: bundle inicial 438,46 kB (tope 439,5 kB), `home.component` compilado 6,74 kB,
  un rAF por ráfaga de eventos, listeners pasivos (todo cubierto por specs y por `ng build`).
- `secure` no aplicó controles nuevos, así que no hay controles intocables que respetar.

### Cambios aplicados

Ninguno.

### Deliberadamente NO tocado

| Candidato | Evidencia | Motivo del descarte |
|---|---|---|
| Patrón "suscribirse a `motionChanges` y recalcular" repetido 4 veces | `magnetic.directive.ts:53`, `scroll-progress.directive.ts:42`, `steps-journey.component.ts:47`, `companies-marquee.component.ts:64` | **KISS / sin capa sin ganancia.** Son 1–3 líneas por sitio, cada uno con efecto distinto (registrar target, listeners de puntero, signal de recorrido, signal de animación). Un helper genérico tipo `motionSignal()` ahorraría 2–3 líneas por sitio a cambio de una abstracción con 4 variantes de efecto y de manejo de ciclo de vida (`AfterViewInit` vs constructor) |
| Helper `accessibleText` duplicado en specs | `split-text.component.spec.ts`, `home-hero.component.spec.ts` (idénticos); `companies-marquee.component.spec.ts` (variante distinta: filtra `inert` y devuelve lista) | **Regla de Tres.** Hay dos copias idénticas; la tercera resuelve otra cosa. Es código de test y la duplicación es más barata que acoplar specs a un helper compartido |
| `.container` declarado en `home-hero.component.scss` y en el mixin `_section-heading.scss` | Hero solo necesita `.container` | **Presupuesto > DRY.** Incluir el mixin emitiría también `.section-title` y `.section-lead`, que el hero no usa, en un componente del bundle inicial |
| Transiciones de CTA con `translate` repetidas | `.hero-cta` (hero) y `.cta-button` (home) | **Regla de Tres / encapsulación.** Dos sitios en dos componentes con estilos encapsulados; moverlo a global obligaría a pelear especificidad con `.btn-primary` |
| Lectura de `scrollHeight` en cada frame del bucle | `scroll-motion.service.ts`, `update()` | **Sin baseline que muestre problema.** Es una lectura más en la fase de lecturas (antes de las escrituras), así que no hay layout thrashing. Optimizar sin medir un costo real sería especulativo |
| Desvío V-2 del verify (`border-color` animado en el paso activo) | `steps-journey.component.scss`, bloque `.is-journey .step` | **Cambia comportamiento visual**, no es un refactor. Es una decisión de spec/producto que queda en el orquestador: aceptarlo o quitar `border-color` de la transición |

### Deuda técnica residual (registrada, no resuelta ahora)

- Si una cuarta pieza necesita reaccionar a las preferencias de movimiento con el mismo
  patrón, recién ahí conviene evaluar un helper (por ejemplo, una signal derivada de
  `motionChanges`).
- `@angular/*` a ≥ 21.2.25 (higiene registrada en `secure-report`, H-1), como cambio aparte.
