# apply-progress — app

- [x] T4 `styles/_grain.scss`: `$grain-specks`. `shared.styles.scss`: `.app-layout
  .main-content` con brillo radial de `--color-primario` al 8 % y motas sobre `--color-bg`
  (dos capas; el color va en la capa del grano).
- [x] T5 Spec de `app-layout`: capas (radial + motas, sin `linear-gradient` de velo,
  `background-size: auto, 180px 180px`) y brillo que cambia con la empresa.

## Ampliación: sidebar de la app interna
- [x] T8 `app/motion/tap-feedback.ts` (`TAP_FEEDBACK_MS = 320`); el header expone
  `MENU_TAP_FEEDBACK_MS` desde ahí.
- [x] T9 `SidebarComponent`: `elegido`, `elegir(ruta)` (solo en móvil con el drawer abierto),
  cierre tras la pausa, `NavigationEnd` no corta un cierre pendiente, `cerrarMenu()` y destroy
  cancelan. Template: `[class.is-pressed]`, `(click)="elegir(...)"`, `.sidebar__label`.
- [x] T10 `sidebar-feedback.scss` (hoja aparte en `styleUrls`): acento = empresa 30 % + blanco
  70 %, tinte 18 %, subrayado que crece, `translateX(4px)` solo con movimiento.
- [x] T11 Spec del sidebar: etiquetas, estado elegido medido con `getComputedStyle`, contraste
  del acento ≥ 4.5 : 1 para 7 colores (incluidos negro, azul puro y blanco), pausa en móvil,
  `NavigationEnd` no corta, sin pausa en escritorio. El spec usa rutas reales para que el
  clic navegue.

test_mode: test-after
test_command: npx ng test --watch=false --browsers=ChromeHeadless (frontend/proyecto_angular) + npx ng build
tests_status: verde (720/720)
tests_agregados: components/shared/app-layout/app-layout.component.spec.ts, components/shared/sidebar/sidebar.component.spec.ts
excepciones_sin_test: la percepción visual se comprueba con captura en Chrome headless (verify).
logs_conforme: sí (sin logs)
