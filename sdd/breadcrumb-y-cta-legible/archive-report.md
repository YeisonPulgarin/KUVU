# Archive report — breadcrumb-y-cta-legible

**Estado: cerrado.** Almacenamiento `files`: todos los artifacts están en
`sdd/breadcrumb-y-cta-legible/` y son consistentes entre sí. No hay memoria compartida que
sincronizar. Extensión `git` inactiva: **sin commits**. El cambio queda en el working tree,
compartido con `home-imagen-equipo` (ver la tabla de hunks).

**Secretos a rotar: ninguno** (`secure-report.md`).

## Qué se hizo

1. **Banda final de la home legible en modo claro.** `.cta-final` tiene fondo
   `var(--color-brand-700, #2f4a2f)`. La causa era que Tailwind v4 emite ese token solo de
   forma incidental: en el código commiteado no lo emite, y el texto blanco quedaba sobre
   `#f0f4f8` a 1.1 : 1. Medido después: titular 9.81 : 1, párrafo 7.63 : 1.
2. **Botón "Ingresar" de esa banda:** azul (gradiente de `.btn-primary`) con texto blanco:
   reposo ≥ 4.72 : 1, hover ≥ 5.03 : 1, foco blanco a 9.81 : 1. Hero y header no cambian.
3. **Breadcrumb** "Inicio › {Página}" en `/nosotros` y `/preguntas-frecuentes`
   (`app-breadcrumb`, accesible), con **JSON-LD `BreadcrumbList`** único vía
   `PageMetaService`, URLs absolutas sobre `location.origin`, que se retira al salir de la
   página.

Ciclo recorrido: explore → propose → spec → design → tasks → apply ×2 (`cta-banda`,
`breadcrumb`) → verify (PASA, 15/15, 178/178 tests, build OK) → secure (sin vulnerabilidades
confirmadas, sin cambios) → refine (sin cambios necesarios) → document. No se re-corrió
`verify` tras secure/refine porque ninguna de las dos modificó código (regla del Gate E). Lo
que vino después de verify son solo cambios de documentación.

## Decisiones del usuario

| # | Decisión |
|---|---|
| Gate A | Breadcrumb solo en `/nosotros` y `/preguntas-frecuentes`, arriba del `h1`, separador "›", raíz "Inicio". JSON-LD sí. El problema de legibilidad es el texto de la banda en claro |
| D-1 | `home-imagen-equipo` no se archiva/commitea antes: los dos cambios conviven en el working tree |
| D-2 | URLs del JSON-LD con `window.location.origin` (sin dominio de producción) |
| D-3 | Botón "Ingresar" de `cta-final`: azul con texto blanco. Hero y header sin tocar |
| Gate C | Dos slices: `cta-banda` (T1-T2) y `breadcrumb` (T3-T9) |
| Gate E | `ambas` (secure + refine) |
| H-1 | "Actualizar después" |
| Docs | Opción (a): corregir el párrafo desactualizado de `home-imagen-equipo` en `docs/architecture.md` y la línea 106 de `docs/home-imagen-equipo.md` |

## Documentación (de `document-report.md`)

| Destino | Estado |
|---|---|
| `docs/breadcrumb-y-cta-legible.md` | nuevo |
| `docs/architecture.md` | actualizado: clúster público, navegación pública, tres decisiones estructurales, límites. Además corrige el párrafo de tokens de `home-imagen-equipo` (hunk mixto) |
| `docs/home-imagen-equipo.md` | línea 106 corregida (archivo no trackeado, viaja con `home-imagen-equipo`) |
| `CHANGELOG.md` | `[Unreleased]` → Added (breadcrumb + BreadcrumbList) y Fixed (banda y botón legibles) |
| `README.md` | no aplica: no cambian instalación, comandos, requisitos ni la descripción |
| OpenAPI / Bruno | no aplica: el cambio no toca endpoints HTTP |
| `DEVELOPMENT_GUIDELINES.md` | sin cambios: no hay convención nueva de código |

## Pendiente (trabajo consciente no hecho)

### Deuda y acciones fuera del código

- **Actualizar `@angular/*` a ≥ 21.2.24** (H-1, `secure-report.md`). Aviso alto
  GHSA-ff3f-86qr-9cv3 (DoS en SSR) sobre `@angular/router` 21.2.23. Hoy no es alcanzable (SPA
  sin SSR). Decisión del usuario: "actualizar después". Prioridad **baja** sin SSR, **alta** si
  se incorpora SSR o prerender. Cambio aparte: todos los paquetes a la misma versión de parche,
  más suite y build.
