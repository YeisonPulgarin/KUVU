# Apply-progress — slice `chrome`

Cambio: `sitio-contenido`

## Estado

- [x] T02 — ThemeService (creado y testeado)
- [x] T03 — RevealDirective (creado y testeado) + CSS reveal movido a global
- [x] T04 — SiteHeader + SiteFooter compartidos (creados y testeados)
- [x] T05 — PageMetaService (creado y testeado)
- [x] T06 — Home refactorizada a chrome compartido + favicon corregido
- [ ] T07..T10 — otros slices (fuera de este `apply`)

## Desvíos del plan

- **Controles muertos eliminados:** el header viejo tenía botones sin acción
  (búsqueda, correo y "Pagar"). El `SiteHeader` nuevo solo expone el CTA
  "Ingresar", el link de WhatsApp y el toggle de tema. Documentado como
  decisión: eran dead controls sin handler.
- **Nav bar con 5 enlaces:** `SiteHeader` toma `navLinks` por `input()` con
  default = `navLinks` (anclas de la home, ahora incluye `#como-funciona`,
  sección que llega en el slice `home-expandida`).
- **`input()` es la API de bindeo:** en spec, establecer input vía
  `component.navLinks = x` falla TS2540 (propiedad read-only); se usa
  `fixture.componentRef.setInput('navLinks', x)`.
- El reveal CSS pasó de estar scoped en `home.component.scss` a global en
  `src/styles.scss`, porque las páginas nuevas (nosotros, preguntas
  frecuentes) lo reutilizan; la directiva maneja el stagger por hermanos.

```
test_mode: test-after
test_command: $env:CHROME_BIN='C:\Program Files\Google\Chrome\Application\chrome.exe'; npx ng test --watch=false --browsers=ChromeHeadless (workdir: frontend/proyecto_angular)
tests_status: verde
tests_agregados:
  - frontend/proyecto_angular/src/app/services/theme.service.spec.ts
  - frontend/proyecto_angular/src/app/directives/reveal.directive.spec.ts
  - frontend/proyecto_angular/src/app/components/public/site-header/site-header.component.spec.ts
  - frontend/proyecto_angular/src/app/components/public/site-footer/site-footer.component.spec.ts
  - frontend/proyecto_angular/src/app/services/page-meta.service.spec.ts
tests_actualizados:
  - frontend/proyecto_angular/src/app/components/home/home.component.spec.ts
    (tests de tema/menú migrados a theme.service.spec + site-header.component.spec)
excepciones_sin_test: (vacío)
logs_conforme: n/a — no hay logging nuevo en este slice
commit: n/a — extensión `git` no está activa en sdd.config.md
```

## Verificación "el test puede fallar"

La primera corrida de la suite falló en compilación con TS2540 por asignar
directamente el `input` en el spec del header; se corrigió con
`componentRef.setInput`. `ng build` (AOT, strict templates) compila correcto
(solo aparece el warning de budget de fuentes preexistente).

## Archivos del slice

- `src/app/services/theme.service.ts` + spec
- `src/app/directives/reveal.directive.ts` + spec
- `src/app/components/public/site-header/{site-header.component.ts,html,scss,spec.ts}`
- `src/app/components/public/site-footer/{site-footer.component.ts,html,scss,spec.ts}`
- `src/app/services/page-meta.service.ts` + spec
- `src/app/components/home/{home.component.ts,html,scss,spec.ts}` (refactor)
- `src/index.html` (favicon → `/Logo_Kuvu.jpeg`)
- `src/styles.scss` (CSS reveal global)
- `src/app/content/site.ts` (agregado `pageNavLinks`)