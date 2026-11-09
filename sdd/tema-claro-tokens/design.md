# Design — tema-claro-tokens

Referencias: `sdd/tema-claro-tokens/propose.md`, `sdd/tema-claro-tokens/spec.md` (RF-01..RF-07,
CA-01..CA-10), `sdd/tema-claro-tokens/explore.md`.

## Arquitectura afectada

Los tokens de marca del sitio público tienen una cadena de resolución de tres niveles:

1. **Declaración:** bloque de tokens en `frontend/proyecto_angular/src/styles.css`. Tailwind lo
   compila a `@layer theme { :root, :host { … } }` en el CSS global (`styles-*.css`).
2. **Override oscuro:** bloque `.dark { … }` del mismo archivo, sin capa. Como las reglas sin capa
   ganan sobre `@layer theme` sin importar la especificidad, cuando `<html>` tiene la clase `dark`
   sus nueve valores reemplazan a los de `:root`. Los seis tokens que `.dark` no declara
   (`brand-200/300/700`, radios) se heredan de `:root` (RF-02).
3. **Consumo:** SCSS de componentes con encapsulación emulada de Angular, que leen
   `var(--token)`. Los tokens se heredan desde `<html>` a cualquier elemento, así que no hace falta
   declararlos en ningún componente.

El cambio toca el nivel 1 (cuándo se emite) y el nivel 3 (quita los fallbacks). El nivel 2 queda
igual.

## Decisiones técnicas

### D-1 — `@theme static` en el bloque de tokens de marca

El bloque `@theme { … }` de `styles.css` pasa a `@theme static { … }`. Con `static`, Tailwind
emite todas las variables del bloque en `:root, :host` aunque ninguna utilidad las use. Solo
afecta a ese bloque: la paleta por defecto de Tailwind, que viene de `@import "tailwindcss"`,
sigue emitiéndose bajo demanda.

**Comprobado en la fase de design** (build de prueba, revertido): con `@theme static`, el
`:root, :host` del CSS global contiene los 15 tokens con sus valores (CA-01). `styles-*.css` pasa
de 28.775 a 29.118 bytes (+343 B, CA-09). El total inicial pasa de 438,51 a 438,85 kB. No aparecen
warnings nuevos: el único sigue siendo `css-inline-fonts`. Los chunks lazy que usan
`@reference "../../../../styles.css"` (contacto, legal, nosotros) no reciben un `:root` propio,
porque `@reference` no emite CSS. Siguen consumiendo `var(--radius-*)` del global.

**Descartadas:**

- *Repetir los tokens en un `:root` propio:* son dos fuentes que se pueden desincronizar, y
  justamente eso es lo que la decisión del usuario evita.
- *`@theme inline`:* reemplaza `var(--token)` por el literal solo dentro de las utilidades. No
  declara variables, así que no resuelve `var()` en SCSS, que es el patrón del proyecto.
- *Usar utilidades de Tailwind para que se emitan los tokens:* el tema claro quedaría dependiendo
  de efectos secundarios del escaneo, y es una migración fuera de alcance.

### D-2 — Quitar los fallbacks literales con una sustitución mecánica

Cada `var(--color-home-*, literal)`, `var(--color-brand-*, literal)` y
`var(--radius-*, literal)` de `frontend/proyecto_angular/src` pasa a `var(--token)`. Son 89
ocurrencias en 15 archivos (lista en `explore.md`). La sustitución es segura porque:

- todos los literales son idénticos al valor de `@theme` (verificado en explore), así que en tema
  claro el resultado calculado no cambia (RF-05);
- en tema oscuro hoy no actúan los fallbacks de los tokens que `.dark` declara. Los de
  `brand-300` y `radius-pill` sí actúan, y su literal es el mismo valor claro que pasa a heredarse
  de `:root` (RF-06).

Se cuida el caso de propiedades personalizadas intermedias (`--header-surface`,
`--header-border`, `--team-band-green`): solo se quita el fallback y la indirección queda igual.
Los comentarios que justifican los fallbacks dejan de ser ciertos y se quitan:
`companies-marquee.component.scss` (~l. 56), `home.component.scss` (~l. 235),
`steps-journey.component.scss` (~l. 108), `team-band.component.scss` (~l. 6-8) y
`breadcrumb.component.scss` (~l. 4-5).

