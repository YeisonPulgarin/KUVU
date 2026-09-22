---
name: sdd-init
description: This skill should be used when starting the SDD workflow for the first time in a project, or when the orchestrator needs to detect the project's stack, test runner, and prior context before running any other SDD phase. Triggers on phrases like "iniciar SDD", "primera vez en este proyecto", or whenever sdd-init/{proyecto} has not been found yet.
---

# Fase: init

Lee `AGENTS.md` completo antes de continuar si no lo hiciste ya en esta sesión.
Esta skill implementa la fase 1 del ciclo SDD.

## Qué hace esta fase

1. Detecta el stack del proyecto (lenguajes, frameworks, gestor de paquetes) leyendo
   archivos de manifiesto (`package.json`, `go.mod`, `requirements.txt`, etc.) — máximo
   3-4 archivos, sin explorar el repo completo.
2. Detecta el comando de test (`npm test`, `go test ./...`, etc.) y lee qué modalidad de
   tests declara `sdd/sdd.config.md` (`tdd` o `test-after`). Los tests son obligatorios en
   las dos: si no hay comando de test detectable ni declarado, reportalo como hallazgo —
   configurar el runner es parte del trabajo, no un prerequisito que se pueda omitir.
3. Detecta si el proyecto expone una API HTTP (rutas, handlers, un `openapi.yaml` existente)
   y si ya tiene `docs/`, `docs/api/openapi.yaml`, `docs/collections/`, `CHANGELOG.md` y
   `README.md`. La fase `document` usa esto para saber qué destinos le aplican.
4. Busca si ya existe un artifact `sdd-init/{proyecto}` previo (en `sdd/sdd-init.md` si
   el almacenamiento es por archivos, o vía búsqueda de memoria si es `memory`/`hybrid`).
   Si existe, no lo regeneres — repórtalo como ya inicializado.
5. Lee `sdd/sdd.config.md` si existe. Si no existe, repórtalo como ausente — el
   orquestador decidirá si seguir con defaults conservadores o pedirle al usuario que
   lo complete primero (ver `sdd/examples/sdd.config.example.md`).

## Artifact que produce

Guarda en `sdd-init/{proyecto}` (clave definida en `AGENTS.md` → "Claves de artifact"):

```
stack: {detectado}
test_command: {detectado o null — null es un hallazgo a reportar, no un estado normal}
test_mode: {tdd | test-after | null si sdd.config.md no lo declara}
config_found: {true/false}
slices_declarados: {lista de sdd.config.md, o vacía}
expone_api_http: {true/false}
docs_existentes: {docs/ | docs/api/openapi.yaml | docs/collections/ | CHANGELOG.md | README.md}
```

Si `test_mode` queda en `null`, el orquestador le pregunta la modalidad al usuario antes del
primer `apply` (ver `AGENTS.md` → "Modalidad de tests"). No la elijas vos.

## No hagas

- No leas el código fuente del proyecto en esta fase — solo manifiestos y config.
- No le preguntes nada al usuario directamente — si falta `sdd.config.md`, repórtalo
  como hallazgo; el orquestador decide cómo proceder.
