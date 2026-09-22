---
name: sds-design-taste
description: Calidad visual anti-slop para frontends — registro Brand/Product, inferencia del brief, tres diales (varianza/movimiento/densidad), tipografía, color, layout y patrones prohibidos de IA. Complemento de sds-nextjs y sds-astro.
version: 1.0.0
---

# sds-design-taste — Anti-Slop Visual

> Para landings, portfolios y rediseños. No para dashboards, tablas de datos ni UI de producto multistep.
> Cada regla es contextual. Ninguna se activa automáticamente — primero leer el brief.

Complemento de `sds-nextjs` y `sds-astro`. Esas skills resuelven arquitectura y stack; esta skill resuelve calidad visual.

---

## 0. Inferencia del brief (siempre primero)

La mayoría del output de IA es genérico porque el modelo salta a una estética por defecto sin leer el contexto.

### 0.A Señales a leer
1. **Tipo de página** — landing (SaaS / consumer / agencia / evento), portfolio (dev / designer / estudio), rediseño (preservar vs overhaul), editorial / blog.
2. **Palabras de vibe** — "minimalista", "limpio", "estilo Linear", "Awwwards", "brutalista", "premium consumer", "estilo Apple", "B2B serio", "editorial", "glassy", "dark tech".
3. **Referencias** — URLs, screenshots, productos nombrados, competidores.
4. **Audiencia** — panel de compras B2B vs. consumidor design-conscious vs. reclutador escaneando un portfolio. La audiencia elige la estética, no tu gusto.
5. **Assets de marca existentes** — logo, color, tipografía, fotografía. En rediseños: punto de partida obligatorio, no input opcional.
6. **Restricciones silenciosas** — accesibilidad crítica, sector público, industrias reguladas, comercio trust-first, productos para niños. Estas ANULAN la preferencia estética.

### 0.B "Design Read" antes de generar
Antes de cualquier código, declarar en una línea:
**"Leyendo esto como: \<tipo> para \<audiencia>, con lenguaje \<vibe>, orientado a \<sistema o familia estética>."**

Ejemplos:
- *"Leyendo esto como: landing B2B SaaS para compradores técnicos, lenguaje minimalista estilo Linear, orientado a Tailwind + Geist + movimiento contenido."*
- *"Leyendo esto como: portfolio de diseñador para hiring managers, lenguaje editorial / kinetic-type, orientado a CSS nativo + scroll-driven + tipografía custom."*
- *"Leyendo esto como: rediseño de sitio de servicio público, con lenguaje trust-first, orientado a GOV.UK Frontend o USWDS."*

### 0.C Una sola pregunta si el brief es ambiguo
Hacer exactamente **una** pregunta aclaratoria — nunca un dump de preguntas — y solo cuando el design read genuinamente diverge. Ej: *"¿Debería sentirse más Linear-clean o Awwwards-experimental?"*

Si se puede inferir con confianza: declarar el design read y avanzar.

### 0.D Disciplina anti-default
No defaultear a: gradientes AI-purple, hero centrado sobre mesh oscuro, tres cards iguales de features, glassmorfismo genérico en todo, micro-animaciones infinitas en todos lados, Inter + slate-900. Estos son los defaults del LLM. Superarlos deliberadamente basándose en el design read.

### 0.E Test de slop — primer y segundo orden

Antes de entregar cualquier diseño, correr dos tests en secuencia:

**Primer orden:** si alguien puede adivinar la paleta o la estética con solo saber la categoría del brief ("es un SaaS de productividad → azul/gris neutro", "es una landing de cookware → beige + brass"), es el primer reflejo de datos de entrenamiento. Reescribir el design read y la estrategia de color hasta que la respuesta no sea obvia a partir del dominio.

**Segundo orden:** si alguien puede adivinar la familia estética sabiendo la categoría MÁS las anti-referencias ("tool de AI que no es SaaS-crema → editorial-tipográfico", "fintech que no es navy-y-gold → terminal dark mode"), es la trampa un nivel más profundo. El primer reflejo se evitó; el segundo no. Seguir hasta que ninguno de los dos sea predecible.

Si el conjunto (paleta + tipografía + layout + imágenes) produce el mismo resultado que otras herramientas de IA para ese brief, el diseño no es distinto — aunque cada decisión individual parezca justificada.

---

## Registro — Brand o Product

El registro determina qué reglas de diseño aplican. Identificarlo antes de configurar los diales.

**Brand** — el diseño ES el producto: landings, portfolios, páginas de marketing, campañas, páginas "about". El visitante juzga la marca a través del diseño. Requiere POV definido, disposición a arriesgar extrañeza, paleta comprometida. Restraint sin intención ahora se lee como mediocre.

**Product** — el diseño SIRVE al producto: app UI, dashboards, herramientas, admin panels. El usuario viene a hacer algo, no a ser impresionado. Requiere claridad, consistencia, densidad apropiada. Las reglas de layout y densidad pesan más que la originalidad estética.

| Dimensión | Brand | Product |
|-----------|-------|---------|
| Estrategia de color | Committed / Full palette / Drenched | Restrained |
| Riesgo estético | Alto — POV definido es obligatorio | Bajo — claridad sobre originalidad |
| Tipografía display | Fuente de marca justificada; más libertad | Funcional; escala clara |
| Layout | Composición asimétrica válida | Grid predecible, prioriza usabilidad |
| Imágenes | Obligatorias si el brief las implica | Opcionales según función |
| VISUAL_DENSITY default | 2-5 | 4-8 |

En proyectos que mezclan ambos (landing de un producto con app embedded): aplicar Brand a las secciones de marketing y Product al UI de la app.

---

## 1. Los tres diales

Tras el design read, configurar los tres diales. Cada decisión de layout, movimiento y densidad está gateada por estos valores.

- **`DESIGN_VARIANCE: 8`** — 1 = Simetría perfecta, 10 = Caos artístico
- **`MOTION_INTENSITY: 6`** — 1 = Estático, 10 = Cinemático / físicas
- **`VISUAL_DENSITY: 4`** — 1 = Galería de arte / aireado, 10 = Cabina / datos densos

**Baseline:** `8 / 6 / 4`. Usar estos valores salvo que el design read los sobreescriba. No pedir al usuario que edite el archivo — los overrides son conversacionales.

