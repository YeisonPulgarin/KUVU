---
name: sdd-validate
description: This skill should be used after sdd-spec, only when the project has the "validate" extension active in sdd.config.md, to check the spec against a hard external contract (a database schema, an external team's API contract, a legacy system's data format, or a regulatory constraint) before design begins. This is a blocking gate when validation fails.
---

# Extensión: validate (Gate B)

Lee `AGENTS.md` → "El ciclo SDD" (extensiones) y "Pausas y gates" (Gate B) antes de continuar.

**Esta skill solo se ejecuta si `sdd.config.md` declara la extensión `validate` activa.**
Si no está declarada, el orquestador la omite en silencio — no la invoques por iniciativa
propia.

## Qué hace esta fase

1. Lee `sdd/{change-name}/spec` (requerido) y, si aplica, `sdd/{change-name}/explore`
   (opcional, útil para validar contra un sistema legado).
2. Lee en `sdd.config.md` contra qué contrato externo se valida este proyecto en concreto.
3. Verifica cada requisito de la spec contra ese contrato. Por ejemplo: si la spec asume
   un campo que no existe en el schema real, o un formato de respuesta que contradice
   el contrato de otro equipo.
4. Produce un resultado con estado `PASS`, `WARNING`, o `FAIL`, y la lista de
   discrepancias encontradas en cada caso.

## Artifact que produce

`sdd/{change-name}/validate` con: `status`, lista de errores (si `FAIL`), lista de
warnings (si `WARNING`).

## El gate de bloqueo

Esta skill **no decide** qué pasa si el resultado es `FAIL` — solo reporta. Es el
orquestador quien aplica el Gate B (`AGENTS.md` → "Pausas y gates"): bloquear el avance a
`design`, mostrar los errores al usuario, y ofrecer `fix` (volver a `spec`) o `force`
(continuar bajo decisión explícita del usuario, registrada como artifact tipo `decision`).