Los specs que arman los nombres de tokens por partes, para que Tailwind no los detecte al
escanear, quedan como están: con `@theme static` el escaneo ya no influye, y cambiarlos no aporta.

### D-3 — `.dark` sin cambios

No se agregan overrides. `brand-200/300/700` y los radios toman en oscuro el valor claro
(decisión del usuario, RF-02).

### D-4 — Cobertura de tests

Modalidad `test-after`. La cobertura automatizada es la de Karma, que carga `styles.css` igual que
el build (`angular.json` → `test.options.styles`):

- Las aserciones de color resuelto de `steps-journey.component.spec.ts` (línea y riel) dejan de
  apoyarse en el fallback y pasan a depender de que el token exista en `:root`. Si `@theme static`
  se revierte, fallan. Esa es la red de regresión.
- No se agrega un test de presencia de los 15 tokens (no-objetivo aceptado).
- El resto de la verificación (CA-02, -03, -05, -06, -07) es en navegador con el script CDP.
  En el `apply-progress` queda registrado como excepción documentada: cambio puramente visual.

### D-5 — Script de QA visual (CDP)

Se recrea en el scratchpad de la sesión (fuera del repo): Node 22 con `WebSocket` nativo, Chrome
headless con `--remote-debugging-port`, y el build de producción servido en local. Para cada ruta
pública, viewport (1280×800 y 375×800) y tema (claro, y oscuro con `localStorage['kuvu-theme']` =
`'dark'` antes de navegar, que es lo que lee el script inline de `index.html`):

- lee los 15 tokens con `getComputedStyle(document.documentElement)` (CA-02, CA-03);
- mide el fondo, el borde y el radio calculados de una tarjeta de paso, un número de paso y un
  ícono de servicio (CA-05);
- guarda una captura de página completa.

Se corre dos veces: sobre la base (`feat/home-animaciones` sin el cambio, con un build aparte o un
`git stash`) y sobre el cambio. Las capturas se comparan a ojo (CA-06, CA-07). El movimiento de
scroll se neutraliza con `prefers-reduced-motion: reduce` emulado, para que las capturas sean
estables y los `[data-reveal]` aparezcan visibles.

### D-6 — Documentación

`docs/tema-claro-tokens.md` (documento del cambio) y entrada en `CHANGELOG.md` → Unreleased →
Fixed. En `docs/architecture.md`, sección de decisiones estructurales, hay dos entradas que
describen el defecto como estado vigente: "Tokens de Tailwind v4 solo usados en componentes no
existen en runtime" y "Patrón `var(--token, valor)` para tokens de marca". Se reemplazan por una
sola decisión en presente: tokens de marca en `@theme static`, siempre emitidos en `:root`,
overrides en `.dark` y consumo con `var(--token)` sin fallback. OpenAPI, Bruno y README no
aplican.

## Archivos que se tocan

| Archivo | Cambio | Slice |
|---|---|---|
| `src/styles.css` | `@theme` → `@theme static` en el bloque de tokens de marca | `chrome` |
| `src/styles.scss`, `components/public/*` (breadcrumb, public-page, rich-text, site-footer, site-header) | quitar fallbacks | `chrome` |
| `components/pages/*` (contacto, legal, not-found, servicios) | quitar fallbacks | `paginas` |
| `components/home/*` (home, hero, companies-marquee, steps-journey, team-band) | quitar fallbacks y comentarios de F-1 | `home` |
| `sdd/sdd-init.md` | nota de convención: los tokens de marca son `@theme static` y no llevan fallback | `cierre` |

## Riesgos

| Riesgo | Mitigación |
|---|---|
| El cambio visual del tema claro destapa un contraste o un fondo inesperado en alguna sección | Capturas de las 7 rutas en los dos viewports; si aparece algo, se lleva al usuario antes de cerrar `verify` (los valores de los tokens no cambian en este cambio) |
| Una sustitución mecánica rompe un `var()` anidado o un paréntesis | Build y suite Karma después de cada slice, y búsqueda de CA-04 |
| El orden de capas hace que `.dark` deje de ganar | No cambia: `.dark` sigue sin capa. Se comprueba con CA-03 |
