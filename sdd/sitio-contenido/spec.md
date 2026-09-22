# Spec — sitio-contenido

## Requisitos funcionales

**RF-1 — Home expandida con secciones nuevas.** La home (`/`) conserva las secciones actuales
(hero, "qué es KUVU", servicios, compañías, CTA) y las amplía con nuevas secciones, en este
orden sugerido: "cómo funciona", "beneficios por rol", "seguridad y soporte", "origen de
KUVU" y "FAQ corto". Conserva el sistema de diseño actual (Geist, escala de verde de marca,
tema claro/oscuro, reveals `[data-reveal]`).

**RF-2 — Cómo funciona.** Una sección que explica, en pasos claros, qué hace KUVU para la
inmobiliaria y qué tareas desaparecen/migran a la plataforma.

**RF-3 — Beneficios por rol.** La sección presenta el valor de KUVU para dos audiencias: el
dueño/gerente (decisión de compra, control y visibilidad) y el equipo operativo (uso diario,
menos trabajo manual).

**RF-4 — Seguridad y soporte.** La sección destaca que KUVU maneja los datos de forma
responsable y que la inmobiliaria cuenta con soporte. **No se publica ningún detalle de
mecanismos internos de seguridad** (cifrado en sitio, esquemas de BD, infraestructura, etc.).

**RF-5 — Origen de KUVU.** La sección cuenta quiénes están detrás de KUVU y el origen real:
tres estudiantes universitarios que lo crearon en la biblioteca de su universidad. No usa
cifras ni logros inventados.

**RF-6 — FAQ corto en la home.** La home muestra un subconjunto corto (3–5) de las preguntas
más frecuentes de una inmobiliaria y enlaza a la página `/preguntas-frecuentes`.

**RF-7 — Nosotros (`/nosotros`).** Página que explica quién es KUVU, cómo opera y con quién
trabaja, incluido el origen real (tres estudiantes universitarios, biblioteca de su
universidad). Cierra con CTA a contacto (contacto = el formulario/vía que la inmobiliaria ya
tiene, se apunta a cualquier vía existente).

**RF-8 — Preguntas frecuentes (`/preguntas-frecuentes`).** Página de ayuda completa con las
preguntas de una inmobiliaria: qué es KUVU, cómo funciona, con quién trabaja y cómo comenzar.
Estructura agrupada y navegable; enlazada desde la home (FAQ corto) y desde el footer.

**RF-9 — Footer compartido.** Todas las páginas públicas (home, `/nosotros`,
`/preguntas-frecuentes`) comparten un footer común con navegación (inicio, nosotros,
preguntas frecuentes, acceso a la app), marca/copyright. La home, que hoy no tiene footer,
pasa a tenerlo.

**RF-10 — Contenido versionado.** Los textos institucionales, los pasos de "cómo funciona",
los beneficios, la sección de seguridad, el origen y las preguntas frecuentes viven en el
repositorio como contenido estructurado en módulos TS tipados, separado del markup. La home
y la página de FAQ reutilizan la misma fuente (el FAQ corto es un subconjunto del completo).

**RF-11 — Metadata básica por página.** Cada página pública define su propio `title` y `meta description`. El `favicon.ico` referenciado existe (hoy está ausente).

## Criterios de aceptación

| # | Criterio | Cómo se verifica |
|---|---|---|
| 1 | `/` responde y muestra hero, qué es, servicios, compañías, CTA más las 5 secciones nuevas en orden | Render de la home; navegación por anclas |
| 2 | Los pasos de "cómo funciona" se ven como pasos claros (ordenados, con encabezado y descripción) | Inspección de la sección |
| 3 | "Beneficios por rol" separa explícitamente dueño/gerente de equipo operativo | Inspección de la sección |
| 4 | La sección de seguridad destaca el manejo responsable y soporte, y **no menciona ningún mecanismo interno** | Inspección del texto renderizado |
| 5 | "Origen de KUVU" menciona los tres estudiantes universitarios y la biblioteca de su universidad | Inspección del texto renderizado |
| 6 | La home muestra 3–5 preguntas frecuentes y un enlace a `/preguntas-frecuentes`; el enlace lleva a una página que responde | Navegación desde la home |
| 7 | `/preguntas-frecuentes` lista todas las preguntas, agrupadas, y cada una tiene respuesta visible | Render de la página |
| 8 | `/nosotros` explica quién es, cómo opera, con quién trabaja, el origen real y cierra con CTA | Render y revisión de enlaces |
| 9 | Home, nosotros y FAQ comparten el mismo footer con los enlaces previstos | Navegación entre páginas |
| 10 | El texto institucional no está embebido en el markup de las páginas: vive en módulos TS | Revisión de estructura de código |
| 11 | Cada página pública tiene `title` y `description` propios; `favicon.ico` existe | Inspección del `<head>` y del archivo |
| 12 | El toggle de tema claro/oscuro y los reveals siguen funcionando en las páginas nuevas | Inspección manual |
| 13 | No existen rutas nuevas fuera de `/nosotros` y `/preguntas-frecuentes` | Revisión de `app.routes.ts` |

## No-objetivos / edge cases excluidos

- **Sin proyecto frontend nuevo**: no se crea Astro ni se migra la home.
- **Sin cambio de base de la app**: el producto sigue en las rutas actuales (raíz), no bajo `/app`.
- **Sin contacto/captación**: no hay formulario nuevo ni página `/contacto`.
- **Sin blog**: no hay artículos ni estructura de blog.
- **Sin legal**: no hay Términos y Condiciones ni Política de Datos en este cambio.
- **Sin precios/planes** ni catálogo comercial.
- **Sin cifras o métricas no verificadas**: si no hay dato real, el contenido no lo afirma.
- **Sin multilingüismo**: solo español.
- **Sin SEO avanzado**: no hay JSON-LD, sitemap ni Open Graph en este cambio; solo `title`,
  `description` y el `favicon` que existe.