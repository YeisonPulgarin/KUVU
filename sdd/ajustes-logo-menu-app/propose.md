# Propose — ajustes-logo-menu-app

## Intent

Pulir la marca y la navegación del sitio público y darle más presencia a las acciones de
descartar y al fondo de la app interna: un solo logo (símbolo) en el header, un menú móvil que
abre en cualquier punto del scroll y se siente vivo, una marca legible sobre los fondos oscuros
del acceso, y botones Cancelar y un fondo con textura en todas las pantallas internas.

## Alcance

1. **Header del sitio público:** muestra solo el símbolo (`logo.responsive`) en todos los
   anchos y en ambos temas.
2. **Footer del sitio público:** no muestra imagen de logo; la marca queda en el texto "KUVU".
3. **Menú móvil:** abre y se ve completo con la página scrolleada (estado compacto). Sus ítems
   tienen hover con desplazamiento leve a la derecha y fondo tintado; el ítem activo lleva barra
   lateral de acento y fondo suave.
4. **`/acceder`, `/login`, `/cambiar-contrasena`:** la marca es el símbolo más el texto "KUVU"
   en blanco, legible sobre el overlay oscuro.
5. **App interna (Administrador y Arrendatario):** todos los botones Cancelar de los modales y
   el botón de descarte del diálogo de confirmación ("Cancelar"/"Volver") usan el estilo de
   Eliminar (`.btn-action--danger`) con ícono "x".
6. **App interna:** el fondo de `.main-content` lleva grano sutil reutilizando `$grain`. Los
   modales quedan lisos.

## No-objetivos

- El nav de escritorio no cambia (ya tiene subrayado animado).
- Navbar interna e intro (`auth-intro`) mantienen el logo completo.
- No se crean ni optimizan assets de logo; no se tocan `logo_url` ni el ícono de empresa del sidebar.
- No se cambia el comportamiento de los modales ni del diálogo de confirmación (foco inicial,
  valores devueltos): solo la apariencia del botón de descarte.
- No se agrega tema oscuro a la app interna; los botones globales del sitio público no cambian.

## Approach

- Header y footer: retirar la imagen web del header y las imágenes del footer; el contrato de
  `content/logo.ts` sigue igual.
- Bug del menú: sacar el `backdrop-filter` del ancestro del panel fijo (moverlo a un
  pseudo-elemento de fondo) para que el panel vuelva a posicionarse contra el viewport.
- Estilos del menú móvil, la marca del acceso y la textura: solo SCSS/HTML de los componentes
  involucrados y `shared.styles.scss`/`styles.css`, con movimiento bajo `prefers-reduced-motion`.
- Cancelar: cambiar la clase en las plantillas y agregar el ícono "x".

## Riesgo conocido (decisión del usuario)

Cancelar en rojo comparte color con la acción destructiva. En el diálogo de confirmación de un
borrado se diferencian por relleno (descarte tintado vs. confirmación sólida). Queda registrado
como decisión explícita del usuario.

## Alcance sumado — botón "Volver arriba"

7. Un botón flotante "Volver arriba" en todas las páginas (sitio público, acceso y app
   interna, todos los roles). Aparece con una transición cuando el usuario bajó más de una
   pantalla, y al activarlo vuelve al comienzo con scroll suave, o con salto inmediato si se
   pidió movimiento reducido. Tiene ícono de flecha y etiqueta accesible, funciona en tema
   claro y oscuro, y queda por debajo del menú móvil, del sidebar móvil y de los toasts.

Approach: una sola instancia global montada en `AppComponent` que sigue el contenedor que
scrollea (la ventana o `.main-content`), así no se repite en cada layout.