- **Arreglo global de tokens de Tailwind v4.** En modo claro no se emiten `--color-home-*`,
  `--radius-*` ni `--color-brand-100/200/300/600`, y `--color-brand-700` aparece solo de forma
  incidental. Hoy se compensa con fallbacks locales (`cta-final`, `team-band`, breadcrumb). El
  arreglo de raíz (`@theme static` o valores en `:root`) cambia la home entera en modo claro
  (fondo `#f6f7f4` en lugar de `#f0f4f8`, hovers, radios). Cambio propio.
- Riesgo residual aceptado: H-1 mientras no se actualice. Lo aceptó el usuario.

### Deliberadamente no tocado (de `refine-report.md`)

`DOCUMENT` desde `@angular/common`, `RouterModule` en lugar de `RouterLink`, helper común de
tests de breadcrumb (dos repeticiones), servicio genérico de datos estructurados, escape de
`<` en el JSON-LD (no hay SSR), estilos defensivos del breadcrumb, chequeo `page === home` en
`breadcrumbFor` y el override de `transition` del botón. Cada uno lleva su motivo en el reporte.

### Pendientes manuales (de `verify-report.md`)

1. Confirmar visualmente en `ng serve`, en modo claro, que la banda `cta-final` se lee (recargar
   sin caché).
2. Probar con lector de pantalla (NVDA/Narrador) que el breadcrumb se anuncia como navegación
   "Ruta de navegación" con la página actual, sin leer el separador.
3. Validar el JSON-LD con la herramienta de resultados enriquecidos cuando haya dominio público.

### Limitaciones conocidas

- JSON-LD con URLs del origen local hasta que exista dominio. Sin SSR, existe después del render
  en el cliente.
- El foco del breadcrumb en claro usa el contorno global: 3.33 : 1, cerca del mínimo.
- El contraste del botón en reposo (4.72 : 1) depende de `--color-secundario`.

## Hunks para commitear por separado de `home-imagen-equipo`

Estado del `git diff HEAD -U0` al archivar. Todos los hunks marcados se separan con
`git add -p`. Recomendación: commitear primero `home-imagen-equipo` y después este cambio.

| Archivo | Hunks de **breadcrumb-y-cta-legible** (lado nuevo) | Hunks de **home-imagen-equipo** |
|---|---|---|
| `frontend/proyecto_angular/src/app/components/home/home.component.scss` | todos (`.cta-final`) | — |
| `frontend/proyecto_angular/src/app/components/home/home.component.spec.ts` | `+318,40` | `+225,2`, `+229,49` |
| `frontend/proyecto_angular/src/app/components/pages/nosotros/nosotros.component.ts` | `+5,2`, `+20`, `+31` | `+9`, `+11`, `+23,2`, `+36` |
| `frontend/proyecto_angular/src/app/components/pages/nosotros/nosotros.component.html` | `+8` | `+26,14` |
| `frontend/proyecto_angular/src/app/components/pages/nosotros/nosotros.component.spec.ts` | `+119,27` | `+69,27` |
| `frontend/proyecto_angular/src/app/components/pages/nosotros/nosotros.component.scss` | — | todo (`+49,25`) |
| `CHANGELOG.md` | `+27`, `+45,5` | `+12,3` |
| `docs/architecture.md` | `+38,6`, `+86,2`, `+131,15`, `+156,5` | `+46,10`, `+80`; **mixto `+115,14`**: párrafo de `home-imagen-equipo` con la corrección de este cambio. Va completo con `home-imagen-equipo` (versión corregida) o se ajusta con `git add -p` → `e` |
| `docs/home-imagen-equipo.md` (no trackeado) | — (incluye la corrección de la línea 106) | todo |

Archivos **solo de este cambio**:

- `frontend/proyecto_angular/src/app/components/public/breadcrumb/` (nuevo: `.ts`, `.scss`,
  `.spec.ts`)
- `frontend/proyecto_angular/src/app/content/site.ts` (`breadcrumbFor`)
- `frontend/proyecto_angular/src/app/services/page-meta.service.ts` y `.spec.ts`
- `frontend/proyecto_angular/src/app/components/pages/preguntas-frecuentes/preguntas-frecuentes.component.{ts,html,spec.ts}`
- `docs/breadcrumb-y-cta-legible.md`
- `sdd/breadcrumb-y-cta-legible/`

Mensajes sugeridos (Conventional Commits): `fix(home): banda final legible en modo claro`
(slice `cta-banda`) y `feat(sitio): breadcrumb con JSON-LD en páginas públicas` (slice
`breadcrumb` + docs).

## Artifacts del cambio

`explore.md`, `propose.md`, `spec.md`, `design.md`, `tasks.md`,
`apply-progress/cta-banda.md`, `apply-progress/breadcrumb.md`, `verify-report.md`,
`secure-report.md`, `refine-report.md`, `document-report.md`, `archive-report.md`. Las
capturas y mediciones de navegador están en el scratchpad de la sesión (fuera del repo).
