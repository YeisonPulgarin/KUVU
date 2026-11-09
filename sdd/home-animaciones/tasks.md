# tasks — home-animaciones

Fuente: `sdd/home-animaciones/spec.md` y `sdd/home-animaciones/design.md` (D1–D15). Modalidad
**`test-after`**: cada tarea incluye sus tests y no se da por cerrada sin ellos en verde. Rutas
relativas a `frontend/proyecto_angular/src/` salvo indicación.

## Slices involucrados

| Slice | Involucrado | PR |
|---|---|---|
| `backend-orden` | No (no toca backend) | — |
| `contenido` | No (RF-16: textos sin cambios) | — |
| `chrome` | **Sí** | PR A |
| `paginas` | No como slice. El flag `data.publicSite` de `app.routes.ts` va en `chrome` porque solo existe para la transición de rutas (D13) y no agrega ni modifica páginas | — |
| `home` | **Sí** | PR B |
| `intro` | No. La intro no se toca; su no-regresión se cubre en `chrome` (C10) y en `verify` | — |
| `cierre` | **Sí** | PR B |

**Orden:** `chrome` → `home` → `cierre`. Coincide con el orden por dependencia de la tabla del
config: `home` consume las piezas de `app/motion/` y los tokens que crea `chrome`.

**Desvío del default:** el cambio a `app.routes.ts` va en `chrome` y no en `paginas`. Así PR A
queda autocontenido (hook más flag) y no se abre un slice para cambiar una sola línea por ruta.

## Slice `chrome` (PR A)

| # | Tarea | Depende de | Cubre |
|---|---|---|---|
| C1 | Crear `styles/_motion.scss` con los tokens de D1 en `:root` e incluirlo en `styles.scss`. Reemplazar `$ease-out-expo` en `styles.scss` por `var(--ease-out-expo)` | — | RF-01, CA-01 |
| C2 | `app/motion/motion-preferences.ts`: consultas `reducedMotion`, `finePointer` y `desktop` (`width >= 1024px`) con emisión de `change`. Agregar un doble de `matchMedia` reutilizable para specs (`app/motion/testing/match-media.stub.ts`). Spec | — | D3, CA-04b, CA-12b, CA-13 |
| C3 | `app/motion/scroll-motion.service.ts` (sin `providedIn: 'root'`): targets, IntersectionObserver, un listener pasivo, un rAF con lecturas antes que escrituras, `--page-progress`, rangos `start`/`end`, `runOutsideAngular`, `ngOnDestroy`. Spec | C2 | D2, CA-03, CA-23, CA-24 |
| C4 | `app/motion/scroll-progress.directive.ts`: registra el host, publica `--p`, opción `desktopOnly` que no registra fuera de desktop o con reduced motion, reacciona a `change` y limpia `--p`. Spec | C2, C3 | D2, D3, CA-04b, CA-12b |
| C5 | Extender `RevealDirective` y los estilos `[data-reveal]` en `styles.scss`: recorrido `--dist-reveal`, `--dur-slow` y variante `[data-reveal="clip"]`. Extender su spec | C1 | D4, RF-05, CA-05, CA-06 |
| C6 | `app/motion/split-text.component.ts`: copia `sr-only`, palabras `aria-hidden` con `--i`/`--n`, modos `enter` y `scrub` (estilos dentro de `no-preference`). Spec | C1 | D5, RF-04, RF-06, CA-04, CA-07 |
| C7 | `app/motion/magnetic.directive.ts`: gating por puntero fino y reduced motion, `pointermove`/`pointerleave` pasivos, rAF, tope de 6 px, vuelta a 0. Spec | C1, C2 | D10, RF-10, CA-13, CA-14 |
| C8 | `.hover-lift` en `styles.scss`: `:hover` dentro de `@media (hover: hover)`, más `:focus-visible` y `:focus-within`, sin transición con reduced motion. Verificar que `/servicios` sigue igual | C1 | D11, RF-11, CA-15 |
| C9 | Header y footer: reemplazar duraciones y curvas por tokens en `site-header.component.scss` y `site-footer.component.scss`, sin cambiar la estructura. Los specs existentes deben quedar en verde | C1 | D15, RF-12, CA-16 |
| C10 | `data: { publicSite: true }` en las rutas públicas de `app.routes.ts` (`''`, `servicios`, `nosotros`, `preguntas-frecuentes`, `contacto`, `legal`, `**`). `app/route-view-transition.ts` con `onRouteViewTransition`, que compone `skipViewTransitionIntoIntro` y la marca `vt-public`. Registrarlo en `app.config.ts`. CSS `html.vt-public` (header quieto, raíz con slide y fade) en `styles.scss`. Spec con público → público, público → `/acceder`, público → `/login` y autenticada → autenticada. `intro-view-transition.spec.ts` sin cambios | C1 | D13, RF-13, RF-14, RF-15, CA-17, CA-18, CA-19 |
| C11 | `app/anchor-smooth-scroll.ts`: initializer en `app.config.ts`, clase `smooth-anchors` solo con mismo path, fragment, ruta pública y sin reduced motion; se quita con `scrollend` o a los 1.000 ms. CSS en `styles.scss`. Spec | C2, C10 | D14, RF-02, CA-02 |
| C12 | Cierre del slice: `ng test` en verde, `ng build` sin warnings de presupuesto (anotar el bundle inicial), `git diff` sin dependencias nuevas ni `console.*`. Registrar `apply-progress/chrome` | C1–C11 | RNF-01, RNF-02, CA-21, CA-22, CA-27 |

