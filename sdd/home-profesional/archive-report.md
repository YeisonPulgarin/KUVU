# Archive report — home-profesional

Estado: **cerrado**. Rama `feat/home-profesional` (desde `main` a94a5f9), commits locales sin
push, sin PR ni merge. Almacenamiento de artifacts: `files` (sin memoria compartida que
sincronizar). Extensión `git` inactiva: el push y el PR son pasos manuales del usuario.

## Secretos a rotar

**Ninguno** (`secure-report.md`: sin secretos ni datos de terceros en el diff).

## Qué se hizo

El sitio público de KUVU es multipágina con navegación única: `/`, `/servicios`, `/nosotros`,
`/preguntas-frecuentes`, `/contacto`, `/legal` y una 404 pública (`**` ya no redirige a
`/login`).

- Header sticky que se compacta al hacer scroll, página activa con `aria-current` y menú
  móvil a pantalla completa (< 1024 px) con Escape, bloqueo de scroll y foco.
- Footer por columnas (marca, Sitio, Legal, Contacto) con la nota de proyecto académico.
- `/contacto`: formulario que arma el mensaje y abre WhatsApp, sin backend ni
  almacenamiento, con autorización de datos obligatoria.
- `/legal`: tratamiento de datos (Ley 1581 de 2012, Decreto 1377 de 2013), aviso de
  privacidad, términos de uso y cookies/almacenamiento local, con índice y anclas.
- Lenguaje editorial (secciones numeradas, enlaces con flecha), reduced motion en todo
  movimiento nuevo, tuteo colombiano en todo el sitio público.
- SEO: meta por página, Open Graph, Twitter card, canonical, robots en la 404, JSON-LD
  Organization + WebSite en la home.
- `/acceder` y `/login` con carga diferida; bundle inicial 421.41 kB (presupuesto 500 kB).

## Decisiones

| Decisión | Dónde |
|---|---|
| Multipágina, las 4 legales en una sola `/legal` | Gate A (usuario) |
| "Ingresar" como único CTA principal; "Contactar" secundario | `propose.md` D3 |
| Beneficios por rol solo en `/servicios`; `app-public-page` también en nosotros y FAQ | Design (usuario) |
| Un solo PR con un commit por slice; el usuario aprueba superar el umbral de 300 líneas | Gate C, `tasks.md` |
| `legal.ts` y `contact.ts` fuera del barrel para no inflar el bundle inicial | `design.md` §2 |
| KUVU como empresa ficticia: sin NIT, dirección ni correo; nota de proyecto académico de la Universidad Cooperativa de Colombia | `spec.md` HP-13 (usuario) |
| Tuteo colombiano, sin voseo (con test de regresión) | `spec.md`, `cierre.md` A1 |
| Offset del `ViewportScroller` medido sobre el header para las anclas | `cierre.md` A4 |
| Gate E: `secure` sí, `refine` no | Usuario |

## Verificación y seguridad

- `verify` (segunda corrida): **PASS con observaciones**, 69/69 CAs, 309/309 tests, build en
  verde. La primera corrida dio FAIL por las anclas de `/legal` bajo el header; se corrigió en
  el ajuste A4.
- `secure`: sin vulnerabilidades confirmadas; sin fixes. Riesgo residual aceptado: ninguno.
- `refine`: no se corrió (declinado por el usuario).

## Documentación (de `document-report.md`)

- `docs/home-profesional.md` (nuevo): documento del cambio.
- `docs/architecture.md`: clúster público multipágina, componentes nuevos, 404, scroll offset,
  rutas lazy de acceso, deuda de chrome duplicado saldada.
- `CHANGELOG.md`: entrada bajo `[Unreleased]` (Added, Changed).
- `frontend/proyecto_angular/README.md`: rutas públicas y estructura (no hay README en la raíz).
- OpenAPI y Bruno: **no aplica** (el cambio no toca endpoints HTTP).
- `DEVELOPMENT_GUIDELINES.md`: **no aplica** (sin convenciones nuevas).

## Pendientes fuera de este cambio

1. **Integración con `feat/acceso-orden-e-intro`** (cambio pausado en `verify`, con un defecto
   reportado por el usuario: el sonido de la intro es inaudible y la transición de la hoja es
   imperceptible):
   - sumar la entrada "intro vista" a la política de cookies de `/legal` (esa rama la guarda
     en `localStorage`);
   - resolver a mano el conflicto de la tabla de slices de `sdd/sdd.config.md` (y la línea de
     stack / `expone_api_http` de `sdd-init.md`, que esa rama corrige).
2. **Actualizar `@angular/router`** (GHSA-ff3f-86qr-9cv3, DoS solo en SSR; no alcanzable hoy)
   en un cambio de dependencias aparte.
3. **Headers de seguridad al definir hosting:** CSP (con hash o nonce para el script inline de
   tema de `index.html`), `X-Content-Type-Options: nosniff`, `Referrer-Policy` y
   `frame-ancestors 'none'`.
4. **Hover de `.origin-link` y `.faq-link` en tema claro** a 3.42 : 1 (preexistente, fuera de
   alcance).
5. Limitaciones conocidas documentadas en `docs/home-profesional.md`: `og:image` relativo sin
   dominio de producción, ~16 px de variación al entrar a un ancla por URL directa, menú móvil
   sin WhatsApp, textos legales sin validez jurídica.

## Siguiente paso manual (usuario)

Push de `feat/home-profesional` y apertura del PR hacia `main` (un solo PR, commits por
slice). Título sugerido: `feat(sitio): sitio público multipágina con legales, contacto y SEO`.

## Artifacts

`explore.md`, `propose.md`, `spec.md`, `design.md`, `tasks.md`,
`apply-progress/{contenido,chrome,paginas,home,cierre}.md`, `verify-report.md`,
`secure-report.md`, `document-report.md`, `archive-report.md` — todos en
`sdd/home-profesional/` y consistentes entre sí.
