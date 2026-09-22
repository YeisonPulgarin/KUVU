# Docker Hardening — Checklist

Referencia para la skill `sdd-secure`. Checklist de seguridad para Dockerfile
y docker-compose.yml, con ejemplos de configuración correcta.

---

## 1. Dockerfile — Base Image

### Checks

| Check | Buscar | Severidad si falla |
|-------|--------|-------------------|
| Unpinned tag | `FROM node:latest`, `FROM golang:latest` | Medium |
| No digest | Sin `@sha256:...` para reproducibilidad | Info |
| Heavy base | `FROM ubuntu`, `FROM debian` cuando alpine es viable | Low |
| Deprecated image | Images con EOL conocido | Medium |

### Configuración correcta

```dockerfile
# ✅ Tag fijo + variante minimal
FROM golang:1.24-alpine AS builder
FROM node:22-alpine AS frontend

# ✅ Con digest para máxima reproducibilidad (CI/CD)
FROM golang:1.24-alpine@sha256:abc123... AS builder
```

### Anti-patterns

```dockerfile
# ❌ Tag latest (cambia sin aviso)
FROM node:latest

# ❌ Sin tag (equivale a latest)
FROM ubuntu

# ❌ Full image cuando no se necesita
FROM golang:1.24  # incluye git, gcc, etc. innecesarios en runtime
```

---

## 2. Dockerfile — User

### Checks

| Check | Buscar | Severidad si falla |
|-------|--------|-------------------|
| No USER directive | Dockerfile sin `USER` (corre como root) | High |
| USER root explícito | `USER root` sin volver a un user no-root | High |
| Writable filesystem | Sin `--chown` en COPY, root owns everything | Medium |

### Configuración correcta

```dockerfile
# ✅ Crear usuario no-root y usarlo
FROM golang:1.24-alpine AS builder
WORKDIR /app
COPY . .
RUN go build -o /app/server ./cmd/server

FROM alpine:3.20
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
WORKDIR /app
COPY --from=builder --chown=appuser:appgroup /app/server .
USER appuser
EXPOSE 8000
CMD ["./server"]
```

### Anti-patterns

```dockerfile
# ❌ Sin USER — corre como root
FROM node:22-alpine
WORKDIR /app
COPY . .
RUN npm install
CMD ["node", "server.js"]
```

---

## 3. Dockerfile — Secrets

### Checks

| Check | Buscar | Severidad si falla |
|-------|--------|-------------------|
| Secret in ARG | `ARG PASSWORD`, `ARG API_KEY`, `ARG TOKEN` | Critical |
| Secret in ENV | `ENV SECRET_KEY=...` con valor hardcodeado | Critical |
| .env copied | `COPY .env .` o `COPY . .` sin `.dockerignore` | High |
| Private keys | `COPY *.pem`, `COPY *.key` | Critical |
| Git credentials | `COPY .git-credentials`, `COPY .netrc` | Critical |

### Configuración correcta

```dockerfile
# ✅ Secrets via runtime env vars (no build time)
FROM alpine:3.20
# No ARG ni ENV con secrets
# Secrets se pasan en docker run -e o via docker-compose.yml env_file

# ✅ Si se necesita secret en build (ej: para npm private registry)
# Usar BuildKit secrets mount
RUN --mount=type=secret,id=npm_token \
    NPM_TOKEN=$(cat /run/secrets/npm_token) npm install
```

### .dockerignore obligatorio

```
.env
.env.*
*.pem
*.key
.git/
node_modules/
.git-credentials
.netrc
```

---

## 4. Dockerfile — Multi-stage Build

### Checks

| Check | Buscar | Severidad si falla |
|-------|--------|-------------------|
| Single stage | Dockerfile sin `AS builder` con dev deps en imagen final | Medium |
| Source in final | Código fuente copiado a imagen de runtime | Medium |
| Dev deps in final | `node_modules` completo (con devDependencies) en runtime | Medium |
| Build tools in final | gcc, git, make presentes en imagen de producción | Low |

### Configuración correcta — Go

```dockerfile
# ✅ Multi-stage: solo binario en imagen final
FROM golang:1.24-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 go build -ldflags="-s -w" -o /app/server ./cmd/server

FROM alpine:3.20
RUN apk --no-cache add ca-certificates
RUN addgroup -S app && adduser -S app -G app
WORKDIR /app
COPY --from=builder --chown=app:app /app/server .
USER app
EXPOSE 8000
CMD ["./server"]
```

### Configuración correcta — Node.js

```dockerfile
# ✅ Multi-stage: solo production deps en imagen final
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-alpine
WORKDIR /app
RUN addgroup -S app && adduser -S app -G app
COPY --from=builder --chown=app:app /app/package*.json ./
RUN npm ci --omit=dev
COPY --from=builder --chown=app:app /app/.next ./.next
COPY --from=builder --chown=app:app /app/public ./public
USER app
EXPOSE 3000
CMD ["npm", "start"]
```

