# apply-progress — home (home-animaciones)

Rama: `feat/home-animaciones` (sobre `5f66d68`, el commit del slice `chrome`). Sin commit: lo
autoriza el usuario (sin extensión `git`).

```
test_mode: test-after
test_command: $env:CHROME_BIN='C:\Program Files\Google\Chrome\Application\chrome.exe'; npx ng test --watch=false --browsers=ChromeHeadless   (desde frontend/proyecto_angular)
tests_status: verde (465/465)
tests_agregados:
  - src/app/components/home/scroll-progress/scroll-progress-bar.component.spec.ts (nuevo)
  - src/app/components/home/hero/home-hero.component.spec.ts (nuevo)
  - src/app/components/home/steps-journey/steps-journey.component.spec.ts (nuevo)
  - src/app/components/home/companies-marquee/companies-marquee.component.spec.ts (nuevo)
  - src/app/components/home/team-band/team-band.component.spec.ts (extendido: clip, parallax y cruce de breakpoint)
  - src/app/components/home/home.component.spec.ts (extendido: barra, --page-progress, párrafo 01, --dim, hover-lift, magnéticos, composición, liberación del servicio)
excepciones_sin_test:
  - Efectos puramente visuales (entrada del hero, pulso del indicador, línea del recorrido,
    desplazamiento de la banda, parallax de la foto, elevación): los specs cubren el estado y
    los atributos que los activan. El resultado visual queda para la revisión manual de verify
    (CA-12, CA-15, CA-25, CA-26).
logs_conforme: sí. El slice no agrega logs ni console.*.
```

## Tareas

| # | Estado | Notas |
|---|---|---|
| H1 | Completa | `providers: [ScrollMotionService]` en `HomeComponent`; `ngAfterViewInit` registra el host para `--page-progress`. El spec comprueba que al destruir la home se quitan los listeners del servicio y se cancela el frame pendiente |
| H2 | Completa | `app-scroll-progress`: fija arriba, `aria-hidden`, `pointer-events: none`, gradiente de `.btn-primary`, `z-index` 60 (sobre el header, 50) |
| H3 | Completa | `section[app-home-hero]` con el marcado y los estilos del hero (fuera `.hero*` y `rise-in` de la home). h1 con `app-split-text mode="enter"`, fade-up de marca, subtítulo y CTAs (termina en ~1,2 s), indicador con 3 pulsos, parallax de salida y CTA magnético |
| H4 | Completa | Sección 01 con `[appScrollProgress]` y `app-split-text mode="scrub"`, texto literal. **`--dim` medido: 0,65** (ver "Medidas") |
| H5 | Completa | `section[app-steps-journey]`: `<ol>` con los 4 pasos, `is-journey` solo en desktop sin reduced motion (etapa de 250vh, caja sticky a 64 px, dos columnas, línea `scaleY(--p)`, paso activo con `aria-current="step"`). En mobile o con reduced motion, lista con reveal |
| H6 | Completa | `section[app-companies-marquee]`: lista real + 3 copias `aria-hidden` + `inert`, 40 s, pausa con hover, foco, botón (`aria-pressed` y nombre alternado) y `.is-offscreen`. Con reduced motion: `.is-static`, sin copias y sin botón; reacciona al cambio de preferencia |
| H7 | Completa | `team-band-media` con `data-reveal="clip"` y `[appScrollProgress] desktopOnly`; `scale(1.06)` + `translateY` en desktop sin reduced motion |
| H8 | Completa | `.hover-lift` en `.service-row`, `.security-item` y `.faq-item`; `[appMagnetic]` en el CTA final. Las transiciones propias de los CTAs suman `translate` |
| H9 | Completa | `home.component.{html,ts,scss}` recompuestos. Tests de contenido sin cambios y en verde |
| H10 | Completa | Ver "Medidas" |

## Medidas (H4, H10)

