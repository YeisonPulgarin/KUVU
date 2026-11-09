# apply-progress — slice `app`

Referencias: `tasks.md` (T-1…T-24 + enmienda 1), `design.md` (D-1…D-21), `spec.md`.
Worktree aparte; el árbol principal no se toca.

## Grupo A — base (rama `feat/app-interna-ux`)

Estado: completo.

| Tarea | Estado | Nota |
|---|---|---|
| T-1 | hecho | fila `app` en `sdd/sdd.config.md` |
| T-2 | hecho | `components/shared/color-contrast.ts` |
| T-3 | hecho | `AuthService` publica y quita `--color-primario-contraste` |
| T-4 | hecho | tokens `--sem-*`, `.btn-primary` con contraste, `.btn-secondary` neutro AA, `.btn-action--*`, `.btn-solid--*`, `aria-busy`, badges semánticos, `.sr-only`, `.modal__close` neutro (D-21), movimiento con guardia y tokens; las clases viejas (`.btn-sm`, `.btn-edit`…, badges de color) conviven hasta T-19 |
| T-5 | hecho | `<app-icon>` con 33 íconos |
| T-6 | hecho | `badges.ts` (+ `badgeVigencia`) |
| T-7 | hecho | `<app-modal>` sobre `<dialog>` |
| T-8 | hecho | `ConfirmService` + `<app-confirm-host>` |
| T-9 | hecho | `ToastService` + `<app-toast-host>`, con salida animada |
| T-10 | hecho | `<app-layout>` con breadcrumb `{Empresa} › {Página}` y toast de error de carga (enmienda 1) |
| T-11 | hecho | `eliminarContrato`, `eliminarMantenimiento`, `listo`, `errorCarga`, `esperandoDatos`, `finalize` |

### Desvíos

- **D-3 contraste:** `textoSobreMarca` decide contra el **primario** solamente, no contra el
  peor de los dos colores del degradado. Con el criterio del peor color, Nido Rent
  (`#2C7A7B` → `#38A169`) pasaba a texto oscuro por 3.28 contra 3.25, y el blanco sobre su
  primario da 5.0:1. Amarilo sigue con texto oscuro (8.1:1 sobre `#F5A623`).
- **D-12:** `listo` queda en verdadero mientras se refresca la misma empresa (el dashboard
  llama `cargarTodo` en cada visita y el skeleton no debe parpadear). Además
  `esperandoDatos = !listo && !errorCarga`, así una carga fallida muestra el estado vacío y el
  toast en vez de un skeleton eterno.
- Las reglas de skeleton, escalonado y view transitions se reservan para el grupo D (PR 4),
  como dice el plan.

```
test_mode: test-after
test_command: npx ng test --watch=false --browsers=ChromeHeadless (CHROME_BIN fijado)
tests_status: verde (520/520)
tests_agregados:
  - src/app/components/shared/color-contrast.spec.ts
  - src/app/services/auth.service.spec.ts
  - src/app/components/shared/icon/icon.component.spec.ts
  - src/app/components/shared/badges.spec.ts
  - src/app/components/shared/modal/modal.component.spec.ts
  - src/app/components/shared/confirm/confirm.spec.ts
  - src/app/components/shared/toast/toast.spec.ts
  - src/app/components/shared/app-layout/app-layout.component.spec.ts
  - src/app/services/data.service.spec.ts
excepciones_sin_test: estilos de shared.styles.scss (sin comportamiento; se verifican con capturas en verify)
logs_conforme: sí (no se agregan logs; la política de DEVELOPMENT_GUIDELINES.md es de backend)
build: ng build OK; solo el warning previo de css-inline-fonts (P-4)
```

## Grupo B — gestión (rama `feat/app-interna-ux-gestion`, apilada sobre la base)

Estado: completo.

| Tarea | Estado | Nota |
|---|---|---|
| T-12 | hecho | sidebar: `aria-label`/`aria-expanded` en colapsar, `aria-label` en cerrar sesión, logout con confirmación neutral, avatares con `--color-primario-contraste`, textos grises a `#a0aec0` (≈ 6.5:1 sobre `#133937`) |
| T-13 | hecho | locales: `<app-layout pagina="Locales">`, `<app-modal>` con `<form (ngSubmit)>`, editar (info) y eliminar (danger) con confirmación y toasts, error de validación visible con `aria-invalid` (R4.3), "Guardando…", columna Administrador con nombre |
| T-14 | hecho | contratos: eliminar con confirmación que nombra contrato, arrendatario y local; "Nuevo" siempre limpio (R4.2); validación de fechas (fin ≥ inicio); fechas `dd/mm/aaaa`; badge de vigencia semántico |
| T-15 | hecho | usuarios: botones de solo ícono con `aria-label`, eliminar propio deshabilitado con explicación (`aria-describedby`), confirmación y toasts; `.btn-icon` eliminado; hover de tarjeta con guardia de movimiento |

### Desvíos

- **D-18:** los íconos de navegación del sidebar ya eran SVG inline; se dejan como están en
  lugar de migrarlos a `<app-icon>` (mismo resultado visual, menos diff).
- Nuevo `components/shared/formato.ts` (`formatFecha`, `formatMoneda`): las fechas de la API
  se muestran `dd/mm/aaaa` sin desplazar el día por zona horaria (contratos ahora; dashboard
  en el grupo C).
- Nuevo `components/shared/testing/app-doubles.ts`: dobles de `AuthService`, `DataService`,
  `ConfirmService` y `ToastService` para las specs de pantallas.
- `ng build`: el total inicial pasa de ~449 kB a ~458 kB (presupuesto de warning: 500 kB).
  Se revisa en verify.

```
tests_status: verde (553/553)
tests_agregados:
  - src/app/components/shared/sidebar/sidebar.component.spec.ts
  - src/app/components/locales/locales.component.spec.ts
  - src/app/components/contratos/contratos.component.spec.ts
  - src/app/components/usuarios/usuarios.component.spec.ts
  - src/app/components/shared/formato.spec.ts
excepciones_sin_test: ninguna nueva
```

## Pendiente

- Grupo C (T-16…T-19): pagos, mantenimiento, dashboard, limpieza de clases viejas.
- Grupo D (T-20…T-24): skeleton, escalonado, conteo, view transitions, verificación.
- `cierre` (T-25).
