# Breadcrumb y banda final legible

Las páginas públicas internas (`/nosotros` y `/preguntas-frecuentes`) muestran un breadcrumb
"Inicio › {Página}" arriba del título y publican el mismo recorrido como datos estructurados
schema.org (`BreadcrumbList`). La banda final de la home ("¿Listo para administrar tus
inmobiliarias?") conserva su fondo verde aunque Tailwind no emita el token de marca, y su botón
"Ingresar" usa el azul de los botones primarios con texto blanco. Así la sección se lee en modo
claro y oscuro.

## Cómo funciona

### Breadcrumb

- `frontend/proyecto_angular/src/app/components/public/breadcrumb/breadcrumb.component.ts`:
  `app-breadcrumb`, standalone y OnPush, con template inline. Recibe
  `items: readonly NavItem[]` (input requerido). Renderiza
  `<nav aria-label="Ruta de navegación"><ol>` con un `<li>` por ítem: los ítems intermedios
  son `<a routerLink>` y el último es `<span aria-current="page">`. El separador `›` es un
  `<span aria-hidden="true">`, que los lectores de pantalla no anuncian.
- Ciclo de vida: en `ngOnInit` llama a `PageMetaService.setBreadcrumb(items)` y en
  `ngOnDestroy` a `clearBreadcrumb()`. El JSON-LD existe mientras la página está montada y
  desaparece al navegar a otra ruta.
- Ítems: `breadcrumbFor(href)` en `src/app/content/site.ts` devuelve `[Inicio, página]`
  tomados de `pageNavLinks`, así que las etiquetas coinciden con el menú del sitio. Lanza
  error si `href` no es una página interna de `pageNavLinks` (incluida `/`).
- Uso en una página: `readonly breadcrumb = breadcrumbFor('/nosotros')` y
  `<app-breadcrumb [items]="breadcrumb">` dentro de `.page-hero`, antes del `h1`.
- Estilos (`breadcrumb.component.scss`): lista en fila con `flex-wrap`, centrada, 0.875rem.
  Los colores usan `var(--color-home-muted, #4c5a4e)` y `var(--color-home-text, #1f2920)`
  con fallback, porque esos tokens no existen en runtime en modo claro (ver Decisiones).

### JSON-LD

`src/app/services/page-meta.service.ts`:

- `setBreadcrumb(items)` publica en `<head>` un único
  `<script type="application/ld+json" id="kuvu-breadcrumb-jsonld">` con un `BreadcrumbList`.
  Cada `ListItem` lleva `position` (desde 1), `name` (la etiqueta) e `item`, una URL absoluta
  armada con `document.location.origin + href`. Si el script ya existe, reemplaza su
  contenido.
- `clearBreadcrumb()` elimina ese script.
- El JSON se asigna con `textContent`, nunca como HTML.
- `setPage(title, description)` fija título y meta descripción por página.

### Banda final de la home

Bloque `.cta-final` en `src/app/components/home/home.component.scss`:

- Fondo: `var(--color-brand-700, #2f4a2f)`.
- Botón "Ingresar" (`class="btn-primary cta-button"`): el gradiente azul viene de
  `.btn-primary` (`components/shared/shared.styles.scss`), igual que en el hero y el header.
  El bloque local fija texto blanco, la forma pill y un `:focus-visible` con contorno blanco
  de 2px y offset 3px.

Contrastes medidos en el build (modo claro y oscuro):

| Elemento | Contraste |
|---|---|
| Titular de la banda | 9.81 : 1 |
| Párrafo de la banda | 7.63 : 1 |
| Botón en reposo | 4.72 : 1 (extremo claro del gradiente) a 8.35 : 1 |
| Botón en hover (opacidad 0.92) | ≥ 5.03 : 1 |
| Foco del botón contra la banda | 9.81 : 1 |
| Breadcrumb: enlace y página actual | 13.61 : 1 (claro), 14.05 : 1 (oscuro) |
| Breadcrumb: separador | 6.60 : 1 (claro), 7.37 : 1 (oscuro) |

Tests: `breadcrumb.component.spec.ts`, `page-meta.service.spec.ts` › 'breadcrumb JSON-LD',
`describe('breadcrumb')` en las specs de las dos páginas y `home.component.spec.ts` ›
'cta final legible'.

## Decisiones

- **El componente publica el JSON-LD, no cada página.** El breadcrumb visible y los datos
  estructurados salen del mismo `items`, así que no pueden divergir, y la limpieza queda atada
  a la vida del componente. Tradeoff: un componente presentacional tiene un efecto sobre
  `<head>`. Si alguna vez hace falta el breadcrumb sin JSON-LD, hay que separar esa
  responsabilidad.
- **Breadcrumb declarado por página, no derivado del router.** Con dos páginas de un nivel,
  `data.breadcrumb` + `ActivatedRoute` sería abstracción sin uso. Si aparecen rutas anidadas,
  conviene reconsiderarlo.
- **URLs absolutas sobre `location.origin`.** El sitio no tiene dominio de producción, así que
  las URLs reflejan el origen donde corre la app. Al definir un dominio, alcanza con cambiar
  el origen en `setBreadcrumb`.
- **Fallback literal en los tokens de Tailwind.** Tailwind v4 emite al CSS global solo las
  variables de `@theme` cuyo nombre encuentra al escanear archivos, y los usos dentro de los
  SCSS de componentes no cuentan. `--color-brand-700` aparece en el build solo porque su
  nombre figura en un archivo escaneado. Por eso `.cta-final` y el breadcrumb usan
  `var(--token, valor)`. Mencionar nombres de tokens en archivos `.ts`/`.html` cambia lo que
  emite Tailwind; los tests arman esos nombres por partes.
- **El botón reutiliza `.btn-primary`** en lugar de copiar el gradiente localmente, para
  mantenerlo igual al hero y al header. Tradeoff: su contraste depende de
  `--color-secundario` (`#3A6FD8`). Si ese token se aclara, el texto blanco baja de 4.5 : 1.

## Limitaciones conocidas

- El JSON-LD usa el origen local (por ejemplo `http://localhost:4200/nosotros`) mientras no
  haya dominio. Su validación con herramientas de resultados enriquecidos queda pendiente
  hasta entonces.
- La app es solo cliente: el JSON-LD existe después de que Angular renderiza la página (sin
  SSR ni prerender).
- El breadcrumb solo existe en `/nosotros` y `/preguntas-frecuentes`. La home, `/acceder`,
  `/login` y el módulo de gestión no lo tienen.
- El indicador de foco del breadcrumb en modo claro usa el contorno global del sitio
  (`#6b8e6b`) y da 3.33 : 1, cerca del mínimo de 3 : 1.
- Deuda registrada: el resto de tokens de Tailwind (`--color-home-*`, `--radius-*`,
  `--color-brand-100/200/300/600`) no existe en runtime en modo claro. La home en claro usa el
  fondo `#f0f4f8` del `body`. El arreglo de raíz (`@theme static` o valores en `:root`) es un
  cambio propio.
- Deuda registrada: `@angular/router` 21.2.23 tiene un aviso de DoS que solo afecta a SSR (no
  alcanzable hoy). Queda pendiente actualizar `@angular/*` a ≥ 21.2.24, con prioridad alta si
  se incorpora SSR.
