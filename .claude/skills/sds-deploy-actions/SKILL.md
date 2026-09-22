---
name: sds-deploy-actions
description: Despliegue automatizado a producción via GitHub Actions — SSH a servidor, configuración de llaves, generación del workflow adaptado al stack del proyecto. Explora el proyecto, pregunta datos del servidor, y genera todo listo para pushear.
version: 1.0.0
---

# Activation Contract

**Soy:** experto en despliegue automatizado via GitHub Actions para proyectos salomondevsystems  
**Activo cuando:** alguien quiere configurar deploy automático a producción, crear un workflow de deploy, o configurar SSH para GitHub Actions  
**Excelente en:** GitHub Actions, SSH key management, deploy scripts, adaptación al stack del proyecto

---

# Fase 1 — Entrevista (SIEMPRE primero, NUNCA generar sin completarla)

Hacer estas preguntas **antes** de escribir cualquier archivo. Esperar respuestas completas.

## Pregunta 1 — Método de deploy

```
¿Cómo querés desplegar?

  [1] SSH en servidor normal — me conecto por SSH y ejecuto comandos
  [2] (próximamente) Docker en servidor remoto — SSH + docker compose pull/up
  [3] (próximamente) Otro

De momento solo la opción 1 está disponible.
```

→ Si elige 1, continuar con las preguntas de SSH.

## Pregunta 2 — Datos del servidor (solo si eligió SSH)

```
Necesito los datos del servidor de producción:

  - Host (IP o dominio): 
  - Puerto SSH (default 22): 
  - Usuario SSH: 
  - Path del proyecto en el servidor: 
```

→ Guardar como `{{DEPLOY_HOST}}`, `{{DEPLOY_PORT}}`, `{{DEPLOY_USER}}`, `{{DEPLOY_PATH}}`.

## Pregunta 3 — Estado de las llaves SSH

```
¿Ya tenés llaves SSH configuradas para este servidor en GitHub Actions?

  a) Sí — ya están los secrets DEPLOY_HOST, DEPLOY_USER, DEPLOY_SSH_KEY, DEPLOY_PORT en el repo
  b) No — necesito configurarlas desde cero
  c) No sé
```

→ Si `b` o `c`: ejecutar la Fase 2 (configuración de llaves).  
→ Si `a`: saltar a Fase 3 directamente.

## Pregunta 4 — Branch que dispara el deploy

```
¿Qué branch dispara el deploy a producción? (default: main)
```

→ Guardar como `{{DEPLOY_BRANCH}}`. Default: `main`.

---

# Fase 2 — Configuración de llaves SSH (solo si no existen)

## 2.1 Generar par de llaves

Instruir al usuario a correr esto **localmente**:

```bash
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/deploy_key -N ""
```

Esto genera:
- `~/.ssh/deploy_key` — clave privada (va a GitHub Secrets)
- `~/.ssh/deploy_key.pub` — clave pública (va al servidor)

## 2.2 Instalar clave pública en el servidor

Instruir al usuario:

```bash
# Copiar la clave pública al servidor
ssh-copy-id -i ~/.ssh/deploy_key.pub -p {{DEPLOY_PORT}} {{DEPLOY_USER}}@{{DEPLOY_HOST}}
```

O manualmente:
```bash
# Conectarse al servidor
ssh -p {{DEPLOY_PORT}} {{DEPLOY_USER}}@{{DEPLOY_HOST}}

# En el servidor:
mkdir -p ~/.ssh && chmod 700 ~/.ssh
echo "CONTENIDO_DE_deploy_key.pub" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

## 2.3 Verificar conexión

```bash
ssh -i ~/.ssh/deploy_key -p {{DEPLOY_PORT}} {{DEPLOY_USER}}@{{DEPLOY_HOST}} "echo 'Conexión OK'"
```

## 2.4 Configurar GitHub Secrets

Instruir al usuario a ir a **Settings → Secrets and variables → Actions** del repo en GitHub, y crear:

| Secret | Valor |
|--------|-------|
| `DEPLOY_HOST` | `{{DEPLOY_HOST}}` |
| `DEPLOY_USER` | `{{DEPLOY_USER}}` |
| `DEPLOY_SSH_KEY` | Contenido completo de `~/.ssh/deploy_key` (la privada) |
| `DEPLOY_PORT` | `{{DEPLOY_PORT}}` |

**Comando para copiar la clave privada al clipboard:**

```bash
# macOS
cat ~/.ssh/deploy_key | pbcopy

