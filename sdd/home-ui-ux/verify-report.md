# Verify Report: Home UI/UX — slice único

**Estado:** PASA
**Slices verificados:** `slice-unico` (completo). Sin slices omitidos.
**Modalidad de tests:** `test-after`
**Re-corrida:** sí — (a) verificación inicial marcó 2 desvíos y se volvió a `apply` para el
micro-fix; (b) esta corrida es la **re-verificación final posterior a `secure` + `refine`**,
que confirma que los cambios de esas fases preservaron el comportamiento.

## Tests y build

- `npx ng test --watch=false --browsers=ChromeHeadless` -> **60 SUCCESS / 0 FAILED**
  (58 base + 2 tests de regresión de `secure`).
- `npx ng build` -> **compila**, sin errores. 1 warning pre-existente y fuera de alcance
  (`css-inline-fonts` Syne/Inter en `login`/`landing`, 19.14 kB). La home no dispara budget.
- Sin dependencias nuevas (Geist vía Google Fonts).
- Cobertura: tema, copy audit, label "Ingresar", filas de servicios, `[data-reveal]` y guards
  de storage. No hay código de producción sin cobertura ni excepción sin documentar.

## Criterios de aceptación

| # | Criterio | Resultado | Evidencia |
|---|---|---|---|
| 1 | Geist global; sin Plus Jakarta; titular sin em/en-dash ni itálica | PASA | `styles.css` L5/L18; grep sin Plus Jakarta; tests de hero y copy audit |
| 2 | Contraste AA; verdes de una sola escala; `.yellow` fuera | PASA | hover/active de texto en `brand-600` (light 7.44:1, dark 6.84:1); `.yellow` eliminada (grep = 0) |
| 3 | Secciones `py-32`+ desktop; una sola regla de radio | PASA | `.section` py-20 -> md:py-32 -> xl:py-40; `.logo-img` en `rounded-icon` (12px) |
| 4 | Servicios sin "N cards idénticas"; 5 servicios; compañías wordmarks | PASA | split + lista `divide-y`; test `.service-row` = 5; test sin `.service-card`; 4 wordmarks |
| 5 | Sin em/en-dash visibles; única label "Ingresar" | PASA | tests de copy audit; 4 "Ingresar" (navbar, drawer, hero, CTA final), todas a `/acceder` |
| 6 | Botón de tema; persiste; sin flash; dark en todas las secciones | PASA | script no-flash en `index.html`; tests de theme toggle; tokens `.dark` cubren las superficies |
| 7 | Hero entrance; reveals transform/opacity; reduced-motion | PASA | keyframes `rise-in` + IO bajo `prefers-reduced-motion: no-preference`; bloque `reduce` deja contenido visible |
| 8 | `:focus-visible` en interactivos | PASA | `styles.css` L78-81 (outline 2px brand-500, offset 2px) |
| 9 | Suite en verde; selectores clave conservados | PASA | 60/60; `#hamburger-toggle`, `#mobile-menu`, `.hidden`, `aria-expanded` intactos |
| 10 | `ng build` compila; sin deps nuevas | PASA | build OK |

## Cambios de `secure` y `refine` preservaron comportamiento

- **`secure`:** `readStoredTheme()` / `persistTheme()` envuelven el acceso a `localStorage` en
  `try/catch`. Con storage disponible el comportamiento es idéntico (los tests de tema siguen
  pasando); con storage roto la home renderiza en vez de romperse. +2 tests de regresión.
  Sin cambio de comportamiento observable. Sin secretos a rotar.
- **`refine`:** se borraron las variables SCSS muertas `$brand-*`. Comportamiento idéntico
  (los mismos tokens `var(--color-brand-*)` siguen aplicándose); `ng test` 60/60 y `ng build`
  compilan igual. Métricas neutrales.

## Desvíos

Ninguno. Los 2 desvíos de la verificación inicial (contraste en hover de texto; radio del
logo fuera de escala) quedaron resueltos en el micro-fix previo.

## Observaciones (no bloquean)

- `--radius-card` (16px), `--color-brand-200` y `--color-brand-300` definidos sin uso actual en
  la home: son parte de la escala documentada en `design.md`. Registrados en `refine-report`.
- Botón WhatsApp: glifo blanco sobre `#25d366` (~1.99:1). Botón solo-ícono (no texto), fuera del
  alcance literal del AC #2; patrón pre-existente de la marca WhatsApp.
- `DEVELOPMENT_GUIDELINES.md` sigue siendo el template sin adaptar (placeholders `{}` y
  secciones Go/Next/Astro). Archivo gestionado por el instalador; pre-existente.
- `sdd.config.md` apunta el comando de test a `fronted/proyecto_angular` (directorio viejo); el
  real es `frontend/proyecto_angular`. Drift de config a corregir (fuera del alcance de apply).
- Comentarios de código en español en `styles.css` / `home.component.scss` /
  `home.component.ts` (la tabla de naming pide inglés). Pre-existente en el proyecto.

## Ejes del protocolo

- **Documentación declarada:** `tasks.md` declara el alcance de `document`
  (openapi false, changelog true, readme false, architecture false, guidelines true). OK.
- **Guidelines:** identificadores en inglés OK; comentarios en español (observación arriba).
- **Logs:** `logs_conforme: n/a` — no se agrega logging (cambio visual de UI). OK.

## CI check

Extensión `git` **inactiva** en `sdd.config.md` -> no aplica CI check.
