# Propose — menu-hover-scrollspy-breadcrumb

## Intent
Que el visitante sepa siempre dónde está: en el menú móvil, qué opción tiene bajo el cursor o
el foco; en la home, en qué sección del sitio está y qué recorrió. Además, el equipo se
presenta en el orden pedido.

## Alcance
1. **Hover/focus visible en el menú móvil:** cambio claro del texto de la opción (color de
   marca, subrayado que crece bajo el texto, desplazamiento más marcado). Con
   `prefers-reduced-motion: reduce` el cambio visual se mantiene sin movimiento.
2. **Scroll-spy en la home:** el ítem del menú (escritorio y móvil) que se resalta sigue a la
   sección visible de la home. Fuera de la home, el resaltado sigue a la ruta.
3. **Breadcrumb acumulativo en la home:** franja bajo la barra del header, visible al
   scrollear, que muestra "Inicio", luego "Inicio › Servicios", etc., hasta la sección
   actual; los ítems anteriores son anclas a sus secciones.
4. **Orden del equipo:** Carlos Arciniegas · Wilson Solano · Yeison Pulgarin en home y
   `/nosotros`.

## No-objetivos
- Scroll-spy o breadcrumb dinámico en páginas internas (conservan "Inicio › Página").
- Cambiar destinos del menú (siguen siendo rutas) o el JSON-LD de breadcrumb.
- Reordenar o cambiar fotos del equipo (son grupales).
- Tocar landing/login o sus hojas de estilo.

## Approach
Un servicio raíz de "sección activa" que la home alimenta mientras vive y que el header
consume para el resaltado y para pintar la franja. Estilos nuevos en hojas aparte del header.
El orden del equipo cambia en su fuente única de contenido.
