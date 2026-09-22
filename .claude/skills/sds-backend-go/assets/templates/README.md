# Templates — sds-backend-go

| Template | Uso |
|----------|-----|
| `domain-entity.go.template` | Entidad (gorm tags) + DTO (json tags) + ToResponse() |
| `domain-ports.go.template` | Interfaces Repository y clientes externos |
| `domain-errors.go.template` | Error sentinela ErrNotFound |
| `application-errors.go.template` | Errores de negocio del módulo |
| `use-case.go.template` | Use case con Request/Response + Execute() |
| `repository.go.template` | Repositorio GORM implementando la interfaz del domain |
| `handler.go.template` | Handler HTTP: decode → validate → use case → response |
| `migration.sql.template` | Migración goose con Up y Down |

## Placeholders

| Placeholder | Ejemplo |
|-------------|---------|
| `{{MODULE}}` | `products` (snake_case) |
| `{{MODULE_PASCAL}}` | `Product` (PascalCase) |
| `{{USE_CASE}}` | `CreateProduct` (PascalCase) |
| `{{TABLE_NAME}}` | `products` (nombre de tabla) |
| `{{MIGRATION_NUM}}` | `00002` (5 dígitos) |
| `{{PACKAGE_PATH}}` | `taplog-backend` (módulo Go) |

## Workflow — nuevo módulo

1. `domain-entity.go.template` → `internal/{{MODULE}}/domain/entity.go`
2. `domain-ports.go.template` → `internal/{{MODULE}}/domain/ports.go`
3. `domain-errors.go.template` → `internal/{{MODULE}}/domain/errors.go`
4. `application-errors.go.template` → `internal/{{MODULE}}/application/errors.go`
5. `use-case.go.template` × N → `internal/{{MODULE}}/application/{{USE_CASE_SNAKE}}.go`
6. `repository.go.template` → `internal/{{MODULE}}/infrastructure/repository/gorm_repo.go`
7. `handler.go.template` → `internal/{{MODULE}}/infrastructure/http/handlers.go`
8. `migration.sql.template` → `internal/migrations/{{MIGRATION_NUM}}_create_{{TABLE_NAME}}_table.sql`
9. Registrar en `cmd/injector.go` y `cmd/routes.go`

## Checklist antes de PR

- [ ] Entity: solo gorm tags (sin json tags)
- [ ] DTO/Response: solo json tags (sin gorm tags)
- [ ] Constructor del repo retorna la interfaz, no el concreto
- [ ] Handler: cero imports de `gorm.io/gorm` o `repository/`
- [ ] Error codes: `apierrors.CodeX`, no strings inline
- [ ] Migración tiene Up y Down
- [ ] Use case registrado en `injector.go`
- [ ] Ruta registrada en `routes.go`
- [ ] `go build ./...` sin errores
- [ ] `go vet ./...` sin warnings
