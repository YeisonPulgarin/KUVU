# Spec — logo-responsive

## Requisitos funcionales

### RF-01: Logo real en HomePage

**Given** un usuario visita la HomePage de KUVU
**When** se carga la página
**Then** se muestra la imagen `Logo_Kuvu.jpeg` como logo en el navbar, en lugar del cuadrado CSS verde actual

- El logo se carga desde `/Logo_Kuvu.jpeg` (carpeta `public/`)
- Mantener el texto "KUVU" al lado del logo
- El logo debe ser visible y con proporciones correctas en pantallas de 320px a 2560px

### RF-02: Logo real en Login

**Given** un usuario visita la pantalla de Login
**When** se carga la página
**Then** se muestra la imagen `Logo_Kuvu.jpeg` como brand-logo, en lugar del div gradiente con "K"

- Reemplazar `<div class="brand-logo">K</div>` por `<img>`
- Mantener el texto "KUVU" y el tagline junto al logo

### RF-03: Logo real en Landing

**Given** un usuario visita la Landing (selección de empresa)
**When** se carga la página
**Then** se muestra la imagen `Logo_Kuvu.jpeg` como logo de marca, visible (actualmente está comentado)

- Descomentar/activar el logo y usar `<img>` en lugar del HTML comentado
- Mantener texto "KUVU" + tagline

### RF-04: Logo real en Navbar interno

**Given** un usuario está logueado y ve el navbar de la app
**When** se carga cualquier pantalla admin
**Then** se muestra la imagen `Logo_Kuvu.jpeg` en lugar del emoji 🏢

- El logo debe ser pequeño (~24-32px de alto) para caber en el navbar

### RF-05: Eliminar kuvu_mobile/

**Given** que la app Flutter ya no se usará
**When** se ejecuta el cambio
**Then** la carpeta `kuvu_mobile/` se elimina completamente del repo

### RF-06: Responsive de HomePage

**Given** un usuario abre la HomePage en un celular (320px-480px)
**When** navega por la página
**Then**:

- Navbar: logo + hamburger, menú desplegable funcional
- Hero: título legible (no se desborda), subtítulo legible, CTA accesible
- Grid de servicios: 1 columna en móvil, 2 en tablet, 3 en desktop
- Secciones con padding reducido en móvil
- CTA final: texto y botón centrados y accesibles
- Compañías: pills se envuelven correctamente

### RF-07: Responsive de Login

**Given** un usuario abre el Login en un celular
**When** ingresa credenciales
**Then**:

- Branding (logo + nombre) visible y centrado
- Card del formulario ocupa casi todo el ancho (con padding mínimo)
- Inputs son tocables (altura mínima 44px)
- Botón "Ingresar" ocupa todo el ancho de la card
- Footer visible al fondo

### RF-08: Responsive de Landing

**Given** un usuario abre la Landing en un celular
**When** busca y selecciona una empresa
**Then**:

- Branding visible
- Buscador ocupa el ancho completo
- Lista de empresas se muestra en 1 columna
- Cada empresa es tocable (altura mínima 44px)

### RF-09: Responsive de Sidebar (app admin)

**Given** un usuario está logueado y abre la app en un celular
**When** necesita navegar entre secciones
**Then**:

- Sidebar ocupa toda la pantalla en móvil con overlay oscuro de fondo
- Se puede cerrar tocando fuera del sidebar (overlay)
- Toggle del sidebar es visible y accesible (tamaño mínimo 44x44px)
- Al navegar a una sección, el sidebar se cierra automáticamente en móvil

### RF-10: Responsive de Dashboard

**Given** un usuario abre el Dashboard en un celular
**When** ve las estadísticas y la tabla
**Then**:

- Stats grid: 1 columna en móvil (<600px), 2 en tablet, 4 en desktop
- Padding reducido en móvil
- Tabla de pagos reciente: scroll horizontal con indicador visual

### RF-11: Responsive de tablas admin (contratos, pagos, locales)

**Given** un usuario ve una tabla en contratos, pagos o locales desde un celular
**When** la tabla tiene más columnas que el ancho de pantalla
**Then**:

- La tabla es scrolleable horizontalmente dentro de su contenedor
- El scroll horizontal tiene indicador visual (sombra degradada o scrollbar estilizada)
- Los filtros y botones de acción se apilan verticalmente en móvil

### RF-12: Responsive de mantenimiento y usuarios

**Given** un usuario ve mantenimiento o usuarios en un celular
**When** navega por las cards
**Then**:

- Cards se apilan en 1 columna en móvil
- Contenido interno de cada card es legible
- Botones de acción son tocables

### RF-13: Breakpoints consistentes

**Given** que hay breakpoints inconsistentes (500px, 700px, 768px, 900px)
**When** se refactoriza el responsive
**Then** se usan breakpoints estándar:

- `<640px`: móvil
- `>=640px`: tablet pequeña
- `>=768px`: tablet
- `>=1024px`: desktop
- `>=1280px`: desktop grande

### RF-14: Viewport y touch targets

**Given** que la app se usa desde un navegador móvil
**When** un usuario interactúa con la interfaz
**Then**:

- Todos los elementos interactivos (botones, links, inputs) tienen tamaño mínimo de 44x44px para touch
- No hay contenido que se desborde horizontalmente (salvo tablas con scroll indicado)
- El viewport meta tag ya existe y es correcto

## Criterios de aceptación

| ID | Criterio | Verificación |
|---|---|---|
| CA-01 | Logo real visible en HomePage, Login, Landing y Navbar | Abrir cada pantalla y confirmar que se muestra la imagen, no CSS/emoji |
| CA-02 | kuvu_mobile/ no existe | `ls` o `find` confirma que la carpeta fue eliminada |
| CA-03 | HomePage funciona en 320px | Abrir DevTools > responsive mode > 320px, verificar hero, grid, CTA |
| CA-04 | Login funciona en 320px | Verificar card, inputs, botón, branding legibles |
| CA-05 | Landing funciona en 320px | Verificar buscador y lista de empresas |
| CA-06 | Sidebar tiene overlay en móvil | Abrir sidebar en 360px, verificar overlay oscuro y cierre al tocar fuera |
| CA-07 | Dashboard stats se apilan en 1 col <600px | Verificar en responsive mode |
| CA-08 | Tablas tienen scroll horizontal indicado | Verificar contratos, pagos, locales en 360px |
| CA-09 | Touch targets >= 44px | Inspeccionar botones, links, inputs en DevTools |
| CA-10 | No hay overflow horizontal no intencionado | Scroll horizontal global = false (excepto tablas dentro de su contenedor) |

## No-objetivos / Edge cases excluidos

- No se cambia el contenido ni la funcionalidad de ningún componente
- No se modifica la paleta de colores ni la tipografía
- No se agregan animaciones nuevas
- No se optimiza para tablets en landscape (solo portrait)
- No se implementa PWA ni service workers
- No se toca el backend ni los endpoints de API
- No se modifica el comportamiento de la tabla (solo su presentación visual en móvil)
- No se eliminan features existentes
