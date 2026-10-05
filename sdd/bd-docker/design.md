# design — bd-docker

## Arquitectura

Un único servicio en la raíz del repo. El motor queda en un contenedor con volumen nombrado; el
backend Node y el frontend Angular siguen en el host y llegan al motor por TCP a `127.0.0.1:3306`.

```
┌─ Host ───────────────────────────────────────────────┐
│  frontend (ng serve :4200)                           │
│        │ HTTP                                         │
│        ▼                                              │
│  backend (node :3000) ──── TCP 3306 ───┐             │
│  cliente externo (Workbench, etc.) ────┤             │
└─────────────────────────────────────────┼─────────────┘
                                          │
┌─ Docker ────────────────────────────────┼─────────────┐
│  servicio "db" (mariadb:10.4) ◄─────────┘             │
│    volumen nombrado    → /var/lib/mysql               │
│    bind mount (solo lectura lógica) → ./db/init        │
│                              → /docker-entrypoint-initdb.d
└───────────────────────────────────────────────────────┘
```

## Estructura de archivos

```
docker-compose.yml       servicio db, volumen, healthcheck
.env                     credenciales reales  (NO versionado)
.env.example             plantilla versionada
db/
├── init/
│   ├── 01-schema.sql    DDL de las 7 tablas
│   └── 02-seed.sql      datos iniciales
└── backups/             ignorado por git, no versionado
docs/bd-docker.md        guía operativa
backend/.env             credenciales que lee el backend (NO versionado)
```

## Decisiones técnicas

### D1 — Volumen nombrado para el datadir, bind mount solo para los scripts de carga

**Elegido:** volumen nombrado de Docker para `/var/lib/mysql`. Bind mount de `./db/init` sobre
`/docker-entrypoint-initdb.d`.

**Descartado:** bind mount de un directorio de Windows sobre `/var/lib/mysql`. Es la primera
intención de cualquiera y la fuente más común de-corruption en MariaDB con Docker Desktop: el
datadir de InnoDB queda en un filesystem de 9p a través del filesystem de Windows, con suposiciones de
permisos y de locking que InnoDB no tolera. Los volúmenes nombrados viven en el filesystem Linux del
VM de Docker Desktop. Los contenedores ya existentes del equipo siguen este mismo patrón.

**Consecuencia a documentar:** `db/backups/` sí es un bind mount, porque se escribe desde el
contenedor y se lee desde el host. Ahí el rendimiento es irrelevante.

### D2 — Orden de carga por prefijo numérico

**Elegido:** `01-schema.sql` y `02-seed.sql`. El entrypoint de la imagen MariaDB ejecuta los archivos
de `/docker-entrypoint-initdb.d` en **orden alfabético**, y ese prefijo numérico es lo que garantiza
que el esquema se cree antes que los datos.

**Descartado:** un único archivo `.sql` con esquema y datos juntos. Mezcla dos responsabilidades y
hace más difícil regenerar solo una de las dos.

### D3 — Guardas de claves foráneas en los scripts de carga

**Elegido:** los scripts abren con `SET FOREIGN_KEY_CHECKS = 0;` y cierran con
`SET FOREIGN_KEY_CHECKS = 1;`, sobre `SET NAMES utf8mb4;`.

**Por qué es obligatorio, no opcional:** `mysqldump --no-data` emite las tablas en **orden
alfabético** — verificado en esta base de datos: `contratoarrendamiento`, `empresas`, `local`,
`mantenimiento`, `pago_variados`, `rol`, `usuarios`. Ese orden viola las dependencias: `local`
referencia a `empresas` y a `usuarios`, y ambas aparecen después. Un restore sin la guarda falla en
la primera tabla con FK. La guarda es la forma estándar y determinista de resolverlo, en lugar de
depender de reordenar el DDL a mano y que el orden se rompa en el próximo `mysqldump`.

### D4 — `INSERT` planos en el seed, no `INSERT IGNORE`

**Elegido:** `INSERT` estándar en el seed.

**Descartado:** `INSERT IGNORE`. Es tentador para "garantizar idempotencia", pero degrada un error de
clave foránea a un warning: si el seed queda mal ordenado o con una FK rota, la carga termina "con
éxito" y deja tablas vacías o a medias, y el fallo solo aparece después como datos faltantes. Como un
`INSERT` que falla es mucho más barato de diagnosticar que un seed que se carga a medias.

**La idempotencia no hace falta aquí:** el entrypoint solo ejecuta los scripts cuando el datadir está
vacío. El mecanismo de idempotencia es el volumen, no el SQL. Eso satisface RF2 y CA4 sin debitar la
integridad del seed.

### D5 — Healthcheck con `healthcheck.sh` y fallback a `mariadb-admin ping`

**Elegido:** `healthcheck.sh --connect --innodb_initialized`.

