# verify-report — home-animaciones

Estado verificado: `feat/home-animaciones` con el arreglo de fallbacks posterior a `974ccf1`
(incluye `5f66d68` de PR A). Slices completados: `chrome`, `home`, `cierre`. Omitidos: ninguno.
`secure` y `refine` cerraron sin cambios de código. La revisión en navegador encontró un
defecto (V-3), que se corrigió y se re-verificó en este mismo informe.

## Resultado

**Verde.** Tests, build y revisión en navegador pasan. Quedan 2 desvíos menores aceptados
(V-1, V-2), un defecto corregido (V-3) y un hallazgo previo al cambio, fuera de alcance (F-1).

| Chequeo | Resultado |
|---|---|
| `ng test` (Karma, ChromeHeadless) | **467/467 en verde** (465 más 2 de regresión por V-3) |
| `ng build` | OK. Bundle inicial **438,51 kB** (≤ 439,5 kB). Único warning: `css-inline-fonts` (19,14 kB contra 17 kB), que ya existía y no lo causa este cambio |
| Dependencias nuevas | Ninguna (`package.json` y `package-lock.json` sin cambios) |
| `console.*` agregados | Ninguno |
| Backend, assets, contenido | Sin cambios (`backend/`, `public/` y `content/` fuera del diff) |
| Specs de intro, login, landing y contenido | Sin cambios de expectativa, en verde |
| CI | No aplica (extensión `git` inactiva) |

## Cobertura declarada en apply-progress

| Slice | tests_status | Excepciones documentadas | ¿Producción sin cobertura ni excepción? |
|---|---|---|---|
| `chrome` | verde | CSS de `.hover-lift`, tokens de header y footer, reglas visuales de `vt-public` y `smooth-anchors` | No |
| `home` | verde | Efectos puramente visuales (los specs cubren estado y atributos) | No |
| `cierre` | n/a | Solo configuración SDD | No |

## Criterios de aceptación

