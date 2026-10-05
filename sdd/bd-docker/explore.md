# explore — bd-docker

## Qué existe hoy

La base de datos de KUVU corre como **MariaDB 10.4.32 provista por XAMPP** en `C:\xampp`, con
`root` y **contraseña vacía**. No es MySQL de Oracle: es MariaDB, aunque el driver del backend sea
`mysql2`.

- **Estado de los servicios (verificado):** `mysqld` escuchando en `0.0.0.0:3306` (PID 24388) y dos
  procesos `httpd` de Apache activos. Ambos levantados desde XAMPP.
- **Docker ya instalado y operativo:** Server `29.3.1`, Compose `v5.1.1`. No hay ningún contenedor
  ocupando `3306`; los contenedores existentes del equipo están todos `Exited`, así que no hay
  conflictos de puertos que resolver.
- **No existe infraestructura de contenedores en el repo:** no hay `Dockerfile`, ni
  `docker-compose.yml`, ni `.env`, ni Makefile, ni archivos `.sql` versionados. La única
  infraestructura es el data dir de MariaDB dentro de XAMPP.

### Volúmenes de Docker Desktop

Los contenedores existentes del equipo (`inmobiliarias_postgres`, `obs_*`, `vitrina-postgres`)
persisten datos con **volúmenes nombrados**, no con bind mounts sobre rutas de Windows. Ese es el
patrón que sigue este cambio.

### Base de datos `bd_arrendamientos`

7 tablas InnoDB, todas `utf8mb4_general_ci`, con **40 filas en total** — volumen trivial, el riesgo
está en el esquema y no en los datos.

| Tabla | Filas | Contenido |
|---|---|---|
| `empresas` | 4 | Multi-tenant. `id`, `subdominio` UNIQUE, colores, `activo`, `created_at` |
| `rol` | 2 | Sin FK entrante desde otras tablas más que `usuarios` |
| `usuarios` | 8 | FK a `empresas` y `rol`. Sin columna de password |
| `local` | 8 | FK a `empresas` y `usuarios.idUsuario` |
| `contratoarrendamiento` | 4 | FK a `empresas`, `local`, `usuarios` (×2). `ON DELETE CASCADE` en `idLocal` |
| `pago_variados` | 9 | FK a `empresas`, `usuarios` (×2), `local`, `contratoarrendamiento`. ENUMs `tipo` |
| `mantenimiento` | 6 | FK a `empresas`, `usuarios` (×2), `local`. ENUMs `prioridad`, `estado` |

Conteos verificados con `COUNT(*)`, no con `information_schema.table_rows`: en InnoDB esa última es
una **estimación** y reportaba 8 para `pago_variados` cuando el valor real es 9.

Detalles de DDL que condicionan la elección del motor destino:

- `DEFAULT current_timestamp()` en minúscula y **con paréntesis** en `timestamp NOT NULL` — aceptado
  por MariaDB y por MySQL 8.
- `int(11)` como ancho de visualización en todas las PK y FKs — deprecado en MySQL 8.0.17+, sigue
  aceptando con warning.
- ENUMs `('baja','normal','urgente')`, `('pendiente','en_proceso','completado','cancelado')`,
  `('Arriendo','Multa','Otro')`.
- Sin stored procedures, sin triggers, sin vistas, sin usuarios MySQL propios.

**Verificación de respaldo:** `mysqldump --routines --triggers --single-transaction --databases
bd_arrendamientos` corre correctamente y produce un dump de **28 KB**. El esquema se puede
extraer y restaurar sin pérdida.

### Backend

- `backend/db.js:3` — pool `mysql2/promise` con 5 variables de entorno
  (`MYSQLHOST`, `MYSQLPORT`, `MYSQLUSER`, `MYSQLPASSWORD`, `MYSQLDATABASE`) y defaults
  `127.0.0.1:3306`, `root`, contraseña vacía, `bd_arrendamientos`. **El código ya es
  parametrizable por entorno**, no hace falta reescribirlo para Docker.
