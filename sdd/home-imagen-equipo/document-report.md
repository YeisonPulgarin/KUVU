# Document report — home-imagen-equipo

```
docs_archivo: docs/home-imagen-equipo.md (nuevo)
architecture: actualizado: "Clúster público (marketing)" (Imagenes_web/, responsive-image, team-band), "Navegación pública" (banda #equipo en la home), "Decisiones estructurales" (imágenes responsive con <picture> + contenido tipado; tokens de Tailwind v4 no emitidos y fallback local)
guidelines: sin cambios (DEVELOPMENT_GUIDELINES.md no tiene sección de Angular; la convención de imágenes y la del fallback de tokens quedan en docs/architecture.md, como anticipó tasks.md. Si se quiere elevarlas a guideline, entra como cambio nuevo por spec)
openapi: no aplica: el cambio no toca endpoints HTTP (sitio público estático, sin API)
collections: no aplica: sin endpoints HTTP
changelog: entrada agregada bajo [Unreleased], sección Added (banda del equipo en la home, foto en Nosotros, imágenes WebP/JPEG responsive + script de variantes)
readme: frontend/proyecto_angular/README.md: sección nueva "Imágenes del sitio público" (cómo generar variantes con el script, declarar el SiteImage y renderizarlo) + árbol de "Estructura del proyecto" (responsive-image/, team-band/)
desvios: ver abajo
```

## Notas

- **Ruta del README:** `sdd.config.md` declara `README.md`, pero el repo no tiene README en la raíz. El README del proyecto es `frontend/proyecto_angular/README.md`, y es el que se actualizó.
- **Gana el código sobre el design:**
  - la banda vive en `home/team-band/` (design D4 la ubicaba en la home);
  - el encuadre es `center 10%` (design: 35 %);
  - el velo es denso hasta el 60 % de la altura con el verde por fallback local (design D5 usaba `--color-brand-700` directo y estimaba 11:1);
  - la bajada es la versión verificada contra `origin.ts`.

  La documentación describe lo implementado. Son desvíos ya registrados en `apply-progress` y `verify-report`; no hay diferencias sustantivas nuevas.
- **Deuda previa documentada en "Limitaciones conocidas" y en architecture:** `--color-brand-700/200/300` no existen en runtime para los CTA del hero, del header y de `cta-final`.
- Estándar de tiempo presente revisado en `docs/home-imagen-equipo.md` y `docs/architecture.md`. El historial de versiones queda solo en `CHANGELOG.md`.
- Sin commits (la extensión `git` no está activa).

## Nota posterior (cambio `breadcrumb-y-cta-legible`)

Por decisión del usuario, el cambio `breadcrumb-y-cta-legible` corrigió en el working tree el
párrafo "Tokens de Tailwind v4 solo usados en componentes no existen en runtime" de
`docs/architecture.md`, que pertenece a este cambio (hunk `+115,14` en `git diff HEAD -U0`).
El hunk queda mixto: conserva la decisión, el ejemplo de `team-band` y el tradeoff de este
cambio, y suma la lista real de tokens ausentes en modo claro, que `--color-brand-700` se
emite de forma incidental y que `cta-final` usa fallback. Detalle y diff antes/después en
`sdd/breadcrumb-y-cta-legible/document-report.md`.

Segunda corrección, por el mismo motivo: `docs/home-imagen-equipo.md`, línea 106 ("Limitaciones
conocidas"), describe el estado actual de los tokens: `--color-brand-700` se emite de forma
incidental, el fondo de `cta-final` usa valor de respaldo, y los CTA del hero y del header no
lo llevan y se ven con el gradiente de `.btn-primary`. El archivo no está trackeado y es
enteramente de este cambio, así que la corrección viaja con su commit.