---

## 5. Dockerfile — Ports

### Checks

| Check | Buscar | Severidad si falla |
|-------|--------|-------------------|
| Unnecessary EXPOSE | Puertos que no se usan en producción | Low |
| Privileged ports | `EXPOSE 80`, `EXPOSE 443` requiere root | Low |
| Debug ports | `EXPOSE 9229` (Node.js debugger), `EXPOSE 6060` (Go pprof) | High |

### Configuración correcta

```dockerfile
# ✅ Solo el puerto necesario, no-privileged
EXPOSE 8000

# ❌ Puerto de debug en producción
EXPOSE 9229
```

---

## 6. docker-compose.yml — Security

### Checks

| Check | Buscar | Severidad si falla |
|-------|--------|-------------------|
| Privileged mode | `privileged: true` | Critical |
| Docker socket | `/var/run/docker.sock` mounted | Critical |
| Host network | `network_mode: host` sin necesidad | High |
| Host PID/IPC | `pid: host`, `ipc: host` | High |
| Capabilities | `cap_add: ALL` o `SYS_ADMIN` sin justificación | High |
| Restart policy | Sin `restart:` (no se reinicia tras crash) | Low |
| Memory limit | Sin `mem_limit` o `deploy.resources.limits` | Medium |
| Read-only fs | Sin `read_only: true` cuando es viable | Info |
| Env secrets | Secrets directamente en `environment:` en compose | Medium |
| No healthcheck | Sin `healthcheck:` | Low |

### Configuración correcta

```yaml
services:
  api:
    build: .
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL  # valor viene de .env, no hardcodeado aquí
    env_file:
      - .env  # .env en .gitignore
    restart: unless-stopped
    read_only: true
    tmpfs:
      - /tmp
    security_opt:
      - no-new-privileges:true
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: '1.0'
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:8000/health"]
      interval: 30s
      timeout: 5s
      retries: 3
    networks:
      - internal

  db:
    image: postgres:16-alpine
    volumes:
      - pgdata:/var/lib/postgresql/data
    environment:
      - POSTGRES_PASSWORD  # valor de .env
    restart: unless-stopped
    networks:
      - internal
    # DB no expone puertos al host — solo accesible via red interna

networks:
  internal:
    driver: bridge

volumes:
  pgdata:
```

### Anti-patterns

```yaml
# ❌ Privileged mode (acceso total al host)
services:
  app:
    privileged: true

# ❌ Docker socket montado (container escape trivial)
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock

# ❌ Secrets hardcodeados en compose
    environment:
      - DATABASE_URL=postgres://user:password123@db:5432/mydb
      - API_KEY=sk-1234567890abcdef

# ❌ Host network sin necesidad
    network_mode: host
```

---

## 7. Docker — Network Isolation

### Checks

| Check | Buscar | Severidad si falla |
|-------|--------|-------------------|
| All in default network | Sin networks customizadas (todo se ve entre sí) | Medium |
| DB exposed to host | Database con `ports:` mapeados al host | Medium |
| Internal services exposed | Services auxiliares con puertos al host sin necesidad | Medium |

### Configuración correcta

```yaml
# ✅ Redes separadas por responsabilidad
networks:
  frontend:   # nginx ↔ app
    driver: bridge
  backend:    # app ↔ db
    driver: bridge
    internal: true  # sin acceso a internet

services:
  nginx:
    networks: [frontend]
    ports: ["443:443"]

  app:
    networks: [frontend, backend]
    # sin ports: — solo accesible via nginx

  db:
    networks: [backend]
    # sin ports: — solo accesible via app
```

---

## 8. Docker — Health Checks

### Checks

| Check | Buscar | Severidad si falla |
|-------|--------|-------------------|
| No HEALTHCHECK in Dockerfile | Sin `HEALTHCHECK` instruction | Low |
| No healthcheck in compose | Sin `healthcheck:` para servicios críticos | Low |
| Healthcheck too frequent | `interval` < 10s (overhead innecesario) | Info |

### Configuración correcta

```dockerfile
# ✅ En Dockerfile
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8000/health || exit 1
```

---

## 9. .env y Secrets Management

### Checks

| Check | Buscar | Severidad si falla |
|-------|--------|-------------------|
| .env not in .gitignore | `.env` commiteado o no ignorado | High |
| .env.example with real values | `.env.example` con secrets reales | High |
| Docker env_file not in .gitignore | `env_file` apunta a archivo no ignorado | High |
| Secrets in docker history | `ARG`/`ENV` con secrets visibles en `docker history` | Critical |

### Buena práctica

```
# .gitignore
.env
.env.*
!.env.example

# .env.example (solo placeholders, NUNCA valores reales)
DATABASE_URL=postgres://user:password@localhost:5432/dbname
JWT_SECRET=change-me-in-production
API_KEY=your-api-key-here
```
