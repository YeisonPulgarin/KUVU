# Explore — breadcrumb-y-cta-legible

Pedido: "Necesito que agregues breadcrumb en la página, arregla también el fondo de la parte de
'listo para administrar también tus inmobiliarias', es que no se ve muy legible."

Stack según `sdd/sdd-init.md` y `sdd/sdd.config.md`: Angular 21 (standalone, rutas lazy) +
Tailwind CSS v4.3 (`@theme` en `src/styles.css`, `@reference` en los SCSS de componentes).
Tests: Karma/Jasmine, modalidad `test-after`.

## 1. Sección "¿Listo para administrar tus inmobiliarias?"

### Dónde está

- `frontend/proyecto_angular/src/app/components/home/home.component.html` (l. 178-185):
  `<section class="cta-final">` con `h2` "¿Listo para administrar tus inmobiliarias?", el
  párrafo "Ingresá a tu cuenta y gestioná todas tus compañías desde un solo lugar." y el botón
  "Ingresar". El texto real no incluye "también"; es la única sección con ese título.
- Estilos: `home.component.scss` (l. 378-415), bloque `.cta-final`:
  `background-color: var(--color-brand-700)` **sin fallback**, `color: #fff`, `p` en
  `rgba(255,255,255,.85)`.
- Tema: `ThemeService` (`src/app/services/theme.service.ts`) alterna la clase `.dark` en
  `<html>`; modo claro = sin clase (default). No existe `data-theme`.
- Test existente: `home.component.spec.ts` l. 163 verifica el texto del CTA final.

### Causa: el fondo de la banda depende de un token que Tailwind emite de casualidad

Tailwind v4 emite al `:root` solo las variables de `@theme` cuyo nombre encuentra en los
archivos que escanea. Los usos `var(--color-brand-700)` dentro de los SCSS de componentes
(`@reference`) no alcanzan para que lo emita. En el árbol de trabajo actual el token aparece
porque su nombre figura en comentarios de los archivos nuevos de `team-band/`
(`team-band.component.scss` l. 11 y `team-band.component.spec.ts` l. 29-32), que todavía no
están commiteados. En el código commiteado (HEAD) esos archivos no existen y el token no se
emite.

Sin `--color-brand-700`, `.cta-final` queda con fondo transparente: se ve el `#f0f4f8` del
`body` (`.home-layout` tampoco tiene fondo en modo claro porque `--color-home-bg` tampoco se
emite) y el texto blanco queda sobre gris azulado claro.

### Mediciones (Chrome headless vía CDP, `prefers-color-scheme` emulado, estilos computados)

| Fuente | Tema | `--color-brand-700` | Fondo `.cta-final` | `h2` | `p` |
|---|---|---|---|---|---|
| HEAD (`git archive` + `ng build`) | claro, 1440 y 390 | no definido | transparente → `#f0f4f8` | blanco, **1.11 : 1** | **1.09 : 1** |
| HEAD | oscuro | no definido | transparente → `#141a14` | 17.68 : 1 | 12.98 : 1 |
| Árbol de trabajo, `ng build` | claro / oscuro | `#2f4a2f` | `#2f4a2f` | 9.81 : 1 | 7.63 : 1 |
| Árbol de trabajo, `ng serve` | claro / oscuro | `#2f4a2f` | `#2f4a2f` | 9.81 : 1 | 7.63 : 1 |

Lo que ve el usuario en modo claro (titular y párrafo casi invisibles, botón azul visible)
coincide exactamente con la captura de HEAD en modo claro. En modo oscuro se lee porque el
fondo de la home es `#141a14`. Mínimos AA: 3 : 1 para el `h2` (texto grande) y 4.5 : 1 para
el `p`.

Capturas en el scratchpad de la sesión: `head-cta-1440.png`, `head-cta-390.png`,
`head-cta-1440-dark.png` (HEAD); `cta-1440.png`, `cta-390.png`, `cta-1440-dark.png`
(build del árbol de trabajo); `dev-cta-*.png` (`ng serve`); datos en `head-measure.json`,
`cta-measure.json`, `dev-measure.json`.

### Banda del equipo (`team-band`): no está en riesgo

`team-band.component.scss` l. 14 define `--team-band-green: var(--color-brand-700, #2f4a2f)`
con fallback, y su spec cubre ese caso. Aunque el token deje de emitirse, la banda del equipo
mantiene el verde. Los que dependen del token **sin** fallback son `.cta-final` (fondo),
`.cta-final .cta-button` (color de texto), `.hero-cta` (fondo, tapado hoy por el gradiente
de `.btn-primary`) y dos reglas de `site-header.component.scss` (l. 84 y 167).

### Otros tokens ausentes en modo claro (contexto, fuera del pedido)

En el `:root` del build solo existen `--color-brand-700` (de casualidad) y
`--color-brand-500`. No existen en modo claro `--color-brand-600/300/200/100`,
`--color-home-*` ni `--radius-*` (68 usos en SCSS de componentes). Por eso la home en claro
usa el `#f0f4f8` del `body` en lugar de `#f6f7f4`.

## 2. Breadcrumb

### Qué existe hoy

- No hay ningún breadcrumb ni componente parecido (`grep -i breadcrumb` en `src/` y `docs/`
  sin resultados).
- Rutas (`src/app/app.routes.ts`):

