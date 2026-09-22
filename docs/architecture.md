# Arquitectura del proyecto

Esta es la arquitectura de alto nivel de **KUVU (ArrendApp)**: componentes, capas, flujos
principales y decisiones estructurales. La mantiene al día la fase `document` del flujo SDD en
cada cambio que toca la arquitectura. No reemplaza a `docs/{change-name}.md` (que documenta un
cambio puntual): esto es la vista estable del sistema.

## Vista de componentes

| Componente | Rol | Tecnología |
|---|---|---|
| Frontend Angular | Sitio público de marketing + app autenticada de gestión | Angular (standalone, signals), Tailwind CSS v4 |
| Backend API | API REST de la app de gestión (auth, empresas, usuarios, locales, contratos, pagos, mantenimiento) | Node.js + Express |
| Base de datos | Persistencia del backend de gestión | MySQL / MariaDB (`bd_arrendamientos.sql`) |

El frontend es la fuente de verdad observable: el sitio público es contenido estático servido
por la propia SPA (sin API), y la app autenticada hoy consume datos mock (los métodos de
`DataService` conectarán con la API REST del backend).

## Componentes del frontend — dos clústeres

### Clúster público (marketing)

- `src/app/content/` — contenido institucional en módulos TS tipados (site, services,
  companies, howItWorks, benefits, security, origin, about, faq, logo), fuente única del texto.
- `src/app/components/public/site-header/` y `site-footer/` — chrome compartido (logo, nav,
  CTA "Ingresar", WhatsApp, toggle de tema; footer con marca y navegación). El logo son 4
  variantes (completo/símbolo × claro/oscuro); header y footer alternan por tema vía
  `isDark()` y por viewport con el breakpoint `768px`.
- `frontend/proyecto_angular/public/logo-rediseno/` — los 4 PNG del logo (light/dark ×
  completo/responsive), con rutas centralizadas en `content/logo.ts`; el favicon de
  `src/index.html` apunta al símbolo light como PNG.
- `src/app/components/pages/nosotros/` y `preguntas-frecuentes/` — las páginas secundarias,
  lazy en `app.routes.ts`, con la misma columna de chrome.
- `src/app/components/home/` — la home: hero + secciones que leen de `content/`, header y
  footer compartidos.
- `src/app/services/theme.service.ts` — tema claro/oscuro persistido en `kuvu-theme`.
- `src/app/services/page-meta.service.ts` — `title` y `meta description` por página.
- `src/app/directives/reveal.directive.ts` — reveals `[data-reveal]` con
  `IntersectionObserver` y respeto de `prefers-reduced-motion`.

### Clúster autenticado (app de gestión)

- `components/landing/` (`/acceder`) — selección de inmobiliaria, orquesta la intro.
- `components/login/` (`/login`) — credenciales de la empresa seleccionada (correo + documento).
- `components/dashboard|locales|contratos|pagos|mantenimiento|usuarios/` — módulos de gestión,
  lazy, protegidos por `authGuard`/`adminGuard`.
- `services/auth.service.ts`, `data.service.ts`, `intro-state.service.ts` — sesión, datos
  (mock) y estado de la intro.

## Capas

- **Frontend standalone**: cada componente declara sus imports; no hay NgModules. Los datos
  viven en servicios (`providedIn: 'root'`) y los textos del sitio público en módulos de
  contenido puros sin estado.
- **Backend Express**: capa de rutas (`routes/{auth,empresas,usuarios,locales,contratos,pagos,mantenimiento}.js`)
  sobre `db.js` (mysql2). API REST JSON bajo `/api/*`, CORS habilitado para el frontend.

## Flujos principales

### Navegación pública

```
Visitante → SPA →
  '/'            → HomeComponent (hero + secciones de content/)
  '/nosotros'    → NosotrosComponent (lazy) → PageMetaService (title + description)
  '/preguntas-frecuentes' → PreguntasFrecuentesComponent (lazy) → PageMetaService
```

Todas renderizan `SiteHeader` + `SiteFooter`; los reveals se disparan por IntersectionObserver.

### Acceso autenticado

```
Usuario → '/acceder' (selección de empresa) → '/login' (correo + documento)
  → dashboard / contratos / pagos / mantenimiento (/ locales, /usuarios si admin)
```

Las rutas de gestión pasan por `authGuard` (cualquier rol) y, locales/usuarios, por
`adminGuard` (idRol === 1). El wildcard `**` redirige a `/login`.

## Decisiones estructurales

- **Contenido del sitio en módulos TS tipados** (`content/*.ts`) en lugar de texto embebido.
  Tradeoff: un cambio de copy toca código, pero el texto queda testeable y reutilizable entre
  la home y las páginas (el FAQ corto es subconjunto del completo).
- **Chrome compartido del sitio** (header/footer/theme/reveal) para las tres páginas públicas.
  Tradeoff: el header soporta dos modos de nav (anclas en home, rutas en páginas) vía input.
- **Rutas del sitio público lazy** (`loadComponent`). Tradeoff: un poco de latencia al
  navegar; no se paga el bundle de las páginas en la home.
- **Tema oscuro por clase `.dark`** (no `prefers-color-scheme`): el toggle es manual y se
  persiste en `localStorage`; `index.html` aplica la clase antes del bootstrap para evitar el
  flash.
- **Logo multi-variante con swap por CSS+TS**: dos `<img>` por punto de marca con `[src]`
  bindeado al tema y visibilidad resuelta en el breakpoint `768px`. Tradeoff: duplica el
  markup del logo en header y footer (2 usos, se revisa ante un tercero) a cambio de no
  pagar `<picture>`/`srcset` ni recarga al alternar tema.
- **Sitio público sin API**: textos estáticos en el bundle. Tradeoff: el contenido no cambia
  sin redeploy; nada que proteger expuesto ni latencia de red en el sitio.

## Límites y no-goals

- El sitio público no consume backend; no hay contacto/captación (solo WhatsApp), ni blog,
  legal, precios ni multilingüismo por ahora.
- La app autenticada usa datos mock en `DataService`; la conexión a la API REST es trabajo
  pendiente.
- La seguridad del contenido es solo descriptiva: no se publican mecanismos internos.
- Deuda registrada: `pagos.component.ts` usa `document.write` (work item de seguridad
  dedicado); la columna de chrome de las páginas secundarias está duplicada hasta una tercera
  página del mismo tipo.