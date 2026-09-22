---
name: sds-backend-go
description: Desarrollo backend Go — Clean Architecture + Hexagonal, use cases, GORM, goose, stdlib net/http, goconfig
version: 1.0.0
---

# Activation Contract

**Soy:** experto en backend Go para proyectos salomondevsystems  
**Activo cuando:** trabajo en proyectos backend Go con estructura `internal/<módulo>/` o `cmd/`  
**Excelente en:** Clean Architecture, Hexagonal, Use Cases, GORM+PostgreSQL, goose, DI manual

---

# Hard Rules

## 1. Stack permitido (ABSOLUTO)

✅ **USAR:**
- `net/http` stdlib — router, handlers, middleware (NO gin, chi, echo, fiber)
- `gorm.io/gorm` — ORM (con driver postgres)
- `github.com/salomondevsystems/goconfig` — configuración YAML
- `log/slog` stdlib — logging estructurado
- `github.com/pressly/goose/v3` — migraciones de base de datos
- `github.com/google/uuid` — UUIDs
- Cualquier cliente AWS SDK cuando se necesite S3

❌ **PROHIBIDO:**
- Frameworks HTTP (gin, chi, echo, fiber, gorilla/mux)
- ORMs alternativos (sqlx, pgx directo en repos)
- `db.AutoMigrate()` — siempre usar goose
- Strings inline como códigos de error — siempre `pkg/apierrors`

## 2. Separación Entity / DTO (CRÍTICO)

```go
// ✅ CORRECTO: Entity — solo gorm tags
type Product struct {
    ID        uuid.UUID      `gorm:"type:uuid;primaryKey"`
    Name      string         `gorm:"not null"`
    CreatedAt time.Time
    DeletedAt gorm.DeletedAt `gorm:"index"`
}

// ✅ CORRECTO: Response DTO — solo json tags
type ProductResponse struct {
    ID        string    `json:"id"`
    Name      string    `json:"name"`
    CreatedAt time.Time `json:"created_at"`
}

// ❌ INCORRECTO: tags mezclados en el mismo struct
type Product struct {
    ID   uuid.UUID `json:"id" gorm:"type:uuid;primaryKey"`
    Name string    `json:"name" gorm:"not null"`
}
```

## 3. Use Cases — patrón obligatorio

Cada operación es su propio struct con `Execute()`. El handler NUNCA accede al repo directamente.

```go
// ✅ CORRECTO: use case propio para cada operación
type GetProductUseCase struct {
    repo domain.ProductRepository
}
func (uc *GetProductUseCase) Execute(ctx context.Context, req GetProductRequest) (*domain.ProductResponse, error)

// ❌ INCORRECTO: repo en el handler
type ProductHandler struct {
    repo domain.ProductRepository // NUNCA
}
```

## 4. Error codes — constantes tipadas

```go
// ✅ CORRECTO
response.Error(w, http.StatusNotFound, apierrors.CodeNotFound, "Product not found")

// ❌ INCORRECTO
response.Error(w, http.StatusNotFound, "NOT_FOUND", "Product not found")
```

## 5. Migraciones con goose

```go
// ✅ CORRECTO: goose en internal/migrations/
migrations.Run(sqlDB)

// ❌ INCORRECTO
db.AutoMigrate(&Product{})
```

## 6. JSON naming: snake_case

```go
// ✅ CORRECTO
type ProductResponse struct {
    CreatedAt time.Time `json:"created_at"`
    FirstName string    `json:"first_name"`
}
```

## 7. Logging con slog

```go
// ✅ CORRECTO
slog.Error("create product: unexpected error",
    "request_id", logger.RequestIDFromContext(ctx),
    "error", err)
```

> **Política de logs:** el formato uniforme (campos base, niveles, no datos sensibles, no
> loguear lo que es métrica) vive en `DEVELOPMENT_GUIDELINES.md` → "Logging & Observability".
> Acá se muestra el ejemplo local; no dupliques la política.

---

# Arquitectura

```
cmd/
  main.go           ← boot: config → injector → servidor
  injector.go       ← DI manual: repo → use case → handler
  providers.go      ← interfaz ProvidersFactory
  providers_prod.go ← implementación: GormDB, S3Client
  routes.go         ← RegisterRoutes, rutas públicas/privadas

internal/
  <módulo>/
    domain/
      entity.go     ← struct con solo gorm tags + BeforeCreate + ToResponse()
      ports.go      ← interfaces (Repository, ExternalClient) + DTOs de respuesta
      errors.go     ← var ErrNotFound = errors.New(...)
    application/
      errors.go     ← var ErrX = errors.New(...) — errores del use case
      <operacion>.go ← struct UseCase + Request/Response + Execute()
    infrastructure/
      http/
        handlers.go   ← decode → validate → use case → response
        middleware.go ← auth, roles, context
      repository/
        gorm_repo.go  ← implementa domain.Repository con GORM
      <cliente>/
        client.go     ← implementa domain.ExternalClient

  config/
    config.go       ← structs Config, App, Storage, Postgres, etc.
    config.yaml     ← valores por entorno

  migrations/
    migrator.go        ← goose.Up con embed FS
    00001_*.sql        ← migraciones SQL (Up + Down)

pkg/
  response/
    response.go     ← Success, Error, Paged
  apierrors/
    codes.go        ← constantes de error codes
  logger/
    logger.go       ← Init(level), RequestIDFromContext
    middleware.go   ← RequestLogger
```

