# Apply progress — home-profesional / cierre

Rama: `feat/home-profesional`. Slice 5 de 5. Estado: **completo**.

## Tareas

| # | Tarea | Estado |
|---|---|---|
| T5.1 | `sdd/sdd.config.md`: tabla de slices con `contenido → chrome → paginas → home → cierre` y la regla de orden; `sdd/sdd-init.md`: `slices_declarados` y `test_mode: test-after` | hecho |

## Notas

- La línea de stack de `sdd.config.md` (`PostgreSQL`) y `expone_api_http: false` de
  `sdd-init.md` no se tocan: `feat/acceso-orden-e-intro` ya las corrige (MariaDB + Express,
  `true`). Al integrar ambas ramas, la tabla de slices de `sdd.config.md` entra en conflicto y
  se resuelve a mano (quedarse con la de este cambio o fusionar las dos tablas).
- Sin cambios de código: la suite y el build quedan como al cerrar el slice `home`
  (295/295, initial 421.39 kB).

```
test_mode: test-after
test_command: (sin código en este slice; suite y build verificados al cerrar `home`)
tests_status: verde
tests_agregados: (ninguno)
excepciones_sin_test: T5.1 — solo archivos de configuración SDD (Markdown), sin comportamiento ejecutable
logs_conforme: sí — no aplica
```
