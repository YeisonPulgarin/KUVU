# Explore — sitio-publico-expresivo

Pedido de origen (4 frentes): (1) sitio público más expresivo y dinámico, con la web de
Salomon Dev Systems como referencia de recursos de diseño, sin cambiar los colores de KUVU;
(2) fotos nuevas del equipo; (3) botón para volver a la home desde `/acceder`; (4) botones con
semántica visual y más animación en la app interna (admin y arrendatario).

Este artifact cubre el reconocimiento de los cuatro frentes y recomienda partirlos en cambios
SDD separados. `sitio-publico-expresivo` es el primero (frentes 1 y 2).

## 1. Referencia: salomondevsystems.com

Sitio Astro con 5 páginas: `/`, `/estudio/`, `/servicios/`, `/proyectos/` (+ fichas
`/proyectos/{slug}/`), `/contacto/`. Capturas en el scratchpad de la sesión
(`ref/shots/`, 1440 y 390 px). Se usa como catálogo de recursos, no como plantilla: no se
copian textos, marca, ilustraciones ni la composición literal.

### Tipografía
- **Tres familias con roles fijos:** display de palo grueso (Archivo Black) en MAYÚSCULAS con
  tracking negativo (`letter-spacing: -.045em/-.055em`, `line-height: .98–1.04`); grotesca
  geométrica (Space Grotesk) para cuerpo y UI; una tercera sans (Source Sans 3) de respaldo.
- **Escala fluida agresiva:** titulares con `clamp()` de 52→148 px (`clamp(72px, 9vw, 148px)`,
  `clamp(52px, 7.8vw, 116px)`); en móvil el display pasa a `10–10.5vw`. Cuerpo de 18–23 px y
  leads de 22–32 px (`clamp(22px, 2.2vw, 31px)`). Ningún texto de lectura baja de 18 px.
- **Énfasis por color dentro del titular:** una palabra o línea en el color de acento (`<em>`
  coloreado), o una palabra dentro de una "cinta" rectangular de fondo de color levemente
  rotada (`rotate(-2…-4deg)`) con sombra dura desplazada.
- **Word reveal por scroll:** titulares de sección cuyas palabras pasan de gris claro a tinta
  a medida que se scrollea ("lectura progresiva").

### Fondo y textura
- Fondo papel cálido (`#f4f1e8`) en lugar de blanco; secciones alternan papel / papel más
  oscuro / tinta (oscura) / bloque saturado de acento a sangre completa.
- **Grano de ruido** sobre hero y cintas: SVG inline `feTurbulence` (`baseFrequency .8`,
  `numOctaves 3`) como `background-image`, `opacity: .045`, tile de 180 px. Costo cero en red.
- **Trama de puntos** dentro de marcos (`radial-gradient(color 0.9px, transparent 0.9px)`,
  tile 13 px).
- Separadores entre secciones inclinados (borde diagonal del hero hacia la sección siguiente).

### Formas y superficies
- Estilo "neo-brutalista suave": bordes de 2 px en tinta, radios de 12 px y **sombras duras sin
  blur** (`box-shadow: 5px 5px 0 var(--ink)`, variantes 2–10 px, a veces en color de acento).
- Botones rectangulares con sombra dura y flecha `↗`; hover desplaza el botón hacia la sombra.
- "Stickers": etiquetas rotadas en mayúsculas display sobre tarjetas e imágenes, chispas/
  asteriscos dibujados como acento.
- Retratos tipo polaroid rotados (marco blanco, pie de foto en mayúsculas, sombra de color).

### Movimiento (GSAP + ScrollTrigger, todo con `prefers-reduced-motion`)
- Intro tipo terminal (loader) y **page-wipe** entre páginas.
- **Barra de progreso de lectura** fija bajo el header.
- **Cintas marquee rotadas** (dos colores) con texto display repetido y separador de asterisco.
- **Scroll narrativo sticky:** columna de arte fija (`position: sticky`) que cambia de panel
  según el paso visible; pasos de `min-height: 83svh`.
