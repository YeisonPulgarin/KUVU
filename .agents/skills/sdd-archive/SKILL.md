---
name: sdd-archive
description: This skill should be used as the final step of the SDD workflow, after sdd-verify (and after sdd-secure / sdd-refine, if the user accepted those optional phases), to close out a change — archiving all artifacts, syncing shared memory if configured, and producing a closing report. Use once verification is complete and the change is ready to be considered done.
---

# Fase: archive

Lee `AGENTS.md` antes de continuar. Esta skill implementa la fase 13 del ciclo,
la última del workflow.

## Precondición

Existe `sdd/{change-name}/document-report`. `document` es fase del núcleo y corre siempre:
si el reporte no está, no archives — reportá el bloqueo al orquestador para que corra
`document` primero. Un cambio archivado sin documentar es exactamente el trabajo que después
nadie encuentra.

## Qué hace esta fase

1. Lee todos los artifacts de `sdd/{change-name}/` producidos durante el workflow.
2. Si el almacenamiento configurado en `sdd.config.md` es `memory` o `hybrid`, sincroniza
   (push) los artifacts al backend de memoria compartida configurado — este es el único
   punto del workflow donde se hace push; el resto de las fases solo leen/escriben local.
3. Si el almacenamiento es `files` o `hybrid`, confirma que todos los archivos bajo
   `sdd/{change-name}/` están en su lugar y son consistentes entre sí.
4. Produce un resumen de cierre: qué se hizo, qué se decidió, qué quedó pendiente (si algo).
5. Si existe `sdd/{change-name}/refine-report`, arrastra al resumen de cierre su sección de
   **deuda técnica residual** y lo que quedó **deliberadamente sin tocar** — es lo único del
   ciclo que describe trabajo consciente no hecho, y se pierde si no se registra al cerrar.
6. Si existe `sdd/{change-name}/secure-report`, arrastra al resumen de cierre sus **acciones
   fuera del código** (secretos a rotar, dependencias a actualizar, configuración a endurecer)
   y el **riesgo residual aceptado** con quién lo aceptó. Las acciones pendientes de rotación
   de secretos se destacan al principio del resumen: son trabajo que nadie ve en el diff y que
   sigue abierto después del merge.
7. Del `document-report`, arrastra al resumen de cierre qué quedó documentado y **dónde** (ruta
   del documento en `docs/`, si se actualizó OpenAPI y la colección Bruno, si hay entrada en
   `CHANGELOG.md`, qué secciones del README cambiaron). Si algún destino quedó como "no
   aplica", trasladá también su razón — es lo que evita que alguien lo lea como olvido.

## Artifact que produce

`sdd/{change-name}/archive-report` — resumen de cierre del cambio completo.

## PR y merge (si extensión `git` está activa)

Si `sdd.config.md` tiene la extensión `git` activa, antes de producir el `archive-report`:

1. **Verificar que el push esté hecho.** Revisar que cada `apply-progress/{slice}` tenga
   un campo `commit` con un hash válido. Si algún slice completado no tiene commit/push:
   - Stagear los archivos del slice y commitear con el formato Conventional Commits
     (`{tipo}({scope}): {descripción}`).
   - Pushear: `git push -u origin {rama-actual}`.
   - Actualizar el artifact con el hash del commit.
   Si los tests están en rojo, **no pushear** — reportar el bloqueo al orquestador.

2. Verificar que el `verify-report` tenga `ci_status: verde`. Si no, no continuar.

3. Recordarle al orquestador (para que lo comunique al usuario) que el siguiente paso manual es:
   - Abrir el PR usando `.github/pull_request_template.md` como template.
   - El título del PR sigue Conventional Commits: `{tipo}({scope}): {descripción}`.
   - Estrategia de merge configurada en `sdd.config.md` extensión `git` (default: squash).

4. Registrar en `archive-report` el hash del último commit, la rama pusheada, y la URL
   del PR (si ya fue creado) o una nota de que está pendiente de apertura.

El orquestador no crea el PR directamente — el usuario lo hace. El agente sí hace el commit y el push.

## Nota sobre el push de memoria

Si el proyecto usa un script de sincronización propio (ej. un `engram-sync.sh` u otro
mecanismo declarado en `sdd.config.md`), este es el paso que lo dispara. Ningún otro
punto del workflow debe hacer push manual de memoria — eso evita pushes duplicados o
fuera de orden cuando varias personas trabajan en paralelo con herramientas distintas.
