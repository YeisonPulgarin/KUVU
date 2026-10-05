# apply-progress — slice-unico

**Slice:** único. Ninguno de los slices declarados en `sdd.config.md` aplica a este cambio
(infraestructura de base de datos, no contenido del sitio público).

**Modalidad:** `test-after` (declarada en `sdd.config.md`)

## Estado de tareas

| # | Tarea | Estado |
|---|---|---|
| T1 | Volcar esquema y datos desde MariaDB de XAMPP | Completada |
| T2 | `docker-compose.yml` con volumen nombrado y healthcheck | Completada |
| T3 | Credenciales en `.env` y `.env.example` | Completada |
| T4 | `.gitignore` raíz y `backend/.gitignore` | Completada |
| T5 | `checkConnection` en `db.js` + arranque fail-fast en `server.js` | Completada |
| T6 | Tests con `node:test` | Completada |
| T7 | `--env-file` en los scripts y `backend/.env` | Completada |
| T8 | Validación en puerto alternativo con XAMPP sirviendo | Completada |
| T9 | Parada de XAMPP y corte a `3306` | Completada |
| T10 | Paridad funcional del backend | Completada |
| T11 | Persistencia y respaldo/restauración | Completada |
| T12 | Documentación | Completada |

## Verificación de criterios de aceptación

| CA | Resultado | Evidencia |
|---|---|---|
| CA1 | **PASS** | Contenedor `healthy`, `3306/tcp -> 0.0.0.0:3306`, MariaDB `10.4.34` |
| CA2 | **PASS** | Las 7 tablas creadas con FKs e índices; sin errores en el log de arranque |
| CA3 | **PASS** | Conteos: empresas 4, rol 2, usuarios 8, local 8, contratoarrendamiento 4, pago_variados 9, mantenimiento 6 |
| CA4 | **PASS** | Tras `docker compose restart` y tras recrear el contenedor, los conteos no cambiaron |
| CA5 | **PASS** | Fila `TEST_PERSISTENCIA` escrita, sobrevive a `docker restart`, eliminada después |
| CA6 | **PASS** | `git check-ignore` marca `.env` y `backend/.env`; `.env.example` sí versionable |
| CA7 | **PASS** | Password incorrecta y password vacía rechazadas con `ERROR 1045`; la correcta funciona |
| CA8 | **PASS** | El backend reporta `Conectado a MySQL` y escucha en `3000` |
| CA9 | **PASS** | Las 7 rutas `/api/*` responden 200 con datos reales; login verificado con credenciales reales |
| CA10 | **PASS** | Con la BD detenida el proceso sale con código 1 y no deja el puerto 3000 escuchando |
| CA11 | **PASS** | Respaldar → `DROP DATABASE` → restaurar devuelve la base idéntica al seed versionado |
| CA12 | **PASS** | Reconstrucción completa desde volumen vacío verificada destruyendo y recreando el contenedor |

**Todos los criterios en verde.**

## Hallazgos durante la implementación

### H1 — `information_schema.table_rows` dio un conteo equivocado

Reportó 8 para `pago_variados` cuando el valor real es 9. En InnoDB esa columna es una **estimación**,
no un conteo. Los conteos de referencia se tomaron con `COUNT(*)`. Se corrigió `explore.md` y CA3.

### H2 — Los datos eran idénticos, pero los md5 de comparación no

La primera comparación dio 3 tablas con hash distinto. Causa: `GROUP_CONCAT` **no garantiza orden**
sin `ORDER BY`, así que el hash dependía del orden de escaneo. Al agregar
`ORDER BY MD5(...)` dentro del `GROUP_CONCAT`, las 7 tablas resultaron idénticas. Los datos nunca
estuvieron en riesgo; el método de verificación era el defectuoso.

Los `timestamp` también se veían desplazados 5 horas entre XAMPP y el contenedor. No era
corrupción: ambos motores tienen `time_zone = SYSTEM`, y cada uno renderiza en su zona local. Fijando
`SET time_zone='+00:00'` en ambos lados, los valores coinciden exactamente.

### H3 — `mariadb` con `$variable` de PowerShell falla de forma confusa

Pasar `-p$pw` produced `Access denied` aunque la contraseña fuera correcta: PowerShell no expande la
variable dentro del argumento de la forma esperada. Se resolvió usando contraseñas literales o
`--password=`. Sin impacto en el producto, pero explica los falsos negativos durante la verificación.

### H4 — `db.config` no existe en el pool de `mysql2`

La primera versión del mensaje de error usaba `db.config.connectionConfig.host`. El pool de
`mysql2/promise` no expone esa propiedad: el error de arranque era un `TypeError` que enmascaraba el
problema real. Se exportó un objeto `config` explícito desde `backend/db.js`.

## Desvíos del plan

- **Se agregó `backend/.env` además del `.env` raíz.** Está en el plan (T7). Se documenta que son
  archivos distintos con valores que deben coincidir, y por qué no se unifican: el Compose las lee
  al crear el contenedor, el backend al arrancar, y un `.env` compartido expondría el password de
  root en el entorno del proceso de Node.
- **Se agregó `exports.config` a `backend/db.js`.** No estaba en el plan original. Es necesario para
  que el mensaje de error de CA10 sea útil (H4).
- **La validación de T8 se hizo en `3307`, no en `3306`.** XAMPP seguía sirviendo la base real, así
  que el puerto tenía que quedar libre. El override se eliminó antes del corte final.

## Tests

```
test_mode: test-after
test_command: npm test  (node --test)
tests_status: verde
tests_agregados:
  - backend/test/db.test.js  (5 tests: éxito, release, rechazo por credenciales,
                              rechazo por driver caído, no-release en fallo)
excepciones_sin_test:
  - T1-T4, T8-T11 (infraestructura y verificación de integración): no hay forma
    razonable de testear un docker-compose.yml con un runner unitario. Cubiertos por
    verificación con conteos reales de filas y respuestas HTTP.
logs_conforme: sí
```

## Seguridad de las credenciales

- `DB_ROOT_PASSWORD`: valor generado, vive solo en `.env` (ignorado por git)
- `DB_APP_USER`: `kuvu_app`; `DB_APP_PASSWORD`: valor generado, vive solo en
  `backend/.env` (ignorado por git)

Los valores no se registran en artifacts porque `sdd/` sí se versiona. `.env.example`
contiene placeholders `CHANGE_ME`.

Ambos en `.env` y `backend/.env`, ambos ignorados por git. `.env.example` tiene valores de ejemplo.

**El usuario `kuvu_app` no tiene permisos sobre la base `mysql` del sistema**, así que el password de
root no se expone a la aplicación. Es el usuario que usa el backend.

## Rollback

El dump de la base original está en `db/init/01-schema.sql` y `db/init/02-seed.sql`, versionados. Para
volver a XAMPP basta con restaurar esos dos archivos sobre el MariaDB de XAMPP. XAMPP fue detenido,
no desinstalado, y su directorio de datos quedó intacto.

## Commit

Extensión `git` **no activa** en `sdd.config.md` → sin commit ni push en esta fase.
