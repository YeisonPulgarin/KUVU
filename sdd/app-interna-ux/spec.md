# spec — app-interna-ux

Referencias: `sdd/app-interna-ux/propose.md`, `sdd/app-interna-ux/explore.md`.
"App interna" = rutas `/dashboard`, `/locales`, `/contratos`, `/pagos`, `/mantenimiento`,
`/usuarios` y su sidebar. "Admin" = `idRol 1`; "Arrendatario" = `idRol 2`.

## Requisitos funcionales

### R1 — Semántica visual de acciones

- **R1.1** Existen cuatro colores semánticos fijos (peligro, éxito, advertencia, información),
  iguales para las cuatro empresas y distinguibles entre sí. Una acción semántica no se
  confunde con el CTA de marca aunque compartan tono (verde de Nido Rent vs éxito): se
  distingue por estilo (tinte claro con texto oscuro vs relleno de marca) y por ícono.
- **R1.2** Cada pantalla tiene como máximo un botón con el color de marca (CTA principal).
  Las demás acciones usan estilo secundario o semántico.
- **R1.3** Las acciones de fila y tarjeta usan su semántica en reposo, no solo en hover:
  eliminar → peligro; editar → información/neutro; iniciar → información; completar → éxito;
  cancelar solicitud de mantenimiento → peligro (enmienda 1).
- **R1.4** Toda acción muestra un ícono SVG que hereda el color del botón; ningún botón ni
  título de la app interna usa emoji como ícono. Los botones de solo ícono tienen nombre
  accesible.
- **R1.5** Los badges de estado y prioridad muestran etiquetas legibles ("En proceso",
  "Urgente") con color coherente: pendiente → advertencia, en proceso → información,
  completado → éxito, cancelado → neutro; urgente → peligro, normal → información,
  baja → neutro. Los tipos de pago tienen color propio en `/pagos` y en el dashboard
  (Arriendo → información, Multa → peligro, Otro → neutro).
- **R1.6** El texto del botón primario alcanza contraste ≥ 4.5:1 contra el color de marca de
  cada empresa: oscuro cuando la marca es clara (Amarilo), blanco cuando es oscura. La BD no
  se modifica.

### R2 — Eliminar

- **R2.1** El admin ve un botón eliminar en cada fila de locales, contratos y pagos, en cada
  tarjeta de mantenimiento y en cada tarjeta de usuario. El arrendatario no ve ningún botón
  eliminar.
- **R2.2** Eliminar abre la confirmación destructiva (R3.1). Al confirmar se llama al
  `DELETE /api/{entidad}/:id` existente; al terminar bien, el elemento desaparece de la lista,
  los indicadores dependientes se actualizan y aparece un toast de éxito que nombra lo
  eliminado.
- **R2.3** Si el backend rechaza el borrado, el elemento sigue en la lista y aparece un toast
  de error ("No se pudo eliminar … Puede tener registros asociados.").
- **R2.4** Mientras el borrado está en curso, el botón de confirmar muestra estado de carga y
  no acepta un segundo clic.
- **R2.5** El admin no puede eliminarse a sí mismo: el botón eliminar de su propia tarjeta
  está deshabilitado con explicación accesible (sin diálogo nativo).

### R3 — Confirmación y avisos propios

- **R3.1** Given una acción destructiva (eliminar, cancelar solicitud), when el usuario la
  pide, then se abre un diálogo de la app con título, texto que nombra el elemento afectado
  (p. ej. la dirección del local), botón "Cancelar" y botón de confirmación en color de
  peligro (también para cancelar una solicitud de mantenimiento, enmienda 1). Cancelar, Escape
  o tocar fuera cierran sin efecto.
- **R3.2** Cerrar sesión pide confirmación con el mismo diálogo en variante neutra.
- **R3.3** Los resultados de crear, editar, eliminar, cambiar estado, pagar y los errores de
  carga se informan con toasts: éxito y error con su color semántico, ícono, texto y botón de
  cerrar. Se cierran solos (éxito ≈ 4 s; error ≈ 6 s) y se anuncian a lectores de pantalla.
- **R3.4** Ningún `confirm()`, `alert()` ni `prompt()` nativo se invoca desde la app interna.

### R4 — Bugs

- **R4.1** En el dashboard, el badge de tipo de pago tiene el color de R1.5.
- **R4.2** Abrir "Nuevo contrato" o "Nuevo mantenimiento" siempre muestra el formulario vacío
  y en modo creación, sin importar cómo se cerró el modal anterior (botón, ✕, fuera o Escape).
