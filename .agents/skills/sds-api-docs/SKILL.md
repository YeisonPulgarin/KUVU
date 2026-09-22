---
name: sds-api-docs
description: Documentación de API — OpenAPI 3.1 YAML + colecciones Bruno. Lee el backend Go (handlers, routes, use cases, domain) y genera spec + requests listos para usar. Modo directo e integrado post-módulo.
version: 1.0.0
---

# Activation Contract

**Soy:** experto en documentación de API REST y contratos OpenAPI para proyectos salomondevsystems  
**Activo cuando:**
- Alguien pide documentar la API, generar OpenAPI, crear colecciones Bruno, o actualizar docs después de crear un módulo
- Se termina de crear un módulo nuevo con `sds-backend-go` y se necesita documentar los endpoints  
**Excelente en:** lectura de código Go para extraer contratos de API, generación de specs OpenAPI 3.1, colecciones Bruno con examples

---

# Hard Rules

## 1. No modificar código del backend

❌ **PROHIBIDO:**
- Modificar handlers, routes, use cases, domain, o cualquier archivo `.go`
- Agregar anotaciones o comentarios al código para facilitar la generación
- Instalar dependencias o herramientas de generación de docs

✅ **PERMITIDO:**
- Leer cualquier archivo del backend (read, grep, glob)
- Crear/modificar archivos solo en `docs/` (api, collections)

## 2. Spec siempre válido

El `docs/api/openapi.yaml` generado es un spec OpenAPI 3.1 estructuralmente válido. Si no se puede inferir un campo con confianza, omitirlo — nunca inventar.

## 3. Bruno siempre funcional

Cada `.bru` generado es ejecutable directamente en Bruno sin modificaciones. Bodies de ejemplo tienen tipos correctos y formato JSON válido.

## 4. Modo incremental no destruye

En modo incremental (post-módulo), nunca borrar endpoints existentes del spec ni archivos `.bru` existentes. Solo agregar o actualizar.

## 5. Fidelidad al código

Los schemas documentados reflejan exactamente los json tags del código Go. Si un campo tiene `json:"first_name"`, el schema usa `first_name` — no `firstName`, no `FirstName`.

---

# Fase 1 — Entrevista

## Modo directo (primera vez, sin spec existente)

Hacer estas 3 preguntas:

### Pregunta 1 — Info del proyecto

```
¿Cuál es el nombre y descripción breve de la API?
(ej: "TapLog API — Backend para gestión de registros de cerveza")
```

### Pregunta 2 — Base URL

```
¿Cuál es la base URL de la API?
(ej: http://localhost:8000, http://localhost:8000/api/v1)
```

### Pregunta 3 — Autenticación

```
¿Qué esquema de autenticación usa la API?
  a) Bearer JWT (Authorization: Bearer <token>)
  b) API Key (header custom)
  c) Session cookies
  d) Ninguna (API pública)
```

## Modo integrado (spec ya existe)

Si `docs/api/openapi.yaml` ya existe:
- Leer `info`, `servers`, `securitySchemes` del spec existente
- No hacer la entrevista — usar los valores del spec
- Preguntar solo: "¿Qué módulo nuevo se agregó?" (o inferirlo de los archivos recién creados)

---

# Reading Strategy

Orden de lectura para extraer la información completa de cada endpoint:

```
1. cmd/routes.go
   → Lista de endpoints: method, path, middleware (auth/roles), handler
   → Separar rutas públicas de privadas

2. internal/<módulo>/infrastructure/http/handlers.go
   → Request DTO (struct con json tags → request body schema)
   → Path params usados (r.PathValue("x"))
   → Query params usados (r.URL.Query().Get("x"))
   → Status codes retornados (response.Success, response.Error)
   → Error codes usados (apierrors.CodeX)
   → Validaciones explícitas (→ campos required)

3. internal/<módulo>/application/<operación>.go
   → Request struct (campos y tipos → refinar schema)
   → Response struct (si difiere del domain Response)

4. internal/<módulo>/domain/entity.go
   → Entity struct (tipos de campos)
   → ToResponse() method (→ response schema: campos con json tags)
   → BeforeCreate hooks (→ campos auto-generados como ID)

5. internal/<módulo>/domain/ports.go
   → Response types definidos en ports
   → Interfaces que indican operaciones disponibles

6. internal/<módulo>/domain/errors.go
   → Errores del dominio mapeados a HTTP status en handlers

7. pkg/apierrors/codes.go
   → Catálogo completo de error codes (para documentar responses)

8. pkg/response/response.go
   → Shapes de respuesta (para wrappers genéricos)
```

---

# Schema Inference

## Mapeo de tipos Go → JSON Schema (OpenAPI 3.1)

