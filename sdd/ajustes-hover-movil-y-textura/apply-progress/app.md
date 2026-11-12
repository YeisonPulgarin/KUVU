# apply-progress — app

- [x] T4 `styles/_grain.scss`: `$grain-specks`. `shared.styles.scss`: `.app-layout
  .main-content` con brillo radial de `--color-primario` al 8 % y motas sobre `--color-bg`
  (dos capas; el color va en la capa del grano).
- [x] T5 Spec de `app-layout`: capas (radial + motas, sin `linear-gradient` de velo,
  `background-size: auto, 180px 180px`) y brillo que cambia con la empresa.

test_mode: test-after
test_command: npx ng test --watch=false --browsers=ChromeHeadless (frontend/proyecto_angular) + npx ng build
tests_status: verde (714/714)
tests_agregados: components/shared/app-layout/app-layout.component.spec.ts
excepciones_sin_test: la percepción visual se comprueba con captura en Chrome headless (verify).
logs_conforme: sí (sin logs)