| CA | Resultado | Evidencia |
|---|---|---|
| CA-01 | Pasa | Tokens en `styles/_motion.scss`. Header, footer, home, componentes nuevos, `team-band` y la transición de rutas usan `var(--dur-*)` / `var(--ease-*)`. No queda `$ease-out-expo` en el código del cambio |
| CA-02 | Pasa en comportamiento (ver desvío V-1) | `anchor-smooth-scroll.spec.ts`: scroll suave solo con mismo path + fragment en ruta pública y sin reduced motion; se quita con `scrollend` o a los 1.000 ms. CSS dentro de `no-preference` |
| CA-03 | Pasa (incluye navegador) | `scroll-progress-bar.component.spec.ts` (`aria-hidden`, sin foco, `pointer-events: none`, `scaleX` sigue a `--page-progress`); `home.component.spec.ts` (barra solo en la home, `--page-progress` publicado) |
| CA-04 | Pasa | `home-hero.component.spec.ts` y `split-text.component.spec.ts`: el texto accesible del h1 es el texto completo y las palabras visuales son `aria-hidden` |
| CA-04b | Pasa (automático) | `home-hero.component.spec.ts`: solo registra el target con desktop sin reduced motion |
| CA-05 | Pasa | `reveal.directive.spec.ts` (fade-up y clip visibles al instante con reduced motion). Hero: la entrada vive dentro de `no-preference` y no hay estado oculto base |
| CA-06 | Pasa | `reveal.directive.spec.ts`, caso sin `IntersectionObserver` |
| CA-07 | Pasa | `home.component.spec.ts`: texto exacto en la copia `sr-only` y en las palabras visibles; `--dim` 0,65 (≥ 3:1 en claro y oscuro, medido en `apply-progress/home`). Con reduced motion la regla de opacidad no existe |
| CA-08 | Pasa (incluye navegador a 1280 px) | `steps-journey.component.spec.ts`. En navegador: la caja queda fija a 64 px durante los 2.000 px de la etapa, el paso activo avanza 0→1→2→3 y la línea escala con el progreso; a 1023 y 375 px no hay recorrido |
| CA-09 | Pasa | `companies-marquee.component.spec.ts`: cada compañía una vez; copias `aria-hidden` + `inert` |
| CA-10 | Pasa | Botón con `aria-pressed`, nombre alternado y `.is-paused`; pausa con `:hover` / `:focus-within` en CSS |
| CA-11 | Pasa | Con reduced motion: `.is-static`, sin copias ni botón |
| CA-12 | Pasa (navegador) | En 1280 y 1920 px, a lo largo de todo el recorrido (`--p` de 0 a 1), la imagen sobresale del marco por los 4 lados (márgenes negativos de −7,9 a −38,4 px): nunca hay borde vacío |
| CA-12b | Pasa (automático) | `team-band.component.spec.ts`: target solo en desktop; activa y desactiva al cruzar el breakpoint y limpia `--p` |
| CA-13 | Pasa | `magnetic.directive.spec.ts`: sin listeners con puntero grueso o reduced motion |
| CA-14 | Pasa (incluye navegador) | Con mouse real sobre el CTA del hero: `--mx` llega al tope de `6.00px` y vuelve a `0.00px` al salir; solo cambia `translate` |
| CA-15 | Pasa (navegador) | Hover real sobre `.service-row` (home) y `.service-card` (`/servicios`): `translate: 0px -2px` con sombra, y la entrada del reveal conservada (opacidad 1) |
| CA-16 | Pasa | Specs del header y footer en verde sin cambios; solo cambiaron duraciones y curvas |
| CA-17 | Pasa | Spec del hook y navegador: al hacer clic de `/` a `/servicios`, `<html>` recibe `vt-public` y la pierde al terminar; el header solo tiene `view-transition-name` durante la transición |
| CA-18 | Pasa | `intro-view-transition.spec.ts` sin cambios y en verde; spec nuevo: público → `/acceder` saltea sin `vt-public` |
| CA-19 | Pasa | Spec del hook: `/login` y autenticada → autenticada sin `vt-public`. `app.routes.spec.ts`: `publicSite` solo en rutas públicas |
| CA-20 | Pasa | Tests de contenido sin cambios; sin assets nuevos |
| CA-21 | Pasa | Sin dependencias nuevas |
| CA-22 | Pasa | Sin warnings de presupuesto propios; `home.component` compilado 6,74 kB (base ~16,8 kB); bundle 438,46 kB |
| CA-23 | Pasa | `home.component.spec.ts`: al destruir la home se quitan `scroll` / `resize` del servicio y se cancela el frame; specs de servicio, directivas y marquee cubren `disconnect` y la baja de listeners |
| CA-24 | Pasa con desvío menor (V-2) | Listeners pasivos, un rAF por ráfaga (spec del servicio y de magnetic) |
| CA-25 | Pasa (navegador) | Con `prefers-reduced-motion: reduce` emulado, arriba y a mitad de página: 0 animaciones en curso, sin copias de la banda ni botón de pausa, sin recorrido, sin `--p` en hero ni banda, 0 elementos `data-reveal` ocultos y 0 palabras atenuadas |
| CA-26 | Pasa (navegador) | 40 Tab seguidos: todos los interactivos muestran contorno de foco, ninguno cae dentro de las copias de la banda, y el orden es el de la base con el botón de pausa entre «Ver servicios» y la banda de equipo |
| CA-27 | Pasa | 465/465 |

## Ejes del protocolo

- **Documentación declarada:** sí. `tasks` declara el alcance de `document`:
  `docs/home-animaciones.md`, `docs/architecture.md` (módulo `app/motion/`, servicio por
  componente, hook de rutas, anclas) y `CHANGELOG.md`. Sin OpenAPI ni README.
  `guidelines_afectado: false` con motivo.
- **Guidelines:** `DEVELOPMENT_GUIDELINES.md` no tiene sección de Angular (cubre Go, Next.js y
  Astro). Se cumplen las reglas transversales que sí aplican: naming en inglés en el código,
  sin logs innecesarios y estructura por feature (`components/home/<sección>/`, piezas
  reutilizables en `app/motion/`). Las convenciones nuevas quedaron en `sdd/sdd-init.md` y van a
  `docs/architecture.md` en `document`.
