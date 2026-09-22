# Design — logo-responsive

## Arquitectura

### 1. Origen y destino del asset de logo

- **Origen:** `C:\Users\wilso\Documents\Universidad Cooperativa De Colombia\6 Semestre\Curso UX\KUVU\fronted\proyecto_angular\public\login-backgrounds\Logo_Kuvu.jpeg`
- **Destino:** `fronted/proyecto_angular/public/Logo_Kuvu.jpeg`
- **Ruta pública:** `/Logo_Kuvu.jpeg` (los archivos en `public/` se sirven desde la raíz)

`public/` es el único assets root de Angular (definido en `angular.json`), y no requiere import en TS ni configuración adicional. La imagen se referencia con `<img src="/Logo_Kuvu.jpeg">` directamente en los templates.

### 2. Componentes que se modifican

| Componente | Cambio |
|---|---|
| `home.component.html` / `.scss` | Reemplazar `.logo-box` div por `<img>` + mantener texto KUVU |
| `login.component.html` / `.scss` | Reemplazar div `brand-logo` (gradiente con "K") por `<img>` |
| `landing.component.html` / `.scss` | Activar logo (descomentar) y usar `<img>` |
| `navbar.component.html` / `.scss` | Reemplazar emoji 🏢 por `<img>` pequeño |
| `sidebar.component.ts` / `.html` / `.scss` | Añadir overlay móvil, cerrar al navegar, toggle ≥44px |
| `shared.styles.scss` | Breakpoints consistentes, ajustes de tablas, filters, mant-cards |
| `dashboard.component.scss` | Stats grid → 1 columna móvil, padding reducido |
| `styles.css` | Breakpoint 768px consistente, no hay más cambios | 

### 3. Eliminación de kuvu_mobile/

Se elimina `kuvu_mobile/` completa del repo (git rm -r). No hay referencias en el frontend ni en el backend a esa carpeta, así que no hay dependencias rotas.

## Decisiones técnicas

### D-01: Breakpoints estándar (RF-13)

Se estandarizan los breakpoints en:

| Breakpoint | Valor | Uso |
|---|---|---|
| `sm` | `<640px` | Móvil |
| `md` | `>=640px` | Tablet pequeña |
| `lg` | `>=768px` | Tablet |
| `xl` | `>=1024px` | Desktop |
| `2xl` | `>=1280px` | Desktop grande |

Convención: máxima para el lado móvil (`@media (max-width: 639px)`), mínima para desktop (`@media (min-width: 768px)`).

**Cambios en cada archivo:**

- `home.component.scss`: actualiza `@media (width >= 768px)` — ya está correcto, usa `>=768px` que es consistente.
- `shared.styles.scss`: `@media (max-width: 500px)` → `639px`; `@media (max-width: 700px)` → `639px` y `767px` (mant-stats usa 2 columnas en tablet, 1 en móvil).
- `dashboard.component.scss`: `@media (max-width: 900px)` → `767px` para el grid de contenido y stats; agregar `@media (max-width: 639px)` para stats en 1 columna.
- `sidebar.component.scss`: `@media (max-width: 768px)` → `767px` (consistente con plataforma `max-width` estándar).
- `styles.css`: `@media (max-width: 768px)` → `767px`.
- `navbar.component.scss`: `@media (max-width: 900px)` → `767px`.

### D-02: Logo en HomePage (RF-01)

```html
<div class="logo-area">
  <img src="/Logo_Kuvu.jpeg" alt="KUVU" class="logo-img" />
  <span class="logo-text">KUVU</span>
</div>
```

```scss
.logo-img {
  @apply h-8 w-auto rounded flex-shrink-0;
  object-fit: contain;
}
```

- Alto fijo (32px) con `w-auto` para mantener proporción
- `object-fit: contain` evita distorsión
- No se fuerza ancho — la imagen se estira/se comprime según el alto
- En móvil el alto se mantiene en 28px para el navbar compacto

### D-03: Logo en Login (RF-02)