| Ruta | Componente | Tipo | Layout / cabecera | `title` de ruta |
|---|---|---|---|---|
| `/` | `HomeComponent` | pública | `app-site-header` + hero | no |
| `/nosotros` | `pages/nosotros` (lazy) | pública | `app-site-header` + `.page-hero` con `h1` | "Nosotros · KUVU" |
| `/preguntas-frecuentes` | `pages/preguntas-frecuentes` (lazy) | pública | `app-site-header` + `.page-hero` con `h1` | "Preguntas frecuentes · KUVU" |
| `/acceder` | `LandingComponent` | pública (selección de acceso) | layout propio, sin site-header | no |
| `/login` | `LoginComponent` | pública | layout propio | no |
| `/dashboard` | `DashboardComponent` | autenticada | `app-sidebar` + `main-content`, `h1` propio | no |
| `/contratos`, `/pagos`, `/mantenimiento` | lazy | autenticada | `app-sidebar` + `h1` con emoji y texto según rol | no |
| `/locales`, `/usuarios` | lazy | solo admin | `app-sidebar` + `h1` | no |

- No existe una página "Servicios": "Servicios" es un ancla de la home (`#servicios`), igual
  que "Cómo funciona", "Beneficios", etc. (`content/site.ts`, `navLinks`).
- Jerarquía real: todas las rutas son de un solo nivel (no hay rutas anidadas ni detalle por
  id). Un breadcrumb hoy tiene como máximo dos niveles: "Inicio › Nosotros" o
  "Dashboard › Contratos".
- Piezas reutilizables: `pageNavLinks` en `content/site.ts` (etiquetas y rutas de las páginas
  públicas), `title` en las rutas públicas, `PageMetaService`
  (`src/app/services/page-meta.service.ts`). El módulo de gestión no declara `title` ni `data`
  en sus rutas, y su estilo usa los tokens azules (`--color-primario`), no los verdes.

### Archivos relevantes

| Archivo | Rol |
|---|---|
| `src/app/app.routes.ts` | rutas; lugar natural para `data: { breadcrumb }` o `title` |
| `src/app/content/site.ts` | `pageNavLinks`, etiquetas de páginas públicas |
| `src/app/components/pages/nosotros/nosotros.component.html` | `.page-hero` donde iría el breadcrumb |
| `src/app/components/pages/preguntas-frecuentes/*.html` | ídem |
| `src/app/components/public/site-header/` | cabecera pública (alternativa de ubicación) |
| `src/app/components/shared/sidebar/` | navegación del módulo de gestión |
| `src/app/components/{dashboard,contratos,pagos,mantenimiento,locales,usuarios}/*.html` | cabeceras `h1` del módulo de gestión |
| `src/app/components/home/home.component.{html,scss}` | `cta-final` |
| `src/app/components/shared/shared.styles.scss` | `.btn-primary` global (gradiente azul) |
| `src/styles.css` | `@theme` con los tokens de marca |
| `docs/architecture.md`, `DEVELOPMENT_GUIDELINES.md` | convenciones del clúster público |

## 3. Decisiones del Gate A

| # | Tema | Decisión |
|---|---|---|
| 1 | Páginas con breadcrumb | Solo `/nosotros` y `/preguntas-frecuentes` (B1). Sin breadcrumb en `/`, `/acceder`, `/login` ni en el módulo de gestión |
| 2 | Ubicación y formato | Dentro de `.page-hero`, arriba del `h1`. Separador "›". Raíz "Inicio" → `/`. Último ítem = página actual (`aria-current="page"`), dentro de `<nav aria-label>` + `<ol>` |
| 3 | Problema de legibilidad | El texto (`h2` y `p`) de `.cta-final` en modo claro. El botón no es el problema |
| 4 | Botones | No se tocan: ni el CTA final, ni `.hero-cta`, ni el header. El arreglo se limita al fondo/texto de la banda `.cta-final` |
| 5 | JSON-LD | Sí: `BreadcrumbList` en `/nosotros` y `/preguntas-frecuentes`. Reutilizar `PageMetaService` (`setPage(title, description)` con `Title`/`Meta`) si encaja, extendiéndolo para inyectar y retirar el `<script type="application/ld+json">` |

### Arreglo mínimo candidato para la banda (a fijar en propose/design)

En `.cta-final`: `background-color: var(--color-brand-700, #2f4a2f)`, con el mismo patrón de
fallback que `team-band`, más un test de regresión que compruebe el fondo verde con el token
ausente. Resultado esperado en modo claro: `h2` 9.81 : 1 y `p` 7.63 : 1. El color del texto
del botón (`var(--color-brand-700)`) queda fuera por la decisión 4.

Pendiente para propose: si se quiere además que Tailwind emita siempre los tokens
(`@theme static` o valores en `:root`). Sería el arreglo de raíz, pero cambia la home entera
en modo claro (fondo `#f6f7f4`, hovers, radios) y quedaría fuera del alcance acordado.

### Breadcrumb: piezas existentes

- `pageNavLinks` en `content/site.ts` tiene etiquetas y rutas de las dos páginas.
- `PageMetaService` ya se llama desde `nosotros.component.ts` (l. 36) y
  `preguntas-frecuentes.component.ts` (l. 30).
- Componente nuevo propuesto: `components/public/breadcrumb/`, siguiendo las convenciones del
  clúster público de `docs/architecture.md`.
