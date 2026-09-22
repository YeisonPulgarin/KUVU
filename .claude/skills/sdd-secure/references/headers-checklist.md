# Headers HTTP de Seguridad — Checklist

Referencia para la skill `sdd-secure`. Tabla completa de headers de seguridad
con valores recomendados y dónde configurarlos por stack.

---

## Headers obligatorios

| Header | Valor recomendado | Protección | CWE |
|--------|-------------------|-----------|-----|
| `Content-Security-Policy` | Ver sección dedicada abajo | XSS, data injection, clickjacking | CWE-79 |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains; preload` | Downgrade attacks, cookie hijacking | CWE-319 |
| `X-Content-Type-Options` | `nosniff` | MIME sniffing attacks | CWE-16 |
| `X-Frame-Options` | `DENY` o `SAMEORIGIN` | Clickjacking | CWE-1021 |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Information leakage via Referer | CWE-200 |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` | Restricción de APIs del browser | CWE-16 |

## Headers recomendados

| Header | Valor recomendado | Protección | Notas |
|--------|-------------------|-----------|-------|
| `X-XSS-Protection` | `0` | Desactiva filtro XSS del browser (puede causar side-channel leaks) | Browsers modernos lo ignoran, pero `0` es el safe default |
| `Cross-Origin-Opener-Policy` | `same-origin` | Spectre-like attacks, window.opener abuse | Requerido para `SharedArrayBuffer` |
| `Cross-Origin-Resource-Policy` | `same-origin` | Previene carga cross-origin de recursos | Puede romper CDN — evaluar caso a caso |
| `Cross-Origin-Embedder-Policy` | `require-corp` | Spectre isolation | Requerido para `SharedArrayBuffer` junto con COOP |

---

## Content-Security-Policy (CSP) — Guía detallada

### Política base recomendada

```
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self' {API_URL}; frame-ancestors 'none'; base-uri 'self'; form-action 'self'
```

### Directivas clave

| Directiva | Valor seguro | Qué evita si se usa `*` o `unsafe-*` |
|-----------|-------------|--------------------------------------|
| `default-src` | `'self'` | Fallback para todo lo no especificado |
| `script-src` | `'self'` (idealmente con nonces) | XSS via inyección de scripts |
| `style-src` | `'self' 'unsafe-inline'` (Tailwind necesita inline) | Inyección de estilos maliciosos |
| `img-src` | `'self' data: https:` | Exfiltración de datos via image src |
| `connect-src` | `'self' {api-url}` | Data exfiltration via fetch/XHR |
| `frame-ancestors` | `'none'` | Clickjacking (reemplaza X-Frame-Options) |
| `base-uri` | `'self'` | Base tag injection (redirect de scripts) |
| `form-action` | `'self'` | Form hijacking |
| `object-src` | `'none'` | Flash/Java plugin injection |

### Indicadores de CSP débil

| Pattern | Severidad | Problema |
|---------|-----------|----------|
| `unsafe-inline` en `script-src` | High | Permite cualquier inline script (XSS trivial) |
| `unsafe-eval` en `script-src` | High | Permite `eval()`, `Function()` (code injection) |
| `*` en `script-src` | Critical | Permite cargar scripts de cualquier dominio |
| `data:` en `script-src` | High | Permite scripts en data URIs |
| `http:` en cualquier directiva | Medium | Mixed content, downgrade possible |
| CSP ausente | Medium | Sin protección contra XSS vía CSP |

---

## Configuración por stack

### nginx

```nginx
# En el bloque server {} o location {}
add_header Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'" always;
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-Frame-Options "DENY" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;

# Ocultar versión
server_tokens off;
```

### Next.js (next.config.ts)

```typescript
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'Content-Security-Policy', value: "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self' ${process.env.NEXT_PUBLIC_API_URL}; frame-ancestors 'none'; base-uri 'self'; form-action 'self'" },
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains; preload' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ]
  },
}
```

### Astro (middleware o adapter)

```typescript
// src/middleware.ts (Astro SSR)
import { defineMiddleware } from 'astro:middleware'

export const onRequest = defineMiddleware(async (context, next) => {
  const response = await next()
  response.headers.set('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; frame-ancestors 'none'")
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  return response
})
```

Para Astro estático (sin SSR), los headers se configuran en el servidor (nginx) o en la plataforma de hosting.

### Go (middleware)

```go
func SecurityHeaders(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        w.Header().Set("Content-Security-Policy", "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'")
        w.Header().Set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload")
        w.Header().Set("X-Content-Type-Options", "nosniff")
        w.Header().Set("X-Frame-Options", "DENY")
        w.Header().Set("Referrer-Policy", "strict-origin-when-cross-origin")
        w.Header().Set("Permissions-Policy", "camera=(), microphone=(), geolocation=()")
        next.ServeHTTP(w, r)
    })
}
```

---

## CORS — Configuraciones problemáticas

| Configuración | Severidad | Problema |
|---------------|-----------|----------|
| `Access-Control-Allow-Origin: *` + `Access-Control-Allow-Credentials: true` | Critical | Wildcard con credentials permite que cualquier sitio haga requests autenticados |
| `Access-Control-Allow-Origin: *` (sin credentials) | Low/Info | Aceptable para APIs públicas sin auth |
| Origin reflejado sin whitelist | High | Cualquier origin se acepta (equivalente a `*` pero con credentials) |
| `Access-Control-Allow-Methods: *` | Medium | Expone métodos que podrían no estar implementados de forma segura |
| `Access-Control-Allow-Headers: *` | Medium | Permite headers custom que podrían bypassear protecciones |
| `Access-Control-Max-Age` muy alto | Low | Preflight cacheado por mucho tiempo dificulta revocación |

### Go — CORS correcto

```go
func CORSMiddleware(allowedOrigins []string) func(http.Handler) http.Handler {
    return func(next http.Handler) http.Handler {
        return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
            origin := r.Header.Get("Origin")
            if isAllowed(origin, allowedOrigins) {
                w.Header().Set("Access-Control-Allow-Origin", origin)
                w.Header().Set("Access-Control-Allow-Credentials", "true")
                w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
                w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
                w.Header().Set("Access-Control-Max-Age", "86400")
            }
            if r.Method == http.MethodOptions {
                w.WriteHeader(http.StatusNoContent)
                return
            }
            next.ServeHTTP(w, r)
        })
    }
}
```
