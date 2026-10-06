# Verify report — breadcrumb-y-cta-legible

Estado verificado: working tree con los dos slices aplicados (`cta-banda`, `breadcrumb`), sin
commits, conviviendo con los cambios sin commitear de `home-imagen-equipo`. Slices omitidos:
ninguno. Corrida inicial (ni `secure` ni `refine` corrieron todavía).

**Veredicto: PASA.** 15 / 15 criterios cumplidos, sin desvíos bloqueantes.

## Tests y build

| Chequeo | Comando | Resultado |
|---|---|---|
| Suite | `npx ng test --watch=false --browsers=ChromeHeadless` (con `CHROME_BIN` fijado) | **178 / 178 SUCCESS** |
| Build | `npx ng build` | OK. Único warning `css-inline-fonts` (19.14 kB > 17 kB), que ya existía antes de este cambio |

Cobertura declarada vs. corrida: los `tests_agregados` de `apply-progress/cta-banda.md` (4
tests) y `apply-progress/breadcrumb.md` (17 tests) están en la suite y pasan.
`excepciones_sin_test` está vacío en los dos slices, y todo el código de producción tiene test.
La prueba de mutación de CA-1 (sin el fallback, el test falla) está registrada en
`cta-banda.md`.

## Criterios de aceptación

| # | Resultado | Evidencia |
|---|---|---|
| CA-1 | pasa | `home.component.spec.ts` › 'cta final legible': con el token anulado, fondo `rgb(47, 74, 47)`. En el build, el mismo caso medido con CDP (`apply-1440-sintoken-*.png`) |
| CA-2 | pasa | Build, claro (1440 y 390): `h2` 9.81 : 1, `p` 7.63 : 1. Oscuro: igual |
| CA-2b | pasa | Test: texto `rgb(255, 255, 255)` y `background-image` con `linear-gradient`. Build: `linear-gradient(135deg, #2b4c8c, #3a6fd8)` |
| CA-2c | pasa | Reposo: mínimo 4.72 : 1 (extremo `#3a6fd8`), máximo 8.35 : 1. Hover: opacidad 0.92, mínimo 5.03 : 1. Foco real con Tab: ver tabla de foco |
| CA-3 | pasa | Tests de las dos páginas. Build: 8 casos (2 rutas × 1440/360 × claro/oscuro) con el breadcrumb antes del `h1` (`bc-*.png`) |
| CA-4 | pasa | `breadcrumb.component.spec.ts`: "Inicio" → `/`; último ítem sin enlace, con `aria-current="page"` |
| CA-5 | pasa | Spec: `nav[aria-label="Ruta de navegación"] > ol > li`, separador con `aria-hidden="true"` |
| CA-6 | pasa | Specs del servicio y de las páginas. Build: 1 script por página, `BreadcrumbList`, `position` 1-2, `item` absoluto sobre el origen (`http://127.0.0.1:4319/nosotros`) |
| CA-7 | pasa | Specs (destroy → script eliminado). Build: navegación SPA `/nosotros` → click "Inicio" → `/` sin recarga, scripts 1 → 0 |
| CA-8 | pasa | Spec de home: sin `nav` "Ruta de navegación" ni `application/ld+json` |
| CA-9 | pasa | Claro: enlace 13.61 : 1, separador 6.60 : 1. Oscuro: 14.05 y 7.37. A 360 px, `scrollWidth` = `innerWidth` = 360 |
| CA-10 | pasa | `git diff HEAD` vacío en `styles.css`, `styles.scss`, `components/shared/` (incluye `.btn-primary`) y `site-header/`. En `home.component.scss` ningún hunk toca `.hero-cta`: la única coincidencia con "hero" es un comentario dentro de `.cta-final` |
| CA-11 | pasa | 178 / 178 y build OK |
| CA-12 | pasa | Hunks registrados en `apply-progress/breadcrumb.md` y `cta-banda.md`. Contraste con el diff actual: 15 hunks en los 4 archivos compartidos, todos separados por líneas sin cambios |
| RF-5 | pasa | `setPage` sin cambios (test 'should not touch title or description'). `/acceder`, `/login` y gestión no importan el componente |