| Tipo Go | JSON Schema | Notas |
|---------|-------------|-------|
| `string` | `type: string` | |
| `int`, `int32` | `type: integer, format: int32` | |
| `int64` | `type: integer, format: int64` | |
| `float32` | `type: number, format: float` | |
| `float64` | `type: number, format: double` | |
| `bool` | `type: boolean` | |
| `uuid.UUID` | `type: string, format: uuid` | |
| `time.Time` | `type: string, format: date-time` | |
| `[]T` | `type: array, items: {T}` | |
| `map[string]T` | `type: object, additionalProperties: {T}` | |
| `*T` (pointer) | schema de T, pero NO en `required` | Campo opcional |
| `gorm.DeletedAt` | **omitir** | Campo interno, no se expone |
| `CreatedAt`, `UpdatedAt` (auto) | `type: string, format: date-time, readOnly: true` | |

## Inferencia de `required`

Un campo es `required` en el request schema si:
1. El handler valida su ausencia explícitamente (`if req.Name == ""` → error)
2. No es pointer en el Request DTO (`Name string` es required, `Name *string` no)
3. El handler retorna `CodeMissingFields` mencionando ese campo

Un campo es `readOnly` en el response schema si:
- Es generado automáticamente (ID, CreatedAt, UpdatedAt)

---

# OpenAPI Generation

## Estructura del spec

```yaml
openapi: "3.1.0"
info:
  title: {nombre de la entrevista}
  description: {descripción de la entrevista}
  version: "1.0.0"

servers:
  - url: {base URL de la entrevista}
    description: Local development

tags:
  - name: {módulo}
    description: Operaciones de {módulo}

paths:
  /{path}:
    {method}:
      tags: [{módulo}]
      summary: {inferido del handler name}
      operationId: {handlerName en camelCase}
      security: [{bearerAuth: []}]  # o [] si público
      parameters: [...]
      requestBody: ...
      responses: ...

components:
  schemas:
    {Módulo}Response:
      type: object
      properties: ...
      required: [...]
    Create{Módulo}Request:
      type: object
      properties: ...
      required: [...]
    ErrorResponse:
      type: object
      properties:
        message: { type: string }
        error: { type: string }
        details: { type: string }
      required: [message, error]
    SuccessResponse:
      type: object
      properties:
        data: {}
        message: { type: string }
      required: [data, message]
    PagedResponse:
      type: object
      properties:
        data:
          type: object
          properties:
            items: { type: array, items: {} }
            next_cursor: { type: string }
            has_more: { type: boolean }
            total: { type: integer }
          required: [items, has_more]
        message: { type: string }
      required: [data, message]

  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
```

## Naming conventions para paths

| Pattern en routes.go | Documentado como |
|---------------------|-----------------|
| `"GET /products"` | `paths: /products: get:` |
| `"GET /products/{id}"` | `paths: /products/{id}: get:` con parameter `id` |
| `"POST /products"` | `paths: /products: post:` |
| `"PUT /products/{id}"` | `paths: /products/{id}: put:` |
| `"DELETE /products/{id}"` | `paths: /products/{id}: delete:` |

## Responses por status code

Para cada handler, documentar todas las responses observadas:

| Situación en handler | Response documentada |
|---------------------|---------------------|
| `response.Success(w, 200, data, msg)` | `200: {SuccessResponse con schema del data}` |
| `response.Success(w, 201, data, msg)` | `201: {SuccessResponse con schema del data}` |
| `response.Error(w, 400, code, msg)` | `400: {ErrorResponse con example del code}` |
| `response.Error(w, 401, code, msg)` | `401: {ErrorResponse}` |
| `response.Error(w, 403, code, msg)` | `403: {ErrorResponse}` |
| `response.Error(w, 404, code, msg)` | `404: {ErrorResponse}` |
| `response.Error(w, 409, code, msg)` | `409: {ErrorResponse}` |
| `response.Error(w, 500, code, msg)` | `500: {ErrorResponse}` |
| `response.Paged(w, 200, ...)` | `200: {PagedResponse con schema de items}` |

---

# Bruno Generation

## Estructura de la colección

```
docs/collections/
  bruno.json
  environments/
    local.bru
  {módulo}/
    create-{módulo}.bru
    get-{módulo}-by-id.bru
    list-{módulo}s.bru
    update-{módulo}.bru
    delete-{módulo}.bru
```

## bruno.json

```json
{
  "version": "1",
  "name": "{nombre del proyecto}",
  "type": "collection"
}
```

## Environment (local.bru)

```bru
vars {
  baseUrl: {base URL de la entrevista}
  token:
}
```

## Request file (.bru) — Template por method

### GET sin params

```bru
meta {
  name: List {Módulo}s
  type: http
  seq: 1
}

get {
  url: {{baseUrl}}/{módulo}s
  body: none
  auth: bearer
}

auth:bearer {
  token: {{token}}
}
```

### GET con path param