- **Logs:** conforme. No se agregan logs ni `console.*` (cambio de presentación; el design lo
  justifica). Los tres `apply-progress` declaran `logs_conforme: sí`.

## Desvíos

| # | Severidad | Desvío | Propuesta |
|---|---|---|---|
| V-1 | Menor (texto de la spec) | CA-02 dice "`html` tiene scroll suave". El design (D14) lo refinó a scroll suave **solo para anclas de la misma página**, porque el global haría suave el salto arriba al cambiar de página y llegaría a `/login`. El comportamiento cumple RF-02, que habla de anclas; el texto del CA quedó atrás | Resuelto en `archive`: el texto de CA-02 en `spec.md` describe el comportamiento acordado (solo anclas). No requiere código |
| V-2 | Menor (aceptado por el usuario) | CA-24 pide animar solo `transform`, `opacity` y `clip-path`. En el modo recorrido, el paso activo además transiciona `border-color` y `.hover-lift` anima `box-shadow`. La sombra ya existía en la base; el borde es nuevo y es un repintado barato sobre 4 elementos | Aceptar (no compromete fluidez) o quitar la transición de `border-color` en `steps-journey` |

| V-3 | **Defecto, corregido** | La revisión en navegador mostró que la línea de progreso del recorrido, su riel y el borde del botón de pausa eran invisibles: usaban `--color-brand-600` / `--color-home-*` sin fallback, y esas variables no existen en `:root` en tema claro (ver F-1). Arreglo: fallbacks literales en esos tres usos nuevos (mismo patrón que `team-band` y `cta-final`) y 2 tests de regresión que comprueban el color resuelto | Corregido y re-verificado (467/467, captura con la línea visible) |

### Hallazgo fuera de alcance

**F-1 — Los tokens de tema claro no se emiten en `:root` (ya existía antes del cambio).**
Tailwind v4 solo emite en `:root` las variables de `@theme` que usan sus utilidades, y
`--color-home-*`, `--color-brand-100/600` y `--radius-*` no se usan así. En tema claro quedan
indefinidas: superficies transparentes, tarjetas de "¿Cómo funciona?" sin borde ni fondo,
números de paso e íconos de servicios sin fondo verde. Se confirmó con un build de la base
`3e48726`, que da los mismos valores. No lo introduce este cambio y la paridad visual con la
base se mantiene. Arreglo sugerido (cambio aparte): `@theme static` en `styles.css`, o declarar
esos tokens también en `:root`. Es visible: cambia el aspecto de la home y de otras páginas,
así que conviene revisarlo con capturas.

Los desvíos de `apply` (paso a CSS plano, `--scrub-rate`, `.hover-lift` con `translate`,
3 copias en la banda y barra sin transición) están justificados en sus `apply-progress` y no
contradicen la spec.

## Revisión en navegador

Hecha con Chrome headless por CDP sobre el build de producción, con estos escenarios: 1280×800,
1920×1080, 1023×800 y 375×800 táctil, cada uno con y sin `prefers-reduced-motion`. Se midió
en vez de mirar donde se pudo: cobertura de la foto, ancho de media pista contra el de la
banda (1.711 px contra 1.104 px: sin costura), orden de foco, animaciones en curso y opacidad
de palabras. Además se revisaron capturas para la paridad visual contra la base. Resultados
extra:

- Entrada del hero: la más larga termina en 1.180 ms (≤ 1,5 s). El indicador hace 3 pulsos
  de 1,5 s después de 1 s de espera.
- Párrafo 01 con la sección centrada: 35 de 40 palabras encendidas; al entrar, 10. Mínimo 0,65.
- Parallax del hero a mitad de salida: `translateY(31px)`, opacidad 0,77, indicador en 0.
- 375 px: sin parallax, sin recorrido, sin scroll horizontal y puntero no fino.
- Paridad visual: la home se ve igual a la base salvo los efectos nuevos (las tarjetas sin
  borde de "¿Cómo funciona?" son F-1, igual en la base).

Sigue a criterio del usuario el ajuste fino de la altura del recorrido (250vh) y del ritmo del
párrafo (`--scrub-rate: 1.6`). Los valores medidos son razonables y no hay criterio que falle.
