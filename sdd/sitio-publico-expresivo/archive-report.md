# Archive report — sitio-publico-expresivo

## Pendientes fuera del código

- **Secretos a rotar:** ninguno.
- **Push y PRs:** sin hacer (por instrucción). Son tres PRs apilados sobre #5
  (`fix/tema-claro-tokens`), a abrir en este orden: A → B → C.
- **Riesgo residual aceptado (secure):** se publican fotos de personas reales (los tres
  integrantes). Aporta el material el propio equipo y los `alt` no nombran a nadie. El
  consentimiento de publicación queda a cargo del equipo.

## Qué se hizo

El sitio público tiene una identidad editorial propia, sin colores nuevos. Los titulares van
en Big Shoulders Display autohospedada, con escala fluida. El fondo tiene grano y trama, hay
bloques de marca a sangre completa y movimiento ligado al scroll sin dependencias nuevas. La
home y las páginas Servicios, Nosotros, Preguntas frecuentes y Contacto se rediseñaron;
`/legal` y la 404 heredan tipografía y fondo. Las tres fotos nuevas del equipo reemplazan a la
de YCW (destacada en la home y en galería en Nosotros). "Ingresar" conserva su azul.

| Rama | Commits |
|---|---|
| A · `feat/sitio-publico-expresivo` (desde `fix/tema-claro-tokens`) | `40c12dc` planificación · `63f72e3` contenido · `718a137` chrome |
| B · `feat/sitio-publico-expresivo-paginas` (desde A) | `8ec6270` páginas |
| C · `feat/sitio-publico-expresivo-home` (desde B) | `1ea138a` home + cierre · `51a292e` verify · `af59c8c` secure · `37467b0` refine · `a576a74` re-verify · `7b1f292` document · archive (este reporte) |

## Verificación

- Karma: 484/484.
- `ng build`: initial 446,44 kB (warning en 500 kB); solo el `css-inline-fonts`
  preexistente de `/acceder`.
- QA CDP: 36 escenarios sin fallas. CA1–CA13 pasan.
- Contraste: AA en todos los pares (word-reveal atenuado: 4,66 en claro / 7,1 en oscuro).
- `/acceder`: idéntico a la base. `/login`: solo difiere el cursor de texto.
- `/dashboard`: verificado por código.

## Decisiones

- Display condensada, autohospedada y sin `@import` ni `preload`.
- Titulares partidos en `content/headlines.ts` con la invariante `parts → title`.
- Contenedor de 72rem; `.display-title` con `line-height: 1`.
- og:image en `equipo-kuvu-1-1024.jpeg` (vertical).
- Specs de tema aislados con `afterEach`, lo que elimina un fallo intermitente preexistente.

## Documentación

- `docs/sitio-publico-expresivo.md` (nuevo).
- `docs/architecture.md` actualizado: content/headlines, home, `_site.scss`, `app-headline`,
  imágenes, team-band y decisiones.
- `CHANGELOG.md`: entradas en Unreleased (Added y Changed).
- `sdd/sdd-init.md`: convenciones del sitio público.
- OpenAPI y Bruno: no aplica (sin endpoints HTTP).
- README: no aplica (no hay `README.md` en la raíz; el árbol del README del frontend sigue
  siendo correcto).
- `DEVELOPMENT_GUIDELINES.md`: sin cambios, por instrucción; no tiene sección de Angular.

## Deuda y no hecho (refine)

- El bloque `.container` (72rem) se repite en cada componente de página. Se unifica en una
  primitiva global cuando se vuelvan a tocar las páginas.
- La celda 2 del bento conserva su trama local (la clase global cambiaría su fondo).
- No hay abstracción para los h3 display: son tamaños distintos por contexto.

## Limitaciones conocidas

- En oscuro, la cinta pierde fuerza como superficie (el texto se lee, 8,55:1).
- Los `alt` no nombran a los integrantes (falta su orden en cada foto).

## Trabajo futuro (partición aprobada)

1. `acceso-volver-inicio`, con rama propia `feat/acceso-volver-inicio`.
2. `app-interna-ux`.

Almacenamiento `files`: todos los artifacts están en `sdd/sitio-publico-expresivo/`
(explore, propose, spec, design, tasks, apply-progress ×5, verify-report, secure-report,
refine-report, document-report, archive-report). No hay sincronización de memoria.
