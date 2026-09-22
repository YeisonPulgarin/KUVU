# OWASP Top 10 (2021) — Patterns por stack

Referencia para la skill `sdd-secure`. Cada riesgo incluye patterns concretos
a buscar en los stacks del ecosistema salomondevsystems.

---

## A01:2021 — Broken Access Control

**CWE asociados:** CWE-200, CWE-284, CWE-285, CWE-352, CWE-639

### Go

```go
// ❌ VULNERABLE: accede al recurso sin verificar ownership
func (h *Handler) GetDocument(w http.ResponseWriter, r *http.Request) {
    id := r.PathValue("id")
    doc, _ := h.repo.GetByID(r.Context(), id)
    // No verifica que doc.UserID == usuario autenticado
    response.Success(w, http.StatusOK, doc.ToResponse(), "")
}

// ✅ SEGURO: verifica ownership
func (h *Handler) GetDocument(w http.ResponseWriter, r *http.Request) {
    id := r.PathValue("id")
    userID := auth.UserIDFromContext(r.Context())
    doc, _ := h.repo.GetByIDAndUser(r.Context(), id, userID)
    if doc == nil {
        response.Error(w, http.StatusNotFound, apierrors.CodeNotFound, "Not found")
        return
    }
    response.Success(w, http.StatusOK, doc.ToResponse(), "")
}
```

**Buscar:**
- Handlers que obtienen recursos por ID sin filtrar por usuario autenticado
- Endpoints CRUD en rutas públicas (sin middleware de auth)
- Falta de verificación de roles en operaciones administrativas

### Next.js

```tsx
// ❌ VULNERABLE: Server Action sin verificar sesión
'use server'
export async function deleteUser(userId: string) {
    await api.users.delete(userId) // sin verificar quién llama
}

// ✅ SEGURO: verifica sesión y permisos
'use server'
export async function deleteUser(userId: string) {
    const session = await getSession()
    if (!session || session.role !== 'admin') {
        throw new Error('Unauthorized')
    }
    await api.users.delete(userId)
}
```

**Buscar:**
- Server Actions sin `getSession()` o equivalente
- API routes sin middleware de auth
- Páginas en route groups protegidos sin layout de verificación

---

## A02:2021 — Cryptographic Failures

**CWE asociados:** CWE-259, CWE-327, CWE-328, CWE-330, CWE-331

### Go

```go
// ❌ VULNERABLE: random inseguro para tokens
import "math/rand"
token := fmt.Sprintf("%d", rand.Intn(999999))

// ✅ SEGURO: crypto/rand
import "crypto/rand"
b := make([]byte, 32)
crypto_rand.Read(b)
token := base64.URLEncoding.EncodeToString(b)

// ❌ VULNERABLE: MD5 para passwords
hash := md5.Sum([]byte(password))

// ✅ SEGURO: bcrypt
hash, _ := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
```

**Buscar:**
- `math/rand` en contextos de seguridad (tokens, OTP, session IDs)
- `md5.Sum`, `sha1.Sum` para passwords o verificación de integridad de auth
- Hardcoded keys/IVs en cifrado simétrico
- `crypto/des`, `crypto/rc4` (algoritmos obsoletos)

### Next.js / Astro

**Buscar:**
- `Math.random()` para generar tokens o IDs de sesión
- Secrets almacenados en `localStorage` sin cifrar
- Transmisión de datos sensibles sin HTTPS

---

## A03:2021 — Injection

**CWE asociados:** CWE-20, CWE-74, CWE-75, CWE-77, CWE-78, CWE-79, CWE-89

### Go — SQL Injection

```go
// ❌ VULNERABLE: interpolación directa
query := fmt.Sprintf("SELECT * FROM users WHERE email = '%s'", email)
db.Raw(query).Scan(&user)

// ✅ SEGURO: query parametrizada
db.Raw("SELECT * FROM users WHERE email = ?", email).Scan(&user)

// ❌ VULNERABLE: concatenación en Where
db.Where("name = '" + name + "'").Find(&users)

// ✅ SEGURO: placeholder
db.Where("name = ?", name).Find(&users)
```

### Go — Command Injection

```go
// ❌ VULNERABLE: input del usuario en exec
cmd := exec.Command("sh", "-c", "convert " + userFilename)

// ✅ SEGURO: argumentos separados, sin shell
cmd := exec.Command("convert", sanitizedFilename)
```

### Go — Path Traversal

```go
// ❌ VULNERABLE: path sin validar
filePath := filepath.Join("/uploads", userInput)
data, _ := os.ReadFile(filePath)

// ✅ SEGURO: validar que no escapa del directorio base
filePath := filepath.Join("/uploads", filepath.Base(userInput))
if !strings.HasPrefix(filepath.Clean(filePath), "/uploads/") {
    return errors.New("invalid path")
}
```

### Next.js — XSS

```tsx
// ❌ VULNERABLE: HTML sin sanitizar
<div dangerouslySetInnerHTML={{ __html: userComment }} />

// ✅ SEGURO: sanitizar con DOMPurify
import DOMPurify from 'isomorphic-dompurify'
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(userComment) }} />
```

### Astro — XSS

```astro
<!-- ❌ VULNERABLE: set:html con datos dinámicos -->
<div set:html={userProvidedContent} />

<!-- ✅ SEGURO: sanitizar antes -->
---
import DOMPurify from 'isomorphic-dompurify'
const clean = DOMPurify.sanitize(userProvidedContent)
---
<div set:html={clean} />
```