**Por qué no `mysqladmin ping` a secas:** `ping` responde "alive" también cuando el servidor rechaza
la conexión por credenciales, así que un motor con la contraseña mal configurada se reportaría sano.
`--innodb_initialized` además cubre el caso en que el proceso acepta sockets pero InnoDB todavía no
terminó de inicializar.

**Fallback:** si la imagen `mariadb:10.4` resultara no traer `healthcheck.sh`, se usa
`mariadb-admin ping -h 127.0.0.1 -u root -p"$MARIADB_ROOT_PASSWORD" --silent`. Se verifica en apply.

### D6 — Las credenciales llegan al backend con `node --env-file`, sin dependencias

**Elegido:** `backend/.env` con las variables `MYSQL*` que ya lee `backend/db.js:4`, cargado por el
flag nativo `--env-file` de Node (disponible desde v20.6; el proyecto corre en **v22.20.0**).

```json
"start": "node --env-file=.env server.js",
"dev":   "nodemon --watch . --ext js --exec \"node --env-file=.env server.js\""
```

`--exec` es lo que permite que `nodemon` también pase el flag; la alternativa sería `NODE_OPTIONS`, que
es más frágil.

**Descartado:** agregar `dotenv` al `package.json`. Es una dependencia para algo que el runtime ya
hace, y el no-objetivo lo excluye explícitamente.

**Descartado:** variables de entorno de la shell (`$env:MYSQLPASSWORD=...`). Funciona, pero es invisible
para quien lea después el `package.json` y se pierde al abrir otra terminal.

**Consecuencia:** las credenciales de Docker (`.env` de la raíz) y las del backend (`backend/.env`)
son archivos distintos con valores que deben coincidir. Se documenta el origen de cada uno y por qué
no se unifican: el Compose las lee en el momento de crear el contenedor, el backend las lee al
arrancar, y un `.env` compartido entre ambos expondría la contraseña del root de la base de datos en
el entorno del proceso de Node sin necesidad.

### D7 — `db.js` expone la verificación de conexión; `server.js` decide el ciclo de vida

**Elegido:** `backend/db.js` exporta el pool **y** una función `checkConnection()`. `backend/server.js`
la invoca antes de `app.listen()` y, si falla, escribe el motivo y termina el proceso con código de
salida distinto de cero.

**Por qué no hacer el `process.exit` dentro de `db.js`:** `db.js` se importa desde los 7 routers. Si
el módulo mata el proceso en tiempo de import, el comportamiento queda atado al orden de require y es
imposible de probar o reusar. Que el módulo reporte y que el entrypoint decida mantiene la
responsabilidad del ciclo de vida en `server.js`, que es el lugar que ya maneja el arranque del
servidor.

**Por qué importa (CA10):** el comportamiento actual de `backend/db.js:14-21` loguea el error y sigue.
El proceso queda vivo, el puerto `3000` acepta conexiones, y cada request falla por separado. El síntoma
se ve disperso y parece un bug de aplicación, cuando el problema es que la base de datos no arrancó.

### D8 — `restart: unless-stopped`, no `always`

**Elegido:** `restart: unless-stopped`.

**Descartado:** `always`. Con `always`, un `docker compose stop` manual no se respeta del todo en
algunas versiones y el servicio reaparece; `unless-stopped` distingue "se cayó, reinicialo" de "yo lo
paré, déjalo quieto", que es la semántica que se quiere en desarrollo.

## Lo que este diseño NO toca

- **El esquema.** Se traslada byte a byte desde el `mysqldump`, incluidos los `AUTO_INCREMENT`
  actuales (`empresas` en 5, `usuarios` en 9, etc.) para que los próximos IDs sigan igual que antes.
  Se conservan los nombres de columna existentes —`idLocal`, `idUsuario`, `fecha_creacion`— que no
  siguen la convención de `DEVELOPMENT_GUIDELINES.md` (snake_case, `created_at`/`updated_at` UTC).
  Corregirlos es una migración de esquema y está fuera de alcance; queda registrado como desviación
  conocida, no como error de este cambio.
- **Las consultas de los routers.** Usan placeholders `?` de `mysql2`, portables entre MySQL y
  MariaDB sin cambios.
- **La política de logging completa** de `DEVELOPMENT_GUIDELINES.md`. El ajuste en `db.js` es sobre
  el nivel y la visibilidad del error de arranque; migrar el backend a logs estructurados en JSON es
  un cambio aparte.

## Verificación de supuestos del diseño

Estos puntos se comprueban en `apply` antes de dar por buena la implementación:

| Supuesto | Cómo se verifica |
|---|---|
| La imagen `mariadb:10.4` trae `healthcheck.sh` | Inspeccionar la imagen descargada |
| `mysqldump --no-data` sale en orden alfabético y rompe las FKs | Confirmado: `local` antes que `usuarios` |
| El dump completo restaura sin pérdida | `mysqldump` de 28 KB generado correctamente |
| `mariadb:10.4` publica imagen `linux/amd64` | Confirmado: `docker manifest inspect` |
| Node soporta `--env-file` | Confirmado: v22.20.0 |