- Botones magnéticos, cursor personalizado sobre tarjetas de proyecto, header que pasa de
  oscuro a claro según la sección, indicador de punto en el ítem de nav activo.
- Variantes por media query: `(hover: hover)`, `(min-width: 761px)`, reduced motion.

### Layout
- Grillas asimétricas de 2 columnas (`minmax(0,1fr) minmax(0,1fr)`, gap 45–105 px), titular a
  la izquierda y lead a la derecha alineado abajo; contenedor ancho (~1360 px útiles).
- Listas en acordeón con regla superior de 1–2 px y flecha.
- Formulario de contacto en pasos con barra de progreso y opciones como botones grandes.
- CTA final a sangre completa en el color de acento con titular gigante.

## 2. KUVU hoy — sitio público

- **Tipografía:** una sola familia (Geist, Google Fonts, `styles.css`). `body` en 14 px
  (`styles.css`), cuerpo de la home en 16–18 px, h1 del hero `clamp(3rem, 5.5vw, 4.5rem)`,
  títulos de sección `clamp(1.875rem, 3.5vw, 2.75rem)`. Contenedor `max-width: 72rem`
  (`components/home/_section-heading.scss`), leads a `42rem`.
- **Color:** tokens de marca en `@theme static` de `src/styles.css` (`--color-brand-100…700`,
  verde KUVU como acento único; `--color-home-bg #f6f7f4` y superficies blancas; overrides en
  `.dark`). Radios: pill / 16 / 12. Estos tokens se mantienen; lo que cambia es su uso
  (bloques saturados, proporciones, textura), no los valores.
- **Fondo:** plano (`--color-home-bg` / blanco alterno); sin textura ni grano.
- **Movimiento existente** (`src/app/motion/`, `src/styles/_motion.scss`, `directives/reveal`):
  reveals fade-up/clip, `ScrollMotionService` (rAF único), `[appScrollProgress]`,
  `<app-split-text>` (texto por palabra, ya sirve para un word-reveal), `[appMagnetic]`,
  `steps-journey` sticky, `companies-marquee`, `scroll-progress`, transición entre rutas
  públicas. Sin GSAP: todo nativo, respetando reduced motion. La base para replicar los
  recursos de la referencia ya existe.
- **Diagnóstico visual** (captura 1280 px light): mucho espacio vacío con texto chico;
  secciones casi idénticas (título verde + párrafo gris); el ritmo vertical es largo y plano.
- **Archivos:** `components/home/*` (hero, steps-journey, companies-marquee, team-band,
  scroll-progress), `components/public/*` (header, footer, public-page, breadcrumb,
  responsive-image, rich-text, service-icon), `components/pages/*` (servicios, nosotros,
  preguntas-frecuentes, contacto, legal, not-found), `content/*.ts`, `styles.css`,
  `styles.scss`, `styles/_motion.scss`.
- **Presupuesto:** `angular.json` initial `maximumWarning 500kb` / `maximumError 2mb`; las
  reglas de `sdd-init.md` piden evitar `@apply` en componentes del bundle inicial. Una
  tipografía display extra suma una petición de fuente (Google Fonts, `display=swap`).

## 3. Fotos del equipo

