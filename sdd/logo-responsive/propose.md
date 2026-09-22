# Propose — logo-responsive

## Intent

Unificar la marca visual de KUVU con el logo real (`Logo_Kuvu.jpeg`) en todos los componentes de la app web, eliminar la carpeta `kuvu_mobile/` (app Flutter descontinuada), y asegurar que toda la interfaz sea responsive y funcional desde el navegador de un celular.

## Alcance

### 1. Logo real en todos los componentes

- **HomePage** (`home.component`): reemplazar `.logo-box` CSS por `<img>` con `Logo_Kuvu.jpeg`
- **Login** (`login.component`): reemplazar `.brand-logo` (div con "K") por `<img>` con el logo
- **Landing** (`landing.component`): activar el logo (está comentado) y usar `<img>` con el logo real
- **Navbar interno** (`navbar.component`): reemplazar emoji 🏢 por `<img>` con el logo

### 2. Responsive completo de toda la app

- **HomePage**: hero, grid de servicios, secciones, CTA, navbar móvil — todo funcional en 320px+
- **Login**: card, campos, botón, branding — legible y usable en móvil
- **Landing**: card, búsqueda, lista de empresas — funcional en móvil
- **Navbar interno**: hamburger drawer, links, logout — funcional en móvil
- **Secciones admin**: dashboard, contratos, pagos, mantenimiento, locales, usuarios — responsive

### 3. Eliminación de kuvu_mobile/

- Borrar carpeta `kuvu_mobile/` completa (Flutter app, assets, platform folders, build artifacts)

## No-objetivos

- No se cambia el backend ni la API
- No se modifica la paleta de colores existente
- No se agregan funcionalidades nuevas (solo logo + responsive)
- No se mueven los backgrounds de `public/login-backgrounds/`
- No se toca el `sdd.config.md` ni otros artifacts SDD

## Riesgo

Bajo. Son cambios visuales y de CSS. No toca lógica de negocio ni datos.

## Artefactos fuente

- Logo fuente: `C:\Users\wilso\Documents\...\login-backgrounds\Logo_Kuvu.jpeg`
- Destino logo: `fronted/proyecto_angular/public/Logo_Kuvu.jpeg`
