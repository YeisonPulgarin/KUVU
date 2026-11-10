# document-report — app-interna-ux

```
docs_archivo: docs/app-interna-ux.md (nuevo)
architecture: actualizado: "Clúster autenticado (app de gestión)" (app-layout y piezas compartidas, estado de carga de DataService, contraste de marca), "Decisiones estructurales" (colores semánticos y scoping de botones bajo .app-layout; View Transitions internas), "Límites y no-goals" (API sin auth como riesgo aceptado; reporte de pagos escapado). Se quitaron dos afirmaciones que no describían el código: "datos mock en DataService" y la deuda de document.write sin escapar.
guidelines: sin cambios (decisión del usuario: las convenciones de la app interna van solo en sdd/sdd-init.md, escritas en el cierre)
openapi: no aplica: el cambio no agrega ni modifica endpoints (usa los DELETE existentes) y sdd.config.md declara OpenAPI "No aplica"
collections: no aplica: sin cambios de contrato HTTP
changelog: entradas agregadas bajo Unreleased en Added (eliminar, breadcrumb, avisos, esqueleto y movimiento), Changed (botones semánticos, contraste del primario, diálogos) y Fixed (badge y fechas del panel, formularios Nuevo, error en Locales, doble pago, reporte escapado)
readme: no aplica: el repo no tiene README.md en la raíz
desvios: ninguno sustantivo entre design y código fuera de los registrados en apply-progress (contraste contra el primario, íconos del sidebar sin migrar, listo estable en refresh)
```
