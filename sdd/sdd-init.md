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