```html
<div class="brand">
  <img src="/Logo_Kuvu.jpeg" alt="KUVU" class="brand-logo-img" />
  <div class="brand-text">
    <span class="brand-name">KUVU</span>
    <span class="brand-tagline">GESTIÓN INTELIGENTE DE PROPIEDADES</span>
  </div>
</div>
```

- `.brand-logo-img`: alto 44px en desktop, 36px en móvil, `object-fit: contain`, `border-radius: 10px`
- El logo es colorido (foto), así que se elimina el gradiente azul-violeta del div `.brand-logo`
- Se puede mantener una sombra sutil para legibilidad sobre el fondo foto

**Nota:** el login tiene fondo con foto (`bg-photo`) + overlay oscuro. El logo jpeg ya tiene su propio fondo. En este caso se usa `mix-blend-mode` no — se muestra tal cual con un pequeño `border-radius`. El logo real trae su propio fondo (será un rectángulo). Se acepta como está — es la marca solicitada.

### D-04: Logo en Landing (RF-03)

```html
<div class="brand">
  <img src="/Logo_Kuvu.jpeg" alt="KUVU" class="brand-logo-img" />
  <div class="brand-text">
    <span class="brand-name">KUVU</span>
    <span class="brand-tagline">GESTIÓN INTELIGENTE DE PROPIEDADES</span>
  </div>
</div>
```

Igual que Login. Descomentar la marca y usar `<img>`.

### D-05: Logo en Navbar interno (RF-04)

```html
<div class="navbar__brand">
  <img src="/Logo_Kuvu.jpeg" alt="KUVU" class="navbar__logo-img" />
  <div class="navbar__brand-text">...</div>
</div>
```

- `.navbar__logo-img`: alto 28px, `w-auto`, `border-radius: 6px`, `object-fit: contain`
- En el sidebar se mantiene el avatar con inicial (ese es el brand de la empresa, no el de KUVU)

### D-06: Sidebar móvil con overlay (RF-09)

Se agrega un overlay al `sidebar.component.html`:

```html
@if (isMobile() && menuAbierto()) {
  <div class="sidebar__backdrop" (click)="cerrarMenu()"></div>
}
```

En el componente TS:

```ts
isMobile = signal(false);
menuAbierto = signal(false);

constructor() {
  // detectar tamaño de viewport
}

cerrarMenu() { this.menuAbierto.set(false); }
```

Con la primer línea del navegador mobile (100dvh vs 100vh) para el alto.

Diseño del comportamiento:
- En móvil (`<768px`): el sidebar está oculto por defecto (`translateX(-100%)`). Se muestra al hacer click en el backdrop **o** en el hamburger.
- El `sidebar__backdrop` es un div fijo con `background: rgba(0,0,0,.55)`, `z-index: 99` (inferior al sidebar que es `z-index: 100`).
- Al tocar el backdrop → se cierra el sidebar (`cerrarMenu()`).
- Al navegar (`routerLink` click) → se cierra el sidebar automáticamente en móvil.

El estado de colapso del desktop no debe afectar al móvil: en móvil el sidebar **siempre** se muestra expandido (transición completa con los textos), solo que deslizado fuera de pantalla. El `colapsado` del `SidebarService` solo aplica en desktop.

### D-07: Stats grid del Dashboard (RF-10)

```scss
.stats-grid {
  @media (max-width: 639px) { grid-template-columns: 1fr; }
  @media (min-width: 640px) and (max-width: 1023px) { grid-template-columns: 1fr 1fr; }
  @media (min-width: 1024px) { grid-template-columns: repeat(4, 1fr); }
}
```

`stats-grid--3` (usado donde haya 3 stats) con el mismo patrón pero `repeat(3, 1fr)` en desktop.

Dashboard header: `padding: 1rem` en móvil, `padding: 1.75rem 2.25rem` en desktop.

### D-08: Tablas con scroll horizontal (RF-11)

La solución actual (`.card { overflow-x: auto }` con `.tabla { min-width: 600px }`) ya permite scroll horizontal. Se mejora:

