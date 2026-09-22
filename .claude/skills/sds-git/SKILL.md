---
name: sds-git
description: Flujo Git/GitHub para proyectos salomondevsystems — estrategia de branching, Conventional Commits, PR template, merge strategy, branch protection y GitHub Actions por stack (Go, Next.js, Astro, Docker). Integrado con el flujo SDD via extensión git en sdd.config.md.
version: 1.0.0
---

# sds-git — Flujo Git/GitHub

> Dos modos de uso:
> **Setup** — invocado directamente para configurar el proyecto (crea workflows, PR template, protección de ramas).
> **Referencia** — leído por fases SDD (branch, verify, archive) para seguir convenciones activas.

Cuando se invoca en modo setup, leer el artifact `sdd-init` si existe para evitar preguntar por el stack ya detectado.

---

## 1. Estrategia de branching

**Default recomendado para equipos pequeños:** trunk-based con feature branches de vida corta.

| Estrategia | Cuándo | Base |
|------------|--------|------|
| **Trunk-based + feature branches** | Equipo 1-5 personas, deploy frecuente | `main` |
| **Gitflow** | Equipo grande, releases planificadas, QA separado | `develop` → `main` |
| **Trunk puro** | Solo developer, CI muy robusto | `main` directo |

**Regla para trunk-based + feature branches (el default):**
- `main` siempre deployable
- Feature branches de vida máxima 3 días — si dura más, algo está mal en la decomposición
- Sin `develop` — las feature branches salen de `main` y se mergean a `main`
- Hotfixes: rama `hotfix/{descripción}` desde `main`, PR urgente, se mergea a `main`

---

## 2. Conventional Commits

Formato: `{tipo}({scope}): {descripción imperativa corta}`

```
feat(auth): agregar login con Google OAuth
fix(api): corregir paginación en /products cuando page=0
chore(deps): actualizar next a 15.3
docs(readme): agregar instrucciones de setup local
refactor(db): extraer query builder a función separada
test(products): agregar tests de integración para createProduct
ci(github): agregar workflow de release con goreleaser
```

**Tipos:**

| Tipo | Cuándo |
|------|--------|
| `feat` | Nueva funcionalidad visible al usuario o al API consumer |
| `fix` | Corrección de bug |
| `chore` | Mantenimiento: deps, tooling, config — sin cambio de comportamiento |
| `docs` | Solo documentación |
| `refactor` | Refactor sin cambio de comportamiento ni bug fix |
| `test` | Agregar o corregir tests |
| `ci` | Cambios en GitHub Actions o pipelines |
| `perf` | Mejora de performance sin cambio de API |
| `style` | Formato, whitespace, semicolons — sin cambio de lógica |

**Scope:** nombre del módulo, feature, o capa afectada. Opcional pero recomendado.
Ejemplos: `auth`, `products`, `db`, `ui`, `api`, `deploy`, `deps`.

**Breaking changes:** agregar `!` después del tipo y un footer `BREAKING CHANGE:`:
```
feat(api)!: cambiar formato de respuesta de /users

BREAKING CHANGE: el campo `name` ahora es `full_name` en todos los endpoints de usuario.
```

**Descripción:**
- Imperativa, presente: "agregar", "corregir", "extraer" — no "agregado", "se agrega", "added"
- Sin punto final
- Max 72 caracteres
- Sin "WIP", "fix things", "cambios varios" — cada commit hace UNA cosa

---

## 3. Naming de branches

Formato: `{tipo}/{scope-o-descripcion-corta}`

El `{tipo}` sigue los tipos de Conventional Commits. La descripción en kebab-case, sin artículos.

```
feat/google-oauth
fix/products-pagination
chore/update-next-15
hotfix/login-crash-ios
refactor/query-builder
```

**Integración con SDD:** cuando la extensión `branch` está activa en `sdd.config.md`, el nombre de la rama se deriva del `{change-name}` del artifact:
```
feat/{change-name}        # para features
fix/{change-name}         # para bugfixes
chore/{change-name}       # para mantenimiento
```

