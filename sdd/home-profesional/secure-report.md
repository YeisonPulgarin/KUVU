## Seguridad — home-profesional

Alcance: rango `a94a5f9..HEAD` (rama `feat/home-profesional`). Sitio público Angular 21 (SPA
estática, sin SSR). El backend Express no forma parte del rango.

### Modelo de amenazas (resumen)

- **Activos / datos sensibles:** los datos que la persona escribe en `/contacto` (nombre,
  empresa, correo, teléfono, mensaje — PII de contacto); la integridad del DOM del sitio
  público (que nada se interprete como HTML/script); el aislamiento entre el sitio público y
  las rutas protegidas (`dashboard`, `contratos`, `pagos`, `mantenimiento`, `locales`,
  `usuarios`); el repo (secretos o datos de terceros reales).
- **Fronteras de confianza y puntos de entrada:**
  - Input del formulario `/contacto` → texto del mensaje → query `text` de `https://wa.me/`
    (destino de terceros, abierto en pestaña nueva).
  - URL del navegador (path y fragment) → router (`**` → 404) y scroll de anclas.
  - `document.location.origin` → `og:url`, `canonical`, JSON-LD.
  - Contenido tipado (`content/*.ts`) → `app-rich-text` y plantillas. Es contenido estático del
    propio repo, no input externo.
- **STRIDE-lite:**
  - *Tampering / XSS:* inyección de HTML desde el formulario, el contenido o la URL.
  - *Information disclosure:* persistencia o logueo de los datos del formulario; secretos o datos
    personales reales en el diff y en `sdd/*`.
  - *Elevation of privilege:* que una ruta pública nueva abra componentes protegidos.
  - *Spoofing / reverse tabnabbing:* la pestaña de WhatsApp manipulando `window.opener`.
  - *Denial of service:* irrelevante en el cliente (el único afectado es el propio visitante).

### Hallazgos por severidad

No hay vulnerabilidades confirmadas y alcanzables en el rango.

#### Higiene (SCA) — Bajo, no alcanzable

- Categoría: OWASP A06 (componentes vulnerables).
- Descripción: `npm audit --omit=dev` reporta un aviso *high* en `@angular/router`
  (GHSA-ff3f-86qr-9cv3, DoS por parámetros de matriz numéricos) que afecta **solo a Angular SSR**.
  El proyecto no usa SSR (no hay `@angular/ssr` ni `platform-server`): el router corre en el
  navegador del propio visitante.
- Estado: no se corrige en esta fase. `package.json` / `package-lock.json` no cambian en este
  rango; la actualización es un cambio de dependencias independiente (`npm audit fix`, parche
  menor dentro de `^21.2.x`).
- ¿Cambia comportamiento observable?: no.

### Controles revisados y confirmados correctos

- **URL de WhatsApp (`buildWhatsAppLink`, `content/site.ts`):** el número es una constante del
  repo; el único dato del usuario es el texto, codificado con `encodeURIComponent`. No hay forma de
  alterar el host, el path ni agregar parámetros. El `[href]` del enlace de respaldo pasa además
  por el sanitizer de URLs de Angular (esquema `https:`).
- **`window.open` + corte de `opener` (`contacto.component.ts`):** se abre sin la feature
  `noopener` para poder detectar el bloqueo (resultado `null`), y `opener` se anula de forma
  síncrona, mientras la pestaña todavía es `about:blank` del mismo origen. Cubierto por el test
  "should cut the opener of the new tab". Los `<a target="_blank">` llevan `rel="noopener"`.
- **Validaciones:** son de UX (no hay backend que confíe en ellas); el destino es un chat humano.
  El consentimiento es obligatorio (`requiredTrue`) antes de abrir WhatsApp.
- **Sin persistencia ni logs:** el formulario no escribe en `localStorage`/`sessionStorage` ni en
  consola; cubierto por el test "should neither store the data in the browser nor log it".
  `buildContactMessage` es pura.
- **`app-rich-text`:** solo interpolación (`{{ }}`) y `routerLink`/`fragment` desde contenido
  estático; no hay `innerHTML`, `bypassSecurityTrust*` ni `document.write` en ningún archivo del
  rango (el `document.write` de `pagos.component.ts` está fuera del rango).
