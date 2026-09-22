# API Patterns

## pkg/response — funciones disponibles

```go
response.Success(w, http.StatusOK, data, "Message")
// → {"data": {...}, "message": "Message"}

response.Success(w, http.StatusCreated, data, "Created successfully")

response.Success(w, http.StatusOK, nil, "Logout successful")

response.Error(w, http.StatusBadRequest, apierrors.CodeInvalidBody, "Details...")
// → {"message": "Error", "error": "INVALID_BODY", "details": "Details..."}

response.Paged(w, http.StatusOK, items, nextCursor, hasMore, total, "Items retrieved")
// → {"data": {"items": [...], "next_cursor": "...", "has_more": true, "total": 42}, ...}
```

---

## pkg/apierrors — catálogo de códigos

```go
// Validación de input
CodeInvalidBody   = "INVALID_BODY"    // JSON inválido
CodeMissingFields = "MISSING_FIELDS"  // campos requeridos ausentes
CodeMissingToken  = "MISSING_TOKEN"   // Authorization header vacío

// Recursos
CodeUserExists   = "USER_EXISTS"
CodeUserNotFound = "USER_NOT_FOUND"
CodeUserInactive = "USER_INACTIVE"
CodeNotFound     = "NOT_FOUND"
CodeConflict     = "CONFLICT"

// Auth
CodeAuthError          = "AUTH_ERROR"
CodeInvalidCredentials = "INVALID_CREDENTIALS"
CodeInvalidToken       = "INVALID_TOKEN"
CodeUnauthorized       = "UNAUTHORIZED"
CodeForbidden          = "FORBIDDEN"

// Paginación
CodeInvalidCursor = "INVALID_CURSOR"

// Servidor
CodeInternalError = "INTERNAL_ERROR"
```

**Regla:** si el frontend necesita manejar ese caso de forma diferente → agregar constante. Si es solo logging → `CodeInternalError`.

---

## Handler — patrón completo

```go
type CreateProductRequestDTO struct {
    Name  string  `json:"name"`
    Price float64 `json:"price"`
}

func (h *ProductHandler) Create(w http.ResponseWriter, r *http.Request) {
    // 1. Decode
    var req CreateProductRequestDTO
    if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
        response.Error(w, http.StatusBadRequest, apierrors.CodeInvalidBody, err.Error())
        return
    }

    // 2. Validate format (no business rules aquí)
    if req.Name == "" {
        response.Error(w, http.StatusBadRequest, apierrors.CodeMissingFields, "name is required")
        return
    }

    // 3. Execute use case
    result, err := h.createUseCase.Execute(r.Context(), application.CreateProductRequest{
        Name:  req.Name,
        Price: req.Price,
    })
    if err != nil {
        // 4. Map errors
        switch {
        case errors.Is(err, application.ErrAlreadyExists):
            response.Error(w, http.StatusConflict, apierrors.CodeConflict, "Product already exists")
        default:
            slog.Error("create product: unexpected error",
                "request_id", logger.RequestIDFromContext(r.Context()),
                "error", err)
            response.Error(w, http.StatusInternalServerError, apierrors.CodeInternalError, "Internal error")
        }
        return
    }

    // 5. Respond
    response.Success(w, http.StatusCreated, result, "Product created successfully")
}
```

### Path values y query params

```go
// Path value (Go 1.22+)
id := r.PathValue("id")

// Query params
cursor    := r.URL.Query().Get("cursor")
limit, _  := strconv.Atoi(r.URL.Query().Get("limit"))
```

---

## Middleware — patrón

```go
func (am *AuthMiddleware) RequireAuth(next http.HandlerFunc) http.HandlerFunc {
    return func(w http.ResponseWriter, r *http.Request) {
        token := extractBearerToken(r)
        if token == "" {
            response.Error(w, http.StatusUnauthorized, apierrors.CodeMissingToken, "Authorization required")
            return
        }
        claims, err := am.keycloakClient.ValidateToken(r.Context(), token)
        if err != nil || !claims.IsValid {
            response.Error(w, http.StatusUnauthorized, apierrors.CodeInvalidToken, "Invalid token")
            return
        }
        ctx := context.WithValue(r.Context(), UserContextKey, UserContext{
            UserID: claims.Subject, Email: claims.Email, Roles: claims.Roles,
        })
        next(w, r.WithContext(ctx))
    }
}

func (am *AuthMiddleware) RequireRole(roles ...string) func(http.HandlerFunc) http.HandlerFunc {
    return func(next http.HandlerFunc) http.HandlerFunc {
        return am.RequireAuth(func(w http.ResponseWriter, r *http.Request) {
            userCtx, ok := GetUserFromContext(r.Context())
            if !ok {
                response.Error(w, http.StatusUnauthorized, apierrors.CodeUnauthorized, "No context")
                return
            }
            if !hasAnyRole(userCtx.Roles, roles) {
                response.Error(w, http.StatusForbidden, apierrors.CodeForbidden, "Insufficient permissions")
                return
            }
            next(w, r)
        })
    }
}
```

---

## HTTP Status — guía rápida

| Situación | Status | Code |
|-----------|--------|------|
| GET exitoso | 200 | — |
| POST exitoso (creó recurso) | 201 | — |
| Body JSON inválido | 400 | `INVALID_BODY` |
| Campo requerido faltante | 400 | `MISSING_FIELDS` |
| Token ausente | 401 | `MISSING_TOKEN` |
| Token inválido/expirado | 401 | `INVALID_TOKEN` |
| Credenciales inválidas | 401 | `INVALID_CREDENTIALS` |
| Sin permisos (autenticado) | 403 | `FORBIDDEN` |
| Recurso no encontrado | 404 | `NOT_FOUND` / `X_NOT_FOUND` |
| Conflicto (ya existe) | 409 | `CONFLICT` / `X_EXISTS` |
| Regla de negocio violada | 422 | código específico |
| Error inesperado | 500 | `INTERNAL_ERROR` |

---

## Logging — cuándo y cómo

```go
// ✅ Solo en errores INESPERADOS en handlers
slog.Error("list products: unexpected error",
    "request_id", logger.RequestIDFromContext(r.Context()),
    "error", err)

// ✅ En use cases, operaciones de negocio importantes
slog.Info("product created", "product_id", product.ID)

// ❌ NO loguear errores de validación (400, 422) — son flujo normal
// ❌ NO exponer stack traces en responses JSON
```