El tipo se determina leyendo el `propose` artifact: si el campo "naturaleza" es nueva funcionalidad → `feat`, corrección → `fix`, etc.

---

## 4. PR Template

Crear en `.github/pull_request_template.md`:

```markdown
## Resumen
<!-- Qué cambia y por qué. 2-3 bullets. -->

- 

## Tipo de cambio
- [ ] `feat` — nueva funcionalidad
- [ ] `fix` — corrección de bug
- [ ] `chore` — mantenimiento / dependencias
- [ ] `docs` — documentación
- [ ] `refactor` — sin cambio de comportamiento
- [ ] `ci` — pipelines / GitHub Actions

## Test plan
<!-- Cómo verificar que funciona. Comandos concretos. -->

```bash
# ejemplo:
go test ./...
npm run test
```

## Checklist
- [ ] Tests pasan localmente
- [ ] Sin logs de debug (`console.log`, `fmt.Println`, `log.Printf` temporales)
- [ ] Variables de entorno nuevas en `.env.example`
- [ ] Breaking changes documentados en el cuerpo del PR

## Screenshots (si hay cambios de UI)

| Antes | Después |
|-------|---------|
| | |

## Artifact SDD (si aplica)
Change: `sdd/{change-name}/`
```

---

## 5. Merge strategy

**Default: Squash and merge** para feature branches → `main`.

| Situación | Estrategia | Por qué |
|-----------|-----------|---------|
| Feature branch → main | **Squash merge** | Historial limpio en main; los commits de trabajo internos no importan |
| Hotfix → main | **Merge commit** | Preservar el contexto del fix como evento separado |
| Release tag | Tag en main post-merge | Sin rama de release separada en trunk-based |
| Rebase merge | Evitar | Reescribe SHAs, confunde `git bisect` en equipos |

**Configurar en GitHub** (Settings → General → Pull Requests):
- ✅ Allow squash merging — título del PR como mensaje de commit
- ❌ Allow merge commits — desactivar para mantener historial limpio
- ❌ Allow rebase merging — desactivar
- ✅ Automatically delete head branches — activar

---

## 6. Branch protection — `main`

Configurar en GitHub: Settings → Branches → Add branch ruleset.

**Reglas mínimas para `main`:**
```
✅ Require a pull request before merging
   └─ Required approvals: 1 (o 0 si es solo developer, pero al menos el PR)
✅ Require status checks to pass before merging
   └─ Agregar los jobs de CI como required (ej: "test", "build")
✅ Require branches to be up to date before merging
✅ Do not allow bypassing the above settings
❌ Allow force pushes — desactivar siempre
❌ Allow deletions — desactivar
```

**Para solo developer:** las dos primeras son suficientes. El PR existe para que el CI corra antes del merge, no para review humano.

---

## 7. GitHub Actions

Crear los workflows en `.github/workflows/` según el stack del proyecto.

### 7.A Go — CI

`.github/workflows/go-ci.yml`:
```yaml
name: Go CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    name: Test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-go@v5
        with:
          go-version-file: go.mod
          cache: true

      - name: Test
        run: go test ./... -race -count=1

      - name: Vet
        run: go vet ./...

  lint:
    name: Lint
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-go@v5
        with:
          go-version-file: go.mod
          cache: true

      - uses: golangci/golangci-lint-action@v6
        with:
          version: latest
```

### 7.B Go — Release con goreleaser

`.github/workflows/go-release.yml`:
```yaml
name: Release

on:
  push:
    tags:
      - 'v*'

permissions:
  contents: write

jobs:
  goreleaser:
    name: Release
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0  # goreleaser necesita todo el historial para el changelog

      - uses: actions/setup-go@v5
        with:
          go-version-file: go.mod
          cache: true

      - uses: goreleaser/goreleaser-action@v6
        with:
          version: latest
          args: release --clean
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

**Para publicar un release:**
```bash
git tag v0.x.y
git push origin v0.x.y
```

### 7.C Next.js — CI

`.github/workflows/nextjs-ci.yml`:
```yaml
name: Next.js CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  ci:
    name: CI
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - name: Install
        run: npm ci

      - name: Lint
        run: npm run lint

      - name: Type check
        run: npx tsc --noEmit

      - name: Test
        run: npm run test --if-present

      - name: Build
        run: npm run build
        env:
          # Variables de entorno necesarias para el build
          # Agregar las que el proyecto requiera
          NEXT_PUBLIC_API_URL: ${{ vars.NEXT_PUBLIC_API_URL }}
