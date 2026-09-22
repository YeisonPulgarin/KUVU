---
name: sdd-clarify
description: This skill should be used right after sdd-explore, before sdd-propose, when the exploration surfaced structural ambiguities that need a direct human decision (e.g. whether a target module already exists, which parts of the system are in scope, whether supporting artifacts like mocks or fixtures are needed). This is a quality gate, not always a separate invocation.
---

# Fase: clarify (Gate A)

Lee `AGENTS.md` → "Pausas y gates" (Gate A) antes de continuar.

## Qué hace esta fase

No es necesariamente una invocación separada de la exploración — es un **gate** que el
orquestador aplica con el resultado de `explore` en mano.

1. Toma la lista de ambigüedades reportada por `sdd-explore`.
2. Si la lista está vacía o es trivial, no hay nada que hacer — el orquestador avanza
   directo a `propose`.
3. Si hay ambigüedades reales, formula preguntas **concretas y cerradas** (no abiertas) —
   el formato concreto de la pregunta lo decide el orquestador al mostrarla al usuario,
   siguiendo el formato de pausas de `AGENTS.md` → "Pausas y gates".

## Quién habla con el usuario

Esta skill nunca le pregunta nada al usuario directamente. Devuelve las preguntas
formuladas al orquestador, que es el único canal de comunicación (ver `AGENTS.md` → "Antes de hacer nada").

## Artifact que produce

Actualiza `sdd/{change-name}/explore` con las respuestas del usuario una vez resueltas,
o produce `sdd/{change-name}/clarify` si el proyecto prefiere mantenerlo separado
(declarable en `sdd.config.md`, default: se fusiona con `explore`).
