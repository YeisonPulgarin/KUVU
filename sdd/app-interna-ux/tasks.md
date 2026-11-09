# Tasks — app-interna-ux

Referencias: `sdd/app-interna-ux/spec.md`, `sdd/app-interna-ux/design.md` (D-1…D-18).
Modalidad de tests: `test-after`: cada tarea cierra con sus specs en verde.
Rama prevista: `feat/app-interna-ux` desde `fix/tema-claro-tokens`. La crea el orquestador
antes de `apply` (`branch` no está activa) y se trabaja en un worktree aparte, porque
`sitio-publico-expresivo` ocupa el árbol principal.

Rutas relativas a `frontend/proyecto_angular/src/app/`. Comando de test: el de
`sdd.config.md` (Karma, ChromeHeadless con `CHROME_BIN`).

## Slices

| Slice | Involucrado | Nota |
|---|---|---|
| `app` (nuevo) | Sí | pantallas internas, `components/shared/` de la app interna, `shared.styles.scss`, sidebar, `data.service.ts`, `auth.service.ts` (solo el contraste) + specs |
| `cierre` | Sí | declara `app` en `sdd.config.md` y suma convenciones a `sdd-init.md` |
| `backend-orden`, `contenido`, `chrome`, `paginas`, `home`, `intro` | No | — |

Me desvío del default en un punto: `app` no existe todavía en la tabla. Se declara en `cierre`
y, para que el slice esté documentado desde el primer commit, T-1 lo agrega también a
`sdd.config.md` en la rama. `cierre` después completa el resto.

## Tarea previa

- **T-0 — Capturas base (QA, fuera del diff).** Build de `fix/tema-claro-tokens` en el
  scratchpad, con el backend del árbol principal contra `kuvu_db` (solo lectura). Script CDP:
  6 pantallas × {Amarilo admin, Amarilo arrendatario} × {1280, 375} × {movimiento normal,
  reducido}. Sirve de referencia para CA17 en verify.

## Grupo A — Base visual y de feedback (PR 1)

- **T-1** — `sdd.config.md`: fila del slice `app` en la tabla de slices (orden 7, antes de
  `cierre`).
- **T-2** — `shared/color-contrast.ts` + spec (D-3, CA2).
- **T-3** — `auth.service.ts`: publicar y quitar `--color-primario-contraste`. Spec parcial
  de `AuthService` (D-3). Depende de T-2.
- **T-4** — `shared.styles.scss`: bloque `:root` con `--sem-*` y default de
  `--color-primario-contraste`; `.btn-primary` con contraste; `.btn-action--*`,
  `.btn-action--icon`, `.btn-solid--*`, estados (`:active`, `:focus-visible`, `aria-busy`);
  `.badge--{danger,success,warning,info,neutral}`; `.sr-only`; quitar `.btn-sm`,
  `.btn-edit/blue/green/gray/red` y los badges de color viejos; keyframes con prefijo
  `app-`; `transition: all` → propiedades explícitas; todo el movimiento dentro de
  `no-preference` con tokens de `_motion.scss` (D-1, D-2, D-17). Las clases viejas se quitan
  recién cuando las pantallas migran (T-14…T-19); hasta entonces conviven.
- **T-5** — `shared/icon/` `<app-icon>` + spec (D-4).
- **T-6** — `shared/badges.ts` + spec (D-14, CA3).
- **T-7** — `shared/modal/` `<app-modal>` sobre `<dialog>` + estilos de entrada/salida en
  `shared.styles.scss` + spec (D-5, CA12). Depende de T-4, T-5.
- **T-8** — `shared/confirm/` `ConfirmService` + `<app-confirm-host>` + specs (D-6, CA6).
  Depende de T-7.
- **T-9** — `shared/toast/` `ToastService` + `<app-toast-host>` + estilos + specs (D-7, CA7).
  Depende de T-5.
- **T-10** — `shared/app-layout/` `<app-layout>` (sidebar + main + hosts + breadcrumb
  `{empresa} › {pagina}` y toast de error de carga) + spec (D-8, D-19, D-20, CA18).
  Depende de T-8, T-9.
