# Fase Design: Home UI/UX — aplicar estrictamente las reglas de diseño

## Arquitectura

El cambio se mantiene dentro del componente `HomeComponent` (single-component, standalone),
más los archivos de configuración global necesarios. No se crean componentes nuevos; se
agregan tokens, dark mode infra y un mecanismo de reveals en el propio componente.

### Archivos tocados

| Archivo | Cambio |
|---|---|
| `src/styles.css` | Tokens de marca (paleta verde + neutros tintados, light/dark), fuente Geist, `@custom-variant dark`, `:focus-visible` global, regla de radio documentada |
| `src/index.html` | Script inline de tema (no-flash): aplica `.dark` antes del bootstrap |
| `src/app/components/home/home.component.ts` | Estado de tema + `toggleTheme()`, persistencia `localStorage`, IntersectionObserver para reveals, `HostBinding`/clase en `<html>` |
| `src/app/components/home/home.component.html` | Reestructura de secciones (layout sin cards idénticas, wordmarks, CTA unificado, botón de tema) |
| `src/app/components/home/home.component.scss` | Rediseño de estilos con tokens; animaciones con la curva estándar; gating `prefers-reduced-motion` |
| `src/app/components/home/home.component.spec.ts` | Ajuste/ampliación de tests (test-after) |

## Sistema de tokens (fuente única: `styles.css @theme` + overrides `.dark`)

### Paleta — estrategia COMMITTED, acento único verde KUVU
Escala derivada de la identidad `#6b8e6b`/`#547354`, con variantes de contraste AA y variedad
imperceptible de hue hacia neutrales (regla de "neutros tintados"):

- **Verde de marca (acento único, 1 solo acento en toda la página):**
  - `--color-brand-700: #2f4a2f` — verde profundo (CTA primario / texto sobre claro)
  - `--color-brand-600: #3e5c40` — hover de CTA / superficies oscuras de acento
  - `--color-brand-500: #6b8e6b` — identidad preservada (bordes, íconos decorativos, badges)
  - `--color-brand-300: #a3bfa3`, `--color-brand-200: #cddccd`, `--color-brand-100: #e8efE8`
    — tintes de superficie y hairlines
- **Neutros tintados al verde** (light): `--color-bg: #f6f7f4`, `--color-surface: #ffffff`,
  `--color-surface-alt: #eef1ec`, `--color-text: #1f2920`, `--color-text-muted: #4c5a4e`
- **Dark (override `:root.dark`):** `--color-bg: #141a14`, `--color-surface: #1b231b`,
  `--color-surface-alt: #222c22`, `--color-text: #eef0ec`, `--color-text-muted: #a8b2a8`,
  `--color-brand-500` se aclara a `#7fa17f` para mantener contraste sobre oscuro

Los verdes fuera de escala (`#2f4a2f` queda como brand-700; `.yellow` pintado de verde se
elimina o pasa a un amarillo real no-saturado si existiera intención) se eliminan.

### Tipografía
`@import` de Google Fonts: **Geist** 400/500/600/700/800. `--font-sans: "Geist", system-ui,
sans-serif`. Todas las apps usan Geist (fuente del proyecto, cambio global).

### Radios — Shape Consistency Lock (regla documentada)
- Botones y pills interacctivos: `--radius-pill` = 9999px
- Cards / superficies grandes: `--radius-card` = 16px
- Íconos y micro-elementos: `--radius-icon` = 12px
Regla: "botones pill, cards 16, íconos 12" aplicada en toda la home. No hay `rounded` libres.

### Espaciado — densidad Brand
- Secciones de marketing: `py-32` (mobile `py-20`) → hasta `py-44` en desktop.
- Contenedor: `max-w-6xl mx-auto px-6` (mobile `px-4`).
- Escala de gaps: `gap-4` / `gap-6` / `gap-12` únicamente (sin valores sueltos `gap-8`↔`gap-10`
  alternados).

## Dark mode — clase `.dark` + persistencia

- Variant Tailwind v4: `@custom-variant dark (&:where(.dark, .dark *));` — activa por clase,
  no por `prefers-color-scheme` (decisión del usuario: botón manual).
- `index.html`: script inline `try { if (localStorage.getItem('kuvu-theme') === 'dark') {
  document.documentElement.classList.add('dark'); } } catch {}` antes del bootstrap — evita
  flash al recargar con preferencia dark.
- `HomeComponent`: campo `isDark` + `toggleTheme()`; al inicializar lee `localStorage`
  (default claro) y refleja la clase en `document.documentElement`; al alternar persiste
  `'kuvu-theme': 'dark' | 'light'`.
- Sin transición de color animada (la clase se aplica/remueve directo; evita flash y jank).

## Layout de secciones

### Hero (sin elementos baneados)
- Titular sin em-dash: `KUVU.` en línea de marca (weight 800) + `Administración inmobiliaria
  para empresas que crecen` como titular de 2 líneas max (weight 700), sin itálica.
