# Categorías de vulnerabilidad como lentes

Basadas en OWASP Top 10 y CWE-SANS Top 25. Cada lente trae el **patrón de fix correcto** y el
**gotcha** que hace que devs y agentes lo apliquen mal.

## Inyección — SQLi, NoSQLi, Command, LDAP

- **Fix correcto:** separar **código de datos**. SQL → consultas parametrizadas / prepared
  statements, siempre. Comandos → evitar el shell; API con argumentos como lista, nunca
  concatenación. NoSQL → operadores y binding seguros, no interpolar objetos del usuario.
- **Gotcha:** "sanitizar" el input **no** es la defensa principal contra inyección — la
  parametrización lo es, la validación es defensa en profundidad. Concatenar SQL "escapado a
  mano" es un bug esperando a pasar.

## XSS — inyección en contexto HTML/JS

- **Fix correcto:** *output encoding sensible al contexto* en cada sink. HTML body, atributo,
  JS, URL y CSS tienen encodings distintos. Preferí frameworks que auto-escapan. **CSP** como
  defensa en profundidad.
- **Gotcha:** reflected, stored y DOM-based tienen superficies distintas. El DOM-XSS ocurre en
  el cliente y el SAST de servidor no lo ve. Encodeá en el punto de salida, no "limpies" al entrar.

## Broken Access Control / IDOR

- **Fix correcto:** autorización **a nivel de objeto**, en el **servidor**, en **cada** request.
  Verificá que el actor autenticado tiene derecho sobre *ese recurso concreto*, no solo que
  está logueado. Deny-by-default.
- **Gotcha:** es la vulnerabilidad más común y más impactante, y la que las herramientas peor
  detectan. IDOR es falta de autorización a nivel de objeto (`GET /invoice/123` sin comprobar
  que 123 es tuyo). Nunca confíes en IDs ocultos, en la oscuridad, ni en checks del cliente.

## Autenticación y gestión de sesiones

- **Fix correcto:** hashing de contraseñas con **argon2id, bcrypt o scrypt** — nunca MD5 ni SHA
  plano. MFA donde aplique. Tokens de sesión con entropía suficiente (CSPRNG). Cookies con
  **HttpOnly, Secure, SameSite**. Regenerar la sesión tras el login (anti session-fixation).
  Expiración e invalidación correctas.
- **Gotcha:** no ruedes tu propio esquema. Forzar rotación periódica de contraseñas ya **no** es
  buena práctica (NIST) — eso es theater. Sí hace falta **rate limiting / lockout** en los
  endpoints de auth contra brute force y credential stuffing.

## Cryptographic failures / exposición de datos sensibles

- **Fix correcto:** TLS en tránsito, sin excepciones para datos sensibles. Cifrado en reposo
  para datos clasificados. Algoritmos vigentes vía librerías vetadas. Aleatoriedad con
  **CSPRNG**, nunca `rand()` para tokens o claves. Gestión de claves separada de los datos.
- **Gotcha:** no inventes cripto. No loguees ni expongas datos sensibles "por debug". Minimizá
  lo que almacenás: lo que no guardás no se filtra.

## Secretos hardcodeados — ciclo de vida completo

- **Fix correcto:** los secretos salen del código → vault, gestor de secretos o variables de
  entorno inyectadas. Rotación y expiración.
- **Gotcha crítico:** **un secreto que estuvo en el código ya está comprometido.** Borrarlo del
  archivo NO es el fix: sigue en el historial de git. El fix es (1) **rotar** la credencial,
  (2) purgar el historial, (3) mover a vault. Marcalo siempre para rotación.

## CSRF

- **Fix correcto:** **SameSite** en cookies + tokens anti-CSRF (double-submit o sincronizado) en
  operaciones con estado.
- **Gotcha:** aplica sobre todo a auth basada en **cookies**. Con bearer tokens en header el
  vector cambia. No agregues tokens CSRF donde no hay sesión por cookie (theater), ni los omitas
  donde sí la hay.

## Deserialización insegura / integridad de software y datos

- **Fix correcto:** no deserialices datos no confiables en objetos ejecutables. Usá formatos de
  datos seguros (JSON con parser estricto) en vez de serialización nativa de objetos. Verificá
  integridad y firma de datos y artefactos.
- **Gotcha:** incluye la integridad del pipeline — CI/CD, actualizaciones sin firmar,
  dependencias adulteradas.

## Security misconfiguration

- **Fix correcto:** endurecer defaults, desactivar debug y verbose en producción, minimizar
  superficie (features, puertos, servicios innecesarios), **CORS** restrictivo, **security
  headers** (HSTS, X-Content-Type-Options, etc.), permisos correctos.
- **Gotcha:** los mensajes de error verbosos y los stack traces devueltos al cliente son fugas
  de información. Ver `arquitectura-segura.md` → Fail Secure.

## Componentes vulnerables o desactualizados (supply chain)

- **Fix correcto:** **SCA** en cada build, versiones fijadas, actualizaciones, monitoreo de
  advisories (CVE). Verificá la procedencia de las dependencias.
- **Gotcha:** una dependencia transitiva vulnerable te compromete igual que una directa.

## SSRF — Server-Side Request Forgery

- **Fix correcto:** **allowlist** de destinos para las requests salientes que inicia el
  servidor. Bloqueá rangos internos y los **endpoints de metadatos de cloud** (por ejemplo
  `169.254.169.254`). Segmentación de red.
- **Gotcha:** crítico en arquitecturas cloud y de microservicios — el metadata endpoint expone
  credenciales de instancia.

## Logging & monitoring failures

Sin detección, un ataque en curso pasa invisible. Registrá eventos de seguridad **sin**
registrar secretos ni PII. Ver `arquitectura-segura.md` → Logging y auditoría.
