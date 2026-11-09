# design — home-animaciones

Responde a `sdd/home-animaciones/spec.md` (RF-01…RF-16, RNF-01…RNF-05, CA-01…CA-27). No repite los
requisitos: los referencia. Todas las rutas son relativas a `frontend/proyecto_angular/src/`.

## Decisiones confirmadas por el usuario

| # | Decisión |
|---|---|
| 1 | Las páginas internas heredan el lenguaje común: recorrido de 28 px en `data-reveal` y `.hover-lift` con foco y sin hover pegado en táctil (D4, D11) |
| 2 | El recorrido de "¿Cómo funciona?" arranca en ~250 vh y se ajusta en la revisión manual de `verify` (D6) |
| 3 | Entrega en dos PRs apilados sobre `feat/acceso-orden-e-intro` (PR #2): el primero con la base común y `chrome`, el segundo con `home` (ver "Slices" y `tasks`) |

## Principios

1. **Cero dependencias** (RNF-01). Se usan APIs nativas: `IntersectionObserver`,
   `requestAnimationFrame`, `matchMedia`, View Transitions (por el router) y CSS.
2. **JS mide y CSS anima.** El JS solo calcula números (progreso 0–1, desplazamiento del puntero) y
   los publica como variables CSS en el elemento. Toda la presentación (`transform`, `opacity`,
   `clip-path`) vive en CSS, dentro de media queries de movimiento y de puntero. Por eso el modo
   reducido se resuelve casi entero en CSS y, además, el JS no registra trabajo que no se va a ver.
3. **El estado por defecto es el estático.** Los estilos base muestran todo el contenido visible y
   quieto. El movimiento se agrega solo dentro de `@media (prefers-reduced-motion: no-preference)`
   y, cuando corresponde, de `(width >= 1024px)` o `(hover: hover) and (pointer: fine)`. Si el JS no
   corre o falta una API, queda el estado estático (RNF-05).
4. **El alcance lo fija el árbol de componentes.** El movimiento ligado al scroll vive en
   servicios provistos por `HomeComponent`, no en `root`. Al salir de la home el injector se
   destruye y todo se libera (RNF-03, RF-15).
5. **Presupuesto:** `home.component.scss` no recibe estilos nuevos. Las secciones que cambian de
   estructura se extraen a componentes propios y se llevan sus estilos, con lo que
   `home.component.scss` baja de tamaño (RNF-02).

## Arquitectura

```
app.config.ts
 └─ withViewTransitions({ onViewTransitionCreated: onRouteViewTransition })
       ├─ skipViewTransitionIntoIntro(info)     (sin cambios: RF-14)
       └─ marca html.vt-public si from y to son del sitio público (RF-13)
 └─ provideAppInitializer → anchor smooth scroll (RF-02)

HomeComponent  providers: [ScrollMotionService]
 ├─ app-scroll-progress            barra (RF-03)
 ├─ app-site-header                (lenguaje común, RF-12)
 ├─ app-home-hero                  h1 por palabras, indicador, parallax (RF-04, RF-10)
 │    └─ app-split-text            texto partido accesible
 ├─ sección 01  [appScrollProgress] + app-split-text mode="scrub"   (RF-06)
 ├─ app-steps-journey              recorrido fijo en desktop (RF-07)
 ├─ servicios / seguridad / FAQ    data-reveal + .hover-lift (RF-05, RF-11)
 ├─ app-companies-marquee          banda infinita con botón de pausa (RF-08)
 ├─ app-team-band                  data-reveal="clip" + parallax (RF-05, RF-09)
 ├─ CTA final                      [appMagnetic] (RF-10)
 └─ app-site-footer                (lenguaje común, RF-12)
```

### Piezas nuevas

| Pieza | Ubicación | Responsabilidad |
|---|---|---|
| `_motion.scss` | `src/styles/_motion.scss` (incluido por `styles.scss`) | Tokens de movimiento como custom properties en `:root` (RF-01) |
| `MotionPreferences` | `app/motion/motion-preferences.ts` | Funciones puras sobre `matchMedia`: `reducedMotion()`, `finePointer()`, `desktop()` y un observable de cambio. Única fuente de las tres media queries en TS |
| `ScrollMotionService` | `app/motion/scroll-motion.service.ts` | Bucle único de scroll con rAF. **No** `providedIn: 'root'`: lo provee `HomeComponent` |
| `ScrollProgressDirective` | `app/motion/scroll-progress.directive.ts` | `[appScrollProgress]`: registra el host en el servicio y recibe `--p` (0–1) mientras está a la vista |
| `RevealDirective` (existente, extendida) | `app/directives/reveal.directive.ts` | Variante por valor del atributo: `data-reveal` (fade-up) y `data-reveal="clip"` |
| `SplitTextComponent` | `app/motion/split-text.component.ts` | Parte un texto en palabras animables, con el texto completo para lectores de pantalla |
| `MagneticDirective` | `app/motion/magnetic.directive.ts` | `[appMagnetic]`: publica `--mx`/`--my` acotados según el puntero |
| `ScrollProgressBarComponent` | `app/components/home/scroll-progress/` | Barra fija decorativa (RF-03) |
| `HomeHeroComponent` | `app/components/home/hero/` | Hero extraído de la home con sus estilos (RF-04) |
| `StepsJourneyComponent` | `app/components/home/steps-journey/` | "¿Cómo funciona?" extraído (RF-07) |
| `CompaniesMarqueeComponent` | `app/components/home/companies-marquee/` | "Compañías que confían" extraído (RF-08) |
| `onRouteViewTransition` | `app/route-view-transition.ts` | Hook del router que compone el salteo de la intro con la transición pública (RF-13, RF-14) |
| `anchorSmoothScroll` | `app/anchor-smooth-scroll.ts` | Initializer que activa el scroll suave solo durante la navegación a un ancla (RF-02) |

Los componentes nuevos se ubican junto a `team-band/`, que ya sigue este patrón de "sección con
estilos propios". Las piezas de movimiento reutilizables van en `app/motion/` porque no pertenecen
a la home: `MagneticDirective`, `SplitTextComponent` y `RevealDirective` se pueden usar en otras
páginas.

## Decisiones técnicas

### D1 — Tokens de movimiento como custom properties (RF-01)

`:root` define `--ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1)` (la curva que ya usa el sitio),
`--ease-in-out`, `--dur-fast` (200 ms), `--dur-base` (350 ms), `--dur-slow` (700 ms),
`--dist-reveal` (28 px), `--dist-parallax` (12 px) y `--magnetic-max` (6 px). Header, footer,
home y la transición de rutas los consumen con `var(...)`. La variable SCSS `$ease-out-expo` que
duplican `styles.scss` y `site-header.component.scss` se reemplaza por `var(--ease-out-expo)`.

**Por qué custom properties y no solo SCSS:** son el mismo canal que usan las variables que publica
el JS (`--p`, `--mx`), se pueden leer desde los componentes con encapsulación y cuestan bytes una
sola vez en el CSS global, que no tiene presupuesto propio.

### D2 — Un único bucle de scroll por rAF (RNF-03)

`ScrollMotionService`:

- Mantiene un conjunto de **targets activos**. Un target es un elemento más un callback de
  escritura. `ScrollProgressDirective` registra su host. Un `IntersectionObserver` con
  `rootMargin` de 10 % agrega el target al conjunto al entrar en la vista y lo saca al salir: nada
  se calcula fuera de la vista.
- Registra **un** listener `scroll` pasivo en `window` y uno `resize` pasivo. Cada evento solo
  marca la necesidad de recalcular y pide un `requestAnimationFrame` si no hay uno pendiente. En el
  frame lee `getBoundingClientRect()` de todos los targets activos (todas las lecturas primero) y
  después escribe `style.setProperty('--p', …)` en cada uno (todas las escrituras después). Así no
  hay layout thrashing y hay como máximo una actualización por frame.
- El progreso de un target va de 0 cuando su borde superior toca el borde inferior del viewport a
  1 cuando su borde inferior pasa el borde superior. Cada target puede declarar otro rango
  (`start`/`end`) para casos como el hero, que sale de la vista, o el recorrido fijo.
- También publica `--page-progress` en el host de `HomeComponent` para la barra (RF-03).
- Se crea perezosamente con el primer target y, en `ngOnDestroy` (lo destruye el injector de
  `HomeComponent`), quita los listeners, desconecta el observer y cancela el frame pendiente
  (CA-23).
- **Con movimiento reducido no se registran targets de parallax ni de recorrido.** La barra sí
  sigue publicando progreso (RF-03), sin transición CSS.
- Corre fuera de la zona de Angular (`NgZone.runOutsideAngular`). Solo escribe estilos, no
  necesita detección de cambios. El único estado que llega a la plantilla (el paso activo, D6) se
  publica con una signal y únicamente cuando cambia de valor.

**Alternativas descartadas:**

- *Scroll-driven animations de CSS (`animation-timeline: view()`)*: resuelven parallax y progreso
  sin JS, pero Safari y Firefox las soportan de forma parcial. Con ellas los efectos quedarían
  desiguales entre navegadores y el recorrido de pasos necesita el paso activo en JS de todas
  formas (D6). Pueden reemplazar el bucle más adelante sin cambiar el CSS que consume `--p`.
- *Un listener por directiva*: N listeners y N lecturas de layout desordenadas por frame.
- *Unificar el listener del header en el servicio*: el header también vive en `app-public-page`,
  donde no hay `ScrollMotionService`. Mantiene su listener pasivo propio, que solo compara un
  umbral.

### D3 — Breakpoint de desktop y puntero fino (spec, Definiciones)

El corte es `(width >= 1024px)`, el breakpoint `lg` que el proyecto ya usa (10 media queries en
los estilos actuales). En CSS los efectos van dentro de:

```scss
@media (prefers-reduced-motion: no-preference) and (width >= 1024px) { /* parallax, recorrido fijo */ }
@media (prefers-reduced-motion: no-preference) and (hover: hover) and (pointer: fine) { /* magnético */ }
```

En TS, `MotionPreferences` expone las mismas tres consultas y emite cambios con el evento
`change` de `MediaQueryList`. Cuando la consulta deja de cumplirse (rotación, resize, cambio de
preferencia del sistema), las directivas desregistran sus targets y quitan las variables. La
imagen vuelve a la posición neutra (CA-12b) y en CSS el efecto desaparece por la propia media
query. **Doble guarda:** el CSS garantiza que no se ve movimiento y el JS garantiza que no se
gasta trabajo ni se registran listeners (CA-13).

### D4 — Apariciones: `RevealDirective` extendida (RF-05)

- La directiva conserva su contrato: agrega `.is-visible` al entrar en la vista y lo agrega de
  inmediato con movimiento reducido o sin `IntersectionObserver` (CA-05, CA-06). Un elemento que ya
  está en la vista al cargar dispara el observer en el primer callback, sin esperar al scroll.
- Lo nuevo vive en CSS global: `--dist-reveal` (28 px), `--dur-slow` y `--ease-out-expo` para
  fade-up, y `[data-reveal="clip"]`, que pasa de `clip-path: inset(8% 6% round 32px)` a
  `inset(0 round 0)`. El stagger con `--reveal-index` se mantiene.
- Como el cambio va en `styles.scss`, las páginas internas que ya usan `data-reveal` (nosotros,
  preguntas frecuentes) heredan el recorrido mayor. Es coherente con RF-01 y no agrega efectos
  nuevos a esas páginas.

### D5 — Texto por palabra accesible: `SplitTextComponent` (RF-04, RF-06, RNF-04)

Plantilla:

```html
<span class="sr-only">{{ text }}</span>
<span class="split" aria-hidden="true">
  @for (w of words; track $index) { <span class="w" [style.--i]="$index">{{ w }}</span> }
</span>
```

- El lector de pantalla lee el texto completo una vez. Las palabras visibles son decorativas
  (CA-04, CA-07). El `h1` contiene el componente, así que su nombre accesible es el texto original.
- `[style.--n]` en el host da el total de palabras.
- **`mode="enter"` (h1 del hero):** cada palabra sube desde una máscara (`overflow: clip` más
  `translateY(100%)`) con `animation-delay: calc(var(--i) * 60ms)`. Con 9 palabras, la entrada
  termina antes de 1,5 s. Subtítulo y CTAs entran con un delay derivado de `--n`.
- **`mode="scrub"` (párrafo de la sección 01):** la opacidad de cada palabra es
  `clamp(var(--dim), (var(--p) * (var(--n) + 4) - var(--i)), 1)`, con `--p` publicado por
  `[appScrollProgress]` en la sección. No hay JS por palabra. `--dim` arranca en 0,35 y en `apply`
  se ajusta hasta medir un contraste de 3:1 o más contra el fondo real (RF-06).
- Con movimiento reducido, la regla de opacidad y la animación de entrada no existen (están dentro
  de la media query) y las palabras se ven a opacidad completa.
- El texto que recibe es literal de la plantilla o de `content/*`: no cambia ningún texto (RF-16).
- **Descartado:** `aria-label` en el `h1` con las palabras visibles sin ocultar, porque algunos
  lectores leen ambos. También se descarta partir el texto en el DOM sin copia `sr-only`, porque
  NVDA y VoiceOver anuncian cada `span` como un fragmento suelto.

### D6 — "¿Cómo funciona?" como recorrido: `StepsJourneyComponent` (RF-07)

- **Estructura:** un `<ol>` con los 4 pasos, siempre en el DOM y visibles para tecnologías de
  asistencia (CA-08).
- **Desktop (≥ 1024 px, sin reduced motion):** la sección tiene una altura de unos 250 vh y un
  contenedor interior `position: sticky; top: <alto del header>`. `[appScrollProgress]` en la
  sección publica `--p`. La línea de progreso es `transform: scaleY(var(--p))` y el paso activo es
  `floor(p * 4)`, acotado a 0–3. Ese cálculo lo hace el componente en el callback del target y lo
  guarda en una signal solo si cambia. El paso activo lleva `aria-current="step"` y la clase
  `.is-active`. Los demás quedan con opacidad 0,55, legibles.
- **Mobile o reduced motion:** sin altura extra, sin sticky, sin línea ni paso activo
  (`aria-current` ausente). Cada paso usa `data-reveal` (en reduced motion, visible directamente).
- El componente consulta `MotionPreferences` para no registrar el target fuera de desktop.
- **Descartado:** el patrón de zookay, que cambia fotos por paso. La home no tiene imágenes por
  paso y la spec no permite agregarlas (RF-16).

### D7 — Banda infinita: `CompaniesMarqueeComponent` (RF-08)

- **Estructura:** un contenedor con dos pistas. La primera tiene la lista real (`<ul>`). La
  segunda es una copia con `aria-hidden="true"` e `inert`, para que no tenga foco ni la lean los
  lectores (CA-09). La animación CSS es `translateX(0 → -50%)` lineal, de unos 40 s por vuelta, sin
  saltos porque las dos pistas son idénticas.
- **Pausa:** `animation-play-state: paused` con `:hover`, con `:focus-within` y con la clase
  `.is-paused` del botón. El botón es un `<button>` visible con `aria-pressed` y un nombre que
  alterna entre "Pausar animación de compañías" y "Reanudar animación de compañías" (CA-10). El
  estado es una signal local.
- **Fuera de la vista:** un `IntersectionObserver` propio, uno solo, alterna `.is-offscreen`, que
  también pausa la animación. No usa el bucle de scroll porque no necesita progreso.
- **Reduced motion:** la animación no existe, la copia tiene `display: none`, la lista real se
  ajusta con `flex-wrap` y el botón de pausa no se renderiza, porque no hay nada que pausar
  (CA-11). El orden de tabulación con reduced motion queda igual al de la base.
- Los nombres y `className` vienen de `content/companies` sin cambios.

### D8 — Hero: `HomeHeroComponent` (RF-04)

- Se extraen el marcado y los estilos del hero desde `home.component.{html,scss}`. El `rise-in`
  actual se reemplaza por la entrada con `SplitTextComponent` en el h1 y por un fade-up escalonado
  para marca, subtítulo y CTAs.
- **Indicador de scroll:** un elemento decorativo (`aria-hidden`) con un pulso CSS de 3 iteraciones
  (unos 4,5 s, para no ser movimiento continuo de más de 5 s según RNF-04). Su opacidad es
  `1 - var(--p) * 4`, así que desaparece al empezar el scroll.
- **Parallax:** `[appScrollProgress]` en el hero, con un rango de "salida" (de 0 con el hero
  arriba a 1 cuando sale entero). Solo en desktop y sin reduced motion,
  `.hero-inner { transform: translateY(calc(var(--p) * 80px)); opacity: calc(1 - var(--p) * 0.6) }`.
  La directiva no registra el target fuera de desktop (D3).
- Los CTAs llevan `[appMagnetic]`.
- **CLS:** las palabras ocupan su lugar desde el primer render (solo `transform` y `opacity`), así
  que no hay desplazamiento de layout.

### D9 — Banda de equipo (RF-05, RF-09)

- `team-band-media` recibe `data-reveal="clip"` y `[appScrollProgress]`.
- **Parallax en desktop:** la imagen tiene `scale(1.06)` (sobrante de unos 3 % por lado, más que
  ±12 px en anchos de hasta unos 2.000 px) y
  `translateY(calc((var(--p) - 0.5) * -2 * var(--dist-parallax)))`. Con eso nunca se ven bordes
  vacíos (CA-12). Fuera de desktop, la escala y el desplazamiento no se aplican.
- Los estilos van en `team-band.component.scss`, que tiene presupuesto propio holgado.

### D10 — Botones magnéticos: `MagneticDirective` (RF-10)

- En `ngAfterViewInit` consulta `MotionPreferences.finePointer() && !reducedMotion()`. Si no se
  cumple, **no registra ningún listener** (CA-13). Se suscribe a los cambios de esas consultas
  para registrar o quitar los listeners.
- Usa `pointermove` y `pointerleave` pasivos, fuera de la zona de Angular, con un rAF. El
  desplazamiento es el 25 % de la distancia del puntero al centro, acotado a `--magnetic-max`
  (6 px), y se publica en `--mx`/`--my`. El CSS aplica `translate(var(--mx), var(--my))` con
  transición `--dur-base`. Al salir, las variables vuelven a 0.
- 6 px es menos que el padding de los botones, así que el área clicable no sale de debajo del
  puntero. Solo cambia `transform`: el foco, el anillo de foco y el clic no se tocan (CA-14).
- Se aplica a los CTAs del hero y del CTA final.

### D11 — Elevación en hover (RF-11)

- `.hover-lift` se aplica a `.service-row`, `.security-item` y `.faq-item`.
- **En el CSS global:** el `:hover` va dentro de `@media (hover: hover)`, para que no quede pegado
  en táctil. `:focus-visible` y `:focus-within` también elevan. Con movimiento reducido, el estado
  elevado se aplica sin transición y la sombra se mantiene como indicación.
- `/servicios` hereda la misma regla.

### D12 — Barra de progreso: `ScrollProgressBarComponent` (RF-03)

- Va en la plantilla de `HomeComponent`, con lo que solo existe en la home (decisión 3 de la spec).
- `position: fixed; top: 0; height: 3px` con `transform-origin: left` y
  `transform: scaleX(var(--page-progress))`. El color es el de marca de `.btn-primary`.
- Es `aria-hidden="true"`, `pointer-events: none` y no enfocable.
- Con reduced motion no tiene `transition`, pero el valor sigue al scroll.
- Su `z-index` queda por encima del header sticky.

### D13 — Transición entre páginas públicas (RF-13, RF-14, RF-15)

- `route-view-transition.ts` exporta `onRouteViewTransition(info)`, que se registra en
  `withViewTransitions` en lugar de `skipViewTransitionIntoIntro`:
  1. Llama a `skipViewTransitionIntoIntro(info)` sin cambios. Si saltea, termina ahí (RF-14).
  2. Si la hoja de `from` y la de `to` son del sitio público, agrega `vt-public` a
     `document.documentElement` y la quita en `transition.finished.finally(...)`.
- **Qué es "sitio público":** las rutas públicas declaran `data: { publicSite: true }` en
  `app.routes.ts` (`''`, `servicios`, `nosotros`, `preguntas-frecuentes`, `contacto`, `legal` y
  `**`). El flag explícito es más seguro que una lista de paths duplicada. `/acceder`, `/login` y
  las rutas autenticadas no lo tienen, así que mantienen el cross-fade por defecto (RF-15, CA-19).
- **CSS global**, todo bajo `html.vt-public`:
  - `app-site-header { view-transition-name: site-header }`. Como existe en la página vieja y en
    la nueva, forma un grupo propio. `::view-transition-group(site-header)` va con
    `animation: none`, así que el header queda quieto.
  - `::view-transition-old(root)` sale con fade y `translateY(-16px)`, y
    `::view-transition-new(root)` entra con fade y `translateY(24px → 0)`, con `--dur-base` y
    `--ease-out-expo`.
  - Fuera de `html.vt-public`, el header no tiene `view-transition-name` y todo funciona como en
    la base.
- **Momento de la clase:** Angular llama a `onViewTransitionCreated` en forma síncrona después de
  `document.startViewTransition`. La captura del estado viejo ocurre en el siguiente frame de
  render, así que la clase ya está presente en las dos capturas. Esto se valida en el test manual
  de CA-17.
- **Reduced motion:** sigue vigente la regla global que anula `::view-transition-*`.
- **Sin la API:** el router no crea la transición, el hook no corre y no hay error.
- **Descartado:** `ViewTransition.types` con `:active-view-transition-type()`. Es más limpio, pero
  su soporte es menor que el de la clase y el beneficio no compensa.

### D14 — Scroll suave solo para anclas (RF-02)

**El problema:** `html { scroll-behavior: smooth }` global haría suave también el `scrollTo(0, 0)`
que el router hace en cada cambio de página (`scrollPositionRestoration: 'top'`), y lo llevaría a
`/login` y a la app autenticada (RF-15).

**La solución:** `anchorSmoothScroll`, un initializer registrado en `app.config.ts`, escucha los
eventos del router. Ante una `NavigationStart` hacia la **misma ruta** con `fragment`, si la ruta
es del sitio público y no hay reduced motion, agrega `smooth-anchors` a `<html>`. CSS:
`html.smooth-anchors { scroll-behavior: smooth }`. El router hace el scroll al ancla con el offset
existente (`ViewportScroller.setOffset`). La clase se quita con el evento `scrollend`, o a los
1.000 ms donde ese evento no exista.

- Las navegaciones a otra página siguen con salto instantáneo arriba.
- El scroll con rueda o teclado no se toca.

**Descartado:** suavizado por JS (no-objetivo) y `scroll-behavior` global (por el problema de
arriba).

### D15 — Header y footer (RF-12)

- Solo cambian los valores: duraciones y curvas pasan a los tokens de D1.
- El paso a compacto anima `background-color` y `box-shadow` como hoy.
- El menú móvil conserva su secuencia y el foco gestionado.
- El CTA del footer usa `--dur-base`.
- No se agregan efectos nuevos ni se toca la estructura, para conservar la cobertura existente
  (CA-16).

## Aislamiento de `/login` y la app autenticada (RF-15)

| Mecanismo | Por qué no llega fuera del sitio público |
|---|---|
| `ScrollMotionService` y directivas de scroll | Los provee `HomeComponent`; no existen en otro injector |
| `SplitTextComponent`, `MagneticDirective`, marquee, hero, recorrido, barra | Solo se usan en plantillas de la home |
| Transición propia | Requiere `publicSite` en `from` y `to` |
| Scroll suave | Requiere el mismo path con fragment y `publicSite` |
| Tokens `:root` y `.hover-lift` | Son valores inertes hasta que una regla los usa; la app autenticada no usa esas clases |
| `[data-reveal]` global | Ya es global hoy; la app autenticada no lo usa |

## Estrategia de reduced motion (resumen)

- **CSS:** todo efecto está dentro de `@media (prefers-reduced-motion: no-preference)`. El estado
  base es estático y visible. Se mantienen la regla global de `::view-transition-*` y la de
  `[data-reveal]` visible.
- **TS:** `MotionPreferences.reducedMotion()` evita registrar parallax, recorrido, magnético y
  scroll suave. La barra de progreso es la única que sigue escuchando scroll, sin transición.
- **Cambio en vivo de la preferencia:** las directivas reaccionan al evento `change` (D3).

## Presupuesto (RNF-02)

- **`home.component.scss` (11,9 kB fuente, unos 16,8 kB compilado):** pierde los bloques `.hero*`,
  `.steps*`, `.companies*` y la animación `rise-in`, que pasan a sus componentes. El objetivo es
  quedar por debajo de 14 kB compilado.
- **Componentes nuevos:** cada uno queda por debajo de 6 kB compilado, lejos del warning de
  17 kB.
- **Bundle inicial:** se estiman entre 6 y 10 kB de JS y CSS nuevos (servicio, 3 directivas,
  5 componentes chicos, tokens y reglas globales), contra el tope de 15 kB (≤ 439,5 kB). `apply`
  mide con `ng build` al cerrar cada slice.

## Logs (DEVELOPMENT_GUIDELINES.md, "Logging & Observability")

El cambio es de presentación y no tiene eventos de negocio ni errores operativos que registrar.
Por eso **no se agregan logs ni llamadas a `console.*`**. La ausencia de una API es una
degradación esperada que se resuelve con detección de soporte, no un error. Loguearla sería ruido
y, si interesara contarla, sería una métrica. `verify` comprueba que el diff no introduce
`console.*`.

## Plan de tests (Karma, `test-after`)

Todos los specs simulan `matchMedia` con un doble que devuelve `matches` configurable y permite
disparar `change`. También simulan `IntersectionObserver` cuando hace falta. No se depende de
scroll real (limitación de la spec).

| Spec | Qué prueba | CA |
|---|---|---|
| `motion/motion-preferences.spec.ts` | Las tres consultas y la emisión de cambios | CA-04b, CA-12b, CA-13 |
| `motion/scroll-motion.service.spec.ts` | Progreso calculado para rects simulados (0, 0,5, 1); un solo rAF por ráfaga de eventos; solo targets visibles; `ngOnDestroy` quita listeners, observer y frame | CA-03, CA-23, CA-24 |
| `motion/scroll-progress.directive.spec.ts` | No registra el target fuera de desktop o con reduced motion; lo desregistra al cruzar el breakpoint y limpia `--p` | CA-04b, CA-12b |
| `directives/reveal.directive.spec.ts` (extendido) | Variante `clip`; visible con reduced motion y sin `IntersectionObserver` | CA-05, CA-06 |
| `motion/split-text.component.spec.ts` | Copia `sr-only` igual al texto, palabras con `aria-hidden`, `--i`/`--n`, texto sin cambios | CA-04, CA-07 |
| `motion/magnetic.directive.spec.ts` | Sin listeners con puntero grueso o reduced motion; desplazamiento acotado a 6 px; vuelve a 0 al salir | CA-13, CA-14 |
| `home/scroll-progress/*.spec.ts` | `aria-hidden`, no enfocable, refleja `--page-progress` | CA-03 |
| `home/hero/*.spec.ts` | El h1 tiene como nombre accesible el texto completo; CTAs presentes y con `routerLink`; indicador `aria-hidden` | CA-04, CA-05 |
| `home/steps-journey/*.spec.ts` | 4 pasos en el DOM; `aria-current` sigue al progreso simulado en desktop; sin `aria-current` en mobile o con reduced motion | CA-08 |
| `home/companies-marquee/*.spec.ts` | Cada compañía expuesta una vez; copia `aria-hidden` + `inert`; el botón alterna `aria-pressed`, nombre y `.is-paused`; con reduced motion no hay copia visible ni botón | CA-09, CA-10, CA-11 |
| `home/team-band/*.spec.ts` (extendido) | `data-reveal="clip"` y target de parallax solo en desktop | CA-12b |
| `home/home.component.spec.ts` (ajustado) | Compone las secciones nuevas; barra presente; destruir la home libera el servicio | CA-03, CA-23 |
| `route-view-transition.spec.ts` | Público → público agrega y quita `vt-public`; público → `/acceder` (intro pendiente) saltea sin `vt-public`; público → `/login` y autenticada → autenticada sin `vt-public` | CA-17, CA-18, CA-19 |
| `intro-view-transition.spec.ts` | Sin cambios: debe seguir en verde | CA-18 |
| `anchor-smooth-scroll.spec.ts` | Activa `smooth-anchors` solo con mismo path + fragment en ruta pública y sin reduced motion; la quita al terminar; no se activa al cambiar de página | CA-02 |
| Tests existentes de contenido, header, footer, intro y login | Sin cambios de expectativa | CA-16, CA-18, CA-19, CA-20 |

**Verificación manual en `verify`:** CA-12, CA-15, CA-17, CA-25 y CA-26. Se hace con DevTools,
emulando reduced motion, puntero táctil y anchos de 375, 1023 y 1280 px. Los presupuestos se
verifican con `ng build` (CA-22).

## Documentación

- `docs/home-animaciones.md`.
- `docs/architecture.md`: la sección de frontend suma el módulo `app/motion/`, el alcance del
  servicio de scroll por componente y el hook de transición de rutas.
- `CHANGELOG.md`: el cambio es visible desde afuera.

## Slices

Los confirma `tasks`. Orden sugerido:

1. **`chrome`:** tokens, `styles.scss`, `app/motion/` (preferencias, servicio, directivas,
   split-text), `RevealDirective`, `.hover-lift`, header y footer, `route-view-transition`,
   `anchor-smooth-scroll`, `app.config.ts` y `data.publicSite` en `app.routes.ts`.
2. **`home`:** barra, hero, recorrido, marquee, banda de equipo y recomposición de
   `home.component.*`.
3. **`cierre`:** config SDD.

## Riesgos

- **Tamaño del diff:** supera holgadamente el umbral de 300 líneas, por la extracción de secciones
  y los specs nuevos. `tasks` debería pronosticar riesgo alto, con la estrategia `ask-on-risk`.
- **Altura extra del recorrido sticky (unos 250 vh):** alarga la home en desktop. Si en la
  revisión manual se siente lento, se ajusta la altura sin cambiar el diseño.
- **Momento de la clase `vt-public` (D13):** si un navegador capturara el estado viejo antes del
  callback, la transición degradaría al cross-fade por defecto. No rompe nada y lo detecta la
  prueba manual.