- `C:\Users\wilso\Downloads\Equipo Kuvu\`: `Ima1.jpeg` 1200×1600, `Ima2.jpeg` 960×1280,
  `Ima3.jpeg` 960×1280; las tres verticales 3:4, JPEG RGB, **sin EXIF** (sin GPS).
- Contenido: los tres integrantes, informales, frente a un edificio de ladrillo y vidrio.
  `Ima1` es plano medio (rostros grandes); `Ima2` e `Ima3` son planos abiertos con el
  edificio.
- Hoy existe una sola foto: `public/Imagenes_web/equipo-ycw-{640,1024,1536}.{webp,jpeg}`
  (1536×1024, de traje frente al logo YCW), declarada en `content/team.ts` como `SiteImage` y
  usada por `home/team-band` (banda full-bleed) y `/nosotros` (`<figure>`). Las variantes se
  generan con `frontend/proyecto_angular/scripts/generate-image-variants.py` (Pillow, fuera
  del build). El tipo `TeamSection` admite una sola `image`.
- El alt de la foto YCW nombra a los integrantes de izquierda a derecha; para las nuevas no
  hay forma de inferir el orden desde el repo.

## 4. Acceso — `/acceder`

- `components/landing/landing.component.html`: marca (logo + tagline), card con buscador y
  lista de empresas, intro `app-auth-intro` encima. **No hay ningún enlace a `/`**; el logo es
  un `<img>` sin enlace. `/login` sí tiene `.back-btn` ("volver") que lleva a `/acceder`.
- Slice declarado: `intro` (con tests Karma; `landing.component.spec.ts` existe).
- Cambio chico y aislado (un enlace + estilo + test), independiente del rediseño público.

## 5. App interna (admin / arrendatario)

- Rutas lazy con `authGuard`/`adminGuard`: `dashboard`, `contratos`, `pagos`,
  `mantenimiento`, `locales`, `usuarios`; chrome `shared/navbar` y `shared/sidebar`.
- Estilos comunes en `components/shared/shared.styles.scss` (501 líneas): `.btn-primary`
  (gradiente `--color-primario`→`--color-secundario`), `.btn-secondary`, `.btn-sm` con
  `.btn-edit/.btn-green/.btn-blue/.btn-gray/.btn-red`, `.badge--*`, `.modal`, `.tabla`.
  Colores hex sueltos estilo Tailwind v1 (`#ebf8ff`, `#c53030`…), sin tokens semánticos.
- Iconos con emoji (`✏️`, `🗑️`, `▶`, `✔`, `✕`). Eliminar en `usuarios` es un `.btn-icon
  --danger` con solo `title`; `btn-red` existe pero no se usa en ninguna plantilla.
- Confirmaciones con `window.confirm()` / `alert()` nativos (`locales.component.ts`,
  `usuarios.component.ts`).
- `locales.component.ts` tiene `eliminar()` pero **ninguna plantilla lo invoca**; contratos y
  pagos no tienen acción de eliminar en la UI, aunque `KUVU-Requerimientos.docx` pide
  eliminar locales, contratos, pagos y usuarios.
- Requerimiento de marca por empresa: tras el login se aplican los colores de la inmobiliaria
  (`--color-primario`, `--color-secundario`, `--color-texto`). Por eso la app interna no usa el
  verde KUVU como primario; los colores semánticos (peligro, éxito, aviso) son independientes
  de esos tokens.
- **No hay slice declarado** en `sdd.config.md` para la app interna (los slices cubren
  backend, sitio público e `intro`). Solo `navbar` tiene spec; los módulos no tienen tests.
- RNF de `KUVU-Requerimientos.docx`: un solo CTA principal por pantalla; animaciones
  desactivadas con `prefers-reduced-motion`.

## Partición recomendada

| Orden | Change-name | Frentes | Slices | Tamaño estimado |
|---|---|---|---|---|
| 1 | `sitio-publico-expresivo` | 1 + 2 (sistema tipográfico, textura, secciones dinámicas, fotos del equipo) | `contenido`, `chrome`, `paginas`, `home`, `cierre` | Alto (> 300 líneas; probablemente 2 PRs) |
| 2 | `acceso-volver-inicio` | 3 | `intro`, `cierre` | Muy bajo |
| 3 | `app-interna-ux` | 4 | slice nuevo (p. ej. `app`) a declarar en `sdd.config.md`, `cierre` | Medio-alto |

