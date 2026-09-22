# Apply-progress — slice `paginas`

Cambio: `sitio-contenido`

## Estado

- [x] T08 — Página `/nosotros` (component + template + styles + spec + ruta lazy)
- [x] T09 — Página `/preguntas-frecuentes` (component + template + styles + spec + ruta lazy)
- [ ] T10 — cierre config y docs (fase `document`, fuera de este `apply`)

## Desvíos del plan

- **Selector de reveals**: la continuación decía `appReveal`, pero el `RevealDirective`
  real tiene selector `[data-reveal]` (patrón ya usado en la home). Los templates de ambas
  páginas usan `data-reveal` y la directiva va importada en el componente.
- **`setPage` fija también el `title`**: `PageMetaService.setPage(title, description)`
  sobreescribe el `title` del router (`Nosotros · KUVU`) con el de `setPage`
  (`Nosotros | KUVU`). Es el comportamiento decidido en la continuación (design D4:
  `title` vía router + `description` vía service; el `setPage` asienta ambos). La ruta
  conserva su `title` como fallback previo al `ngOnInit`.
- **Reveal en FAQ**: `data-reveal` se aplica al grupo (`.faq-group`), no a cada item — evita
  flashear pregunta por pregunta; consistente con el stagger por hermanos de la directiva.
- **Hero de página sin animación orquestada**: ambas páginas usan `.page-hero` estático
  (sin `rise-in`), a diferencia del hero de la home que es la única escena orquestada del
  sistema. Consistente con el principio MOTION del proyecto (un solo momento orquestado).

```
test_mode: test-after
test_command: $env:CHROME_BIN='C:\Program Files\Google\Chrome\Application\chrome.exe'; npx ng test --watch=false --browsers=ChromeHeadless (workdir: frontend/proyecto_angular)
tests_status: verde — 119/119 (antes 102; +17 de este slice)
tests_agregados:
  - frontend/proyecto_angular/src/app/components/pages/nosotros/nosotros.component.spec.ts
  - frontend/proyecto_angular/src/app/components/pages/preguntas-frecuentes/preguntas-frecuentes.component.spec.ts
tests_actualizados:
  - frontend/proyecto_angular/src/app/app.routes.ts (2 rutas lazy con title, antes del wildcard)
excepciones_sin_test: (vacío)
logs_conforme: n/a — no hay logging nuevo en este slice
commit: n/a — extensión `git` no está activa en sdd.config.md
```

## Verificación "el test puede fallar"

`preguntas-frecuentes.component.spec.ts` valida 1:1 contra `faqGroups` (cantidad de grupos,
títulos, preguntas por grupo y respuestas), así que un cambio en el contenido rompe la
cobertura de la página. La suite completa y `ng build` (AOT, strict templates) compilan
correcto; solo aparece el warning de presupuesto de fuentes preexistente y ajeno (Google
Fonts Syne/Inter del template original).

## Archivos del slice

- `src/app/components/pages/nosotros/{nosotros.component.ts,html,scss,spec.ts}`
- `src/app/components/pages/preguntas-frecuentes/{preguntas-frecuentes.component.ts,html,scss,spec.ts}`
- `src/app/app.routes.ts` (rutas `/nosotros` y `/preguntas-frecuentes`, lazy, con title)