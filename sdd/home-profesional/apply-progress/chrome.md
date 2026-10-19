# Apply progress — home-profesional / chrome

Rama: `feat/home-profesional`. Slice 2 de 5. Estado: **completo**.

## Tareas

| # | Tarea | Estado |
|---|---|---|
| T2.1 | `PageMetaService`: `setPage(PageMeta)` (title, description, og, twitter, canonical, robots), `setJsonLd`/`clearJsonLd`, `absolute()`, `SHARE_IMAGE_PATH`; breadcrumb sobre `setJsonLd` | hecho |
| T2.2 | `app.config.ts`: `withInMemoryScrolling({ scrollPositionRestoration: 'top', anchorScrolling: 'enabled' })` | hecho |
| T2.3 | `index.html`: title, description, og y twitter por defecto | hecho |
| T2.4 | `styles.scss`: `scroll-padding-top`, `.section-eyebrow`, `.link-arrow`, `.hover-lift`, view transitions sin animación bajo `reduce` | hecho |
| T2.5 | `app-rich-text` + spec | hecho |
| T2.6 | `app-service-icon` + spec | hecho |
| T2.7 | `site-header`: nav única, página activa, compacto por scroll, menú móvil a pantalla completa | hecho |
| T2.8 | `site-footer`: marca / Sitio / Legal / Contacto | hecho |
| T2.9 | `app-public-page` + spec | hecho |

## Desvíos del plan

1. **`/acceder` y `/login` pasan a `loadComponent`.** El header y el footer nuevos dejaban el
   bundle inicial en 504.6 kB (presupuesto 500 kB). `LandingComponent` y `LoginComponent`
   estaban importados de forma eager en `app.routes.ts` sin que la home los use. Al cargarlos
   bajo demanda, el inicial baja a **420.6 kB**. No cambia el comportamiento del acceso
   (mismas rutas, mismos componentes); aplica RNF-04. Se adelanta así una parte de T3.6.
2. **`setPage` cambia de firma** (`setPage(PageMeta)`): `nosotros` y `preguntas-frecuentes`
   pasan a `setPage(metaByPage.x)` en este slice para que compile (su migración completa a
   `app-public-page` sigue en T4.2/T4.3).
3. **Sticky real del header.** `position: sticky` pasa al host (`:host`), porque en el
   elemento interno no se pegaba (el host medía lo mismo que el header). `app-public-page` usa
   `overflow-x: clip` (con `hidden`, el wrapper es contenedor de scroll y el sticky no
   funciona). La home, `/nosotros` y `/preguntas-frecuentes` todavía usan `overflow-x:
   hidden`; se corrige en el slice `home`.
4. **Menú móvil hasta 1024 px**, no 768 px: se conserva el breakpoint que el header ya usaba,
   porque 5 enlaces más las acciones no entran en una tablet de 768 px. El panel ocupa la
   pantalla debajo de la barra; el mismo botón (con ícono X y etiqueta "Cerrar menú") lo
   cierra. Mientras está cerrado tiene `inert` y `aria-hidden`.
5. **Input `navLinks` del header** se mantiene, con default `siteNavLinks`, hasta T4.4.
6. **Botón de WhatsApp del footer** usa `#1a7a43` (5.4 : 1 con texto blanco) en lugar de
   `#25d366` (2 : 1).
7. **`og:image` de `index.html`** es una ruta relativa: no hay dominio de producción
   declarado. `PageMetaService` publica la URL absoluta sobre el origen.
8. El test de la home que esperaba anclas en la nav se reescribe para la navegación única
   (cambio de comportamiento pedido por HP-01).

## Resultado

- Suite: **234 tests, 234 SUCCESS, 0 FAILED** (211 → 234).
- `ng build`: initial total **420.61 kB** (presupuesto 500 kB). Warning preexistente de
  fuentes inline (19.14 kB vs 17 kB).

```
test_mode: test-after
test_command: $env:CHROME_BIN='C:\Program Files\Google\Chrome\Application\chrome.exe'; npx ng test --watch=false --browsers=ChromeHeadless + npx ng build (desde frontend/proyecto_angular)
tests_status: verde
tests_agregados: src/app/services/page-meta.service.spec.ts, src/app/components/public/rich-text/rich-text.component.spec.ts, src/app/components/public/service-icon/service-icon.component.spec.ts, src/app/components/public/public-page/public-page.component.spec.ts, src/app/components/public/site-header/site-header.component.spec.ts, src/app/components/public/site-footer/site-footer.component.spec.ts, src/app/components/home/home.component.spec.ts (1 test adaptado)
excepciones_sin_test: index.html y styles.scss (meta estáticas y CSS: sin comportamiento testeable en Karma; se revisan en verify)
logs_conforme: sí — el slice no agrega logs
```
