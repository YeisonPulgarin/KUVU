# Configuración SDD — KUVU

## Identidad

- **Proyecto:** KUVU
- **Idioma de trabajo:** español
- **Stack:** Angular 21 + Tailwind CSS v4 / Node.js + Express (API REST `/api/*` consumida por el SPA) / MariaDB 10.4 en Docker (contenedor `kuvu_db`)

## Extensiones activas

- [ ] `validate`
- [ ] `analyze`
- [ ] `branch`
- [ ] `git`

## Slices de `apply`

| Orden | Slice | Qué cubre | Obligatorio |
|---|---|---|---|
| 1 | `backend-orden` | Rutas del backend Express (`backend/routes/`) + tests `node --test` | Sí, si el cambio toca el backend |
| 2 | `contenido` | Módulos de contenido del sitio público (`content/*.ts`) + tests de contenido | Sí, si el cambio toca textos o datos del sitio |
| 3 | `chrome` | Chrome compartido del sitio: `PageMetaService`, `app.config.ts`, `app.routes.ts` (flags de ruta como `data.publicSite`), `index.html`, `styles.scss`, `styles/_motion.scss`, `app/motion/`, header, footer, `app-public-page`, `app-rich-text`, `app-service-icon` | Sí, si el cambio toca piezas compartidas |
| 4 | `paginas` | Páginas públicas internas (`components/pages/*`) + rutas lazy (`app.routes.ts`) | Sí, si el cambio agrega o modifica páginas |
| 5 | `home` | Home (`components/home/`) y migración de páginas existentes al chrome compartido | Sí, si el cambio toca la home |
| 6 | `intro` | Frontend Angular del acceso: `/acceder`, intro, `/login`, servicios de `src/app/services/` + tests Karma | Sí, si el cambio toca el acceso o sus servicios |
| 7 | `app` | App interna (admin/arrendatario): `components/{dashboard,locales,contratos,pagos,mantenimiento,usuarios}`, piezas compartidas de `components/shared/` (layout, modal, confirmación, toasts, íconos, skeleton, conteo, escalonado, sidebar), `shared.styles.scss`, `services/data.service.ts` y el contraste de marca de `auth.service.ts` + tests Karma | Sí, si el cambio toca la app interna |
| — | `cierre` | Config SDD (`sdd.config.md`, `sdd-init.md`) al último slice | Sí |

Orden por dependencia: `home` va después de `paginas` cuando la home enlaza páginas nuevas.

## Modalidad de tests

- [ ] `tdd`
- [x] `test-after` — implementación primero, tests escritos antes de cerrar el slice.

Comandos de test:

- `frontend`: en Windows, fijar el binario de Chrome antes de correr:
  `$env:CHROME_BIN='C:\Program Files\Google\Chrome\Application\chrome.exe'`, luego
  `npx ng test --watch=false --browsers=ChromeHeadless` desde `frontend/proyecto_angular`.
- `backend`: `npm test` desde `backend/` (`node --test`, sin base de datos: los tests de rutas
  reemplazan `db` por un doble).

## Documentación

- **Documento por cambio:** `docs/{change-name}.md`
- **Architecture:** `docs/architecture.md`
- **Guidelines:** `DEVELOPMENT_GUIDELINES.md`
- **Spec OpenAPI:** No aplica — no expone API HTTP al público
- **Changelog:** `CHANGELOG.md`
- **Readme:** `README.md`

El proyecto no expone una API HTTP pública.

## Almacenamiento de artifacts

- **Modo:** `files`

## Umbral de riesgo

- **Líneas cambiadas que disparan "riesgo alto":** 300
- **Estrategia de entrega default:** `ask-on-risk`
