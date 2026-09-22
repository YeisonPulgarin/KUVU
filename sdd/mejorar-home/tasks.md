# Fase Tasks: Mejorar Home Page

**Nota:** esta versión del artifact fue actualizada por la extensión de contenido de la
home (hero fullsize + secciones de información). Las tareas 1–4 del cambio original ya fueron
implementadas y verificadas (ver `apply-progress/slice-unico.md` y `verify-report.md`); las
tareas 5–8 corresponden a la nueva extensión.

## Lista de Tareas Atómicas
Las tareas se ejecutarán en el siguiente orden estricto de dependencia:

1. **Configurar Tailwind CSS (Infraestructura)** — ✅ implementada (corrección post-verify incl.)
   - Instalar dependencias (`tailwindcss`, `postcss`, `autoprefixer`).
   - Generar y configurar `tailwind.config.js` para los archivos del frontend.
   - Inyectar las directivas `@tailwind` en el `src/styles.scss` global.
   - *Nota: Será necesario reiniciar el servidor de desarrollo (`npm start`) para que apliquen los cambios.*

2. **Lógica de Estado del Menú (`home.component.ts`)** — ✅ implementada
   - Agregar propiedad `isMobileMenuOpen = false`.
   - Agregar método `toggleMenu()` para cambiar el estado.
   - Escribir tests unitarios para verificar el comportamiento de `toggleMenu()`.

3. **Refactorización de Estilos (`home.component.scss`)** — ✅ implementada
   - Eliminar reglas de CSS puro (Flexbox, Grid, Media Queries manuales) y sustituirlas por las directivas `@apply` de Tailwind.
   - Implementar diseño "mobile-first": `.layout-grid` debe ser 1 columna por defecto y 2 columnas (`md:grid-cols-[250px_1fr]`) en pantallas medianas o mayores.
   - Ajustar tipografías, colores (`$primary-yellow`) usando variables CSS o configuraciones de Tailwind si aplica.

4. **Refactorización de Estructura (`home.component.html`)** — ✅ implementada
   - Incorporar el botón SVG interactivo de menú hamburguesa (oculto en `md:`).
   - Aplicar el data binding `[class.hidden]="!isMobileMenuOpen"` al contenedor de enlaces en pantallas pequeñas, asegurando que siempre sea visible en `md:flex`.
   - Validar que el hero title y las imágenes se rendericen fluidamente.
   - Escribir tests de integración/UI verificando que hacer clic en el menú alterne las clases correctamente.

5. **Hero fullsize** — ⏳ pendiente (extensión)
   - Reemplazar el encabezado/migajas y el hero actual por una sección `hero` a pantalla completa.
   - Titular "KUVU — Administración inmobiliaria para empresas que crecen", subtítulo y CTA "Acceder" → `/acceder`.

6. **Secciones de contenido nuevas** — ⏳ pendiente (extensión)
   - Sección "¿Qué es KUVU?" con la descripción del sistema (administración para inmobiliarias, multi-empresa).
   - Sección "Servicios / Características": grilla con gestión de locales, contratos, pagos, mantenimientos, usuarios.
   - Sección "Compañías que confían": Amarilo, Nido Rent, Balcones de San Soucci, Mi Inmueble.
   - CTA final hacia `/acceder`.

7. **Ajuste del navbar y menú móvil** — ⏳ pendiente (extensión)
   - Actualizar los enlaces del navbar (escritorio y menú hamburguesa) a las secciones nuevas de la home.
   - Mantener `#hamburger-toggle`, `#mobile-menu`, `[class.hidden]` y `aria-expanded` (selectores usados por los tests).

8. **Tests del contenido nuevo + re-verificación** — ⏳ pendiente (extensión)
   - Ajustar/agregar tests unitarios si el HTML cambia selectores o estructura relevante.
   - Correr la suite completa y dejar el slice en verde.

## Slices Involucrados
El proyecto no tiene slices predefinidos en `sdd.config.md` (`slices_declarados: []`).
Se ejecuta un **único slice implícito** (`apply`) que contiene las tareas 5–8 (las 1–4 ya
están completas). La modalidad de pruebas acordada es `test-after`.

## Forecast de Riesgo
- **Líneas estimadas a cambiar (extensión):** ~150 - 250 líneas (HTML de secciones + SCSS).
- **Archivos tocados:** 2 principales (`home.component.html`, `home.component.scss`) + tests.
- **Repositorios involucrados:** 1 (Frontend Angular).
- **Nivel de Riesgo:** **Bajo**. Cambio de contenido estático y layout de un único
  componente, sin tocar lógica de negocio ni contratos de datos.

## Alcance Previsto para `document`
- `openapi_afectado`: **false** (No se modifican ni exponen endpoints HTTP).
- `changelog_afectado`: **true** (El cambio introduce la home nueva visible desde afuera:
  hero y secciones de información).
- `readme_afectado`: **false**.
- `architecture_afectado`: **false** (Misma arquitectura de componentes).
- `guidelines_afectado`: **false** (Contenido estático; no cambia convenciones de construcción).
