# Fase Spec: Mejorar Home Page (extensión: contenido y hero fullsize)

## Requisitos funcionales

### 1. Hero fullsize
* *Given* que un visitante entra a la página de inicio,
  * *When* la página carga,
  * *Then* ve una sección hero a pantalla completa con un titular principal, un subtítulo que
    describe el producto y un botón de llamada a la acción (CTA) principal.
* *Given* que el hero está visible,
  * *When* el visitante hace clic en el CTA,
  * *Then* se navega a la ruta `/acceder`.

Mensaje acordado:
- Titular: "KUVU — Administración inmobiliaria para empresas que crecen".
- Subtítulo: "Gestioná locales, contratos, pagos y mantenimientos de múltiples compañías
  desde un solo sistema."
- CTA: "Acceder" (ruta `/acceder`).

### 2. Sección "¿Qué es KUVU?"
* *Given* que el visitante hace scroll más allá del hero,
  * *When* llega a la sección,
  * *Then* ve una descripción breve que posiciona a KUVU como sistema de administración de
    inmobiliarias que brinda servicio a distintas compañías.

### 3. Sección "Servicios / Características"
* *Given* que el visitante hace scroll a la sección de servicios,
  * *When* la observa,
  * *Then* ve una grilla de características del sistema: gestión de locales, contratos,
    pagos, mantenimientos y usuarios.

### 4. Sección "Compañías que confían"
* *Given* que el visitante llega a la sección de compañías,
  * *When* la observa,
  * *Then* ve los nombres de las empresas a las que KUVU da servicio: Amarilo, Nido Rent,
    Balcones de San Soucci y Mi Inmueble.

### 5. CTA final
* *Given* que el visitante llega al final de la página,
  * *When* observa la sección final,
  * *Then* ve un bloque de cierre con un llamado a la acción ("Acceder" / "Ingresar a tu
    cuenta") que navega a `/acceder`.

### 6. Menú del navbar ajustado
* *Given* que la página de inicio carga,
  * *When* el visitante observa la navegación,
  * *Then* el menú contiene enlaces a las secciones de la página (hero/inicio, qué es KUVU,
    servicios, compañías, contacto si aplica) y las acciones de sesión ("Mi cuenta" /
    "Acceder").

### 7. Responsividad y contenido reemplazado
* *Given* que el cambio se aplica,
  * *When* se compara con la home anterior,
  * *Then* el contenido anterior ("Quienes Somos" + sidebar + banner) queda reemplazado por la
    nueva estructura de secciones, manteniendo el navbar y el diseño mobile-first ya
    existentes.

## Criterios de Aceptación
1. El hero ocupa al menos el alto de la ventana (`min-h-screen`) en desktop y se adapta bien
   en móvil sin overflow horizontal.
2. Todas las secciones (hero, qué es KUVU, servicios, compañías, CTA final) están presentes
   y visibles en el `home.component.html`.
3. El CTA (y el CTA final) navega a `/acceder`.
4. Los enlaces del menú apuntan a las anclas de las secciones correspondientes (o a los
   destinos acordados) y las acciones de sesión se mantienen.
5. El contenido anterior de la home ya no está: no quedan "Quienes Somos", sidebar de menú
   ni banner de imagen como estructura principal.
6. La página no presenta overflow horizontal en 320px–1920px (verificación visual hasta el
   rango estándar para esta fase).
7. La suite de tests existente del componente home pasa en verde; si la estructura HTML
   cambia selectores usados por los tests (p. ej. `#hamburger-toggle`, `#mobile-menu`), esos
   selectores se mantienen o los tests se ajustan en consecuencia.

## No-objetivos / edge cases excluidos
- No hay formulario de contacto funcional ni captura de leads: el CTA final es navegación a
  `/acceder`.
- No hay integración con API para el contenido: las secciones son estáticas.
- No se rediseñan otras vistas de la aplicación.
- No se agregan imágenes/logos reales de las compañías salvo que existan en `public/`; se
  usan nombres textuales o marcadores.
- La verificación de overflow en el rango 320–1920px es visual/semi-manual, no automatizada.