# Bruno Format — Referencia completa

Referencia para la skill `sds-api-docs`. Formato DSL de archivos `.bru`, estructura
de colecciones, environments, y ejemplos por tipo de request.

---

## 1. Estructura de colección

```
docs/collections/
  bruno.json                      ← config raíz
  environments/
    local.bru                     ← vars para desarrollo local
    staging.bru                   ← vars para staging (opcional)
    production.bru                ← vars para producción (opcional)
  auth/
    login.bru
    register.bru
    refresh-token.bru
  products/
    list-products.bru
    get-product-by-id.bru
    create-product.bru
    update-product.bru
    delete-product.bru
  users/
    list-users.bru
    ...
```

---

## 2. bruno.json

```json
{
  "version": "1",
  "name": "{nombre del proyecto}",
  "type": "collection",
  "ignore": [
    "node_modules",
    ".git"
  ]
}
```

---

## 3. Environment files

### local.bru

```bru
vars {
  baseUrl: http://localhost:8000
  token:
}
```

### staging.bru

```bru
vars {
  baseUrl: https://api-staging.example.com
  token:
}
```

**Nota:** El token se llena manualmente o vía script pre-request en Bruno. Nunca hardcodear tokens reales en archivos versionados.

---

## 4. Formato de archivos .bru

Cada archivo `.bru` tiene bloques con la siguiente estructura:

```
meta {
  name: {Nombre legible del request}
  type: http
  seq: {número de orden en la carpeta}
}

{method} {
  url: {URL con variables}
  body: {none | json | form | xml | text}
  auth: {none | bearer | basic | apikey}
}

[params:path {}]        ← si tiene path params
[params:query {}]       ← si tiene query params
[headers {}]            ← headers custom
[auth:bearer {}]        ← config de auth
[body:json {}]          ← body del request
[script:pre-request {}] ← script JS pre-request (opcional)
[tests {}]              ← assertions (opcional)
```

---

## 5. Ejemplos por tipo de request

### GET — Lista (sin auth)

```bru
meta {
  name: List Products (Public)
  type: http
  seq: 1
}

get {
  url: {{baseUrl}}/products
  body: none
  auth: none
}

params:query {
  limit: 20
  cursor:
}
```

### GET — Lista (con auth)

```bru
meta {
  name: List Products
  type: http
  seq: 1
}

get {
  url: {{baseUrl}}/products
  body: none
  auth: bearer
}

params:query {
  limit: 20
  cursor:
}

auth:bearer {
  token: {{token}}
}
```

### GET — Por ID

```bru
meta {
  name: Get Product by ID
  type: http
  seq: 2
}

get {
  url: {{baseUrl}}/products/:id
  body: none
  auth: bearer
}

params:path {
  id: 550e8400-e29b-41d4-a716-446655440000
}

auth:bearer {
  token: {{token}}
}
```

### POST — Crear recurso

```bru
meta {
  name: Create Product
  type: http
  seq: 3
}

post {
  url: {{baseUrl}}/products
  body: json
  auth: bearer
}

auth:bearer {
  token: {{token}}
}

body:json {
  {
    "name": "New Product",
    "price": 29.99
  }
}
```

### PUT — Actualizar recurso

```bru
meta {
  name: Update Product
  type: http
  seq: 4
}

put {
  url: {{baseUrl}}/products/:id
  body: json
  auth: bearer
}

params:path {
  id: 550e8400-e29b-41d4-a716-446655440000
}

auth:bearer {
  token: {{token}}
}

body:json {
  {
    "name": "Updated Product Name",
    "price": 39.99
  }
}
```

### DELETE — Eliminar recurso

```bru
meta {
  name: Delete Product
  type: http
  seq: 5
}

delete {
  url: {{baseUrl}}/products/:id
  body: none
  auth: bearer
}

params:path {
  id: 550e8400-e29b-41d4-a716-446655440000
}

auth:bearer {
  token: {{token}}
}
```

### POST — Login (sin auth, con body)

```bru
meta {
  name: Login
  type: http
  seq: 1
}

post {
  url: {{baseUrl}}/auth/login
  body: json
  auth: none
}

body:json {
  {
    "email": "user@example.com",
    "password": "password123"
  }
}

script:post-response {
  if (res.status === 200) {
    bru.setEnvVar("token", res.body.data.access_token);
  }
}
```

### POST — File upload (multipart)

```bru
meta {
  name: Upload Avatar
  type: http
  seq: 6
}

post {
  url: {{baseUrl}}/users/:id/avatar
  body: multipartForm
  auth: bearer
}

params:path {
  id: 550e8400-e29b-41d4-a716-446655440000
}

auth:bearer {
  token: {{token}}
}

body:multipart-form {
  avatar: @file(/path/to/avatar.png)
}
```

---

## 6. Query params con paginación cursor

```bru
params:query {
  limit: 20
  cursor:
  ~sort: created_at
  ~order: desc
}
```

El prefijo `~` marca el param como desactivado por defecto (Bruno lo muestra grayed out).

---

## 7. Headers custom

```bru
headers {
  X-Request-ID: {{$guid}}
  Accept-Language: es
}
```

---

## 8. Scripts pre-request y post-response

### Pre-request: generar timestamp

```bru
script:pre-request {
  const now = new Date().toISOString();
  bru.setVar("timestamp", now);
}
```

### Post-response: guardar token después de login

```bru
script:post-response {
  if (res.status === 200) {
    bru.setEnvVar("token", res.body.data.access_token);
  }
}
```

### Post-response: guardar ID creado

```bru
script:post-response {
  if (res.status === 201) {
    bru.setVar("lastCreatedId", res.body.data.id);
  }
}
```

---

## 9. Naming conventions para archivos .bru

| Operación | Nombre del archivo | `meta.name` |
|-----------|--------------------|-------------|
| Listar | `list-{módulo}s.bru` | `List {Módulo}s` |
| Obtener por ID | `get-{módulo}-by-id.bru` | `Get {Módulo} by ID` |
| Crear | `create-{módulo}.bru` | `Create {Módulo}` |
| Actualizar | `update-{módulo}.bru` | `Update {Módulo}` |
| Eliminar | `delete-{módulo}.bru` | `Delete {Módulo}` |
| Login | `login.bru` | `Login` |
| Register | `register.bru` | `Register` |
| Custom | `{verbo}-{recurso}.bru` | `{Verbo} {Recurso}` |

---

## 10. Orden (`seq`)

El campo `seq` controla el orden visual en Bruno:

| Tipo de operación | seq sugerido |
|-------------------|-------------|
| List (GET /) | 1 |
| Get by ID (GET /:id) | 2 |
| Create (POST /) | 3 |
| Update (PUT /:id) | 4 |
| Delete (DELETE /:id) | 5 |
| Custom operations | 6+ |
