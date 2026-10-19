# Apply progress — home-profesional / contenido

Rama: `feat/home-profesional`. Slice 1 de 5. Estado: **completo**.

## Tareas

| # | Tarea | Estado |
|---|---|---|
| T1.1 | Tipos nuevos (`PageKey`, `PageMeta`, `Responsible`, `ResponsibleField`, `RichSegment`, `RichText`, `LegalBlock`, `LegalDocument`, `ContactSubject`, `ContactStep`) en `content/types.ts` | hecho |
| T1.2 | `sitePages` + `siteNavLinks` y `breadcrumbFor` sobre `sitePages` en `content/site.ts`; `navLinks`/`pageNavLinks` se conservan hasta T4.4 | hecho |
| T1.3 | `content/responsible.ts`: campos `null`, `placeholderLabel`, `responsibleText()` | hecho |
| T1.4 | `content/legal.ts`: aviso, última actualización, 4 documentos (13 puntos de HP-14, HP-15), `browserStorageUses`, `richTextToPlain()` | hecho |
| T1.5 | `content/contact.ts`: textos de página, 4 asuntos, 3 pasos, consentimiento enlazado, etiquetas y errores | hecho |
| T1.6 | `content/pages.ts`: `pageMeta` de las 7 páginas, 404 con `noindex` | hecho |
| T1.7 | `content/faq.ts`: grupo "Contacto y datos" con 4 preguntas | hecho |
| T1.8 | Barrel (`index.ts`) y tests de contenido | hecho |

## Desvíos del plan

1. **Nuevo módulo `content/legal-index.ts` y frontera del barrel.** Exportar `legal.ts` y
   `contact.ts` desde `content/index.ts` dejaba sus textos en el chunk compartido del bundle
   inicial: 505 kB contra un presupuesto de 500 kB (base: 495 kB). `legal.ts` y `contact.ts`
   salen del barrel; los importan directo solo las páginas lazy. `legal-index.ts`
   (`legalAnchors`, `legalTitles`, `legalIndex`) es el índice liviano para footer y contacto.
   Registrado en `design.md` §2. Impacto en slices siguientes: el footer (T2.8) usa
   `legalIndex`; `/legal` (T3.4) importa `content/legal`; `/contacto` (T3.3) importa
   `content/contact`.
2. **Cookies: 3 categorías, no 4.** En `main`, `intro-state.service.ts` guarda la intro vista
   solo en memoria (la persistencia en `localStorage` existe en `feat/acceso-orden-e-intro`,
   commit 2058d41). La política lista lo que el sitio usa en esta base: tema, sesión iniciada
   y empresa preseleccionada. Corregidos `explore.md`, `spec.md` (CA-15.2), `design.md` y
   `tasks.md`. Al integrar `feat/acceso-orden-e-intro` hay que sumar la entrada "intro vista".
3. **`RichSegment` de enlace** lleva `fragment` opcional además de `link` y `label` (el
   diseño lo nombraba como "routerLink + fragment").
4. Los helpers internos de `legal.ts` se reemplazan por literales de objeto (sin llamadas a
   nivel de módulo) para que el módulo sea tree-shakeable.

## Resultado

- Suite base antes del slice: 178 tests en verde.
- Suite al cerrar: **211 tests, 211 SUCCESS, 0 FAILED** (+33 nuevos en `content.spec.ts`).
- `ng build`: compila; initial total **495.37 kB** (presupuesto 500 kB). El único warning es
  el presupuesto de fuentes inline de Google Fonts (19.14 kB vs 17 kB), preexistente.

```
test_mode: test-after
test_command: $env:CHROME_BIN='C:\Program Files\Google\Chrome\Application\chrome.exe'; npx ng test --watch=false --browsers=ChromeHeadless (desde frontend/proyecto_angular) + npx ng build
tests_status: verde
tests_agregados: frontend/proyecto_angular/src/app/content/content.spec.ts
excepciones_sin_test: (vacío)
logs_conforme: sí — el slice no agrega logs (solo módulos de contenido)
```

## Commit

Ver `git log` de `feat/home-profesional`: `feat(contenido): ...` (sin push, por indicación del
orquestador; la extensión `git` está inactiva).
