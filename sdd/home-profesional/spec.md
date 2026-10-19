# Spec — home-profesional

Fuentes: `sdd/home-profesional/propose.md` (alcance y decisiones D1–D6) y `explore.md`.
Alcance: sitio público. Todo texto visible está en español con tuteo colombiano
("Conoce", "Escríbenos", "puedes"); no se usa voseo.

Convención: `HP-xx` = requisito; `CA-xx.n` = criterio de aceptación verificable de ese
requisito. "Página pública" = `/`, `/servicios`, `/nosotros`, `/preguntas-frecuentes`,
`/contacto`, `/legal` y la página 404.

---

## 1. Navegación y estructura multipágina

### HP-01 Navegación única del sitio
El header muestra en todas las páginas públicas los mismos enlaces, en este orden: Inicio,
Servicios, Nosotros, Preguntas frecuentes, Contacto. Cada enlace lleva a una ruta propia (no
a un ancla de la home).

- CA-01.1 En cada página pública el header renderiza exactamente esos 5 enlaces, en ese
  orden, con destino `/`, `/servicios`, `/nosotros`, `/preguntas-frecuentes`, `/contacto`.
- CA-01.2 Ningún enlace del header apunta a un ancla `#...`.
- CA-01.3 El header conserva el botón "Ingresar" (a `/acceder`), el acceso a WhatsApp y el
  selector de tema claro/oscuro.

### HP-02 Página activa
El enlace de la página en la que está el visitante se distingue visualmente y se anuncia
como página actual a tecnologías asistivas.

- CA-02.1 Estando en `/servicios`, solo el enlace "Servicios" tiene `aria-current="page"`.
- CA-02.2 Estando en `/`, solo "Inicio" tiene `aria-current="page"` (no queda activo en
  otras rutas).
- CA-02.3 El enlace activo tiene un estilo distinto de los demás.

### HP-03 Home como escaparate
La home resume el sitio y deriva a las páginas internas. Conserva el hero, ¿Qué es KUVU?,
¿Cómo funciona?, la banda del equipo, el FAQ corto y el CTA final; Servicios se muestra como
resumen con enlace a `/servicios`.

- CA-03.1 La home tiene un enlace visible a `/servicios` en el bloque de servicios, a
  `/nosotros`, a `/preguntas-frecuentes` y a `/contacto`.
- CA-03.2 Ningún contenido que hoy está en la home desaparece del sitio: lo que sale de la
  home (detalle de servicios, beneficios por rol) está en `/servicios`.
- CA-03.3 El CTA principal de la home sigue siendo "Ingresar" → `/acceder` (D3, RNF-01).

### HP-04 Página 404
Una URL que no corresponde a ninguna ruta muestra una página pública "Página no encontrada",
con header, footer, un mensaje claro y un enlace para volver al inicio.

- CA-04.1 Navegar a `/no-existe` muestra la página 404 y **no** redirige a `/login`.
- CA-04.2 La página 404 tiene un enlace a `/` y la navegación única (HP-01).
- CA-04.3 La página 404 publica `<meta name="robots" content="noindex">` y un title propio.
- CA-04.4 Las rutas existentes (públicas, `/acceder`, `/login` y las protegidas por guard)
  mantienen su comportamiento actual.

### HP-05 Carga diferida
Las páginas nuevas (`/servicios`, `/contacto`, `/legal`, 404) se cargan bajo demanda
(RNF-04).

- CA-05.1 Ninguna de las páginas nuevas forma parte del bundle inicial.

### HP-06 Breadcrumb en páginas internas
`/servicios`, `/contacto` y `/legal` muestran el breadcrumb "Inicio › {Página}" con su
JSON-LD `BreadcrumbList`, igual que `/nosotros`.

- CA-06.1 Cada una de esas páginas renderiza el breadcrumb con el nombre de la página.
- CA-06.2 Cada una publica un único `BreadcrumbList` en `<head>` y lo retira al salir.

---

## 2. Header y menú móvil

### HP-07 Header fijo que se compacta
El header queda fijo arriba al hacer scroll. Al pasar un umbral de desplazamiento cambia a
un estado compacto con fondo semiopaco y desenfocado; al volver arriba recupera su estado
inicial.