### Inferencia de diales según señal

| Señal | VARIANCE | MOTION | DENSITY |
|-------|----------|--------|---------|
| "minimalista / limpio / editorial / estilo Linear" | 5-6 | 3-4 | 2-3 |
| "premium consumer / Apple / lujo / marca" | 7-8 | 5-7 | 3-4 |
| "juguetón / experimental / Awwwards / agencia" | 9-10 | 8-10 | 3-4 |
| "landing / portfolio / marketing (default)" | 7-9 | 6-8 | 3-5 |
| "sector público / regulado / accesibilidad crítica" | 3-4 | 2-3 | 4-5 |
| "rediseño — preservar" | igual | igual+1 | igual |
| "rediseño — overhaul" | +2 | +2 | igual |

### Presets por caso de uso

| Caso | VARIANCE | MOTION | DENSITY |
|------|----------|--------|---------|
| Landing SaaS mainstream | 7 | 6 | 4 |
| Landing agencia / creativa | 9 | 8 | 3 |
| Landing premium consumer | 7 | 6 | 3 |
| Portfolio diseñador / estudio | 8 | 7 | 3 |
| Portfolio desarrollador | 6 | 5 | 4 |
| Editorial / Blog | 6 | 4 | 3 |
| Servicio sector público | 3 | 2 | 5 |
| Rediseño — preservar | igual | igual+1 | igual |
| Rediseño — overhaul | +2 | +2 | igual |

### Definición técnica de los diales

**DESIGN_VARIANCE**
- 1-3: CSS Grid simétrico (12 col, fr iguales), paddings iguales, alineación centrada.
- 4-7: Overlaps con `margin-top: -2rem`, aspect ratios variados, headers left-aligned sobre data centrada.
- 8-10: Layouts asimétricos, `grid-template-columns: 2fr 1fr 1fr`, zonas vacías grandes (`padding-left: 20vw`).
- Override móvil: para niveles 4-10, los layouts asimétricos DEBEN colapsar a columna única estricta (`w-full`, `px-4`, `py-8`) en viewports < 768px.

**MOTION_INTENSITY**
- 1-3: Sin animaciones automáticas. Solo estados CSS `:hover` y `:active`.
- 4-7: `transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1)`. Cascadas de `animation-delay` para load-ins. Solo `transform` y `opacity`.
- 8-10: Scroll-triggered reveals complejos, parallax, GSAP ScrollTrigger. Nunca `window.addEventListener('scroll')` — ver Sección 6.

**VISUAL_DENSITY**
- 1-3: Mucho espacio. Gaps de sección enormes (`py-32` a `py-48`).
- 4-7: Espaciado estándar de web app (`py-16` a `py-24`).
- 8-10: Paddings ajustados. Sin card boxes; líneas de 1px separan datos. `font-mono` obligatorio para números.

---

## 2. Mapa de design systems

### 2.A Cuando el brief pide un sistema real (usar paquetes oficiales)

| Brief... | Usar | Por qué |
|----------|------|---------|
| Microsoft / enterprise SaaS / dashboards | `@fluentui/react-components` | Fluent UI oficial, tokens Microsoft, a11y incluido |
| Google Material product UI | `@material/web` + tokens Material 3 | Oficial, themeable |
| IBM / analytics enterprise | `@carbon/react` + `@carbon/styles` | Carbon oficial, patrones de data-density maduros |
| Shopify admin surfaces | Polaris React | Obligatorio para Shopify admin UI |
| Atlassian / Jira-style product | `@atlaskit/*` + `@atlaskit/tokens` | DS oficial de Atlassian |
| Herramientas de devs estilo GitHub | `@primer/css` o `@primer/react-brand` | Primer oficial |
| Servicio público UK | `govuk-frontend` | Esperado legalmente |
| Servicio público US | `uswds` | Idem |
| MVP ágil de agencia | Bootstrap 5.3 | Rápido, funciona |
| Fundación React accesible moderna | `@radix-ui/themes` | Primitivos + tema pulido |
| SaaS moderno con componentes propios | shadcn/ui | Código en propiedad; nunca en estado default |
| SaaS Tailwind / AI marketing | Tailwind v4 utilities + `dark:` | Default para builds indie y equipos pequeños |

**Regla de honestidad:** si el brief encaja con uno de los sistemas de arriba, instalar y usar el paquete oficial. No recrear su CSS a mano. No importar sus tokens y luego sobreescribir el 90%.

**Un solo sistema por proyecto.** No mezclar Fluent React con Carbon. No importar componentes de shadcn/ui dentro de una app Material 3.

### 2.B Cuando el brief pide una estética (no un sistema)

Para estas direcciones no hay paquete oficial único. Construir con CSS nativo + Tailwind + una librería de componentes mantenida. Ser honesto en el código sobre qué es inspiración prestada vs. material oficial.

| Estética | Implementación honesta |
|----------|----------------------|
| Glassmorfismo | `backdrop-filter`, borders en capas, highlight overlays. Fallback sólido para `prefers-reduced-transparency`. |
| Bento (grids de tiles estilo Apple) | CSS Grid con tamaños de celda mixtos. No hay librería única. |
| Brutalismo | CSS nativo, monospace, borders crudos. Sin librería. |
| Editorial / revista | Tipografía serif, grid asimétrico, espacio en blanco generoso. Sin librería. |
| Dark tech / hacker | Mono + acento neon, motivos de terminal. Sin librería. |
| Aurora / mesh gradients | SVG o radial gradients en capas. Sin librería. |
| Kinetic typography | CSS animations nativas, scroll-driven animations, GSAP para hijacks. Sin librería. |

---

## 3. Tipografía

- **Display / Titulares:** default `text-4xl md:text-6xl tracking-tighter leading-none`. Ceiling: `clamp()` max ≤ 6rem (~96px) — por encima de eso la página grita, no diseña.
- **Display letter-spacing floor:** ≥ -0.04em. Por debajo las letras se tocan; cramped, no "diseñado". -0.02 a -0.03em es suficiente para grotesco display ajustado.
- **Cuerpo / Párrafos:** default `text-base text-gray-600 leading-relaxed max-w-[65ch]`.
- **Text wrap:** `text-wrap: balance` en h1-h3 para líneas de largo parejo. `text-wrap: pretty` en párrafos largos para reducir huérfanas.
- **Light sobre fondo oscuro:** sumar 0.05-0.1 a line-height. La tipografía clara se percibe más liviana y necesita más espacio.

