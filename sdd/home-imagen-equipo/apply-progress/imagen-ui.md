# Apply progress — imagen-ui

Slice 2 de 2 (`imagen-ui`, tareas T6 a T8). No existía un `apply-progress` previo para este
slice. Parte del estado que deja `imagen-base.md`. Sin commits.

Safety net: la última corrida de `imagen-base` (144/144 en verde, sin cambios posteriores) es la
línea base antes de modificar la home y `/nosotros`.

## Estado de tareas

| # | Estado | Detalle |
|---|---|---|
| T6 | completa | Banda `#equipo` entre `#companias` y `#origen`. Componente `src/app/components/home/team-band/` (selector de atributo `section[app-team-band]`) con imagen decorativa `cover` (`object-position: center 35%`), velo `::after` ≥ 768px, layout apilado < 768px, H2, bajada, caption, link pill "Conocé al equipo" a `/nosotros` con `aria-label`, bloque de texto con `data-reveal`. Tests en `home.component.spec.ts` |
| T7 | completa | `/nosotros`: sección `.team` con `<figure>` entre "about" y "Origen": imagen `contain` 3:2, `rounded-2xl`, sombra suave, `figcaption` con los nombres, `data-reveal`, `sizes="(min-width: 1152px) 1104px, 100vw"`. Tests en `nosotros.component.spec.ts` |
| T8 | completa | Suite 153/153 en verde. `ng build` sin errores; el único warning es el de fuentes inline, que ya existía. `grep` de `Equipo YCW` / `Equipo%20YCW` en `src/` → sin resultados. Las 6 variantes se copian a `dist/proyecto-dss/browser/Imagenes_web/` |

## Bajada de la banda (copy verificado)

Texto final en `content/team.ts`:

> Somos YCW Systems, los tres estudiantes universitarios que crearon KUVU en la biblioteca de su universidad.

Cada afirmación tiene respaldo:
- "YCW Systems" es el equipo detrás de KUVU (decisión del usuario en el Gate A; el footer firma "· YCW"; el logo de la foto dice "YCW SYSTEMS").
- "tres estudiantes universitarios … en la biblioteca de su universidad" sale de `content/origin.ts`: "KUVU nació como el proyecto de tres estudiantes universitarios en la biblioteca de su universidad."

