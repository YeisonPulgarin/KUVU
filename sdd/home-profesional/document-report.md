# Document report — home-profesional

Rama: `feat/home-profesional`. Fuentes: `propose`, `spec`, `design`, los 5 `apply-progress`
(incluidos los ajustes A1–A4 de `cierre.md`), `verify-report` (PASS con observaciones) y
`secure-report` (sin vulnerabilidades confirmadas). No hay `refine-report`.

```
docs_archivo: docs/home-profesional.md (creado)
architecture: actualizado: Clúster público (sitio multipágina, content/ con frontera del barrel, header sticky/compacto y menú móvil < 1024 px, footer por columnas, app-public-page, app-rich-text, app-service-icon, pages/*, PageMetaService ampliado, scroll-offset.ts + withInMemoryScrolling, breadcrumb sobre sitePages); Flujos principales (navegación pública con las 7 rutas; acceso con /acceder y /login lazy; `**` → 404 en lugar de /login); Decisiones estructurales (chrome con navegación única + app-public-page, meta en content/pages.ts, offset de anclas en runtime, contacto sin backend, rutas lazy); Límites y no-goals (sin el límite "sin legal/contacto"; empresa ficticia, og:image relativa, headers de hosting pendientes; deuda de chrome duplicado saldada; deuda de @angular/router con GHSA-ff3f-86qr-9cv3)
guidelines: sin cambios — el cambio no introduce convenciones nuevas (páginas en components/pages/*, piezas en components/public/*, textos en content/*.ts, sin logs)
openapi: no aplica: openapi_afectado: no — el sitio público no tiene endpoints HTTP; /contacto abre wa.me sin backend y el backend Express no se toca
collections: no aplica: sin endpoints nuevos ni modificados
changelog: entrada agregada bajo Unreleased — Added (multipágina con navegación única, /servicios, /contacto → WhatsApp con consentimiento, /legal con 4 documentos y nota académica, 404 pública, footer por columnas, SEO por página + JSON-LD, FAQ "Contacto y datos") y Changed (header sticky/compacto y menú móvil a pantalla completa, home como escaparate, lenguaje visual editorial con reduced motion, tuteo colombiano, `**` → 404 en lugar de /login)
readme: actualizado frontend/proyecto_angular/README.md (el README del proyecto; no hay README.md en la raíz): descripción con las rutas públicas, y en "Estructura del proyecto" page-meta.service, public/{public-page,breadcrumb,rich-text,service-icon}, pages/{servicios,contacto,legal,not-found} y scroll-offset.ts
desvios: ver abajo
```

## Qué se documentó

`docs/home-profesional.md`:

- Rutas `/`, `/servicios`, `/nosotros`, `/preguntas-frecuentes`, `/contacto`, `/legal` y 404
  (`**` lazy, `noindex`, no redirige a `/login`).
- Navegación única (`sitePages`/`siteNavLinks`/`breadcrumbFor`), header sticky y compacto,
  menú móvil a pantalla completa por debajo de 1024 px y el manejo de foco de CA-08.2 (vuelve
  al botón con Escape o con el botón; no al elegir un enlace), footer por columnas,
  `app-public-page`, `app-service-icon`, `app-rich-text`.
- Contenido en `content/*.ts` y la frontera del barrel (`legal.ts`/`contact.ts` fuera).
- Formulario de `/contacto` → WhatsApp: validaciones, consentimiento obligatorio, sin backend,
  sin almacenamiento ni logs, detección de pop-up bloqueado y corte de `opener`.
- `/legal`: 4 documentos y anclas, empresa ficticia (NIT, dirección y correo omitidos), nota de
  proyecto académico de la Universidad Cooperativa de Colombia, almacenamiento real del sitio.
- SEO (`PageMetaService`, `index.html`), anclas con el offset del `ViewportScroller`
  (`app/scroll-offset.ts`, no `scroll-padding-top`), reduced motion, tuteo.
- Limitaciones: SPA sin prerender y `og:image` relativa en `index.html`; variación de ~16 px
  del offset al entrar por URL directa; hover de `.origin-link`/`.faq-link` en claro 3.42 : 1
  (preexistente); "intro vista" a sumar en la política de cookies al integrar
  `feat/acceso-orden-e-intro`; textos legales sin validez jurídica; menú móvil sin WhatsApp.
- Roadmap: actualizar `@angular/router` (GHSA-ff3f-86qr-9cv3, solo SSR) y headers de seguridad
  (CSP con hash/nonce del script inline de tema, nosniff, Referrer-Policy, frame-ancestors) al
  definir el hosting; `og:image` absoluto con dominio de producción.

`sdd/home-profesional/design.md` (observaciones del verify):

- **O1:** §4 "Header compacto" y §7 describen el offset del `ViewportScroller` registrado con
  `provideAppInitializer` (`app/scroll-offset.ts`); `scroll-padding-top` queda solo para la
  navegación nativa a fragmento.
- **O2:** §4 "Menú móvil" declara el breakpoint de 1024 px y que el foco vuelve al botón solo
  con Escape o con el botón (CA-08.2); al elegir un enlace cierra `closeMenu(false)`.

## Qué se omitió y por qué

- OpenAPI y Bruno: `openapi_afectado: no`, sin endpoints HTTP.
- `DEVELOPMENT_GUIDELINES.md`: sin convenciones nuevas.
- README de la raíz: no existe; el README del proyecto es `frontend/proyecto_angular/README.md`.

## Desvíos entre `design.md` y el código (para el orquestador)

Los tres quedan corregidos en `design.md` por el orquestador, en un commit aparte posterior a
esta fase; el código y `docs/home-profesional.md` describen lo implementado.

- **§2 `responsible.ts` y marcadores:** el design describe campos `string | null`,
  `placeholderLabel` y `<mark class="placeholder">`. El código (A3) define NIT, dirección y
  correo como campos opcionales no definidos, sin marcadores: `RichText` acepta
  `prefix`/`suffix` y el segmento ausente se omite con su frase (`resolveRichText`,
  `isEmptyRichText`).
- **§6 envío:** el design dice `window.open(url, '_blank', 'noopener')`; el código abre sin la
  feature `noopener` (con ella `open` siempre devuelve `null` y no se detecta el bloqueo) y
  anula `opener` a mano (revisado en `secure-report`).
- **§1 `app.config.ts`:** el diagrama no muestra el `provideAppInitializer` del offset (lo
  describe §4).

## Commit

Ver el hash en el resultado de la fase (commit local `docs(home-profesional): ...`, sin push).
