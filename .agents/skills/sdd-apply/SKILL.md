---
name: sdd-apply
description: This skill should be used to implement one slice of work from sdd-tasks — writing production code together with its tests, in either of the two mandatory test modalities (tdd, test-first RED-GREEN; or test-after, implementation then coverage before closing the slice). Use once tasks are confirmed and a specific slice (or the single default slice) is ready to be implemented.
---

# Fase: apply (por slice)

Lee `AGENTS.md` antes de continuar. Esta skill implementa la fase 8 del ciclo,
invocada una vez por cada slice declarado en `sdd.config.md` (o una sola vez si el
proyecto no declara slices).

## Antes de empezar — continuidad entre sesiones/herramientas

Sigue `AGENTS.md` → "Continuidad de `apply` entre sesiones y herramientas" al pie de la letra: busca si existe un
`apply-progress` previo para este slice. Si existe, **léelo y mergea** — nunca
sobrescribas. Esto es lo que permite que un compañero retome en otra herramienta un
slice que alguien más empezó.

## Qué hace esta fase

1. Lee `sdd/{change-name}/tasks`, `sdd/{change-name}/spec`, `sdd/{change-name}/design`,
   y el `apply-progress` previo de este slice si existe.
2. Implementa únicamente las tareas correspondientes a este slice.
3. **Seguí la política de logs del proyecto** (ver `DEVELOPMENT_GUIDELINES.md`, sección
   "Logging & Observability") en todo log que agregues: formato estructurado, campos base
   (`service`, `env`, `level`, `msg`, `timestamp`, `request_id`, + `trace_id`/`span_id` si
   hay trazas), niveles con significado operativo, sin datos sensibles, y sin loguear lo que
   debería ser una métrica. El logging es parte del trabajo de implementación, no post-hoc.
4. **Escribe los tests de todo comportamiento nuevo o modificado.** No es opcional. Lo único
   que varía es el orden, según la modalidad que te pasó el orquestador (ver
   `references/tests.md` para el protocolo completo de cada una):
   - **`tdd`** — RED → GREEN → REFACTOR por cada unidad de comportamiento: el test se escribe
     y se ve fallar antes de que exista la implementación.
   - **`test-after`** — implementás la tarea y escribís sus tests inmediatamente después,
     dentro del mismo slice, antes de pasar a la siguiente tarea.

   Comunes a las dos: si modificás código existente corré la suite primero como safety net;
   ningún slice cierra con tests en rojo o sin escribir; si un test falla después de
   implementar, se arregla la implementación, nunca el test; sin assertions triviales.
5. Al terminar (o al pausar por falta de contexto), guarda el progreso.

## Artifact que produce

`sdd/{change-name}/apply-progress/{slice}` — estado de avance de este slice: qué tareas
están completas, cuáles en progreso, cuáles pendientes, y cualquier desvío del plan
original con su justificación. Incluí además:

```
test_mode: {tdd | test-after}
test_command: {comando corrido}
tests_status: {verde | rojo}
tests_agregados: {rutas de los archivos de test escritos o modificados}
excepciones_sin_test: {tareas sin cobertura y por qué — vacío si no hay}
logs_conforme: {sí | desvío: {qué log se apartó de la política y por qué}}
```

Ese bloque es lo que `verify` y `document` leen para saber qué se cubrió y qué no.

## Commit al cerrar el slice (si extensión `git` está activa)

Si `sdd.config.md` tiene la extensión `git` activa, al completar todas las tareas del
slice (o al pausar con progreso parcial guardado):

1. Stagear los archivos modificados por este slice (`git add` específico — no `git add .`).
2. Crear el commit con Conventional Commits siguiendo `sds-git` sección 2:
   ```
   {tipo}({scope}): {descripción imperativa corta}
   ```
   - El tipo se infiere del artifact `propose` (feat / fix / chore / refactor).
   - El scope es el nombre del slice o módulo principal afectado.
   - Si el slice completó solo una parte de las tareas, agregar un cuerpo con
     `WIP: {tareas pendientes}` para que quede claro en el historial.
3. Pushear la rama al remoto: `git push -u origin {rama-actual}`.
4. Registrar el hash del commit y la URL del push en el artifact
   `sdd/{change-name}/apply-progress/{slice}` bajo la clave `commit`.

**No hagas push si los tests están en rojo.** Si hay tests fallando, reportar el bloqueo al
orquestador en vez de pushear código roto. Vale en las dos modalidades.

## No hagas

- No toques tareas de otro slice — eso es responsabilidad de otra invocación de esta
  misma skill.
- No cierres el slice con código de producción sin tests. Si una tarea no tiene forma
  razonable de testearse, documentá la excepción en `excepciones_sin_test` — no la saltees
  en silencio.
- No documentes acá (`docs/`, OpenAPI, Bruno, CHANGELOG, README) — eso es la fase
  `document`, que corre después de `verify` sobre el cambio ya validado.
- No le preguntes nada al usuario directamente — si encontrás un bloqueo que requiere
  decisión humana, reportalo en el artifact y devolvé el control al orquestador.
