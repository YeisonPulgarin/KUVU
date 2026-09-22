# Apply Progress: Home UI/UX — slice único

**Estado:** completado
**Modalidad de tests:** `test-after`
**Slice:** `slice-unico` (no corresponde al slice `frontend` declarado; ver `tasks.md`)

## Tareas ejecutadas

| # | Tarea | Estado |
|---|-------|--------|
| 1 | Tokens globales y tipografía (`styles.css` + `index.html`) | ✅ |
| 2 | Dark mode en el componente (`home.component.ts`) | ✅ |
| 3 | Reestructura del template (`home.component.html`) | ✅ |
| 4 | Estilos rediseñados (`home.component.scss`) | ✅ |
| 5 | Animaciones (CSS + IntersectionObserver) | ✅ |
| 6 | Tests (`home.component.spec.ts`) | ✅ |
| 7 | Regresión final (`ng test` + `ng build`) | ✅ |

## Archivos tocados

| Archivo | Cambio |
|---|---|
| `frontend/proyecto_angular/src/styles.css` | Geist 400–800; `@theme` con escala brand (700/600/500/300/200/100), neutros `home-*` light, radios pill/card/icon; `@custom-variant dark`; overrides `.dark` (superficies, brand-500 aclarado, brand-600 y brand-100 para chips/títulos); `:focus-visible` global |
| `frontend/proyecto_angular/src/index.html` | Script inline de tema (no-flash) antes del bootstrap; título sin em-dash (`KUVU. Gestión de arriendos`) |
| `frontend/proyecto_angular/src/app/components/home/home.component.ts` | `isDark` + `toggleTheme()` con persistencia `localStorage('kuvu-theme')`; init en `ngOnInit`; `prefersReducedMotion`; `IntersectionObserver` para `[data-reveal]` en `ngAfterViewInit`; `ngOnDestroy` desconecta el observer |
| `frontend/proyecto_angular/src/app/components/home/home.component.html` | Hero (línea de marca `KUVU.` + titular sin em-dash, sin eyebrow, CTA "Ingresar"); navbar con botón de tema y CTA "Ingresar"; servicios como split + lista de 5 filas `[data-reveal]`; compañías como wordmarks `[data-reveal]`; CTA final "Ingresar" |
| `frontend/proyecto_angular/src/app/components/home/home.component.scss` | Rediseño con tokens; radios pill/card/icon; secciones `py-20`→`py-32`/`py-40`; keyframes `rise-in` con stagger; reveals con `--reveal-index`; hovers solo `transform`; todo el bloque de animación bajo `prefers-reduced-motion: no-preference` |
| `frontend/proyecto_angular/src/app/components/home/home.component.spec.ts` | 17 tests existentes ajustados + nuevos: tema (`toggleTheme`), copy audit (sin em-dash/en-dash), label "Ingresar" ×3, servicios como filas (no cards), `[data-reveal]` |
| `frontend/proyecto_angular/angular.json` | Budget `anyComponentStyle.maximumWarning` 10kb → 17kb (ver Desvíos) |

## Verificación

- `npx ng test --watch=false --browsers=ChromeHeadless` → **58 SUCCESS** (0 fallos).
- `npx ng build` → **compila**; sin errores. Queda 1 warning pre-existente y fuera de alcance:
  `css-inline-fonts` de Syne/Inter inlinadas en `login.component.scss` / `landing.component.scss`
  (19.14 kB). La home ya no dispara budget.
- Sin dependencias nuevas. Geist entra vía Google Fonts.

## Desvíos del plan

1. **Budget `anyComponentStyle`:** el warning ya se disparaba antes de este cambio
   (`home.component.scss` ≈ 15.61 kB con umbral 10 kB). Tras el rediseño queda en 16.07 kB.
   Se sube el umbral de warning a 17 kB (error sin cambios: 20 kB) siguiendo `tasks.md` tarea 4.
   El warning restante de Syne/Inter en login/landing es pre-existente y fuera de alcance
   (no-goal: no se rediseñan login ni landing); queda visible a propósito.
2. **Botón "Pagar" del navbar:** se conserva (intención distinta de "Ingresar"; no es CTA
   duplicado). Se estiliza con los tokens nuevos (pill outline + caret).
3. **`.yellow` → `.ghost`:** la clase `.yellow` que se pintaba de verde se reemplaza por
   `.ghost` (ícono transparente); el verde de WhatsApp queda como verde de WhatsApp real.
4. **Overrides dark de `brand-100`/`brand-600`:** no estaban listados explícitamente en
   `design.md`; se agregan para que los chips de íconos y los títulos de sección mantengan
   contraste AA en modo oscuro.

## Excepciones de test

- Ninguna. El slice cierra con cobertura para el comportamiento agregado (tema, reveals,
  estructura y copy audit).

## Logs

`logs_conforme`: **n/a** — el cambio no agrega logging. Es un cambio visual de UI (Angular):
no hay logger inyectado, no se agregan `console.*` ni eventos. La política de logs de
`DEVELOPMENT_GUIDELINES.md` no aplica.

## Post-verify (micro-fix)

Tras la verificación inicial (2 desvíos), se corrigió en `home.component.scss`:

- Contraste AA: hover/active de `.nav-item`, drawer móvil y `.company-item` pasan de
  `--color-brand-500` (3.68:1) a `--color-brand-600` (light 7.44:1, dark 6.84:1).
- Radio: `.logo-img` pasa de `rounded` (4px) a `rounded-icon` (12px), dentro de la escala.

Re-verificado: `ng test` 58/58 SUCCESS; `ng build` compila.
