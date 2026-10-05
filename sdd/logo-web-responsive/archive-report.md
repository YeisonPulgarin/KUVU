# Archive-report — logo-web-responsive

## Resumen

El sistema de logo del frontend pasa de 4 variantes (completo/símbolo × tema claro/oscuro) a
**2 assets**: `Logo_Kuvu.png` (web, completo) y `Logo_Responsive.png` (símbolo). La marca se
adapta al viewport y no al tema — el mismo asset se muestra en tema claro y oscuro. Rutas
centralizadas en `content/logo.ts` con claves `web` y `responsive`; header y footer alternan
completo/símbolo por el breakpoint `768px` (sin swap por tema), landing (`/acceder`), login
(`/login`) y navbar autenticada usan el logo web, y el favicon es el símbolo.

## Artifacts del ciclo

| Artifact | Estado |
|---|---|
| `explore.md` | ✅ incluye el inventario de referencias, el mecanismo de visibilidad y las 5 ambigüedades resueltas en Gate A |
| `propose.md` | ✅ intent, alcance, 6 no-objetivos, 4 alternativas descartadas |
| `spec.md` | ✅ 6 requisitos funcionales, 14 criterios de aceptación, no-objetivos |
| `design.md` | ✅ decisión central (eje único de viewport), cambios por archivo, naming, 4 riesgos |
| `tasks.md` | ✅ 9 tareas, 1 slice, pronóstico de revisión (riesgo bajo, ~90 líneas) |
| `apply-progress/logo-web-responsive.md` | ✅ 9/9 tareas con evidencia, desvíos, comandos, nota de logging |
| `verify-report.md` | ✅ criterios 1-13 en verde, criterio 14 (visual) pendiente de revisión humana |
| `document-report.md` | ✅ documentos creados, actualizados y consolidados |
| `archive-report.md` | ✅ este documento |

No hay `validate` / `analyze` / `secure-report` / `refine-report`: las extensiones no están
activas en `sdd/sdd.config.md` y el usuario declinó `secure` y `refine` en Gate E.

## Fases ejecutadas

`explore` → `clarify` (Gate A) → `propose` → `spec` → `design` → `tasks` → Gate C → `apply`
(slice único, `test-after`) → `verify` → Gate E (`secure`/`refine` declinados) → `document` →
`archive`. Sin `verify` de re-verificación porque no corrieron fases opcionales que tocaran
código.

## Decisiones registradas

1. **El tema sale del contrato del logo** — un solo juego de assets, sin binding `isDark()` en
   la selección y sin filtro CSS. Decidido en Gate A y confirmado por la persona.
2. **Claves `web` / `responsive`** en lugar de `light` / `dark`: nombran el uso, no el tema.
3. **Un solo slice** aunque `sdd.config.md` declare `contenido` y `chrome`: el cambio no agrega
   secciones ni páginas, y partirlo dejaría specs en rojo en el corte intermedio.
4. **Los tests de swap por tema se reescribieron como tests de invariancia** en vez de borrarse:
   son la cobertura que ata el criterio "el logo no depende del tema".
5. **Nombres de archivo sin kebab-case**: se conservan `Logo_Kuvu.png` y `Logo_Responsive.png`
   tal como se entregaron.
6. **`docs/logo-rediseno.md` y `docs/logo-responsive.md` consolidados** en
   `docs/logo-web-responsive.md`: describían sistemas de logo que no existen y no estaban
   referenciados desde documentos vivos.

## Verificación

- Suite: **128/128 SUCCESS**, 0 fallos, 0 skips (mismo total que antes: los tests de swap se
  reescribieron, no se eliminaron).
- `ng build`: OK. El warning de presupuesto de Google Fonts es preexistente y ajeno al cambio.
- `dist/proyecto-dss/browser/logo-rediseno/`: contiene `Logo_Kuvu.png` y `Logo_Responsive.png`,
  ningún asset anterior.
- 0 coincidencias de `logo-light|logo-dark|logo-responsive-*` y de `logo.light|logo.dark|
  logo.responsiveLight|logo.responsiveDark` en `frontend/proyecto_angular/src/` y `public/`.

## Pendiente para la persona

- **Criterio 14 de `spec.md` (visual)**: el agente no puede interpretar imágenes. Confirmar en
  el navegador que `Logo_Kuvu.png` se lee sobre el header en tema claro y oscuro, que
  `Logo_Responsive.png` se ve bien en móvil, y que landing, login, navbar y favicon cargan.
  Este es el mismo punto que la persona ya juzgó en Gate A al decidir que un solo juego de logos
  alcanza; queda como confirmación de cierre.
- **Commit**: el cambio no está commiteado. El working tree ya traía modificaciones de otro
  trabajo (backend, `db/`, `docker-compose.yml`, `sdd/bd-docker/`) que no son de este cambio;
  hacer `git add` solo de los archivos de `logo-web-responsive`.

## Diff del cambio

15 archivos de `frontend/proyecto_angular/src/` (+38 / -43), 2 assets nuevos, 4 PNG eliminados,
`docs/` (1 creado, 2 eliminados, 2 actualizados) y `CHANGELOG.md`.