## Flujo de request

```
HTTP → Handler → UseCase → Repository → DB
                        ↘ ExternalClient → API externa
```

## Flujo de DI (injector.go)

```
providers.GormDB() → masterDB
migrations.Run(sqlDB)
NewGorm<Módulo>Repository(masterDB) → repo
New<Operacion>UseCase(repo, ...) → useCase
New<Módulo>Handler(...useCases...) → handler
mux.HandleFunc("METHOD /path", handler.Action)
```

---

# Decision Gates

## ¿Nuevo módulo o nueva operación en módulo existente?

**Nuevo módulo** (feature completa nueva):
- Crear `internal/<módulo>/domain/`, `application/`, `infrastructure/`
- Agregar migration SQL en `internal/migrations/`
- Registrar en `injector.go` y `routes.go`

**Nueva operación** (en módulo existente):
- Agregar `internal/<módulo>/application/<operacion>.go`
- Agregar método en handler existente
- Registrar ruta en `routes.go`

## ¿Ruta pública o privada?

```go
// Pública (no requiere auth)
func (i *injector) registerPublicRoutes(mux *http.ServeMux) {
    mux.HandleFunc("POST /auth/login", i.handlers.xHandler.Login)
}

// Privada (requiere token)
func (i *injector) registerPrivateRoutes(mux *http.ServeMux) {
    mux.HandleFunc("GET /resource/{id}", i.middleware.auth.RequireAuth(handler.GetByID))
}

// Solo admin
mux.HandleFunc("DELETE /resource/{id}", i.middleware.auth.RequireRole("admin")(handler.Delete))
```

## ¿Cuándo agregar un nuevo error code?

Si el frontend necesita distinguir ese caso → agregar a `pkg/apierrors/codes.go`.  
Si es solo logging interno → solo `slog.Error`, no exponer código.

---

# Execution Steps

## 1. Nuevo módulo completo

### a) Domain

```go
// internal/<modulo>/domain/entity.go
type {{ENTITY}} struct {
    ID        uuid.UUID      `gorm:"type:uuid;primaryKey"`
    // campos con solo gorm tags...
    CreatedAt time.Time
    UpdatedAt time.Time
    DeletedAt gorm.DeletedAt `gorm:"index"`
}

func (e *{{ENTITY}}) BeforeCreate(tx *gorm.DB) error {
    if e.ID == uuid.Nil { e.ID = uuid.New() }
    return nil
}

// DTO — solo json tags
type {{ENTITY}}Response struct {
    ID        string    `json:"id"`
    CreatedAt time.Time `json:"created_at"`
}

func (e *{{ENTITY}}) ToResponse() {{ENTITY}}Response {
    return {{ENTITY}}Response{ID: e.ID.String(), CreatedAt: e.CreatedAt}
}
```

```go
// internal/<modulo>/domain/ports.go
type {{ENTITY}}Repository interface {
    Create(ctx context.Context, entity *{{ENTITY}}) error
    GetByID(ctx context.Context, id string) (*{{ENTITY}}, error)
    Update(ctx context.Context, entity *{{ENTITY}}) error
    Delete(ctx context.Context, id string) error
}
```

```go
// internal/<modulo>/domain/errors.go
var ErrNotFound = errors.New("record not found")
```

### b) Application (un archivo por use case)

```go
// internal/<modulo>/application/create_{{modulo}}.go
type Create{{ENTITY}}UseCase struct {
    repo domain.{{ENTITY}}Repository
}

func NewCreate{{ENTITY}}UseCase(repo domain.{{ENTITY}}Repository) *Create{{ENTITY}}UseCase {
    return &Create{{ENTITY}}UseCase{repo: repo}
}

type Create{{ENTITY}}Request struct { /* campos */ }

func (uc *Create{{ENTITY}}UseCase) Execute(ctx context.Context, req Create{{ENTITY}}Request) (*domain.{{ENTITY}}Response, error) {
    entity := &domain.{{ENTITY}}{/* mapear desde req */}
    if err := uc.repo.Create(ctx, entity); err != nil {
        return nil, err
    }
    resp := entity.ToResponse()
    return &resp, nil
}
```

```go
// internal/<modulo>/application/errors.go
var ErrAlreadyExists = errors.New("record already exists")
```

### c) Repository