Razones: los tres frentes tocan clústeres distintos (público / acceso / autenticado), con
sistemas de color distintos (verde KUVU vs colores por empresa) y slices distintos; mezclarlos
haría un PR inrevisable. Las fotos van con el rediseño porque la banda del equipo se rediseña
con él. `acceso-volver-inicio` puede adelantarse si se quiere una victoria rápida: no depende
de los otros dos (si el rediseño cambia el estilo de enlaces, el botón hereda tokens, no
estilos del sitio público).

## Ambigüedades para el Gate A

1. **Tipografía display:** ¿se agrega una segunda familia (display pesada en mayúsculas para
   titulares) junto a Geist, o se logra el contraste solo con Geist en pesos 800/900 y tamaños
   grandes? Si se agrega, ¿alguna preferencia, o se elige una distinta a la de la referencia
   para no copiarla?
2. **Alcance del rediseño:** ¿home + las 6 páginas públicas (incluidas legal y 404), o home y
   las páginas de marketing (servicios, nosotros, FAQ, contacto) dejando legal/404 solo con el
   nuevo sistema tipográfico?
3. **Uso de los colores sin cambiarlos:** ¿vale usar el verde de marca existente como bloque
   saturado a sangre completa (cintas, CTA final, palabra destacada) y el papel cálido como
   fondo con grano, siempre con los tokens actuales? ¿Y el modo oscuro debe recibir el mismo
   tratamiento (textura incluida)?
4. **Fotos del equipo:** ¿las 3 fotos nuevas reemplazan a la foto YCW de traje o conviven con
   ella (p. ej. YCW en la home, las nuevas en `/nosotros` como galería)? ¿Cuál es el orden de
   izquierda a derecha de los integrantes en las fotos nuevas (para el `alt`)?
5. **Partición:** ¿se aprueba partir en 3 cambios con el orden propuesto, o se prefiere
   adelantar `acceso-volver-inicio` como primero?
6. **App interna (para el cambio 3, se puede posponer):** ¿se agregan colores semánticos
   nuevos (rojo peligro, verde éxito, ámbar aviso) aunque no sean de la marca? ¿Se incluyen los
   botones de eliminar que faltan (locales, contratos, pagos) o solo se mejora lo que ya existe?
   ¿Se reemplazan `confirm()`/`alert()` por un diálogo propio?

## Rama recomendada

Nueva rama `feat/sitio-publico-expresivo` desde `fix/tema-claro-tokens` (PR #5): los tokens en
`:root` vía `@theme static` que este cambio consume existen solo ahí. La pila #1→#5 sigue sin
mergear, así que el PR nuevo se apila sobre #5. `acceso-volver-inicio` y `app-interna-ux`
pueden salir de la misma base en ramas propias.

## Decisiones de clarify (Gate A)

1. **Tipografía:** se agrega una familia display pesada solo para titulares, distinta de
   Archivo Black (la elige `design`); Geist sigue para cuerpo e interfaz. La carga de la fuente
   respeta el presupuesto: no empeora el warning `css-inline-fonts` ni el initial de ~500 kB.
2. **Alcance:** rediseño completo en home, `/servicios`, `/nosotros`,
   `/preguntas-frecuentes` y `/contacto`. `/legal` y la 404 solo heredan tipografía, escala y
   fondo.
3. **Colores:** sin colores nuevos. El verde actual se usa en bloques a sangre completa,
   cintas y CTA; fondo papel con grano y trama con los tokens existentes. El modo oscuro recibe
   el mismo tratamiento, textura incluida.
4. **Fotos:** las 3 nuevas reemplazan a la foto YCW de traje en `team-band` (home) y
   `/nosotros`. `alt` descriptivo sin nombres (el orden de los integrantes no está definido).
5. **Partición:** 1) `sitio-publico-expresivo`, 2) `acceso-volver-inicio`,
   3) `app-interna-ux`. Los dos últimos son no-objetivos de este cambio.
6. **Rama:** `feat/sitio-publico-expresivo` desde `fix/tema-claro-tokens`, PR apilado sobre #5.
