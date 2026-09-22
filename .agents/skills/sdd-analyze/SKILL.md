---
name: sdd-analyze
description: This skill should be used after sdd-tasks and before sdd-apply, only when the project has the "analyze" extension active in sdd.config.md, to check cross-artifact consistency — does every task trace back to a spec requirement, does the design contradict the spec anywhere, are there gaps between what was specified and what was planned. Recommended for large or multi-repo projects.
---

# Extensión: analyze

Lee `AGENTS.md` → "El ciclo SDD" (extensiones) antes de continuar.

**Esta skill solo se ejecuta si `sdd.config.md` declara la extensión `analyze` activa.**

## Qué hace esta fase

1. Lee `sdd/{change-name}/spec`, `sdd/{change-name}/design`, y `sdd/{change-name}/tasks`.
2. Verifica consistencia cruzada:
   - ¿Toda tarea de `tasks` traza a un requisito de `spec` o una decisión de `design`?
   - ¿Hay algún requisito de `spec` que no tiene ninguna tarea que lo implemente?
   - ¿El `design` contradice algún requisito de `spec` en algún punto?
3. Reporta discrepancias encontradas — no las corrige por su cuenta.

## Artifact que produce

`sdd/{change-name}/analyze` con la lista de discrepancias encontradas, o una confirmación
de consistencia si no se encontró ninguna.

## Por qué existe esta extensión

En proyectos chicos o de un solo desarrollador, esta pasada suele ser innecesaria — la
persona que escribió `spec`, `design` y `tasks` ya tiene la consistencia en la cabeza.
Se vuelve valiosa cuando el proyecto es grande, multi-repo, o cuando distintas fases
las ejecutaron personas/sesiones distintas (lo cual es común en un equipo multiproveedor
donde cada fase puede correr en una herramienta distinta).
