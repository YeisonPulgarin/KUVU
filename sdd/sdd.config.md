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
| 2 | `intro` | Frontend Angular: componentes, servicios y estilos (`frontend/proyecto_angular/src/app/`) + tests Karma | Sí, si el cambio toca el frontend |
| — | `cierre` | Config SDD (`sdd.config.md`, `sdd-init.md`) al último slice | Sí |

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
