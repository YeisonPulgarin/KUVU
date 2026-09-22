---
name: sds-local-deployment
description: Scaffolding interactivo de infraestructura local y producción — Postgres, Redis, MongoDB, MinIO, Evolution API. Genera docker-compose, .env, scripts y Makefile según lo que el proyecto necesite.
version: 1.0.0
---

# Activation Contract

**Soy:** experto en infraestructura de desarrollo para proyectos salomondevsystems  
**Activo cuando:** alguien quiere preparar el entorno local, crear `deployment/`, configurar dependencias de infraestructura, o dockerizar para producción  
**Excelente en:** docker compose, variables de entorno, healthchecks, MinIO bootstrap, Evolution API, diferenciación local vs prod

---

# Fase 1 — Entrevista (SIEMPRE primero, NUNCA generar sin completarla)

Hacer estas preguntas **antes** de escribir cualquier archivo. Esperar respuestas completas.

## Pregunta 1 — Nombre del proyecto
```
¿Cuál es el nombre del proyecto? (ej: taplog, myapp, crm)
```
→ Usar como `{{PROJECT}}` en container names, DB name, bucket name, prefijos.

## Pregunta 2 — Servicios requeridos
```
¿Qué servicios de infraestructura necesita el proyecto?
(seleccionar todos los que apliquen)

  [ ] PostgreSQL       — base de datos relacional principal
  [ ] Redis            — caché, colas, sesiones
  [ ] MongoDB          — documentos, eventos
  [ ] MinIO            — almacenamiento S3-compatible
  [ ] Evolution API    — WhatsApp (requiere Postgres + Redis + Mongo)
```
→ Evolution API fuerza la inclusión de Postgres, Redis y Mongo automáticamente.  
→ MinIO siempre incluye el sidecar `minio_client` para bootstrap.

## Pregunta 3 — Tipo de aplicación (para prod.yml)
```
¿Qué tipo de aplicación tiene el proyecto?
  a) Backend Go
  b) Frontend Node.js / Next.js
  c) Ambos (monorepo)
  d) Otro (describir)
```
→ Determina qué bloque de app se incluye en `prod.yml` y qué Makefile targets se generan.

## Pregunta 4 — Solo si MinIO fue seleccionado
```
¿Nombre del bucket de la aplicación? (ej: taplog-assets)
```
→ Usar como `MINIO_APP_SPACE` y en `app-policy.json`.

## Pregunta 5 — Solo si Evolution API fue seleccionada
```
Evolution API necesita su propia base de datos "evolution" en Postgres.
¿Crear automáticamente vía postgres-init? [S/n]
```
→ Si sí: incluir `deployment/postgres-init/01-create-evolution.sql`.

---

# Fase 2 — Reglas de ensamblaje

## Servicios y sus dependencias

| Servicio seleccionado | Incluye automáticamente |
|-----------------------|------------------------|
| `evolution_api` | postgres, redis, mongo (si no estaban) |
| `minio` | minio_client (siempre) |

## Archivos a generar según selección

| Archivo | Condición |
|---------|-----------|
| `deployment/local.yml` | Siempre |
| `deployment/prod.yml` | Siempre |
| `deployment/.env.example` | Siempre |
| `deployment/.env` | Siempre (valores dev, en .gitignore) |
| `deployment/README.md` | Siempre |
| `Makefile` (raíz) | Siempre |
| `deployment/policies/app-policy.json` | MinIO |
| `deployment/scripts/bootstrap-minio.sh` | MinIO |
| `deployment/postgres-init/01-create-evolution.sql` | Evolution API |

## Diferencia local vs prod

**`local.yml`** — Solo infraestructura. La app corre en el host con `go build` o `npm run dev`.
- Ports expuestos a `localhost`
- Sin servicio de app
- Sin Dockerfile

**`prod.yml`** — Infraestructura + app containerizada.
- App se construye con Dockerfile
- Servicios se comunican por nombre Docker (ej: `postgres:5432`, `redis:6379`)
- `restart: unless-stopped` en todos los servicios
- Healthchecks obligatorios con `depends_on: condition: service_healthy`

## Naming de containers

Usar siempre el prefijo del proyecto: `{{PROJECT}}_postgres`, `{{PROJECT}}_redis`, etc.  
Esto evita colisiones cuando se corren múltiples proyectos localmente.

---

# Fase 3 — Bloques de servicios (fuente canónica)

Ensamblar `local.yml` y `prod.yml` concatenando solo los bloques necesarios.

## PostgreSQL

```yaml
  postgres:
    image: postgres:16-alpine
    container_name: {{PROJECT}}_postgres
    environment:
      POSTGRES_USER: ${POSTGRES_USER:-postgres}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-postgres}
      POSTGRES_DB: ${POSTGRES_DB:-{{PROJECT}}}
    ports:
      - "${POSTGRES_PORT:-5432}:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      # Solo si Evolution API: descomentar línea siguiente
      # - ./postgres-init:/docker-entrypoint-initdb.d
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER:-postgres} -d ${POSTGRES_DB:-{{PROJECT}}}"]
      interval: 10s
      timeout: 5s
      retries: 5
```