```

### 7.D Astro — CI

`.github/workflows/astro-ci.yml`:
```yaml
name: Astro CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    name: Build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - name: Install
        run: npm ci

      - name: Type check
        run: npx tsc --noEmit

      - name: Build
        run: npm run build
```

### 7.E Docker — Build y Push a GHCR

`.github/workflows/docker.yml`:
```yaml
name: Docker

on:
  push:
    branches: [main]
    tags: ['v*']

permissions:
  contents: read
  packages: write

jobs:
  build-push:
    name: Build & Push
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: docker/setup-buildx-action@v3

      - uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - uses: docker/metadata-action@v5
        id: meta
        with:
          images: ghcr.io/${{ github.repository }}
          tags: |
            type=ref,event=branch
            type=semver,pattern={{version}}
            type=semver,pattern={{major}}.{{minor}}
            type=sha,prefix=sha-,format=short

      - uses: docker/build-push-action@v6
        with:
          context: .
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
```

### 7.F Qué workflows crear según el stack

| Stack | Workflows |
|-------|-----------|
| Go solo | `go-ci.yml` + `go-release.yml` (si tiene releases) |
| Next.js solo | `nextjs-ci.yml` |
| Astro solo | `astro-ci.yml` |
| Go + Next.js | `go-ci.yml` + `nextjs-ci.yml` + `go-release.yml` |
| Cualquier stack + Docker en prod | `docker.yml` adicional |

---

## 8. Semantic versioning

Formato: `vMAJOR.MINOR.PATCH`

| Versión | Cuándo |
|---------|--------|
| `PATCH` (v1.0.1) | Fix de bug sin breaking change |
| `MINOR` (v1.1.0) | Nueva funcionalidad sin breaking change |
| `MAJOR` (v2.0.0) | Breaking change — API incompatible con versión anterior |

**Flujo para crear un release:**
```bash
# 1. Asegurarse de estar en main con CI verde
git checkout main && git pull

# 2. Crear y pushear el tag
git tag v0.3.0 -m "feat: agregar login con Google OAuth"
git push origin v0.3.0

# 3. El workflow go-release.yml o docker.yml lo publica automáticamente
```

Para proyectos pre-1.0 (`v0.x.y`): MINOR para features, PATCH para fixes. No hay MAJOR hasta que el API sea estable.

---

## 9. Setup — qué crear al configurar un proyecto nuevo

Al invocar en modo setup:

1. **Leer** el artifact `sdd-init` (si existe) para conocer stack y test command
2. **Crear** `.github/pull_request_template.md` — siempre
3. **Crear** `.github/workflows/` según la tabla 7.F
4. **Confirmar** estrategia de merge (default: squash) y documentarla en `sdd/sdd.config.md` bajo la extensión `git`
5. **Listar** las branch protection rules a configurar manualmente en GitHub (no es automatizable via Actions)
6. **Reportar** qué se creó y qué falta configurar manualmente

---

## 10. Integración con flujo SDD

Esta skill es la fuente de verdad para el flujo git del proyecto. Las fases SDD la referencian cuando la extensión `git` está activa en `sdd.config.md`:

| Fase SDD | Qué lee de sds-git |
|----------|-------------------|
| `sdd-branch` | Naming de rama: `{tipo}/{change-name}` |
| `sdd-verify` | Instrucción de verificar CI antes de reportar verde |
| `sdd-archive` | PR template y merge strategy para el cierre del change |

**El tipo de rama en `sdd-branch`** se infiere del artifact `propose`:
- Nueva funcionalidad → `feat/`
- Corrección de comportamiento existente → `fix/`
- Refactor / mantenimiento / deuda técnica → `chore/`
- Cambio de infraestructura → `ci/` o `chore/`
