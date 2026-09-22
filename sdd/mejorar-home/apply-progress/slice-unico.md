# Apply Progress: mejorar-home / slice-único

## Estado de tareas

### Cambio original (completo)
| # | Tarea | Estado |
|---|-------|--------|
| 1 | Instalar Tailwind CSS v4 + @tailwindcss/postcss | ✅ completa |
| 2 | Crear `tailwind.config.js` (referencia v3, eliminado en v4) | ✅ — se creó y se documentó que v4 no lo usa activamente |
| 3 | Crear `postcss.config.js` con `@tailwindcss/postcss` plugin | ✅ completa |
| 4 | Inyectar `@import "tailwindcss"` + `@theme` en `styles.scss` | ✅ completa |
| 5 | Agregar `isMobileMenuOpen` y `toggleMenu()` en `home.component.ts` | ✅ completa |
| 6 | Refactorizar `home.component.scss` con `@apply` (Tailwind v4, media queries nativas) | ✅ completa |
| 7 | Refactorizar `home.component.html` con menú hamburguesa + accesibilidad | ✅ completa |
| 8 | Escribir tests unitarios (`home.component.spec.ts`) | ✅ completa |

### Extensión de contenido (nuevo alcance, aprobado en Gate A)
| # | Tarea | Estado |
|---|-------|--------|
| 5 | Hero fullsize (min-h-screen, titular, subtítulo, CTA → /acceder) | ✅ completa |
| 6 | Secciones "¿Qué es KUVU?", "Servicios" (5 tarjetas), "Compañías" (Amarilo, Nido Rent, Balcones de San Soucci, Mi Inmueble), CTA final | ✅ completa |
| 7 | Navbar ajustado a anclas de secciones (#inicio, #que-es, #servicios, #companias) en desktop y drawer móvil | ✅ completa |
| 8 | Tests ampliados (17 tests: hero, secciones, CTA, navbar) | ✅ completa |

## Metadatos

```
test_mode: test-after
test_command: ng test --watch=false --browsers=ChromeHeadless
tests_status: verde (17/17 SUCCESS tras la extensión de contenido)
tests_agregados:
  - src/app/components/home/home.component.spec.ts (ampliado: 9 → 17 tests)
excepciones_sin_test: ninguna
logs_conforme: sí (no se agregaron logs en este cambio de UI)
```

## Desvíos del plan original
- **Tailwind v4 instalada (se esperaba v3):** La versión 4.3.3 fue instalada (latest). Se adaptó la configuración: se eliminó la dependencia del `tailwind.config.js` (no activo en v4), se reemplazaron las tres directivas `@tailwind` por `@import "tailwindcss"` en `styles.scss`, se usó `@theme` para custom colors y media queries nativas (`width >= 768px`) en lugar de `@screen md`.

## Corrección post-verify (configuración de build) — re-campaña de `apply`
Durante `verify` el build falló (no compilaba). Se corrigió la configuración de Tailwind v4 +
Angular 21 (ver `verify-report.md` → desvío crítico). Cambios de esta corrección:

- **Eliminado `tailwind.config.js`:** era lo que hacía que Angular (`getTailwindConfig`) usara
  `tailwindcss` como plugin de PostCSS directo, roto en v4. Obsoleto en v4 (la config vive en
  `@theme` del CSS).
- **Eliminado `postcss.config.js` (JS):** Angular solo lee config de PostCSS en JSON
  (`postcss.config.json` / `.postcssrc.json`), así que el `.js` era ignorado y `@tailwindcss/postcss`
  nunca se activaba.
- **Creado `postcss.config.json`** con `{ "plugins": { "@tailwindcss/postcss": {} } }` — configuración
  que Angular sí lee y activa el plugin correcto de Tailwind v4.
- **Agregado `@reference "../../../styles.css";`** al inicio de `home.component.scss` — necesario en
  Tailwind v4 para que `@apply` funcione en stylesheets de componente (acceso a theme/utilities sin
  duplicar el CSS).
- **Movido el `@import` de Google Fonts antes del `@import "tailwindcss"`** en `src/styles.css` para
  respetar el orden de imports (evita warning `All "@import" rules must come first`).

**Resultado post-corrección:** `ng test` → **9/9 SUCCESS** en verde; `ng build` (producción) →
compila correctamente. Quedan solo warnings de budget no bloqueantes (component SCSS 10.83 kB vs
10 kB budget).

Nota: `tasks.md` indicaba inyectar `@import "tailwindcss"` en `styles.scss`, pero la integración quedó
en `src/styles.css` (que es donde `angular.json` carga Tailwind global), con `styles.scss` reservado
para estilos compartidos de componentes. Verificación estática coherente.

## Desvío post-extensión (budget SCSS)
- El `home.component.scss` creció a **15.61 kB** (budget: 10 kB) al agregar las secciones nuevas
  (hero, about, services, companies, cta-final). Es un **warning no bloqueante** del build; el
  bundle sigue compilando. Se registra para `document` (sin acción correctiva en este cambio;
  si el template vuelve a crecer, el budget del componente se ajusta en `angular.json`).
- Los CTA usan `routerLink` estático; los tests verifican el `href` renderizado (no
  `ng-reflect-router-link`, que solo aparece con binding dinámico).

## Archivos modificados (cambio original + corrección)
- `package.json` (deps: tailwindcss, postcss, autoprefixer, @tailwindcss/postcss)
- ~~`tailwind.config.js`~~ (creado y luego **eliminado** en la corrección)
- ~~`postcss.config.js`~~ → reemplazado por `postcss.config.json` (nuevo)
- `postcss.config.json` (nuevo)
- `src/styles.css` (import de fuente reordenado)
- `src/styles.scss`
- `src/app/components/home/home.component.ts`
- `src/app/components/home/home.component.scss`
- `src/app/components/home/home.component.html`
- `src/app/components/home/home.component.spec.ts`

## Extensión de contenido — archivos modificados
- `src/app/components/home/home.component.html` (hero fullsize + 4 secciones + navbar ajustado)
- `src/app/components/home/home.component.scss` (estilos del hero y secciones nuevas; eliminados
  `.hero-title` viejo, `.layout-grid`, `.sidebar`, `.image-banner`, `.main-content`)
- `src/app/components/home/home.component.spec.ts` (17 tests)