- **T-11** — `data.service.ts`: `eliminarContrato`, `eliminarMantenimiento`, `finalize` en
  `cargarTodo`, `_empresaCargada`, `listo`, `errorCarga` (D-20). Spec con `HttpTestingController` (D-12, D-13).

## Grupo B — Pantallas de gestión del admin (PR 2)

Cada pantalla: migrar a `<app-layout>` y `<app-modal>`, botones `.btn-action--*` con
`<app-icon>`, labels con `for`/`id`, sin emoji, eliminar con `ConfirmService` + toast, spec del
componente con dobles de `DataService`/`AuthService`/`ConfirmService`.

- **T-12** — `shared/sidebar/`: íconos con `<app-icon>`, `aria-label`, logout con
  confirmación, avatares con contraste. Spec (D-18). Depende de T-8.
- **T-13** — `locales`: botón eliminar (danger) con confirmación que nombra la dirección;
  `errorMsg` visible y `guardando()` (R4.3). Spec: rol, eliminar ok/error/cancelar, CA10.
- **T-14** — `contratos`: eliminar (método de T-11); "Nuevo" vía `abrirFormulario()` y
  cierre siempre por `cerrarFormulario()` (R4.2). Spec: CA4, CA9; el arrendatario no ve
  acciones.
- **T-15** — `usuarios`: `.btn-action--icon` editar (info) y eliminar (danger) con
  `aria-label`; eliminar propio deshabilitado con explicación (R2.5); confirmación propia;
  quitar `.btn-icon` de `usuarios.component.scss`. Spec: CA4, CA5.

## Grupo C — Pagos, mantenimiento y dashboard (PR 3)

- **T-16** — `pagos`: eliminar por fila solo para admin (danger); badges con `badges.ts`;
  íconos de método de pago con `<app-icon>`; pasarela con `<app-modal>`, `pagando` y toasts
  (R4.4, D-16); "Descargar reporte" con ícono. Spec: CA4, CA11.
- **T-17** — `mantenimiento`: Iniciar (info), Completar (success), Cancelar solicitud
  (danger, con confirmación; enmienda 1), Eliminar (danger, admin); badges legibles; toast tras cambiar
  estado y en error; "Nuevo" siempre vacío (R4.2). Spec: CA4, CA9, mapeo de acciones.
- **T-18** — `dashboard`: badges de tipo de pago con `badges.ts` (R4.1); íconos; badge de rol
  con contraste; fecha formateada; toast si falla la carga. Spec: CA3, rol.
- **T-19** — `shared.styles.scss`: quitar las clases viejas que ya nadie usa (búsqueda en
  plantillas) y verificar que ningún `confirm(`/`alert(` quede (CA8).

## Grupo D — Movimiento (PR 4)

- **T-20** — `shared/skeleton/` + estilos + spec (D-12). Usarlo en las seis pantallas con
  `data.listo()`; estado vacío solo con datos listos (CA14). Ajustar specs de pantallas.
- **T-21** — `shared/stagger.directive.ts` + estilos + spec (D-10). Aplicarlo a tbody,
  grillas, listas e indicadores de las seis pantallas.
- **T-22** — `shared/count-up/` + spec (D-11, CA13). Usarlo en los indicadores del dashboard
  y de mantenimiento.
- **T-23** — View transitions internas en `shared.styles.scss`: `view-transition-name` en
  `.sidebar` y `.main-content`, keyframes de `app-main`, guardia `reduce` (D-9).
- **T-24** — Verificación del slice: suite Karma completa, `ng build` (presupuestos, tamaño
  del CSS global) y `git diff --stat fix/tema-claro-tokens` sin `styles.css`, `styles.scss`,
  `_motion.scss`, backend (CA15, CA16).

## Slice `cierre`

- **T-25** — `sdd.config.md`: completar la fila de `app` (comando de test, alcance).
  `sdd-init.md`: convenciones de la app interna (tokens `--sem-*`, `.btn-action--*`,
  `ConfirmService`/`ToastService` en lugar de diálogos nativos, `<app-layout>`, `<app-modal>`,
  `[appStagger]`, `<app-count-up>`, `view-transition-name` reservados `app-main`/`app-sidebar`).