**Procedimiento de selección de fuente (obligatorio, no saltear):**
1. Escribir tres palabras concretas de voz de marca — no "moderno" o "elegante", sino "cálido + mecánico + opinado" o "calmo + clínico + cuidadoso". Palabras de objeto físico.
2. Listar las tres fuentes que elegiría por reflejo. Si alguna aparece en la lista de rechazo más abajo, descartarla — son defaults de datos de entrenamiento.
3. Buscar en un catálogo real (Google Fonts, Pangram Pangram, Future Fonts, ABC Dinamo, Klim) con esas tres palabras en mente. Encontrar la fuente como si fuera un objeto físico: un cartel de museo, un manual de terminal de los 70s, una etiqueta de tela, un cartel de concierto, un recibo de diner de mediados de siglo. Rechazar lo primero que "parece diseñado".
4. Cross-check: si la elección final coincide con el reflejo inicial, empezar de nuevo.

**Lista de rechazo — defaults de entrenamiento:**
`Fraunces` · `Newsreader` · `Lora` · `Crimson` · `Crimson Pro` · `Crimson Text` · `Playfair Display` · `Cormorant` · `Cormorant Garamond` · `Syne` · `IBM Plex Mono` · `IBM Plex Sans` · `IBM Plex Serif` · `Space Mono` · `Space Grotesk` · `Inter` · `DM Sans` · `DM Serif Display` · `DM Serif Text` · `Outfit` · `Plus Jakarta Sans` · `Instrument Sans` · `Instrument Serif`

Estas fuentes aparecen en la mayoría del output de IA para cualquier brief — por eso son tells. Buscar más lejos.

**Serif — muy desaconsejado como default:**
- "Se ve creativo / premium / editorial" NO es razón para usar serif. Es el tell más detectado en tests de producción.
- Serif aceptable SOLO cuando: el brief nombra literalmente una fuente serif, O la familia estética es genuinamente editorial / lujo / publicación Y se puede articular por qué ese serif específico sirve a esa marca específica.
- Para todo lo demás (agencia creativa, estudio de diseño, marca moderna, premium consumer, portfolio): **sans-serif display por defecto**.
- Si el serif está justificado (infrecuente), rotar entre: PP Editorial New, GT Sectra Display, Tiempos Headline, EB Garamond, Canela, Tobias, IvyPresto, Söhne Breit Kursiv. No reusar el mismo en proyectos consecutivos.

**Elección de fuente sans:**
- Desaconsejada como default: `Inter` (ver lista de rechazo). Elegir primero `Geist`, `Cabinet Grotesk`, `Satoshi`, `GT America`, `PP Neue Montreal` u otra apropiada para la marca.
- Override: Inter es aceptable cuando el brief pide explícitamente neutralidad / feel estándar, o cuando es sitio de sector público / accesibilidad crítica.
- Pairings conocidos: `Geist + Geist Mono`, `Satoshi + JetBrains Mono`, `Cabinet Grotesk + Inter Tight`, `GT America + IBM Plex Mono`.

**Énfasis dentro de titulares:** usar **itálica o negrita de la MISMA fuente**. No inyectar una palabra serif en un titular sans (ni viceversa). El énfasis de familia mixta es amateur. La itálica / negrita en la misma familia es el movimiento correcto.

**Clearance de descenders en itálica (obligatorio):** cuando se usa itálica en display type con letras con descenders (`y g j p q`), `leading-[1]` o `leading-none` cortan el descender. Usar `leading-[1.1]` mínimo y agregar `pb-1` o `mb-1` en el elemento envolvente. Auditar cada palabra italic en titulares display antes de entregar.

---

## 4. Color

**Espacio de color:** preferir OKLCH para tokens — perceptualmente uniforme, predecible entre hues. Usar `oklch(L C H)` en CSS variables. Ejemplo: `--accent: oklch(0.65 0.19 250)`.

**Neutrales tintados:** agregar 0.005-0.015 de chroma hacia el hue de la marca — nunca hacia cálido o frío "porque el brief lo parece". Eso es monocultura entre proyectos. La calidez la llevan el acento, la tipografía y las imágenes, no el fondo.

**Estrategia de color — elegir ANTES de elegir colores:**
- **Restrained:** neutros tintados + un acento ≤ 10% de superficie. Default para Product y minimalismo de marca.
- **Committed:** un color saturado cubre 30-60% de la superficie. Default para páginas de identidad Brand.
- **Full palette:** 3-4 roles de color nombrados, usados deliberadamente. Campañas, data viz.
- **Drenched:** la superficie ES el color. Heros de campaña, páginas de lanzamiento.

Nombrar una referencia real antes de elegir la estrategia: "Stripe purple-on-white Restrained", "Liquid Death acid-green Full palette", "Vercel pure black Drenched". La ambición sin nombre se vuelve beige.

- Max 1 color de acento. Saturación < 80% por defecto.
- **La Regla LILA:** El gradiente AI-purple está desaconsejado como default. Sin glows de botón en purple automáticos, sin gradientes neon aleatorios. Usar bases neutras (Zinc / Slate / Stone) con acentos singulares de alto contraste (Emerald, Electric Blue, Deep Rose, Burnt Orange, etc.).
- **Override:** si el brief pide explícitamente purple / violeta, abrazarlo — pero con intención: paleta consistente, neutros armonizados, gradientes contenidos. No gradiente AI slop genérico.
- **Una paleta por proyecto.** No alternar entre grises cálidos y fríos en el mismo proyecto.
- **Color Consistency Lock (obligatorio):** una vez elegido el color de acento para una página, se usa en toda la página. Un sitio warm-grey no tiene de repente un CTA azul en la sección 7. Un sitio con acento rose no tiene un badge teal en el footer.