## Slice `home` (PR B)

| # | Tarea | Depende de | Cubre |
|---|---|---|---|
| H1 | Proveer `ScrollMotionService` en `HomeComponent` (`providers`). Ajustar `home.component.spec.ts`: al destruir la home se libera el servicio | C3 | D2, CA-23 |
| H2 | `components/home/scroll-progress/`: barra fija con `scaleX(var(--page-progress))`, `aria-hidden`, `pointer-events: none`, sin transición con reduced motion. Montarla en la plantilla de la home. Spec | H1 | D12, RF-03, CA-03 |
| H3 | `components/home/hero/`: extraer marcado y estilos del hero desde `home.component.{html,scss}` (eliminar `.hero*` y `rise-in`). h1 con `app-split-text mode="enter"`, entrada escalonada del resto, indicador de 3 pulsos, `[appScrollProgress]` `desktopOnly` con rango de salida y `[appMagnetic]` en el CTA. Spec | C4, C6, C7, H1 | D8, RF-04, RF-10, CA-04, CA-04b, CA-05 |
| H4 | Sección 01: `[appScrollProgress]` en la sección y `app-split-text mode="scrub"` con el texto actual del párrafo. Medir `--dim` hasta lograr un contraste de 3:1 o más y registrar el valor en `apply-progress/home`. Test en `home.component.spec.ts` (texto exacto, copia `sr-only`) | C4, C6, H1 | D5, RF-06, CA-07 |
| H5 | `components/home/steps-journey/`: extraer `.steps*`, `<ol>` con los 4 pasos, sticky de unos 250 vh y línea `scaleY(--p)` solo en desktop sin reduced motion, signal de paso activo con `aria-current="step"`, lista con reveal en mobile. Spec | C4, C5, H1 | D6, RF-07, CA-08 |
| H6 | `components/home/companies-marquee/`: extraer `.companies*`, dos pistas (copia `aria-hidden` + `inert`), animación de 40 s, pausa con hover, foco y botón (`aria-pressed`, nombre alternado), `.is-offscreen` con IntersectionObserver, modo estático con reduced motion (sin copia ni botón). Spec | C1 | D7, RF-08, CA-09, CA-10, CA-11 |
| H7 | `team-band`: `data-reveal="clip"` y `[appScrollProgress]` `desktopOnly` en `.team-band-media`, con `scale(1.06)` y `translateY` en `team-band.component.scss`. Extender el spec | C4, C5, H1 | D9, RF-05, RF-09, CA-12, CA-12b |
| H8 | `.hover-lift` en `.service-row`, `.security-item` y `.faq-item`. `[appMagnetic]` en el CTA final. Ajustar los tests de la home que dependan del marcado | C7, C8 | D10, D11, RF-10, RF-11 |
| H9 | Recomponer `home.component.{html,ts,scss}` con los componentes nuevos y verificar que los tests de contenido siguen en verde sin cambios | H2–H8 | RF-16, CA-20 |
| H10 | Cierre del slice: `ng test` en verde, `ng build` sin warnings (`home.component.scss` por debajo del tamaño base y del objetivo de 14 kB, bundle inicial ≤ 439,5 kB), sin `console.*` ni dependencias nuevas. Registrar `apply-progress/home` con las medidas | H1–H9 | RNF-02, RNF-03, CA-22, CA-27 |

## Slice `cierre` (PR B)

