# apply-progress — chrome (home-animaciones)

Rama: `feat/home-animaciones-base` (desde `3e48726`). Sin commit: lo autoriza el usuario (sin
extensión `git`).

```
test_mode: test-after
test_command: $env:CHROME_BIN='C:\Program Files\Google\Chrome\Application\chrome.exe'; npx ng test --watch=false --browsers=ChromeHeadless   (desde frontend/proyecto_angular)
tests_status: verde (427/427)
tests_agregados:
  - src/app/motion/motion-preferences.spec.ts (nuevo)
  - src/app/motion/scroll-motion.service.spec.ts (nuevo)
  - src/app/motion/scroll-progress.directive.spec.ts (nuevo)
  - src/app/motion/split-text.component.spec.ts (nuevo)
  - src/app/motion/magnetic.directive.spec.ts (nuevo)
  - src/app/route-view-transition.spec.ts (nuevo)
  - src/app/anchor-smooth-scroll.spec.ts (nuevo)
  - src/app/directives/reveal.directive.spec.ts (extendido: variante clip)
  - src/app/app.routes.spec.ts (extendido: flag data.publicSite)
  - dobles reutilizables: src/app/motion/testing/{match-media,animation-frame,intersection-observer}.stub.ts
excepciones_sin_test:
  - C8 (.hover-lift) y C9 (tokens en header y footer) son solo CSS. Cubiertos por los specs
    existentes de header y footer (en verde, sin cambios) y por la revisión manual de verify
    (CA-15, CA-16).
  - Reglas CSS de html.vt-public y html.smooth-anchors: el JS que pone y quita las clases tiene
    spec. El efecto visual queda para la revisión manual de verify (CA-17, CA-02).
logs_conforme: sí. El slice no agrega logs ni console.* (design, sección Logs).
```

## Tareas

| # | Estado | Notas |
|---|---|---|
| C1 | Completa | `styles/_motion.scss` con los tokens de D1, incluido con `@use 'styles/motion'`. `$ease-out-expo` eliminado de `styles.scss` |
| C2 | Completa | `motion-preferences.ts` + `testing/match-media.stub.ts`. Sin `matchMedia`, `reducedMotion()` devuelve `true` (estado estático por default, RNF-05) |
| C3 | Completa | `ScrollMotionService` con rangos `cover` / `contain` / `exit` (son los `start`/`end` del design con nombre) y `scrollProgress()` como función pura testeable |
| C4 | Completa | `[appScrollProgress]="range"` + `desktopOnly` + output `progressChange` (lo usará `steps-journey` para el paso activo, D6) |
| C5 | Completa | `RevealDirective` usa `reducedMotion()`. Estilos `[data-reveal]` con `--dist-reveal` y `--dur-slow`, más la variante `clip` |
| C6 | Completa | `SplitTextComponent`. La copia accesible usa la clase local `.split-sr` (no depende de que Tailwind genere `sr-only`). `--dim` por default en 0,35 en el host; el ajuste a contraste ≥ 3:1 va en H4 |
| C7 | Completa | `MagneticDirective`, tope `MAGNETIC_MAX_PX = 6` (mismo valor que `--magnetic-max`), fuerza 0,25, un rAF por frame. Agrega la clase `.magnetic` al host; la regla vive en `styles.scss` y usa `translate`, que compone con el `transform` propio del botón |
| C8 | Completa | `.hover-lift`: `:hover` dentro de `(hover: hover)`, elevación con `:focus-visible` / `:focus-within`, transición solo sin reduced motion |
| C9 | Completa | Header y footer: `$ease-out-expo` → `var(--ease-out-expo)`; 0,2 s y 0,25 s → `--dur-fast`; 0,3 s y 0,35 s → `--dur-base`; CTA del footer → `--dur-base` (D15). Sin cambios de estructura |
| C10 | Completa | `data: publicSite` en `''`, `servicios`, `nosotros`, `preguntas-frecuentes`, `contacto`, `legal` y `**`. `route-view-transition.ts` (`onRouteViewTransition`, `isPublicSite`) registrado en `withViewTransitions`. `intro-view-transition.spec.ts` sin cambios y en verde |
| C11 | Completa | `anchor-smooth-scroll.ts` registrado con `provideAppInitializer`. La clase se quita con `scrollend` y, siempre, a los 1.000 ms como tope |
| C12 | Completa | Ver "Cierre" |

## Cierre (C12)

- `ng test`: 427/427 en verde.
- `ng build`: OK. **Bundle inicial 427,96 kB** raw / 112,42 kB transfer (base 424,49 kB; +3,47 kB,
  tope ≤ 439,5 kB). `styles` global 28,45 kB.
- Único warning: `css-inline-fonts` (la hoja de Google Fonts supera 17 kB). Ya existía antes de
  este cambio (registrado en `sdd/acceso-orden-e-intro/apply-progress/intro.md`) y no lo causa
  este slice.
- Sin dependencias nuevas (`package.json` y `package-lock.json` sin cambios). Sin `console.*`.
- Tamaño del slice: unas 1.200 líneas en total, de las cuales unas 570 son de producción y unas
  630 de specs y dobles de test (el forecast decía unas 750).

## Desvíos del plan

1. **Tamaño.** Más líneas que el forecast, sobre todo en tests: se agregaron dos dobles
   reutilizables (`animation-frame.stub.ts`, `intersection-observer.stub.ts`) que el slice
   `home` también va a usar.
2. **C11, tope fijo.** La clase `smooth-anchors` se quita a los 1.000 ms aunque el navegador
   soporte `scrollend`. Si no hubiera scroll (el ancla ya está a la vista), `scrollend` nunca
   llegaría y la clase quedaría puesta, con lo que el siguiente cambio de página haría suave el
   salto arriba.
3. **C10.** `onRouteViewTransition` no necesita cortar después del salteo de la intro:
   `/acceder` no tiene `publicSite`, así que nunca recibe `vt-public`. Lo cubre el spec.
4. **C3.** En `ScrollMotionService` se usa el `IntersectionObserver` global y no el de
   `window` tipado (TS2339 con la configuración del proyecto).

## Pendiente para otros slices o fases

- H4: medir y fijar `--dim` con contraste ≥ 3:1.
- verify (manual): momento de `vt-public` (CA-17), scroll suave de anclas (CA-02), `.hover-lift`
  en `/servicios` (CA-15), header y footer sin cambio perceptible (CA-16).
