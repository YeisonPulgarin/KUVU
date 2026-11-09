stack: Angular 21, TypeScript, RxJS
test_command: ng test
test_mode: test-after
config_found: true
slices_declarados: [backend-orden, contenido, chrome, paginas, home, intro, cierre]
expone_api_http: true
docs_existentes: docs/

## Convenciones del frontend relevantes para próximos cambios

- `frontend/proyecto_angular/src/app/motion/`: piezas de movimiento reutilizables y sin
  dependencias. `motion-preferences.ts` es la única fuente de las media queries de movimiento
  en TS (`reducedMotion`, `finePointer`, `desktop`). Además están `ScrollMotionService`,
  `[appScrollProgress]`, `<app-split-text>` y `[appMagnetic]`. Los dobles de test
  (`matchMedia`, `requestAnimationFrame`, `IntersectionObserver`) están en `motion/testing/`.
- `ScrollMotionService` no es `providedIn: 'root'`: lo provee el componente que lo usa (hoy
  `HomeComponent`), así que el injector de ese componente lo destruye junto con sus listeners.
  Un componente que use `[appScrollProgress]` necesita un ancestro que lo provea.
- Movimiento: el JS publica variables CSS (`--p`, `--page-progress`, `--mx`/`--my`) y el CSS
  anima, siempre dentro de `prefers-reduced-motion: no-preference`. Los tokens de duración,
  curva y distancia están en `src/styles/_motion.scss`.
- Rutas del sitio público: llevan `data: { publicSite: true }` en `app.routes.ts`.
  `route-view-transition.ts` (transición propia entre páginas públicas, compuesta con el salteo
  de la intro) y `anchor-smooth-scroll.ts` solo actúan entre rutas con ese flag.
- Estilos de componentes: evitá `@apply` de Tailwind cuando el componente va en el bundle
  inicial. Tailwind v4 lo expande con fallbacks y un bloque `@layer properties` en cada
  componente, y el presupuesto inicial es ajustado.
- Tokens de marca del sitio público (`--color-brand-*`, `--color-home-*`, `--radius-*`): se
  declaran en el bloque `@theme static` de `src/styles.css`, así que Tailwind los emite siempre
  en `:root` aunque ninguna utilidad los use. Los overrides oscuros están en `.dark` del mismo
  archivo. Los componentes los consumen con `var(--token)`, sin fallback literal, y sus nombres
  pueden escribirse tal cual en `.ts`/`.html` (el escaneo de Tailwind no cambia lo que se emite).
  Un token nuevo de marca va en ese bloque, no en un `:root` aparte.
- Sitio público expresivo: los titulares usan `--font-display` (Big Shoulders Display,
  autohospedada en `public/fonts/` con `@font-face` en `styles.css`). Una fuente display nueva
  se autohospeda; nunca se agrega con `@import` de Google en un componente (se incrusta y
  dispara `css-inline-fonts`). La escala fluida (`--text-display-xl/l/m`, `--text-lead`,
  `--text-body-site`) está en `@theme static`.
- `src/styles/_site.scss` concentra las primitivas del sitio público: `.site-root` (raíz de
  home y `app-public-page`: cuerpo fluido y grano fijo), `.surface-dots`, `.surface-tint`,
  `.block-brand` (texto en el alias `--color-on-brand`), `.display-title(--xl|l|m)`, `.tape`,
  `.btn-site(--ghost)`, `.site-section`, `.site-cta`. Los botones "Ingresar" conservan
  `.btn-primary` azul.
- Titulares con énfasis: `content/headlines.ts` (`Headline`, `HeadlinePart`) y
  `<app-headline>`. La invariante `headlineText(parts) === title` está testeada: partir un
  titular no cambia sus palabras.
- Las páginas rediseñadas no usan eyebrows numerados (`.section-eyebrow` queda solo en
  `/legal`). Los specs que cambian el tema limpian `kuvu-theme` y `.dark` en `afterEach`.
