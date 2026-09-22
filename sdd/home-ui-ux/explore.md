# Fase Explore: Home UI/UX — aplicar estrictamente las reglas de diseño

## Resumen de lo que existe hoy

La home page (`HomeComponent`, ruta `''`) está construida con Angular 21 standalone +
Tailwind CSS v4 (@tailwindcss/postcss) + SCSS con `@apply` y `@reference`. Tiene: navbar
(sticky, menú hamburguesa móvil, acciones), hero fullsize verde con gradientes radiales,
sección "¿Qué es KUVU?", sección "Servicios" (grilla de 5 tarjetas idénticas), sección
"Compañías" (4 pills de texto) y CTA final. No hay animaciones de entrada ni manejo de
`prefers-reduced-motion`.

Las reglas de diseño del proyecto son dos y se aplican obligatoriamente a todo UI/UX:
- `.agents/rules/frontend-design.md` (trigger: always_on) — brief de diseño distintivo.
- `.claude/skills/sds-design-taste/SKILL.md` — calidad visual anti-slop: color, tipografía,
  layout, movimiento, pre-flight check.

El cambio anterior `mejorar-home` (contenido + Tailwind) está verificado (17/17 tests) y
documentado pero **nunca archivado**; este cambio es nuevo.

## Hallazgos — violaciones de las reglas de diseño en el código actual

### Color (violadas)
- `.icon-btn.yellow` está pintado de verde (`$brand-green`) — nombre y uso inconsistentes.
- Coherencia de color: hero CTA usa `#2f4a2f` (4º verde "a mano"), distinto de los tokens
  `#6b8e6b`/`#547354`. Violación de "Color Consistency Lock" (un solo acento, escala única).
- Contraste WCAG AA probablemente insuficiente: botones `$brand-green` (oscuro) con
  `text-gray-900` (~3.2:1); `.cta-button` `text-gray-950` sobre `$brand-green-dark`.
- `em` del hero en `rgba(0,0,0,0.65)` sobre verde — contraste bajo.
- Estrategia de color no declarada; los grises no están tintados al hue de marca (neutros
  "fríos de Tailwind" puros, sin chroma hacia el verde).
- Gradientes radiales decorativos sobre el hero = "gradient washes as decoration" (AI-tell).

### Tipografía (violadas)
- Fuente global `Plus Jakarta Sans` **está en la lista de rechazo** de sds-design-taste.
- **Em-dash `—` en el titular del hero** ("KUVU — Administración inmobiliaria") — baneado en
  cualquier string visible; el output falla el Pre-Flight Check.
- **`<em>` en itálica sobre una frase del titular** ("para empresas que crecen") — patrón
  baneado ("accenting just a single word/phrase in a headline").
- Badge eyebrow `uppercase tracking-wide` — "all caps label" es tell de template chrome;
  además duplica el contenido del subtítulo (innecesario).

### Espaciado / densidad (violadas)
- `py-16`/`py-24` en secciones = densidad de web-app (4-7). La home es registro **Brand**:
  densidad default 2-4 → `py-32 a py-48` para las secciones de marketing.
- Escala de radio mezclada sin regla documentada: cards `rounded-xl`, pills `rounded-full`,
  íconos `rounded-lg` — violación de "Shape Consistency Lock" (elegir UN scale + regla).
- Hero centrado con título/CTA al medio = default "centered hero". Con VARIANCE ≥ 4 el
  hero centrado se evita salvo brief editorial/manifesto.

### Layout (violadas)
- **Grilla de "3 (y más) cards idénticas de features"** en la sección Servicios — patrón
  baneado expresamente. Debe reestructurarse (familia de layout distinta: rows con
  `divide-y`, columna de títulos + lista, o grid asimétrico).
- Compañías usadas como "wordmarks en texto plano" (pills grises) — la regla pide logo wall
  con logos reales o tratamiento tipográfico distintivo, no pills genéricos.

### Animaciones (violadas)
- Casi sin movimiento: solo hovers `0.2s` con easing por defecto (no
  `cubic-bezier(0.16,1,0.3,1)`). `MOTION_INTENSITY` para landing Brand = 6-8 → se declara
  "Motion claimed" y hoy no hay motion shown.
- Sin respeto a `prefers-reduced-motion` (obligatorio si intensity > 3).
- Sin un "momento orquestado" (hero entrance) — la regla pide un único momento, no
  fade+slide en cada sección.
- Transitions animan `transform + box-shadow`; deben ser solo `transform/opacity`.

### Otros
- **No Duplicate CTA Intent:** tres labels con la misma intención (acceder): "Mi cuenta"
  (navbar), "Acceder" (hero), "Ingresar a tu cuenta" (CTA final). La regla exige UNA label
  consistente en toda la página.
- Dark mode: la home es consumer-facing; la regla exige diseñar ambos modos
  (`prefers-color-scheme`). Hoy solo existe light.
- No hay `:focus-visible` explícito para accesibilidad de teclado (quality floor).

## Archivos relevantes

- `frontend/proyecto_angular/src/app/components/home/home.component.html` — estructura a
  rediseñar (199 líneas).
- `frontend/proyecto_angular/src/app/components/home/home.component.scss` — estilos a
  refactorizar (374 líneas, ya excede budget 10 kB → 15.61 kB).
- `frontend/proyecto_angular/src/app/components/home/home.component.ts` — estado del menú móvil.
- `frontend/proyecto_angular/src/app/components/home/home.component.spec.ts` — 17 tests
  (selectores `#hamburger-toggle`, `#mobile-menu`, `.hero-cta`, `.cta-button`, `.service-card`
  etc. que los tests dependen).
- `frontend/proyecto_angular/src/styles.css` — tokens globales `@theme` y fuente.
- `package.json` — `@angular/animations` ya está como dependencia (disponible sin instalar).

## Ambigüedades detectadas (Gate A)

1. **¿La paleta verde (`#6b8e6b` / `#547354`) es identidad de marca a preservar?** Las reglas
   exigen "una paleta por proyecto" y "Color Consistency Lock". Propongo mantener el verde de
   KUVU como acento único de marca (estrategia Committed en secciones de marketing), corregir
   los verdes desviados (`.yellow`, `#2f4a2f`) y tintar los neutros. ¿Confirmás que el verde
   es la identidad a preservar?
2. **Tipografía:** `Plus Jakarta Sans` está en la lista de rechazo (tell de IA). ¿Cambiamos la
   fuente global del proyecto (afecta `styles.css` y toda la app) a una fuera de la lista de
   rechazo, o la mantenemos por ser marca ya establecida y solo corregimos su uso?
3. **Copy del hero y CTAs:** el titular usa em-dash e itálica (baneados) y hay 3 labels de
   CTA con la misma intención. ¿Autorizás reescribir el copy visible (titular, subtítulo,
   labels de CTA unificadas)?
4. **Dark mode:** la home es consumer-facing y la regla lo exige. ¿Incluimos dark mode basado
   en `prefers-color-scheme` en este cambio, o lo dejamos fuera por ahora?