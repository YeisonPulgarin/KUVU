---
name: sdd-tasks
description: This skill should be used after sdd-design to break the design down into discrete, atomic, dependency-ordered implementation units, and to forecast review risk (lines changed, files touched, repos involved) and which apply slices are involved. Use when architecture is settled and it's time to plan concrete units of work before writing any code.
---

# Fase: tasks

Lee `AGENTS.md` antes de continuar. Esta skill implementa la fase 7 del ciclo.

## Qué hace esta fase

1. Lee `sdd/{change-name}/spec` y `sdd/{change-name}/design` (ambos requeridos).
2. Descompone el trabajo en unidades atómicas, ordenadas por dependencia.
3. Si `sdd.config.md` declara slices de `apply` (ver `sdd/examples/sdd.config.example.md`),
   indica qué slices están involucrados en este cambio concreto — puede proponer un orden
   distinto al default de la tabla si la naturaleza del cambio lo justifica, pero debe
   decir explícitamente que se está desviando del default y por qué.
4. Calcula un forecast de riesgo de revisión: líneas estimadas, archivos tocados, y si
   el cambio involucra más de un repo. Compara contra el umbral declarado en
   `sdd.config.md` (sección "Umbral de riesgo"). Contá los tests en la estimación de líneas
   y archivos: son parte obligatoria de cada tarea, no trabajo extra.
5. Anticipa el alcance de la fase `document`: si el cambio toca endpoints HTTP (y por lo
   tanto OpenAPI y colecciones Bruno), si es visible desde afuera (y por lo tanto va al
   `CHANGELOG.md` o cambia el README), si toca la arquitectura (y por lo tanto actualiza
   `docs/architecture.md`), y si introduce una convención nueva de código (y por lo tanto
   toca `DEVELOPMENT_GUIDELINES.md`). No lo documentes acá — solo dejalo previsto.

## Artifact que produce

`sdd/{change-name}/tasks` con:
- Lista de tareas atómicas, ordenadas.
- Slices involucrados (si aplica) y si el orden sugerido difiere del default.
- Forecast de riesgo: líneas/archivos estimados (tests incluidos), riesgo alto/bajo, repos
  involucrados.
- Alcance previsto de `document`: `openapi_afectado`, `changelog_afectado`, `readme_afectado`,
  `architecture_afectado`, `guidelines_afectado`.

## Conexión con el Gate C

El resultado de esta fase alimenta el Gate C (`AGENTS.md` → "Pausas y gates") — selección
de slices y aplicación de la estrategia de entrega. Esta skill no aplica el gate, solo
produce los datos que el orquestador necesita para hacerlo.
