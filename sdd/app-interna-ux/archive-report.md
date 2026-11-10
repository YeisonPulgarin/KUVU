# archive-report — app-interna-ux

## Acciones abiertas fuera del código

- **Secretos a rotar:** ninguno.
- **Riesgo residual aceptado por el usuario** (comunicado por el orquestador; "auth sin JWT"
  es decisión explícita del usuario):
  - La API no autentica en el servidor: cualquier cliente que llegue a `/api/*` puede leer y
    borrar datos, incluidos los `DELETE` que esta UI expone ahora. La confirmación de la UI no
    es un control de seguridad.
  - Los `DELETE` responden 500 genérico ante registros asociados; la UI solo puede sugerir la
    causa.
  - CORS abierto (preexistente).
- **Dependencias:** sin cambios.

## Qué se hizo

La app interna de cada empresa (admin y arrendatario) tiene:

- colores semánticos fijos (`--sem-*`) y botones por intención, con íconos SVG en lugar de
  emoji;
- texto del botón principal calculado por luminancia de la marca (oscuro en Amarilo);
- eliminar en locales, contratos, pagos y mantenimiento, además de usuarios, con un diálogo de
  confirmación propio y avisos para cada acción. No quedan `confirm()` ni `alert()`;
- breadcrumb `{Empresa} › {Página}`;
- botones Cancelar unificados: neutros para descartar y rojo con confirmación para "Cancelar
  solicitud";
- modales accesibles sobre `<dialog>`;
- skeleton, entrada escalonada, conteo de cifras y transición entre pantallas con View
  Transitions, todo con guardia de movimiento reducido;
- cuatro bugs corregidos: badge de tipo de pago del dashboard, formulario "Nuevo" con datos
  viejos, error invisible en Locales, doble pago;
- en `secure`, el reporte de pagos imprimible escapa los datos (XSS almacenado, Alto).

## Ramas y commits (apiladas sobre `fix/tema-claro-tokens`)

| Rama | Estado | Commits |
|---|---|---|
| `feat/app-interna-ux` | PR #11 (publicada) | `8355377` planifica, `6458733` base, `a85dba7` scoping de botones y contrastes |
| `feat/app-interna-ux-gestion` | PR #12 (publicada) | `1d889c7` locales, contratos, usuarios, sidebar |
| `feat/app-interna-ux-pagos-mant` | PR #13 (publicada) | `3b1d1da` pagos, mantenimiento, dashboard |
| `feat/app-interna-ux-movimiento` | local, sin push ni PR | `dc6e81d` movimiento y cierre, `2ab4ad6` verify, `422d9bb` secure, `19b66dd` refine, `26a94ad` re-verify, `03e24b2` docs, y este archive |

## Verificación

- Karma 586/586 en la punta; `ng build` OK.
- CA1–CA20 pasan (`verify-report.md`), re-verificados tras `secure` y `refine`.
- Sitio público, `/acceder` y `/login` sin cambios visuales: diff por píxel contra la base.

## Documentación

- `docs/app-interna-ux.md` (nuevo).
- `docs/architecture.md`: clúster autenticado, decisiones estructurales, límites.
- `CHANGELOG.md`: Added, Changed y Fixed bajo Unreleased.
- Convenciones de la app interna en `sdd/sdd-init.md`; slice `app` declarado en
  `sdd/sdd.config.md`.
- No aplica:
  - OpenAPI y Bruno: no hay endpoints nuevos y el proyecto declara OpenAPI "No aplica".
  - README: no existe en la raíz.
  - `DEVELOPMENT_GUIDELINES.md`: el usuario decidió dejar las convenciones solo en
    `sdd-init.md`.

## Decisiones tomadas en el camino

- El contraste del botón principal se calcula contra el primario, no contra el peor color del
  degradado.
- `listo` sigue en verdadero al refrescar la misma empresa; una carga fallida muestra el
  estado vacío más un aviso.
- Breadcrumb propio de la app, no el del sitio público, que publica JSON-LD de SEO.
- Los refinamientos de `.btn-primary` y `.btn-secondary` quedan bajo `.app-layout`, porque el
  sitio público comparte esas clases. Corregido en verify y llevado a la rama base.

## Deliberadamente no tocado (`refine-report`)

- El flujo de eliminar repetido en cinco pantallas: un helper sería más complejo que las
  copias.
- Los envoltorios `formatCurrency` de dashboard y pagos.
- El ícono de papelera en toda confirmación de peligro, incluida "Cancelar solicitud".
- Los íconos del sidebar, que ya son SVG inline.
- `escaparHtml` en el reporte: es un control de seguridad.

## Deuda técnica residual

- Specs del sitio público (`CompaniesMarqueeComponent`, `StepsJourneyComponent`) fallan de
  forma intermitente según el orden de Karma: leen el tema que queda en `:root` o en
  `localStorage`.
- `DataService.cargarSiVacio()` recarga todo si la empresa no tiene locales (preexistente).
- El CSS de la app interna se carga global: 42.5 kB, 7.3 kB gzip.
- Trabajo futuro: RF-15 (el administrador registra pagos), RF-16 (comprobantes), tema oscuro
  de la app interna, autenticación de la API.

## Pendiente de coordinación

- `feat/auth-contrasenas-usuarios` (otro agente) está apilada sobre la gestión anterior al
  rebase y tiene que rebasearse sobre `1d889c7`.
- Publicar `feat/app-interna-ux-movimiento` y abrir su PR, apilado sobre #13. Lo decide el
  usuario.