1. **Indicador visual de scroll:** se agrega una gradiente/doble sombra en el borde derecho del `.card` cuando hay contenido scrolleable. Implementación con un pseudo-elemento en CSS:

```scss
.card {
  // mantener overflow-x: auto
  &::after {
    content: '';
    position: sticky;
    right: 0;
    width: 24px;
    background: linear-gradient(90deg, rgba(255,255,255,0), rgba(0,0,0,.06));
    pointer-events: none;
  }
}
```

Esto es un refinamiento. En la práctica el scroll con `overflow-x: auto` sobre `.card` ya funciona; el indicador es una mejora visual opcional. Se implementa un indicador simple — una sombra interior en el borde derecho del card con `box-shadow` cuando el `.tabla` tiene `min-width`.

Simplificación: se mantiene `overflow-x: auto` en `.card` (ya existe) y se agrega a `.tabla` un `min-width: 100%` (en vez de fijo 600px en algunos casos) pero en realidad el `min-width: 600px` es la causa del scroll — se deja así porque las tablas tienen 6-8 columnas. El indicador visual: agregar `scrollbar-width: thin` y un borde sutil. 

### D-09: Filters y acciones móviles (RF-11)

- `.filtros-bar input { min-width: 210px }` → en móvil: `min-width: 100%` (o `min-width: 0; width: 100%`)
- `.filtros-bar__left` ya usa `flex-wrap: wrap` — en móvil se apilan
- Header actions de pagos: agregar `flex-wrap: wrap` + `justify-content: flex-end`

### D-10: Mantenimiento y usuarios (RF-12)

- `.mant-card`: agregar `flex-wrap: wrap` y en móvil `flex-direction: column`
- `.usuarios-grid`: `minmax(320px, 1fr)` → `minmax(min(100%, 320px), 1fr)` para evitar overflow en 320px
- `.usuario-card`: en móvil `flex-wrap: wrap`

### D-11: Touch targets >= 44px (RF-14)

Se agregan reglas globales en `styles.css`:

```css
@media (max-width: 639px) {
  .btn-primary, .btn-secondary, .btn-sm, .btn-login,
  .sidebar__link, .field-input, .search-input,
  button.hamburger-btn, button.navbar__hamburger {
    min-height: 44px;
  }
}
```

Y en componentes específicos donde el botón tenga padding pequeño se usa `min-height: 44px` directamente en móvil.

### D-12: Esto es un cambio solo de presentación

No se toca lógica de negocio. Los cambios a los `.ts` son:
- `sidebar.component.ts`: agregar `isMobile` signal + `cerrarMenu()` + suscripción a router events (o manejo en template con un método)
- No se tocan los demás `.ts` de los componentes

## Alternativas descartadas

### A-1: Convertir logo a WebP
**Descartada.** El logo es un JPEG y el navegador lo muestra correctamente. Convertir a WebP solo agregaría un paso de conversión sin beneficio significativo; además el archivo viene de otra carpeta del usuario y no queremos depender de herramientas de conversión externas.

### A-2: Mover logo a `src/assets/`
**Descartada.** Angular necesita configurar los assets de `src/assets` en `angular.json`, mientras que `public/` ya está configurado como assets root. Poner la imagen en `public/` es el camino de menor fricción y sin configuración adicional.

### A-3: Usar shared component `<app-logo>`
**Descartada.** Son 4 templates distintos con tamaños distintos. Un componente compartido agregaría complejidad innecesaria para reemplazar una etiqueta `<img>` — YAGNI.

### A-4: Usar Tailwind responsive utilities en componentes admin
**Descartada.** Los componentes admin usan SCSS con media queries. Introducir clases Tailwind solo en algunos no es consistente. Se mantiene la convención existente (SCSS + media queries) pero estandarizando breakpoints.

### A-5: Tablas adaptivas en tarjetas móviles
**Descartada.** Cambiar tablas de 6-8 columnas a tarjetas en móvil es un cambio de presentación importante que altera la densidad de información y no fue solicitado explícitamente. El scroll horizontal con indicador es suficiente y respeta el patrón existente.