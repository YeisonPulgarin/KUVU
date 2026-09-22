# Explore — logo-responsive

## Qué existe hoy

### Logo en la HomePage (`fronted/proyecto_angular/src/app/components/home/`)

El logo actual **no es una imagen** — es un div CSS con borde verde + texto "KUVU":

- `home.component.html:8-11`: `<div class="logo-box"></div>` + `<span class="logo-text">KUVU</span>`
- `home.component.scss:38-41`: `.logo-box` = cuadrado de 32px con borde de 2px en `$brand-green` (#6b8e6b)
- No hay `<img>`, no hay archivo de imagen, no hay import de asset

### Logo en el Navbar interno (`shared/navbar/`)

- `navbar.component.html:3`: emoji 🏢 como icono de marca
- `navbar.component.scss:22`: `.navbar__logo-icon { font-size: 1.6rem; }`

### Logo en Login (`login/`)

- `login.component.html:9`: `<div class="brand-logo">K</div>` — gradiente azul-violeta con letra "K"
- `login.component.scss:73-82`: `.brand-logo` = 48px, gradiente `#3a6fd8 → #7c3aed`, border-radius 14px

### Logo en Landing (`landing/`)

- `landing.component.html:9`: `brand-logo` está **comentado out** (`<!--div class="brand-logo">K</div-->`)
- Solo muestra texto "KUVU" + tagline

### Assets existentes en el frontend

Solo hay backgrounds en `public/login-backgrounds/` (5 archivos .webp). **No existe ningún archivo de logo en el frontend.**

### Backend

- `empresa.logo_url` se devuelve desde la API (`backend/routes/auth.js`) pero **nunca se renderiza como imagen** en ningún componente del frontend.

### Carpeta `kuvu_mobile/`

Flutter app completa con 8 pantallas, assets, config. El logo (`assets/LogoKuvuMovil.png`) solo se usa para launcher icons, nunca se renderiza en runtime. **Carpeta candidata a eliminación completa.**

## Archivos relevantes

| Archivo | Rol |
|---|---|
| `fronted/proyecto_angular/public/login-backgrounds/` | Única carpeta de assets estáticos del frontend |
| `fronted/proyecto_angular/src/app/components/home/home.component.html` | HomePage — logo CSS a reemplazar |
| `fronted/proyecto_angular/src/app/components/home/home.component.scss` | Estilos del logo y layout responsive actual |
| `fronted/proyecto_angular/src/app/components/shared/navbar/navbar.component.html` | Navbar interno — emoji a reemplazar |
| `fronted/proyecto_angular/src/app/components/login/login.component.html` | Login — brand-logo con "K" |
| `fronted/proyecto_angular/src/app/components/landing/landing.component.html` | Landing — logo comentado |
| `kuvu_mobile/` | Carpeta entera a eliminar |

## Ambigüedades detectadas (Gate A)

1. **Logo en Login y Landing**: ¿reemplazar el "K" gradiente y el emoji del navbar interno también con la imagen real, o solo tocar la HomePage pública?
2. **Carpeta destino del logo**: ¿usar `public/` (assets estáticos de Angular) o crear `src/assets/`? `public/` es más simple y ya es el root de assets estáticos.
3. **Formato de la imagen**: `Logo_Kuvu.jpeg` es JPEG. ¿convertir a WebP para consistencia con los backgrounds, o dejar como JPEG?
4. **Responsive del HomePage**: ¿solo ajustar el logo para móvil, o revisar TODO el homepage (hero, grid de servicios, CTA, etc.) para asegurar responsive completo?
5. **Navbar interno (app logueada)**: ¿se toca el navbar de la app interna (emoji 🏢) o solo la HomePage pública?
