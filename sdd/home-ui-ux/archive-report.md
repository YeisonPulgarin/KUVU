# Archive Report — home-ui-ux

**Estado:** CERRADO (completo — todas las fases del núcleo + `secure` + `refine`)
**Fecha de cierre:** 2026-09-21
**Almacenamiento:** `files` (sin push de memoria; artifacts en `sdd/home-ui-ux/`)
**Extensión `git`:** inactiva → sin commit, sin push, sin PR (el usuario lo maneja por fuera)

## Qué se hizo

Rediseño visual y de experiencia de la página de inicio (`HomeComponent`, ruta `''`) sobre la
identidad de KUVU. El contenido y los destinos no cambiaron; cambió cómo se ve y se siente.

- **Tipografía:** Geist (400–800) como fuente del sistema, reemplazando Syne/Inter en la home.
- **Paleta:** una sola escala de verde de marca (`--color-brand-700/600/500/300/200/100`) con
  neutros tintados al verde para superficies de la home, más overrides en el bloque `.dark`.
- **Tema claro/oscuro:** botón manual sol/luna, preferencia persistida en `localStorage` y script
  inline anti-FOUC en `<head>`.
- **Animaciones:** entrance del hero (`rise-in`, con stagger) y reveals por `IntersectionObserver`
  sobre `[data-reveal]`, todo bajo `prefers-reduced-motion`.
- **Estructura:** hero, navbar + drawer móvil, servicios en split con lista `divide-y` (sin cards
  idénticas), compañías como wordmarks, CTA final.
- **Copy y CTA:** eliminado el copy baneado (em/en-dash, itálicas); una única etiqueta "Ingresar"
  → `/acceder` en las cuatro apariciones.

## Qué se decidió

- **Gate A (usuario):** preservar el verde KUVU original como acento único; Geist; dark mode
  manual (no automático); reescribir el copy baneado.
- **Gate C:** 3 bloques de PRs encadenados secuencialmente (sin ramas; extensión `git` inactiva).
- **Un solo slice** de apply (`slice-unico`): el cambio no se dividió porque tocaba un único
  componente + tokens globales.
- **Micro-fix post-verify:** contraste de hover de texto movido a `brand-600` (AA) y radio del
  logo alineado a la escala (`rounded-icon` 12px).
- **Budget `anyComponentStyle`:** subido a 17 kB warning / 20 kB error (ya se disparaba antes del
  cambio; el warning remanente es de otras pantallas).

## Verificación

- **`verify` PASA** — 10/10 criterios de aceptación, sin desvíos pendientes. Re-verificación final
  posterior a `secure` + `refine`: verde.
- **Suite:** 60/60 SUCCESS (58 base + 2 tests de regresión de storage). `ng build` compila. Sin
  dependencias nuevas.

## `secure` — acciones fuera del código y riesgo aceptado

- **Secretos a rotar: ninguno.** No hay PII, credenciales ni llamadas de red nuevas en el cambio.
- **Riesgo residual aceptado (informativo, sin acción en este cambio):**
  - Script inline en `index.html` es incompatible con una CSP estricta que prohíba `'unsafe-inline'`.
    Si el proyecto endurece CSP, el script debe moverse a un archivo o hashearse. Aceptado por el
    usuario para esta fase; a revisar cuando se configure CSP.
  - La fuente Geist se carga desde Google Fonts (origen externo). Una CSP o política de privacidad
    estricta requerirá self-hosting. Aceptado como decisión de diseño.
- **Fix aplicado (código):** guards `try/catch` en torno a `localStorage` (`readStoredTheme()` /
  `persistTheme()`), sin cambio de comportamiento observable. Control deliberado, no simplificar.

## `refine` — deuda técnica residual y lo deliberadamente no tocado

**Aplicado:** borrado de las variables SCSS muertas `$brand-*` (−5 líneas + comentario engañoso).
Comportamiento idéntico; métricas neutrales.

**Deliberadamente NO tocado:**

- Mixin para las 4 apariciones de `.btn-primary` — KISS: las variantes difieren en tamaño y color
  por contexto; un mixin parametrizado cambia CSS explícito por indirección con args.
- Nav links duplicados entre desktop y drawer (2 repeticiones) — Regla de Tres.
- `--radius-card`, `--color-brand-200`, `--color-brand-300` sin uso — forman parte de la escala
  documentada del sistema.
- Literal `'kuvu-theme'` duplicado entre `index.html` y el componente — son dos runtimes distintos.
- Guards de `localStorage` de `secure` — son un control deliberado.

**Deuda residual registrada:** extraer los nav links a un array cuando la lista cambie una tercera
vez; revisar la base de botón pill si aparece un quinto contexto.

## Documentación (`document-report`)

- **`docs/home-ui-ux.md`** — creado: describe el sistema resultante (tokens, tema, animaciones,
  estructura), decisiones y limitaciones conocidas.
- **`CHANGELOG.md`** — entrada bajo `[Unreleased]`: `Added` (botón de tema con preferencia
  persistida y sin destello) y `Changed` (rediseño con identidad KUVU; única CTA "Ingresar").
- **`docs/architecture.md`** — sin cambios: el cambio es interno al `HomeComponent`, no altera la
  arquitectura. (Sigue siendo el template del instalador sin completar — brecha pre-existente.)
- **OpenAPI / colecciones Bruno** — no aplica: el proyecto no expone API HTTP.
- **`README.md`** — no aplica: el repo no tiene README y el cambio no altera instalación, comandos,
  variables de entorno ni requisitos.
- **`DEVELOPMENT_GUIDELINES.md`** — sin cambios en el documento. **Desvío reportado:** el cambio
  fija convenciones que el template no cubre (Geist; tokens `@theme` + escala de radios; dark mode
  por clase `.dark` + anti-FOUC; densidad de secciones; patrón `[data-reveal]`). Si el usuario
  quiere que sean regla oficial, entran como cambio nuevo por `spec`.

## Pendientes / observaciones

- **Convenciones a guidelines:** el desvío de arriba queda pendiente de decisión del usuario
  (nuevo work item por `spec`).
- **`sdd.config.md` con drift:** el comando de test apunta a `fronted/proyecto_angular`, que no
  existe; el real es `frontend/proyecto_angular`. Corregir la config.
- **`DEVELOPMENT_GUIDELINES.md`** sigue siendo el template sin adaptar (placeholders y secciones
  Go/Next/Astro). Pre-existente.
- **`sdd/mejorar-home/`** (cambio anterior) está verificado y documentado pero **sin archivar**:
  queda pendiente de su propia fase `archive`.
- Verificación visual en navegador real (320–1920px) no automatizada; la suite cubre
  comportamiento, no layout.

## Artifacts del cambio

```
sdd/home-ui-ux/
├── explore.md
├── propose.md
├── spec.md
├── design.md
├── tasks.md
├── apply-progress/
│   └── slice-unico.md
├── verify-report.md
├── secure-report.md
├── refine-report.md
├── document-report.md
└── archive-report.md
```