**Buscar:**
- `fmt.Sprintf` + `db.Raw` / `db.Exec`
- `exec.Command("sh", "-c", ...)` con variables
- `filepath.Join` con input sin validar `..`
- `dangerouslySetInnerHTML` sin DOMPurify
- `set:html` con datos del usuario

---

## A04:2021 — Insecure Design

**CWE asociados:** CWE-209, CWE-256, CWE-501, CWE-522

**Buscar en cualquier stack:**
- Falta de rate limiting en login/register/password-reset
- Password reset tokens sin expiración
- Enumeración de usuarios (respuestas diferentes para "user not found" vs "wrong password")
- Falta de verificación de email antes de activar cuenta
- Operaciones destructivas sin confirmación (delete sin soft-delete o confirmación)

---

## A05:2021 — Security Misconfiguration

**CWE asociados:** CWE-2, CWE-11, CWE-13, CWE-15, CWE-16, CWE-388

### Go

**Buscar:**
- Debug mode activo en producción
- Stack traces devueltos al cliente en respuestas de error
- CORS con `*` y credentials
- Endpoints de debug/profiling accesibles (`/debug/pprof/`)

### Next.js

**Buscar:**
- `next.config.js` sin security headers
- Source maps habilitados en producción (`productionBrowserSourceMaps: true`)
- Rewrites/redirects que exponen servicios internos

### nginx

**Buscar:**
- `server_tokens on`
- `autoindex on`
- Sin bloqueo de acceso a `.git/`, `.env`, `.htaccess`
- Versiones de PHP/Node expuestas en headers

→ Ver `references/nginx-hardening.md` para checklist completa.

---

## A06:2021 — Vulnerable and Outdated Components

**CWE asociados:** CWE-1035, CWE-1104

**Buscar:**
- `go.mod` con versiones de paquetes que tienen CVEs conocidos
- `package.json` con dependencias desactualizadas en áreas de seguridad (auth, crypto, parsing)
- Base images de Docker sin tag fijo (`:latest`)
- Lockfiles ausentes o no commiteados

**Paquetes Go conocidos por tener advisories frecuentes:**
- `golang.org/x/crypto` — mantener actualizado siempre
- `golang.org/x/net` — vulnerabilidades HTTP/2
- `github.com/dgrijalva/jwt-go` — deprecado, usar `github.com/golang-jwt/jwt/v5`

**Paquetes npm conocidos:**
- `jsonwebtoken` < 9.0.0 — múltiples advisories
- `lodash` < 4.17.21 — prototype pollution
- `express` — mantener actualizado
- `axios` < 1.6.0 — SSRF advisory

---

## A07:2021 — Identification and Authentication Failures

**CWE asociados:** CWE-255, CWE-259, CWE-287, CWE-288, CWE-306, CWE-307

### Go

**Buscar:**
- Tokens JWT sin expiración (`exp` claim ausente)
- JWT firmados con `HS256` y secret débil (< 32 bytes)
- Sesiones sin invalidación al cambiar password
- Login sin rate limiting ni lockout
- Comparación de passwords con `==` en vez de `subtle.ConstantTimeCompare`

### Next.js

**Buscar:**
- Tokens almacenados en `localStorage` (vulnerable a XSS)
- Session cookies sin flags `HttpOnly`, `Secure`, `SameSite`
- Auth check solo en client side (redirect condicional sin middleware server-side)

---

## A08:2021 — Software and Data Integrity Failures

**CWE asociados:** CWE-345, CWE-353, CWE-426, CWE-494, CWE-502, CWE-565

**Buscar:**
- Deserialización de datos no confiables sin validación
- CI/CD pipelines sin verificación de integridad de dependencias
- Falta de lockfiles commiteados
- `npm install` sin `--ignore-scripts` en CI
- Auto-updates sin verificación de firma
- Webhooks sin verificación de firma (HMAC)

---

## A09:2021 — Security Logging and Monitoring Failures

**CWE asociados:** CWE-117, CWE-223, CWE-532, CWE-778

### Go

**Buscar:**
- Login failures sin logging
- Cambios de permisos/roles sin audit trail
- Logging de passwords, tokens o PII (CWE-532)
- Falta de request ID en logs (dificulta correlación de incidentes)
- Errores silenciados (`_ = err`) en paths de seguridad

### Cualquier stack

**Buscar:**
- Falta total de logging estructurado
- Sin correlación de requests (request ID)
- Operaciones destructivas (delete, permission changes) sin log

---

## A10:2021 — Server-Side Request Forgery (SSRF)

**CWE asociados:** CWE-918

### Go

```go
// ❌ VULNERABLE: URL del usuario sin validar
url := r.URL.Query().Get("url")
resp, _ := http.Get(url) // puede acceder a 169.254.169.254, localhost, etc.

// ✅ SEGURO: whitelist de dominios o validación estricta
url := r.URL.Query().Get("url")
parsed, err := url.Parse(url)
if err != nil || !isAllowedHost(parsed.Host) {
    response.Error(w, http.StatusBadRequest, ...)
    return
}
```

### Next.js

```tsx
// ❌ VULNERABLE: fetch en Server Component con URL del usuario
const data = await fetch(searchParams.apiUrl) // SSRF

// ✅ SEGURO: construir URL internamente
const data = await fetch(`${process.env.API_URL}/resource/${id}`)
```

**Buscar:**
- `http.Get`, `http.Post`, `fetch` con URLs construidas desde input del usuario
- Falta de validación de host/scheme en URLs dinámicas
- Acceso a metadata endpoints de cloud (169.254.169.254)
