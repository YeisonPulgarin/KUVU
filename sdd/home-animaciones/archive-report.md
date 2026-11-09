# Archive report — home-animaciones

Estado: **cerrado**. Almacenamiento de artifacts: `files` (sin memoria compartida que
sincronizar). Extensión `git` inactiva: commits locales **sin push**; el push y la apertura de
los PRs los autoriza el usuario.

| PR | Rama | Base del PR | Commits |
|---|---|---|---|
| PR A: base común de movimiento | `feat/home-animaciones-base` | `feat/acceso-orden-e-intro` (PR #2, apilada sobre la PR #1) | `5f66d68` |
| PR B: animaciones de la home | `feat/home-animaciones` | `feat/home-animaciones-base` | `e718dcc`, `974ccf1`, `c84c0dc`, `f84234c` y el commit de este cierre |

Los dos PRs están **pendientes de apertura**.

## Secretos a rotar

**Ninguno** (`secure-report.md`: sin secretos en el diff).

## Qué se hizo

El sitio público tiene un lenguaje de movimiento común y la home, efectos ligados al scroll.
Todo es nativo, sin dependencias, y queda estático con `prefers-reduced-motion: reduce`.

- **Base común (PR A):** tokens de movimiento (`styles/_motion.scss`) y módulo `app/motion/`:
  preferencias por `matchMedia`, `ScrollMotionService` (un rAF por ráfaga, provisto por
  componente), `[appScrollProgress]`, `<app-split-text>` accesible y `[appMagnetic]`. Además:
  reveal con recorrido de 28 px y variante `clip`, `.hover-lift` con foco y sin hover pegado en
  táctil, header y footer con tokens, transición entre páginas públicas (`data.publicSite` +
  `onRouteViewTransition`, el header queda quieto) y scroll suave solo para anclas de la misma
  página.
- **Home (PR B):**
  - Barra de progreso de lectura.
  - Hero extraído: título palabra por palabra, indicador de scroll, parallax de salida en
    desktop y CTA magnético.
  - Párrafo 01 que se enciende por palabra (`--dim` 0,65, contraste ≥ 3:1 en ambos temas).
  - Recorrido sticky de "¿Cómo funciona?" con paso activo (`aria-current="step"`).
  - Banda infinita de compañías con botón de pausa y modo estático.
  - Banda de equipo con apertura `clip-path` y parallax.
  - Elevación en filas y tarjetas.
- **Resultado medido:** 467 tests en verde; bundle inicial 438,51 kB (base 424,49 kB, tope
  439,5 kB); `home.component` compilado 6,74 kB (base ~16,8 kB). Revisión en navegador por CDP
  sobre el build de producción en 375, 1023, 1280 y 1920 px, con y sin reduced motion.

## Decisiones relevantes

- Dos PRs apilados sobre la PR #2 (decisión del usuario en `design`).
- JS mide y CSS anima; el servicio de scroll vive en el injector de la home.
- Scroll suave solo para anclas (D14). El texto de CA-02 en `spec.md` se alineó en este cierre
  (V-1).
- Estilos de la home y sus secciones en CSS plano, sin `@apply`, por el presupuesto del bundle
  inicial.
- Fallback literal para los tokens de tema claro en las piezas nuevas (V-3, corregido en
  verify).
- V-2 aceptado por el usuario: el paso activo del recorrido también transiciona `border-color`.

## Documentación

| Destino | Estado |
|---|---|
| `docs/home-animaciones.md` | Creado |
| `docs/architecture.md` | Actualizado: clúster público (home, `app/motion/`, tokens, hook de rutas, anclas), flujo de navegación pública y decisiones estructurales |
| `CHANGELOG.md` | Unreleased: 6 entradas en Added y 2 en Changed |
| OpenAPI / Bruno | No aplica: el cambio no toca endpoints HTTP y el proyecto no expone API pública |
| `README.md` | No aplica: no cambian instalación, comandos, variables ni stack |
| `DEVELOPMENT_GUIDELINES.md` | Sin cambios: no tiene sección de Angular. Las convenciones quedan en `architecture.md` y `sdd/sdd-init.md`; elevarlas a guideline es un cambio aparte |

## Riesgo residual aceptado (secure)

- **H-1:** `@angular/router` 21.2.23 tiene advisories de DoS que solo afectan a SSR. No son
  alcanzables (la app es un SPA sin SSR). **Aceptado por el usuario (Wilson Solano) el
  2026-11-08.**

## Pendiente (trabajo consciente no hecho)

| # | Pendiente | Origen | Sugerencia |
|---|---|---|---|
| P-1 | Actualizar `@angular/*` a ≥ 21.2.25 | `secure-report` H-1 | Cambio propio de dependencias; prioridad alta si se adopta SSR |
| P-2 | Los tokens de tema claro (`--color-home-*`, `--color-brand-100/600`, `--radius-*`) no existen en `:root`: tarjetas de "¿Cómo funciona?", números de paso, íconos de servicios y superficies se ven sin borde ni fondo | `verify-report` F-1 (ya existía antes del cambio) | Cambio visual aparte: `@theme static` o tokens también en `:root`, con revisión de capturas de todo el sitio |
| P-3 | Ajuste fino de la altura del recorrido (250vh) y del ritmo del párrafo 01 (`--scrub-rate: 1.6`) | `verify-report` | Solo si la experiencia lo pide; es CSS |
| P-4 | El warning `css-inline-fonts` depende del tamaño de la hoja de Google Fonts y a veces pasa a error (tope de 20 kB) | `apply-progress/home` | Cambio aparte: autoalojar Geist o subir el presupuesto con criterio |
| P-5 | `sdd/sdd-init.md` dice `expone_api_http: true` y `sdd.config.md` dice que no hay API pública | `apply-progress/cierre` | Corregir la config |

### Deliberadamente sin tocar (refine)

- Patrón de suscripción a `motionChanges` repetido 4 veces: helper solo si aparece un quinto uso.
- Helper `accessibleText` duplicado en 2 specs (la tercera variante es distinta).
- `.container` del hero fuera del mixin, para no sumar al bundle inicial reglas que no usa.
- Lectura de `scrollHeight` por frame: sin baseline que muestre costo.

## Siguiente paso manual

1. Push de las dos ramas: `git push -u origin feat/home-animaciones-base` y
   `git push -u origin feat/home-animaciones`.
2. PR A `feat(motion): base común de movimiento del sitio público`, base
   `feat/acceso-orden-e-intro`.
3. PR B `feat(home): animaciones de la home`, base `feat/home-animaciones-base`. Al mergear la
   pila, rebasear o cambiar la base según se vayan mergeando la PR #1 y la PR #2.