- CA-07.1 Con el scroll en 0 el header está en estado inicial.
- CA-07.2 Superado el umbral, el header tiene el estado compacto (clase/atributo
  verificable).
- CA-07.3 El header no tapa el contenido inicial de ninguna página ni el destino de un
  enlace interno.

### HP-08 Menú móvil a pantalla completa
En ancho móvil (< 768 px, RNF-02) el botón de menú abre un panel que ocupa la pantalla con
los enlaces de HP-01, "Ingresar" y el selector de tema.

- CA-08.1 Al abrir: el botón tiene `aria-expanded="true"`, el body no hace scroll y el foco
  pasa al primer elemento del panel.
- CA-08.2 Se cierra con: la tecla Escape, el botón de cerrar, o al elegir un enlace. Al
  cerrar, el scroll del body se restablece y el foco vuelve al botón de menú.
- CA-08.3 Al navegar a otra ruta el menú queda cerrado.
- CA-08.4 Los ítems entran con un escalonado; con `prefers-reduced-motion: reduce` aparecen
  sin animación.

---

## 3. Footer

### HP-09 Footer por columnas
El footer de todas las páginas públicas tiene: bloque de marca (logo, nombre, tagline),
columna **Sitio** (enlaces de HP-01), columna **Legal** (los 4 documentos de `/legal`,
enlazados a su ancla) y columna **Contacto** (WhatsApp y correo), más el copyright con el
año en curso.

- CA-09.1 La columna Legal tiene 4 enlaces a `/legal#{ancla}`, uno por documento de HP-12.
- CA-09.2 La columna Contacto enlaza al WhatsApp de `content/site.ts`.
- CA-09.3 No se muestra correo (KUVU no tiene uno, ver HP-13): ni línea vacía ni `mailto:`.
  El footer dice que KUVU es un proyecto académico desarrollado en la Universidad
  Cooperativa de Colombia.
- CA-09.4 No se muestran íconos ni enlaces de redes sociales mientras no haya URLs reales
  (D2). No hay enlaces con `href="#"`.
- CA-09.5 En móvil las columnas se apilan sin scroll horizontal.

---

## 4. Página `/servicios`

### HP-10 Contenido de servicios
`/servicios` presenta los servicios de KUVU y los beneficios por rol, con el contenido que
hoy existe en `content/services.ts` y `content/benefits.ts`, y cierra con un CTA secundario
a `/contacto`.

- CA-10.1 Muestra todos los servicios de `services` (título, descripción e ícono).
- CA-10.2 Muestra todos los beneficios por rol de `benefitsByRole`.
- CA-10.3 Tiene title y description propios (HP-17).
- CA-10.4 Tiene un enlace "Contactar" a `/contacto` con estilo secundario.

---

## 5. Página `/contacto`

### HP-11 Formulario que abre WhatsApp
`/contacto` tiene un formulario con: nombre (obligatorio), empresa (opcional), correo y
teléfono (al menos uno de los dos), asunto (lista cerrada) y mensaje (obligatorio), más la
casilla de autorización de tratamiento de datos (obligatoria). Al enviarlo válido, se abre
WhatsApp con un mensaje que contiene los datos ingresados.

Asuntos: "Quiero conocer KUVU", "Vincular mi inmobiliaria", "Soporte de mi cuenta",
"Otro".

- CA-11.1 Sin nombre, sin mensaje, sin correo **y** sin teléfono, o sin la casilla marcada,
  el envío no ocurre y cada campo en error muestra un mensaje asociado al campo
  (`aria-describedby`/`aria-invalid`).
- CA-11.2 Un correo con formato inválido es un error, aunque haya teléfono.
- CA-11.3 Con datos válidos, el envío abre `https://wa.me/{número de content/site.ts}` en
  una pestaña nueva con un texto que incluye asunto, nombre, empresa (si hay), correo y/o
  teléfono (si hay) y mensaje.
- CA-11.4 Los campos vacíos opcionales no aparecen en el mensaje.
- CA-11.5 El formulario no envía datos a ningún servidor de KUVU ni los guarda en el
  navegador.
- CA-11.6 Tras abrir WhatsApp se muestra una confirmación en pantalla, anunciada con
  `aria-live`.
- CA-11.7 Cada campo tiene un `<label>` asociado.

