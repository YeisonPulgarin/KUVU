# Apply-progress — slice `home-expandida`

Cambio: `sitio-contenido`

## Estado

- [x] T07 — Home expandida: secciones nuevas + contenido centralizado
- [ ] T08..T10 — otros slices (fuera de este `apply`)

## Desvíos del plan

- **Navbar sin enlaces de página:** el diseño sugería mezclar anclas con enlaces a
  `/nosotros` y `/preguntas-frecuentes` en la nav de la home. Se mantuvo solo anclas
  (home es scroll de una página): el FAQ corto enlaza a `/preguntas-frecuentes` y el
  footer a las dos páginas. La nav creció a 7 anclas: Inicio, Qué es KUVU, Cómo
  funciona, Servicios, Beneficios, Seguridad, Compañías.
- **Header desktop pasa a `lg` (≥1024px):** con 7 anclas + acciones, el breakpoint `md`
  (768px) desbordaba. `nav-links`, `nav-actions` y `hamburger-btn`/`mobile-menu` usan
  `>=1024px`; en tablets queda el drawer.
- **Secciones en orden RF-1:** hero → qué es → cómo funciona → servicios → beneficios →
  seguridad → compañías → origen → FAQ corto → CTA final (las 5 nuevas respetan su
  orden relativo).
- Icons de servicios renderizados por `ngSwitch` sobre `Service.icon` (presentación,
  el contenido sigue en `content/services.ts`).

```
test_mode: test-after
test_command: $env:CHROME_BIN='C:\Program Files\Google\Chrome\Application\chrome.exe'; npx ng test --watch=false --browsers=ChromeHeadless (workdir: frontend/proyecto_angular)
tests_status: verde
tests_agregados:
  - home.component.spec.ts → bloque "expanded sections" (cómo funciona, beneficios por rol,
    seguridad sin mecanismos, origen, FAQ corto con enlace, orden de las 5 secciones)
  - home.component.spec.ts → nav ampliada (#beneficios, #seguridad)
tests_actualizados:
  - content/site.ts → navLinks (7 anclas)
excepciones_sin_test: (vacío)
logs_conforme: n/a — no hay logging nuevo en este slice
commit: n/a — extensión `git` no está activa en sdd.config.md
```

## Verificación "el test puede fallar"

Se mutó a propósito `homeFaqCount` (4 → 6) en `content/faq.ts`: 2 tests fallaron
(`should render a short FAQ…` y el spec de contenido). Implementación revertida y
suite en verde.

## Archivos del slice

- `src/app/components/home/{home.component.ts,html,scss}` (+ spec)
- `src/app/content/site.ts` (navLinks ampliada)
- `src/app/components/public/site-header/site-header.component.scss` (breakpoints lg)