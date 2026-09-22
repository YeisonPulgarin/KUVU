# Fase Explore: Mejorar Home Page

## Resumen de lo que existe hoy
La página de inicio actual (`home.component.html`) presenta una estructura clásica: un encabezado (Navbar) con enlaces y botones de acción, una sección de título ("Quienes Somos") y un cuerpo principal dividido en una barra lateral (Sidebar) y un banner de imagen con decoraciones SVG (doodles).
Todo el estilo está construido con CSS Vanilla/SCSS a medida en `home.component.scss` (aprox. 340 líneas), usando variables locales, Flexbox y CSS Grid. No hay un diseño "mobile-first" completo (solo una media query básica para el layout principal) y el menú de navegación no tiene versión adaptativa (menú hamburguesa) para pantallas pequeñas. 
El proyecto actualmente **no tiene instalado Tailwind CSS**.

## Archivos y módulos relevantes
- `fronted/proyecto_angular/package.json`: Manifiesto del proyecto. Confirma que Tailwind no está presente en las dependencias.
- `fronted/proyecto_angular/src/app/components/home/home.component.html`: Plantilla principal. Contiene la estructura a refactorizar con clases utilitarias de Tailwind.
- `fronted/proyecto_angular/src/app/components/home/home.component.scss`: Hoja de estilos principal del componente. La idea es eliminar o reducir drásticamente este archivo al migrar a Tailwind.
- `fronted/proyecto_angular/src/app/components/home/home.component.ts`: Lógica del componente (actualmente vacía, solo importa dependencias comunes).

## Ambigüedades detectadas (Gate A)
1. **Instalación de Tailwind:** ¿Procedemos a instalar y configurar Tailwind CSS en todo el proyecto Angular como primer paso?
2. **Alcance del SCSS:** Al migrar a Tailwind, ¿querés que eliminemos por completo el `home.component.scss` para usar clases inline, o preferís mantener las directivas `@apply` para organizar el código?
3. **Navegación Móvil:** Para cumplir con el "mobile-first", ¿debemos implementar un menú hamburguesa funcional en el Navbar, o solo ocultar algunos elementos en pantallas pequeñas?
