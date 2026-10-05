# tasks — bd-docker

## Slices involucrados

**Ninguno de los slices declarados en `sdd.config.md` aplica a este cambio.** Los cinco declarados
(`contenido`, `chrome`, `home-expandida`, `paginas`, `cierre`) son de contenido y chrome del frontend
público; este cambio es de infraestructura de base de datos y backend.

Esto es una desviación explícita del default de la tabla de slices, y está justificada: los slices
describen dominios técnicos del sitio público, y ninguno cubre el motor de base de datos ni el
cableado del backend.

**Propuesta:** este cambio se implementa en **un único slice por defecto** (`slice-unico`), sin
reparto.

## Tareas

Ordenadas por dependencia. `T1` a `T4` no tienen dependencias entre sí y pueden ejecutarse en
cualquier orden.

| # | Tarea | Depende de | Entregable |
|---|---|---|---|
| **T1** | Volcar esquema y datos desde MariaDB de XAMPP. Generar el DDL con `mysqldump --no-data` y los datos con `mysqldump --no-create-info --complete-insert`. Envolver el DDL con las guardas de claves foráneas (D3) y `SET NAMES utf8mb4`. Confirmar que los `AUTO_INCREMENT` quedan preservados | — | `db/init/01-schema.sql`, `db/init/02-seed.sql` |
| **T2** | Escribir el Compose: servicio `db`, imagen `mariadb:10.4`, puerto `3306`, volumen nombrado para el datadir, bind mount de `./db/init` sobre `/docker-entrypoint-initdb.d`, healthcheck, `restart: unless-stopped`, credenciales por `env_file` (D1, D5, D8) | — | `docker-compose.yml` |
| **T3** | Generar credenciales reales para root y para el usuario de la aplicación, escribirlas en `.env` y producir `.env.example` con valores de ejemplo | — | `.env`, `.env.example` |
| **T4** | Ignorar `.env`, `backend/.env` y `db/backups/`. Crear `.gitignore` en la raíz y corregir `backend/.gitignore`, que hoy solo ignora `node_modules/` | — | `.gitignore`, `backend/.gitignore` |
| **T5** | Exponer `checkConnection(pool = pool)` en `backend/db.js` sin cambiar el contrato de las variables de entorno, e invocarla en `backend/server.js` antes de `app.listen()`, con salida distinta de cero si falla (D7, CA10) | T3 | `backend/db.js`, `backend/server.js` |
| **T6** | Tests de `checkConnection` con el runner nativo `node:test`, sin dependencias nuevas: caso de éxito, caso de fallo por credenciales, caso de driver caído. El pool se inyecta como parámetro para poder usar un doble en los tests (CA10) | T5 | `backend/test/db.test.js` |
| **T7** | Cablear `--env-file` en los scripts `start` y `dev` de `backend/package.json`, y crear `backend/.env` con las variables `MYSQL*` que lee el pool (D6) | T3, T5 | `backend/package.json`, `backend/.env` |
| **T8** | **Validar en puerto alternativo con XAMPP todavía sirviendo la base de datos real.** Levantar el Compose con un override de puerto para que no colisione con `mysqld`. Verificar: estado saludable, las 7 tablas creadas, el seed cargado, conteos correctos (CA1, CA2, CA3) | T1, T2, T3, T4 | Validación registrada |
| **T9** | Detener el servicio `mysqld` de XAMPP y el puerto `3306` queda libre. Levantar el Compose ya en `3306` (CA1) | T8 | XAMPP detenido, servicio en 3306 |
| **T10** | Paridad funcional: arrancar el backend contra el contenedor, verificar el log de conexión y que las 7 rutas `/api/*` respondan con los mismos datos que antes (CA8, CA9) | T7, T9 | Resultado de paridad |
| **T11** | Persistencia y respaldo: escribir una fila de prueba, reiniciar el servicio y confirmar que sobrevive, luego eliminarla. Ejecutar respaldo a `db/backups/`, vaciar, restaurar y comparar conteos (CA5, CA11) | T9 | Resultado de respaldo/restauración |
| **T12** | Documentación: guía operativa en `docs/bd-docker.md`, entrada en `CHANGELOG.md`, sección de arranque en `README.md`, y actualizar `docs/architecture.md` con el servicio `db` | T11 | Documentación actualizada |

