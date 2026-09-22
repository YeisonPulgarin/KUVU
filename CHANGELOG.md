# Changelog

Todas las notas de cambios notables quedan registradas en este archivo.

El formato sigue [Keep a Changelog](https://keepachangelog.com) y este proyecto respeta
[Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added

- Intro cinematográfica de ~5 segundos al entrar a `/acceder`: una casa moderna se ensambla en 3D
  (estética navy + blueprint cian/teal + glow ámbar), una vez por carga de la app y respetando la
  preferencia `prefers-reduced-motion`.
- Nueva pantalla de selección de inmobiliaria (`/acceder`) con copy de bienvenida, reutilizando el
  buscador y la lista de empresas.
- Se incorpora el logo real de KUVU (`Logo_Kuvu.jpeg`) en la página de inicio, el login, la selección de empresa y el navbar interno, reemplazando los cuadros CSS y el emoji anteriores.
- La página de inicio ofrece un botón para alternar entre tema claro y oscuro. La preferencia queda guardada en el navegador, se recuerda entre visitas y se aplica sin destello al cargar.
- La página de inicio se amplía con cinco secciones nuevas, en orden: cómo funciona, beneficios por rol (dueño/gerente vs equipo operativo), seguridad y soporte, el origen de KUVU (tres estudiantes, biblioteca de su universidad) y una FAQ breve con enlace a la página completa de preguntas frecuentes.
- Nueva página pública **Nosotros** (`/nosotros`) que explica quién es KUVU, cómo opera, con quién trabaja y su origen, y cierra con un botón de contacto por WhatsApp.
- Nueva página pública **Preguntas frecuentes** (`/preguntas-frecuentes`) con todas las preguntas agrupadas por tema, cada una con su respuesta visible.
- Cada página pública del sitio (inicio, nosotros, preguntas frecuentes) define su propio título y descripción (`title` + `meta description`).
- El logo del sitio ahora tiene 4 variantes (completo y símbolo, cada una para tema claro y oscuro) y el favicon pasó a ser un PNG del símbolo.

### Changed

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
- El logo del sitio se rediseñó como sistema de variantes: se adapta al tema claro/oscuro (alternando al tocar el toggle, sin recargar) y muestra solo el símbolo en móvil; el header y el footer públicos usan las variantes según tema y viewport, mientras que la selección de empresa, el login y el navbar interno usan la variante oscura sobre sus fondos oscuros. Reemplaza la imagen única anterior.

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