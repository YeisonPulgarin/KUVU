# propose — app-interna-ux

Referencia: `sdd/app-interna-ux/explore.md` (sección 6, decisiones del Gate A).

## Intent

En la app interna de cada empresa (Administrador y Arrendatario), las acciones no comunican lo
que hacen: eliminar se ve igual que editar o directamente no existe, las confirmaciones son
diálogos nativos del navegador y nada da señal de éxito, error o carga. Este cambio da a cada
acción un color y un ícono con significado, reemplaza los diálogos nativos por piezas propias
y le pone movimiento con propósito a la app, respetando el movimiento reducido.

## Alcance

1. **Semántica visual.** Tokens semánticos fijos (`danger`, `success`, `warning`, `info`) que
   no dependen de la empresa. Botones reorganizados por intención: primario de marca (un solo
   CTA por pantalla), secundario, y acciones de fila con su semántica (editar = info/neutro,
   eliminar = danger, completar = success, iniciar = info, cancelar solicitud = warning).
   Badges de estado y prioridad con etiquetas legibles y colores coherentes.
2. **Contraste de marca.** El texto del botón primario se elige por luminancia del color de la
   empresa (oscuro en Amarilo, blanco en las demás), sin tocar la BD.
3. **Eliminar completo.** Botón eliminar en locales, contratos, pagos (admin) y mantenimiento
   (admin), además del existente en usuarios, todos sobre los `DELETE` que ya expone el
   backend. `DataService` suma los métodos que faltan.
4. **Diálogo y toasts propios.** Un diálogo de confirmación reutilizable (variante destructiva
   que nombra lo que se borra) y toasts de éxito/error. No queda ningún `confirm()` ni
   `alert()` en la app interna. Cancelar una solicitud de mantenimiento y cerrar sesión pasan
   por confirmación.
5. **Movimiento (nivel C).** Guardia de `prefers-reduced-motion` en toda la app interna;
   entrada y salida de modales; respuesta `:active` en botones; tokens de `_motion.scss`;
   entrada escalonada de filas, tarjetas e indicadores; skeleton mientras carga; conteo
   animado de las cifras del dashboard; transición de entrada entre pantallas internas.
6. **Íconos SVG** inline en botones y títulos en lugar de emoji.
7. **Bugs.** Badge de tipo de pago del dashboard sin color; modal de contratos que abre en modo
   edición tras cerrar tocando afuera (y el mismo patrón en mantenimiento); locales sin mensaje
   de error ni estado "Guardando…"; doble pago por doble clic.
8. **Accesibilidad de modales.** Rol de diálogo, cierre con Escape, foco inicial y de retorno,
   `aria-label` en botones de solo ícono, labels asociados a sus campos.
9. **Tests Karma** de todo lo que se toca, y declaración del slice `app` en `sdd.config.md`.

## No objetivos

- Registrar pagos desde el administrador (RF-15) e imprimir comprobantes (RF-16): cambio aparte.
- Tema oscuro de la app interna.
- Eliminar o reutilizar `shared/navbar` (sin uso).
- Autenticación de la API y respuestas de error del backend ante FK (candidatos a `secure`).
- Escapar el HTML de `generarPDF()` (candidato a `secure`).
- Cambios en `src/styles.css`, `src/styles.scss`, el sitio público, `/acceder` y `/login`.
- Cambios en la BD o en el backend.

## Approach

- Todo el cambio vive en el frontend de la app interna: `shared.styles.scss`, las seis
  pantallas, el sidebar, `DataService` y piezas compartidas nuevas en `components/shared/`.
- Los tokens semánticos y la guardia de movimiento entran por `shared.styles.scss`, que ya se
  carga global, así no se toca `styles.css`/`styles.scss` (los edita `sitio-publico-expresivo`
  en paralelo). Los tokens de movimiento de `_motion.scss` se consumen, no se modifican.
- La transición entre pantallas internas se resuelve dentro de la app interna, sin modificar
  el hook de transición del sitio público.
- Rama `feat/app-interna-ux` desde `fix/tema-claro-tokens`; un solo slice nuevo `app` más
  `cierre`.