Si Evolution API está incluida: añadir el mount de `postgres-init` descomentado.

## Redis

```yaml
  redis:
    image: redis:7-alpine
    container_name: {{PROJECT}}_redis
    ports:
      - "${REDIS_PORT:-6379}:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
```

## MongoDB

```yaml
  mongo:
    image: mongo:7
    container_name: {{PROJECT}}_mongo
    environment:
      MONGO_INITDB_ROOT_USERNAME: ${MONGO_USER:-mongo}
      MONGO_INITDB_ROOT_PASSWORD: ${MONGO_PASSWORD:-mongo}
    ports:
      - "${MONGO_PORT:-27017}:27017"
    volumes:
      - mongo_data:/data/db
    healthcheck:
      test: ["CMD-SHELL", "mongosh --eval 'db.adminCommand(\"ping\")'"]
      interval: 10s
      timeout: 5s
      retries: 5
```

## MinIO + minio_client

```yaml
  minio:
    image: minio/minio:latest
    container_name: {{PROJECT}}_minio
    command: server /data --console-address ":${MINIO_CONSOLE_PORT:-9001}"
    environment:
      MINIO_ROOT_USER: ${MINIO_ROOT_USER:-minioadmin}
      MINIO_ROOT_PASSWORD: ${MINIO_ROOT_PASSWORD:-minioadmin}
    ports:
      - "${MINIO_PORT:-9000}:9000"
      - "${MINIO_CONSOLE_PORT:-9001}:9001"
    volumes:
      - minio_data:/data
    healthcheck:
      test: ["CMD", "mc", "ready", "local"]
      interval: 10s
      timeout: 5s
      retries: 5

  minio_client:
    image: minio/mc:latest
    container_name: {{PROJECT}}_minio_client
    volumes:
      - ./policies:/policies
      - ./scripts/bootstrap-minio.sh:/bootstrap-minio.sh:ro
    depends_on:
      minio:
        condition: service_healthy
    entrypoint: ["/bin/sh", "-c"]
    command: "sleep 5 && /bin/sh /bootstrap-minio.sh && tail -f /dev/null"
    environment:
      MINIO_ENDPOINT: ${MINIO_ENDPOINT:-minio:9000}
      MINIO_ROOT_USER: ${MINIO_ROOT_USER:-minioadmin}
      MINIO_ROOT_PASSWORD: ${MINIO_ROOT_PASSWORD:-minioadmin}
      MINIO_APP_SPACE: ${MINIO_APP_SPACE:-{{PROJECT}}-assets}
      MINIO_APP_USER: ${MINIO_APP_USER:-minioapp}
      MINIO_APP_PASSWORD: ${MINIO_APP_PASSWORD:-minioapp}
```

## Evolution API

```yaml
  evolution_api:
    image: evoapicloud/evolution-api:latest
    container_name: {{PROJECT}}_evolution_api
    restart: always
    depends_on:
      postgres:
        condition: service_healthy
      mongo:
        condition: service_healthy
      redis:
        condition: service_healthy
    ports:
      - "${EVOLUTION_API_PORT:-8080}:8080"
    env_file:
      - .env
    volumes:
      - evolution_data:/evolution/instances
```

## App — Go backend (solo prod.yml)

```yaml
  app:
    build:
      context: ..
      dockerfile: Dockerfile
    container_name: {{PROJECT}}_app
    restart: unless-stopped
    depends_on:
      postgres:
        condition: service_healthy
      # agregar redis/mongo si el app los usa
    env_file:
      - .env
    ports:
      - "${APP_PORT:-8000}:8000"
```

## App — Node.js / Next.js (solo prod.yml)

```yaml
  app:
    build:
      context: ..
      dockerfile: Dockerfile
    container_name: {{PROJECT}}_app
    restart: unless-stopped
    env_file:
      - .env
    ports:
      - "${APP_PORT:-3000}:3000"
```

## Sección volumes

Incluir solo los volumes de los servicios seleccionados:

```yaml
volumes:
  postgres_data:   # si postgres
  redis_data:      # si redis
  mongo_data:      # si mongo
  minio_data:      # si minio
  evolution_data:  # si evolution_api
```

---

# Fase 4 — Variables de entorno

## Regla de dos archivos

- **`.env.example`** — siempre commiteado, sin secretos reales, placeholders descriptivos
- **`.env`** — en `.gitignore`, valores listos para dev local (contraseñas simples tipo `postgres`)

Agregar `deployment/.env` al `.gitignore` del proyecto si no está.

## Bloques de variables por servicio

### PostgreSQL
```env
# PostgreSQL
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB={{PROJECT}}
POSTGRES_PORT=5432
POSTGRES_SSLMODE=disable
```

### PostgreSQL + Go/goose
```env
# Goose migrations
GOOSE_DRIVER=postgres
GOOSE_MIGRATION_DIR=./internal/migrations
GOOSE_DBSTRING=postgres://postgres:postgres@localhost:5432/{{PROJECT}}?sslmode=disable
```

### Redis
```env
# Redis
REDIS_PORT=6379
```

