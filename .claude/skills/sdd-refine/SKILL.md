---
name: sdd-refine
description: This skill should be used after sdd-verify (and after sdd-secure, if that optional phase ran), before sdd-archive, to decide whether the code just built is worth refactoring, optimizing or re-architecting — and to apply only the changes that survive a containment gate. Also invocable standalone over existing code. Optional phase, always offered to the user; "no changes needed" is a valid and frequent result.
---

# Fase: refine

Lee `AGENTS.md` antes de continuar. Esta skill implementa la fase 11 del ciclo
("Quality gate: ¿vale la pena mejorar lo construido?"). Es **opcional** — el orquestador la
ofrece siempre tras `verify`, junto con `secure`, y el usuario decide si corre una, las dos o
ninguna. Si corre, `verify` se vuelve a correr al terminar, antes de `archive`.

Si `secure` corrió en este mismo ciclo, va **antes** que esta fase: lee su `secure-report` y
tratá los controles de seguridad que aplicó como **intocables**. Un control no se simplifica
por elegancia — si te parece que sobra, es un hallazgo para el usuario, no un refactor.

También es invocable sobre código existente sin haber pasado por el ciclo completo (ej.
"refiná el módulo de pagos"), en cuyo caso el alcance lo define el usuario en lugar de la spec.

## Principio rector — leé esto antes que cualquier otra cosa

**El trabajo de esta fase NO es aplicar principios. Es decidir si aplicarlos vale la pena.**

- El **default es NO cambiar**. Todo cambio se justifica contra costo, riesgo y alcance.
- Un agente que "conoce" SOLID/DRY/GRASP/CUPID por default los **sobre-aplica**. Esta skill
  existe para contener ese impulso.
- Ante la duda entre "lo dejo como está" y "lo mejoro un poco": dejalo como está y registralo,
  salvo que el cambio caiga dentro de lo que este work item ya tocó (Boy Scout) y pase el
  gate de contención.

**Reglas cardinales de seguridad:**

1. **Refactor = preservar comportamiento.** Si un cambio altera el comportamiento observable,
   no es un refactor: es un feature o un fix, y vuelve al ciclo por `spec` con aprobación.
2. **No se toca nada sin red de seguridad.** Si la zona no tiene tests que fijen el
   comportamiento actual, el primer paso es escribir tests de caracterización. Sin red, no
   hay refactor.

## Las tres actividades — declaralas por separado

| Actividad | Qué cambia | Precondición | Verificación |
|---|---|---|---|
| **Refactor** | estructura interna, comportamiento idéntico | tests que fijen el comportamiento | tests verdes antes y después |
| **Optimización** | rendimiento / uso de recursos | baseline medido (latencia, plan de consulta, memoria) | benchmark antes/después con datos representativos |
| **Re-arquitectura** | contratos, fronteras, dependencias públicas | aprobación del usuario + posible cambio de `spec` | tests de contrato + revisión |

Cada cambio declara explícitamente en cuál de las tres cae. Nunca mezcles un refactor "de
paso" con un cambio de comportamiento en el mismo commit.

## Entradas

- `sdd/{change-name}/spec` — define el comportamiento intencionado y, sobre todo, **el
  alcance**. No hay gold-plating más allá de la spec.
- `sdd/{change-name}/design`, `tasks` y `verify-report` — qué se construyó y qué ya se validó.
- El código, SQL, esquema o IaC afectado.
- La suite de tests, o su ausencia (→ primera acción: caracterizar).
- Requisitos no funcionales: objetivos de rendimiento, SLAs, volúmenes de datos esperados,
  expectativas de concurrencia y latencia.
- Restricciones del contexto: idioms del lenguaje, patrones ya existentes en el repo,
  convenciones del equipo. **Ser idiomático y consistente con lo que ya hay pesa más que
  aplicar un patrón de libro.**

## Pipeline — en orden, cada paso produce evidencia, no opiniones

1. **Baseline y red de seguridad.** ¿Hay tests que fijen el comportamiento de la zona? Si no,
   escribilos (caracterización). Capturá métricas actuales: planes de consulta (`EXPLAIN`),
   latencias, uso de recursos, complejidad. Esto es el "antes".
2. **Detectar.** Escaneá smells en los dominios relevantes. Cada hallazgo va con evidencia
   concreta (archivo:línea, plan de consulta, métrica) — nunca con "esto se ve mal".
3. **Diagnosticar.** Mapeá cada hallazgo al principio que viola y a su **causa raíz**, no al
   síntoma. Ver `references/lentes.md`.
