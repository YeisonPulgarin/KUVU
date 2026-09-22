# Architecture — Clean Architecture + Hexagonal

## Filosofía

**Clean Architecture** (Robert C. Martin) + **Hexagonal** (Ports & Adapters) con nomenclatura de **Use Cases** por operación.

| Principio | Aplicación concreta |
|-----------|---------------------|
| Dependency Inversion | Domain define interfaces; infrastructure las implementa |
| Single Responsibility | Un use case por operación de negocio |
| Separation of Concerns | Entity ≠ DTO. Handler ≠ Business logic. Repo ≠ Validation |
| Explicit DI | Todo se inyecta en `cmd/injector.go`, sin globals ni contenedores mágicos |

---

## Estructura canónica de módulo

```
internal/<módulo>/
  domain/
    entity.go      ← struct con gorm tags + BeforeCreate + ToResponse()
    ports.go       ← interfaces Repository + clientes externos + tipos de respuesta
    errors.go      ← var ErrNotFound = errors.New(...)
  application/
    errors.go      ← errores de negocio del módulo
    create_X.go    ← un archivo por use case
    get_X.go
    list_X.go
    delete_X.go
  infrastructure/
    http/
      handlers.go  ← uno o más handlers del módulo
      middleware.go ← si el módulo tiene middleware propio
    repository/
      gorm_repo.go ← implementación GORM de la interfaz del domain
    <cliente>/
      client.go    ← implementación de interfaz externa (Keycloak, S3, etc.)
```

---

## Reglas de separación entre capas

### Domain

| SÍ puede | NO puede |
|----------|----------|
| Definir entidades con gorm tags | Importar net/http |
| Definir interfaces Repository | Saber qué DB se usa |
| Definir DTOs de respuesta con json tags | Depender de application o infrastructure |
| Definir errores sentinela | Tener lógica de negocio compleja |
| Tener métodos de mapeo (`ToResponse()`) | |

### Application

| SÍ puede | NO puede |
|----------|----------|
| Orquestar repos e interfaces del domain | Importar GORM directamente |
| Implementar lógica de negocio | Parsear HTTP requests |
| Definir Request/Response types | Responder HTTP |
| Llamar a clientes externos vía interfaces | Acceder a repos sin interfaces |

### Infrastructure/http

| SÍ puede | NO puede |
|----------|----------|
| Parsear y validar input HTTP | Contener lógica de negocio |
| Llamar al use case | Llamar al repo directamente |
| Mapear errores → HTTP status | Construir queries SQL |
| Responder con `response.Success/Error` | |

### Infrastructure/repository

| SÍ puede | NO puede |
|----------|----------|
| Construir y ejecutar queries GORM | Validar reglas de negocio |
| Mapear `gorm.ErrRecordNotFound` → `domain.ErrNotFound` | Responder HTTP |
| Usar `db.WithContext(ctx)` siempre | Importar application layer |

---

## cmd/ — Composition Root

### main.go — patrón

```go
func main() {
    conf := getConfig()
    logger.Init(logLevel(conf.App.Environment))
    injector := initInjector(conf)
    addr := fmt.Sprintf(":%d", conf.App.Port)
    router := injector.RegisterRoutes()
    slog.Info("server starting", "addr", addr)
    if err := http.ListenAndServe(addr, router); err != nil {
        slog.Error("server failed", "error", err)
        os.Exit(1)
    }
}

func getConfig() *config.Config {
    goConf := goconfig.New(goconfig.WithConfigDir("internal/config"))
    var appConfig config.Config
    if err := goConf.Parse("config", &appConfig); err != nil {
        panic(err)
    }
    return &appConfig
}
```

### injector.go — orden canónico

```go
func initInjector(conf *config.Config) *injector {
    // 1. Providers
    providers := NewProvidersProduction(conf)
    masterDB := providers.GormDB()["master"]

    // 2. Migraciones — siempre antes de usar la DB
    sqlDB, _ := masterDB.DB()
    if err := migrations.Run(sqlDB); err != nil {
        panic(err)
    }

    // 3. Repositories (retornan interfaz, no concreto)
    userRepo := repository.NewGormUserRepository(masterDB)

    // 4. Clientes externos
    kcClient := keycloak.NewClient(conf.Keycloak)

    // 5. Use Cases (uno por operación)
    registerUC := application.NewRegisterUserUseCase(userRepo, kcClient)
    loginUC    := application.NewLoginUseCase(userRepo, kcClient)

    // 6. Handlers
    userHandler := userHttp.NewUserHandler(registerUC, loginUC)

    // 7. Middleware
    authMiddleware := userHttp.NewAuthMiddleware(kcClient)

    return &injector{handlers: ..., middleware: ...}
}
```

### ProvidersFactory — intercambiabilidad

```go
// providers.go
type ProvidersFactory interface {
    GormDB() map[string]*gorm.DB
    S3Client() *s3.Client
}
// providers_prod.go — producción real
// providers_test.go — stubs para tests de integración
```

---

## Migraciones — goose con embed

```
internal/migrations/
  migrator.go         ← goose.Up con embed FS
  00001_*.sql
  00002_*.sql
```

```go
//go:embed *.sql
var embedMigrations embed.FS

func Run(db *sql.DB) error {
    goose.SetBaseFS(embedMigrations)
    goose.SetDialect("postgres")
    return goose.Up(db, ".")
}
```

**Regla:** cada migración es reversible. El `Down` siempre deshace exactamente el `Up`.

---

## HTTP routing — net/http stdlib (Go 1.22+)

```go
func (i *injector) RegisterRoutes() http.Handler {
    mux := http.NewServeMux()
    v1 := http.NewServeMux()
    i.registerPublicRoutes(v1)
    i.registerPrivateRoutes(v1)
    mux.Handle("/api/v1/", http.StripPrefix("/api/v1", v1))
    return logger.RequestLogger(mux)
}

// Formato: "METHOD /path/{param}"
mux.HandleFunc("GET /products/{id}", handler.GetByID)
mux.HandleFunc("POST /products", handler.Create)
```

**Path values:** `r.PathValue("id")` — sin dependencias externas.
