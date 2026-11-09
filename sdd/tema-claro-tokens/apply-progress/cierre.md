# Apply progress — tema-claro-tokens / cierre

Rama: `fix/tema-claro-tokens`.

```
test_mode: test-after
test_command: n/a (solo configuración SDD)
tests_status: n/a (la suite quedó en 467/467 al cerrar el slice home; este slice no toca código)
tests_agregados: ninguno
excepciones_sin_test: T-8 — documentación de convención en sdd/sdd-init.md, sin código
logs_conforme: sí (sin logs)
```

## Tareas

| Tarea | Estado | Detalle |
|---|---|---|
| T-8 | Completa | `sdd/sdd-init.md`: convención de tokens de marca. Van en `@theme static` de `src/styles.css` y se emiten siempre en `:root`; los overrides oscuros están en `.dark`; se consumen con `var(--token)` sin fallback, y sus nombres pueden escribirse en `.ts`/`.html`. Un token nuevo va en ese bloque |

## Commits de los slices

| Slice | Commit |
|---|---|
| (planificación) | `5894259` chore(sdd): planifica el cambio tema-claro-tokens |
| `chrome` | `8323b5d` fix(chrome): emite los tokens de marca en :root con @theme static |
| `paginas` | `5a0b9b5` fix(paginas): quita los fallbacks literales de los tokens de marca |
| `home` | `c10e9b4` fix(home): consume los tokens de marca sin fallbacks literales |
| `cierre` | el commit que contiene este archivo (`chore(sdd)`) |

Sin push: la rama es local hasta la apertura del PR #5.

## Preparación de `verify` (fuera del repo)

`scratchpad/qa.mjs` fuerza la carga de las imágenes diferidas antes de medir y capturar: pasa
`loading` a `eager`, espera `load`/`error` con un tope de 8 s y espera `decode()`. Así queda
resuelto el ruido de la foto del equipo en `/nosotros` que se registró en `apply-progress/home`.

`shots-base` se capturó con la versión anterior del script. Para que la comparación de `verify`
no tenga ruido, la base se vuelve a capturar desde `scratchpad/base` con el script actual.

## Desvíos

- Ninguno. P-5 (`expone_api_http`) sigue fuera de alcance, tal como fija la propuesta.