**Premium Consumer Palette Ban (obligatorio):**
Para briefs premium consumer (cookware, wellness, artesanal, lujo, DTC home goods), el default del LLM es siempre **beige / crema cálida + brass / clay / oxblood + texto espresso**. Esta paleta está baneada como default:
- Fondos: `#f5f1ea`, `#f7f5f1`, `#fbf8f1`, `#efeae0`, `#ece6db` (todas "papel cálido / crema / chalk / bone")
- Acentos: `#b08947`, `#b6553a`, `#9a2436`, `#bc7c3a`, `#7d5621` (todos "brass / clay / oxblood / ochre")
- Textos: `#1a1714`, `#1a1814`, `#1b1814` (todos "espresso / negro cálido")

Alternativas (rotar, no reusar la misma en proyectos consecutivos):
- **Cold Luxury:** silver-grey + chrome + smoke (Tesla, Apple Watch)
- **Forest:** verde profundo + hueso + acento ámbar (Filson, Patagonia premium)
- **Black and Tan:** off-black verdadero + tan cálido, alto contraste
- **Cobalt + Cream:** azul saturado contra neutro único, sin brass
- **Terracotta + Slate:** rust cálido contra grey frío, sin brass
- **Monocromo puro + pop saturado único:** off-white + off-black + un acento brillante (electric blue, emerald, hot pink)

Override: la paleta beige+brass es aceptable SOLO cuando el brief nombra explícitamente esos colores, o cuando la identidad de marca es genuinamente vintage / artesanal Y se puede articular por qué esa paleta específica sirve a esa marca específica.

---

## 5. Layout

### Anti-center bias
Secciones centradas de Hero / H1 se evitan cuando `DESIGN_VARIANCE > 4`. Forzar "Split Screen" (50/50), "Contenido left-aligned / asset right-aligned", "White-space asimétrico", o estructuras scroll-pinned.
Override: el hero centrado está bien para briefs editoriales / manifesto / launch-announcement donde el mensaje en sí es el diseño.

### Cards y elevación
Usar cards SOLO cuando la elevación comunica jerarquía real. En caso contrario, agrupar con `border-t`, `divide-y`, o espacio negativo.
Cuando se usa sombra, tintarla al hue del fondo. Sin drop shadows negro puro en fondos claros.

### Shape Consistency Lock (obligatorio)
Elegir UN scale de border-radius para la página y mantenerlo. Opciones: todo-sharp (radius 0), todo-soft (radius 12-16px), todo-pill (full radius para interactivos). Sistemas mixtos solo cuando hay una regla documentada (ej: "botones pill, cards 16px, inputs 8px") y esa regla se sigue en todas partes.

### Reglas duras de layout (fallar cualquiera = trabajo roto)

**Hero:**
- El hero DEBE entrar en el viewport inicial. Titular max 2 líneas en desktop, subtexto max 20 palabras Y max 3-4 líneas, CTAs visibles sin scroll.
- **Hero font-scale discipline:** rango sensato `text-4xl md:text-5xl lg:text-6xl` para la mayoría; `text-6xl md:text-7xl` solo cuando el titular tiene 3-5 palabras. Un titular de 4 líneas es siempre un error de font-size, no un problema de largo de copy.
- **Hero top padding cap (obligatorio):** max `pt-24` en desktop. Más que eso hace que el contenido flote a mitad del viewport y se lee como bug de layout.
- **Hero stack discipline — max 4 elementos de texto:**
  1. Eyebrow (label uppercase pequeño) O strip de marca O ninguno — elegir cero o uno
  2. Titular (max 2 líneas)
  3. Subtexto (max 20 palabras, max 4 líneas)
  4. CTAs (1 primario + max 1 secundario)
  - Baneados dentro del hero: taglines bajo los CTAs, trust micro-strips, teaser de precios, bullet list de features, fila de avatars de social proof.
- **"Used by" / "Trusted by" logo wall va BAJO el hero, nunca dentro.**

**Navegación:**
- La nav DEBE renderizar en una sola línea en desktop. Si los items no caben en `lg` (1024px): condensar labels, quitar items secundarios, o ir a hamburger. Nav de dos líneas en desktop = diseño roto.
- Nav height cap: 80px max desktop, default 64-72px.

**Secciones:**
- **Section-Layout-Repetition Ban:** una familia de layout (ej: 3 image-cards en columnas, full-width-quote, split-text-image) puede aparecer máximo UNA vez en la página. Una landing con 8 secciones debe usar al menos 4 familias de layout diferentes.
- **Zigzag Alternation Cap (obligatorio):** alternar "imagen-izquierda + texto-derecha" / "texto-izquierda + imagen-derecha" = banal. Max 2 secciones consecutivas con este patrón. La 3ª es un Pre-Flight Fail. Romper el patrón con una sección full-width, vertical-stack, bento grid, marquee, o familia diferente.
- **Eyebrow Restraint (obligatorio — la regla más violada en tests de producción):**
  - Máximo 1 eyebrow cada 3 secciones. El hero cuenta como 1. Una página con 9 secciones puede usar máximo 3 eyebrows.
  - Si la sección A tiene eyebrow, las 2 siguientes no pueden tenerlo.
  - Pre-Flight Check mecánico: contar instancias de `uppercase tracking` (o labels pequeñas mono sobre headlines) en todos los componentes. Si el conteo > ceil(numSecciones / 3), el output falla.
  - En lugar del eyebrow: eliminarlo. El titular solo es suficiente.
- **Split-Header Ban (obligatorio):** el patrón "titular grande left + párrafo pequeño flotante right" en encabezados de sección está baneado como default. Las secciones deben tener UN mensaje enfocado. Si se necesitan tanto titular como párrafo explicativo, apilarlos verticalmente (titular arriba, cuerpo abajo, max-width 65ch).
- **Bento Background Diversity (obligatorio):** los bentos no pueden ser X cards blancas sobre fondo blanco con solo texto. Al menos 2-3 celdas necesitan variación visual real: imagen real, gradiente de marca, patrón, fondo tintado.
- **Bento Cell Count Rule (obligatorio):** un bento tiene EXACTAMENTE tantas celdas como items de contenido hay. 3 items = 3 celdas. 5 items = 5 celdas. Si hay una celda vacía en el medio o al final, replantear el grid.
- **Mobile collapse explícito:** para cada layout multi-columna, declarar el fallback < 768px en el mismo componente.

### Imágenes y assets visuales

