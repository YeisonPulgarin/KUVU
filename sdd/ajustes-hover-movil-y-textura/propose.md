# Propose — ajustes-hover-movil-y-textura

## Intent
Que el feedback de las opciones del menú hamburguesa se vea también al tocar (móvil y
emulación táctil), y que el fondo de la app interna tenga una textura perceptible y sobria.

## Alcance
1. Menú móvil: el estado de "opción elegida" (color de marca, subrayado que crece,
   desplazamiento) aparece al tocar (`:active`) y se mantiene visible un instante antes de
   que el panel se cierre. Con movimiento reducido, el cambio de color y subrayado se ve sin
   animación.
2. App interna (ambos roles, todas las pantallas): textura de grano visible y un degradado
   suave con el color de la empresa, sin tocar tarjetas ni tablas.

3. Sidebar de la app interna (`<app-layout>`, ambos roles, escritorio y drawer móvil): el
   mismo lenguaje de feedback que el menú hamburguesa, con el color de la empresa aclarado
   para que contraste sobre el fondo oscuro del sidebar, y la misma pausa al cerrar el drawer.

## No-objetivos
- Demorar la navegación: la ruta cambia igual que hoy; solo el cierre del panel espera.
- Cambiar el grano del sitio público.
- Cambiar colores de tarjetas, tablas, modales o del sidebar.

## Approach
Estilos de toque y una pausa corta de cierre en el header. Para el fondo, un grano propio de
la app (motas con transparencia, sin velo) más un degradado radial en `.main-content`.