Reemplaza la bajada escrita en `imagen-base` ("… convirtieron una idea de biblioteca en una
plataforma para inmobiliarias"), que parafraseaba más allá de lo que dice el sitio.

## Desvíos del plan

- **La banda se extrae a un componente propio** (`home/team-band/`) en lugar de vivir en `home.component.{html,scss}`, como decía design D4. Con los estilos dentro de la home, `ng build` emitía un warning nuevo: `home.component.scss` superaba el budget `anyComponentStyle` de 17 kB (18.24 kB). Con la home original no aparece. El selector de atributo mantiene `<section id="equipo">` como hija directa de `.home-layout`, así que los tests de orden de secciones y la estructura del DOM no cambian. No se tocó el budget de `angular.json`.
- **`aria-labelledby="equipo-title"`** en la sección, que el design no mencionaba, para que la región quede nombrada por su H2.
- **Hallazgo previo, fuera de alcance**: `RevealDirective` agrega `.is-visible` a los `[data-reveal]`, pero ningún stylesheet del proyecto define estilos para `[data-reveal]` ni para `.is-visible`. La animación de aparición no tiene efecto visual en todo el sitio. La banda y la figura usan `data-reveal` igual que el resto (RF-6, D8), así que heredan este comportamiento. Con reduced motion todo queda visible (CA-9 se cumple). Conviene llevarlo a `verify` y, si se quiere corregir, tratarlo como un cambio aparte.

## Bloque para verify / document

```
test_mode: test-after
test_command: $env:CHROME_BIN='C:\Program Files\Google\Chrome\Application\chrome.exe'; npx ng test --watch=false --browsers=ChromeHeadless  (desde frontend/proyecto_angular); npx ng build
tests_status: verde (153 de 153 SUCCESS); build OK, solo el warning de fuentes inline que ya existía
tests_agregados:
  - frontend/proyecto_angular/src/app/components/home/home.component.spec.ts (test de orden actualizado + 'team band': 5 tests + posición tras #companias)
  - frontend/proyecto_angular/src/app/components/pages/nosotros/nosotros.component.spec.ts ('team photo': 3 tests)
excepciones_sin_test:
  - TeamBandComponent no tiene un spec propio: se cubre de forma integrada desde home.component.spec.ts (render, a11y, link, imagen, reveal)
  - Contraste del velo (CA-8) y layout responsive: revisión visual/manual en verify
logs_conforme: sí (no se agregan logs, según design D9)
```

## Archivos del slice

- Nuevos: `src/app/components/home/team-band/team-band.component.{ts,html,scss}`
- Modificados: `src/app/components/home/home.component.{html,ts,spec.ts}`, `src/app/components/pages/nosotros/nosotros.component.{html,scss,ts,spec.ts}`, `src/app/content/team.ts` (bajada)
- `home.component.scss` queda sin cambios netos: los estilos de la banda viven en el componente.

## Corrección (desde verify)

La nota "Hallazgo previo" de arriba es incorrecta. Los estilos de `[data-reveal]` y `.is-visible` existen en `src/styles.scss` (fade + translate escalonado, desactivados con `prefers-reduced-motion`). La animación de aparición funciona en todo el sitio. Ver `verify-report.md` → D-3.

## Iteración 2 — corrección de verify D-1 / D-2

Decisiones del usuario: arreglo **local** en la banda (sin tocar el tema global ni los CTA del hero, header o `cta-final`), velo más denso entre 25 y 50 % de altura con texto ≥ 4.5:1 en todo el bloque, fondo verde del bloque en mobile, y encuadre que no corte "YCW".

| Cambio | Archivo |
|---|---|
| `--team-band-green: var(--color-brand-700, #2f4a2f)` en `:host`. El fondo y el velo usan esa variable local | `team-band/team-band.component.scss` |
| Velo `to top`: verde 88 % + negro (0 %) → verde 90 % (30 %) → verde 84 % (60 %) → negro 20 % (80 %) → negro 15 % (100 %) | idem |
| Encuadre `--responsive-image-position: center 10%` | idem |
| Spec nuevo con 4 tests: el verde se resuelve sin `--color-brand-700` global (variable `#2f4a2f` + `background-color rgb(47,74,47)`), texto blanco, encuadre, velo con `linear-gradient` en viewport ≥ 768px | `team-band/team-band.component.spec.ts` |

**Desvío respecto del pedido:** el encuadre quedó en `center 10%`, no en el 20-25 % sugerido. Medido en capturas: con `center 22%` a 1440×900 las letras "YCW" seguían cortadas arriba (la banda es 2.2:1 y la foto 3:2, así que se recortan unos 312 px de alto). Con `center 10%` el logo entra completo a 1440 y a 1920, y las tres caras siguen visibles. En mobile el encuadre no influye, porque la foto se muestra completa en 3:2.

Efecto visual a considerar: las caras quedan en parte dentro del tramo denso del velo (entre 60 y 80 % de altura empieza a aclarar). Es el costo de garantizar ≥ 4.5:1 en el bloque de texto completo.

```
test_mode: test-after
test_command: $env:CHROME_BIN='C:\Program Files\Google\Chrome\Application\chrome.exe'; npx ng test --watch=false --browsers=ChromeHeadless; npx ng build
tests_status: verde (157 de 157 SUCCESS); build OK, solo el warning de fuentes inline que ya existía
tests_agregados:
  - frontend/proyecto_angular/src/app/components/home/team-band/team-band.component.spec.ts (4 tests, nuevo; incluye regresión del fallback)
excepciones_sin_test:
  - El test del velo depende del ancho del viewport de Karma: con ≥ 768px exige el gradiente y con menos exige que no haya velo. El contraste se mide en verify
logs_conforme: sí
```

Con este spec, la excepción "TeamBandComponent sin spec propio" de la iteración 1 deja de aplicar.
