# Spec — breadcrumb-y-cta-legible

Fuentes: `explore.md` (decisiones del Gate A) y `propose.md` (D-1, D-2).
Extensión `validate`: no activa en `sdd.config.md`.

## Requisitos funcionales

### RF-1 — Banda final legible sin depender del token emitido

- **Given** la home en modo claro (sin clase `.dark` en `<html>`)
- **And** `--color-brand-700` no definido en runtime
- **When** se renderiza la sección "¿Listo para administrar tus inmobiliarias?"
- **Then** la sección tiene fondo `#2f4a2f`, no transparente
- **And** el titular y el párrafo blancos alcanzan contraste AA contra ese fondo.

Cuando `--color-brand-700` está definido, la sección usa su valor. En modo oscuro el
comportamiento es el mismo. Los textos y el layout de la sección no cambian.

### RF-1b — Botón "Ingresar" de la banda legible (D-3)

- **Given** la banda final, en modo claro u oscuro
- **When** se renderiza el botón "Ingresar"
- **Then** se ve con el gradiente azul de los botones primarios del sitio (`#2b4c8c → #3a6fd8`)
  y texto blanco, con contraste ≥ 4.5 : 1 en todo el gradiente. El mínimo está en el extremo
  claro `#3a6fd8`: 4.72 : 1, margen chico pero suficiente.
- **When** el puntero pasa sobre el botón
- **Then** el texto sigue blanco y el contraste sigue ≥ 4.5 : 1. Con el hover actual de los
  botones primarios (opacidad 0.92 sobre la banda verde) el mínimo medido es 5.03 : 1.
- **When** el botón recibe foco por teclado
- **Then** muestra un indicador de foco con contraste ≥ 3 : 1 contra la banda. El contorno
  global del sitio (`#6b8e6b`) da 2.66 : 1 sobre `#2f4a2f` y no alcanza, así que en este botón
  el indicador es blanco (9.81 : 1).
- El destino (`/acceder`), el texto, la forma pill y el tamaño del botón no cambian. Los
  botones del hero y del header no cambian.

Nota: el borde del botón contra la banda tiene poco contraste (1.17 a 2.08 : 1). Como el botón
se identifica por su texto blanco, que contrasta tanto con el botón como con la banda, no se
exige un borde adicional.

### RF-2 — Breadcrumb visible en las páginas públicas internas

- **Given** un visitante en `/nosotros` o en `/preguntas-frecuentes`
- **When** se renderiza la página
- **Then** dentro del hero de página, arriba del título principal, aparece la ruta
  "Inicio › Nosotros" o "Inicio › Preguntas frecuentes", respectivamente.

Detalle observable:
- "Inicio" es un enlace que lleva a `/` sin recargar la aplicación.
- El último ítem es el nombre de la página actual y no es un enlace.
- Entre ítems se muestra el separador "›", que los lectores de pantalla no anuncian.
- Las etiquetas coinciden con las de la navegación de páginas del sitio (`Inicio`,
  `Nosotros`, `Preguntas frecuentes`).
- Es legible en modo claro y oscuro (contraste AA para texto normal) y no produce scroll
  horizontal a 360 px de ancho.

### RF-3 — Breadcrumb accesible como navegación

- El breadcrumb se expone como una región de navegación con nombre accesible
  ("Ruta de navegación").
- Los ítems forman una lista ordenada.
- El ítem de la página actual se marca como página actual (`aria-current="page"`).
- El enlace "Inicio" es alcanzable con teclado y muestra el foco visible del sitio.

### RF-4 — Datos estructurados `BreadcrumbList`

- **Given** un visitante en `/nosotros` o en `/preguntas-frecuentes`
- **When** la página está activa
- **Then** el documento contiene exactamente un bloque `application/ld+json` de tipo
  `BreadcrumbList` (schema.org) con un `ListItem` por ítem visible, en el mismo orden, con
  `position` desde 1, `name` igual a la etiqueta visible e `item` como URL absoluta formada con
  el origen en el que corre la app (D-2) más la ruta (`/` o `/nosotros`, por ejemplo).
