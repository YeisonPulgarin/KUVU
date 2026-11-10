# Apply progress — slice `intro`

## Tareas

- [x] T-1 `RouterLink` en `imports` de `LandingComponent`.
- [x] T-2 Enlace `a.back-home` "Volver al inicio" (chevron `aria-hidden`), primer hijo de
  `.landing-container`.
- [x] T-3 Logo envuelto en `a.brand-link` con `aria-label="KUVU, volver al inicio"`; el `<img>`
  tiene `alt=""`.
- [x] T-4 Estilos `.back-home` / `.brand-link`: área de toque de 44px, `:focus-visible` celeste
  `rgba(140,215,255,.9)`, transiciones solo de `color`/`opacity` anuladas con
  `prefers-reduced-motion: reduce`.
- [x] T-5 Tests Karma (7 nuevos en `describe('volver al inicio')`).
- [x] T-6 Karma en verde (474).

## Desvíos

- El test existente "should render the KUVU web logo" verifica ahora `alt=""` y que el `<img>`
  está dentro de `a.brand-link`: el cambio de `alt` es la decisión D-5, no un ajuste para que
  pase.
- `.back-home` lleva `margin-bottom: -.8rem` para que el enlace no separe la marca del borde
  superior con el `gap` completo del contenedor (1.6rem). Es solo espaciado.

```
test_mode: test-after
test_command: npx ng test --watch=false --browsers=ChromeHeadless (frontend/proyecto_angular, CHROME_BIN fijado)
tests_status: verde (474 SUCCESS; baseline 467)
tests_agregados: frontend/proyecto_angular/src/app/components/landing/landing.component.spec.ts
excepciones_sin_test: RF-6 (reduced motion) y el contraste del foco son CSS sin comportamiento observable desde Karma; se verifican por inspección en verify.
logs_conforme: sí (no se agregan logs: navegación en cliente sin evento operativo)
```
