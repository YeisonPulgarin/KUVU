# Apply-progress — slice `contenido`

Cambio: `sitio-contenido`

## Estado

- [x] T01 — Módulos de contenido (creados y testeado)
- [ ] T02..T10 — otros slices (fuera de este `apply`)

## Desvíos del plan

Ninguno. `site.ts` además de `contact`/`buildWhatsAppLink` expone `contactWhatsAppLink`
(link ya armado) para simplificar el consumo en chrome/páginas.

```
test_mode: test-after
test_command: $env:CHROME_BIN='C:\Program Files\Google\Chrome\Application\chrome.exe'; npx ng test --watch=false --browsers=ChromeHeadless (workdir: frontend/proyecto_angular)
tests_status: verde
tests_agregados:
  - frontend/proyecto_angular/src/app/content/content.spec.ts
excepciones_sin_test: (vacío)
logs_conforme: n/a — no hay logging nuevo en este slice
commit: n/a — extensión `git` no está activa en sdd.config.md
```

## Verificación "el test puede fallar"

Se rompió a propósito `buildWhatsAppLink` (sin `encodeURIComponent`) y el spec
"should expose a ready-to-use contact link…" falló por la razón esperada (falta `%20`).
Implementación revertida y suite en verde (75/75).

## Archivos del slice

- `src/app/content/{types,index,site,services,companies,howItWorks,benefits,security,origin,about,faq}.ts`
- `src/app/content/content.spec.ts`