# explore — home-animaciones

Pedido: mejorar la página principal de KUVU en animación, fluidez y movimiento, tomando como
**inspiración** (no copia: sin branding, textos ni assets) tres sitios: zookay.co,
salomondevsystems.com y ark-up.com.

## Contexto SDD

- `sdd/sdd-init.md` existe. La modalidad de tests es **`test-after`** (`sdd.config.md`). Slices
  declarados: `backend-orden`, `contenido`, `chrome`, `paginas`, `home`, `intro`, `cierre`. Este
  cambio cae en `chrome` (header, footer, `app.config.ts`, `styles.scss`), `home` y `cierre`. Sin
  extensiones activas. Artifacts en archivos. Umbral de riesgo: 300 líneas.
- Rama: `feat/home-animaciones`, creada desde `feat/acceso-orden-e-intro` (`3e48726`). Esa rama ya
  integra `feat/home-profesional` (PR #1) con la intro "hoja que pasa" y es la PR #2, apilada sobre
  la #1. Sale de ahí y no de `main` por dos motivos:
  - `main` no tiene la home rediseñada: el merge de la PR #1 queda pendiente de permiso.
  - El alcance incluye transiciones entre rutas, y el `app.config.ts` de esta base ya configura
    `withViewTransitions({ onViewTransitionCreated: skipViewTransitionIntoIntro })`. Trabajar sobre
    otro `app.config.ts` garantizaría un conflicto.
  - Consecuencia: es la tercera rama de la pila (#1 → #2 → home-animaciones).

## Decisiones de clarify (Gate A)

| # | Pregunta | Decisión |
|---|---|---|
| 1 | Cambio pausado `acceso-orden-e-intro` | (a) Cerrado: verify en verde, archivado, commit `099ab88`, integrado con la PR #1 (`3e48726`) y PR #2 abierta |
| 2 | Base de la rama | (c) Integrar primero la PR #1. En la práctica, la rama sale de la PR #2, que ya la contiene |
| 3 | Dependencias | (a) Sin librerías: CSS, `IntersectionObserver`, `requestAnimationFrame` y APIs nativas |
| 4 | Alcance | (b) Home, más header y footer compartidos, más transiciones entre rutas del sitio público |
| 5 | Intensidad | (b) Expresiva: banda en movimiento, texto por palabra, botones que siguen al puntero, hero con más protagonismo. Todo respeta `prefers-reduced-motion` |
| 6 | Contenido y layout | (b) Se pueden reestructurar secciones (por ejemplo, "¿Cómo funciona?" como recorrido fijo o "Compañías" como banda en movimiento) sin cambiar los textos |
| 7 | Scroll suave | (a) Nativo (`scroll-behavior: smooth` para anclas), sin suavizado por JS |

## Qué existe hoy (home de la PR #1, integrada en la base)

- Ruta `/` → `HomeComponent` (eager, en el bundle inicial). Las demás páginas públicas
  (`/servicios`, `/nosotros`, `/preguntas-frecuentes`, `/contacto`, `/legal` y la 404) son lazy y
  usan `app-public-page`. `/acceder` y `/login` también son lazy.
- Estructura de la home, con etiquetas numeradas `01`–`07` (`.section-eyebrow`):
  - `app-site-header`;
  - hero: marca, h1, subtítulo, CTA "Ingresar" y "Conoce los servicios →";
  - 01 ¿Qué es KUVU?;
  - 02 ¿Cómo funciona? (4 pasos con `data-reveal`);
  - 03 Servicios (filas con `app-service-icon` y "Ver servicios →");
  - 04 Seguridad y soporte;
  - 05 Compañías que confían (lista de nombres);
  - banda de equipo `app-team-band`;
  - 06 Origen;
  - 07 FAQ corto;
  - CTA final ("Ingresar" y "¿Todavía no usas KUVU? Contáctanos →");
  - `app-site-footer`.
- Textos en `src/app/content/*`, en tuteo colombiano, con tests de contenido que lo verifican.
- Movimiento que ya existe:
  - **Hero:** `rise-in` CSS de 0,6 s escalonado, con reduced motion.
  - **Reveal global:** `RevealDirective` (`IntersectionObserver`, threshold 0,15, una vez) y estilos
    `[data-reveal]` en `src/styles.scss`: fade y `translateY(12px)` de 0,5 s con 60 ms de stagger.
  - **Header:** sticky; se compacta pasados 24 px de scroll (`isCompact`, listener de scroll pasivo)
    con fondo translúcido y `backdrop-filter`. Subrayado animado del ítem activo y menú móvil a
    pantalla completa con entradas escalonadas.
  - **Utilidades globales:** `.link-arrow` (la flecha se desplaza 4 px en hover/focus) y
    `.hover-lift` (las tarjetas suben 2 px con sombra; se usa en `/servicios`, no en la home).
  - **Footer:** el CTA sube 2 px en hover.
  - **Transiciones entre rutas:** `withViewTransitions()` con el cross-fade por defecto (salteado al
    entrar a la intro); con reduced motion, `::view-transition-*` va sin animación.
  - `html { scroll-padding-top: 88px }` y `withInMemoryScrolling` con offset bajo el header. No hay
    `scroll-behavior: smooth`.
- No hay: barra de progreso, parallax, efectos ligados al scroll, marquee, texto por palabra,
  botones que sigan al puntero, recorrido de pasos ni transiciones de ruta personalizadas
  (`view-transition-name`).

### Presupuestos (remedidos sobre la base integrada)

- **Bundle inicial:** 424,49 kB / 112,09 kB transfer, contra un warning de 500 kB: hay ~75 kB de
  margen. La home es eager, así que todo lo que sume la home cuenta.
- **Estilos por componente (`anyComponentStyle`: warning 17 kB, error 20 kB):** los estilos
  compilados de `home.component.scss` miden ~16,8 kB, a ~0,2 kB del warning. **Restricción
  fuerte:** el movimiento nuevo no entra en `home.component.scss`. Tiene que ir en estilos globales
  (`styles.scss`), en directivas o en componentes nuevos, como se hizo con `team-band`.
- Estilos globales: `styles-*.css` mide 26,3 kB y no tiene presupuesto propio.

### Archivos relevantes

| Archivo | Rol |
|---|---|
| `frontend/proyecto_angular/src/app/components/home/home.component.{html,scss,ts,spec.ts}` | Home: estructura, hero y tests |
| `frontend/proyecto_angular/src/app/components/home/team-band/*` | Banda de equipo (candidata a parallax o apertura) |
| `frontend/proyecto_angular/src/app/directives/reveal.directive.{ts,spec.ts}` | Reveal por IntersectionObserver |
| `frontend/proyecto_angular/src/styles.scss` | `[data-reveal]`, `.link-arrow`, `.hover-lift`, view transitions con reduced motion, `scroll-padding-top` |
| `frontend/proyecto_angular/src/app/components/public/site-header/*` | Header sticky compacto y menú móvil |
| `frontend/proyecto_angular/src/app/components/public/site-footer/*` | Footer |
| `frontend/proyecto_angular/src/app/components/public/public-page/*` | Layout común de las páginas internas (transiciones entre rutas) |
| `frontend/proyecto_angular/src/app/app.config.ts` | `withViewTransitions` con el hook de la intro, `withInMemoryScrolling` |
| `frontend/proyecto_angular/src/app/intro-view-transition.ts` | Saltea el cross-fade al entrar a la intro: la transición personalizada no debe pisarlo |
| `frontend/proyecto_angular/src/app/content/*` | Textos (no se cambian) |
| `frontend/proyecto_angular/angular.json` | Presupuestos |

## Referencias analizadas

Método: descarga del HTML y de los bundles JS/CSS servidos (`/_astro/*`) y lectura del código
de animación; WebFetch para la estructura de secciones. Los tres sitios están hechos con
**Astro**.

**Limitación:** no se ejecutó JavaScript ni se observó el movimiento en un navegador. Los
patrones salen del código fuente minificado (selectores, parámetros de GSAP, keyframes); las
duraciones y easings citados son los del código, la sensación visual no está verificada.

### zookay.co — vanilla JS + CSS, sin librerías

- Un único handler de scroll throttled con `requestAnimationFrame` que publica variables CSS:
  `--page-progress` (0–1 de la página), `--hero-progress` (salida del hero), `--photo-shift`
  (parallax suave de fotos, ±12 px) y `--story-progress`.
- `html.is-scrolled` a partir de 20 px de scroll (header cambia de estado).
- "Lectura" por palabra: las palabras de un párrafo pasan a `.is-read` según el avance del
  scroll.
- Storytelling por capítulos: pasos con línea de progreso; el paso activo cambia fotos y
  captions (`aria-current`, `aria-hidden` actualizados).
- Clip-path con esquinas redondeadas que se abre (`inset(8% 0 round 35px)` → `inset(0 round
  35px)`), keyframes `title-enter`, `scroll-cue` (indicador de scroll) y flotación suave de
  fotos.
- View Transitions API (`view-transition-name`, `::view-transition-old/new`).
- `scroll-behavior: smooth` nativo. Easing `cubic-bezier(.2,.7,.2,1)`. Respeta
  `prefers-reduced-motion` en todo.

### salomondevsystems.com — GSAP + ScrollTrigger

- Barra de progreso de lectura fija arriba (`scrub: .15`).
- Reveal genérico `[data-reveal]`: `y: 35 → 0`, opacidad, 0,75 s, `power2.out`, una vez al
  94 % del viewport.
- Texto que se "enciende" por palabra (opacidad 0,2 → 1, stagger, scrub).
- Hero art con parallax y leve zoom al salir (`y: 100, scale: 1.08`, scrub).
- Proceso en 4 pasos con ilustración sticky que cambia por paso (solo ≥ 961 px), entrada
  `autoAlpha + y + scale + rotation` con `power3.out`.
- Ribbons/marquee infinitos en sentidos alternos (35 s por vuelta).
- Ilustraciones con flotación (`yoyo`, `sine.inOut`) y estrellas girando lento.
- Botones magnéticos (siguen el puntero al 12 %, `quickTo` 0,4 s) solo con
  `(hover: hover) and (pointer: fine)`; cursor custom en cards de proyectos.
- Header `.is-scrolled` a 50 px. Hero tipo terminal con texto tipeado. `gsap.context` /
  `matchMedia` para revertir y respetar reduced motion.

### ark-up.com — GSAP + ScrollTrigger (más inmersivo)

- Barra de progreso de lectura (`scaleX` con scrub).
- Hero "rueda de universos": carrusel circular rotado por grados con radio calculado del
  viewport, clip-path poligonal y color de cielo por universo.
- Menú a pantalla completa en `<dialog>`: hoja que baja (`yPercent -105 → 0`, `power4.out`),
  escenas con escala y links con stagger; preview que cambia al hover/focus.
- Secciones con pasos numerados, líneas que se llenan (`data-fill-line`), cards tipo libro.
- Marquee y animación `bob` en CSS. Respeta reduced motion.

### Patrones comunes a los tres

1. Respeto estricto de `prefers-reduced-motion` y gating de efectos de puntero por
   `hover: hover`.
2. Header que reacciona al scroll.
3. Indicador de progreso de scroll.
4. Reveals al entrar al viewport con más recorrido (25–35 px) y easing tipo `power2/3.out`.
5. Efectos ligados al scroll (scrub): parallax de imagen, texto por palabra, progreso de pasos.
6. Narrativa de pasos con elemento sticky/activo.
7. Movimiento ambiental lento (marquee, flotación) como textura.
8. Ninguno usa smooth-scroll con JS tipo Lenis: zookay usa `scroll-behavior: smooth` nativo y
   salomondev no secuestra la rueda.


## Qué aplicaría a KUVU (candidatos, a decidir en `propose`)

- **Barra de progreso de scroll** fina, con el color de marca. El header compacto ya existe.
- **Hero con más protagonismo:** el título entra por palabras con máscara, hay un indicador de
  scroll animado y la salida tiene parallax o escala leve ligada al scroll.
- **Reveals más expresivos:** más recorrido y mejor easing, con variantes (fade-up, clip-path que se
  abre en imágenes), reutilizando `RevealDirective`.
- **"¿Cómo funciona?" como recorrido:** una línea de progreso que se llena y el paso activo
  resaltado al hacer scroll; fijo en desktop y lista simple en mobile.
- **"¿Qué es KUVU?":** el texto se enciende palabra por palabra con el scroll.
- **Banda de equipo:** parallax suave de la foto y apertura con clip-path redondeado.
- **"Compañías que confían":** banda infinita lenta que se pausa con hover o foco y queda estática
  con reduced motion.
- **Microinteracciones:** CTA que sigue al puntero (solo con puntero fino) y `.hover-lift` en filas
  y tarjetas de la home.
- **Transiciones entre rutas:** personalizar el cross-fade (por ejemplo, el contenido se desliza
  con el header fijo, vía `view-transition-name`), sin pisar el salteo de la intro.
- **Scroll nativo** para las anclas: `scroll-behavior: smooth`, que pasa a `auto` con reduced
  motion.
- **Implementación:** el patrón de zookay (un handler rAF que publica variables CSS, más
  `IntersectionObserver`), sin dependencias. Los estilos nuevos van fuera de `home.component.scss`
  por el presupuesto.

## Ambigüedades restantes

Ninguna estructural. Las decisiones de detalle (qué candidatos entran y en qué orden de slices) se
toman en `propose`.
