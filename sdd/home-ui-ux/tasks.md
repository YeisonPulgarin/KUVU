# Fase Tasks: Home UI/UX — aplicar estrictamente las reglas de diseño

## Lista de Tareas Atómicas

Orden estricto de dependencia. Modalidad de tests acordada: `test-after` (tests escritos
antes de cerrar la tarea que toca el componente).

1. **Tokens globales y tipografía (`styles.css` + `index.html`)**
   - Importar **Geist** (400–800) en `styles.css`; `--font-sans: "Geist", ...`.
   - Definir paleta `@theme`: escala verde KUVU (`--color-brand-700/600/500/300/200/100`),
     neutros light, overrides `.dark` (superficies y brand-500 aclarado).
   - `@custom-variant dark (&:where(.dark, .dark *));`
   - Radios documentados como comentario en `@theme` (`--radius-pill/card/icon`).
   - `:focus-visible` global (outline 2px `--color-brand-500`, offset 2px).
   - Script inline de tema (no-flash) en `index.html` antes del bootstrap.
   - *Verificación:* `ng build` compila sin errores de Tailwind; grep de Plus Jakarta Sans
     da 0 resultados.

2. **Dark mode en el componente (`home.component.ts`)**
   - Propiedad `isDark`, método `toggleTheme()`: lee/persiste `localStorage('kuvu-theme')`
     (`'dark' | 'light'`, default claro) y aplica/remueve clase `dark` en
     `document.documentElement`.
   - Inicializar el estado al `ngOnInit` desde `localStorage`.
   - `private prefersReducedMotion = matchMedia('(prefers-reduced-motion: reduce)')` para el
     gating de reveals (se consume en tarea 6).
   - *Verificación:* unit tests de `toggleTheme()` (persistencia + clase en
     `documentElement`) en `home.component.spec.ts`.

3. **Reestructura del template (`home.component.html`)**
   - Hero: titular sin em-dash ("KUVU." + titular), sin eyebrow, subtítulo, CTA "Ingresar".
   - Navbar: CTA "Mi cuenta" → "Ingresar"; botón de tema (sol/luna, `aria-label`);
     mantener `#hamburger-toggle`, `#mobile-menu`, `[class.hidden]`, `aria-expanded`.
   - Servicios: split `{grid lg:grid-cols-[1fr_1.5fr]}` con lista `divide-y` de 5 filas
     (ícono + título + descripción), atributos `[data-reveal]` en los items.
   - Compañías: wordmarks tipográficos (4 empresas) con `[data-reveal]` en el grupo.
   - CTA final: botón "Ingresar" (label unificada).
   - Copy audit: sin em-dash/en-dash en strings visibles; sin verbos de relleno.
   - *Verificación:* tests de estructura existentes ajustados (hero, secciones, CTA,
     compañías, navbar).

4. **Estilos rediseñados (`home.component.scss`)**
   - Aplicar tokens (`@apply text-[color:var(--color-text)]` o utilidades con las nuevas
     variables); radios pill/card/icon; secciones `py-20`→`py-32`/`py-44`; contenedor
     `max-w-6xl`.
   - Hero: fondos con tintes de marca (sin gradientes decorativos AI); CTA `--color-brand-700`
     + texto blanco.
   - Servicios lista `divide-y` con hairlines `--color-brand-200/12%`; sin cajas/sombra.
   - Compañías wordmarks con tratamiento tipográfico por nombre.
   - CTA final sobre `--color-brand-700`/dark surface coherente.
   - Verificar contraste AA en pares definidos por design.
   - *Verificación:* revisión visual estática + build sin warnings de budget (si el budget
     se dispara, ajustar `angular.json` documentándolo).

5. **Animaciones (CSS + IntersectionObserver en `home.component.ts`)**
   - Hero entrance: keyframes `rise-in` con stagger (`.hero-title`, `.hero-subtitle`,
     `.hero-cta`) bajo `@media (prefers-reduced-motion: no-preference)`.
   - Reveals: IO en `ngAfterViewInit` observa `[data-reveal]`; agrega `.is-visible` al entrar
     al viewport; stagger vía `--reveal-index`; si reduced-motion, agrega `.is-visible`
     directo sin animar.
   - Hovers: solo `transform` (translateY(-2px)) + color, `0.2s cubic-bezier(0.16,1,0.3,1)`.
   - *Verificación:* en un navegador con `prefers-reduced-motion: reduce` el contenido es
     visible sin transiciones; en modo normal los reveals aparecen al scrollear. (Manual;
     tests no automatizan IO).

6. **Tests (`home.component.spec.ts`)**
   - Mantener/ajustar los 17 tests existentes a la estructura nueva (selectores
     conservados: `#hamburger-toggle`, `#mobile-menu`, `.hidden`, `.service-card` si cambia
     a filas → actualizar query a `.service-row`).
   - Nuevos tests: botón de tema (`toggleTheme`), tokens de la marca (grep de em-dash en el
     template renderizado para el titular: `textContent` sin `—`), label "Ingresar" en los 3
     CTAs.
   - *Verificación:* `ng test --watch=false --browsers=ChromeHeadless` en verde.

7. **Regresión final**
   - `ng build` (producción) compila.
   - Suite completa en verde.
   - Budget de `home.component.scss` dentro de límite o ajuste documentado.

## Slices Involucrados

El proyecto declara en `sdd.config.md` el slice `frontend` (Logo, responsive, eliminación de
kuvu_mobile) que **no** corresponde a este cambio. Este cambio se ejecuta como un único slice
implícito (`apply`) con las tareas 1–7. Se informa el desvío del default de la tabla: el slice
declarado pertenece al dominio de branding/responsive del cambio original `mejorar-home`; la
naturaleza del presente cambio (rediseño visual de la home con reglas de diseño) justifica
un slice propio sin tocar lo de `frontend`.

## Forecast de Riesgo

- **Líneas estimadas a cambiar:** ~350–500 (HTML ~220, SCSS ~350 reescrito, TS ~40, tests
  ~120, styles.css ~120, index.html ~6).
- **Archivos tocados:** 6 (`styles.css`, `index.html`, `home.component.ts`,
  `home.component.html`, `home.component.scss`, `home.component.spec.ts`).
- **Repositorios involucrados:** 1 (Frontend Angular).
- **Nivel de Riesgo:** **ALTO** (supera el umbral de 300 líneas del proyecto).
- **Estrategia de entrega configurada:** `ask-on-risk` → Gate C: pregunto antes de `apply`.

## Alcance Previsto para `document`

- `openapi_afectado`: **false** (no se exponen endpoints HTTP).
- `changelog_afectado`: **true** (cambio visual visible desde afuera: dark mode, Geist,
  rediseño home).
- `readme_afectado`: **false** (no cambia instalación, comandos ni descripción del proyecto).
- `architecture_afectado`: **false** (misma arquitectura de componentes; solo contenido
  visual del componente y tokens globales).
- `guidelines_afectado`: **true** (introduce convención nueva de stack: fuente Geist,
  sistema de tokens de marca en `@theme`, variant `dark:` por clase, escala de radios y
  regla de densidad Brand para secciones de marketing → candidato para
  `DEVELOPMENT_GUIDELINES.md` vía decisión del orquestador).