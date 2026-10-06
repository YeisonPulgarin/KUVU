# Archive report — home-imagen-equipo

**Estado:** cerrado. Verify en verde (corrida 2), documentado y sin commits: la extensión `git`
no está activa y el usuario no pidió commits. Almacenamiento: `files`; no hay memoria que
sincronizar.

## Qué se hizo

La foto del equipo YCW Systems (Wilson Solano, Carlos Arciniegas, Yeison Pulgarin) aparece en
el sitio público:

- **Home**: banda a ancho completo, "El equipo detrás de KUVU" (`#equipo`, entre `#companias` y `#origen`). En escritorio la foto va de fondo con un velo en verde de marca; en mobile se apila (foto 3:2 completa y texto sobre fondo verde). Lleva bajada, nombres y el link "Conocé al equipo" a `/nosotros`.
- **`/nosotros`**: la foto completa con los nombres al pie, entre "about" y "Origen".
- **Patrón reutilizable**: variantes `{base}-{640,1024,1536}.{webp,jpeg}` en `public/Imagenes_web/`, generadas con `scripts/generate-image-variants.py`; `SiteImage` en `content/` y el componente `app-responsive-image` (`<picture>` con carga diferida).

Slices: `imagen-base` (T1 a T5) e `imagen-ui` (T6 a T8, más la iteración 2 de corrección).
Tests: 157/157 en verde. Build OK; el único warning es el de fuentes inline, que ya existía.

## Decisiones clave

- Ubicación de la banda entre la prueba social y la historia del origen; layout apilado en mobile.
- Verde local con fallback (`--team-band-green: var(--color-brand-700, #2f4a2f)`), sin tocar el tema global. Decisión del usuario tras el verify fallido.
- Velo denso hasta el 60 % de la altura (contraste mínimo medido de 6.12:1) y encuadre `center 10%`, porque con 20-25 % el logo YCW seguía cortado a 1440 px.
- `<picture>` nativo en lugar de `NgOptimizedImage` / `background-image`; variantes generadas con Pillow, fuera del build.
- Banda extraída a `home/team-band/` por el budget de estilos de la home.
- Copy en voseo y bajada sostenida por `content/origin.ts`.
- `secure` y `refine` ofrecidos en el Gate E; el usuario respondió `ninguna`.

## Documentación (de `document-report`)

| Destino | Estado |
|---|---|
| `docs/home-imagen-equipo.md` | nuevo |
| `docs/architecture.md` | actualizado: clúster público, navegación pública, 2 decisiones estructurales |
| `frontend/proyecto_angular/README.md` | sección "Imágenes del sitio público" + árbol de estructura |
| `CHANGELOG.md` | 3 entradas en `[Unreleased]` → Added |
| `DEVELOPMENT_GUIDELINES.md` | sin cambios: no tiene sección de Angular; las convenciones van en architecture |
| OpenAPI / Bruno | no aplica: el cambio no toca endpoints HTTP |

## Pendientes

### Revisión manual (de `verify-report`, no bloqueante)

1. Dispositivos reales (iOS Safari, Android Chrome) a 360-414 px. En verify se emuló el viewport con un iframe.
2. Estados `:hover` / `:focus-visible` del link pill sobre el velo.
3. Carga diferida real al hacer scroll con red lenta, y ausencia de saltos de layout.
4. Animación de reveal de la banda y de la figura en un navegador real.
5. Valoración estética del velo: tiñe de verde la parte baja de las caras en escritorio. Si se quiere más foto, conviene achicar el bloque de texto (por ejemplo, sacar el caption de la banda), no aclarar el velo.

### Configuración

- `sdd/sdd.config.md` → "Documentación" declara `Readme: README.md`, pero **no existe un README en la raíz**. El README real es `frontend/proyecto_angular/README.md`. Conviene corregir esa ruta en la config.

### Deuda fuera de alcance

- Los tokens de marca que Tailwind v4 no emite globalmente afectan a otros CTA del sitio. Lo retoma el cambio `breadcrumb-y-cta-legible`, que corrigió el párrafo correspondiente (ver abajo).

## Commit separado (working tree compartido con `breadcrumb-y-cta-legible`)

Los dos cambios conviven sin commitear y comparten `nosotros.component.*`,
`home.component.spec.ts`, `CHANGELOG.md` y `docs/architecture.md`. Para commitear cada cambio
por separado con `git add -p`:

- **Tabla de hunks por cambio:** `sdd/breadcrumb-y-cta-legible/document-report.md` → "Hunks de este cambio en archivos compartidos con `home-imagen-equipo` (D-1)". La tabla indica, entre otros, `CHANGELOG.md` `+12,3` y `docs/architecture.md` `+46,10`, `+80` como hunks de este cambio. La distribución en `nosotros.component.*` y `home.component.spec.ts` está en `sdd/breadcrumb-y-cta-legible/design.md` (adiciones en bloques contiguos) y en el `propose.md` de ese cambio (riesgo D-1).
- **Hunk mixto** `docs/architecture.md` `+115,14`: es el párrafo de este cambio en su versión corregida por `breadcrumb-y-cta-legible`. Va completo con el commit de `home-imagen-equipo`, o se ajusta con `git add -p` → `e`. Ver "Nota posterior" en `sdd/home-imagen-equipo/document-report.md`.
- **`docs/home-imagen-equipo.md`**: el archivo es nuevo y de este cambio. La corrección de la línea 106 ("Limitaciones conocidas", estado actual de los tokens) viaja completa con este commit.
- **Archivos sin trackear que son enteramente de este cambio**:
  - `frontend/proyecto_angular/public/Imagenes_web/` (6 variantes)
  - `frontend/proyecto_angular/scripts/generate-image-variants.py`
  - `src/app/content/team.ts`
  - `src/app/components/public/responsive-image/`
  - `src/app/components/home/team-band/`
  - `docs/home-imagen-equipo.md`
  - `sdd/home-imagen-equipo/`
- **Modificados solo por este cambio**: `src/app/content/types.ts`, `index.ts`, `content.spec.ts`, `home.component.html`, `home.component.ts`. Conviene confirmarlo con `git diff` al stagear, por si `breadcrumb-y-cta-legible` tocó alguno.
- `Equipo YCW.jpeg` (el original con espacios) nunca estuvo trackeado y ya no existe; no requiere `git rm`.

## Consistencia de artifacts

Presentes y coherentes en `sdd/home-imagen-equipo/`: `explore.md` (con las decisiones del
Gate A), `propose.md`, `spec.md`, `design.md`, `tasks.md` (con la decisión del Gate C),
`apply-progress/imagen-base.md`, `apply-progress/imagen-ui.md` (iteraciones 1 y 2, más la
corrección D-3), `verify-report.md` (corridas 1 y 2), `document-report.md` (con la nota
posterior) y este `archive-report.md`. No hay `secure-report` ni `refine-report`, porque el
Gate E se resolvió con `ninguna`.
