# Apply progress — contenido

| Tarea | Estado | Nota |
|---|---|---|
| T2.1 | Completa | `content/types.ts`: `TeamSection.photos`, `HeadlinePart`, `Headline` |
| T2.2 | Completa | 14 variantes `equipo-kuvu-{1,2,3}` (WebP + JPEG); `equipo-ycw-*` borradas |
| T2.3 | Completa | `content/team.ts` con 3 fotos y `alt` sin nombres; `team-band` y `nosotros` leen `photos[0]` y los nombres de `members` |
| T2.4 | Completa | `content/headlines.ts`: 10 titulares partidos (hero, qué es, servicios, seguridad, equipo, origen, FAQ, CTA final, nosotros, contacto) |
| T2.5 | Completa | Specs de contenido, nosotros, home, responsive-image y page-meta |

## Desvíos

- `scripts/generate-image-variants.py`: con `--keep-original-as-max`, el ancho original es
  variante aunque no esté en `WIDTHS` (los originales miden 1200 y 960 px). Variantes:
  `equipo-kuvu-1` 640/1024/1200 y `equipo-kuvu-2|3` 640/960.
- Los titulares partidos viven en `content/headlines.ts` (no como `titleParts` dentro de cada
  módulo): varios titulares de la home están hoy en las plantillas, no en `content/`. Cada
  `Headline` declara su `title` y la invariante `headlineText(parts) === title` lo protege.
  Cada titular tiene exactamente un fragmento con énfasis.
- `SHARE_IMAGE_PATH` (og:image) apunta a `equipo-kuvu-1-1024.jpeg`, porque la foto YCW sale
  del sitio. Es vertical 3:4; las redes la recortan al previsualizar.

```
test_mode: test-after
test_command: npx ng test --watch=false --browsers=ChromeHeadless (frontend/proyecto_angular)
tests_status: verde (471/471)
tests_agregados: src/app/content/content.spec.ts, src/app/components/pages/nosotros/nosotros.component.spec.ts, src/app/components/home/home.component.spec.ts, src/app/components/public/responsive-image/responsive-image.component.spec.ts, src/app/services/page-meta.service.spec.ts
excepciones_sin_test: scripts/generate-image-variants.py (herramienta fuera del build; verificada por las salidas generadas)
logs_conforme: sí (sin logs nuevos)
build: ng build OK, initial 439,73 kB, solo el css-inline-fonts preexistente de /acceder
```