- **`--dim` (H4).** Párrafo `--color-home-muted` sobre `--color-home-surface`. Contraste del
  texto atenuado, calculado con la mezcla alfa:

  | Opacidad | Claro (#4c5a4e / #fff) | Oscuro (#a8b2a8 / #1b231b) |
  |---|---|---|
  | 0,35 (valor inicial del design) | 1,75:1 | 2,08:1 |
  | mínimo para 3:1 | 0,63 | 0,52 |
  | **0,65 (fijado)** | **3,1:1** | **3,6:1** |

- **`ng build` (H10).** Bundle inicial **438,46 kB** raw / 115,80 kB transfer (base 424,49 kB;
  tope ≤ 439,5 kB). `main` 42,63 kB. `home.component` compilado: **6,74 kB** (base ~16,8 kB;
  objetivo < 14 kB). `companies-marquee` 2,81 kB.
- Único warning: `css-inline-fonts`, que ya existía (19,14 kB contra 17 kB). En un build
  intermedio la hoja que devolvió Google Fonts pesó 20,63 kB y superó el tope de error de
  20 kB. El build siguiente volvió a 19,14 kB. Depende de la red, no del código, pero puede
  romper un build.
- `ng test`: 465/465. Sin dependencias nuevas ni `console.*`.

## Desvíos del plan

1. **Presupuesto: `@apply` → CSS plano.** El primer build dio 447,51 kB (+23 kB contra la base).
   Tailwind v4 expande cada `@apply` con fallbacks y un bloque `@layer properties` en cada
   componente. Los componentes nuevos, el mixin compartido, `home.component.scss` y
   `team-band.component.scss` pasaron a CSS plano con los mismos valores (el tema del proyecto
   usa los defaults de spacing y texto). Así el bundle quedó dentro del tope.
2. **Mixin `_section-heading.scss`.** `.container`, `.section-title` y `.section-lead` viven en
   un mixin que incluyen la home, el recorrido y la banda de compañías, porque los estilos
   encapsulados no cruzan componentes.
3. **`--scrub-rate` en `SplitTextComponent` (código de `chrome`).** Con la fórmula del design y
   el rango `cover`, el párrafo terminaba de encenderse cuando la sección ya salía de la vista.
   La sección 01 usa `--scrub-rate: 1.6`. Además, `--dim` dejó de declararse en el host del
   componente para que se pueda heredar (antes el host pisaba el valor del ancestro).
4. **`.hover-lift` con `translate` (en `styles.scss`, código de `chrome`).** La transición de
   `.hover-lift` pisaba la de `[data-reveal]` en los elementos que tienen las dos (filas de la
   home y tarjetas de `/servicios`), y la entrada perdía su animación. Ahora la elevación usa
   `translate` y `[data-reveal].hover-lift` declara las cuatro transiciones juntas.
5. **Banda de compañías con 3 copias, no 1.** Con 4 nombres cortos, una lista es más angosta que
   la banda y el reinicio del bucle se notaba. Cada mitad del recorrido tiene 2 listas.
6. **Barra de progreso sin transición CSS.** El bucle ya la actualiza una vez por frame, así que
   una transición solo agregaba retraso y complicaba el test.
7. **Hero: el target de parallax es `.hero-stage`, no el `<section>`.** La directiva necesita
   un elemento de la plantilla del hero que contenga el contenido y el indicador (los dos
   leen `--p`). `.hero-stage` ocupa todo el hero.
8. **Recorrido en dos columnas** (encabezado a la izquierda, pasos a la derecha), para que los
   4 pasos entren en la caja sticky en pantallas de 768 px de alto.

## Para la revisión manual de verify

- Altura del recorrido (250vh) y momento del paso activo (riesgo D6).
- Ritmo del párrafo 01 con `--scrub-rate: 1.6`.
- Sin costuras en el reinicio de la banda de compañías a 1280 px y 1920 px.
- Paridad visual de home y banda de equipo después del paso a CSS plano.
- La elevación de `/servicios` con `translate` se ve igual que antes.