### MongoDB
```env
# MongoDB
MONGO_USER=mongo
MONGO_PASSWORD=mongo
MONGO_PORT=27017
```

### MinIO
```env
# MinIO
MINIO_ROOT_USER=minioadmin
MINIO_ROOT_PASSWORD=minioadmin
MINIO_PORT=9000
MINIO_CONSOLE_PORT=9001
MINIO_URL=http://localhost:9000
MINIO_ENDPOINT=minio:9000
MINIO_APP_USER=minioapp
MINIO_APP_PASSWORD=minioapp
MINIO_APP_SPACE={{PROJECT}}-assets
MINIO_APP_ACCESS_KEY=minioappaccesskey
MINIO_APP_SECRET_KEY=minioappsecretkey
```

### Evolution API (bloque completo — no recortar)
```env
# Evolution API
SERVER_URL=http://localhost:8080
AUTHENTICATION_TYPE=apikey
AUTHENTICATION_API_KEY=change-this-to-a-secure-random-key
AUTHENTICATION_EXPOSE_IN_FETCH_INSTANCES=true
LANGUAGE=en
CONFIG_SESSION_PHONE_CLIENT=Evolution_API
CONFIG_SESSION_PHONE_NAME=Chrome
TELEMETRY=false
TELEMETRY_URL=
DATABASE_ENABLED=true
DATABASE_PROVIDER=postgresql
DATABASE_CONNECTION_URI=postgres://postgres:postgres@postgres:5432/evolution
DATABASE_SAVE_DATA_INSTANCE=true
DATABASE_SAVE_DATA_NEW_MESSAGE=true
DATABASE_SAVE_MESSAGE_UPDATE=true
DATABASE_SAVE_DATA_CONTACTS=true
DATABASE_SAVE_DATA_CHATS=true
DATABASE_SAVE_DATA_LABELS=true
DATABASE_SAVE_DATA_HISTORIC=true
CACHE_REDIS_ENABLED=true
CACHE_REDIS_URI=redis://redis:6379
CACHE_REDIS_PREFIX_KEY=evolution
CACHE_REDIS_SAVE_INSTANCES=true
TYPEBOT_ENABLED=false
TYPEBOT_API_VERSION=latest
```

**Nota Evolution API:** `DATABASE_CONNECTION_URI` usa el hostname `postgres` (nombre del container Docker), no `localhost`. Esto es correcto porque Evolution API corre dentro del compose.

---

# Fase 5 — Archivos de soporte

## MinIO bootstrap (`deployment/scripts/bootstrap-minio.sh`)

Ver `assets/scripts/bootstrap-minio.sh` — copiar tal cual, reemplazar `{{PROJECT}}`.

## MinIO policy (`deployment/policies/app-policy.json`)

Ver `assets/policies/app-policy.json` — copiar tal cual.

## Evolution DB init (`deployment/postgres-init/01-create-evolution.sql`)

Ver `assets/postgres-init/01-create-evolution.sql` — copiar tal cual.

## Makefile (raíz del proyecto)

```makefile
.PHONY: infra-up infra-down infra-logs dev

# Levanta la infraestructura local (DB, cache, storage)
infra-up:
	docker compose -f deployment/local.yml up -d

# Detiene la infraestructura local
infra-down:
	docker compose -f deployment/local.yml down

# Logs de la infraestructura
infra-logs:
	docker compose -f deployment/local.yml logs -f

# Dev local: infra + app nativa
# Ajustar según el tipo de app del proyecto
dev: infra-up
	# Go:   go run ./cmd/main.go
	# Node: npm run dev
	@echo "Infraestructura lista. Correr la app manualmente."
```

Para backend Go, reemplazar el comentario con `go run ./cmd/main.go` (o el path real).  
Para Node.js, con `npm run dev` (o `pnpm dev`, `bun dev`).

---

# Output Contract

**Entrego:**
- ✅ `deployment/local.yml` — solo infra, app corre nativa
- ✅ `deployment/prod.yml` — infra + app containerizada
- ✅ `deployment/.env.example` — commiteado, sin secretos
- ✅ `deployment/.env` — valores dev listos para usar
- ✅ `deployment/README.md` — puertos, comandos, orden de startup
- ✅ `Makefile` — targets `infra-up`, `infra-down`, `infra-logs`, `dev`
- ✅ `deployment/policies/app-policy.json` (si MinIO)
- ✅ `deployment/scripts/bootstrap-minio.sh` (si MinIO)
- ✅ `deployment/postgres-init/01-create-evolution.sql` (si Evolution API)

**Garantizo:**
- Healthchecks en todos los servicios
- `depends_on: condition: service_healthy` en servicios con dependencias
- Container names con prefijo del proyecto (sin colisiones)
- `.env` agregado al `.gitignore`
- Evolution API con variables completas (no recortadas)
- MinIO con bootstrap automático vía `minio_client`
- local.yml y prod.yml diferenciados correctamente

---

# References

- `assets/scripts/bootstrap-minio.sh` — script validado de bootstrap MinIO
- `assets/policies/app-policy.json` — política MinIO con permisos app
- `assets/postgres-init/01-create-evolution.sql` — creación de DB evolution