- **`PageMetaService`:** el JSON-LD se escribe con `textContent` sobre un `<script>` creado por
  DOM, así que no hay parsing HTML; los datos son estáticos. `og:url`/`canonical` usan
  `location.origin` + paths estáticos: el visitante solo puede afectar su propio DOM, y los
  crawlers que no ejecutan la SPA leen los defaults estáticos de `index.html`.
- **Rutas (`app.routes.ts`):** las páginas nuevas son lazy y públicas; las rutas protegidas
  conservan su `canActivate` (`authGuard` / `adminGuard`); `**` carga el 404 público, que solo
  enlaza a páginas públicas y no refleja la URL pedida. La autorización real vive en el backend
  (fuera del rango).
- **`scroll-offset.ts`:** solo mide el header; el fragment lo resuelve el router, no se usa como
  selector ni se inyecta.
- **Secretos y datos de terceros:** búsqueda por patrones (password, token, api key, bearer,
  cadenas de conexión, llaves privadas, prefijos de llaves de nube/GitHub, correos con dominio)
  sobre todo el diff, incluidos `sdd/*`: sin coincidencias reales. El único correo es
  `ana@example.com` en tests (dominio reservado). El teléfono publicado es el mismo número de
  WhatsApp que ya existía en `content/site.ts` antes del rango; `responsible.ts` omite a
  propósito NIT, dirección física y correo.

### Hallazgos descartados (security theater o fuera del modelo)

- **`maxlength` en los campos / límite del mensaje:** un mensaje enorme solo produce una URL larga
  en el navegador del propio visitante; no hay servidor propio que consumir. Agregarlo no reduce
  riesgo y cambia comportamiento (rechazaría input hoy aceptado).
- **Validación más estricta de nombre/mensaje (caracteres "peligrosos"):** el texto termina
  codificado en una URL y leído por una persona en WhatsApp; no hay sink HTML ni SQL. Filtrar
  rompería datos legítimos.
- **`rel="noreferrer"` en los enlaces a WhatsApp:** con la política por defecto
  `strict-origin-when-cross-origin`, wa.me solo recibe el origen del sitio, que no es sensible.
- **Texto del mensaje en la query de wa.me / historial del navegador:** es el diseño explícito del
  canal (spec), aceptado con el consentimiento; wa.me es el destinatario previsto.
- **CSRF / rate limiting / captcha en `/contacto`:** no hay endpoint propio, sesión ni envío al
  servidor; no hay amenaza que mitigar.
- **`og:url`/`canonical` desde `location.origin`:** sin vector — el valor depende del origen
  desde el que se sirve la app, no de input controlable por un tercero.

### Acciones fuera del código (obligatorio marcar)

- Secretos a ROTAR: ninguno.
- Dependencias a actualizar (SCA): `@angular/router` (aviso solo-SSR, no alcanzable) — actualizar
  en un cambio de dependencias aparte.
- Configuración / infra a endurecer (hardening, cuando se defina el hosting): servir con
  `Content-Security-Policy` (el script inline de tema de `index.html` necesita hash o nonce),
  `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin` y
  `frame-ancestors 'none'`. Hoy no hay configuración de hosting en el repo.

### Riesgo residual aceptado

- Ninguno que requiera aceptación explícita: no hay vulnerabilidades confirmadas abiertas.

### Alcance de la búsqueda

- Revisión manual de `contacto/*`, `content/site.ts`, `content/responsible.ts`,
  `public/rich-text`, `services/page-meta.service.ts`, `app.routes.ts`, `scroll-offset.ts`,
  `not-found`, `index.html` y el diff del header.
- Grep de sinks peligrosos (`innerHTML`, `bypassSecurityTrust*`, `outerHTML`,
  `insertAdjacentHTML`, `eval`, `new Function`, `document.write`, storage y `console.*`) sobre
  `src/app`.
- Secret scanning por patrones sobre `git diff a94a5f9..HEAD` (código y `sdd/*`).
- SCA con `npm audit --omit=dev`.
- Fuera de alcance: backend Express, flujo autenticado y su almacenamiento en `localStorage`,
  historial de git anterior a `a94a5f9`, DAST (no hay endpoints propios en el rango).
- Un scan limpio no prueba la ausencia de vulnerabilidades.
