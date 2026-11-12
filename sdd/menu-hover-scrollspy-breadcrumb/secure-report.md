## Seguridad — menu-hover-scrollspy-breadcrumb

### Modelo de amenazas (resumen)
- Activos / datos sensibles: ninguno. El cambio es UI del sitio público (resaltado del menú,
  rastro de secciones, estilos, orden de nombres del equipo). No maneja PII, credenciales ni
  datos de la API, no toca sesión ni `localStorage`.
- Fronteras de confianza y puntos de entrada: la URL (path y fragmento) que el usuario
  controla y los eventos `scroll`/`resize` del navegador.
- STRIDE-lite: Tampering/Information disclosure → la URL solo se **compara** contra
  `siteNavLinks` (`pageHref`); nunca se renderiza ni se usa como selector. Las etiquetas y
  fragmentos del rastro salen de contenido estático (`homeSpySections`, `sitePages`) y se
  interpolan con el escape de Angular. DoS → el listener es pasivo, se coalesce en un
  `requestAnimationFrame` y re-entra a la zona solo cuando cambia el índice; se libera al
  destruir la home. Spoofing/Repudiation/Elevation: no aplican (sin auth ni acciones).

### Hallazgos por severidad
- Sin vulnerabilidades confirmadas ni hallazgos de hardening accionables.

### Acciones fuera del código
- Secretos a ROTAR: ninguno (diff sin claves, tokens ni credenciales).
- Dependencias a actualizar (SCA): ninguna; el cambio no modifica `package.json` ni el lock.
- Configuración / infra a endurecer: ninguna.

### Riesgo residual aceptado
- Ninguno.

### Alcance de la búsqueda
- Revisión manual del diff `51a380c..HEAD` en `frontend/` (servicio, header, home, contenido,
  offset de anclas) y búsqueda de sinks peligrosos (`innerHTML`, `bypassSecurityTrust*`,
  `eval`, `new Function`, `postMessage`, almacenamiento) y de secretos en el diff: sin
  coincidencias. Fuera de alcance: backend, flujo de acceso y dependencias existentes
  (sin cambios en este cambio).