- `backend/db.js:14` — hace `pool.getConnection()` al importar y solo loguea el resultado; **no
  hace exit**. La app arranca aunque la BD esté caída.
- No usa `dotenv`: las variables tienen que llegar por shell o por Compose.
- `backend/.gitignore:1` — solo ignora `node_modules/`. **Un `.env` en `backend/` quedaría
  versionado** si se crea ahí sin actualizar el ignore.
- `backend/server.js:48` — Express en `PORT` (default 3000), CORS abierto (`app.use(cors())` sin
  origen restringido).
- 7 routers montados bajo `/api/*`. Las consultas usan **placeholders `?`** de `mysql2.execute()`,
  sin interpolación de strings → immune al cambio de motor a nivel de SQL.
- `backend/routes/auth.js` — login por `(correo, documento, empresa_id)`. **La tabla `usuarios` no
  tiene columna de contraseña**: es autenticación por documento, no hay hash que migrar.
- `backend/package.json` — sin script de test, sin dependencia de test. Sin tests en el backend.

### Frontend

Angular 21 en `frontend/proyecto_angular`, corre en `4200`, consume la API por HTTP. No toca la
base de datos: el cambio es invisible para el frontend salvo por el host/puerto de la BD.

## Archivos relevantes

| Ruta | Rol en el cambio |
|---|---|
| `backend/db.js` | Único punto que resuelve host/puerto/credenciales. Ya parametrizado |
| `backend/package.json` | Sin `dotenv`; sin scripts de test |
| `backend/.gitignore` | No ignora `.env` — hay que corregirlo |
| `C:\xampp\mysql\data\` | Data dir de MariaDB, fuera del repo. Fuente única de la verdad actual |
| `sdd/sdd.config.md` | Declara stack "PostgreSQL", pero el código usa MySQL/MariaDB — inconsistencia a corregir |

## Ambigüedades para el Gate A

1. **Motor destino.** `mariadb:10.4` reproduce el servidor actual exactamente (riesgo mínimo de
   incompatibilidad de DDL). `mysql:8.4` es el estándar de mercado pero obliga a validar el DDL y
   el modo de autenticación. `mysql2` funciona con ambos.
2. **Puerto en el host.** `3306` está tomado por el `mysqld` de XAMPP. Se puede liberar parando
   XAMPP (el backend no cambia, sigue usando el default `3306`) o mapear el contenedor a otro
   puerto y apuntar el backend por `MYSQLPORT`.
3. **Alcance del Compose.** ¿Solo el motor de base de datos, o también el backend Node? El
   frontend de desarrollo conviene mantenerlo fuera (Angular con `ng serve`).
4. ~~**Herramienta de administración.**~~ **Resuelto:** el usuario administra la base de datos
   desde una **aplicación externa** (Workbench, DBeaver, DataGrip, TablePlus o similar). Verificado
   además que **phpMyAdmin no está accesible**: los archivos existen en `C:\xampp\phpmyadmin`, pero
   `httpd.conf` no define ningún `Alias` hacia ellos y `http://localhost/phpmyadmin/` da timeout.
   No hay UI web que reponer. Como estas herramientas se conectan por TCP a `127.0.0.1:3306` y el
   contenedor va a tomar ese mismo puerto, **siguen funcionando sin ningún cambio**.
5. **Versionado del esquema.** Hoy el esquema solo existe dentro del data dir de MariaDB. Se puede
   versionar el dump en el repo para que `docker compose up` reconstruya la BD desde cero y el
   proyecto sea reproducible para cualquiera.
6. **Credenciales.** Hoy `root` sin contraseña. ¿Se generan credenciales reales en un `.env` no
   versionado?
7. **Destino de XAMPP.** ¿Desinstalarlo del sistema o simplemente dejar de usarlo?