# Linux
cat ~/.ssh/deploy_key | xclip -selection clipboard
```

## 2.5 Confirmar

```
¿Ya configuraste los 4 secrets en GitHub? [S/n]
```

→ No avanzar a Fase 3 hasta que confirme.

---

# Fase 3 — Exploración del proyecto

Antes de generar el workflow, **explorar el proyecto** para entender:

1. **Stack** — ¿Go, Node.js, Next.js, Astro, Docker, otro?
2. **¿Existe `deployment/deploy.sh`?** — Si sí, el workflow simplemente lo ejecuta.
3. **¿Existe `docker-compose` o `deployment/prod.yml`?** — Si sí, el deploy puede ser `docker compose pull && docker compose up -d`.
4. **¿Existe `Makefile` con target de deploy?** — Si sí, usarlo.
5. **¿Hay variables de entorno que inyectar?** — Buscar `.env.example` para saber qué secrets adicionales se necesitan.
6. **¿El proyecto usa `go build`?** — Si sí, build en el servidor o build en CI + scp.
7. **¿Es un frontend estático?** — Si sí, build en CI + rsync.

### Archivos a buscar (en orden de prioridad):

| Archivo | Indica |
|---------|--------|
| `deployment/deploy.sh` | Script de deploy listo — ejecutar con sudo si corresponde |
| `deployment/prod.yml` | Docker compose para producción |
| `docker-compose.yml` o `docker-compose.prod.yml` | Docker compose (ubicación alternativa) |
| `Makefile` | Buscar target `deploy`, `prod-up`, `prod-deploy` |
| `go.mod` | Proyecto Go — build en servidor o CI |
| `package.json` | Proyecto Node/Next/Astro — build en CI o servidor |
| `.env.example` | Variables que pueden necesitar inyección |
| `Dockerfile` | App containerizada |

### Decisión del script de deploy

Con base en lo encontrado, armar el bloque `script:` del workflow:

| Encontré | Script generado |
|----------|----------------|
| `deployment/deploy.sh` | `cd {{DEPLOY_PATH}} && git fetch && git reset --hard origin/{{DEPLOY_BRANCH}} && sudo {{DEPLOY_PATH}}/deployment/deploy.sh` |
| `deployment/prod.yml` (sin deploy.sh) | `cd {{DEPLOY_PATH}} && git fetch && git reset --hard origin/{{DEPLOY_BRANCH}} && docker compose -f deployment/prod.yml pull && docker compose -f deployment/prod.yml up -d` |
| `docker-compose.yml` (sin deploy.sh) | `cd {{DEPLOY_PATH}} && git fetch && git reset --hard origin/{{DEPLOY_BRANCH}} && docker compose pull && docker compose up -d` |
| Solo Go (sin Docker) | `cd {{DEPLOY_PATH}} && git fetch && git reset --hard origin/{{DEPLOY_BRANCH}} && go build -o app ./cmd/... && sudo systemctl restart {{PROJECT}}` |
| Solo Node.js/Next.js | `cd {{DEPLOY_PATH}} && git fetch && git reset --hard origin/{{DEPLOY_BRANCH}} && npm ci && npm run build && pm2 restart {{PROJECT}}` |
| Astro (SSG) | `cd {{DEPLOY_PATH}} && git fetch && git reset --hard origin/{{DEPLOY_BRANCH}} && npm ci && npm run build` (el web server sirve `dist/`) |
| Nada reconocido | Preguntar al usuario qué comandos ejecutar en el servidor |

### Inyección de secrets como variables de entorno

Si el proyecto tiene `.env.example` con variables que deben venir de GitHub Secrets:

1. Listar las variables encontradas en `.env.example`
2. Preguntar cuáles deben inyectarse desde GitHub Secrets
3. Generar los `sed` o `echo >>` correspondientes en el script

Formato de inyección:
```bash
# Inyectar variables desde secrets
grep -q "^{{VAR_NAME}}=" .env 2>/dev/null && \
  sed -i 's|^{{VAR_NAME}}=.*|{{VAR_NAME}}=${{ secrets.{{VAR_NAME}} }}|' .env || \
  echo '{{VAR_NAME}}=${{ secrets.{{VAR_NAME}} }}' >> .env
```

---

# Fase 4 — Generación del workflow

## Template base

`.github/workflows/deploy.yml`:

```yaml
name: Deploy to production

on:
  push:
    branches:
      - {{DEPLOY_BRANCH}}

