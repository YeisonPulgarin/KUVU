---
name: sdd-branch
description: This skill should be used before sdd-apply, only when the project has the "branch" extension active in sdd.config.md, to create feature branches in the repos involved in this change, off the configured base branch. Use after slice selection (Gate C) is confirmed.
---

# Extensión: branch

Lee `AGENTS.md` → "El ciclo SDD" (extensiones) antes de continuar.

**Esta skill solo se ejecuta si `sdd.config.md` declara la extensión `branch` activa.**
Si el equipo no usa feature branches por repo, esta extensión se omite y `apply` trabaja
directo sobre la rama en la que ya está el usuario.

## Qué hace esta fase

1. Lee la lista de repos/proyectos confirmados en el Gate C (`AGENTS.md` → "Pausas y gates").
2. Lee la rama base declarada en `sdd.config.md` (extensión `branch` → "rama base").
3. Determina el nombre de la rama:
   - **Si la extensión `git` también está activa** (ver `sds-git` sección 3): usar el formato
     `{tipo}/{change-name}`, infiriendo el tipo del artifact `propose`:
     - Nueva funcionalidad → `feat/{change-name}`
     - Corrección de bug → `fix/{change-name}`
     - Refactor / deuda técnica / mantenimiento → `chore/{change-name}`
     - Cambio de infraestructura o CI → `ci/{change-name}`
   - **Si solo `branch` está activa** (sin `git`): usar `{change-name}` directamente.
4. Para cada repo involucrado, crea la rama partiendo de la rama base configurada.
5. Reporta qué ramas se crearon y en qué repos.

## Artifact que produce

Actualiza `sdd/{change-name}/tasks` (o un artifact separado `sdd/{change-name}/branch`
si el proyecto prefiere mantenerlo aparte) con la lista de ramas creadas por repo.

## No hagas

- No le preguntes nada al usuario — la confirmación de en qué repos trabajar ya ocurrió
  en el Gate C, antes de invocar esta skill.