Las landing pages y portfolios son productos visuales. Páginas de solo texto con fake-screenshot divs = slop.

**Orden de prioridad:**
1. **Herramienta de generación de imágenes** si está disponible en el entorno — generar assets específicos de sección al aspect ratio correcto.
2. **Imágenes web reales:** `https://picsum.photos/seed/{seed-descriptivo}/{w}/{h}` para placeholders fotográficos (el seed debe describir la sección, ej: `cookware-hero-kitchen`).
3. **Último recurso:** dejar slots claramente etiquetados (`<!-- TODO: foto de producto hero, 1600x1200 -->`) y comunicarlo al usuario. No rellenar con fake-screenshot divs ni SVGs decorativos inventados.

**Logo walls:** usar SVGs reales de Simple Icons (`https://cdn.simpleicons.org/{slug}/ffffff` para cualquier color, o paquete npm `simple-icons`). No wordmarks en texto plano. Logo wall = logos y nada más — sin labels de categoría bajo cada logo.

**Fake product previews están baneados.** Un "fake terminal" o "fake dashboard" hecho de `<div>` rectangles es el Tell #1 de diseño IA. Usar screenshot real, imagen generada, componente real, o nada.

### Densidad de contenido

- **Forma default por sección:** titular corto (≤ 8 palabras) + subpárrafo corto (≤ 25 palabras) + un asset visual O un CTA.
- **Sin secciones data-dump.** Una tabla de 20 filas, una lista de 30 awards, una matriz de precios gigante en una página de marketing = layout incorrecto. Alternativas: top 3-5 highlights + "Ver lista completa", carousel, marquee para breadth.
- **Listas largas necesitan un UI diferente:** tabs / accordion si son categorizables, 2-col split con items agrupados, carousel para breadth-heavy, marquee para "muchas cosas que no necesitan atención individual".
- **Copy Self-Audit (obligatorio antes de entregar):** releer cada string visible en la página. Señalar y reescribir cualquier string que sea: gramaticalmente roto, con referentes poco claros, que suene a alucinación de IA, o que "suene a un LLM intentando sonar reflexivo".
- **Fake-precise numbers baneados:** `92%`, `4.1×`, `48k`, `5.8 mm` — solo si vienen de datos reales del brief o están explícitamente etiquetados como mock. No inventar precisión de ingeniería que la marca no reclama.

---

## 6. Movimiento

**Movimiento = motivado, no decorativo.** Antes de agregar cualquier animación, preguntar: "¿qué comunica esta animación?" Respuestas válidas: jerarquía (atención al elemento correcto), storytelling (revelado secuencial que acompaña una narrativa), feedback (reconocer una acción del usuario), transición de estado (mostrar que algo cambió). Respuesta inválida: "se veía bien". GSAP en todos lados porque está disponible = amateur.

**Curvas de easing:** ease-out exponencial (`ease-out-quart`, `ease-out-quint`, `ease-out-expo`). Sin bounce, sin elastic — se sienten anticuadas y caricaturescas. En Motion: `ease: [0.16, 1, 0.3, 1]`. En CSS: `cubic-bezier(0.16, 1, 0.3, 1)`.

**Stagger — el reflejo uniforme:** stagear los items dentro de UNA lista es legítimo y correcto. El tell es el reflejo uniforme: aplicar la misma entrada (fade + slide) a CADA sección de la página sin distinción. Cada reveal debe ajustarse a lo que revela. Suprimir el reflejo no es razón para entregar una página completamente estática.

**Marquee máximo uno por página (obligatorio).** Dos o más marquees en la misma página = relleno perezoso. Elegir la sección donde el marquee realmente sirve al contenido; el resto obtiene un layout diferente.

### Motion (anteriormente Framer Motion)

Importar desde `motion/react`:
```tsx
import { motion, useMotionValue, useTransform, useScroll, useReducedMotion } from "motion/react"
```

**Para reveals simples (items que aparecen al entrar al viewport):** preferir `whileInView` de Motion sobre GSAP — más liviano, sin ScrollTrigger:
```tsx
"use client"
import { motion, useReducedMotion } from "motion/react"

export function RevealStagger({ items }: { items: React.ReactNode[] }) {
  const reduce = useReducedMotion()
  return (
    <ul className="grid gap-6">
      {items.map((item, i) => (
        <motion.li
          key={i}
          initial={reduce ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
        >
          {item}
        </motion.li>
      ))}
    </ul>
  )
}
```

Usar esto para: listas de features, grids de testimoniales, logo walls, cualquier cosa que solo necesite "entrar en scroll". Reservar GSAP para trabajo real de pin/scrub.

**Para físicas magnéticas y hover:** usar `useMotionValue` / `useTransform` fuera del ciclo de render de React. NUNCA `useState` para valores continuos (posición de mouse, scroll progress, físicas de puntero). `useState` re-renderiza el árbol React en cada cambio y colapsa en mobile.

**Para scroll-stack y horizontal-pan:** usar GSAP + ScrollTrigger — ver sección dedicada abajo.

### GSAP + ScrollTrigger

**Instalación:**
```bash
npm install gsap
```

**Registro de plugins — siempre fuera del componente:**
```tsx
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)
```

**¿Motion o GSAP?**

| Caso | Usar |
|------|------|
| Reveal al entrar al viewport (fade, slide) | Motion `whileInView` |
| Hover physics, magnético, spring | Motion `useMotionValue` |
| Card stack con pin en scroll | GSAP ScrollTrigger |
| Scroll horizontal (horizontal pan) | GSAP ScrollTrigger |
| Parallax scrubbed por scroll | GSAP ScrollTrigger |
| Integración con R3F / Three.js | GSAP ScrollTrigger + `useRef` |