- **R4.3** En locales, guardar sin dirección muestra el mensaje de error dentro del modal, y
  "Guardar" pasa a "Guardando…" deshabilitado mientras se guarda (como en las demás pantallas).
- **R4.4** En la pasarela del arrendatario, "Ir a pagar" se deshabilita y muestra carga desde
  el primer clic hasta la respuesta: un doble clic registra un solo pago. El resultado se
  informa con toast; "sin contrato activo" también.

### R5 — Accesibilidad de modales y formularios

- **R5.1** Todo modal de la app interna (formularios, pasarela, confirmación) se expone como
  diálogo modal con nombre accesible (su título).
- **R5.2** Al abrir, el foco va al primer campo (formularios) o al botón menos destructivo
  (confirmación); Tab no sale del modal; al cerrar, el foco vuelve al control que lo abrió.
- **R5.3** Escape cierra el modal abierto (equivale a cancelar).
- **R5.4** Cada `<label>` de formulario está asociado a su campo; los campos obligatorios se
  anuncian como tales; el mensaje de error se anuncia al aparecer.

### R6 — Movimiento

- **R6.1** Con `prefers-reduced-motion: reduce`, la app interna no anima desplazamientos,
  escalas, escalonados ni conteos: el contenido aparece en su estado final (se permiten
  cambios de opacidad instantáneos o ≤ 150 ms). Las cifras muestran su valor final de
  inmediato.
- **R6.2** Con `no-preference`:
  - modales y diálogo entran y salen con animación (overlay con fundido, panel con
    desplazamiento/escala); el contenido sale antes de desmontarse;
  - los toasts entran y salen deslizando;
  - los botones responden a la presión (`:active`) y al hover con transición;
  - al entrar a una pantalla interna, su contenido aparece con una transición breve
    (≤ 400 ms);
  - filas de tabla, tarjetas e indicadores entran escalonados la primera vez que se pintan
    (escalonado total ≤ 600 ms, sin re-animar al filtrar);
  - las cifras de los indicadores del dashboard cuentan desde 0 hasta su valor (≤ 1 s),
    incluido el formato de moneda.
- **R6.3** Mientras los datos de la empresa cargan, tablas, listas e indicadores muestran un
  skeleton en lugar de "No hay registros"; el estado vacío solo aparece con la carga
  terminada y sin resultados.
- **R6.4** Duraciones y curvas salen de los tokens de movimiento del proyecto.

### R7 — Alcance de archivos

- **R7.1** El cambio no modifica `src/styles.css`, `src/styles.scss`, `src/styles/_motion.scss`,
  el sitio público, `/acceder`, `/login`, el backend ni la BD.

## Criterios de aceptación

| CA | Verificación | R |
|---|---|---|
| CA1 | Tests Karma: botones de fila renderizan la clase semántica esperada (eliminar = peligro, completar = éxito…) y un SVG; ninguna plantilla de la app interna contiene emoji en botones o `h1/h2` (test o búsqueda en verify) | R1.3, R1.4 |
| CA2 | Test unitario de la función de contraste: Amarilo → texto oscuro, Nido Rent / Balcones / Mi Inmueble → blanco, todos ≥ 4.5:1 | R1.6 |
| CA3 | Test de mapeo de badges (estado, prioridad, tipo de pago) con etiquetas legibles, incluido el dashboard | R1.5, R4.1 |
| CA4 | Por cada pantalla con eliminar: admin ve el botón, arrendatario no; confirmar llama al `DELETE` correcto; éxito → toast de éxito; error → elemento intacto y toast de error; cancelar → sin llamada | R2.1–R2.4 |
| CA5 | Usuarios: el botón eliminar propio está deshabilitado | R2.5 |
| CA6 | Diálogo de confirmación: muestra el texto recibido, resuelve confirmar/cancelar, Escape y fondo cancelan, variante destructiva con color de peligro | R3.1, R3.2, R5.3 |
| CA7 | Servicio/componente de toasts: muestra, cierra solo en el tiempo definido, cierre manual, región `aria-live` | R3.3 |
| CA8 | `grep` sobre `components/{dashboard,locales,contratos,pagos,mantenimiento,usuarios,shared}` sin `confirm(`, `alert(` ni `prompt(` (salvo specs) | R3.4 |
| CA9 | Contratos y mantenimiento: editar → cerrar por fondo → "Nuevo" abre vacío en modo creación | R4.2 |
| CA10 | Locales: guardar sin dirección muestra error; guardando deshabilita el botón | R4.3 |
| CA11 | Pasarela: dos clics seguidos → una sola llamada a `agregarPago` | R4.4 |
| CA12 | Modales: rol de diálogo y nombre; foco inicial; Escape cierra; foco vuelve al disparador; labels asociados | R5 |
| CA13 | Con el doble de `matchMedia` en reduce: el conteo entrega el valor final sin pasos y no se aplican clases de animación; en no-preference el conteo termina en el valor exacto | R6.1, R6.2 |
| CA14 | Con `cargando` en verdadero se ve skeleton y no el estado vacío; al terminar sin datos, estado vacío | R6.3 |
| CA15 | `git diff --stat fix/tema-claro-tokens` sin cambios en los archivos de R7.1 | R7.1 |
| CA16 | Suite Karma completa en verde y `ng build` sin errores ni presupuestos excedidos | todos |
| CA17 | Revisión manual (capturas en verify) de las 6 pantallas con Amarilo admin y arrendatario, 1280 y 375 px, con y sin movimiento reducido | R1, R6 |