### HP-11b Autorización de tratamiento de datos
La casilla dice, en sustancia, que el titular autoriza a KUVU a tratar sus datos para
responder su solicitud conforme a la Política de tratamiento de datos, con un enlace a
`/legal#tratamiento-datos`.

- CA-11b.1 La casilla nace desmarcada.
- CA-11b.2 El texto de la casilla enlaza a la política de tratamiento de datos.

### HP-11c Otros canales en `/contacto`
La página muestra el enlace directo a WhatsApp y el teléfono (sin correo, ver HP-13), y un bloque "Qué
pasa cuando envías" con 3 pasos (se arma el mensaje, se abre WhatsApp, el equipo responde).

- CA-11c.1 Los 3 pasos están presentes y numerados.

---

## 6. Página `/legal`

### HP-12 Estructura de `/legal`
Una sola página con un índice numerado al inicio que enlaza a 4 secciones, cada una con un
ancla estable:

| # | Sección | Ancla |
|---|---|---|
| 1 | Política de tratamiento de datos personales | `tratamiento-datos` |
| 2 | Aviso de privacidad | `aviso-privacidad` |
| 3 | Términos de uso | `terminos-uso` |
| 4 | Política de cookies y almacenamiento local | `cookies` |

- CA-12.1 El índice tiene 4 enlaces y cada uno lleva a su sección.
- CA-12.2 Entrar a `/legal#cookies` (o cualquier ancla de la tabla) deja visible esa
  sección sin que el header fijo la tape.
- CA-12.3 La página muestra la fecha de vigencia / última actualización.
- CA-12.4 Al inicio de la página hay un aviso visible: los textos son una base de referencia
  y no constituyen asesoría legal.

### HP-13 Datos del responsable: empresa ficticia (D1)
KUVU es una empresa ficticia de un proyecto académico (decisión del usuario, que reemplaza a
los marcadores). Se publican solo datos que no pueden pertenecer a un tercero real:
razón social `KUVU`, domicilio `Bogotá D.C., Colombia`, teléfono `+57 322 319 2760` (el
WhatsApp ya publicado), área de atención `Equipo KUVU — Protección de datos personales` y
vigencia `18 de octubre de 2026`. NIT, dirección física y correo **no se inventan** (podrían
coincidir con una persona o empresa real) y quedan omitidos: la frase o línea que los
mencionaría no se renderiza. Donde el correo era el canal (consultas y reclamos, términos,
contacto) se usan el formulario de `/contacto` y el WhatsApp. El aviso de `/legal` y el footer
dicen que KUVU es un proyecto académico desarrollado en la Universidad Cooperativa de
Colombia.

- CA-13.1 Los datos salen de un único lugar del contenido (`content/responsible.ts`):
  cambiarlos una vez los actualiza en `/legal`, footer y `/contacto`.
- CA-13.2 No se publican NIT, dirección ni correo, y ningún texto queda incompleto por
  omitirlos (sin "NIT:" vacío ni frases cortadas).
- CA-13.3 El sitio no muestra marcadores (`[…]`) en ninguna página.

### HP-14 Contenido de la política de tratamiento de datos
Cubre, como mínimo, los elementos que exigen la Ley 1581 de 2012 y el Decreto 1377 de 2013
(art. 13):

1. Identificación del responsable: nombre o razón social, NIT, domicilio, dirección,
   correo y teléfono (los que existen; ver HP-13).
2. Marco normativo: Ley 1581 de 2012 y Decreto 1377 de 2013 (compilado en el Decreto 1074
   de 2015).
3. Definiciones básicas: titular, dato personal, dato sensible, tratamiento, responsable,
   encargado, autorización.
4. Datos que se tratan y su finalidad, separados por origen:
   - visitantes que escriben por contacto o WhatsApp (nombre, empresa, correo, teléfono,
     mensaje) → responder la solicitud;
   - usuarios de la plataforma (nombre, correo, número de documento, rol, empresa) →
     autenticación, operación del servicio y soporte;
   - datos que cada inmobiliaria carga sobre sus arrendatarios, locales, contratos, pagos y
     mantenimientos → KUVU los trata **por cuenta de la inmobiliaria**, que es la
     responsable frente a sus titulares.
5. Principios del tratamiento (legalidad, finalidad, libertad, veracidad, transparencia,
   acceso y circulación restringida, seguridad, confidencialidad).
