# Animaciones del sitio público

El sitio público comparte un lenguaje de movimiento común: curvas, duraciones y distancias
como tokens, apariciones al hacer scroll, elevación de tarjetas y una transición propia entre
páginas públicas. Sobre esa base, la home tiene efectos ligados al scroll: barra de progreso,
hero con entrada palabra por palabra y parallax, un párrafo que se enciende por palabra, el
recorrido sticky de "¿Cómo funciona?", la banda infinita de compañías y el parallax de la banda
de equipo.

Todo se hace con APIs nativas (`IntersectionObserver`, `requestAnimationFrame`, `matchMedia`,
View Transitions y CSS), sin dependencias. Con `prefers-reduced-motion: reduce`, el sitio queda
estático y con todo el contenido visible. `/acceder`, `/login` y la app autenticada no reciben
ninguno de estos efectos.

## Cómo funciona

Rutas relativas a `frontend/proyecto_angular/src/`.

### Principio: JS mide, CSS anima

El JS solo calcula números y los publica como variables CSS en el elemento: el progreso de
scroll (`--p`, de 0 a 1), el de la página (`--page-progress`) y el desplazamiento del puntero
(`--mx` / `--my`). Toda la presentación (`transform`, `opacity`, `clip-path`) vive en CSS,
dentro de `@media (prefers-reduced-motion: no-preference)` y, según el efecto, también de
`(width >= 1024px)` o de `(hover: hover) and (pointer: fine)`. El estado base de los estilos es
el estático: si el JS no corre o falta una API, el contenido se ve completo y quieto.

### Base común (`app/motion/`, estilos globales)

| Pieza | Archivo | Qué hace |
|---|---|---|
| Tokens | `styles/_motion.scss` | `--ease-out-expo`, `--ease-in-out`, `--dur-fast` (200 ms), `--dur-base` (350 ms), `--dur-slow` (700 ms), `--dist-reveal` (28 px), `--dist-parallax` (12 px) y `--magnetic-max` (6 px) en `:root`. Los usan los estilos globales, el header, el footer, la home y la transición de rutas |
| Preferencias | `app/motion/motion-preferences.ts` | `reducedMotion()`, `finePointer()`, `desktop()` (≥ 1024 px) y `motionChanges(...)`, que emite cuando alguna consulta cambia (rotación, resize, preferencia del sistema). Es la única fuente de esas media queries en TS. Sin `matchMedia`, `reducedMotion()` devuelve `true` |
| Bucle de scroll | `app/motion/scroll-motion.service.ts` | Un listener `scroll` y uno `resize` pasivos marcan el bucle; un `requestAnimationFrame` por ráfaga lee los `getBoundingClientRect()` de todos los targets visibles y después escribe todos los progresos (sin layout thrashing). Un `IntersectionObserver` mantiene activos solo los targets cerca de la vista. Rangos: `cover` (cruce completo), `contain` (sección alta con caja sticky) y `exit` (elemento que sale por arriba). También publica `--page-progress`. Corre fuera de la zona de Angular |
| `[appScrollProgress]` | `app/motion/scroll-progress.directive.ts` | Registra su host en el servicio y publica `--p`. El valor del atributo elige el rango. Con `desktopOnly` no registra por debajo de 1024 px, y nunca registra con reduced motion. Al cambiar esas condiciones registra o desregistra y limpia `--p`. El output `progressChange` entrega el progreso por frame |
| `<app-split-text>` | `app/motion/split-text.component.ts` | Parte un texto en palabras con `--i` (índice) y deja en el host `--n` (total). Lleva una copia accesible (`.split-sr`) y las palabras visuales con `aria-hidden`, así que un lector de pantalla anuncia el texto una sola vez y continuo. `mode="enter"`: cada palabra sube desde una máscara con 60 ms de escalonado. `mode="scrub"`: opacidad `clamp(var(--dim, .35), --p × --scrub-rate × (n + 4) − i, 1)`, sin JS por palabra |
| `[appMagnetic]` | `app/motion/magnetic.directive.ts` | El host sigue el 25 % de la distancia del puntero al centro, con tope de 6 px, y vuelve a 0 al salir. Agrega la clase `.magnetic`, cuya regla global aplica `translate: var(--mx) var(--my)`; `translate` compone con el `transform` propio del botón. Solo registra listeners con puntero fino y sin reduced motion |
| Apariciones | `app/directives/reveal.directive.ts` + `styles.scss` | `[data-reveal]` hace fade-up con recorrido de 28 px y `[data-reveal="clip"]` abre con `clip-path` redondeado. Con reduced motion o sin `IntersectionObserver`, el elemento es visible de inmediato |
| Elevación | `styles.scss` (`.hover-lift`) | `translate: 0 -2px` y sombra con `:hover` (solo en `@media (hover: hover)`, no queda pegado en táctil), `:focus-visible` y `:focus-within`. `[data-reveal].hover-lift` declara las transiciones de la entrada y de la elevación juntas |
| Transición de rutas | `app/route-view-transition.ts` | `onRouteViewTransition`, registrado en `withViewTransitions`: aplica `skipViewTransitionIntoIntro` y, si la ruta de origen y la de destino tienen `data: { publicSite: true }`, marca `<html>` con `vt-public` hasta que la transición termina. Con esa clase, el header queda quieto (`view-transition-name: site-header`, sin animación) y el contenido sale y entra con fade y desplazamiento |
| Scroll suave de anclas | `app/anchor-smooth-scroll.ts` | Initializer: ante una navegación al mismo path con fragment, en ruta pública y sin reduced motion, pone `smooth-anchors` en `<html>` (`scroll-behavior: smooth`). La quita con `scrollend` o, como tope, a los 1.000 ms. Al cambiar de página el salto arriba sigue siendo instantáneo |