## Foco real por teclado (Tab), build actual

Capturas: `focus-breadcrumb-{light,dark}.png`, `focus-cta-{light,dark}.png`. Datos:
`focus-measure.json`.

| Elemento | Tema | `:focus-visible` | Contorno computado | Fondo detrás | Contraste del indicador |
|---|---|---|---|---|---|
| Breadcrumb "Inicio" (8.º Tab desde el inicio de `/nosotros`) | claro | sí | 2px sólido `#6b8e6b`, offset 2px | `#f0f4f8` | 3.33 : 1 (≥ 3) |
| Breadcrumb "Inicio" | oscuro | sí | 2px sólido `#7fa17f` | `#1b231b` | 5.61 : 1 |
| Botón "Ingresar" de `cta-final` (Tab desde el enlace anterior) | claro | sí | 2px sólido `#fff`, offset 3px | `#2f4a2f` | 9.81 : 1 |
| Botón "Ingresar" | oscuro | sí | ídem | `#2f4a2f` | 9.81 : 1 |

El indicador del breadcrumb en claro cumple con poco margen (3.33 contra 3.0). Viene del
contorno global de `styles.css`, que este cambio no toca.

## Ejes del protocolo

| Eje | Resultado |
|---|---|
| Documentación declarada | **Conforme.** `tasks.md`: documento del cambio sí, CHANGELOG sí, `docs/architecture.md` sí (breadcrumb y JSON-LD en el clúster público, patrón `var(--token, valor)` y dependencia del botón con `--color-secundario`), README no, OpenAPI/Bruno no aplica, `DEVELOPMENT_GUIDELINES.md` no. Aviso para `document`: `CHANGELOG.md` (+3) y `docs/architecture.md` (+22 −1) ya tienen cambios sin commitear de `home-imagen-equipo`, así que hay que aplicar la misma disciplina de hunks separados |
| Guidelines | **Conforme.** `DEVELOPMENT_GUIDELINES.md` no tiene sección de Angular (solo Go, Next.js y Astro). El código sigue las convenciones del clúster público de `docs/architecture.md`: componente standalone en `components/public/`, template inline como `team-band`, `@reference` en el SCSS, contenido en `content/site.ts`, servicio `providedIn: 'root'`. Naming en inglés en código y textos en español |
| Logs | **Conforme.** Sin logs agregados (`logs_conforme: sí` en los dos slices): cambio de UI sin operaciones observables |
| Control de tokens | **Conforme.** `--color-*` emitidos en el build idénticos a la línea base (11 declaraciones; ningún `--radius-*`). Un `grep` de `--color-`/`--radius-` en los `.ts`/`.html` nuevos o editados da sin resultados |

## Desvíos

Ninguno bloqueante. Desvíos de apply ya registrados y conformes con la spec:

- Transición del botón: `opacity` en lugar de `background-color` (cta-banda).
- Separador `" › "` con espacios, para que el texto plano se lea "Inicio › Nosotros". Sin
  impacto visual (breadcrumb).
- `breadcrumbFor('/')` lanza error (breadcrumb).
- `DOCUMENT` importado de `@angular/common` (breadcrumb). Candidato menor para `refine`.

Observaciones, fuera de alcance por decisión:

- El resto de tokens de Tailwind que faltan en modo claro (`--color-home-*`, `--radius-*`,
  `brand-100/200/300/600`) sigue igual. Este cambio usa fallbacks locales donde los necesita.
- El contraste del botón en reposo (4.72) depende de `--color-secundario`. Queda para
  `docs/architecture.md`.

## Pendientes manuales (no automatizables acá)

1. El usuario confirma visualmente en su entorno (`ng serve`, modo claro) que la banda
   `cta-final` se lee. Conviene recargar sin caché, porque el problema se reproducía en el
   código commiteado.
2. Prueba con lector de pantalla (NVDA o Narrador): el breadcrumb se anuncia como navegación
   "Ruta de navegación" con la página actual, y no lee el separador.
3. La validación del JSON-LD con la herramienta de resultados enriquecidos de Google no es
   posible sin dominio público: hoy las URLs son del origen local. Queda para cuando haya
   dominio.
