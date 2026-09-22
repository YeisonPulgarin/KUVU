---
name: sdd-spec
description: This skill should be used after sdd-propose to write detailed functional requirements and acceptance criteria — what the software must do, described as testable behavior, without prescribing implementation. Use when the intent and scope are already agreed and it's time to define precise, verifiable requirements.
---

# Fase: spec

Lee `AGENTS.md` antes de continuar. Esta skill implementa la fase 5 del ciclo.

## Qué hace esta fase

1. Lee `sdd/{change-name}/propose` (requerido).
2. Escribe requisitos funcionales como comportamiento observable y testeable — usar
   formato Given/When/Then o equivalente cuando ayude a la claridad.
3. Define criterios de aceptación explícitos: ¿cómo se verifica que esto está completo?
4. Marca explícitamente qué queda fuera (edge cases no cubiertos, limitaciones conocidas)
   en vez de dejarlos implícitos.

**Principio:** si la spec empieza a leerse como pseudocódigo (detallando estructuras de
datos, nombres de funciones, flujos de control internos), es señal de sobre-especificación
— eso pertenece a `design`, no a `spec`. La spec describe el "qué", no el "cómo".

## Artifact que produce

`sdd/{change-name}/spec` con secciones: Requisitos funcionales, Criterios de aceptación,
No-objetivos / edge cases excluidos.

## Conexión con la extensión `validate`

Si `sdd.config.md` tiene activa la extensión `validate`, este artifact es el que se valida
contra el contrato externo declarado (schema de DB, contrato de API, normativa, etc.) antes
de pasar a `design`. Ver `.agents/skills/sdd-validate/SKILL.md`.
