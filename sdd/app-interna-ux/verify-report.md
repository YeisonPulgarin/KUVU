# verify-report — app-interna-ux

Estado verificado: rama `feat/app-interna-ux-movimiento` (`19b66dd`), punta de la pila de 4
ramas sobre `fix/tema-claro-tokens`, **después de `secure` y `refine`**. Slice `app` +
`cierre` completos, sin slices omitidos.

## Resultado

**Verde con observaciones.** Los 20 criterios de aceptación pasan. Durante la verificación
se encontraron y corrigieron dos desvíos (commit `a85dba7` en la rama base, ver "Desvíos corregidos").

## Re-verificación tras `secure` y `refine`

- `secure` (`422d9bb`): escape de los datos del reporte imprimible (`escaparHtml`), con test de
  regresión. Sin cambio observable para datos legítimos.
- `refine` (`19b66dd`): `LocalesComponent.formatCurrency` delega en `formatMoneda`, con spec
  de caracterización. Comportamiento idéntico.
- Karma **586/586**. Fallos intermitentes vistos: `StepsJourneyComponent` y
  `CompaniesMarqueeComponent`, specs del sitio público que dependen del tema que queda en
  `:root`/`localStorage` según el orden aleatorio; pasan al reintentar (deuda en
  `refine-report`). `ng build` OK. CA8 y CA15 vuelven a pasar.
- Los criterios CA1–CA20 siguen pasando: ninguno de los dos cambios toca estilos, plantillas
  ni flujos de las pantallas.
- Antes de `secure`, la pila se rebaseó para llevar la corrección de estilos a la rama base:
  el commit original de la punta quedó vacío y se descartó. Árbol final equivalente (solo
  cambia el orden de dos reglas CSS sin conflicto entre sí).

## Tests y build

- `npx ng test --watch=false --browsers=ChromeHeadless`: **584/584** en tres corridas
  seguidas. En una corrida previa falló una vez
  `CompaniesMarqueeComponent … outlines the pause button even without the light theme tokens`
  (spec del sitio público que lee tokens de `:root` y depende del orden aleatorio). Sin
  relación con este cambio; queda registrado como flake preexistente.
- `ng build`: OK. Solo el warning previo de `css-inline-fonts`; el error intermitente de
  ese mismo presupuesto (respuesta variable de Google Fonts) apareció dos veces y pasó al
  reintentar (P-4).
- Tamaños contra `fix/tema-claro-tokens`:
  | | base | cambio | Δ |
  |---|---|---|---|
  | CSS global (`styles-*.css`) | 29.10 kB (5.62 kB gz) | 41.17 kB (7.28 kB gz) | +12.1 kB (+1.7 kB gz) |
  | Total inicial | 438.5 kB (115.8 kB gz) | 460.1 kB (121.3 kB gz) | +21.6 kB (+5.5 kB gz) |

  Presupuesto de warning de 500 kB respetado. El design estimaba +3–4 kB de CSS: el real es
  mayor (tokens, botones, modal, toasts, skeleton, movimiento y breadcrumb son globales vía
  `shared.styles.scss`). Del JS, ~8.7 kB caen en el chunk común de Angular (APIs de señales,
  `viewChild`/`output`, `DomSanitizer`, `finalize`) que el bundler sube al inicial.

## QA visual (CDP, Chrome 156 headless)

Builds de producción de `fix/tema-claro-tokens` y del cambio servidos en estático, backend
existente en `:3000` usado solo para `POST /api/auth/login` (un SELECT) y los GET de la app.
Ninguna captura confirma un borrado, un alta ni un pago: los diálogos se abren y se cancelan.

- **Sitio público, `/acceder` y `/login` (R7.1, CA17):** 6 rutas × 1280/375, movimiento
  reducido, diff por píxel base vs cambio. Iguales salvo ruido medido: `/nosotros` a 1280 px
  difiere también entre dos capturas de la misma base, y `/login` muestra 17 px de
  antialiasing que también aparecen entre dos capturas del mismo build. La primera pasada
  detectó un desvío real (ver abajo), corregido y re-verificado.
- **App interna (CA17):** 6 pantallas admin + 4 arrendatario (Amarilo) × 1280/375 × con y sin
  movimiento reducido (60 capturas). Se revisaron a ojo el dashboard, mantenimiento,
  pagos móvil, los diálogos de eliminar local y cancelar solicitud, la validación del
  formulario y el logout.
- **Contraste medido en página** (texto vs fondo efectivo):
  | Elemento | Ratio |
  |---|---|
  | `.btn-primary` en Amarilo (texto `#1a202c` sobre `#F5A623`) | 8.05 |
  | `.btn-secondary` | 10.46 |
  | `.modal__close` | 7.69 |
  | `.btn-action--info` / `--danger` | 5.57 / 6.05 |
  | `.btn-solid--danger` | 4.83 |
  | badges info / success / warning / danger | 5.57 / 5.40 / 5.20 / 6.05 |
  | subtítulo de página (`#667085` sobre `#F0F4F8`) | 4.50 |
- Diálogo de eliminar: `:modal` verdadero, foco inicial en "Cancelar", Escape lo cierra.
  Logout cancelado: se queda en la pantalla.

## Criterios de aceptación