4. **Priorizar.** `prioridad ≈ (impacto × frecuencia_de_uso) / (riesgo × esfuerzo)`. Respetá
   el alcance **Boy Scout**: primero lo que este work item ya tocó, antes que módulos ajenos.
5. **Gate de contención.** Cada candidato tiene que sobrevivir a los cuatro filtros de abajo.
6. **Proponer.** Para cada sobreviviente: qué cambia, por qué (principio + beneficio concreto
   y medible), riesgo, y cómo se verifica. Cambios atómicos, pequeños y reversibles.
7. **Aplicar.** Un paso preservador de comportamiento a la vez, con tests verdes entre cada uno.
8. **Verificar.** Comportamiento preservado (tests), métricas mejoradas o neutrales
   (benchmark), sin regresiones. **Si no mejora o hay regresión → revertí.**
9. **Reportar.** Qué cambió, qué se dejó deliberadamente sin tocar y por qué, y deuda técnica
   residual registrada.

## Gate de contención — el filtro que evita el over-engineering

Antes de proponer nada, cada candidato pasa por:

- **YAGNI** — ¿resuelve un problema real y presente, o especulativo? Especulativo → descartar.
- **KISS** — ¿la solución es más simple que el problema? Si agrega más complejidad de la que
  saca → descartar.
- **DRY con criterio** — ¿la duplicación es real, o son dos cosas que casualmente se parecen
  hoy? Regla de Tres: no abstraigas hasta la tercera repetición. *La duplicación es más barata
  que la abstracción equivocada.*
- **Sin patrón sin fuerza** — no introduzcas un patrón de diseño si no podés nombrar la fuerza
  concreta que resuelve.
- **Sin capa sin ganancia neta** — no agregues indirección salvo que elimine más complejidad
  de la que introduce.

**Rechazá tus propias propuestas** cuando: abstraen antes de la tercera repetición; crean una
interfaz con una sola implementación "por si acaso"; agregan configurabilidad, genericidad o
extensibilidad que la spec no pidió; o prefieren agregar código donde **borrar** código
resolvería el problema.

## Material de referencia

Leelo cuando el hallazgo caiga en ese dominio, no de entrada:

- `references/lentes.md` — los principios agrupados por el problema que resuelven (A
  responsabilidad, B acoplamiento, C contención, D tolerancia al cambio, E ergonomía, F
  integridad de datos), cada uno con su **cuándo NO aplicar**.
- `references/datos-sql.md` — smells de SQL y capa de datos: N+1, índices, fronteras
  transaccionales, niveles de aislamiento, idempotencia, paginación.
- `references/async.md` — marco de decisión síncrono vs cola vs pub/sub vs concurrencia, y las
  preocupaciones transversales que toda propuesta async debe responder.

## Artifact que produce

`sdd/{change-name}/refine-report`:

```
## Refinamiento — {change-name}

### Red de seguridad
- Tests preexistentes / de caracterización agregados: ...
- Baseline capturado: {planes, latencias, métricas}

### Cambios aplicados
Por cada uno:
- Tipo: {Refactor | Optimización | Re-arquitectura}
- Qué: ...
- Principio / lente: ...
- Beneficio concreto (medido): antes → después
- Riesgo y cómo se verificó: ...

### Deliberadamente NO tocado
- {hallazgo} — motivo: {fuera de alcance | YAGNI | riesgo > beneficio | ...}

### Deuda técnica residual (registrada, no resuelta ahora)
- ...
```

Si ningún candidato supera el gate, el artifact correcto dice **"sin cambios necesarios"** con
la justificación de cada descarte. **No cambiar es un resultado válido y frecuente.**

## No hagas

- No cambies comportamiento observable. Si el hallazgo lo requiere, reportalo al orquestador
  como propuesta de nuevo work item — no lo implementes acá.
- No optimices sin baseline medido, ni sobre volúmenes de datos que no son representativos.
- No refactorices módulos ajenos al alcance de este cambio porque "de paso los viste".
- No toques controles de seguridad — validaciones, checks de autorización, parametrización,
  redacción de logs — ni siquiera si parecen redundantes. La redundancia ahí es deliberada
  (defensa en profundidad). Reportalo en vez de simplificarlo.
- No cierres la fase sin volver a correr `verify` — es el orquestador quien lo dispara, pero
  el `refine-report` no se considera cerrado hasta que la re-verificación esté verde.
- No le hables al usuario directamente: las decisiones que requieran su aprobación (una
  re-arquitectura, por ejemplo) se devuelven al orquestador.
