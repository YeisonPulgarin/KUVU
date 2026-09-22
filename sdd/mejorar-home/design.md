# Fase Design: Mejorar Home Page

## Arquitectura y Decisiones Técnicas

### 1. Integración de Tailwind CSS (base, ya implementada)
- **Instalación y configuración:** Tailwind v4 instalado; la config vía CSS-first:
  `@import "tailwindcss"` + `@theme` en `src/styles.css`; PostCSS configurado en
  `postcss.config.json` con el plugin `@tailwindcss/postcss`.
- `home.component.scss` accede a utilidades/theme con `@reference "../../../styles.css";`
  para usar `@apply` sin duplicar CSS.

### 2. Gestión de Estado del Menú Móvil (base, ya implementada)
- `home.component.ts`: `isMobileMenuOpen = false` y `toggleMenu()`.
- Enlace con `[class.hidden]="!isMobileMenuOpen"` en `#mobile-menu`; botón
  `#hamburger-toggle` con `[attr.aria-expanded]` (selectores cubiertos por los tests).

### 3. Arquitectura CSS (`@apply`) (base, ya implementada)
- Clases semánticas en `home.component.scss` usando `@apply` de Tailwind, sin cargar el HTML
  con docenas de utilidades.

### 4. Extensión de contenido — estructura de la home
La home se reorganiza en secciones ancladas, todas estáticas (sin API), manteniendo el
navbar existente:

1. **Hero fullsize** — `min-h-screen` (alto de ventana), fondo de marca con gradiente,
   contenido centrado: titular, subtítulo y CTA "Acceder" → `routerLink="/acceder"`.
2. **¿Qué es KUVU?** — bloque de texto posicionando al sistema (administración de
   inmobiliarias multi-empresa).
3. **Servicios / Características** — grilla responsive (1 → 2-3 columnas) con tarjetas:
   gestión de locales, contratos, pagos, mantenimientos, usuarios.
4. **Compañías que confían** — lista de nombres: Amarilo, Nido Rent, Balcones de
   San Soucci, Mi Inmueble (textual, sin logos nuevos).
5. **CTA final** — bloque de cierre con "Ingresar a tu cuenta" → `routerLink="/acceder"`.

**Navbar ajustado:** los enlaces de escritorio y del drawer móvil apuntan a los anclajes de
las secciones (`#que-es`, `#servicios`, `#companias`, contacto) + acciones de sesión
("Mi cuenta" → `/acceder`). Se conserva el grupo de íconos (buscar/correo/WhatsApp) como
estaba.

**Eliminados:** banda "Quienes Somos" (`.hero-title`), sidebar (`.sidebar`), banner de imagen
(`.image-banner`) y la cuadrícula lateral (`.layout-grid` con 250px). Al eliminar `<main
class="main-content">` se resuelve de paso la colisión con la regla global
`.main-content { margin-left: var(--sidebar-w); ... }` de `styles.css` que rompía la home.

### 5. Breakpoints y Mobile-First
- Breakpoints nativos de Tailwind v4 (`@media (width >= 768px)`) y utilidades `md:`.
- Hero: `min-h-screen` en todas las resoluciones, texto centrado; grilla de servicios 1
  columna → 3 en `lg:`.
- Navbar y drawer móvil ya implementados; no cambian su comportamiento.

## Alternativas Descartadas
- **Clases en línea absolutas:** se mantiene la decisión de `@apply` con clases semánticas.
- **Librería de UI (Angular Material/Bootstrap):** descartada; secciones construidas con
  CSS propio + Tailwind.
- **Imágenes/logos reales de compañías:** descartado por no existir assets; se usan nombres
  textuales.
- **Modificar otras vistas o agregar formularios/API:** fuera de alcance; el contenido es
  estático y el CTA solo navega a `/acceder`.