## Modalidad de tests

`sdd.config.md` declara **`test-after`** (implementación primero, tests antes de cerrar el slice). Se
aplica a **T6**: `T5` implementa, `T6` cubre.

**Observación sobre el alcance de los tests:** el backend no tiene runner de tests
(`backend/package.json` no tiene script de test ni dependencia de test). Se usa el runner nativo
`node:test`, que viene en Node v22 y **no requiere ninguna dependencia nueva** — coherente con el
no-objetivo de no agregar `dotenv` ni ampliar dependencias.

La cobertura se divide en dos naturalezas distintas:

- **Tests automatizados** (`T6`): la lógica de `checkConnection`, que es código real con ramas de
  decisión — caso de éxito, error de credenciales, driver caído.
- **Verificación de integración** (`T8`, `T10`, `T11`): el esquema, los datos y la conectividad del
  backend se validan ejecutando el contenedor y comprobando conteos y respuestas HTTP. No hay forma
  sensata de testear un `docker-compose.yml` con un runner unitario, y escribir un test que solo
  verifique que un contenedorlevantó no agrega valor sobre ejecutarlo y mirar el resultado.

## Forecast de riesgo de revisión

| Métrica | Estimación |
|---|---|
| Archivos tocados | **14** (4 nuevos, 4 modificados, 4 de infra nuevos, 2 de docs) |
| Líneas cambiadas | **~715** |
| Repos involucrados | 1 (este repo, monorepo frontend+backend) |

**Riesgo: ALTO** — supera el umbral de 300 líneas declarado en `sdd.config.md`.

**Desglose honesto de esas 715 líneas:**

| Tipo | Líneas | Naturaleza |
|---|---|---|
| Generado por `mysqldump` (esquema + seed) | ~390 | **No es código escrito a mano.** Es la base de datos actual, transcrita. Se revisa mirando que las 7 tablas estén, no línea por línea |
| Documentación | ~180 | `docs/bd-docker.md`, README, CHANGELOG, architecture |
| Código real (compose, db.js, server.js, package.json) | ~85 | **Lo que de verdad necesita revisión de código** |
| Tests + `.gitignore` | ~60 | |

**Lo que realmente se revisa con cabeza es ~145 líneas.** Las 715 se disparan por el volumen de datos
y documentación, que es exactamente lo que la migración tiene que mover.

**Riesgo residual bajo:** el cambio no toca lógica de negocio, no altera contratos de API, no modifica
el esquema y no requiere rollback de código. Su riesgo es operacional — que el motor no arranque o
que los datos no lleguen — y eso lo cubren T8, T9 y T11 verificando conteos antes de declarar cerrada
la base de datos antigua.

## Alcance previsto de `document`

| Destino | ¿Afectado? | Razón |
|---|---|---|
| `docs/bd-docker.md` | **Sí** | Guía operativa nueva: levantar, detener, respaldar, restaurar |
| `docs/architecture.md` | **Sí** | Se incorpora un servicio de infraestructura al diagrama de componentes |
| `CHANGELOG.md` | **Sí** | Cambia cómo se levanta el entorno de desarrollo: quien siga el procedimiento anterior va a buscar XAMPP |
| `README.md` | **Sí** | El arranque pasa a requerir Docker en lugar de XAMPP |
| OpenAPI | **No** | El cambio no toca endpoints HTTP |
| Colecciones Bruno | **No** | Ídem |
| `DEVELOPMENT_GUIDELINES.md` | **No** | No introduce convención de código nueva. Se deja registrado que el esquema se aparta de la convención de naming, como desviación conocida preexistente |
