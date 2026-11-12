## Seguridad — ajustes-hover-movil-y-textura

### Modelo de amenazas (resumen)
- Activos / datos sensibles: ninguno nuevo. El cambio es de presentación (estados de los
  menús, pausa de cierre, fondo de la app interna); no toca sesión, autorización ni datos.
- Fronteras de confianza y puntos de entrada: clics y toques del usuario, eventos del router y
  el color de empresa (`--color-primario`, que viene del backend con columna `varchar(7)` y se
  declara en el host de `<app-layout>`; ver `sdd/ingresar-color-marca/secure-report.md`).
- STRIDE-lite:
  - Information disclosure: durante la pausa de 320 ms el menú o el drawer siguen visibles
    sobre la pantalla nueva; muestran solo la navegación del propio usuario, ya visible antes.
  - Tampering / inyección CSS: el color de empresa entra a `color-mix()` como variable CSS ya
    acotada por el CSSOM; no se agregan sinks nuevos.
  - DoS / fugas: los timers de cierre se cancelan en `closeMenu`/`cerrarMenu` y al destruir los
    componentes; no quedan callbacks colgados.
  - El grano y el brillo son `data:` SVG inline y gradientes: no hay recursos externos.
  - Spoofing / Repudiation / Elevation: no aplican.

### Hallazgos por severidad
- Sin vulnerabilidades confirmadas ni hardening accionable.

### Acciones fuera del código
- Secretos a ROTAR: ninguno (diff sin claves ni credenciales).
- Dependencias a actualizar (SCA): ninguna; `package.json` no cambia.
- Configuración / infra a endurecer: ninguna. El repo no define CSP propia; el `data:` SVG
  sigue el mismo patrón que el `$grain` ya en producción.

### Riesgo residual aceptado
- Ninguno.

### Alcance de la búsqueda
- Revisión manual del diff `2d7c22f..HEAD` en `frontend/` (header, sidebar, `tap-feedback.ts`,
  `_grain.scss`, `shared.styles.scss` y specs) y búsqueda de sinks (`innerHTML`,
  `bypassSecurityTrust*`, `eval`, almacenamiento, URLs externas) y de secretos: solo aparece el
  namespace SVG del `data:` URI. Fuera de alcance: backend y flujo de acceso (sin cambios).
