# Propose — home-profesional

Fuente: `sdd/home-profesional/explore.md`. Rama: `feat/home-profesional` (desde `main`).

## Intent

El sitio público de KUVU no se ve profesional: es una home de una sola página que se recorre
por anclas, tiene un footer mínimo, no tiene páginas legales y su único movimiento es la
aparición al hacer scroll. Este cambio lo convierte en un sitio multipágina con una sola
navegación para todo el sitio, páginas legales conformes a la normativa colombiana de datos
personales, una página de contacto y mejor SEO. Los patrones vienen de actitudtravelcolombia.com;
la marca y los textos no.

## Alcance

1. **Multipágina con navegación única.** Las páginas son `/` (inicio), `/servicios`,
   `/nosotros`, `/preguntas-frecuentes`, `/contacto` y `/legal`. El header y el footer muestran
   los mismos enlaces en todas las páginas. La home funciona como escaparate: resume cada
   bloque y deriva a su página.
2. **Página `/servicios`** con el detalle de los servicios y los beneficios por rol. Todo sale
   del contenido que ya existe en `content/*.ts`.
3. **Página `/contacto`.** Un formulario arma el mensaje y abre WhatsApp con los datos
   prellenados, sin backend. La casilla de autorización de tratamiento de datos es obligatoria
   y enlaza a `/legal`.
4. **Página `/legal`.** Una sola página, con índice y anclas, que reúne cuatro documentos:
   - política de tratamiento de datos personales (Ley 1581 de 2012 y Decreto 1377 de 2013)
   - aviso de privacidad
   - términos de uso
   - política de cookies y almacenamiento local
5. **Página 404 pública.** Una ruta desconocida muestra una página 404 con navegación de
   vuelta. Hoy redirige a `/login`.
6. **Header profesional.** Queda fijo arriba y se compacta con fondo desenfocado al hacer
   scroll; resalta la página activa. En móvil, el menú ocupa toda la pantalla: los ítems entran
   escalonados, cierra con Escape, bloquea el scroll del fondo y maneja el foco.
7. **Footer por columnas:** marca, sitio, legal y contacto, más el copyright.
8. **Lenguaje visual editorial:**
   - etiqueta numerada en cada sección ("01", "02"…)
   - jerarquía tipográfica más marcada
   - CTAs con flecha que se desplaza en hover
   - hover más cuidado en tarjetas y enlaces

   Todo respeta `prefers-reduced-motion` (RNF-03).
9. **SEO:**
   - title y description propios por página
   - Open Graph, Twitter card y canonical
   - JSON-LD `Organization` y `WebSite` en la home
   - meta base de `index.html` específica para KUVU
10. **FAQ ampliado** solo con preguntas que se responden con lo que el sitio ya dice: contacto,
    tratamiento de datos, soporte, acceso por empresa y por rol.

## Decisiones del orquestador (el usuario las delegó; puede objetarlas)

- **D1. Datos del responsable.** KUVU es una empresa ficticia de un proyecto académico: se
  publican solo datos que no pueden pertenecer a un tercero real (razón social, domicilio de
  ciudad, el WhatsApp ya publicado, área de atención, vigencia). NIT, dirección y correo se
  omiten (ver `spec.md` HP-13). El sitio aclara que es un proyecto académico de la
  Universidad Cooperativa de Colombia y que los textos no son asesoría legal.
- **D2. Contacto sin datos inventados.** Se usa el número de WhatsApp que ya está en
  `content/site.ts`. El correo y las redes no existen en el repo, así que van como marcadores
  y las redes no se muestran mientras no haya datos reales.
- **D3. Llamado a la acción.** "Ingresar" sigue siendo el principal (RNF-01). "Contactar" solo
  aparece como secundario.
- **D4. Imágenes.** Solo se usan las que ya están en `public/Imagenes_web/`, que hoy son
  únicamente la foto del equipo. No se agregan imágenes nuevas.
- **D5. Entrega.** Este cambio cubre los puntos 1 a 10. Lo que figura en No-objetivos queda
  para cambios siguientes.
- **D6. Ítems y orden de la navegación:** Inicio · Servicios · Nosotros · Preguntas frecuentes
  · Contacto. Legal va solo en el footer.

## No-objetivos

- La parte administrativa (dashboard, locales, contratos, pagos, mantenimiento, usuarios) y
  el flujo de acceso (`/acceder`, `/login`).
- Hero con slider o efecto Ken Burns, carrusel con scroll-snap, bandas con parallax, estilos
  de impresión y anillo de foco global (prioridad C del explore).
- Testimonios, cifras o contadores, demo o video: no hay datos reales y no se inventan.
- Banner de consentimiento de cookies: KUVU no usa cookies de analítica ni de terceros, así
  que basta con la política.
- Versión en inglés, SSR o prerender, backend nuevo y envío de correo desde el formulario.
- Redactar textos legales definitivos con validez jurídica (ver D1).
- Copiar la marca, los textos o las imágenes del sitio de referencia.

## Approach

- Las páginas nuevas siguen el patrón de `/nosotros`: componente standalone con carga
  diferida (RNF-04), breadcrumb, `PageMetaService` y textos en `content/*.ts` (RNF-14). Los
  textos legales van en su propio módulo de contenido.
- Header y footer: se mejoran los componentes `public/site-header` y `public/site-footer` que
  ya existen. La navegación pasa a una sola lista de enlaces en lugar de dos.
- Las animaciones se hacen con CSS e `IntersectionObserver`, reutilizando la directiva reveal.
  No se agregan dependencias.
- Todo sale con tests Karma (`test-after`, RNF-15).
- Volumen: supera con holgura el umbral de 300 líneas. En `tasks` se pronostica el riesgo y
  se aplica `ask-on-risk` (Gate C).

## Riesgos y puntos abiertos para `spec` y `design`

- **Las meta tags no las ven los crawlers sociales.** La app es un SPA sin prerender, así que
  las que se fijan en el navegador no llegan a esos crawlers. Las meta por defecto de
  `index.html` son lo que se comparte. Es una limitación conocida, no un bloqueo.
- **Slices desactualizados.** Los que declara `sdd.config.md` en `main` (`contenido`,
  `chrome`, `home-expandida`, `paginas`) vienen de un cambio anterior. En `tasks` hay que
  declarar los de este cambio, y el slice `cierre` los registra en la config.
- **Posible conflicto de merge.** `sdd/sdd.config.md` y `sdd/sdd-init.md` difieren entre
  `main` y `feat/acceso-orden-e-intro`. Este cambio también los toca en `cierre`, así que
  puede haber conflicto cuando se mergeen las dos ramas.
