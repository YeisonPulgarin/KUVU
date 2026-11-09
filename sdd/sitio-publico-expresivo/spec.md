# Spec — sitio-publico-expresivo

Fuentes: `propose.md`, decisiones de Gate A en `explore.md`. "Páginas rediseñadas" = home,
`/servicios`, `/nosotros`, `/preguntas-frecuentes`, `/contacto`. "Páginas que heredan" =
`/legal` y la 404. "Sitio público" = ambas. Viewports de referencia: 375, 768, 1280 y 1440 px;
temas claro y oscuro.

## Requisitos funcionales

### R1 — Tipografía display para titulares
- **R1.1** Los titulares de nivel 1 y 2 del sitio público (hero, títulos de página, títulos
  de sección, CTA final) usan una familia display pesada. Esa familia no es Archivo Black ni
  ninguna de las tipografías de salomondevsystems.com (Archivo, Space Grotesk, Source Sans 3).
- **R1.2** El cuerpo, los leads, la navegación, los formularios y los botones siguen en Geist.
- **R1.3** Mientras la fuente display no cargó, el texto es visible con una fuente de respaldo
  (sin texto invisible) y el layout no salta de forma notoria al llegar la fuente.
- **R1.4** La familia display soporta los caracteres del español (tildes, ñ, ¿, ¡).

### R2 — Escala tipográfica fluida
- **R2.1** El titular del hero de la home mide al menos 64 px a 1280 px de ancho y al menos
  40 px a 375 px, sin desbordar horizontalmente en ningún viewport de referencia.
- **R2.2** Los títulos de página y de sección miden al menos 44 px a 1280 px y al menos 32 px
  a 375 px.
- **R2.3** El texto de lectura (párrafos, respuestas de FAQ, descripciones) mide al menos
  17 px a 1280 px y al menos 16 px a 375 px; los leads, al menos 20 px a 1280 px.
- **R2.4** Los tamaños escalan de forma continua entre viewports (no solo por saltos de
  breakpoint).
- **R2.5** Ningún texto del sitio público queda cortado ni produce scroll horizontal a 375 px,
  incluidas palabras largas ("administración", "inmobiliarias") en los titulares display.

### R3 — Fondo con textura
- **R3.1** El fondo del sitio público muestra un grano visible pero sutil sobre el color de
  fondo de marca, en claro y en oscuro.
- **R3.2** Al menos una superficie por página rediseñada usa una trama de puntos o un bloque
  de color sólido como contraste con el fondo granulado.
- **R3.3** La textura no reduce el contraste del texto por debajo de lo exigido en R10.1 y no
  intercepta clics ni selección de texto.
- **R3.4** La textura no agrega descargas de imagen nuevas.

### R4 — Uso del color de marca
- **R4.1** El sitio público no introduce valores de color nuevos: todo color proviene de los
  tokens de marca existentes (o de blanco/negro con transparencia para el grano).
- **R4.2** La home tiene al menos un bloque a sangre completa en el verde de marca (por
  ejemplo, la cinta o el CTA final), y cada página rediseñada termina en un CTA con fondo de
  marca.
- **R4.3** Los titulares de las páginas rediseñadas pueden resaltar una palabra o frase con el
  color de marca o dentro de una "cinta" de fondo de marca; el texto completo del titular se
  lee igual para lectores de pantalla (sin palabras duplicadas ni cortadas).

### R5 — Chrome compartido
- **R5.1** Header, footer y layout de páginas internas aplican la nueva tipografía, escala y
  fondo; `/legal` y la 404 los heredan sin cambios de composición propios.
- **R5.2** Los botones del sitio público tienen un estilo propio reconocible (no el pill
  genérico de plantilla), con estado hover, focus visible y active distinguibles.
- **R5.4** Los botones "Ingresar" (header, menú, hero y CTA final) conservan su color azul
  actual (`.btn-primary`, tokens `--color-primario`/`--color-secundario`); el estilo de
  R5.2 aplica a los demás botones y CTAs del sitio público.
