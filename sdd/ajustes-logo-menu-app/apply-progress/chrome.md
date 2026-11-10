# Apply progress — chrome

## Tareas

- [x] T1 Header: una sola `<img>` con `logo.responsive` (`.logo-img`, `h-12`, todos los anchos).
- [x] T2 Footer: sin `.footer-logo` (HTML, SCSS y el import de `logo` en el `.ts`).
- [x] T3 Superficie del header en `.site-header::before` (color, translucidez compacta,
      `backdrop-filter`); `.site-header` es `position: relative` sin filtro.
- [x] T4 Panel móvil: separador en el `<li>` de la lista, hover/`:focus-visible` con tinte
      8 % y `translateX(6px)` bajo `no-preference`, activo con tinte 12 % y barra
      `inset 3px`.
- [x] T4b `components/back-to-top/back-to-top.component.ts` montado en `app.ts`.

## Desvíos

- Ninguno respecto del design. El botón también lleva `tabindex="-1"` y `aria-hidden`
  mientras está oculto, además de `visibility: hidden`: durante el fade de salida la
  visibilidad se retrasa y así no queda enfocable en ese intervalo.

test_mode: test-after
test_command: npx ng test --watch=false --browsers=ChromeHeadless (con CHROME_BIN)
tests_status: verde (667/667; línea base 654/654)
tests_agregados:
  - frontend/proyecto_angular/src/app/components/back-to-top/back-to-top.component.spec.ts (nuevo)
  - frontend/proyecto_angular/src/app/components/public/site-header/site-header.component.spec.ts
  - frontend/proyecto_angular/src/app/components/public/site-footer/site-footer.component.spec.ts
  - frontend/proyecto_angular/src/app/components/home/home.component.spec.ts
excepciones_sin_test: el hover/desplazamiento del panel móvil y la transición del botón son
  solo CSS visual; se revisan en verify (verificación visual). El alto del panel en estado
  compacto se afirma solo si el viewport del runner es < 1024 px (si no, el panel está en
  `display: none`); siempre se afirma que `.site-header` no tiene `backdrop-filter`,
  `filter` ni `transform`.
logs_conforme: sí (sin logs nuevos)
