# Menú con scroll-spy, rastro de secciones y hover visible

En la home, el menú del sitio marca la sección que el visitante está leyendo y, bajo la barra
del header, un rastro acumula los ítems recorridos ("Inicio › Servicios › Nosotros…"). En el
menú móvil, la opción bajo el cursor o con foco se distingue a simple vista. El orden de los
nombres del equipo coincide con su posición en las fotos.

## Cómo funciona

Rutas relativas a `frontend/proyecto_angular/src/app/`.

### Mapa de secciones

`content/site.ts` exporta `homeSpySections`: la **primera** sección de la home de cada ítem
del menú, en el orden de `siteNavLinks` (un test lo garantiza). Las secciones intermedias
pertenecen al ítem anterior:

| Secciones de la home (`id`) | Ítem |
|---|---|
| `inicio`, `que-es`, `como-funciona` | Inicio |
| `servicios`, `seguridad`, `companias` | Servicios |
| `equipo`, `origen` | Nosotros |
| `faq` | Preguntas frecuentes |
| `contacto` (banda final) | Contacto |

Una sección nueva que inicie la parte de otro ítem se agrega a `homeSpySections`.

### `SectionSpyService`

`components/public/site-header/section-spy.service.ts`, `providedIn: 'root'`.

- `HomeComponent` lo arranca con `afterNextRender` (`start(homeSpySections)`) y lo apaga en
  `ngOnDestroy` (`stop()`). Fuera de la home está detenido: `activeHref()` es `null` y
  `trail()` está vacío.
- Un listener `scroll` y uno `resize`, pasivos y fuera de la zona de Angular, se coalescen en un
  `requestAnimationFrame`. En cada frame lee el borde superior de cada sección y aplica
  `activeSectionIndex(tops, line, atBottom)`: la última sección cuyo borde superior pasó la
  línea de lectura (`max(offset de anclas, 35 % del viewport)`); al fondo de la página, la
  última (la banda de contacto es corta y nunca llega a la línea). Solo re-entra a la zona
  cuando el índice cambia.

### Header

`components/public/site-header/site-header.component.ts`:

- `pageHref`: ítem que coincide con la URL (exacto para `/`, prefijo para el resto).
- `activeHref = spy.activeHref() ?? pageHref()` → clase `is-active` (escritorio y móvil).
- `aria-current="page"` siempre sigue a `pageHref`: en la home queda en Inicio aunque el
  resaltado se mueva.
- Rastro `nav.scroll-trail` ("Recorrido de la página"), visible con el header compacto, el menú
  cerrado y el spy activo. Cada paso anterior es `<a routerLink="/" [fragment]="id">`; el
  último es `<span aria-current="location">`. Estilos en `site-header/scroll-trail.scss`:
  `position: absolute; top: 100%` dentro de `.site-header`, así no ocupa lugar en el flujo.
  Cada paso nuevo entra con una animación corta solo en `prefers-reduced-motion:
  no-preference`.
- `scroll-offset.ts` suma el alto del rastro al offset de anclas, así un salto desde el rastro
  deja la sección debajo del header y del rastro.

### Hover del menú móvil

El texto de cada opción va en `.mobile-label`. En hover y `:focus-visible`: color
`--color-brand-600`, tinte de marca al 14 % y un subrayado de 2 px (gradiente en
`background-image`) que pasa de ancho 0 a 100 %. Con movimiento, el subrayado crece con
transición y la opción se desplaza 12 px; con movimiento reducido el color, el tinte y el
subrayado aparecen sin animación.

### Orden del equipo

`content/team.ts` (`members`) lista los nombres de izquierda a derecha como están en las
fotos grupales: Carlos Arciniegas, Wilson Solano, Yeison Pulgarin. La banda de la home y el
pie de la galería de `/nosotros` lo leen de ahí.

## Decisiones

- **Spy solo en la home.** Es la única página cuyas secciones corresponden a ítems del menú.
  Las páginas internas resaltan por ruta y conservan su `app-breadcrumb` estático
  "Inicio › Página" (que publica el JSON-LD `BreadcrumbList`). El rastro de la home no publica
  JSON-LD: describe un recorrido dentro de una página, no una jerarquía de páginas.
- **Resaltado distinto de `aria-current`.** Los ítems siguen navegando a sus páginas; marcar
  `/servicios` como "página actual" estando en `/` sería falso para lectores de pantalla.
- **Rastro dentro del header, en posición absoluta.** Hereda la posición sticky sin medir
  alturas y no produce saltos de layout al aparecer. Tradeoff: tapa una franja de ~30 px del
  contenido mientras el header está compacto.
- **Cálculo por scroll en lugar de `IntersectionObserver`.** Da directamente "la última
  sección que pasó la línea" y es determinista en tests; el costo es 5 lecturas de layout por
  frame de scroll.
- **Servicio raíz.** Home (productor) y header (consumidor) no comparten otro injector.

## Limitaciones conocidas

- La URL no se sincroniza con la sección al scrollear (sigue en `/`).
- Las secciones sin ítem en el menú (qué es, seguridad, compañías, origen) no agregan pasos al
  rastro.
- `pathOf` está duplicado en `anchor-smooth-scroll.ts` y en el header (registrado en
  `refine`, Regla de Tres).