6. Derechos del titular (art. 8 Ley 1581): conocer, actualizar y rectificar; solicitar
   prueba de la autorización; ser informado del uso; presentar quejas ante la
   Superintendencia de Industria y Comercio; revocar la autorización y/o pedir la supresión;
   acceder gratuitamente a sus datos.
7. Autorización: previa, expresa e informada; cómo se obtiene (casilla de `/contacto`, alta
   de usuarios por la inmobiliaria).
8. Datos sensibles y de menores: carácter facultativo de responder sobre datos sensibles;
   KUVU no solicita datos de menores.
9. Área responsable de atender consultas y reclamos y canales (formulario de `/contacto` y
   WhatsApp).
10. Procedimiento: consultas atendidas en máximo 10 días hábiles (prorrogables 5);
    reclamos en máximo 15 días hábiles (prorrogables 8), con lo que debe contener el reclamo.
11. Seguridad de la información: acceso por rol y separación de datos por empresa, descritos
    sin prometer más de lo que el sistema hace.
12. Transferencias/transmisiones: KUVU no vende ni cede datos a terceros; mención de los
    proveedores de infraestructura como encargados (genérico, sin nombres inventados).
13. Vigencia de la política y de las bases de datos.

- CA-14.1 Cada uno de los 13 puntos está presente como subtítulo o párrafo identificable.
- CA-14.2 Se citan textualmente "Ley 1581 de 2012" y "Decreto 1377 de 2013".
- CA-14.3 Los plazos de 10 y 15 días hábiles están escritos.

### HP-15 Aviso de privacidad, términos y cookies
- **Aviso de privacidad** (art. 15 Decreto 1377): identidad y contacto del responsable,
  tratamiento y finalidad, derechos del titular, y dónde consultar la política completa
  (enlace al ancla `tratamiento-datos`).
- **Términos de uso**: objeto del sitio y de la plataforma; acceso por invitación de la
  inmobiliaria (no hay registro abierto); responsabilidades del usuario (credenciales,
  uso lícito, veracidad de datos que carga); propiedad intelectual de KUVU; disponibilidad
  del servicio sin garantía de continuidad absoluta; enlaces a terceros (WhatsApp);
  modificaciones de los términos; ley aplicable colombiana; contacto (formulario y WhatsApp).
- **Cookies y almacenamiento local**: explica que KUVU no usa cookies de analítica, publicidad
  ni de terceros; enumera lo que guarda en el navegador y para qué: preferencia de tema,
  sesión iniciada (empresa y usuario) y empresa preseleccionada al acceder (la intro vista se
  guarda solo en memoria en esta base; si `feat/acceso-orden-e-intro` la persiste, se suma); explica cómo borrarlo desde el navegador y que cerrar sesión elimina los datos de
  sesión.

- CA-15.1 El aviso de privacidad enlaza a `#tratamiento-datos`.
- CA-15.2 La sección de cookies enumera las 3 categorías de almacenamiento listadas, y
  ninguna que el sitio no use.
- CA-15.3 Términos de uso nombra la ley colombiana como aplicable.

---

## 7. Lenguaje visual y movimiento

### HP-16 Lenguaje editorial y microinteracciones
- Cada sección principal de la home y de las páginas internas lleva una etiqueta numerada
  correlativa ("01", "02"…) sobre el título.
- Los enlaces de tipo CTA llevan una flecha `→` que se desplaza al hover/foco.
- Tarjetas y enlaces tienen estados hover y `:focus-visible` visibles.
- El scroll-reveal existente se aplica también a las páginas nuevas.
- Todo movimiento nuevo se desactiva con `prefers-reduced-motion: reduce` (RNF-03).
- Funciona en tema claro y oscuro con contraste legible.

- CA-16.1 Las etiquetas numeradas de una página son correlativas desde 01 y no se repiten.
- CA-16.2 Las etiquetas numeradas y las flechas son decorativas para lectores de pantalla
  (`aria-hidden`) o forman parte del nombre accesible sin duplicarlo.
- CA-16.3 Con reduced motion: no hay transiciones de entrada, escalonados ni desplazamientos.
- CA-16.4 No hay scroll horizontal en 360 px de ancho en ninguna página pública.

---

## 8. SEO