| CA | Resultado | Evidencia |
|---|---|---|
| CA1 | pasa | specs de pantallas (clases `btn-action--*` + `app-icon svg`), `tieneEmoji` en specs y en la QA: ninguna pantalla tiene emoji en `main` |
| CA2 | pasa | `color-contrast.spec` (4 empresas, ≥ 4.5:1) y `auth.service.spec`; medido 8.05 en Amarilo |
| CA3 | pasa | `badges.spec`, specs de pagos, mantenimiento y dashboard |
| CA4 | pasa | specs de locales, contratos, pagos, mantenimiento y usuarios (rol, confirmar/cancelar/error, toasts) |
| CA5 | pasa | `usuarios.component.spec` (deshabilitado + `aria-describedby`) |
| CA6 | pasa | `confirm.spec` (texto, true/false, Escape, ✕, variantes) |
| CA7 | pasa | `toast.spec` (autocierre 4/6 s, máximo 3, cierre manual, `aria-live`, `role=alert`) |
| CA8 | pasa | búsqueda en `components/{dashboard,locales,contratos,pagos,mantenimiento,usuarios,shared}`: sin `confirm(`/`alert(`/`prompt(` (solo un comentario que nombra `confirm()`) |
| CA9 | pasa | specs de contratos (cierre por fondo) y mantenimiento (cierre con Escape) |
| CA10 | pasa | `locales.component.spec`; captura de validación |
| CA11 | pasa | `pagos.component.spec`: doble clic → una llamada |
| CA12 | pasa | `modal.component.spec` (nombre, foco inicial y de retorno, Escape, fondo); labels asociados en specs de formularios; QA del diálogo |
| CA13 | pasa | `motion-pieces.spec` (conteo exacto con frames, sin frames bajo reduce; escalonado nulo bajo reduce) |
| CA14 | pasa | specs de locales y dashboard (skeleton vs estado vacío) y `data.service.spec` (`esperandoDatos`, error) |
| CA15 | pasa | `git diff --name-only fix/tema-claro-tokens`: sin `src/styles.css`, `src/styles.scss`, `_motion.scss`, backend, rutas ni `docs/KUVU-*` |
| CA16 | pasa | Karma 584/584, `ng build` OK |
| CA17 | pasa | QA visual descrita arriba |
| CA18 | pasa | `app-layout.component.spec`, specs de pantallas y QA: `Ruta | Amarilo › {Página}` en las 10 vistas |
| CA19 | pasa | specs de cada pantalla cubren crear, editar, eliminar, cambiar estado, pagar, error de guardado, error de borrado, error de carga (layout) y validación |
| CA20 | pasa | inventario: todos los "Cancelar"/"Volver" de descartar usan `.btn-secondary` (10.46:1) y el ✕ `.modal__close` (7.69:1, hover neutro); "Cancelar solicitud" usa `.btn-action--danger` con confirmación de peligro (spec + captura) |

## Desvíos corregidos durante verify (commit `a85dba7`, en `feat/app-interna-ux`)

1. **Estilos de botones filtrados al sitio público.** El header, el hero y la banda final del
   sitio público usan las clases globales `.btn-primary`/`.btn-secondary`. Los cambios del
   grupo A (sombra con `color-mix`, `display`, texto por contraste) alteraban la sombra del CTA
   del header (142 px a 1280) y del hero móvil. Los dos bloques globales vuelven a su
   definición de la base y los refinamientos de la app quedan bajo `.app-layout`; los hosts
   de toasts y confirmación pasan dentro de `.app-layout`. Re-verificado: sitio público igual.
2. **Contraste con marcas claras.** El botón de menú móvil (ícono blanco sobre el naranja de
   Amarilo), los enlaces "Ver todos" del dashboard (texto naranja sobre blanco) y las
   etiquetas de filtros (`#a0aec0`) no llegaban a AA. Pasan a `--color-primario-contraste`,
   texto `#344054` con subrayado de marca al hover, y `#475467`.

## Observaciones (sin bloqueo)

- El foco de retorno al cerrar un diálogo funciona con clic o teclado (spec). En la QA por
  CDP el clic se simula con `element.click()`, que no enfoca el botón, así que allí el foco
  volvió al `body`. Es un artefacto de la herramienta, no del producto.
- El ícono del diálogo de peligro es siempre la papelera, también en "Cancelar solicitud".
- Volumen: ~4 600 líneas de código y tests (más ~700 de artifacts) contra ~3 850
  pronosticadas.
- La columna Administrador de locales muestra "Administrador 1" cuando ese usuario no está
  entre los usuarios de la empresa (datos actuales de la BD).

## Ejes del protocolo

- **Documentación declarada:** `tasks.md` anticipa `docs/app-interna-ux.md`, `CHANGELOG.md`
  sí, `docs/architecture.md` sí. El usuario decidió que las convenciones van solo a
  `sdd-init.md` y no a `DEVELOPMENT_GUIDELINES.md`; ya están escritas ahí (cierre).
- **Guidelines:** `DEVELOPMENT_GUIDELINES.md` es la plantilla genérica. Se siguen las
  convenciones Angular del proyecto: standalone, señales, rutas lazy sin cambios, dobles de
  `motion/testing/`.
- **Logs:** no se agregan logs nuevos. Los `console.error` existentes se mantienen con
  contexto y sin datos personales; `logs_conforme: sí` en `apply-progress/app`.

## Pendiente para `secure` (no objetivos registrados)

- `generarPDF()` escribe con `document.write` datos de la BD sin escapar.
- La API no autentica: cualquier `DELETE /api/*` funciona sin sesión (RF-20 parcial).
- Los `DELETE` devuelven un 500 genérico ante FK, y la UI no puede distinguir la causa.