**Patrón Sticky-Stack** (cards que se apilan en scroll):
```tsx
"use client"
import { useRef, useEffect } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useReducedMotion } from "motion/react"

gsap.registerPlugin(ScrollTrigger)

export function StickyStack({ cards }: { cards: React.ReactNode[] }) {
  const ref = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()

  useEffect(() => {
    if (reduce || !ref.current) return
    const ctx = gsap.context(() => {
      const cardEls = gsap.utils.toArray<HTMLElement>(".stack-card")
      cardEls.forEach((card, i) => {
        if (i === cardEls.length - 1) return
        // Pin cada card en el top del viewport
        ScrollTrigger.create({
          trigger: card,
          start: "top top",           // crítico: siempre "top top"
          endTrigger: cardEls[cardEls.length - 1],
          end: "top top",
          pin: true,
          pinSpacing: false,
        })
        // La card anterior se achica a medida que llega la siguiente
        gsap.to(card, {
          scale: 0.92,
          opacity: 0.55,
          ease: "none",
          scrollTrigger: {
            trigger: cardEls[i + 1],
            start: "top bottom",
            end: "top top",
            scrub: true,
          },
        })
      })
    }, ref)
    return () => ctx.revert()
  }, [reduce])

  return (
    <div ref={ref} className="relative">
      {cards.map((card, i) => (
        <div key={i} className="stack-card sticky top-0 min-h-[100dvh] flex items-center justify-center">
          {card}
        </div>
      ))}
    </div>
  )
}
```

**Patrón Horizontal-Pan** (scroll vertical mueve contenido horizontal):
```tsx
"use client"
import { useRef, useEffect } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useReducedMotion } from "motion/react"

gsap.registerPlugin(ScrollTrigger)

export function HorizontalPan({ children }: { children: React.ReactNode }) {
  const wrap = useRef<HTMLDivElement>(null)
  const track = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()

  useEffect(() => {
    if (reduce || !wrap.current || !track.current) return
    const ctx = gsap.context(() => {
      const distance = track.current!.scrollWidth - window.innerWidth
      gsap.to(track.current, {
        x: -distance,
        ease: "none",
        scrollTrigger: {
          trigger: wrap.current,
          start: "top top",           // crítico: siempre "top top"
          end: () => `+=${distance}`, // scroll = distancia horizontal a recorrer
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,  // recalcular al hacer resize
        },
      })
    }, wrap)
    return () => ctx.revert()
  }, [reduce])

  return (
    <section ref={wrap} className="relative overflow-hidden">
      <div ref={track} className="flex h-[100dvh] items-center">
        {children}
      </div>
    </section>
  )
}
```

**Reglas críticas de ScrollTrigger:**
- Siempre `start: "top top"` en pins — cualquier otro valor hace que el trigger dispare a mitad del scroll
- Siempre `ctx.revert()` en el cleanup — sin esto los triggers se acumulan en HMR y development
- `invalidateOnRefresh: true` en horizontal-pan — el cálculo de `distance` cambia si el usuario redimensiona
- Para integración con Three.js / R3F: guardar el progreso en `useRef` y leerlo en `useFrame`

### Patrones de animación prohibidos

- **`window.addEventListener("scroll", ...)`** — baneado. Propenso a jank, sin batching. Usar `useScroll()` de Motion, `ScrollTrigger` de GSAP, IntersectionObserver, o CSS scroll-driven animations (`animation-timeline: view()`).
- **Custom scroll progress con `window.scrollY` en React state** — misma razón.
- **`requestAnimationFrame` loops que tocan React state** — usar motion values (`useMotionValue` + `useTransform`).
- **Layout transitions sin `motion.layout`** — usar props `layout` y `layoutId` de Motion para cambios de estado visibles (re-ordenado de listas, modales expandidos, elementos compartidos entre routes).
- **Stagger orquestado:** usar `staggerChildren` de Motion o cascada CSS (`animation-delay: calc(var(--index) * 100ms)`). El padre (variants) y los hijos deben compartir el mismo árbol de Client Components.
- **Visibilidad gateada por transición de clase** — no hacer que el contenido empiece invisible y dependa de una clase activada por JS para aparecer. Las transiciones se pausan en tabs ocultas y renderers headless: la sección llega en blanco. Las animaciones de entrada deben mejorar contenido ya visible por defecto (`opacity: 0` en JS inmediatamente antes de la animación está bien; `opacity: 0` en CSS como estado inicial del DOM no lo está).

### Reduced Motion (obligatorio)

Cualquier movimiento con `MOTION_INTENSITY > 3` DEBE respetar `prefers-reduced-motion`. No negociable.
- En Motion: usar `useReducedMotion()` y degradar a estático.
- En CSS: gatear con `@media (prefers-reduced-motion: no-preference)` o deshabilitar bajo `@media (prefers-reduced-motion: reduce)`.
- Loops infinitos, parallax, scroll-hijack y físicas magnéticas DEBEN colapsar a estático / instantáneo en reduced motion.

### "Motion claimed, motion shown"
Si `MOTION_INTENSITY > 4`, la página DEBE moverse: transiciones de entrada en el hero, scroll-reveal en secciones clave, hover physics en CTAs como mínimo. Una página estática que declara `MOTION_INTENSITY: 7` está rota. Si no se puede entregar movimiento funcional en el scope disponible, bajar el dial a 3 y entregar una página limpia y estática. Nunca construir movimiento a medias que se rompe.

---

## 7. Performance y accesibilidad

- **Animar solo `transform` y `opacity`.** Nunca animar `top`, `left`, `width`, `height`.
- **`will-change: transform` con moderación** — solo en elementos que realmente van a animar.
- **LCP < 2.5s.** Hero image con `next/image priority` en Next.js o `<Image>` de `astro:assets` con preload en Astro.
- **INP < 200ms.** Trabajo pesado fuera del hilo principal.
- **CLS < 0.1.** Reservar espacio para imágenes, fuentes, embeds.
- **Viewport stability:** NUNCA usar `h-screen` para secciones Hero de altura completa. SIEMPRE usar `min-h-[100dvh]` para evitar layout jumping en mobile (iOS Safari address bar).
- **Grid sobre Flex-Math:** NUNCA usar porcentajes complejos en flexbox (`w-[calc(33%-1rem)]`). SIEMPRE usar CSS Grid (`grid grid-cols-1 md:grid-cols-3 gap-6`).
- **DOM Cost:** aplicar filtros de grain / noise EXCLUSIVAMENTE a pseudo-elementos fijos con `pointer-events-none`. NUNCA en containers que hacen scroll — repaints continuos de GPU destruyen FPS en mobile.
- **Z-index:** NUNCA spam de `z-50` o `z-10` arbitrarios. Usar solo para contextos sistémicos de capas (navbars sticky, modales, overlays, grain). Documentar la z-index scale en un archivo de constantes.