jobs:
  deploy:
    name: SSH deploy
    runs-on: ubuntu-latest
    timeout-minutes: 15
    steps:
      - name: Deploy via SSH
        uses: appleboy/ssh-action@v1.2.0
        with:
          host: ${{ secrets.DEPLOY_HOST }}
          username: ${{ secrets.DEPLOY_USER }}
          key: ${{ secrets.DEPLOY_SSH_KEY }}
          port: ${{ secrets.DEPLOY_PORT }}
          script: |
            set -euo pipefail
            cd {{DEPLOY_PATH}}
            git reset --hard HEAD
            git fetch origin {{DEPLOY_BRANCH}}
            git reset --hard origin/{{DEPLOY_BRANCH}}
            {{DEPLOY_COMMANDS}}
```

## Variantes del bloque `{{DEPLOY_COMMANDS}}`

### Con `deploy.sh`
```yaml
            sudo {{DEPLOY_PATH}}/deployment/deploy.sh
```

### Con Docker Compose
```yaml
            docker compose -f deployment/prod.yml pull
            docker compose -f deployment/prod.yml up -d --remove-orphans
```

### Con Go build + systemd
```yaml
            go build -o {{PROJECT}} ./cmd/...
            sudo systemctl restart {{PROJECT}}
```

### Con Node.js/Next.js + PM2
```yaml
            npm ci --production
            npm run build
            pm2 restart {{PROJECT}} --update-env
```

### Con Astro (SSG)
```yaml
            npm ci
            npm run build
            # dist/ ya está siendo servido por nginx/caddy
```

## Inyección de variables (se agrega ANTES de los deploy commands)

Si hay variables a inyectar:
```yaml
            # Inyectar variables de entorno desde secrets
            grep -q "^VARIABLE=" .env 2>/dev/null && sed -i 's|^VARIABLE=.*|VARIABLE=${{ secrets.VARIABLE }}|' .env || echo 'VARIABLE=${{ secrets.VARIABLE }}' >> .env
```

---

# Fase 5 — Validación y entrega

## Checklist antes de entregar

- [ ] El archivo `.github/workflows/deploy.yml` está creado
- [ ] El branch trigger es correcto
- [ ] Los secrets necesarios están listados
- [ ] El script de deploy es coherente con lo que encontré en el proyecto
- [ ] Si hay inyección de variables, cada una tiene su secret correspondiente

## Resumen al usuario

Mostrar:

```
✅ Workflow de deploy creado: .github/workflows/deploy.yml

📋 Secrets requeridos en GitHub (Settings → Secrets → Actions):
  - DEPLOY_HOST: {{DEPLOY_HOST}}
  - DEPLOY_USER: {{DEPLOY_USER}}
  - DEPLOY_SSH_KEY: (clave privada ed25519)
  - DEPLOY_PORT: {{DEPLOY_PORT}}
  {{EXTRA_SECRETS}}

🔄 Trigger: push a `{{DEPLOY_BRANCH}}`

📝 El workflow hace:
  1. Conecta al servidor via SSH
  2. Actualiza el código (git fetch + reset)
  {{DEPLOY_SUMMARY}}
```

---

# Output Contract

**Entrego:**
- ✅ `.github/workflows/deploy.yml` — workflow de deploy adaptado al proyecto
- ✅ Instrucciones claras de configuración de llaves SSH (si es primera vez)
- ✅ Lista completa de secrets a configurar en GitHub
- ✅ Resumen de qué hace el deploy

**Garantizo:**
- `set -euo pipefail` en todos los scripts (fail fast)
- `timeout-minutes: 15` para evitar workflows colgados
- Uso de `appleboy/ssh-action@v1.2.0` (versión pinneada)
- Inyección segura de variables (grep + sed pattern, no sobreescritura ciega)
- Script adaptado al stack real del proyecto (no genérico)
- Nunca hardcodear secrets en el workflow — siempre `${{ secrets.X }}`

---

# Reglas de seguridad

- **Nunca** mostrar ni loguear el contenido de claves privadas
- **Nunca** hardcodear hosts, usuarios, o passwords en el workflow
- **Siempre** usar `secrets.*` para datos sensibles
- **Siempre** pinnear la versión de `appleboy/ssh-action` (no usar `@master` ni `@latest`)
- Si el usuario quiere usar password en vez de llave SSH: **rechazar** y explicar por qué las llaves son obligatorias (seguridad, no se expone password en secrets, revocable individualmente)
