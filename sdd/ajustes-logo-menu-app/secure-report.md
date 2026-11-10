## Seguridad — ajustes-logo-menu-app

### Modelo de amenazas (resumen)

- **Activos / datos sensibles:** el cambio no lee, escribe ni muestra datos de usuario,
  credenciales, montos ni PII. Solo toca plantillas, estilos y un componente de UI.
- **Fronteras de confianza y puntos de entrada:** no se agrega ninguna. No hay llamadas HTTP,
  rutas, parámetros de URL, almacenamiento (`localStorage`/cookies) ni dependencias nuevas.
  El único código con lógica es `BackToTopComponent`: un listener `scroll` (pasivo, en
  captura) que lee `scrollY`/`scrollTop` y llama `scrollTo({ top: 0 })`.
- **STRIDE-lite**, sobre las piezas nuevas:
  - **Tampering / XSS:** las plantillas nuevas solo enlazan constantes (`logo.responsive`, el
    texto fijo "KUVU" y el ícono `x`). El texto dinámico del confirm (`cancelarTexto`) se
    interpola con `{{ }}`, que Angular escapa. No hay `innerHTML`, `bypassSecurityTrust*`,
    `eval` ni `Function`.
  - **DoS del cliente:** el listener es `passive` y por evento hace O(1) (una comparación y
    `signal.set`), así que no bloquea el scroll. Se elimina en `DestroyRef`.
  - **Information disclosure / EoP:** no aplica. El estilo de los botones no cambia permisos:
    la autorización de cada acción sigue en el backend.
- **Assets:**
  - `$grain` es un SVG estático `data:` usado como `background-image` CSS. Un SVG cargado
    como imagen no ejecuta scripts ni hace requests.
  - El logo es un PNG propio servido desde el mismo origen.
  - No se agregan orígenes externos. El `@import` de Google Fonts de landing es anterior a
    este cambio y no se toca.

### Hallazgos por severidad

Ninguna vulnerabilidad confirmada. Ningún hallazgo de hardening justificado por el modelo.

- `el.innerHTML = '<div style="height:2000px"></div>'` en
  `back-to-top.component.spec.ts`: es un literal constante en un test, sin input. No es
  alcanzable desde producción. **Sin acción.**

### Acciones fuera del código (obligatorio marcar)

- Secretos a ROTAR: ninguno. El diff `ac9b64c..HEAD` no agrega tokens, claves ni
  credenciales.
- Dependencias a actualizar (SCA): ninguna. `package.json` y `package-lock.json` no cambian.
- Configuración / infra a endurecer: ninguna por este cambio.

### Riesgo residual aceptado

- Ninguno nuevo. Cancelar en rojo es una decisión de UX (registrada en `propose.md`), no de
  seguridad: no cambia qué se ejecuta, y el diálogo de borrado conserva la confirmación
  explícita.

### Alcance de la búsqueda

- Revisión manual del diff `ac9b64c..HEAD` en `frontend/`, más búsqueda de sinks
  (`innerHTML`, `outerHTML`, `insertAdjacent*`, `document.write`, `bypassSecurityTrust`,
  `eval`, `new Function`), de URLs externas y de patrones de secretos (`token`, `password`,
  `secret`, `api key`) en las líneas agregadas. También se verificó que el manifiesto de
  dependencias no cambia.
- Fuera de alcance: el backend (no se toca), el historial completo de git anterior a este
  cambio y el `@import` de Google Fonts preexistente de landing/login.
- Resultado: **sin cambios de código**. No hace falta re-verificar por esta fase.