- **R5.3** Se conservan los comportamientos del header: sticky, compactado al hacer scroll,
  menú a pantalla completa por debajo de 1024 px (bloquea scroll, cierra con Escape, botón,
  enlace o navegación), selector de tema y enlace "Ingresar".

### R6 — Home rediseñada
- **R6.1** La home conserva sus secciones y su orden (hero, qué es, cómo funciona, servicios,
  seguridad, compañías, equipo, origen, FAQ, CTA final) y sus anclas (`#que-es`,
  `#como-funciona`, `#servicios`, `#seguridad`, `#companias`, `#equipo`, `#origen`, `#faq`).
- **R6.2** Las secciones no comparten todas el mismo patrón visual: alternan al menos tres
  tratamientos distintos (por ejemplo fondo granulado, bloque de marca, superficie con trama)
  y al menos dos composiciones (columna única centrada vs grilla asimétrica).
- **R6.3** La home incluye al menos una cinta tipo marquee con texto display (puede ser la
  banda de compañías existente rediseñada); toda cinta en movimiento se puede pausar y se
  detiene con reduced motion.
- **R6.4** Al menos un titular de sección de la home se revela palabra por palabra al hacer
  scroll (de tono atenuado a tono pleno).
- **R6.5** Los textos visibles de la home salen de `content/*.ts`; se permite partir un
  titular en fragmentos para resaltar una parte, sin cambiar sus palabras.

### R7 — Páginas de marketing rediseñadas
- **R7.1** `/servicios`, `/nosotros`, `/preguntas-frecuentes` y `/contacto` tienen un hero
  con titular display según R2.2, breadcrumb y lead.
- **R7.2** `/servicios`: los servicios y los beneficios por rol se presentan con composición
  y jerarquía nuevas; cada servicio conserva su ícono, título y descripción.
- **R7.3** `/preguntas-frecuentes`: las preguntas se agrupan como hoy; cada respuesta sigue
  accesible por teclado y lector de pantalla.
- **R7.4** `/contacto`: el formulario conserva sus campos, validaciones, consentimiento y su
  envío a WhatsApp en pestaña nueva; los canales directos y los pasos siguen visibles.
- **R7.5** `/nosotros`: muestra las 3 fotos del equipo según R8.

### R8 — Fotos del equipo
- **R8.1** Las 3 fotos de `Downloads/Equipo Kuvu` reemplazan a la foto YCW de traje en la
  banda del equipo de la home y en `/nosotros`; la foto YCW no aparece en ningún lugar del
  sitio y sus archivos se eliminan del repo.
- **R8.2** Cada foto se sirve en variantes responsive (WebP con respaldo JPEG, varios anchos),
  con dimensiones declaradas (sin salto de layout) y carga diferida fuera del primer pantallazo.
- **R8.3** Cada foto tiene un `alt` descriptivo en español que no nombra a los integrantes
  (describe a los tres estudiantes y el entorno).
- **R8.4** La home destaca una foto en la banda del equipo; `/nosotros` muestra las tres.
- **R8.5** Los nombres de los integrantes siguen visibles como texto donde hoy aparecen.

### R9 — Movimiento
- **R9.1** Los recursos de movimiento nuevos (word-reveal, cintas, hover con desplazamiento,
  entradas) funcionan sin dependencias de animación de terceros.
- **R9.2** Con `prefers-reduced-motion: reduce`, ningún elemento se desplaza, rota en el
  tiempo ni se revela por scroll: todo el contenido aparece en su estado final.
- **R9.3** Los efectos dependientes de puntero (magnético, hover con desplazamiento) solo se
  activan con puntero fino.
- **R9.4** Sin JavaScript de movimiento disponible (o antes de que corra), el contenido es
  visible y legible.

### R10 — Accesibilidad
- **R10.1** Todo texto cumple contraste WCAG AA (4.5:1 normal, 3:1 para texto ≥ 24 px o ≥
  18,66 px bold) sobre su fondo real, en claro y oscuro, incluidos titulares sobre bloques de
  marca y texto sobre la textura.
