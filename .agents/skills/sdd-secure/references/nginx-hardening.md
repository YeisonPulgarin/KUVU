# nginx Hardening — Checklist

Referencia para la skill `sdd-secure`. Checklist exhaustiva de configuración
segura de nginx, con snippets de configuración correcta.

---

## 1. TLS / SSL

### Checks

| Check | Buscar | Severidad si falla |
|-------|--------|-------------------|
| TLS 1.2+ solamente | `ssl_protocols` incluye `TLSv1` o `TLSv1.1` | High |
| Cipher suites fuertes | `ssl_ciphers` con DES, RC4, MD5, NULL, EXPORT | High |
| Forward secrecy | Falta `ssl_prefer_server_ciphers on` | Medium |
| OCSP Stapling | Falta `ssl_stapling on` | Low |
| DH parameters | Falta `ssl_dhparam` o usa < 2048 bits | Medium |
| Certificate chain | Falta `ssl_trusted_certificate` para OCSP | Low |

### Configuración correcta

```nginx
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384;
ssl_prefer_server_ciphers off;  # TLS 1.3 maneja esto, para 1.2 poner on
ssl_session_timeout 1d;
ssl_session_cache shared:SSL:10m;
ssl_session_tickets off;

# OCSP Stapling
ssl_stapling on;
ssl_stapling_verify on;
ssl_trusted_certificate /path/to/chain.pem;
resolver 1.1.1.1 8.8.8.8 valid=300s;
resolver_timeout 5s;

# DH parameters (generar con: openssl dhparam -out /etc/nginx/dhparam.pem 2048)
ssl_dhparam /etc/nginx/dhparam.pem;
```

---

## 2. Security Headers

### Checks

| Check | Buscar | Severidad si falla |
|-------|--------|-------------------|
| HSTS | Falta `Strict-Transport-Security` | High |
| X-Frame-Options | Falta `X-Frame-Options` | Medium |
| X-Content-Type-Options | Falta `X-Content-Type-Options` | Medium |
| Referrer-Policy | Falta `Referrer-Policy` | Low |
| Permissions-Policy | Falta `Permissions-Policy` | Low |
| CSP | Falta `Content-Security-Policy` | Medium |
| Server tokens | `server_tokens on` o ausente (default: on) | Low |

### Configuración correcta

```nginx
# Ocultar versión de nginx
server_tokens off;

# Headers de seguridad — agregar en server {} con 'always'
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-Frame-Options "DENY" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; frame-ancestors 'none'" always;
```

---

## 3. Access Control

### Checks

| Check | Buscar | Severidad si falla |
|-------|--------|-------------------|
| Directory listing | `autoindex on` | Medium |
| Sensitive files | Sin bloqueo de `.env`, `.git/`, `.htaccess` | High |
| Backup files | Sin bloqueo de `*.bak`, `*.sql`, `*.tar.gz` | Medium |
| PHP info/admin | Acceso abierto a `phpinfo()`, `/adminer`, `/phpmyadmin` | High |
| Hidden files | Sin bloqueo de dotfiles (`.DS_Store`, etc.) | Low |

### Configuración correcta

```nginx
# Bloquear archivos sensibles
location ~ /\.(?!well-known) {
    deny all;
    return 404;
}

# Bloquear acceso a .env
location ~ /\.env {
    deny all;
    return 404;
}

# Bloquear archivos de backup
location ~* \.(bak|sql|tar\.gz|zip|7z|rar|log)$ {
    deny all;
    return 404;
}

# Desactivar directory listing (default, pero explícito es mejor)
autoindex off;
```

---

## 4. Rate Limiting

### Checks

| Check | Buscar | Severidad si falla |
|-------|--------|-------------------|
| Rate limit global | Falta `limit_req_zone` | Medium |
| Rate limit en login | Login endpoint sin `limit_req` | High |
| Rate limit en API | API endpoints sin protección | Medium |
| Connection limit | Falta `limit_conn_zone` | Low |

### Configuración correcta

