# Tasks — home-imagen-equipo

Fuentes: `spec.md`, `design.md`. Modalidad de tests: `test-after` (los tests de cada tarea se
escriben antes de cerrarla). Rutas relativas a `frontend/proyecto_angular/` salvo indicación.

## Tono del copy

El copy de `content/` y de las páginas públicas usa voseo ("Conocé", "Gestioná", "Ingresá",
"Querés"). El botón de la banda es **"Conocé al equipo"**, tal como dice `design.md` (D5), que
no cambia.

## Tareas

| # | Tarea | Depende de | Archivos | Cubre |
|---|---|---|---|---|
| T1 | Script `scripts/generate-image-variants.py <origen> <nombre-base> [--keep-original-as-max]`: con Pillow genera `{base}-{640,1024,1536}.webp` (q80) y `.jpeg` (progresivo, q82) en `public/Imagenes_web/`, sin superar el ancho del original y conservando el aspecto | — | 1 nuevo | RF-1, RF-7, D7 |
| T2 | Correr el script sobre `Equipo YCW.jpeg` con base `equipo-ycw`. El original queda como `equipo-ycw-1536.jpeg` y se elimina el archivo con espacios. Verificar anchos, aspecto 3:2 y peso del WebP de 1536 px (< 150 KB) | T1 | 6 binarios, 1 borrado | RF-1, CA-1, CA-2 |
| T3 | Tipos `SiteImage` y `TeamSection` en `src/app/content/types.ts` | — | 1 mod | D1 |
| T4 | `src/app/content/team.ts` (title "El equipo detrás de KUVU", lead, linkLabel "Conocé al equipo", members en orden Wilson Solano / Carlos Arciniegas / Yeison Pulgarin, `image` con caption derivado de members y alt descriptivo que menciona a YCW y a los tres) + export en `index.ts` + tests de forma en `content.spec.ts` | T3 | 1 nuevo, 2 mod | RF-7, CA-6 |
| T5 | Componente standalone `src/app/components/public/responsive-image/` (`ts` + `scss`, template inline o `html`): inputs `image`, `sizes`, `decorative`, `fit`; `<picture>` con `<source type="image/webp">` y `<img>` JPEG con `srcset`, `width`/`height`, `loading="lazy"`, `decoding="async"` + spec | T3 | 3 a 4 nuevos | RF-4, RF-5, RF-7, CA-7 |
| T6 | Home: sección `#equipo` entre `#companias` y `#origen` (full-bleed, imagen decorativa `fit="cover"`, velo `::after`, bloque de texto con `data-reveal`, link pill a `/nosotros` con aria-label, layout apilado < 768px) en `home.component.{html,scss,ts}` + tests en `home.component.spec.ts` (contenido de `#equipo` y orden de ids actualizado) | T4, T5 | 4 mod | RF-2, RF-4, RF-6, CA-3, CA-4, CA-8, CA-9 |
| T7 | `/nosotros`: sección `.team` con `<figure>` entre "about" y "Origen" (imagen `contain`, rounded, sombra, `figcaption` con members, `data-reveal`, `sizes` de D6) en `nosotros.component.{html,scss,ts}` + tests en `nosotros.component.spec.ts` | T4, T5 | 4 mod | RF-3, RF-4, CA-5 |
| T8 | Correr la suite completa (`ng test` en ChromeHeadless) y `npx ng build`. Buscar referencias a `Equipo YCW` / `Equipo%20YCW` en `src/` | T2, T6, T7 | — | CA-2, CA-10, CA-11 |

T3 y T1 son independientes entre sí. T6 y T7 dependen de T4 y T5, pero no entre sí.

Excepción de tests registrada en `design.md`: el script de T1 se verifica por los archivos que
genera (T2 / CA-1), no con tests unitarios.

## Slices

`sdd.config.md` declara los slices `contenido`, `chrome`, `home-expandida`, `paginas` y
`cierre`. Corresponden al cambio `sitio-contenido` y no describen este trabajo. **Se aparta del
default:** este cambio corre en un slice propio, `home-imagen-equipo`.

Si se divide la entrega (ver forecast), los slices quedan así:

| Slice | Tareas | Contenido |
|---|---|---|
| `imagen-base` | T1 a T5 | script, assets, tipos, contenido, componente compartido + tests |
| `imagen-ui` | T6 a T8 | banda en la home, figura en `/nosotros` + tests + verificación final |

Mapeo informativo a los slices declarados: T3/T4 ≈ `contenido`, T5 ≈ `chrome`,
T6 ≈ `home-expandida`, T7 ≈ `paginas`. Se usan los nombres propios porque los declarados
incluyen tareas de otro cambio.

## Forecast de riesgo

| Pieza | Líneas estimadas |
|---|---|
| Script Python (T1) | ~45 |
| Tipos + contenido + index (T3, T4) | ~45 |
| Tests de contenido (T4) | ~25 |
| Componente responsive-image ts + scss (T5) | ~55 |
| Spec del componente (T5) | ~70 |
| Home html + scss + ts (T6) | ~95 |
| Spec de la home (T6) | ~30 |
| Nosotros html + scss + ts (T7) | ~40 |
| Spec de nosotros (T7) | ~20 |
| **Total** | **~425 líneas** (≈ 280 de código + ≈ 145 de tests) |

- **Archivos:** unos 15 de texto (6 nuevos y 9 modificados), más 6 binarios nuevos y 1 binario eliminado.
- **Repos:** 1 (KUVU).
- **Umbral de `sdd.config.md`:** 300 líneas. **Riesgo: ALTO**, porque el estimado supera el umbral en unas 125 líneas, tests incluidos. Los binarios no suman a la revisión de código, pero sí al peso del diff (unos 600 a 800 KB).
- **Estrategia default:** `ask-on-risk`. Opciones para el Gate C:
  - **(a) Una sola entrega** `home-imagen-equipo`, de ~425 líneas.
  - **(b) Dos entregas:** `imagen-base` (~240 líneas, T1 a T5) y después `imagen-ui` (~185 líneas, T6 a T8). Cada una queda bajo el umbral. `imagen-base` es mergeable sola, porque no cambia nada visible.
- Las extensiones `git` y `branch` no están activas, así que "entrega" significa commit o commits sobre la rama de trabajo; no se crean PRs automáticamente.

## Alcance previsto de `document`

| Flag | Valor | Motivo |
|---|---|---|
| `openapi_afectado` | no | sin endpoints HTTP |
| `changelog_afectado` | sí | cambio visible: banda del equipo en la home y foto en `/nosotros` |
| `readme_afectado` | sí | cómo sumar imágenes a `Imagenes_web/` con el script (requiere Python + Pillow) |
| `architecture_afectado` | sí | carpeta `public/Imagenes_web/`, `content/team.ts`, componente `responsive-image` y decisión de `<picture>` frente al patrón del logo |
| `guidelines_afectado` | no | `DEVELOPMENT_GUIDELINES.md` no tiene una sección de Angular; la convención de imágenes queda en `docs/architecture.md` y en `docs/home-imagen-equipo.md` |

Además, `docs/home-imagen-equipo.md` es el documento del cambio.

## Fuera de alcance detectado

`content/` mezcla voseo con un "Escríbenos" en tuteo. Es una inconsistencia previa que no se
corrige en este cambio.

## Decisión del Gate C

Entrega en dos slices (opción b): [1] `imagen-base` (T1 a T5) y [2] `imagen-ui` (T6 a T8). Sin commits automáticos.