- **When** el visitante navega a otra ruta (home, la otra página pública, acceso o gestión)
- **Then** el bloque de la página anterior ya no está en el documento: no se duplica ni queda
  huérfano.

Las etiquetas visibles y los datos estructurados salen de la misma fuente y no pueden
divergir.

### RF-5 — Sin efectos fuera de alcance

- La home, `/acceder`, `/login` y las rutas de gestión no muestran breadcrumb ni emiten
  `BreadcrumbList`.
- El título y la meta descripción que ya fija cada página pública siguen iguales.

## Criterios de aceptación

| # | Criterio | Verificación |
|---|---|---|
| CA-1 | Con `--color-brand-700` ausente, `.cta-final` tiene fondo computado `rgb(47, 74, 47)` | Test unitario de regresión en `home.component.spec.ts` |
| CA-2 | En modo claro el titular de la banda da ≥ 3 : 1 y el párrafo ≥ 4.5 : 1 | Medición en navegador (build) registrada en `verify-report` |
| CA-2b | El botón "Ingresar" de la banda tiene texto computado blanco sobre el gradiente azul, sin fondo blanco ni texto verde | Test en `home.component.spec.ts` |
| CA-2c | Texto del botón ≥ 4.5 : 1 en reposo y en hover en todo el gradiente; foco con indicador ≥ 3 : 1 contra la banda | Medición en navegador registrada en `verify-report` |
| CA-3 | `/nosotros` muestra "Inicio › Nosotros" arriba del `h1`, y `/preguntas-frecuentes` muestra "Inicio › Preguntas frecuentes" | Tests de las dos páginas |
| CA-4 | "Inicio" enlaza a `/`; el último ítem no es enlace y lleva `aria-current="page"` | Test del componente |
| CA-5 | Hay `nav` con nombre accesible, `ol` con los ítems, y separador oculto a lectores de pantalla | Test del componente |
| CA-6 | En cada página hay exactamente un `BreadcrumbList` con `position`, `name` e `item` absolutos correctos según el origen actual | Tests del servicio y de las páginas |
| CA-7 | Al destruir la página, su `BreadcrumbList` se elimina del documento | Test del servicio o de la página |
| CA-8 | La home no renderiza breadcrumb ni `BreadcrumbList` | Test de la home |
| CA-9 | El breadcrumb tiene contraste AA en claro y oscuro y no hay scroll horizontal a 360 px | Medición en navegador registrada en `verify-report` |
| CA-10 | Los botones del hero y del header y la clase global `.btn-primary` no cambian: sin diff en sus reglas | `git diff` sobre esos selectores en `verify` |
| CA-11 | Suite completa en verde y `ng build` sin errores nuevos | Comandos de `sdd.config.md` |
| CA-12 | Las líneas de este cambio en archivos compartidos con `home-imagen-equipo` quedan identificadas en `apply-progress` (D-1) | Revisión en `verify` |

## No-objetivos y casos excluidos

- Botones del hero y del header, y la clase global `.btn-primary`: no cambian.
- Tokens globales de Tailwind y el resto de tokens ausentes en modo claro.
- Breadcrumb en la home, `/acceder`, `/login` o gestión; breadcrumbs de más de dos niveles o
  generados a partir del router.
- Indexación real del JSON-LD: el sitio corre en local y no hay dominio, así que las URLs
  absolutas reflejan el origen local (por ejemplo `http://localhost:4200/nosotros`). Es
  correcto en estructura y se ajusta solo cuando haya dominio.
- Renderizado en servidor (SSR) o prerender: la app es solo cliente, y el JSON-LD existe
  después de que Angular renderiza la página.
- Rutas desconocidas: siguen redirigiendo a `/login` sin breadcrumb.
