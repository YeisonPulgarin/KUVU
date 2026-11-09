# document-report — auth-contrasenas

```
docs_archivo: docs/auth-contrasenas.md (nuevo)
architecture: actualizado: "Clúster de acceso" (login, cambiar-password), "Capas" (backend/auth,
  scripts, esquema de BD con migraciones aditivas), "Acceso autenticado" (flujo con contraseña,
  bloqueo y cambio obligatorio; cambioPasswordGuard), "Decisiones estructurales" (bcrypt +
  autorización por re-verificación)
guidelines: sin cambios (el cambio aplica la política de logs existente; la convención de
  migraciones aditivas en db/init queda en architecture y sdd-init, sin pasar a los guidelines)
openapi: no aplica: sdd.config.md declara que el proyecto no mantiene spec OpenAPI; los endpoints
  nuevos y cambiados quedan tabulados en docs/auth-contrasenas.md
collections: no aplica: el proyecto no tiene colecciones Bruno
changelog: entrada bajo Unreleased — Added (contraseña, política, bloqueo, pantalla de cambio,
  usuarios, migración y logs) y Changed (cambio incompatible del contrato de login y creación,
  con pasos de migración; columnas explícitas en GET de usuarios)
readme: no aplica: no hay README.md en la raíz. Se actualiza backend/INSTRUCCIONES.md (paso de
  ingreso con contraseña temporal y errores 401 / bcryptjs)
desvios:
  - docs/auth-contrasenas.md describe también la pantalla de usuarios y el sidebar, que viven en
    feat/auth-contrasenas-usuarios (PR 2): el documento describe el sistema con los dos PRs
    integrados.
  - docs/KUVU-Requerimientos.docx (RF-06, sin versionar, del usuario) queda desactualizado: describe
    el login con correo + documento. No se modifica.
```
