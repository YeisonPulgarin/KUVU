# Configuración SDD — KUVU

## Identidad

- **Proyecto:** KUVU
- **Idioma de trabajo:** español
- **Stack:** Angular 21 + Tailwind CSS v4 / Node.js backend / PostgreSQL

## Extensiones activas

- [ ] `validate`
- [ ] `analyze`
- [ ] `branch`
- [ ] `git`

## Slices de `apply`

| Orden | Slice | Qué cubre | Obligatorio |
|---|---|---|---|
| 1 | `contenido` | Módulos de contenido del sitio público (`content/*.ts`) + tests de forma | Sí |
| 2 | `chrome` | ThemeService, RevealDirective, SiteHeader/SiteFooter, PageMetaService, home refactorizada | Sí |
| 3 | `home-expandida` | Secciones nuevas de la home (cómo funciona, beneficios, seguridad, origen, FAQ) | Sí |
| 4 | `paginas` | Páginas `/nosotros` y `/preguntas-frecuentes` + rutas lazy | Sí |
| — | `cierre` | Config de tests en `sdd.config.md` + docs/CHANGELOG/README (al último slice) | Sí |

## Modalidad de tests

- [ ] `tdd`
- [x] `test-after` — implementación primero, tests escritos antes de cerrar el slice.

Comandos de test:

- `frontend`: en Windows, fijar el binario de Chrome antes de correr:
  `$env:CHROME_BIN='C:\Program Files\Google\Chrome\Application\chrome.exe'`, luego
  `npx ng test --watch=false --browsers=ChromeHeadless` desde `frontend/proyecto_angular`.

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
