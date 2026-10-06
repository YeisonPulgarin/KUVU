# Document report — breadcrumb-y-cta-legible

```
docs_archivo: docs/breadcrumb-y-cta-legible.md (nuevo)
architecture: actualizado: "Clúster público" (page-meta.service + app-breadcrumb), "Navegación pública" (breadcrumb y JSON-LD en las páginas secundarias), "Decisiones estructurales" (patrón var(--token, valor), breadcrumb + JSON-LD desde una fuente, botones primarios con gradiente global y su dependencia de --color-secundario), "Límites y no-goals" (JSON-LD con origen local, deuda @angular/*)
guidelines: sin cambios (no hay convención nueva de código; el patrón de fallback de tokens se documenta en architecture como decisión estructural)
openapi: no aplica: el cambio no toca endpoints HTTP (sitio público sin API)
collections: no aplica: sin endpoints HTTP
changelog: entradas bajo [Unreleased]: Added (breadcrumb + BreadcrumbList) y Fixed (sección nueva: legibilidad de la banda final y de su botón)
readme: no aplica: no cambian instalación, comandos, requisitos ni la descripción del proyecto
desvios: ninguno entre design y código. Lo documentado refleja apply-progress (separador " › ", breadcrumbFor('/') lanza error, transición por opacity)
```

## Hunks de este cambio en archivos compartidos con `home-imagen-equipo` (D-1)

`git diff HEAD -U0` resultante. Todos los hunks de este cambio están separados de los previos
por al menos una línea sin cambios, así que `git add -p` los separa con `s`/`y`/`n`.

| Archivo | Hunks de **este cambio** (lado nuevo) | Hunks de `home-imagen-equipo` |
|---|---|---|
| `CHANGELOG.md` | `+27` (Added: breadcrumb), `+45,5` (sección `### Fixed`) | `+12,3` |
| `docs/architecture.md` | `+38,6` (page-meta + breadcrumb en el clúster público), `+86,2` (navegación pública), `+131,15` (tres decisiones estructurales), `+156,5` (límites). **Mixto:** `+115,14` (ver abajo) | `+46,10`, `+80`, `+115,14` (mixto) |

`docs/breadcrumb-y-cta-legible.md` es nuevo y enteramente de este cambio.

## Hunk mixto en `docs/architecture.md` (decisión del usuario: opción a)

El hunk de `home-imagen-equipo` con la decisión "Tokens de Tailwind v4 solo usados en
componentes no existen en runtime" afirmaba que faltaban `--color-brand-700/200/300` y que
`cta-final` dependía de la ausencia del token. Ya no era cierto. Por decisión del usuario se
corrige **dentro de ese hunk**, que ahora es `+115,14` y mezcla:

- el párrafo de `home-imagen-equipo` (la decisión, el ejemplo de `team-band` y el tradeoff), y
- la corrección de este cambio: la lista real de tokens ausentes en modo claro, que
  `--color-brand-700` se emite de forma incidental, `cta-final` como ejemplo de fallback en la
  declaración, y el tradeoff limitado a los CTA del hero y del header.

El párrafo no contradice ni duplica la decisión nueva de este cambio (hunk `+131,15`): remite a
ella para el patrón `var(--token, valor)`. Para commitear por separado: ese hunk va completo
con el commit de `home-imagen-equipo` (es su párrafo, en su versión corregida) o se ajusta con
`git add -p` → `e`. También quedó anotado en `sdd/home-imagen-equipo/document-report.md`.

Antes:

```
- **Tokens de Tailwind v4 solo usados en componentes no existen en runtime**: Tailwind emite al
  CSS global únicamente los tokens de `@theme` que usa (hoy faltan `--color-brand-700/200/300`).
  Un componente que depende de uno de ellos lo referencia con fallback literal en una custom
  property local (p. ej. `--team-band-green: var(--color-brand-700, #2f4a2f)` en `team-band`).
  Tradeoff: el valor se repite en ese punto, a cambio de no alterar los componentes que hoy
  dependen de la ausencia del token (CTA del hero, header y `cta-final`).
```

Después:

```
- **Tokens de Tailwind v4 solo usados en componentes no existen en runtime**: Tailwind emite al
  CSS global únicamente los tokens de `@theme` cuyo nombre encuentra en los archivos que escanea.
  En modo claro faltan `--color-home-*`, `--radius-*` y `--color-brand-100/200/300/600`, y
  `--color-brand-700` se emite solo de forma incidental (ver el patrón `var(--token, valor)` más
  abajo). Un componente que depende de uno de ellos lo referencia con fallback literal, en una
  custom property local (`--team-band-green: var(--color-brand-700, #2f4a2f)` en `team-band`) o
  en la propia declaración (fondo de `cta-final`). Tradeoff: el valor se repite en cada punto, a
  cambio de no alterar los CTA del hero y del header, que no llevan fallback y se ven con el
  gradiente de `.btn-primary`.
```

## Corrección en `docs/home-imagen-equipo.md` (decisión del usuario)

La línea 106 ("Limitaciones conocidas") de `docs/home-imagen-equipo.md` afirmaba que
`--color-brand-700/200/300` no existían en runtime para los CTA del hero, del header y de
`cta-final`. Ahora describe el estado actual: `--color-brand-700` se emite de forma
incidental, el fondo de `cta-final` usa valor de respaldo, y los CTA del hero y del header no
lo llevan y se ven con el gradiente de `.btn-primary`.

Hunk de corrección: el archivo **no está trackeado** (lo crea `home-imagen-equipo`), así que
no hay hunk separable. La corrección viaja completa con el commit de `home-imagen-equipo`.
Queda anotado en `sdd/home-imagen-equipo/document-report.md`.

## Estándar de tiempo presente

Verificado en `docs/breadcrumb-y-cta-legible.md` y en las adiciones a `docs/architecture.md`.
La única referencia a un estado anterior ("antes, texto verde oscuro sobre azul") está en
`CHANGELOG.md`, donde está permitida.
