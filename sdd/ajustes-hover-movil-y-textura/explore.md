# Explore — ajustes-hover-movil-y-textura

Contexto: `sdd/sdd-init.md`. Rutas relativas a `frontend/proyecto_angular/src/`.

## 1. Feedback de las opciones del menú hamburguesa

### Qué existe hoy
- `app/components/public/site-header/site-header.component.scss`: `.mobile-item` cambia en
  `:hover` y `:focus-visible` (color `--color-brand-600`, tinte 14 %, subrayado de
  `.mobile-label` que pasa de `0` a `100% 2px`); con `no-preference` hay transición y
  `translateX(12px)`. No hay `@media (hover)` ni `(pointer)`, ni límite de ancho: aplica en todo
  el rango del menú (< 1024 px).
- Se comprobó el CSS compilado (`ng build`, chunk del header en `dist/proyecto-dss/browser/`):
  las reglas llegan completas y con el encapsulado correcto (`.mobile-menu .mobile-item:hover
  .mobile-label { background-size: 100% 2px }`). Nada las pisa: `.is-active` solo agrega
  tinte y barra, y `scroll-trail.scss` no toca `.mobile-*`.
- `site-header.component.html`: cada enlace del panel hace `(click)="closeMenu(false)"` y
  además el header cierra el menú en cada `NavigationEnd`.

### Causa real de que "no se vea"
En vista responsive con emulación táctil (DevTools device mode) o en un dispositivo táctil no
existe hover: el estado solo aparece al tocar. El toque dispara `click` de inmediato, y el
`click` cierra el panel en el mismo instante (más la navegación). La opción tocada nunca llega
a mostrar el cambio: el panel se desvanece en 200 ms antes de que el subrayado (350 ms)
avance. Tampoco hay estilo de `:active` para la duración del toque.

## 2. Textura del fondo de la app interna

### Qué existe hoy
- `app/components/shared/shared.styles.scss`: `.app-layout .main-content` pinta
  `linear-gradient(color-mix(--color-bg 93 %, transparent))` sobre `$grain var(--color-bg)`.
  `$grain` (`styles/_grain.scss`) es ruido fractal gris opaco de 180 px.
- `styles.css`: `.main-content { background: var(--color-bg) }` (especificidad menor; la regla
  de `.app-layout .main-content` gana, comprobado en el CSS compilado).
- Todas las pantallas internas de ambos roles (dashboard —que es la vista del arrendatario y
  del administrador—, locales, contratos, pagos, mantenimiento, usuarios) están dentro de
  `<app-layout>`; sus contenedores de página (`.page`, `.dashboard`) no tienen fondo propio.
  Solo las tarjetas y tablas son blancas (intencional).

### Causa real de que "se vea plano"
El velo del 93 % deja pasar el 7 % del ruido. El ruido fractal gris varía ±~0.15 alrededor
del gris medio, así que la variación visible es de ~3 niveles de 255: imperceptible. Además,
bajar el velo con ese mismo ruido oscurece todo el fondo (el gris medio del ruido arrastra la
media), y eso baja el contraste del texto gris que va directo sobre el fondo.

## Archivos relevantes
- `app/components/public/site-header/site-header.component.{ts,html,scss,spec.ts}`
- `app/components/shared/shared.styles.scss`, `styles/_grain.scss`
- `app/components/shared/app-layout/app-layout.component.spec.ts`

## Ambigüedades (resueltas en modo automático)
1. **Toque:** la opción tocada muestra el estado (color, subrayado que crece, desplazamiento)
   y el panel se cierra después de una pausa breve (~300 ms); la navegación no se demora. La
   pausa aplica también con movimiento reducido (es tiempo para ver el cambio, no movimiento).
2. **Textura:** grano de motas oscuras con transparencia (media cercana al fondo, picos
   visibles) en lugar del ruido gris bajo velo, más un degradado radial suave con el color de
   la empresa (que vive en `<app-layout>`). Tarjetas y tablas siguen lisas.