**Dark mode (obligatorio para cualquier página consumer-facing):**
- **Escena física antes de elegir el tema:** escribir una oración: "¿quién usa esto, dónde, con qué luz ambiental, en qué estado de ánimo?" Si la oración no fuerza la respuesta (dark porque es una herramienta de trabajo nocturno, light porque es una tienda minorista con luz de día), no es lo suficientemente concreta. Agregar detalle hasta que lo sea. Dark "porque las herramientas se ven cool en oscuro" y light "para ser seguro" no son escenas físicas.
- Diseñar para ambos modos desde el inicio. Nunca entregar solo light o solo dark sin instrucción explícita del usuario.
- Usar Tailwind `dark:` variant O CSS variables. Elegir uno por proyecto.
- Sin `#000000` puro ni `#ffffff` puro. Usar off-black (zinc-950) y off-white. Los valores puros destruyen profundidad.
- Respetar `prefers-color-scheme` salvo que la marca insista. Agregar toggle manual si alguno de los dos modos perdería expresión clave de marca.
- Testear en ambos modos antes de terminar. No entregar una página que solo se vio en un modo.

**Contraste (obligatorio):**
- **Button Contrast Check:** verificar que el texto del botón sea legible contra el fondo del botón. Ratio mínimo WCAG AA (4.5:1 para body, 3:1 para texto grande ≥ 18px). Botón blanco + texto blanco, `bg-white` CTA con `text-white`, botón transparente sobre fondo de página sin borde — todos baneados.
- **CTA Button Wrap Ban:** el texto del botón DEBE entrar en una línea en desktop. Si se rompe a 2-3 líneas: acortar el label (máximo 3 palabras para CTAs primarios, idealmente 1-2) O ensanchar el botón.
- **No Duplicate CTA Intent:** dos CTAs con la misma intención en una página = Pre-Flight Fail. "Contáctanos" + "Hablemos" + "Empecemos algo" = todos "contacto" — elegir UNA label y usarla en toda la página (nav, hero, footer). Misma regla para "Probar gratis" + "Registrarse" + "Empezar gratis".
- **Form Contrast Check:** inputs, placeholder text, focus rings, helper text y error text deben pasar WCAG AA contra el fondo de la sección.

---

## 8. AI Tells — Patrones prohibidos

Evitar estas firmas a menos que el brief las pida explícitamente.

### Visual y CSS
- Sin glows neon / outer glow por defecto. Usar inner borders o sombras tintadas sutiles.
- Sin `#000000` puro. Off-black, zinc-950, o charcoal.
- Sin acentos sobresaturados. Desaturar para mezclar con neutros.
- **Sin gradient text (`background-clip: text` + gradiente) — baneado completamente.** Decorativo, nunca semántico. Énfasis vía peso o tamaño; siempre color sólido.
- **Sin side-stripe borders.** `border-left` o `border-right` de más de 1px como acento decorativo en cards, list items, callouts o alerts — nunca intencional. Reescribir con bordes completos, fondo tintado, números/íconos leading, o nada.
- **Sin hero-metric template.** Número grande + label pequeño + stats de soporte + gradiente de acento = cliché SaaS de 2023. Si el hero necesita demostrar impacto: imagen real, copy concreto, o componente funcional.
- Sin cursores custom. Anticuado, hostile a accesibilidad y performance.

### Tipografía
- Evitar Inter como default (ver Sección 3).
- Sin H1s sobredimensionados que solo griten. Controlar jerarquía con weight + color, no solo escala.
- Sin mezcla de familias de fuente en el mismo titular.

### Layout
- **Sin 3 cards iguales de features en columna.** La fila genérica de "tres cards horizontales idénticas" está baneada. Usar 2-col zigzag, grid asimétrico, scroll-pinned, o scroll horizontal como alternativa.
- **Sin cajas de cards innecesarias.** Solo cuando la elevación comunica jerarquía real.
- **Sin border-t + border-b en cada fila** de una lista larga o spec table. Elegir uno (bottom-border entre filas O top-border sobre el grupo) y usarlo con moderación.

### Contenido y datos ("Efecto Jane Doe")
- **Sin nombres genéricos.** "John Doe", "Sarah Chan", "Jack Su" — usar nombres creativos, realistas y apropiados a la cultura.
- **Sin avatars genéricos.** No SVG "egg" o íconos de usuario Lucide — foto placeholder creíble o styling específico.
- **Sin números falsamente precisos como default** (ver Sección 5).
- **Sin nombres de marca slop.** "Acme", "Nexus", "SmartFlow", "Cloudly" — inventar nombres contextuales y premium que suenen reales.
- **Sin verbos de relleno.** "Elevar", "Seamless", "Desencadenar", "Next-Gen", "Revolucionar" — solo verbos concretos.

### Patrones baneados (salidos de tests de producción reales)

**Hero y top de página:**
- Sin labels de versión como eyebrow: `V0.6`, `BETA`, `EARLY ACCESS`, `ALPHA` — baneados a menos que el brief sea explícitamente sobre un preview de producto.
- Sin sub-eyebrows estilo "Brand · No. 01 · El SKU".

**Numeración de secciones:**
- Sin eyebrows de número de sección: `00 / INDEX`, `001 · Capabilities`, `06 · how it works`. Baneados. Los eyebrows deben nombrar el tema en lenguaje claro.
- Sin paginación `01 / 4` en imágenes o tiles bento.
- Sin scroll cues tipo `Scroll · 001 Capabilities`.
- Sin labels de rango tipo "Index of Work, 2018-2026" como eyebrow.

**Separadores:**
- El punto medio (`·`) está racionado. Máximo 1 por línea en strips de metadata. No usar como separador default para todo ("foo · bar · baz · qux").
- Sin puntos de status decorativos de color en cada fila de lista / nav / badge. Solo cuando transmiten estado semántico real (indicador de servidor live, flag de disponibilidad real).