## Forecast de riesgo

| Grupo | Archivos (aprox.) | Líneas (aprox., tests incluidos) |
|---|---|---|
| A — base | 22 (14 nuevos + 8 specs) | ~1 300 |
| B — sidebar, locales, contratos, usuarios | 13 (4 specs nuevos) | ~900 |
| C — pagos, mantenimiento, dashboard | 10 (3 specs nuevos) | ~850 |
| D — movimiento | 12 | ~650 |
| cierre | 2 | ~40 |
| **Total** | **~55** | **~3 700** |

- Umbral de `sdd.config.md`: 300 líneas → **riesgo ALTO** (≈ 12× el umbral).
- Un solo repo. Frontend únicamente; sin backend, sin BD.
- Estrategia cacheada: `ask-on-risk`, así que se pregunta en el Gate C.

### Propuesta de entrega

**Opción 1 (recomendada): 4 PRs apilados**, uno por grupo, cada uno con su verificación
(build y Karma en verde):

1. `feat/app-interna-ux` (base) ← `fix/tema-claro-tokens`. Infraestructura sin cambio
   visible salvo el contraste del primario en Amarilo.
2. `feat/app-interna-ux-gestion` ← PR 1. Sidebar, locales, contratos, usuarios.
3. `feat/app-interna-ux-pagos-mant` ← PR 2. Pagos, mantenimiento, dashboard y limpieza de
   clases viejas.
4. `feat/app-interna-ux-movimiento` ← PR 3. Skeleton, escalonado, conteo, transición entre
   pantallas, más `cierre`.

Cada PR sigue por encima del umbral (900–1 300 líneas), pero casi la mitad son specs, y
cada uno se revisa como una unidad coherente.

**Opción 2: un solo PR** con commits por tarea (~3 700 líneas). Más simple de mergear, pero
con mucha carga de revisión. Bajo `single-pr` necesitaría la aprobación explícita del
responsable.

**Opción 3: 2 PRs** (A+B, C+D), de ~2 000 y ~1 700 líneas.

Base de la pila: `fix/tema-claro-tokens` está a su vez apilada sobre PRs abiertos (#1–#4).
Si alguno se mergea antes, se rebasea la pila.

## Alcance previsto de `document`

- `openapi_afectado`: no (sin endpoints nuevos; usa `DELETE` existentes; el proyecto declara
  OpenAPI "No aplica").
- `changelog_afectado`: sí (cambio visible para admin y arrendatario).
- `readme_afectado`: no, salvo que el README describa las pantallas internas (se revisa en
  `document`).
- `architecture_afectado`: sí (`<app-layout>`, servicios de confirmación y toasts, tokens
  semánticos, view transitions internas).
- `guidelines_afectado`: sí, mínimo. `DEVELOPMENT_GUIDELINES.md` es plantilla genérica; se
  suma la convención "acciones semánticas + confirmación/toast propios, nunca diálogos
  nativos". Alternativa: dejarlo solo en `sdd-init.md` (lo decide `document`).
- Documento del cambio: `docs/app-interna-ux.md`.

## Enmienda 1 — observaciones de la docente

- Breadcrumb (R8, D-19): entra en T-10 (grupo A) y cada pantalla pasa `pagina` al migrar a
  `<app-layout>` (grupos B y C).
- Retroalimentación (R9, D-20): `errorCarga` en T-11; toast de carga en T-10; toasts y
  `aria-invalid` en cada pantalla (T-13…T-18), con specs de cada acción (CA19).
- Botones de cancelar (R10, D-21): `.btn-secondary` y `.modal__close` en T-4/T-7 (grupo A);
  "Cancelar solicitud" danger en T-17; inventario y medición de contraste en verify (CA20).
- Forecast: + ~150 líneas (breadcrumb, `errorCarga`, specs). Total ≈ 3 850; sigue riesgo alto,
  misma entrega en 4 PRs.
