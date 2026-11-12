# Explore — menu-hover-scrollspy-breadcrumb

Contexto de stack y convenciones: `sdd/sdd-init.md`. Base: cambio archivado `ajustes-logo-menu-app`.

## Qué existe hoy

### Header público (`components/public/site-header/`)
- `SiteHeaderComponent` es el único header del sitio público; lo montan `HomeComponent` y
  `app-public-page` (páginas internas). Host `position: sticky; top: 0; z-index: 50`.
- Navegación: `siteNavLinks` (`content/site.ts`) = Inicio `/`, Servicios `/servicios`,
  Nosotros `/nosotros`, Preguntas frecuentes `/preguntas-frecuentes`, Contacto `/contacto`.
  Son **rutas** (páginas separadas, lazy), no anclas.
- Estado activo: `routerLinkActive="is-active"` + `ariaCurrentWhenActive="page"`, `exact` solo
  para `/`. Depende solo de la URL: en la home queda marcado "Inicio" durante todo el scroll.
- Menú móvil `.mobile-menu` (panel `position: fixed`). Hover/focus de `.mobile-item`: color
  `--color-brand-600` + fondo de marca al 8 % + `translateX(6px)` (solo con movimiento). El
  ítem activo usa 12 % + barra de 3 px. Diferencia entre hover y reposo: casi imperceptible
  (el texto ya es oscuro y el tinte al 8 % es tenue).
- Estado compacto: `isCompact` pasa a true con `scrollY > 24` (listener `scroll` pasivo).
- `site-header.component.scss` pesa 7.9 kB (lejos del presupuesto de 20 kB).

### Home (`components/home/home.component.html`)
Una sola página con secciones con `id`, en este orden: `inicio` (hero), `que-es`,
`como-funciona`, `servicios`, `seguridad`, `companias`, `equipo`, `origen`, `faq`,
`cta-final` (sin `id`; enlaza a `/contacto`). Provee `ScrollMotionService` (no root).

### Páginas internas
`/servicios`, `/nosotros`, `/preguntas-frecuentes`, `/contacto`, `/legal` usan
`app-public-page`. `/nosotros` y `/preguntas-frecuentes` muestran `<app-breadcrumb>` estático
"Inicio › Página" (`breadcrumbFor`, `content/site.ts`) que además publica JSON-LD
`BreadcrumbList` (`PageMetaService`). Las secciones de esas páginas no corresponden a ítems
del menú.

### Anclas
`withInMemoryScrolling({ anchorScrolling: 'enabled' })`, offset por
`headerScrollOffset` (`scroll-offset.ts`, mide el alto de `app-site-header`) y scroll suave
solo para anclas de la misma página pública (`anchor-smooth-scroll.ts`).

### Equipo
`content/team.ts` es la fuente única: `members = ['Wilson Solano', 'Carlos Arciniegas',
'Yeison Pulgarin']`. Se muestra unido con " · " en la banda de la home
(`team-band`) y en el `figcaption` de `/nosotros`. Las fotos son grupales (las tres
personas en cada una): no hay foto ni rol por persona que reordenar. Tests que fijan el orden:
`content/content.spec.ts`, `home.component.spec.ts` (≈ l. 258), `nosotros.component.spec.ts`
(≈ l. 108).

## Archivos relevantes
- `components/public/site-header/site-header.component.{html,ts,scss,spec.ts}`
- `components/home/home.component.{html,ts,spec.ts}`
- `content/site.ts`, `content/team.ts`, `content/content.spec.ts`
- `scroll-offset.ts` (+ spec), `motion/motion-preferences.ts`
- `components/pages/nosotros/nosotros.component.spec.ts`

## Ambigüedades (clarify fusionado, resueltas por el orquestador en modo automático)
1. **¿Dónde aplica el scroll-spy?** Solo en la home: es la única página cuyas secciones
   corresponden a ítems del menú. En las páginas internas el activo sigue siendo la ruta.
2. **¿Qué sección marca cada ítem?** Inicio: `inicio`…`como-funciona`; Servicios:
   `servicios`, `seguridad`, `companias`; Nosotros: `equipo`, `origen`; Preguntas
   frecuentes: `faq`; Contacto: banda final (se le da `id="contacto"`).
3. **¿Los ítems del menú siguen navegando a las páginas?** Sí. El spy cambia solo el
   resaltado; `aria-current="page"` sigue indicando la página real (Inicio en la home).
4. **¿Dónde va el breadcrumb que crece?** Solo en la home, como franja fija bajo la barra
   del header (dentro del header, posicionada en absoluto: no desplaza el contenido), visible
   desde que el header pasa a compacto. Acumula los ítems del menú desde Inicio hasta la
   sección actual; al subir, se recorta. Cada ítem no final es un ancla a su sección.
   Las páginas internas conservan su breadcrumb estático "Inicio › Página".
5. **Orden del equipo:** Carlos Arciniegas · Wilson Solano · Yeison Pulgarin, en la fuente
   única `content/team.ts`; las fotos grupales no cambian.