**Guion largo — el Tell más violado:**
**Sin em-dash (`—`) EN NINGÚN LADO.** Es la muletilla estilística #1 del LLM y el Tell visual más detectado en tests de producción. No hay allowance de "uso limitado" ni "en cuerpo de texto está bien". Ninguno.
- Baneado en: titulares, eyebrows, labels, pills, texto de botón, captions de imagen, items de nav, cuerpo de texto, atribución de citas, alt text.
- **En titulares:** usar punto o coma.
- **En labels / pills / botones:** usar saltos de línea, columnas o hairlines.
- **En cuerpo de texto:** reestructurar la oración: dos oraciones con punto, O coma, O paréntesis, O dos puntos.
- **En atribución de citas:** usar guion regular con espacios (` - `) o salto de línea + nombre con peso menor.
- Prohibido también el en-dash (`-`) cuando se usa como separador. Rangos de fecha (`2018-2026`) y rangos numéricos (`€40-80k`) usan guion regular.
- Los únicos dashes permitidos: guion regular `-` (palabras compuestas, rangos, divisores en markup) y signo menos en matemáticas.
- Si el output contiene un solo `—` o `–` visible para el usuario, el output falla el Pre-Flight Check y debe reescribirse.

**Titulares:**
- Sin headlines `<br>`-broken-and-italicized como default. "for thirty\<br\>*years.*" solo cuando el brief lo exige explícitamente.
- Sin texto vertical rotado ("INDEX OF WORK" rotado 90°) a menos que el brief sea explícitamente agencia / Awwwards / experimental Y sirva a una composición real.
- Sin líneas de crosshair / hairlines como decoración pura.

**Fake product previews:**
- **Sin fake product UI en divs** (fake task list, fake terminal, fake dashboard de divs). Es el Tell #1 de diseño IA. Usar screenshot real, imagen generada, componente real, o nada.
- Sin version footers en páginas de marketing (`v1.4.2`, `Build 0048`, `last sync 4s ago · main`).

**Marketing copy:**
- Sin "Quietly in use at" / "Quietly trusted by". Usar lenguaje natural: "Usado por", "Clientes incluyen", o sin heading si los logos hablan.
- Sin labels poético-artesanales estilo "From the field" / "Field notes" / "On our desks" / "Currently on the bench". Usar labels funcionales ("Testimoniales", "Últimos artículos") o eliminar el label.
- Sin strips de clima / locale (`LIS 14:23 · 18°C`) en headers / footers, salvo que el brief sea explícitamente sobre un estudio distribuido por timezone o marca relacionada con lugares.
- Sin "generic step labels": "Stage 1", "Step 1", "Phase 01", "Pass One". Baneados. Usar el verbo-sustantivo del contenido directamente: "Instalar", "Configurar", "Desplegar".
- Sin micro-meta-sentences bajo eyebrows: oraciones como *"Cada uno de estos es un feature que enviamos hoy, no una promesa de roadmap."* debajo de un heading de sección = ruido. Eyebrow + Titular + Cuerpo es suficiente.

**Pills, labels y version stamps:**
- Sin pills / labels / tags superpuestos sobre imágenes: `<span>` overlays con tags tipo `Brand · 02`, `PLATE · BRAND` sobre fotos.
- Sin "photo credit captions" decorativos. Los créditos de foto solo cuando hay un fotógrafo real acreditado por una foto real con permiso.
- Sin live-stock counters ("Reservation 412 of 800") como decoración.

**Strips de texto decorativo:**
- Sin decoration text strip al fondo del hero: `BRAND. MOTION. SPATIAL.`, `TYPE / FORM / MOTION`, `DESIGN · BUILD · SHIP`. Cliché de portfolio de agencia. Baneado por defecto.
- Sin sub-texto flotante en top-right de encabezados de sección.
- Sin scoring / barras de progreso con fondo lleno como visuals de comparación en landing pages.

**Scroll cues:**
- Baneados: `Scroll`, `↓ scroll`, `Scroll to explore`, ícono de mouse animado. Si el usuario no hizo scroll todavía, está mirando el hero. Sabe lo que es scroll. El fondo del viewport no necesita una etiqueta.

### Tema
- La página tiene UN solo tema. Las secciones no invierten el modo.
- Si la página es dark, TODAS las secciones son dark. Sin sección "papel cálido" entre secciones dark (o viceversa).
- Excepción: si el brief pide explícitamente un "Color Block Story" o "Theme Switch on Scroll" como dispositivo deliberado — permitido una vez por página.

### Citas y testimoniales
- Max 3 líneas de cuerpo de cita. Si el original es más largo: cortar.
- Atribución: nombre + rol + (opcionalmente) empresa. Nunca solo nombre ("- Sarah").
- Comillas tipográficas reales (" ") o ninguna. No ASCII recto (").
- Sin em-dashes en el cuerpo de la cita (ver más arriba — baneados en todo lado).

---

## 9. Pre-Flight Check

Antes de declarar cualquier tarea como completada, verificar mecánicamente:

- [ ] Test de slop primero y segundo orden pasado: la estética no es predecible solo de la categoría del brief
- [ ] Registro identificado (Brand o Product) y reglas aplicadas según corresponde
- [ ] Estrategia de color declarada (Restrained / Committed / Full palette / Drenched)
- [ ] Design Read declarado en una línea antes de generar
- [ ] Diales configurados y coherentes con el brief
- [ ] Hero: entra en viewport, max 4 elementos de texto, CTAs visibles sin scroll
- [ ] Hero: sin elementos baneados (taglines bajo CTA, bullet lists, avatar rows)
- [ ] **Sin em-dashes (`—` o `–`) en ningún string visible** — grep en todo el output
- [ ] CTAs: texto en una línea, sin intención duplicada en la página
- [ ] Contraste WCAG AA verificado en botones, formularios e inputs
- [ ] Imágenes: reales, generadas, o slots etiquetados (sin fake-screenshot divs)
- [ ] Eyebrows: máximo 1 cada 3 secciones, conteo mecánico
- [ ] Sin 3 cards iguales de features; sin patrón zigzag de 3+ secciones consecutivas
- [ ] Sin puntos de status decorativos; sin decoration text strip en el hero
- [ ] Copy self-audit: sin strings rotos, IA-y, con referentes poco claros o fake-precise numbers
- [ ] Dark mode testeado visualmente en ambos modos
- [ ] Reduced motion respetado si `MOTION_INTENSITY > 3`
- [ ] Una sola paleta de color en toda la página; sin palette drift entre secciones
