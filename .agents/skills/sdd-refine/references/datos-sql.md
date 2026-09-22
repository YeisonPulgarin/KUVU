# SQL y capa de datos

Nunca "optimices" una consulta sin **plan de ejecución antes/después** y **volumen de datos
representativo**. Optimizar contra una tabla de 10 filas es engañarse.

Atá cada hallazgo a ACID y a evidencia (`EXPLAIN` / `EXPLAIN ANALYZE`), no a intuición.

## Smells frecuentes y su tratamiento

- **N+1 queries** → eager loading, join o batch. Es la causa número uno de lentitud
  silenciosa: no rompe nada, solo se degrada con el volumen.
- **Índices ausentes o no usados** → revisá el plan. Cuidado con conversiones implícitas de
  tipo o funciones aplicadas sobre la columna, que anulan el índice. Considerá índices
  *covering* para las consultas calientes.
- **`SELECT *`** → traé solo lo necesario. Afecta índices covering, tráfico de red y acopla el
  código al esquema.
- **Normalización vs denormalización** → normalizá por default; denormalizá solo con
  justificación de rendimiento **medida** y una estrategia clara de consistencia.
- **Paginación ausente** en endpoints que devuelven colecciones que crecen.
- **Idempotencia** en escrituras que pueden reintentarse.

## Fronteras transaccionales

- **Demasiado amplias** → locks largos, contención, deadlocks.
- **Demasiado estrechas** → invariantes rotos entre operaciones que debían ser atómicas.
- La transacción abarca exactamente el invariante de negocio: ni más, ni menos.

## Nivel de aislamiento

Elegí el mínimo que preserve la corrección. Entendé los fenómenos y su costo:

| Fenómeno | Qué es |
|---|---|
| Dirty read | leer datos de una transacción no confirmada |
| Non-repeatable read | la misma fila cambia entre dos lecturas de la misma transacción |
| Phantom read | aparecen filas nuevas que matchean el mismo criterio |

No subas a `SERIALIZABLE` por default, y no te quedes en `READ COMMITTED` si hay una
invariante que exige más. Justificá el nivel elegido contra el invariante concreto que protege.
