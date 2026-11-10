# init (refresco) — app-interna-ux

`sdd/sdd-init.md` existe y no se regenera. Este archivo registra solo lo que el cambio
`app-interna-ux` necesita saber del contexto y que `sdd-init.md` no dice.

```
stack: Angular 21 (standalone, signals) + Tailwind v4 + SCSS / Node.js + Express / MariaDB 10.4 (Docker kuvu_db)
test_command:
  frontend: ng test --watch=false --browsers=ChromeHeadless (CHROME_BIN fijado en Windows), desde frontend/proyecto_angular
  backend: npm test (node --test), desde backend/
test_mode: test-after (declarado en sdd.config.md y confirmado por el usuario para este cambio)
config_found: true
slices_declarados: [backend-orden, contenido, chrome, paginas, home, intro, cierre]
expone_api_http: true (API REST interna /api/*; sdd.config.md declara OpenAPI "No aplica")
docs_existentes: docs/, docs/architecture.md, CHANGELOG.md, README.md (sin docs/api/openapi.yaml ni docs/collections/)
almacenamiento: files
umbral_riesgo: 300 líneas, ask-on-risk
```

## Hallazgos de init relevantes para este cambio

- **Ningún slice declarado cubre la app interna** (`components/{dashboard,contratos,pagos,
  mantenimiento,locales,usuarios}`, `components/shared/{sidebar,shared.styles.scss}`,
  `services/data.service.ts`). `intro` cubre `src/app/services/` pero su dominio es el acceso.
  Hay que declarar un slice nuevo antes de `tasks` (pregunta del Gate A).
- **Cobertura de tests de la app interna: nula.** Ningún componente de la app interna tiene
  `.spec.ts`; el único spec en `shared/` relacionado es `navbar.component.spec.ts`, y
  `app-navbar` no se usa en ninguna plantilla (código muerto). `data.service.ts`,
  `auth.service.ts`, `sidebar.service.ts` y `auth.guard.ts` tampoco tienen specs.
- **`DEVELOPMENT_GUIDELINES.md` es la plantilla genérica** (secciones Go / Next.js / Astro):
  no describe la estructura Angular del proyecto. La política de logs aplica igual
  (sección "Logging & Observability").
- **Concurrencia:** `sitio-publico-expresivo` está en implementación en el mismo working tree
  y toca `src/styles.css` y `src/styles.scss` (nuevo `@use` de `_site.scss`). Este cambio
  explora sobre un worktree de solo lectura en el scratchpad, desde `fix/tema-claro-tokens`.