- Badge eyebrow eliminado (duplica subtítulo; "all caps label" es tell).
- Subtítulo (≤ 20 palabras) + CTA único "Ingresar" → `/acceder`.
- Hero con variante VARIANCE respetada: layout centrado se permite aquí como excepción
  editorial breve (brief manifesto), con los elementos máximos permitidos (titular + subtítulo
  + 1 CTA). Se evita el "hero métrico", los taglines bajo CTA y los bullets.

### Servicios — familia de layout distinta (sale del patrón "N cards idénticas")
- Cambio a **split**: `grid lg:grid-cols-[1fr_1.5fr]`.
- Columna izquierda: título de sección + lead (anclaje tipográfico).
- Columna derecha: **lista con `divide-y`** (hairline verde-marca al 12%), 5 filas
  (ícono + título + descripción). Sin cajas con sombra: la jerarquía la da la línea divisoria
  y el peso tipográfico, no cards idénticas.
- Los 5 servicios se conservan (Gestión de locales, Contratos, Pagos, Mantenimientos,
  Usuarios) — cubierto por test.

### Compañías — wordmarks tipográficos
- Las 4 empresas (Amarilo, Nido Rent, Balcones de San Soucci, Mi Inmueble) como wordmarks
  tipográficos en grid `flex flex-wrap gap-x-12 gap-y-6`: cada nombre con tratamiento
  tipográfico (peso/extensión), sin pills grises, sin logos inventados, sin labels de
  categoría debajo.

### CTAs — label única "Ingresar"
- Navbar (desktop "Mi cuenta"→"Ingresar") + drawer móvil, hero CTA, CTA final: todos
  `routerLink="/acceder"` con texto "Ingresar". Un solo label, una sola intención.

### Navbar
- Altura 64px mobile / 80px desktop (dentro del cap de la regla).
- Botón de tema (sol/luna) junto a los íconos de acción; aria-label descriptivo.
- Se mantienen `#hamburger-toggle`, `#mobile-menu`, `[class.hidden]`, `aria-expanded`
  (selectores bajo test).

## Movimiento

- **Hero entrance (único momento orquestado):** keyframes `rise-in` (fade + translateY 12px)
  con stagger 0.06s en `.hero-title`, `.hero-subtitle`, `.hero-cta`; duración 0.6s, curva
  `cubic-bezier(0.16,1,0.3,1)`, relleno `both`; disparado una vez al cargar.
- **Reveal en scroll (solo la lista de servicios + grid de compañías, no todas las secciones):**
  `IntersectionObserver` en el componente agrega `.is-visible` a los items con `[data-reveal]`;
  CSS transición de `opacity`/`transform` con stagger por `--reveal-index`. Los reveals son
  puntuales (2 zonas), no fade+slide genérico por cada sección.
- **Hovers:** CTA y elementos interactivos transicionan solo `transform` (translateY -2px) +
  `opacity`/color, 0.2s curva estándar. Sin box-shadow animada (perf).
- **Reduced motion obligatorio:** todo bloque de animación va bajo
  `@media (prefers-reduced-motion: no-preference) { ... }`; en `reduce`, los elementos
  `[data-reveal]` quedan visibles por clase base (`.is-visible`) y el hero se muestra sin
  keyframes. En JS: si `prefers-reduced-motion` está activo, el IntersectionObserver solo
  agrega `.is-visible` sin observación (o se agrega directamente).

## Accesibilidad

- `:focus-visible` global: outline 2px `--color-brand-500` offset 2px en `styles.css`.
- Contraste: CTA primario = `--color-brand-700` bg + `#fff` text (≈10:1); texto muted =
  `--color-text-muted` sobre `--color-bg` con ≥ 4.5:1 verificado en design time.
- `aria-label` en botón de tema, íconos y hamburguesa.

## Alternativas descartadas

- **Satoshi / Cabinet Grotesk (Fontshare):** descartadas por requerir CDN nuevo; Geist cumple
  la misma función vía Google Fonts ya usada.
- **Dark por `prefers-color-scheme`:** descartado por decisión del usuario (botón manual);
  la clase `.dark` + script inline evita flash igualmente.
- **GSAP / Motion para reveals:** descartado (sin dependencias nuevas; IntersectionObserver +
  CSS cubre el alcance; reduced-motion trivial).
- **Bento grid para servicios:** descartado por riesgo de "X cards blancas sobre blanco"
  (regla Bento Diversity); el split + list divide-y es más distintivo y sin cajas.
- **Simple Icons para logos de compañías:** descartado (no son marcas con iconos públicos;
  wordmarks tipográficos son honestos).
- **@angular/animations (BrowserAnimationsModule):** no se usa; CSS animations + IO alcanzan
  y evitan bundle nuevo.

## Justificación de decisiones clave

- **Un solo acento:** la regla "Color Consistency Lock" manda: el verde KUVU es la identidad
  (preservada por el usuario); neutros tintados evitan el gris-frío genérico del template.
- **Split serviços + divide-y:** la regla banea explícitamente "N cards idénticas"; la lista
  dividida comunica estructura (información) sin decoración de cajas.
- **Inclusión del script en `index.html`:** es la única forma de no-flash con tema persisted;
  vive fuera del bundle y es trivial.
- **IntersectionObserver en el componente:** sin dependencias, respeta reduced-motion y
  mantiene el cambio contenido en el componente.