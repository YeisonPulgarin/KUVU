# apply-progress — backend-orden

Estado: **completo**. No hay progreso previo de este slice.

| Tarea | Estado | Detalle |
|---|---|---|
| B1 | Completa | `backend/routes/empresas.js`: `GET /api/empresas` usa `SELECT * FROM empresas WHERE activo = 1 ORDER BY id` |
| B2 | Completa | `backend/test/empresas.route.test.js`: 5 tests (SQL con `ORDER BY id`, orden de la respuesta, 500 sin detalles internos, `GET /:id` 200 y 404) |
| B3 | Completa | Suite backend 10/10 en verde |

## Evidencia

- Safety net previo: `npm test` con 5/5 en verde.
- Mutación de control: con `ORDER BY nombre` restaurado temporalmente, el test
  "lists active companies ordered by id" falla. El test detecta la regresión y el código queda
  restaurado a `ORDER BY id`.
- Base real (`kuvu_db`, vía `backend/.env`): la consulta nueva devuelve `1 Amarilo, 2 Nido Rent,
  3 Balcones de San Soucci, 4 Mi Inmueble`.

## Desvíos del plan

- Ninguno funcional. El test de 500 silencia el `console.error` existente de la ruta con
  `t.mock.method` para mantener limpia la salida de la suite; la ruta no se modifica.
- Para que el usuario vea el orden nuevo hay que reiniciar el backend: el proceso en ejecución
  tiene cargada la consulta anterior.

```
test_mode: test-after
test_command: npm test (en backend/, = node --test)
tests_status: verde
tests_agregados: backend/test/empresas.route.test.js
excepciones_sin_test: —
logs_conforme: sí (no se agregan logs; el console.error preexistente de la ruta no se toca, deuda transversal registrada en design §11)
commit: — (sin commit: no lo pidió el usuario; extensión git inactiva)
```
