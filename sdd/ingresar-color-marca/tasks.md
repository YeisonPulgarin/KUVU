# Tasks — ingresar-color-marca

Modalidad `test-after`. Slices: `intro` (servicio de `services/`) → `app` (`app-layout`) →
`cierre`. El layout consume `temaDeEmpresa`, por eso `intro` va primero.

### Slice `intro`
- T1 `auth.service.ts`: `temaDeEmpresa` exportada; quitar las escrituras en `document`.
  Spec: los tests de "brand theming" verifican `temaDeEmpresa` (contraste oscuro sobre
  amarillo, blanco sobre azul, fallbacks, `null`) y que login, restauración y logout no
  escriben tokens en `<html>` (CA-1, CA-2, RF-4).

### Slice `app`
- T2 `app-layout.component.ts`: `tema` + bindings de host. Spec: CA-3, CA-4.
- T3 Test de regresión: sesión amarilla → `.btn-primary` fuera del layout azul, dentro del
  layout amarillo (CA-1, CA-3).

### Slice `cierre`
- T4 `sdd/sdd-init.md`: "el tema de empresa vive solo en el host de `<app-layout>`".

## Forecast de riesgo
~8 archivos, ~150 líneas con tests, un repo. **Bajo** (umbral 300).

## Alcance previsto de `document`
changelog: sí (Fixed). architecture: sí (theming de la app interna). readme: no.
openapi: no. guidelines: no.
