## Refinamiento — app-interna-ux

Estado: rama `feat/app-interna-ux-movimiento`, después de `secure` (`422d9bb`). Los controles
de `secure` (`escaparHtml` en el reporte de pagos) se trataron como intocables.

### Red de seguridad

- **Suite previa:** Karma 586/586. Cubre las seis pantallas, las piezas compartidas y
  `DataService`.
- **Caracterización agregada:** `locales.component.spec` fija el formato de moneda de la fila
  (`$ 1.500.000`) antes de tocar `formatCurrency`.
- **Baseline:** sin métricas de rendimiento. No hubo candidatos de optimización: los datos de
  cada empresa son decenas de filas y las listas usan `track` por id.

### Cambios aplicados

- **Tipo:** Refactor.
- **Qué:** `LocalesComponent.formatCurrency` delega en `formatMoneda()` (`shared/formato.ts`)
  en lugar de crear un `Intl.NumberFormat` propio en cada llamada.
- **Principio / lente:** DRY con Regla de Tres. Es la cuarta copia del mismo formato COP;
  dashboard y pagos ya delegaban en `formatMoneda()`, y el conteo animado la usa.
- **Beneficio:** una sola definición del formato de moneda en la app interna, y deja de
  crearse un formateador por celda.
- **Riesgo y verificación:** mismas opciones de `Intl`. El spec de caracterización y la
  suite (586/586) quedan verdes.

### Deliberadamente NO tocado

- **Flujo de eliminar repetido en cinco pantallas** (confirmar → `eliminandoId`/`ocupadoId` →
  `finalize` → toast). Pasa la Regla de Tres, pero cada pantalla arma un mensaje distinto,
  usa un id distinto y mantenimiento comparte el estado ocupado con los cambios de estado. Un
  helper genérico necesitaría callbacks para todo eso y quedaría más complejo que las cinco
  copias de unas 15 líneas. Motivo: KISS, la abstracción equivocada sale más cara.
- **`formatCurrency` en dashboard y pagos** (envoltorios de una línea de `formatMoneda`):
  las plantillas los usan como método; quitarlos es solo cosmético. Motivo: beneficio
  marginal.
- **Ícono de papelera en toda confirmación `danger`**, también "Cancelar solicitud". Cambiarlo
  altera lo que se ve: es un ajuste de producto, no un refactor.
- **`DataService.getUsuarios()`/`getLocales()`… crean un `computed` nuevo en cada llamada.**
  Código previo a este cambio, fuera de alcance.
- **Sidebar con SVG inline en vez de `<app-icon>`:** mismo resultado visual; migrarlo es
  diff sin ganancia.
- **`escaparHtml` en el reporte:** control de seguridad. No se toca.

### Deuda técnica residual (registrada, no resuelta ahora)

- Specs del sitio público que dependen de que `:root` no tenga `.dark` ni `kuvu-theme` en
  `localStorage` (`CompaniesMarqueeComponent`, `StepsJourneyComponent`) fallan de forma
  intermitente según el orden aleatorio de Karma. Los dos fallos vistos fueron en una corrida
  entre varias, y las corridas siguientes pasaron. Corresponde a un cambio del sitio público:
  aislar el tema en esos specs.
- `DataService.cargarSiVacio()` recarga todo si la empresa no tiene locales (preexistente).
