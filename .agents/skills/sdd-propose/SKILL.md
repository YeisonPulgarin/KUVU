---
name: sdd-propose
description: This skill should be used after sdd-explore (and sdd-clarify if there were ambiguities) to document the intent, scope, and approach of a change — what is going to change and why, including explicit non-goals. Use when the orchestrator has a clear picture of what exists and needs to write down what will change before specifying detailed requirements.
---

# Fase: propose

Lee `AGENTS.md` antes de continuar. Esta skill implementa la fase 4 del ciclo
("Specify: el qué y el por qué", en términos del consenso de la industria SDD).

## Qué hace esta fase

1. Lee `sdd/{change-name}/explore` (requerido — no propongas sin haber explorado).
2. Documenta:
   - **Intent**: qué problema resuelve este cambio, en una o dos frases.
   - **Alcance**: qué está dentro de este cambio.
   - **No-objetivos**: qué está explícitamente fuera, para prevenir scope creep.
   - **Approach** a alto nivel: la estrategia general, sin entrar en diseño técnico
     detallado (eso es la fase `design`).

## Artifact que produce

`sdd/{change-name}/propose` — debe poder leerse en 1-2 minutos. Si crece más allá de eso,
es señal de que se está mezclando con `spec` o `design`.

## No hagas

- No definas criterios de aceptación detallados aquí — eso es `spec`.
- No definas arquitectura ni decisiones técnicas — eso es `design`.
- Sigue el estándar de "solo tiempo presente" de `AGENTS.md` → "Estándar de documentación de artifacts".