Las rutas públicas (`''`, `servicios`, `nosotros`, `preguntas-frecuentes`, `contacto`, `legal`
y `**`) declaran `data: { publicSite: true }` en `app.routes.ts`. Es un flag de presentación:
no interviene en autorización.

Header y footer (`components/public/site-*/`) toman duraciones y curvas de los tokens, sin
cambios de estructura.

### Home (`components/home/`)

`HomeComponent` provee `ScrollMotionService` (`providers`) y registra su host para
`--page-progress`. Al salir de la home el injector destruye el servicio y con él los
listeners, el observer y el frame pendiente.

| Sección | Componente | Comportamiento |
|---|---|---|
| Barra de progreso | `scroll-progress/scroll-progress-bar.component.ts` (`app-scroll-progress`) | Fija arriba, 3 px, `scaleX(var(--page-progress))` con el gradiente de `.btn-primary`. `aria-hidden`, sin foco, `pointer-events: none`. Sin transición CSS: el bucle la actualiza por frame |
| Hero | `hero/home-hero.component.*` (`section[app-home-hero]`) | h1 con `app-split-text mode="enter"`; marca, subtítulo y CTAs con fade-up después del título (la entrada termina en ~1,2 s). Indicador de scroll decorativo con 3 pulsos que se desvanece con `--p`. En desktop sin reduced motion, `.hero-stage` lleva `[appScrollProgress]="'exit'"` y el contenido se desplaza hasta 80 px y baja su opacidad al salir. CTA principal con `[appMagnetic]` |
| 01 "¿Qué es KUVU?" | plantilla de la home | La sección lleva `[appScrollProgress]` y el párrafo `app-split-text mode="scrub"`. `--dim: 0.65` (contraste del texto atenuado ≥ 3:1 en claro y oscuro) y `--scrub-rate: 1.6` (termina de encenderse con la sección cerca del centro) |
| 02 "¿Cómo funciona?" | `steps-journey/steps-journey.component.*` (`section[app-steps-journey]`) | `<ol>` con los 4 pasos, siempre en el DOM. En desktop sin reduced motion (clase `is-journey`): etapa de 250vh, caja sticky a 64 px en dos columnas, línea `scaleY(var(--p))` y paso activo `floor(p × 4)` con `aria-current="step"`; el resto queda con opacidad 0,55. En mobile o con reduced motion: lista con fade-up |
| 05 "Compañías que confían" | `companies-marquee/companies-marquee.component.*` (`section[app-companies-marquee]`) | Lista real más 3 copias `aria-hidden` + `inert`, animación `translateX(-50%)` de 40 s. Se pausa con hover, con foco dentro, con el botón (`aria-pressed`, nombre "Pausar/Reanudar animación de compañías") y fuera de la vista (`IntersectionObserver` propio, `.is-offscreen`). Con reduced motion (`is-static`): lista que se ajusta en líneas, sin copias ni botón |
| Banda de equipo | `team-band/team-band.component.*` | `.team-band-media` con `data-reveal="clip"` y `[appScrollProgress] desktopOnly`. En desktop la foto lleva `scale(1.06)` y `translateY(±12 px)` según `--p`, sin bordes vacíos |
| Servicios, seguridad, FAQ | plantilla de la home | Filas y tarjetas con `.hover-lift` |
| CTA final | plantilla de la home | Botón "Ingresar" con `[appMagnetic]` |

