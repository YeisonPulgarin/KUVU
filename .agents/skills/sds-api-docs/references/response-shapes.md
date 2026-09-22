# Response Shapes — Backend Go → OpenAPI

Referencia para la skill `sds-api-docs`. Documenta los 3 shapes estándar de respuesta
del backend Go (`pkg/response`) y cómo mapearlos a schemas OpenAPI 3.1.

---

## 1. Success Response

### Go

```go
response.Success(w, http.StatusOK, data, "Message")
```

### JSON output

```json
{
  "data": { ... },
  "message": "Message"
}
```

### OpenAPI schema (inline por endpoint)

```yaml
'200':
  description: {descripción}
  content:
    application/json:
      schema:
        type: object
        properties:
          data:
            $ref: '#/components/schemas/{DataSchema}'
          message:
            type: string
        required: [data, message]
```

### Variante: data es null

```go
response.Success(w, http.StatusOK, nil, "Logout successful")
```

```yaml
'200':
  description: Operation successful
  content:
    application/json:
      schema:
        type: object
        properties:
          data:
            type: "null"
          message:
            type: string
        required: [message]
```

---

## 2. Error Response

### Go

```go
response.Error(w, http.StatusBadRequest, apierrors.CodeInvalidBody, "Details here")
```

### JSON output

```json
{
  "message": "Error",
  "error": "INVALID_BODY",
  "details": "Details here"
}
```

### OpenAPI schema (reusable component)

```yaml
components:
  schemas:
    ErrorResponse:
      type: object
      properties:
        message:
          type: string
          description: Always "Error" for error responses
        error:
          type: string
          description: Machine-readable error code from pkg/apierrors
          enum:
            - INVALID_BODY
            - MISSING_FIELDS
            - MISSING_TOKEN
            - INVALID_TOKEN
            - INVALID_CREDENTIALS
            - UNAUTHORIZED
            - FORBIDDEN
            - NOT_FOUND
            - CONFLICT
            - INVALID_CURSOR
            - INTERNAL_ERROR
        details:
          type: string
          description: Human-readable error details
      required: [message, error]
```

### Uso por endpoint (con examples específicos)

```yaml
'400':
  description: Bad Request
  content:
    application/json:
      schema:
        $ref: '#/components/schemas/ErrorResponse'
      examples:
        invalidBody:
          summary: Invalid JSON body
          value:
            message: "Error"
            error: "INVALID_BODY"
            details: "unexpected EOF"
        missingFields:
          summary: Required fields missing
          value:
            message: "Error"
            error: "MISSING_FIELDS"
            details: "name is required"

'401':
  description: Unauthorized
  content:
    application/json:
      schema:
        $ref: '#/components/schemas/ErrorResponse'
      examples:
        missingToken:
          value:
            message: "Error"
            error: "MISSING_TOKEN"
            details: "Authorization required"
        invalidToken:
          value:
            message: "Error"
            error: "INVALID_TOKEN"
            details: "Invalid token"

'403':
  description: Forbidden
  content:
    application/json:
      schema:
        $ref: '#/components/schemas/ErrorResponse'
      example:
        message: "Error"
        error: "FORBIDDEN"
        details: "Insufficient permissions"

'404':
  description: Not Found
  content:
    application/json:
      schema:
        $ref: '#/components/schemas/ErrorResponse'
      example:
        message: "Error"
        error: "NOT_FOUND"
        details: "Product not found"

'409':
  description: Conflict
  content:
    application/json:
      schema:
        $ref: '#/components/schemas/ErrorResponse'
      example:
        message: "Error"
        error: "CONFLICT"
        details: "Product already exists"

'500':
  description: Internal Server Error
  content:
    application/json:
      schema:
        $ref: '#/components/schemas/ErrorResponse'
      example:
        message: "Error"
        error: "INTERNAL_ERROR"
        details: "Internal error"
```

---

## 3. Paged Response

### Go

```go
response.Paged(w, http.StatusOK, items, nextCursor, hasMore, total, "Items retrieved")
```

### JSON output

```json
{
  "data": {
    "items": [ ... ],
    "next_cursor": "abc123",
    "has_more": true,
    "total": 42
  },
  "message": "Items retrieved"
}
```

### OpenAPI schema (por endpoint, con tipo de items)

```yaml
'200':
  description: Items listed successfully
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
                  $ref: '#/components/schemas/{ItemSchema}'
              next_cursor:
                type: string
                description: Cursor for the next page. Empty if no more pages.
              has_more:
                type: boolean
                description: Whether there are more items after this page
              total:
                type: integer
                description: Total count of items (may be approximate)
            required: [items, has_more]
          message:
            type: string
        required: [data, message]
```

### Query params de paginación (a documentar en parameters)

```yaml
parameters:
  - name: cursor
    in: query
    required: false
    schema:
      type: string
    description: Pagination cursor from previous response's next_cursor
  - name: limit
    in: query
    required: false
    schema:
      type: integer
      minimum: 1
      maximum: 100
      default: 20
    description: Number of items per page
```

---

## 4. Mapeo status code → shape

| Status | Shape | Cuándo |
|--------|-------|--------|
| 200 | Success | GET exitoso, PUT exitoso, operación exitosa sin creación |
| 200 | Paged | GET de lista con paginación |
| 201 | Success | POST que crea un recurso |
| 204 | (sin body) | DELETE exitoso (si no retorna data) |
| 400 | Error | Body inválido, campos faltantes, validación de formato |
| 401 | Error | Token ausente, token inválido, credenciales inválidas |
| 403 | Error | Autenticado pero sin permisos |
| 404 | Error | Recurso no encontrado |
| 409 | Error | Conflicto (recurso ya existe) |
| 422 | Error | Regla de negocio violada |
| 500 | Error | Error inesperado del servidor |

---

## 5. Error codes del catálogo (pkg/apierrors)

Tabla de referencia para documentar los `error` field posibles:

| Code | HTTP Status típico | Cuándo se usa |
|------|-------------------|---------------|
| `INVALID_BODY` | 400 | JSON del body no se puede parsear |
| `MISSING_FIELDS` | 400 | Campos requeridos ausentes |
| `MISSING_TOKEN` | 401 | Header Authorization vacío |
| `INVALID_TOKEN` | 401 | Token no válido o expirado |
| `INVALID_CREDENTIALS` | 401 | Email/password incorrectos |
| `AUTH_ERROR` | 401 | Error genérico de autenticación |
| `UNAUTHORIZED` | 401 | No autenticado |
| `FORBIDDEN` | 403 | Sin permisos suficientes |
| `NOT_FOUND` | 404 | Recurso genérico no encontrado |
| `USER_NOT_FOUND` | 404 | Usuario específico no encontrado |
| `USER_EXISTS` | 409 | Email/username ya registrado |
| `USER_INACTIVE` | 403 | Usuario desactivado |
| `CONFLICT` | 409 | Conflicto genérico |
| `INVALID_CURSOR` | 400 | Cursor de paginación inválido |
| `INTERNAL_ERROR` | 500 | Error inesperado (no exponer detalles internos) |

---

## 6. Cómo detectar qué shape usa cada handler

Buscar en el handler las llamadas a `response.`:

```go
// → Success shape
response.Success(w, statusCode, data, message)

// → Error shape
response.Error(w, statusCode, errorCode, details)

// → Paged shape
response.Paged(w, statusCode, items, cursor, hasMore, total, message)
```

El primer argumento después de `w` es el status code. El `errorCode` es siempre una constante de `apierrors.Code*`.