## No objetivos y casos excluidos

- RF-15 (admin registra pagos) y RF-16 (comprobantes): cambio futuro.
- Tema oscuro de la app interna; `shared/navbar` sin uso.
- Autenticación de la API, respuestas de error del backend ante FK y escape de `generarPDF()`:
  se registran para `secure` u otro cambio. El toast de error de R2.3 no distingue la causa
  del rechazo porque el backend no la informa.
- Deshacer un borrado (undo): no existe; la confirmación es la única barrera.
- Edición de pagos: el backend no tiene `PUT /api/pagos/:id`.
- Animación de reordenamiento de filas al filtrar: las filas filtradas aparecen sin animar.
- Navegadores sin soporte de las APIs de animación usadas: muestran el estado final sin
  animación.

## Enmienda 1 — observaciones de la docente

Se incorpora al alcance sin cambiar lo anterior salvo R1.3/R3.1 (cancelar solicitud pasa a
peligro).

- **R8 — Breadcrumb interno.** Cada pantalla interna muestra, arriba del título, un breadcrumb
  `{Empresa} › {Pantalla}`. El primer ítem (nombre de la empresa) enlaza a `/dashboard`; en el
  dashboard la ruta es `{Empresa} › Inicio` y la empresa no es enlace. Se expone como
  `nav` con `aria-label="Ruta"`, lista ordenada, separadores ocultos al lector y el último
  ítem con `aria-current="page"`.
- **R9 — Retroalimentación de toda acción.** Toda acción da una señal visible:
  crear, editar, eliminar, cambiar estado, pagar y cerrar sesión (toast de éxito o salida);
  errores de guardado y de borrado (toast de error o mensaje en el modal); errores de carga
  (toast); validaciones de formulario (mensaje en el modal con `role="alert"` y el campo
  marcado `aria-invalid`).
- **R10 — Botones de cancelar y cerrar unificados.**
  - "Cancelar"/"Cerrar" que descartan un formulario, la pasarela o el diálogo de confirmación,
    y el ✕ de los modales: estilo secundario neutro, texto ≥ 4.5:1 sobre su fondo, hover
    neutro (no rojo).
  - "Cancelar solicitud" de mantenimiento (cambio de estado destructivo): botón de peligro
    con confirmación de peligro que nombra la solicitud.

| CA | Verificación | R |
|---|---|---|
| CA18 | Cada pantalla interna renderiza el breadcrumb con `nav[aria-label="Ruta"]`, enlace de la empresa a `/dashboard` (salvo en el dashboard) y `aria-current="page"` en el último ítem | R8 |
| CA19 | Specs de pantallas: cada acción (crear, editar, eliminar, cambiar estado, pagar, error de guardado, error de carga, validación) produce toast o mensaje visible | R9 |
| CA20 | Inventario de botones cancelar/cerrar en verify: todos los de descartar usan `.btn-secondary` o `.modal__close` (contraste ≥ 4.5:1 medido, hover neutro); "Cancelar solicitud" usa `.btn-action--danger` y abre la confirmación de peligro (spec) | R10 |
