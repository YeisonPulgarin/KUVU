## Seguridad — ingresar-color-marca

### Modelo de amenazas (resumen)
- Activos / datos sensibles: ninguno nuevo. El cambio mueve dónde se aplican los colores de
  marca de la empresa (de `<html>` al host de `<app-layout>`); no toca credenciales, sesión
  ni datos de negocio.
- Fronteras de confianza y puntos de entrada: los colores llegan del backend
  (`backend/auth/credentials.js`, `GET /empresas/:id`) y de `localStorage` (`empresa`), y se
  vuelcan como valores de variables CSS con bindings `[style.--…]` de Angular.
- STRIDE-lite:
  - Tampering / Information disclosure (inyección CSS por el valor del color): los bindings
    usan `style.setProperty` (CSSOM). El valor no puede cerrar la declaración ni agregar
    reglas. Además, la columna es `varchar(7)` (`db/init/01-schema.sql`) y la API no expone
    escritura de colores, así que no cabe un `url(...)`. Quien edite `localStorage` solo
    altera su propia pestaña (self-XSS de estilo, sin impacto en terceros). No alcanzable.
  - Information disclosure entre contextos: el cambio **reduce** superficie, porque el tema de
    una empresa deja de aplicarse a páginas públicas y al flujo de acceso.
  - Spoofing / Repudiation / DoS / Elevation: no aplican; la sesión y la autorización no cambian.

### Hallazgos por severidad
- Sin vulnerabilidades confirmadas ni hardening accionable.

### Acciones fuera del código
- Secretos a ROTAR: ninguno (diff sin claves ni credenciales).
- Dependencias a actualizar (SCA): ninguna; `package.json` y el lock no cambian.
- Configuración / infra a endurecer: ninguna.

### Riesgo residual aceptado
- Ninguno.

### Alcance de la búsqueda
- Revisión manual del diff `20c9bac..HEAD` en `frontend/` (`auth.service.ts`,
  `app-layout.component.ts`, specs y `shared.styles.scss`), del origen de los colores en el
  backend y el esquema, y búsqueda de sinks peligrosos (`innerHTML`, `bypassSecurityTrust*`,
  `eval`) y de secretos en el diff: sin coincidencias. Fuera de alcance: el almacenamiento de
  la sesión en `localStorage` y la autenticación sin sesión de servidor, que no cambian aquí.
