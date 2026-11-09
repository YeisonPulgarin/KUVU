## Seguridad — app-interna-ux

Estado: rama `feat/app-interna-ux-movimiento`, sobre la pila rebaseada (base `a85dba7`).

### Modelo de amenazas (resumen)

- **Activos / datos sensibles:** sesión en `localStorage` (usuario, empresa; el documento hace
  de contraseña), datos personales de arrendatarios (nombre, documento, correo, teléfono),
  montos de pagos, direcciones de locales.
- **Fronteras de confianza:** navegador ↔ API Express (`/api/*`, sin autenticación de
  servidor; CORS abierto); API ↔ MariaDB. Todo valor que viene de la API puede haber sido
  escrito por cualquiera que llegue a la API, porque la API no autentica.
- **Puntos de entrada del cambio:** las seis pantallas internas (render con interpolación de
  Angular, que escapa por defecto), el reporte imprimible de pagos (HTML armado a mano y
  escrito en una ventana del mismo origen), `<app-icon>` (`innerHTML` con constantes), los
  `DELETE` que la UI usa.
- **STRIDE aplicado:** Tampering/Elevation en el reporte (XSS almacenado); Spoofing y Elevation
  en la API (sin auth, fuera de alcance); Information disclosure en mensajes de error (sin
  hallazgo: los toasts no exponen detalles del backend).

### Hallazgos por severidad

**1. XSS almacenado en el reporte de pagos (`generarPDF`)**
- **Severidad:** Alto. Explotable y alcanzable: `descripcion` del pago, dirección del local y
  nombres llegan de la API sin escapar y se escriben con `document.write` en una ventana
  `about:blank` abierta con `window.open`, que hereda el origen de la app. El código inyectado
  corre con acceso al `localStorage` de la sesión. Como la API no autentica, cualquiera que
  llegue a ella puede dejar el valor guardado. Se dispara cuando un admin o un arrendatario
  pulsa "Descargar reporte".
- **Categoría:** OWASP A03 Injection / CWE-79.
- **Estado:** Corregido.
- **Fix y capa:** encoding de salida en el sink. `escaparHtml()` (`components/shared/formato.ts`)
  escapa `& < > " '`, y cada valor interpolado en el HTML del reporte pasa por ella (fechas,
  tipo, descripción, método, montos, nombres de empresa y usuario, dirección). Las únicas
  interpolaciones sin escapar que quedan son literales del código.
- **Verificación / test de regresión:**
  - `formato.spec.ts`: escapa los cinco metacaracteres.
  - `pagos.component.spec.ts` (`printable report (security)`): con una descripción
    `<img … onerror>`, una dirección `<script>` y un nombre de empresa con `<b>`, el HTML
    escrito contiene las entidades y no las etiquetas. El test falla si se quita el escape.
- **¿Cambia comportamiento observable?:** no, para datos legítimos. Un valor que contenga
  `<`, `>` o `&` ahora se imprime como texto literal en vez de interpretarse.

**2. Sin hallazgo en el resto del cambio**
- `<app-icon>` usa `bypassSecurityTrustHtml` solo sobre el mapa `ICONOS`, constante en el
  código. Un spec verifica que cada entrada es markup SVG sin `script` ni manejadores `on*`.
- Las plantillas nuevas usan interpolación y `[attr.*]` de Angular, que escapan por defecto;
  no hay `innerHTML` con datos.
- Los mensajes de confirmación y los toasts son texto (`{{ }}`), así que la dirección o el
  nombre que muestran no se interpretan.

### Acciones fuera del código (obligatorio marcar)

- **Secretos a rotar:** ninguno. Se revisó el diff de las cuatro ramas y no agrega
  credenciales; `.env` sigue fuera de git.
- **Dependencias a actualizar (SCA):** ninguna nueva (`package.json` y `package-lock.json` sin
  cambios).
- **Configuración / infra a endurecer:** ver riesgo residual.

### Riesgo residual aceptado

Los acepta el usuario, comunicado por el orquestador. "Auth sin JWT" es una decisión explícita
del usuario para este proyecto.

- **API sin autenticación de servidor (Alto).** Cualquier cliente que llegue a `/api/*` puede
  leer y borrar datos (incluidos los `DELETE` que esta UI expone ahora en locales, contratos,
  pagos y mantenimiento) y elegir `empresa_id`. La confirmación de la UI no es un control de
  seguridad. Coincide con RF-20 y RNF-13 "parcial" del documento de requerimientos. Es trabajo
  futuro fuera de este cambio.
- **`DELETE` con 500 genérico ante FK (Bajo).** No filtra información, pero la UI no puede
  distinguir "tiene registros asociados" de un error del servidor; el toast lo presenta como
  posibilidad. Sin impacto de seguridad directo.
- **CORS abierto (Medio, preexistente).** Agrava el primer punto. Fuera de alcance.

### Alcance de la búsqueda

- **Revisión manual:** las cuatro ramas contra `fix/tema-claro-tokens` (frontend de la app
  interna, `DataService`, `AuthService`).
- **Búsqueda de sinks HTML:** `innerHTML`, `outerHTML`, `insertAdjacentHTML`,
  `document.write`, `bypassSecurityTrust*`, `eval`, `new Function` en `src/app`.
- **Secretos:** revisión del diff.
- **Fuera de alcance:** backend (sin cambios en este work item), DAST contra la API, historial
  de git completo y el sitio público. Un scan limpio no prueba ausencia de vulnerabilidades.
