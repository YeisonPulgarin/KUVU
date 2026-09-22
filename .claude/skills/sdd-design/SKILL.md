---
name: sdd-design
description: This skill should be used after sdd-spec (and after sdd-validate if that extension is active and passing or warning) to define the technical architecture and implementation decisions — how the system will be built to satisfy the spec. Use when requirements are settled and it's time to decide stack-level approach, data flow, and key technical tradeoffs.
---

# Fase: design

Lee `AGENTS.md` antes de continuar. Esta skill implementa la fase 6 del ciclo
("Plan: el cómo").

## Qué hace esta fase

1. Lee `sdd/{change-name}/propose` (requerido) y `sdd/{change-name}/validate` si la
   extensión está activa (opcional, útil para revisión).
2. Define arquitectura: qué componentes se tocan, cómo fluyen los datos, qué decisiones
   técnicas se toman y por qué (especialmente las que no son obvias a partir de la spec).
3. Si hay múltiples enfoques razonables, documenta el elegido y por qué se descartaron
   los otros — esto evita que una sesión futura reabra una decisión ya tomada sin contexto.

## Artifact que produce

`sdd/{change-name}/design` — arquitectura, decisiones técnicas, justificación.

## No hagas

- No repitas los requisitos de `spec` — referencialos.
- No conviertas esto en un plan de implementación paso a paso — eso es `tasks`.
- Sigue el estándar de "solo tiempo presente" — sin "antes usábamos X, ahora Y".
