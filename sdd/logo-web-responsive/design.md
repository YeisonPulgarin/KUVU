# Design — logo-web-responsive

## Decisión central

El sistema de logo pasa de una matriz **variante × tema** a un eje único de **viewport**:

```
antes                                  ahora
┌────────────┬────────────┐           ┌──────────────┬─────────────────┐
│            │ claro      │ oscuro    │ < 768px      │ >= 768px        │
├────────────┼────────────┼───────────┼──────────────┼─────────────────┤
│ completo   │ logo-light │ logo-dark │              │ logo.web        │
│            │            │           │              │ (Logo_Kuvu.png) │
├────────────┼────────────┼───────────┼──────────────┼─────────────────┤
│ símbolo    │ resp-light │ resp-dark │ logo.resp.   │                 │
│            │            │           │(Logo_Respons │                 │
│            │            │           │  ive.png)    │                 │
└────────────┴────────────┴───────────┴──────────────┴─────────────────┘
```

El tema deja de ser parte del contrato del logo. Ningún binding de `isDark()` participate de la
selección del asset.

## Cambios por archivo

### Producción

| Archivo | Cambio |
|---|---|
| `app/content/logo.ts` | 4 claves → 2: `web`, `responsive`. Rutas a `Logo_Kuvu.png` y `Logo_Responsive.png`. |
| `app/components/public/site-header/site-header.component.html` | `[src]="logo.web"` y `[src]="logo.responsive"` (binding estático, sin `isDark()`). |
| `app/components/public/site-footer/site-footer.component.html` | Igual que el header. |
| `app/components/public/site-footer/site-footer.component.ts` | Elimina `isDark` (queda sin uso tras el cambio) y el import de `Signal` si queda sin uso. `theme` se conserva: es parte de la superficie pública del componente y sus tests la usan. |
| `app/components/landing/landing.component.html` | `src` → `/logo-rediseno/Logo_Kuvu.png`. |
| `app/components/login/login.component.html` | `src` → `/logo-rediseno/Logo_Kuvu.png`. |
| `app/components/shared/navbar/navbar.component.html` | `src` → `/logo-rediseno/Logo_Kuvu.png`. |
| `src/index.html` | favicon → `/logo-rediseno/Logo_Responsive.png`, `type="image/png"`. |

`site-header.component.ts` **no** cambia: `isDark` sigue en uso por los iconos del toggle de
tema, y `logo` se sigue exponiendo al template.

`logo.web` / `logo.responsive` son properties de un objeto, no signals: el template puede
bindear `logo.web` directamente y no hay reactividad que mantener (las rutas nunca cambian en
runtime).

### SCSS

Sin cambios. Los breakpoints y las reglas `.logo-img--full` / `.logo-img--responsive` /
`.footer-logo--full` / `.footer-logo--responsive` ya conmutan por viewport, que es el único eje
que queda. Comportamiento preservado: `Logo_Kuvu.png` (703×271, ratio 2.6) se renderiza con
`w-auto` y `object-fit: contain` en la altura que ya define el SCSS; `Logo_Responsive.png`
(284×223, ratio 1.27) también con `w-auto`.

### Tests (modalidad `test-after`)

| Spec | Cambio |
|---|---|
| `content/content.spec.ts` | Bloque `logo`: 2 rutas exactas + 2 valores distintos. |
| `site-header.component.spec.ts` | `brand`: asserts contra `logo.web` / `logo.responsive`; el test de swap por tema se reescribe como "el tema no cambia el logo". |
| `site-footer.component.spec.ts` | Ídem; el test de swap por tema se reemplaza por la aserción de invariancia. |
| `landing`, `login`, `navbar`, `home` specs | Ruta esperada al logo web. |

Los templates con `src` hardcodeado (landing, login, navbar) siguen con string literal: no
importan `content/logo.ts`, y el criterio de aceptación compara contra la ruta literal, igual
que antes del cambio.

## Nombres de las claves

`web` y `responsive` describen el **uso** (dónde se ve cada una), no el tema. Renombrar las
claves es parte del cambio: `light`/`dark` pasarían a mentir y cualquier código futuro que los
use reintroduciría la variante por tema que este cambio elimina.

## Nombres de los assets

Se conservan `Logo_Kuvu.png` y `Logo_Responsive.png` tal como se entregaron: renombrarlos a
kebab-case agrega churn sin valor y desalinearía los assets del resto del proyecto, que ya
tiene `Logo_Kuvu.jpeg` histórico con esa convención.

## Riesgos

| Riesgo | Mitigación |
|---|---|
| Queda alguna referencia a las claves viejas y el build falla | Los specs de header, footer y `content` acceden al objeto `logo` por propiedad, así que una clave eliminada rompe la compilación de los specs, no en silencio. |
| El logo web no contrasta sobre el header oscuro | Criterio de aceptación 14, verificado en navegador antes de cerrar `verify`. |
| Los PNG no se sirven por la carpeta `public/` | `ng build` los copia a `dist/`; se comprueba en `verify` (criterio 12). |
