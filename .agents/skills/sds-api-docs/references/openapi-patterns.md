# OpenAPI Patterns — Mapeo Go → OpenAPI 3.1

Referencia para la skill `sds-api-docs`. Patterns detallados de cómo mapear código Go
a specs OpenAPI 3.1 válidos.

---

## 1. Tipos Go → JSON Schema

### Tipos primitivos

```yaml
# string
type: string

# int, int32
type: integer
format: int32

# int64
type: integer
format: int64

# float32
type: number
format: float

# float64
type: number
format: double

# bool
type: boolean
```

### Tipos comunes del ecosistema

```yaml
# uuid.UUID
type: string
format: uuid
example: "550e8400-e29b-41d4-a716-446655440000"

# time.Time
type: string
format: date-time
example: "2024-01-15T10:30:00Z"

# []string
type: array
items:
  type: string

# []T (struct)
type: array
items:
  $ref: '#/components/schemas/T'

# map[string]interface{}
type: object
additionalProperties: true

# map[string]string
type: object
additionalProperties:
  type: string
```

### Pointer = opcional

```go
// Go
type CreateUserRequest struct {
    Name  string  `json:"name"`   // required
    Phone *string `json:"phone"`  // optional
}
```

```yaml
# OpenAPI
CreateUserRequest:
  type: object
  properties:
    name:
      type: string
    phone:
      type: string
  required:
    - name
  # phone NO está en required porque es *string
```

---

## 2. Struct → Schema con naming

### Entity Response DTO

```go
// Go — domain/entity.go
type Product struct {
    ID        uuid.UUID      `gorm:"type:uuid;primaryKey"`
    Name      string         `gorm:"not null"`
    Price     float64        `gorm:"not null"`
    CreatedAt time.Time
    UpdatedAt time.Time
    DeletedAt gorm.DeletedAt `gorm:"index"`
}

type ProductResponse struct {
    ID        string    `json:"id"`
    Name      string    `json:"name"`
    Price     float64   `json:"price"`
    CreatedAt time.Time `json:"created_at"`
}
```

```yaml
# OpenAPI — components/schemas/
ProductResponse:
  type: object
  properties:
    id:
      type: string
      format: uuid
      readOnly: true
    name:
      type: string
    price:
      type: number
      format: double
    created_at:
      type: string
      format: date-time
      readOnly: true
  required:
    - id
    - name
    - price
    - created_at
```

### Request DTO

```go
// Go — handlers.go
type CreateProductRequestDTO struct {
    Name  string  `json:"name"`
    Price float64 `json:"price"`
}
```

```yaml
# OpenAPI
CreateProductRequest:
  type: object
  properties:
    name:
      type: string
    price:
      type: number
      format: double
  required:
    - name
    - price
```

---

## 3. Parameters

### Path params

```go
// Go
id := r.PathValue("id")
```

```yaml
# OpenAPI
parameters:
  - name: id
    in: path
    required: true
    schema:
      type: string
      format: uuid
```

### Query params

```go
// Go
cursor := r.URL.Query().Get("cursor")
limit, _ := strconv.Atoi(r.URL.Query().Get("limit"))
```

```yaml
# OpenAPI
parameters:
  - name: cursor
    in: query
    required: false
    schema:
      type: string
    description: Cursor for pagination
  - name: limit
    in: query
    required: false
    schema:
      type: integer
      default: 20
    description: Number of items per page
```

---

## 4. Security

### Bearer JWT (endpoint protegido)

```go
// Go — routes.go
mux.HandleFunc("GET /products/{id}", i.middleware.auth.RequireAuth(i.handlers.productHandler.GetByID))
```

```yaml
# OpenAPI — en el operation
security:
  - bearerAuth: []
```

### Endpoint público (sin middleware de auth)

```go
// Go — routes.go
mux.HandleFunc("POST /auth/login", i.handlers.authHandler.Login)
```

```yaml
# OpenAPI — en el operation
security: []  # override global: sin auth
```

### Roles

```go
// Go — routes.go
mux.HandleFunc("DELETE /users/{id}", i.middleware.auth.RequireRole("admin")(i.handlers.userHandler.Delete))
```

```yaml
# OpenAPI — en el operation
security:
  - bearerAuth: []
# Agregar en description: "Requires admin role"
```

### Security scheme definition

```yaml
# OpenAPI — components/securitySchemes/
components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
      description: JWT token obtained from /auth/login
```

---

## 5. Responses — Wrappers estándar

### Success response (un item)

```go
// Go
response.Success(w, http.StatusOK, product.ToResponse(), "Product retrieved")
```