| # | Tarea | Depende de | Cubre |
|---|---|---|---|
| Z1 | Actualizar `sdd/sdd-init.md` con el módulo `app/motion/`, el hook de transición de rutas y el patrón de servicio de scroll provisto por componente. Revisar `sdd/sdd.config.md`: no requiere cambios de slices; si `app/motion/` necesita dueño explícito, anotarlo en la fila de `chrome` | H10 | — |

## Partición en PRs y ramas

Base de la pila: `feat/acceso-orden-e-intro` (PR #2), que se apila sobre la PR #1.

| PR | Rama | Base del PR | Contenido |
|---|---|---|---|
| **PR A**: base común de movimiento | `feat/home-animaciones-base` (nueva, desde `feat/acceso-orden-e-intro` en `3e48726`) | `feat/acceso-orden-e-intro` | Slice `chrome` (C1–C12) más los artifacts SDD hasta `tasks` (`explore`, `propose`, `spec`, `design`, `tasks`, `apply-progress/chrome`) |
| **PR B**: home | `feat/home-animaciones` (existente, avanzada sobre `feat/home-animaciones-base`) | `feat/home-animaciones-base` | Slices `home` (H1–H10) y `cierre` (Z1), más `verify-report`, reportes opcionales, `document` (`docs/`, `architecture`, `CHANGELOG`) y `archive` |

Mecánica (la ejecuta `apply`; no hay extensión `branch`):

1. Antes de `chrome`: `git switch -c feat/home-animaciones-base`. HEAD es el mismo commit `3e48726`
   y los artifacts sin trackear viajan con el working tree.
2. Al cerrar `chrome`: commit en `feat/home-animaciones-base`. Después, en
   `feat/home-animaciones`, fast-forward a `feat/home-animaciones-base`. La rama no tiene commits
   propios, así que no hay merge.
3. `home` y `cierre` se commitean en `feat/home-animaciones`.
4. Los PRs se abren al final, después de `verify` y `document`, porque `verify` valida el cambio
   completo. Si PR A necesita cambios en la revisión, se commitean en
   `feat/home-animaciones-base` y se integran a `feat/home-animaciones` con merge, siguiendo la
   convención de la pila (la PR #2 ya integra la #1 por merge).
5. Los commits y PRs los autoriza el usuario en cada caso (sin extensión `git`).

## Forecast de riesgo

| Slice / PR | Archivos (tests incluidos) | Líneas estimadas | Riesgo |
|---|---|---|---|
| `chrome`, PR A | unos 22 (8 nuevos de producción, 8 specs nuevos o extendidos, `styles.scss`, `_motion.scss`, header scss, footer scss, `app.config.ts`, `app.routes.ts`) | unas 750 (unas 330 de producción y 420 de tests) | **Alto** (> 300) |
| `home`, PR B | unos 22 (4 componentes nuevos × 3–4 archivos, `team-band` ×3, `home.component` ×4) | unas 850 (unas 300 movidas desde la home, 250 de producción nueva y 300 de tests) | **Alto** (> 300) |
| `cierre` | 1–2 | unas 20 | Bajo |
| **Total** | unos 45 | unas 1.600 | **Alto**: unas 5 veces el umbral de 300 |

- **Repos:** uno solo (KUVU, solo el frontend). Backend sin cambios.
- **Estrategia de entrega:** `ask-on-risk`. El usuario ya eligió partir en 2 PRs apilados. Aun
  así, cada PR supera el umbral por sí solo, sobre todo por los tests y, en PR B, por las líneas
  que se mueven a componentes nuevos. Un diff de extracción se revisa más rápido que uno de código
  nuevo.
- **Riesgo técnico:** el momento de la clase `vt-public` (D13), la altura del recorrido sticky
  (D6) y el contraste de `--dim` (H4) se resuelven en la revisión manual de `verify`.

## Alcance previsto de `document`

| Campo | Valor | Motivo |
|---|---|---|
| `openapi_afectado` | `false` | No hay endpoints HTTP (el proyecto no expone API pública) |
| `changelog_afectado` | `true` | Cambio visible para cualquier visitante del sitio público |
| `readme_afectado` | `false` | No cambia instalación, comandos ni stack |
| `architecture_afectado` | `true` | Módulo `app/motion/`, servicio de scroll con alcance de componente, hook de transición de rutas con `data.publicSite` y scroll suave de anclas |
| `guidelines_afectado` | `false` | `DEVELOPMENT_GUIDELINES.md` no tiene sección de Angular. La convención de "movimiento en CSS con guardas de media query" queda en `docs/architecture.md`. Si el usuario quiere elevarla a guideline, es un cambio aparte |

Documento del cambio: `docs/home-animaciones.md`.
