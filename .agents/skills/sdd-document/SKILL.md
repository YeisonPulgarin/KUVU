---
name: sdd-document
description: This skill should be used after sdd-verify (and after sdd-secure / sdd-refine, if those optional phases ran), before sdd-archive, to leave the change documented — a feature document under docs/, an updated OpenAPI spec and Bruno collection if HTTP endpoints changed, and CHANGELOG / README entries when the change is visible from outside. Mandatory core phase, runs on every change.
---

# Fase: document

Lee `AGENTS.md` antes de continuar. Esta skill implementa la fase 12 del ciclo, entre
`verify` y `archive`.

Corre **siempre**, sobre cambios ya verificados. Lo que varía no es si corre, sino cuáles de
sus destinos toca este cambio concreto.

## Antes de empezar

Leé, en este orden:

1. `sdd/{change-name}/propose` — el "qué y por qué" del cambio, en las palabras acordadas.
2. `sdd/{change-name}/spec` — los criterios de aceptación: son el contrato que la
   documentación describe.
3. `sdd/{change-name}/design` — decisiones técnicas y sus tradeoffs.
4. Todos los `sdd/{change-name}/apply-progress/{slice}` — qué se implementó realmente, qué
   quedó pendiente, qué excepciones de test se registraron.
5. `sdd/{change-name}/verify-report` y, si existen, `secure-report` y `refine-report` — la
   deuda técnica residual y el riesgo aceptado son parte de lo que se documenta.

**No documentes lo que planeaste: documentá lo que quedó en el código.** Ante una diferencia
entre `design` y lo que muestra `apply-progress`, gana el código. Si la diferencia es
sustantiva, además reportala al orquestador.

## Los destinos

### 1. `docs/{change-name}.md` — siempre

Todo cambio deja su documento. Si el archivo ya existe (retomaste un cambio, o corriste
`document` de nuevo tras `refine`), **actualizalo en su lugar** — no crees una segunda versión
ni una sección "actualización de...".

Estructura:

```markdown
# {Nombre del cambio}

{Uno o dos párrafos: qué hace esto y para qué existe, en presente.}

## Cómo funciona

{Arquitectura y flujo, al nivel de detalle que necesita alguien que va a modificar esto
dentro de seis meses. Referenciá archivos por ruta: `internal/foo/bar.go`.}

## Decisiones

{Solo las que un lector podría querer revertir sin entender por qué están. Cada una con su
tradeoff. Las decisiones obvias no van.}

## Limitaciones conocidas

{Lo que no hace y no va a hacer, y la deuda técnica que `refine` o `secure` dejaron
registrada. Vacío es una respuesta válida — pero omitir deuda que sí existe, no.}
```

Aplicá el estándar de documentación de `AGENTS.md`: **solo tiempo presente**. Describí lo que
el sistema ES y HACE, nunca su historia. El único lugar del repo donde se habla de versiones
anteriores es el `CHANGELOG.md`.

Si el proyecto ya tiene una convención de organización en `docs/` (subcarpetas por dominio,
un índice, un `mkdocs.yml`), respetala en vez de imponer esta ruta, y actualizá el índice.

### 2. `docs/architecture.md` — siempre que el cambio toca código

La arquitectura de alto nivel del proyecto (componentes, capas, flujos, decisiones
estructurales) vive en `docs/architecture.md` (el instalador la siembra desde un template si
el proyecto no la tiene).

- Si el archivo **no existe** y el cambio toca código de producción, **creálo** a partir del
  template y completálo con la arquitectura real del proyecto.
- Si **existe** y el cambio altera la arquitectura (nuevo componente, nueva capa, nuevo flujo
  estructural, cambio de límite), **actualizá** las secciones afectadas — no agregues una
  "actualización de...".
- Un cambio interno que no altera la arquitectura deja el archivo como está, y se registra
  como "sin cambios" en el reporte.

### 3. `DEVELOPMENT_GUIDELINES.md` — validación, no regeneración

`DEVELOPMENT_GUIDELINES.md` (raíz) define **cómo se construye** y contiene la política de logs
uniforme. Es template que el proyecto adapta y edita.

- `document` **no** regenera ni reescribe los guidelines: `apply` ya los siguió y `verify` ya
  los validó.
- Si el cambio **introduce una convención nueva** (nueva estructura de módulo/feature, nueva
  regla de logs, nuevo patrón prohibido), `document` la registra como desvío al orquestador
  para decidir si entra a los guidelines por `spec` — no la escribe directamente en el
  documento sin pasar por el flujo.
- Si modificaste el template (assets) para agregar una convención, el instalador la propaga a
  los proyectos en la próxima corrida; no la apliques a mano en cada proyecto.

### 4. `docs/api/openapi.yaml` y `docs/collections/` — si el cambio tocó endpoints HTTP

