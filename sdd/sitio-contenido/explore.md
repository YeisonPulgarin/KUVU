# Explore — sitio-contenido

## Qué existe hoy

KUVU es un **SaaS B2B para inmobiliarias** (gestión de arriendos). El frontend es una app
Angular 21 con Tailwind v4, y el backend es Node.js + Express + MySQL (`bd_arrendamientos`).
El producto interno está construido (dashboard, contratos, pagos, mantenimiento, inmuebles,
usuarios), pero el **sitio público es mínimo**: solo la home y el flujo de acceso.

### Rutas actuales

`frontend/proyecto_angular/src/app/app.routes.ts` es el único archivo de rutas:

| Ruta | Componente | Tipo |
|---|---|---|
| `''` | `HomeComponent` | Pública (one-page de marketing) |
| `acceder` | `LandingComponent` | Pública (selección de inmobiliaria) |
| `login` | `LoginComponent` | Pública (credenciales: correo + documento) |
| `dashboard` | `DashboardComponent` | Interna (`authGuard`) |
| `contratos` | `ContratosComponent` | Interna (`authGuard`) |
| `pagos` | `PagosComponent` | Interna (`authGuard`) |
| `mantenimiento` | `MantenimientoComponent` | Interna (`authGuard`) |
| `locales` | `LocalesComponent` | Interna (`adminGuard`) |
| `usuarios` | `UsuariosComponent` | Interna (`adminGuard`) |
| `**` | redirect → `/login` | Wildcard |

No existe ninguna ruta de contenido informativo: ni Nosotros, ni Contacto, ni Precios, ni
Preguntas frecuentes, ni Blog, ni Términos, ni Privacidad. El wildcard manda a `/login`, no a
la home.

### Componentes relevantes

- `components/home/` — `HomeComponent`: única página de marketing. Secciones: navbar con anclas
  (Inicio / Qué es KUVU / Servicios / Compañías), hero, "qué es", servicios, bloque de compañías
  y CTA final. **No tiene footer.**
- `components/landing/` — `LandingComponent` (`/acceder`): intro cinemática + buscador/tarjetas de
  inmobiliarias; la lista de empresas viene de `GET /api/empresas` (BD, `activo = 1`).
- `components/login/` — `LoginComponent` (`/login`): credenciales correo + documento, fondo por
  empresa. Pie mínimo: `© 2026 KUVU · YCW`.
- `components/shared/sidebar/` — navegación lateral de las pantallas internas.
- `components/shared/auth-intro/` — animación de intro usada por `landing`.
- `components/shared/navbar/` — **definido pero sin uso** (no lo importa ningún componente).

### Estilos

- Tailwind v4 vía PostCSS (`postcss.config.json` → `@tailwindcss/postcss`).
- Tokens y tema central en `src/styles.css` (`@import "tailwindcss"`, `@theme`, `@custom-variant
  dark`, overrides `.dark`).
- Tema oscuro por clase `.dark`, aplicada en `index.html` antes del bootstrap leyendo
  `localStorage['kuvu-theme']`.
- Convención por componente: cada `.scss` declara `@reference "../../../styles.css"` y usa `@apply`.
- Sistema de diseño ya fijado (cambio `home-ui-ux`): Geist como tipografía, escala de verde de
  marca, escala de radios (pill 9999px / card 16px / icon 12px), densidad de secciones y patrón
  de reveal `[data-reveal]`.

### Contenido y datos

- **No hay CMS ni mecanismo de contenido editable.** No existen JSON, markdown ni constantes TS
  centralizadas de textos institucionales; el texto vive en los templates (sobre todo
  `home.component.html`).
- El bloque de "compañías" de la home está **hardcodeado** (Amarilo, Nido Rent, Balcones de San
  Soucci, Mi Inmueble) y **no** viene de la API, a diferencia de `/acceder` y `/login` que sí
  leen de la BD. Es la misma información duplicada y desincronizada.
- Assets en `public/`: `login-backgrounds/*.webp`, `login-references/Transicion_login.png`,
  `Logo_Kuvu.jpeg`. **No hay assets institucionales** (equipo, oficina, capturas del producto) ni
  `robots.txt` / `sitemap.xml`. `index.html` referencia `favicon.ico` pero el archivo **no existe**.

### Tests

Karma/Jasmine, 60 tests en verde. Specs en `home`, `landing`, `login`, `shared/auth-intro` y
`services/intro-state`. Las pantallas internas no tienen specs.

### Contexto de referencia (Amarilo)

El cambio surgió de analizar `amarilo.com.co`. Ese sitio es profundo porque es un **embudo de
venta de producto inmobiliario** (catálogo filtrable, fichas de proyecto con modelo de datos
rico, blog SEO por intención de búsqueda, informes de sostenibilidad GRI, programas como
Amarilo Plus). KUVU **no** es una inmobiliaria: vende un *software* a inmobiliarias. La
profundidad relevante para KUVU es otra (producto, confianza, casos de uso, soporte,
onboarding), pero el *nivel* de información del sitio puede tomarse como referencia.

## Ambigüedades detectadas (para Gate A)

1. **Alcance del contenido.** ¿Cuál de estos frentes entra en este cambio: (a) páginas
   institucionales (Nosotros, Contacto), (b) propuesta comercial (Planes/Precios, "cómo
   funciona", demo), (c) ayuda/documentación del producto (FAQ, guías), (d) contenido de
   adquisición/SEO (blog, recursos)?
2. **Público del sitio.** ¿Habla al **dueño/gerente** de la inmobiliaria (decisión de compra) o
   al **personal operativo** (agentes, contabilidad)? El tono y el contenido cambian.
3. **Puerta de entrada.** Hoy la inmobiliaria ya debe existir en la BD para poder entrar
   (`/acceder`). ¿Este cambio agrega una vía para que una inmobiliaria nueva **solicite/contrate**
   KUVU (formulario de contacto, "solicitar demo", registro), o el sitio sigue siendo informativo
   para clientes ya existentes?
4. **Estructura de navegación.** ¿La home sigue siendo una one-page con anclas, o pasamos a un
   sitio multi-página con header y footer globales compartidos?
5. **Gestión del contenido.** ¿El texto se escribe directo en templates (como hoy) o introducimos
   constantes/JSON centralizados? Es una decisión técnica que condiciona el `design`.
6. **Datos reales vs. ilustrativos.** ¿El contenido puede mostrar cifras/métricas (tipo "miles de
   contratos") y, si sí, de dónde salen? Hay que evitar cifras inventadas.
7. **Assets.** ¿Existe material real (capturas del producto, logos de inmobiliarias clientes, fotos)
   o el contenido se apoya solo en texto/diagramas?
8. **Legal.** La BD maneja datos personales (inquilinos, propietarios, contratos). ¿Entran Términos
   y Condiciones y Política de Tratamiento de Datos en este cambio?
9. **SEO.** ¿Importa el posicionamiento orgánico (justificaría blog/recursos), o es un sitio
   cerrado para clientes a los que se llega por venta directa?
