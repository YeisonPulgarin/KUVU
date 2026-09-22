---
name: sdd-verify
description: This skill should be used after all apply slices are complete (or intentionally skipped) to check whether what was built actually satisfies the spec and design — running tests, checking acceptance criteria, and reporting any drift. Also re-run after sdd-secure or sdd-refine to confirm those phases preserved behavior, before archiving a change.
---

# Fase: verify

Lee `AGENTS.md` antes de continuar. Esta skill implementa la fase 9 del ciclo
("Validate: ¿lo construido cumple lo especificado?").

## Qué hace esta fase

1. Lee `sdd/{change-name}/spec`, `sdd/{change-name}/tasks`, y todos los
   `apply-progress/{slice}` existentes.
2. Recibe del orquestador qué slices se completaron y cuáles se omitieron
   (`stages_completed` / `stages_skipped` — ver `AGENTS.md` → "Pausas y gates", Gate D). Si hay slices
   omitidos, verifica solo lo que corresponde a los slices completados — no falles la
   verificación por trabajo que el usuario decidió no hacer todavía.
3. Corre la suite de tests. No es condicional: los tests son obligatorios en todo cambio, y
   un `verify` sin suite corrida no está completo. Si el slice no declaró comando de test,
   eso es un bloqueo que se reporta al orquestador, no un paso que se omite.

   Contrastá además lo corrido contra el bloque `tests_agregados` /
   `excepciones_sin_test` de cada `apply-progress/{slice}`: si un slice cerró con código de
   producción sin cobertura y sin excepción documentada, reportalo como desvío.
   Si esta es una **re-corrida posterior a `secure` o `refine`**, lee también
   `sdd/{change-name}/secure-report` y `sdd/{change-name}/refine-report` (los que existan) y
   verifica que los cambios ahí aplicados preservaron el comportamiento: los mismos criterios
   de aceptación deben seguir pasando, y ninguna métrica de baseline debe haber empeorado.
   Actualiza el `verify-report` existente en vez de crear uno nuevo — deja registrado a qué
   estado corresponde la verificación.

   **Excepción de seguridad:** si un criterio de aceptación falla porque un fix de `secure`
   cambió el comportamiento observable a propósito (y así está declarado en el
   `secure-report`), eso no es una regresión: es un desvío que va reportado al orquestador
   para que decida si toca la spec. Nunca lo resuelvas debilitando el control.
4. Verifica cada criterio de aceptación de `spec` contra lo implementado.
5. Validá los tres ejes del protocolo (regla dura, reportá desvíos en el `verify-report`):
   - **Documentación declarada**: que `tasks` haya anticipado el alcance de `document`, en
     particular si el cambio toca `docs/architecture.md` (crear/actualizar) y si introduce una
     convención que toque `DEVELOPMENT_GUIDELINES.md`. La documentación en sí es fase
     `document`, pero aquí se confirma que el alcance está declarado.
   - **Guidelines**: que el código implementado siga `DEVELOPMENT_GUIDELINES.md` (estructura de
     módulos/features, rutas/wiring, convenciones del stack). Contrastá contra la skill de
     stack correspondiente.
   - **Logs**: que el código agregado use el formato uniforme de la política (logger
     inyectado donde aplica, campos base, niveles, sin datos sensibles, sin logs donde va
     métrica). Cruzá con el campo `logs_conforme` de cada `apply-progress/{slice}`.
6. Reporta cualquier desvío: criterios no cumplidos, tests fallando, logs fuera de formato,
   guidelines incumplidos, o discrepancias entre lo diseñado y lo implementado.

## Artifact que produce

`sdd/{change-name}/verify-report` con: criterios verificados (pasa/no pasa cada uno),
resultado de tests, y lista de desvíos si los hay.

## CI check (si extensión `git` está activa)

Si `sdd.config.md` tiene la extensión `git` activa y el proyecto tiene workflows en
`.github/workflows/`, agregar al `verify-report`:

```
ci_status: {verde / rojo / pendiente}
ci_url: {URL del run, si disponible}
```

Para obtener el estado: `gh run list --branch {rama} --limit 1 --json status,conclusion,url`.
Si el CI está rojo o pendiente, **no reportar verify como completo** — registrar el bloqueo
y reportarlo al orquestador. No reintentes el run ni toques el código.

## No hagas

- No hagas pasar un test debilitando un control de seguridad aplicado por `secure`. Si el test
  y el control chocan, el que se ajusta es el test.
- No corrijas el código tú mismo al encontrar un desvío — reportalo. Es el orquestador
  quien decide si se vuelve a `apply` para corregir o se documenta como limitación
  conocida.
- No omitas el CI check si la extensión `git` está activa — el objetivo es que `main`
  siempre esté en estado deployable.