- **R10.2** Cada página tiene un único `h1` y la jerarquía de encabezados no salta niveles.
- **R10.3** El foco de teclado es visible en todos los elementos interactivos, también sobre
  bloques de marca.
- **R10.4** Los elementos decorativos (grano, trama, cintas duplicadas, asteriscos) quedan
  ocultos para lectores de pantalla.

### R11 — Rendimiento y presupuesto
- **R11.1** `ng build` de producción no supera el `maximumWarning` de 500 kB del bundle
  inicial definido hoy en `angular.json`.
- **R11.2** El warning `css-inline-fonts` no crece respecto del estado actual (19,14 kB); la
  fuente display no se incrusta en el CSS de ningún componente.
- **R11.3** Ningún estilo de componente supera el presupuesto `anyComponentStyle` (error en
  20 kB).

### R12 — Sin regresiones
- **R12.1** La suite Karma completa queda en verde, con specs actualizadas o nuevas para el
  comportamiento agregado (fotos, titulares partidos, cintas pausables, reduced motion).
- **R12.2** Siguen funcionando: transición entre rutas públicas, scroll a anclas bajo el
  header, barra de progreso de lectura, metadatos/JSON-LD por página, tema persistido, y las
  rutas `/acceder`, `/login` y la app interna sin cambios visuales.

## Criterios de aceptación

| # | Verificación | Cubre |
|---|---|---|
| CA1 | QA visual (CDP) de las 7 rutas públicas × {375, 1280} × {claro, oscuro}: titulares en la display, sin scroll horizontal, grano visible | R1, R2.5, R3.1, R5.1 |
| CA2 | Medición por `getComputedStyle` en 375 y 1280: tamaños de hero, títulos, cuerpo y leads ≥ mínimos de R2 | R2.1–R2.3 |
| CA3 | `font-family` computado: titulares = display; cuerpo/botones/nav = Geist | R1.1, R1.2 |
| CA4 | Grep del CSS fuente de los archivos tocados: sin literales de color nuevos fuera de los tokens (salvo blanco/negro con alpha del grano) | R4.1 |
| CA5 | Contraste calculado de los pares texto/fondo de cada tratamiento de sección, en claro y oscuro, ≥ AA | R10.1 |
| CA6 | Specs Karma: cintas con botón de pausa; con reduced motion simulado no hay reveal por scroll ni marquee activo | R6.3, R9.2 |
| CA7 | Specs: home y `/nosotros` renderizan las fotos nuevas con `alt` sin nombres; ningún `equipo-ycw` en el build ni en `public/` | R8 |
| CA8 | Specs: un solo `h1` por página; titulares partidos exponen el texto completo una vez al árbol accesible | R4.3, R10.2 |
| CA9 | `ng build` de producción: initial < 500 kB, `css-inline-fonts` ≤ 19,14 kB, sin errores de `anyComponentStyle` | R11 |
| CA10 | Suite Karma completa en verde; `/acceder`, `/login` y `/dashboard` sin diferencias visuales (diff de capturas) | R12 |
| CA11 | Anclas de la home y orden de secciones sin cambios (spec de la home) | R6.1 |
| CA13 | `getComputedStyle` del botón "Ingresar" en header, hero y CTA final: mismo `background-image` que la línea base | R5.4 |
| CA12 | Formulario de contacto: specs existentes en verde (campos, validación, apertura de WhatsApp) | R7.4 |

## No-objetivos y edge cases excluidos

- Sin colores de marca nuevos ni cambios de valor de los tokens.
- Sin rediseño de composición en `/legal` ni en la 404 (solo herencia).
- Sin cambios en `/acceder`, `/login` ni la app interna (cambios futuros
  `acceso-volver-inicio` y `app-interna-ux`).
- Sin reescritura de textos; solo partición de titulares.
- Sin nombres de integrantes en los `alt` de las fotos.
- Sin dependencias de animación de terceros ni 3D/WebGL.
- No se garantiza la fuente display en navegadores sin soporte de `font-display` o con fuentes
  web bloqueadas: ahí rige el respaldo de R1.3.
- No se verifica en navegadores distintos de Chrome (QA y tests corren en Chrome headless).
