# Propose — sitio-contenido

## Intent

KUVU es un SaaS B2B que administra arriendos *para* inmobiliarias, pero su sitio público hoy
es una home one-page con poca profundidad, **sin footer** y sin forma de explicarle a una
inmobiliaria quién es KUVU, cómo opera y por qué tomarlo. Este cambio **expande el contenido
del sitio** dentro del mismo frontend Angular actual: la home gana secciones nuevas y
aparecen dos páginas institucionales de profundidad (`/nosotros` y `/preguntas-frecuentes`).

## Alcance

- **La home existente** (`/`) conserva sus secciones actuales (hero, "qué es KUVU", servicios,
  compañías, CTA) y **agrega**: "cómo funciona", "beneficios por rol", "seguridad y soporte",
  "origen de KUVU" y un **FAQ corto**. El sistema de diseño se conserva (Geist, escala de verde
  de marca, tokens, tema claro/oscuro, reveals) — sin rediseño.
- **Footer compartido** nuevo, aplicado a la home y a las páginas nuevas (hoy no existe).
- **Rutas nuevas:**
  - `/nosotros` — quién es KUVU, cómo opera y con quién trabaja; incluye el origen real
    (tres estudiantes universitarios, biblioteca de su universidad). CTA a contacto.
  - `/preguntas-frecuentes` — página de ayuda completa, enlazada desde la home (FAQ corto).
- **Textos centralizados** en constantes TS tipadas separadas del markup, como fuente única
  reutilizada entre home y páginas (incluido el FAQ corto ↔ página completa).
- La sección de seguridad **solo destaca el manejo responsable de datos**, sin detalles de
  mecanismos internos.

## No-objetivos

- **No** se crea un proyecto frontend nuevo (sin Astro, sin migrar la home). Todo vive en
  `frontend/proyecto_angular`.
- **No** se mueve la app Angular bajo `/app`.
- **No** página ni formulario de contacto/captación.
- **No** blog ni artículos.
- **No** Términos y Condiciones ni Política de Datos en este cambio.
- **No** página de precios/planes ni catálogo comercial.
- **No** se toca el producto interno (dashboard, contratos, pagos, mantenimiento, inmuebles,
  usuarios) ni el backend.
- **No** rediseño visual: se conserva el sistema ya definido.
- **No** CMS externo ni panel de administración de contenido.
- **No** cifras o métricas inventadas: si no hay dato real, el contenido no lo afirma.

## Approach

Expandir el sitio en el Angular existente usando sus convenciones actuales (componentes con
`@reference` a `styles.css`, Tailwind v4, tema `.dark`, reveals `[data-reveal]`). El texto se
centraliza en módulos TS con tipos bajo `src/app/content/` (fuente única, reutilizable y
testeable). La home se arma por secciones y el FAQ corto se reutiliza en la página completa.
Las páginas nuevas reutilizan chrome compartido (header y footer).

## Decisiones ya tomadas (Gate A / D)

- D1: la home sigue siendo una one-page con anclas; ella enlaza a las páginas nuevas.
- D2: las páginas nuevas son `/nosotros` y `/preguntas-frecuentes`. Nada más.
- D3: las 5 secciones nuevas entran todas: cómo funciona, beneficios por rol, seguridad y
  soporte, origen de KUVU, FAQ corto.
- D4: el contenido se centraliza en TS (RF de versión de contenido).
- D5: la sección de seguridad destaca el manejo responsable de datos sin exponer mecanismos.