Decidilo mirando el diff, no adivinando: si el cambio agregó, quitó o modificó rutas,
request/response bodies, códigos de error o requisitos de autenticación, este destino aplica.
Un cambio interno que no altera el contrato HTTP, no.

Cuando aplica, **delegá en la skill `sds-api-docs` en modo incremental** — es la fuente de
verdad del formato OpenAPI 3.1 y del formato Bruno, y no se duplica acá. Pasale qué módulo o
endpoints cambiaron. Esa skill:

- Actualiza `docs/api/openapi.yaml` sin borrar los endpoints que ya estaban.
- Genera o actualiza los `.bru` en `docs/collections/{módulo}/`, ejecutables en Bruno sin
  edición manual.
- Mantiene `docs/collections/bruno.json` y los environments.

Reglas que verificás vos al recibir el resultado:

- El spec refleja **exactamente** los json tags del código, no los nombres de los campos en el
  lenguaje. Si el struct dice `json:"first_name"`, el schema dice `first_name`.
- Ningún endpoint preexistente desapareció del spec ni de la colección.
- Los códigos de error documentados son los que el handler realmente devuelve.

Si el proyecto no tiene `docs/api/openapi.yaml` todavía y este cambio introduce los primeros
endpoints, `sds-api-docs` corre en modo directo (hace su entrevista de info/base URL/auth a
través del orquestador — nunca directo al usuario).

### 5. `CHANGELOG.md` — si el cambio es visible desde afuera

Aplica cuando el cambio agrega, modifica o quita algo que un usuario del proyecto puede notar:
una feature, un fix, un breaking change, una dependencia. **No** aplica a refactors internos
sin efecto observable, cambios de tests, o ajustes de documentación.

Formato [Keep a Changelog](https://keepachangelog.com), entrada bajo `## [Unreleased]`:

```markdown
## [Unreleased]

### Added
- {Qué puede hacer ahora alguien que antes no podía.}

### Changed
- {Qué se comporta distinto, y en qué se nota.}

### Fixed
- {Qué estaba roto. Describí el síntoma, no el commit.}

### Removed
- {Qué dejó de existir y con qué se reemplaza.}
```

Si el archivo no existe y el cambio lo amerita, creálo con ese formato. Si el proyecto usa otra
convención, seguí la del proyecto.

Escribí para quien usa el proyecto, no para quien lo escribió: "el instalador ahora detecta
Kiro CLI por separado de Kiro IDE" sirve; "refactor de `detect.go`" no.

Un breaking change se marca explícitamente y dice **cómo migrar**, no solo que rompe.

### 6. `README.md` — si cambió la superficie pública

Aplica cuando el cambio altera algo que está (o debería estar) en el README: instalación,
comandos, variables de entorno, requisitos, endpoints principales, capturas, o la descripción
misma de qué hace el proyecto.

Editá **solo las secciones afectadas**. No reescribas el README entero ni le agregues
secciones que nadie pidió — un README que crece en cada feature deja de leerse.

Si el cambio no toca nada de eso, dejá el README como está y registralo así en el reporte.

## Artifact que produce

`sdd/{change-name}/document-report`:

```
docs_archivo: {ruta del documento creado o actualizado}
architecture: {creado | actualizado: {secciones} | sin cambios | no aplica: {por qué}}
guidelines: {sin cambios | desvío reportado al orquestador: {convención nueva propuesta}}
openapi: {actualizado: {n} endpoints | no aplica: {por qué}}
collections: {actualizado: {rutas .bru} | no aplica: {por qué}}
changelog: {entrada agregada bajo Unreleased, sección {Added/Changed/...} | no aplica: {por qué}}
readme: {secciones actualizadas | no aplica: {por qué}}
desvios: {diferencias encontradas entre design y lo implementado — vacío si no hay}
```

**"No aplica" siempre lleva su razón.** Un destino saltado sin justificación es
indistinguible de un destino olvidado, y quien lea el reporte dentro de un mes no puede
distinguirlos.

## Commit (si extensión `git` está activa)

Stagear los archivos de documentación tocados y commitear:

```
docs({scope}): {descripción de lo documentado}
```

Registrar el hash en el `document-report`. No pushear si los tests están en rojo.

## No hagas

- No toques código de producción. Si documentando encontrás un bug o una inconsistencia,
  reportala al orquestador — quien decide si se vuelve a `apply` es él, no vos.
- No inventes lo que no podés inferir del código con confianza. Un campo omitido es
  recuperable; un campo documentado mal manda a alguien en la dirección equivocada.
- No dupliques en `docs/` lo que ya vive en los artifacts de `sdd/{change-name}/`. Los
  artifacts son el registro del proceso; `docs/` describe el sistema resultante. Alguien que
  llega nuevo al repo lee `docs/`, no `sdd/`.
- No le preguntes nada al usuario directamente — devolvé lo que necesite decisión humana al
  orquestador.