```go
// internal/<modulo>/infrastructure/repository/gorm_repo.go
type Gorm{{ENTITY}}Repository struct{ db *gorm.DB }

func NewGorm{{ENTITY}}Repository(db *gorm.DB) domain.{{ENTITY}}Repository {
    return &Gorm{{ENTITY}}Repository{db: db}
}

func (r *Gorm{{ENTITY}}Repository) Create(ctx context.Context, entity *domain.{{ENTITY}}) error {
    return r.db.WithContext(ctx).Create(entity).Error
}

func (r *Gorm{{ENTITY}}Repository) GetByID(ctx context.Context, id string) (*domain.{{ENTITY}}, error) {
    var entity domain.{{ENTITY}}
    err := r.db.WithContext(ctx).First(&entity, "id = ?", id).Error
    if errors.Is(err, gorm.ErrRecordNotFound) {
        return nil, domain.ErrNotFound
    }
    return &entity, err
}
```

### d) Handler

```go
// internal/<modulo>/infrastructure/http/handlers.go
type {{ENTITY}}Handler struct {
    createUseCase *application.Create{{ENTITY}}UseCase
    getUseCase    *application.Get{{ENTITY}}UseCase
}

func New{{ENTITY}}Handler(
    createUseCase *application.Create{{ENTITY}}UseCase,
    getUseCase *application.Get{{ENTITY}}UseCase,
) *{{ENTITY}}Handler {
    return &{{ENTITY}}Handler{createUseCase: createUseCase, getUseCase: getUseCase}
}

type Create{{ENTITY}}RequestDTO struct{ /* campos con json tags */ }

func (h *{{ENTITY}}Handler) Create(w http.ResponseWriter, r *http.Request) {
    var req Create{{ENTITY}}RequestDTO
    if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
        response.Error(w, http.StatusBadRequest, apierrors.CodeInvalidBody, err.Error())
        return
    }

    result, err := h.createUseCase.Execute(r.Context(), application.Create{{ENTITY}}Request{/* mapear */})
    if err != nil {
        switch {
        case errors.Is(err, application.ErrAlreadyExists):
            response.Error(w, http.StatusConflict, apierrors.CodeConflict, "Already exists")
        default:
            slog.Error("create {{modulo}}: unexpected error",
                "request_id", logger.RequestIDFromContext(r.Context()), "error", err)
            response.Error(w, http.StatusInternalServerError, apierrors.CodeInternalError, "Internal error")
        }
        return
    }
    response.Success(w, http.StatusCreated, result, "Created successfully")
}
```

### e) Migración

```sql
-- internal/migrations/000XX_create_{{modulo}}_table.sql
-- +goose Up
CREATE TABLE IF NOT EXISTS {{tabla}} (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_{{tabla}}_deleted_at ON {{tabla}} (deleted_at);

-- +goose Down
DROP TABLE IF EXISTS {{tabla}};
```

### f) Registrar en injector.go y routes.go

```go
// injector.go
{{modulo}}Repo   := repository.NewGorm{{ENTITY}}Repository(masterDB)
create{{ENTITY}}UC := application.NewCreate{{ENTITY}}UseCase({{modulo}}Repo)
get{{ENTITY}}UC    := application.NewGet{{ENTITY}}UseCase({{modulo}}Repo)
{{modulo}}Handler  := {{moduloHttp}}.New{{ENTITY}}Handler(create{{ENTITY}}UC, get{{ENTITY}}UC)

// routes.go
mux.HandleFunc("POST /{{modulo}}", i.handlers.{{modulo}}Handler.Create)
mux.HandleFunc("GET /{{modulo}}/{id}", i.middleware.auth.RequireAuth(i.handlers.{{modulo}}Handler.GetByID))
```

---

## 2. Nueva operación en módulo existente

1. Crear `internal/<módulo>/application/<operacion>.go`
2. Agregar error en `application/errors.go` si aplica
3. Agregar método en el handler existente
4. Registrar use case en `injector.go` y pasarlo al constructor del handler
5. Registrar ruta en `routes.go`

---

# Output Contract

**Entrego:**
- ✅ Entity con solo gorm tags + DTO con solo json tags
- ✅ Ports (interfaces) en domain
- ✅ Un use case por operación, struct + Execute()
- ✅ Repository retorna la interfaz del domain, no el concreto
- ✅ Handler sin acceso directo a repos
- ✅ Error codes de `pkg/apierrors`, nunca strings inline
- ✅ Migration SQL con goose Up/Down
- ✅ DI registrada en injector.go + ruta en routes.go

**Garantizo:**
- Sin AutoMigrate — siempre goose
- Sin frameworks HTTP — solo net/http stdlib
- Sin tags mezclados en entities
- Sin repos en handlers
- Logging con slog solo en errores inesperados
- JSON snake_case en todos los DTOs

---

# References

- `references/architecture.md` — detalle de capas, responsabilidades y reglas de separación
- `references/gorm-patterns.md` — patrones GORM: queries, soft delete, paginación cursor, goose
- `references/api-patterns.md` — response shapes, error handling, middleware patterns
- `references/testing-guide.md` — mocks de interfaces, table-driven tests, patrones de test
- `assets/templates/README.md` — catálogo de templates y cómo usarlos
- `DEVELOPMENT_GUIDELINES.md` (raíz) — el documento que define cómo se construye en este
  proyecto: estructura de módulos, wiring, y la política de logs (Logging & Observability)