### HP-17 Meta por página
Cada página pública tiene title y meta description propios y distintos, Open Graph
(`og:title`, `og:description`, `og:type`, `og:url`, `og:locale=es_CO`, `og:image`), Twitter
card y `<link rel="canonical">` con su URL absoluta.

- CA-17.1 Al navegar entre páginas, title, description, `og:*`, `twitter:*` y canonical se
  actualizan a los de la página actual; no quedan duplicados.
- CA-17.2 Ninguna pareja de páginas comparte title o description.
- CA-17.3 `og:image` apunta a una imagen existente del sitio (D4).

### HP-18 Meta base y datos estructurados
- `index.html` tiene title, description, Open Graph y Twitter card por defecto específicos
  de KUVU (no "Gestión de arriendos" genérico), que son los que leen los crawlers sociales.
- La home publica JSON-LD `Organization` (nombre, URL, logo) y `WebSite`, sin datos
  inventados (sin dirección física).

- CA-18.1 La home tiene exactamente un `Organization` y un `WebSite`; al salir de la home se
  retiran.
- CA-18.2 El JSON-LD se inserta como texto (no interpretado como HTML).

---

## 9. FAQ ampliado

### HP-19 Preguntas nuevas
`/preguntas-frecuentes` suma preguntas cuya respuesta sale de lo que el sitio ya afirma o de
`/legal`: cómo contactar a KUVU, cómo se tratan los datos personales (enlace a `/legal`),
quién puede ingresar (acceso por empresa y rol, sin registro abierto), si KUVU usa cookies.

- CA-19.1 Hay al menos 3 preguntas nuevas, cada una consistente con `/legal` y `/contacto`.
- CA-19.2 Ninguna respuesta afirma precios, plazos, cifras o funcionalidades que el sistema
  no tenga.
- CA-19.3 El FAQ corto de la home sigue mostrando 4 preguntas.

---

## 10. Calidad transversal

### HP-20 Tests
Todo comportamiento nuevo tiene tests Karma/Jasmine (`test-after`, RNF-15): navegación y
página activa, menú móvil, footer, formulario de contacto (validaciones y mensaje armado),
`/legal` (índice, anclas, datos del responsable, contenido mínimo), 404, meta/JSON-LD, contenido.

- CA-20.1 `npx ng test --watch=false --browsers=ChromeHeadless` pasa completo.
- CA-20.2 `ng build` compila sin errores.

---

## Resumen de requisitos

| Área | Requisitos | Criterios |
|---|---|---|
| Navegación y multipágina | HP-01..HP-06 | 16 |
| Header y menú móvil | HP-07, HP-08 | 7 |
| Footer | HP-09 | 5 |
| `/servicios` | HP-10 | 4 |
| `/contacto` | HP-11, 11b, 11c | 10 |
| `/legal` | HP-12..HP-15 | 12 |
| Lenguaje visual y movimiento | HP-16 | 4 |
| SEO | HP-17, HP-18 | 5 |
| FAQ ampliado | HP-19 | 3 |
| Calidad | HP-20 | 2 |
| **Total** | **22** | **68** |

---

## No-objetivos y casos excluidos

- Todo lo listado como no-objetivo en `propose.md` (admin, acceso, slider/Ken Burns,
  carrusel, parallax, impresión, testimonios/cifras/demo, banner de cookies, inglés,
  SSR/prerender, backend, envío de correo, textos legales definitivos).
- **Validez jurídica**: la spec exige los elementos mínimos de la normativa, no que el texto
  sea legalmente suficiente; eso lo valida un abogado con los datos reales.
- **Registro Nacional de Bases de Datos (RNBD)**: no se menciona; depende del tamaño de la
  empresa responsable, dato que no existe.
- **Crawlers sociales**: ven solo las meta de `index.html` (SPA sin prerender); las meta por
  página sirven a buscadores que ejecutan JS.
- **Entrega del mensaje de WhatsApp**: el sitio solo abre el enlace; si el visitante no envía
  el mensaje en WhatsApp, KUVU no recibe nada y no hay forma de saberlo.
- **Bloqueadores de pop-ups**: si el navegador bloquea la pestaña nueva, se ofrece el enlace
  directo de WhatsApp como alternativa; no se reintenta.
- **Navegadores**: se verifica en Chrome; el resto queda como RNF-17 "sin verificar".
