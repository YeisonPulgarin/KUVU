# propose — home-animaciones

## Intent

La home de KUVU se siente estática: todo aparece con el mismo fade corto. El cambio le da
movimiento expresivo y fluido, que acompaña el scroll y las interacciones. Las referencias son
zookay.co, salomondevsystems.com y ark-up.com, como inspiración y no como copia. El header, el
footer y las transiciones entre páginas del sitio público siguen el mismo lenguaje.

## Alcance

1. **Lenguaje de movimiento común:** curvas de easing, duraciones y distancias compartidas por todo
   el sitio público. Scroll nativo suave para las anclas. Todo el movimiento se apaga con
   `prefers-reduced-motion: reduce` y el contenido queda visible y completo.
2. **Home** (se pueden reestructurar secciones; los textos no cambian):
   - **Hero:** el título entra por palabras, hay un indicador de scroll y la salida tiene un
     parallax leve ligado al scroll.
   - **Barra de progreso de scroll** fina, con el color de marca.
   - **Apariciones más expresivas** de las secciones, con variantes (fade-up, apertura con
     clip-path para la imagen de la banda de equipo).
   - **"¿Qué es KUVU?":** el texto se enciende palabra por palabra al hacer scroll.
   - **"¿Cómo funciona?" como recorrido:** línea de progreso y paso activo ligados al scroll; fijo
     en desktop y lista en mobile.
   - **"Compañías que confían" como banda infinita lenta:** se pausa con hover o foco y es estática
     con movimiento reducido.
   - **Banda de equipo** con parallax suave.
   - **Microinteracciones:** botones principales que siguen levemente al puntero (solo con mouse o
     trackpad) y elevación en hover de filas y tarjetas.
3. **Header y footer:** transiciones coherentes con el lenguaje común (estado compacto, menú móvil,
   enlaces y CTA). Comparten el indicador de progreso si el diseño lo ubica en el header.
4. **Transiciones entre páginas** del sitio público: una transición propia (por ejemplo, el
   contenido se desliza con el header fijo) en lugar del cross-fade genérico, sin afectar la
   entrada a la intro de `/acceder` ni las rutas autenticadas.
5. **Tests** (`test-after`) del comportamiento nuevo, incluido el modo de movimiento reducido. Doc
   del cambio, CHANGELOG y architecture si corresponde.

## No-objetivos

- Librerías de animación o de scroll (GSAP, Lenis, Motion, three.js): la decisión es cero
  dependencias nuevas.
- Suavizado del scroll por JS o secuestro de la rueda: el scroll es nativo.
- Cambiar textos, contenido, branding o assets. No se reproduce nada propio de los sitios de
  referencia (marca, textos, ilustraciones, hero en forma de rueda, cursor custom, terminal tipeada).
- WebGL, canvas, video o imágenes nuevas.
- Animar las páginas internas más allá de la transición entre rutas y de lo que heredan del header
  y footer, la intro de `/acceder` y la app autenticada (dashboard y módulos).
- Rediseño visual (paleta, tipografía, layout general) fuera de lo que pide el movimiento.

## Approach

- **Sin dependencias, sobre lo que ya existe:** `RevealDirective` e `IntersectionObserver` para las
  apariciones, un único lector de scroll por `requestAnimationFrame` que publica el progreso como
  variables CSS (barra, parallax, recorrido, texto por palabra), CSS para el resto, y View
  Transitions del router para las páginas.
- **Restricciones de presupuesto:**
  - Los estilos de `home.component.scss` están a ~0,2 kB del warning de 17 kB. El movimiento nuevo
    vive en estilos globales, directivas o componentes nuevos.
  - El bundle inicial tiene ~75 kB de margen y la home es eager. El código tiene que ser chico.
- **Rendimiento:** se animan solo `transform`, `opacity` y `clip-path` en elementos chicos, con
  listeners pasivos. Nada se anima mientras no está a la vista.
- **Accesibilidad:** movimiento reducido apaga todo, el contenido no depende de la animación para
  leerse, los elementos en movimiento continuo se pueden pausar y el foco se mantiene visible.
- **Slices previstos** (los confirma `tasks`): `chrome` (lenguaje común, header, footer,
  transiciones de ruta, `app.config.ts` / `styles.scss`), `home` (secciones de la home) y `cierre`.
- **Base:** `feat/home-animaciones` sale de `feat/acceso-orden-e-intro` (PR #2, que ya integra la
  PR #1) y se apila sobre ella.
