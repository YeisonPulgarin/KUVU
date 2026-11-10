## Refinamiento — ajustes-logo-menu-app

**Resultado: sin cambios necesarios.** No aplica re-verificar por esta fase. `secure` tampoco
cambió código.

### Red de seguridad

- Suite existente en verde: 677/677. Cubre header, footer, back-to-top, acceso, confirm,
  pantallas y layout.
- Baseline del CSS global compilado: 49,92 kB raw, 9.843 B gzip (nivel 9).

### Cambios aplicados

Ninguno.

### Deliberadamente NO tocado

- **SVG del grano duplicado en `styles.css` compilado** (2 × 322 B, a 16,9 kB de distancia).
  Optimización candidata: un custom property `--grain-image` en `:root` que consuman
  `.site-root::before` y `.main-content`.
  - Medición: el CSS con una sola ocurrencia pesa 9.839 B gzip contra 9.843 B actuales. La
    ganancia es de **4 B** en transferencia, porque gzip resuelve la repetición por
    back-reference dentro de su ventana de 32 kB.
  - El código fuente ya tiene una sola fuente del SVG (`_grain.scss`). Agregar un token
    global suma indirección para un beneficio despreciable.
  - Descartado por KISS y "sin capa sin ganancia neta".
- **Markup del `.brand-lockup` repetido en tres plantillas** (landing, login,
  cambiar-contraseña; 3–4 líneas cada una). Llega justo a la Regla de Tres. Un componente
  `<app-brand-lockup>` agregaría un archivo, imports en tres componentes y un input para el
  caso de landing (dentro de un `<a>`), a cambio de ahorrar unas 8 líneas de HTML estático.
  Los estilos ya están centralizados en `brand-lockup.scss`. Descartado por KISS: la
  duplicación de markup trivial es más barata que la abstracción.
- **`BackToTopComponent`**: un listener, una señal y una función pura de umbral, sin
  smells. No se toca.
- **Clases de descarte en las plantillas** (`btn-action btn-action--danger` + ícono, siete
  usos). Son el mismo patrón que ya usan los botones Eliminar del repo y se mantiene por
  consistencia. Un componente botón nuevo sería un patrón sin fuerza.

### Deuda técnica residual (registrada, no resuelta ahora)

- El `@import` de Google Fonts (Syne/Inter) en `landing.component.scss` y
  `login.component.scss` deja esas hojas a pocos bytes del presupuesto `anyComponentStyle`
  (error en 20 kB) y produce el warning `css-inline-fonts`. La convención de `sdd-init.md` es
  autohospedar las fuentes. Queda como work item aparte, fuera del alcance de este cambio.
