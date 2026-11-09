# init — auth-contrasenas

`sdd/sdd-init.md` existe y no se regenera. Este artifact lo complementa con lo que el cambio
necesita y que el init global no registra (el init global describe sobre todo el frontend).

```
stack: Angular 21 + Tailwind v4 (frontend/proyecto_angular) / Node.js 22.20 + Express 4 + mysql2 (backend/) / MariaDB 10.4.34 en Docker (contenedor kuvu_db, BD bd_arrendamientos)
test_command:
  backend:  npm test desde backend/  (node --test; los tests de rutas reemplazan db por un doble vía require.cache)
  frontend: $env:CHROME_BIN=...chrome.exe; npx ng test --watch=false --browsers=ChromeHeadless desde frontend/proyecto_angular
test_mode: test-after (declarado en sdd.config.md y confirmado por el usuario)
config_found: true
slices_declarados: [backend-orden, contenido, chrome, paginas, home, intro, cierre]
expone_api_http: true (API REST interna /api/*, consumida solo por el SPA; sin OpenAPI por config)
docs_existentes: docs/ (incluye architecture.md), CHANGELOG.md, README.md no existe en la raíz, DEVELOPMENT_GUIDELINES.md
```

## Hallazgos de init

- `sdd-init.md` declara `stack: Angular 21, TypeScript, RxJS` y `test_command: ng test`: no
  menciona el backend ni `npm test`. Para este cambio, el backend es el centro. Actualizarlo
  corresponde al slice `cierre` (no se toca desde esta fase: trabajo en solo lectura).
- Slices relevantes de `sdd.config.md`: `backend-orden` (rutas Express + `node --test`),
  `intro` (`/login` y servicios de `src/app/services/` + Karma). La pantalla `usuarios` de la
  app interna no cae en ningún slice declarado; `app-interna-ux` agrega en su worktree un slice
  `app` (pantallas internas, `data.service.ts`, `auth.service.ts`). Ver `explore.md`.
- La migración de BD (`db/`) tampoco tiene slice propio; lo más cercano es `backend-orden`.
- Dependencias backend: `cors`, `express`, `mysql2` (+ `nodemon` dev). No hay librería de hash
  ni de tokens instalada.
- Toolchain Windows: Node 22.20.0, npm 10.9.3, Python 3.12; no hay compilador MSVC (`cl`), así
  que un paquete nativo sin binario precompilado no podría construirse con node-gyp.
- El usuario de la app `kuvu_app` tiene `ALL PRIVILEGES` sobre `bd_arrendamientos` (puede
  hacer `ALTER TABLE`).