```yaml
# OpenAPI
'200':
  description: Product retrieved successfully
  content:
    application/json:
      schema:
        type: object
        properties:
          data:
            $ref: '#/components/schemas/ProductResponse'
          message:
            type: string
        required: [data, message]
      example:
        data:
          id: "550e8400-e29b-41d4-a716-446655440000"
          name: "Example"
          price: 29.99
          created_at: "2024-01-15T10:30:00Z"
        message: "Product retrieved"
```

### Success response (created)

```go
// Go
response.Success(w, http.StatusCreated, product.ToResponse(), "Product created")
```

```yaml
'201':
  description: Product created successfully
  content:
    application/json:
      schema:
        type: object
        properties:
          data:
            $ref: '#/components/schemas/ProductResponse'
          message:
            type: string
        required: [data, message]
```

### Paged response

```go
// Go
response.Paged(w, http.StatusOK, items, nextCursor, hasMore, total, "Products retrieved")
```

```yaml
'200':
  description: Products listed successfully
  content:
    application/json:
      schema:
        type: object
        properties:
          data:
            type: object
            properties:
              items:
                type: array
                items:
                  $ref: '#/components/schemas/ProductResponse'
              next_cursor:
                type: string
              has_more:
                type: boolean
              total:
                type: integer
            required: [items, has_more]
          message:
            type: string
        required: [data, message]
```

### Error response

```go
// Go
response.Error(w, http.StatusBadRequest, apierrors.CodeInvalidBody, "invalid JSON")
```

```yaml
'400':
  description: Bad Request
  content:
    application/json:
      schema:
        $ref: '#/components/schemas/ErrorResponse'
      examples:
        invalidBody:
          value:
            message: "Error"
            error: "INVALID_BODY"
            details: "invalid JSON"
```

---

## 6. Tags (agrupación por módulo)

```yaml
tags:
  - name: auth
    description: Authentication and session management
  - name: products
    description: Product CRUD operations
  - name: users
    description: User management

paths:
  /auth/login:
    post:
      tags: [auth]
      ...
  /products:
    get:
      tags: [products]
      ...
  /products/{id}:
    get:
      tags: [products]
      ...
```

---

## 7. Naming conventions

| Concepto | Naming en OpenAPI |
|----------|-------------------|
| Schema de request | `Create{Módulo}Request`, `Update{Módulo}Request` |
| Schema de response | `{Módulo}Response` |
| operationId | `create{Módulo}`, `get{Módulo}ByID`, `list{Módulo}s`, `update{Módulo}`, `delete{Módulo}` |
| Tag | nombre del módulo en minúsculas |
| Path param | nombre exacto del `r.PathValue("x")` |
| Query param | nombre exacto del `r.URL.Query().Get("x")` |

---

## 8. Spec completo de ejemplo

```yaml
openapi: "3.1.0"
info:
  title: TapLog API
  description: Backend para gestión de registros de cerveza
  version: "1.0.0"

servers:
  - url: http://localhost:8000
    description: Local development

security:
  - bearerAuth: []

tags:
  - name: auth
    description: Authentication
  - name: products
    description: Product operations

paths:
  /auth/login:
    post:
      tags: [auth]
      summary: User login
      operationId: login
      security: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/LoginRequest'
      responses:
        '200':
          description: Login successful
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    $ref: '#/components/schemas/LoginResponse'
                  message:
                    type: string
        '401':
          description: Invalid credentials
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'

  /products:
    get:
      tags: [products]
      summary: List products
      operationId: listProducts
      parameters:
        - name: cursor
          in: query
          schema:
            type: string
        - name: limit
          in: query
          schema:
            type: integer
            default: 20
      responses:
        '200':
          description: Products retrieved
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    type: object
                    properties:
                      items:
                        type: array
                        items:
                          $ref: '#/components/schemas/ProductResponse'
                      next_cursor:
                        type: string
                      has_more:
                        type: boolean
                      total:
                        type: integer
                  message:
                    type: string

    post:
      tags: [products]
      summary: Create product
      operationId: createProduct
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateProductRequest'
      responses:
        '201':
          description: Product created
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    $ref: '#/components/schemas/ProductResponse'
                  message:
                    type: string
        '400':
          description: Validation error
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
        '409':
          description: Product already exists
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'

components:
  schemas:
    ErrorResponse:
      type: object
      properties:
        message:
          type: string
        error:
          type: string
        details:
          type: string
      required: [message, error]

    LoginRequest:
      type: object
      properties:
        email:
          type: string
          format: email
        password:
          type: string
      required: [email, password]

    LoginResponse:
      type: object
      properties:
        access_token:
          type: string
        refresh_token:
          type: string

    CreateProductRequest:
      type: object
      properties:
        name:
          type: string
        price:
          type: number
          format: double
      required: [name, price]

    ProductResponse:
      type: object
      properties:
        id:
          type: string
          format: uuid
        name:
          type: string
        price:
          type: number
          format: double
        created_at:
          type: string
          format: date-time
      required: [id, name, price, created_at]

  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
```