```nginx
# Definir zonas (en http {})
limit_req_zone $binary_remote_addr zone=login:10m rate=5r/m;
limit_req_zone $binary_remote_addr zone=api:10m rate=30r/s;
limit_conn_zone $binary_remote_addr zone=addr:10m;

# Aplicar en location
location /api/auth/login {
    limit_req zone=login burst=3 nodelay;
    limit_req_status 429;
    proxy_pass http://backend;
}

location /api/ {
    limit_req zone=api burst=50 nodelay;
    limit_req_status 429;
    limit_conn addr 100;
    proxy_pass http://backend;
}
```

---

## 5. Proxy Configuration

### Checks

| Check | Buscar | Severidad si falla |
|-------|--------|-------------------|
| Host header | Falta `proxy_set_header Host` | Medium |
| Real IP | Falta `proxy_set_header X-Real-IP` | Low |
| Protocol forwarding | Falta `proxy_set_header X-Forwarded-Proto` | Medium |
| Websocket sin auth | `proxy_pass` para websocket sin restricción | Medium |
| Upstream timeout | Sin `proxy_read_timeout` (default 60s puede ser mucho) | Low |
| Internal services | Servicios internos accesibles desde internet | High |

### Configuración correcta

```nginx
location /api/ {
    proxy_pass http://backend:8000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_read_timeout 30s;
    proxy_connect_timeout 10s;
    proxy_send_timeout 30s;
}

# Websockets (con path específico, no wildcard)
location /ws {
    proxy_pass http://backend:8000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_read_timeout 86400;
}
```

---

## 6. Buffer y Body Size

### Checks

| Check | Buscar | Severidad si falla |
|-------|--------|-------------------|
| Body size | `client_max_body_size` > 100m sin justificación | Medium |
| Body size ausente | Sin `client_max_body_size` (default 1m, pero explícito es mejor) | Low |
| Buffer overflow | `large_client_header_buffers` muy alto | Low |
| Temp files | `client_body_temp_path` en directorio sensible | Low |

### Configuración correcta

```nginx
# Limitar tamaño de request body (ajustar según necesidad)
client_max_body_size 10m;  # Para uploads: ajustar al máximo esperado

# Buffers razonables
client_body_buffer_size 16k;
client_header_buffer_size 1k;
large_client_header_buffers 4 16k;
```

---

## 7. HTTP → HTTPS Redirect

### Checks

| Check | Buscar | Severidad si falla |
|-------|--------|-------------------|
| HTTP redirect | Servidor escucha en 80 sin redirect a 443 | High |
| Redirect permanente | Usa `302` en vez de `301` para redirect SSL | Low |

### Configuración correcta

```nginx
server {
    listen 80;
    server_name example.com;
    return 301 https://$server_name$request_uri;
}
```

---

## 8. Information Disclosure

### Checks

| Check | Buscar | Severidad si falla |
|-------|--------|-------------------|
| Server version | `server_tokens on` | Low |
| PHP version | `X-Powered-By` header visible | Low |
| Error pages | Páginas de error default de nginx (exponen versión) | Low |
| Proxy errors | Errores de upstream devueltos raw al cliente | Medium |

### Configuración correcta

```nginx
server_tokens off;

# Custom error pages
error_page 404 /404.html;
error_page 500 502 503 504 /50x.html;
location = /50x.html {
    root /usr/share/nginx/html;
    internal;
}

# No pasar errores de upstream directamente
proxy_intercept_errors on;
```

---

## 9. Logging y Monitoreo

### Checks

| Check | Buscar | Severidad si falla |
|-------|--------|-------------------|
| Access log | `access_log off` en contextos sensibles | Medium |
| Error log | `error_log /dev/null` | Medium |
| Log format | Sin `$request_time` ni `$upstream_response_time` | Info |

### Configuración correcta

```nginx
# Log format con info útil para seguridad
log_format security '$remote_addr - $remote_user [$time_local] '
                    '"$request" $status $body_bytes_sent '
                    '"$http_referer" "$http_user_agent" '
                    '$request_time $upstream_response_time';

access_log /var/log/nginx/access.log security;
error_log /var/log/nginx/error.log warn;
```
