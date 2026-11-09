# Changelog

Todas las notas de cambios notables quedan registradas en este archivo.

El formato sigue [Keep a Changelog](https://keepachangelog.com) y este proyecto respeta
[Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added

- El sitio público estrena identidad visual: titulares grandes en una tipografía display
  condensada, textos más grandes que aprovechan el ancho, fondo con grano y trama de puntos, y
  bloques a ancho completo en el verde de marca (sin colores nuevos). Claro y oscuro reciben el
  mismo tratamiento.
- La home tiene una composición distinta por sección: titular manifiesto, servicios en bento,
  compañías en una cinta verde con los nombres en grande, la foto del equipo en un marco que se
  endereza con el scroll y un cierre en bloque de marca. El título de "El origen de KUVU" se
  enciende palabra por palabra.
- **Nosotros** muestra las tres fotos nuevas del equipo en una galería; **Servicios**,
  **Preguntas frecuentes** y **Contacto** se rediseñan y terminan en un bloque de marca.

- La página de inicio tiene movimiento ligado al scroll: una barra fina arriba muestra cuánto
  de la página se recorrió; el título principal entra palabra por palabra, con un indicador que
  invita a bajar, y en escritorio el contenido del hero se aleja con parallax al salir; el
  párrafo de "¿Qué es KUVU?" se enciende palabra por palabra a medida que avanza.
- En escritorio, "¿Cómo funciona?" es un recorrido: la sección queda fija mientras una línea se
  llena y resalta el paso actual (anunciado a lectores de pantalla). En móvil sigue siendo una
  lista.
- "Compañías que confían" se muestra como una banda que se desplaza en bucle. Se pausa con el
  puntero encima, con el foco del teclado o con el botón "Pausar animación de compañías".
- La foto del equipo se abre con un recorte redondeado al aparecer y, en escritorio, se desplaza
  levemente contra el scroll.
- Los botones "Ingresar" de la página de inicio se acercan levemente al puntero del mouse.
- Al pasar de una página pública a otra, el encabezado queda quieto y solo se desliza el
  contenido. Los enlaces a una sección de la misma página llevan con scroll suave.

- El sitio público es multipágina con una sola navegación en todas las páginas: Inicio, Servicios, Nosotros, Preguntas frecuentes y Contacto; Legal se enlaza desde el pie de página.
- Nueva página **Servicios** (`/servicios`) con el detalle de cada servicio y los beneficios para dueños, gerentes y equipos operativos.
- Nueva página **Contacto** (`/contacto`): un formulario arma el mensaje y abre WhatsApp con los datos prellenados. Pide autorizar el tratamiento de datos antes de enviar y no guarda ni envía los datos a ningún servidor.
- Nueva página **Legal** (`/legal`) con índice y cuatro documentos: política de tratamiento de datos personales (Ley 1581 de 2012 y Decreto 1377 de 2013), aviso de privacidad, términos de uso y política de cookies y almacenamiento local. Aclara que KUVU es un proyecto académico de la Universidad Cooperativa de Colombia y que los textos no son asesoría legal.
- Nueva página 404 pública, con enlace al inicio, para las direcciones que no existen.
- El pie de página se organiza en columnas (marca, sitio, legal y contacto) e incluye la nota de proyecto académico.
- Cada página pública tiene título y descripción propios, vista previa para redes (Open Graph y Twitter card) y URL canónica; la home publica datos estructurados `Organization` y `WebSite`.
- Las preguntas frecuentes suman un grupo "Contacto y datos" (cómo contactar, cookies, tratamiento de datos y soporte).
- La página de inicio muestra la foto del equipo YCW Systems (Wilson Solano, Carlos Arciniegas y Yeison Pulgarin) en una banda a ancho completo, "El equipo detrás de KUVU", entre "Compañías que confían" y "El origen de KUVU", con un botón hacia Nosotros. En móvil la foto se ve completa con el texto debajo.
- La página **Nosotros** muestra la foto completa del equipo con sus nombres al pie.
- Las imágenes del sitio se sirven en WebP con respaldo JPEG y en el tamaño adecuado a cada pantalla, con carga diferida; un script (`scripts/generate-image-variants.py`) genera las variantes de nuevas imágenes de `public/Imagenes_web/`.
- Intro de ~3 segundos al entrar a `/acceder`: una hoja de papel con el logo KUVU y una casa que se
  dibuja en trazo fino se curva y pasa como la página de un libro, con un sonido suave de hoja, y
  revela el selector de inmobiliaria. Se puede saltar con un clic o toque, con Escape, Enter o
  Espacio, o con el botón "Saltar". Se muestra una vez por pestaña (no se repite al recargar ni al
  volver del login), se omite si el sistema pide movimiento reducido y, entrando directo por URL,
  corre sin sonido.
- Nueva pantalla de selección de inmobiliaria (`/acceder`) con copy de bienvenida, reutilizando el
  buscador y la lista de empresas.
- Se incorpora el logo real de KUVU (`Logo_Kuvu.png`) en la página de inicio, el login, la selección de empresa y el navbar interno, reemplazando los cuadros CSS y el emoji anteriores.
- La página de inicio ofrece un botón para alternar entre tema claro y oscuro. La preferencia queda guardada en el navegador, se recuerda entre visitas y se aplica sin destello al cargar.
- La página de inicio se amplía con cinco secciones nuevas, en orden: cómo funciona, beneficios por rol (dueño/gerente vs equipo operativo), seguridad y soporte, el origen de KUVU (tres estudiantes, biblioteca de su universidad) y una FAQ breve con enlace a la página completa de preguntas frecuentes.
- Nueva página pública **Nosotros** (`/nosotros`) que explica quién es KUVU, cómo opera, con quién trabaja y su origen, y cierra con un botón de contacto por WhatsApp.
- Nueva página pública **Preguntas frecuentes** (`/preguntas-frecuentes`) con todas las preguntas agrupadas por tema, cada una con su respuesta visible.
- Cada página pública del sitio (inicio, nosotros, preguntas frecuentes) define su propio título y descripción (`title` + `meta description`).
- El logo del sitio tiene 2 variantes: el logo web (completo) en escritorio y el símbolo en móvil, con el favicon apuntando al símbolo.
- Las páginas **Nosotros** y **Preguntas frecuentes** muestran un breadcrumb ("Inicio › Nosotros", "Inicio › Preguntas frecuentes") arriba del título, con enlace a la página de inicio, y publican esa ruta como datos estructurados schema.org (`BreadcrumbList`) para buscadores.

### Changed

- Las fotos del equipo frente a la universidad reemplazan a la foto del equipo de traje en la
  home, en Nosotros y en la vista previa al compartir. El título del hero entra completo (sin
  ir palabra por palabra) y ya no tiene el indicador para bajar; las secciones dejan de mostrar
  números ("01", "02") sobre los títulos. Los botones "Ingresar" conservan su azul.

- Las apariciones al hacer scroll del sitio público recorren más distancia con una curva más
  suave, y las filas y tarjetas se elevan también al recibir el foco del teclado; en pantallas
  táctiles la elevación ya no queda fija después de tocar.
- Con "reducir movimiento" activado en el sistema, todo el sitio público queda quieto: sin
  entradas animadas, parallax, recorrido, banda en movimiento ni botones que siguen al puntero,
  y con todo el contenido visible.

- El encabezado del sitio público queda fijo arriba y se compacta con fondo desenfocado al hacer scroll; resalta la página activa. Por debajo de 1024 px el menú ocupa toda la pantalla, bloquea el scroll del fondo y se cierra con Escape.
- La página de inicio funciona como escaparate: resume los servicios y deriva a cada página; los beneficios por rol se muestran en Servicios. "Ingresar" sigue siendo la acción principal y "Contactar" aparece como secundaria.
- Las secciones del sitio llevan una etiqueta numerada ("01", "02"…), los enlaces de acción una flecha que se desplaza en hover y las tarjetas un hover más marcado; todo se desactiva con movimiento reducido.
- Todos los textos del sitio público usan tuteo colombiano.
- Una dirección desconocida muestra la página 404 del sitio en lugar de redirigir a `/login`.
- La política de cookies (`/legal#cookies`) lista también "Intro vista": el dato de la sesión del
  navegador que evita repetir la intro de la pantalla de acceso en la misma pestaña.
- El selector de inmobiliarias (`/acceder`) lista las empresas en un orden fijo, el de su
  identificador (Amarilo, Nido Rent, Balcones de San Soucci, Mi Inmueble), y la búsqueda lo
  conserva.
- La pantalla de credenciales (`/login`) se rediseñó como PANTALLA 2 del flujo de acceso: título
  "Inicia sesión", botón `Iniciar sesión →` y `← Cambiar de inmobiliaria`, sobre un overlay navy
  acorde a la estética de la referencia. "Recordarme" y "¿Olvidaste tu contraseña?" son enlaces
  decorativos sin funcionalidad (el login sigue usando correo + documento, sin contraseña).
- La selección de empresa ya no forma parte del login: ocurre en `/acceder`; volver de credenciales
  a la selección no reproduce la intro.
- La aplicación completa es responsiva para navegador móvil: el sidebar del panel admin se convierte en un overlay con botón de apertura y cierre al navegar o tocar fuera, el dashboard apila sus estadísticas en una columna en pantallas chicas, y las tablas se desplazan horizontalmente dentro de su contenedor.
- Los elementos interactivos (botones, enlaces, inputs) tienen tamaño mínimo táctil de 44x44px en móvil.
- Las dependencias de Angular (`@angular/*`) se actualizaron de 21.2.8 a 21.2.23, resolviendo vulnerabilidades XSS conocidas del framework.
- La página de inicio se rediseñó con la identidad visual de KUVU: tipografía Geist, paleta verde de una sola escala, secciones con más aire, animaciones de entrada suaves (que se desactivan si el sistema pide movimiento reducido) y la oferta de servicios presentada como una lista editorial en lugar de tarjetas repetidas.
- La navegación de la página de inicio queda con una sola llamada a la acción, "Ingresar", con destino a `/acceder`; antes el mismo destino aparecía con etiquetas distintas.
- Todas las páginas públicas (inicio, nosotros y preguntas frecuentes) comparten el mismo encabezado y pie de página con navegación, toggle de tema claro/oscuro y acceso por WhatsApp; la página de inicio ahora incluye un pie de página.
- El logo del sitio se rediseñó como sistema de variantes: el header y el footer públicos alternan entre el logo web y el símbolo según el viewport (768px), y muestran el mismo logo en tema claro y oscuro; la selección de empresa, el login y el navbar interno usan el logo web. El favicon es el símbolo en PNG. Reemplaza la imagen única anterior.

### Fixed

- En tema claro, la página de inicio, Nosotros, Preguntas frecuentes y el encabezado muestran los colores y formas de marca: las tarjetas de "¿Cómo funciona?" tienen borde, fondo y esquinas redondeadas, los números de paso se ven (antes, texto blanco sin fondo), los íconos de servicios tienen su fondo verde claro y las secciones alternan sus fondos. En los dos temas, los botones redondeados del encabezado, del pie y de Nosotros y las tarjetas e íconos de la página de inicio muestran sus esquinas redondeadas.
- La sección final de la página de inicio ("¿Listo para administrar tus inmobiliarias?") se lee en modo claro: el titular y el párrafo blancos quedaban sobre un fondo gris claro casi del mismo tono. La banda mantiene su fondo verde.
- El botón "Ingresar" de esa sección se lee: muestra texto blanco sobre el azul de los botones principales (antes, texto verde oscuro sobre azul) y un contorno blanco visible al navegar con teclado.

### Removed

- Se elimina la aplicación móvil Flutter (`kuvu_mobile/`), reemplazada por el frontend web responsivo.
- Se elimina el texto "KUVU" que acompañaba al logo (la imagen ya lo contiene); los taglines se conservan.

### Changed

- La página de inicio es responsiva mobile-first: en móvil los enlaces y botones de acción se
  agrupan en un menú hamburguesa desplegable; en pantallas de 768px o más se muestran en línea
  como antes.
- El contenido principal de la página de inicio (sidebar + banner) se apila en una columna en
  móvil y mantiene dos columnas en pantallas medianas o mayores.
- El sistema de estilos pasa a Tailwind CSS v4 (integrado vía `@tailwindcss/postcss`), con los
  tokens de marca definidos en CSS (`@theme`) y utilidades aplicadas con `@apply` en los
  estilos de los componentes.