Los estilos compartidos `.container`, `.section-title` y `.section-lead` viven en el mixin
`components/home/_section-heading.scss`, que incluyen la home, el recorrido y la banda de
compañías: los estilos encapsulados no cruzan componentes.

### Tests

Los dobles de `matchMedia`, `requestAnimationFrame` e `IntersectionObserver` están en
`app/motion/testing/`. Cada pieza tiene su spec (`*.spec.ts` junto al archivo). La revisión
visual (parallax sin bordes, sticky, reduced motion, orden de foco) se hace sobre el build de
producción.

## Decisiones

- **Un solo bucle de scroll provisto por la home, no `providedIn: 'root'`.** Garantiza que fuera
  de la home no queden listeners. Tradeoff: un componente que use `[appScrollProgress]` necesita
  un ancestro que provea el servicio; la directiva no funciona sola.
- **JS + rAF en lugar de scroll-driven animations de CSS (`animation-timeline`).** Safari y
  Firefox las soportan de forma parcial y el recorrido necesita el paso activo en JS de todas
  formas. El CSS ya consume `--p`, así que se puede migrar más adelante sin tocar los estilos.
- **Scroll suave solo para anclas de la misma página**, no `scroll-behavior: smooth` global: el
  global suavizaría también el salto arriba que el router hace en cada cambio de página y
  llegaría a `/login`.
- **Transición de rutas por clase en `<html>` (`vt-public`)** en lugar de
  `ViewTransition.types`, que tiene menos soporte.
- **Estilos de la home y de sus secciones en CSS plano, sin `@apply`.** Tailwind v4 expande cada
  `@apply` con fallbacks y un bloque `@layer properties` en cada componente, y la home va en el
  bundle inicial (presupuesto ≤ 439,5 kB; hoy 438,51 kB). Tradeoff: valores literales
  (spacing, tamaños) en lugar de utilidades.
- **Fallback literal en los tokens de tema que usan las piezas nuevas** (línea y riel del
  recorrido, botón de pausa): `--color-home-*` y `--color-brand-600` no existen en `:root` en
  tema claro (ver `docs/architecture.md`, patrón `var(--token, valor)`).
- **Banda de compañías con 3 copias.** Con 4 nombres cortos, una lista es más angosta que la
  banda; cada mitad del recorrido tiene 2 listas para que el reinicio no se note.

## Limitaciones conocidas

- La altura del recorrido (250vh) y el ritmo del párrafo 01 (`--scrub-rate: 1.6`) son valores
  de diseño, no requisitos: se ajustan por CSS si la experiencia lo pide.
- El paso activo del recorrido transiciona también `border-color`, fuera de las tres propiedades
  (`transform`, `opacity`, `clip-path`) del resto de los efectos. Es un repintado barato sobre
  4 elementos.
- En tema claro las tarjetas de "¿Cómo funciona?", los números de paso y los íconos de servicios
  no muestran borde ni fondo, porque sus tokens no existen en `:root`. No depende de las
  animaciones: se corrige emitiendo los tokens del tema.
- `@angular/router` 21.2.23 tiene advisories de DoS que solo afectan al renderizado en servidor.
  El sitio es un SPA sin SSR, así que no son alcanzables. Queda pendiente actualizar
  `@angular/*` a ≥ 21.2.25.
- Si el navegador no soporta View Transitions, la navegación entre páginas es instantánea, sin
  error.