```bru
meta {
  name: Get {Módulo} by ID
  type: http
  seq: 2
}

get {
  url: {{baseUrl}}/{módulo}s/:id
  body: none
  auth: bearer
}

params:path {
  id: {uuid-placeholder}
}

auth:bearer {
  token: {{token}}
}
```

### POST con body

```bru
meta {
  name: Create {Módulo}
  type: http
  seq: 3
}

post {
  url: {{baseUrl}}/{módulo}s
  body: json
  auth: bearer
}

auth:bearer {
  token: {{token}}
}

body:json {
  {
    "field_name": "example value",
    "field_number": 0
  }
}
```

### PUT con path param y body

```bru
meta {
  name: Update {Módulo}
  type: http
  seq: 4
}

put {
  url: {{baseUrl}}/{módulo}s/:id
  body: json
  auth: bearer
}

params:path {
  id: {uuid-placeholder}
}

auth:bearer {
  token: {{token}}
}

body:json {
  {
    "field_name": "updated value"
  }
}
```

### DELETE con path param

```bru
meta {
  name: Delete {Módulo}
  type: http
  seq: 5
}

delete {
  url: {{baseUrl}}/{módulo}s/:id
  body: none
  auth: bearer
}

params:path {
  id: {uuid-placeholder}
}

auth:bearer {
  token: {{token}}
}
```

## Valores placeholder por tipo

| Tipo | Placeholder |
|------|-------------|
| string | `"example"` |
| int/int64 | `0` |
| float64 | `0.0` |
| bool | `false` |
| uuid | `"00000000-0000-0000-0000-000000000000"` |
| time.Time | `"2024-01-01T00:00:00Z"` |
| email (inferido del nombre) | `"user@example.com"` |
| url (inferido del nombre) | `"https://example.com"` |

---

# Incremental Mode

Cuando se invoca después de crear un módulo (spec ya existe):

1. Leer `docs/api/openapi.yaml` existente
2. Leer `cmd/routes.go` completo
3. Identificar endpoints nuevos (paths en routes.go que no están en el spec)
4. Para cada endpoint nuevo: seguir la Reading Strategy (handlers → use cases → domain)
5. Agregar al spec:
   - Nuevo tag (si es módulo nuevo)
   - Nuevos paths con todas sus operaciones
   - Nuevos schemas en components (Request, Response)
6. Generar archivos `.bru` nuevos en `docs/collections/{módulo}/`
7. Si un endpoint existente tiene campos nuevos en su DTO: actualizar el schema correspondiente

**Heurística de detección de cambios:** comparar campos del schema YAML existente vs. json tags del struct Go actual. Si hay campos nuevos en Go → agregarlos al schema. Si hay campos removidos en Go → marcarlos como `deprecated: true` (no borrar).

---

# Execution Steps

## Modo directo (documentar API completa)

1. Completar entrevista (preguntas 1-3)
2. Leer `cmd/routes.go` → lista completa de endpoints
3. Para cada módulo detectado en las routes:
   a. Leer handlers → extraer DTOs, params, status codes, error codes, validaciones
   b. Leer use cases → refinar request/response types
   c. Leer domain → extraer entity fields y ToResponse()
4. Construir spec OpenAPI completo
5. Generar `docs/api/openapi.yaml`
6. Generar `docs/collections/bruno.json` + environments
7. Para cada endpoint: generar archivo `.bru`
8. Presentar resumen de lo generado

## Modo integrado (post-módulo)

1. Verificar que `docs/api/openapi.yaml` existe → leer info/servers/security
2. Preguntar o inferir qué módulo se agregó
3. Leer routes nuevas del módulo
4. Leer handlers/use cases/domain del módulo nuevo
5. Agregar paths y schemas al spec existente
6. Generar archivos `.bru` nuevos
7. Presentar resumen de lo agregado

---

# Output Contract

**Entrego:**
- ✅ `docs/api/openapi.yaml` — spec OpenAPI 3.1 válido y completo
- ✅ `docs/collections/bruno.json` — config de colección Bruno
- ✅ `docs/collections/environments/local.bru` — environment con baseUrl y token
- ✅ `docs/collections/{módulo}/*.bru` — un archivo por endpoint, ejecutable en Bruno
- ✅ Schemas que reflejan exactamente los DTOs del código (json tags)
- ✅ Responses documentando todos los status codes observados en handlers
- ✅ Security aplicado por endpoint según middleware detectado

**Garantizo:**
- Sin modificaciones a código del backend
- Spec válido OpenAPI 3.1
- Archivos .bru ejecutables directamente en Bruno
- json tags respetados al pie de la letra (snake_case)
- Modo incremental preserva contenido existente
- Campos auto-generados marcados como readOnly

---

# References

- `references/openapi-patterns.md` — Mapeo Go → OpenAPI, naming, wrappers, examples
- `references/bruno-format.md` — Formato .bru completo, estructura de colección, tips
- `references/response-shapes.md` — Shapes estándar del backend (Success, Error, Paged) como schemas OpenAPI
