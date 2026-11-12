# Design — menu-hover-scrollspy-breadcrumb

Referencias: `propose.md`, `spec.md` (RF-1 a RF-6, CA-1 a CA-9). Rutas relativas a
`frontend/proyecto_angular/src/app/`.

## Vista general

| Pieza | Archivo | Cambio |
|---|---|---|
| Mapa sección → ítem del menú | `content/site.ts` (`homeSpySections`) | dato nuevo |
| Orden del equipo | `content/team.ts` | reorden de `members` |
| Servicio de sección activa | `components/public/site-header/section-spy.service.ts` (+ spec) | nuevo, `providedIn: 'root'` |
| Header: resaltado y rastro | `site-header.component.{ts,html,spec.ts}` | edición |
| Estilos del rastro | `site-header/scroll-trail.scss` | hoja nueva, sumada por `styleUrls` |
| Hover/focus del menú móvil | `site-header.component.scss` (bloque `.mobile-item`) | edición |
| Offset de anclas | `scroll-offset.ts` (+ spec) | suma el alto del rastro |
| Home | `home.component.{html,ts}` | `id="contacto"` en la banda final; arranca/apaga el spy |

## D1 — Mapa de secciones como contenido

`homeSpySections: readonly { id: string; href: string }[]` lista, en orden de la home, la
**primera** sección de cada ítem del menú: `inicio → /`, `servicios → /servicios`,
`equipo → /nosotros`, `faq → /preguntas-frecuentes`, `contacto → /contacto`. Las secciones
intermedias heredan el ítem de la anterior, así que el mapa de RF-2 sale sin enumerar todas.
Un test garantiza que los `href` coinciden, en el mismo orden, con `siteNavLinks`: el índice
de sección activa es entonces también la longitud del rastro.

## D2 — `SectionSpyService` (raíz)

- Raíz porque lo comparten la home (productor) y el header (consumidor), que no tienen
  injector común salvo el raíz. La home lo apaga en `ngOnDestroy`, así que fuera de la home
  queda inerte (RF-3, CA-6).
- Estado: `index = signal(-1)`. Derivados: `activeHref` (`href` o `null`) y `trail`
  (`NavItem & { fragment }` de los ítems 0..index, con etiquetas de `sitePages`).
- `start(sections)`: resuelve los elementos por id, agrega un `scroll` y un `resize`
  pasivos sobre `window`, recalcula en un solo `requestAnimationFrame` por ráfaga y calcula
  una vez de entrada. `stop()`: quita listeners, cancela el frame y deja `index = -1`.
- Cálculo puro exportado `activeSectionIndex(tops, line, atBottom)`: si `atBottom`, el
  último; si no, el último índice con `top <= line`; si ninguno, `0` cuando hay secciones.
  `line = max(offset de anclas, 35 % del alto del viewport)`: la sección cuenta como actual
  cuando su borde superior ya pasó por debajo del header y el rastro hasta el tercio superior.
  `atBottom` cubre la banda de contacto, que es corta y nunca llega a esa línea.
- El listener corre fuera de la zona de Angular y re-entra con `zone.run` solo cuando el
  índice cambia: el scroll no dispara detección de cambios en cada evento.
- Descartado: `IntersectionObserver` con `rootMargin`. Da eventos por sección y no un "último
  que pasó la línea"; con secciones de alturas muy distintas y la banda corta del final
  necesita igual la regla del fondo. El cálculo por scroll es determinista y testeable.
- Descartado: proveerlo en la home. El header vive en el template de la home pero el
  servicio lo necesitan también las páginas internas (para saber que está apagado).

## D3 — Resaltado del header

El header deja `routerLinkActive` y calcula dos signals:
- `pageHref`: `href` del menú que coincide con la URL actual (exacto para `/`, prefijo para
  los demás), actualizado en cada `NavigationEnd`.
- `activeHref = spy.activeHref() ?? pageHref()`.

Template (escritorio y móvil): `[class.is-active]="activeHref() === link.href"` y
`[attr.aria-current]="pageHref() === link.href ? 'page' : null"`. Así el resaltado sigue a la
sección pero `aria-current` dice la verdad sobre la página (RF-2). Se conserva la clase
`is-active`, así los estilos existentes aplican sin cambios.

## D4 — Rastro (breadcrumb acumulativo) en el header

- Vive en el header porque es la pieza fija que ya está arriba; ponerlo en la home exigiría
  medir el header para pegarse debajo.
- `<nav class="scroll-trail" aria-label="Recorrido de la página">` dentro de `.site-header`,
  `position: absolute; top: 100%`: no ocupa lugar en el flujo (sin salto de contenido, RF-4).
  Superficie propia (mismo color translúcido que el header compacto, borde inferior).
  `backdrop-filter` en el rastro es seguro: no es ancestro de `.mobile-menu`.
- Visible con `isCompact() && trail().length > 0 && !isMenuOpen()`.
- `<ol>` con `@for (track href)`: los ítems no finales son `<a routerLink="/" [fragment]>`
  (el scroll suave y el offset de anclas de la misma página aplican solos); el final es
  `<span aria-current="location">`. Separador `›` `aria-hidden`, como `app-breadcrumb`.
- Animación de entrada por `@keyframes` en el `<li>` nuevo (opacidad + 6 px), solo en
  `no-preference`. Hoja `scroll-trail.scss` aparte (decisión del pedido: estilos nuevos en
  hojas aparte); usa tokens `--color-home-*`, `--color-brand-600` y `_motion.scss`.
- Ancho chico: una línea con `white-space: nowrap` y `overflow-x: auto` (scrollbar oculta);
  con ≤ 5 ítems y `0.8125rem` entra en 360 px.
- No publica JSON-LD: el `BreadcrumbList` describe jerarquía de páginas, y la home no la tiene.

## D5 — Offset de anclas

`headerScrollOffset` suma el alto de `.scroll-trail` si existe dentro del header (CA-7), para
que la sección destino no quede tapada (RF-5).

## D6 — Hover/focus del menú móvil (RF-1)

El texto del enlace se envuelve en `<span class="mobile-label">`. Subrayado de 2 px hecho con
`background-image: linear-gradient(currentColor, currentColor)` en el span,
`background-size: 0 2px` → `100% 2px` en hover/foco (crece de izquierda a derecha; funciona
con texto en varias líneas). En hover/foco: color `--color-brand-600`, tinte de fondo 12 %,
y con movimiento, `translateX(10px)` y transición del `background-size`. Fuera del bloque de
movimiento las reglas de color y subrayado aplican igual (sin transición). El ítem activo
mantiene su barra y tinte; el subrayado solo aparece en hover/foco, así se distingue "estoy
aquí" de "voy aquí".

## D7 — Orden del equipo

`members` en `content/team.ts` pasa a `['Carlos Arciniegas', 'Wilson Solano',
'Yeison Pulgarin']`. Home y `/nosotros` lo leen de ahí; las fotos son grupales y no cambian.

## Logs
Cambio de UI sin eventos de negocio: no agrega logs (política en `DEVELOPMENT_GUIDELINES.md`).
