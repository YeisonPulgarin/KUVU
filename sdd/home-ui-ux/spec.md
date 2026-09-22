# Fase Spec: Home UI/UX — aplicar estrictamente las reglas de diseño

## Requisitos funcionales

### 1. Tipografía global (Geist)
- *Given* la aplicación carga,
  * *When* cualquier vista renderiza texto,
  * *Then* la familia de fuente global es **Geist** (400–800), reemplazando Plus Jakarta Sans
    en `styles.css`, sin cambios de fuente por componente.
- *Given* el titular de la home,
  * *When* se renderiza el hero,
  * *Then* el titular no contiene em-dash (`—`) ni en-dash (`–`) y no usa itálica
    (`<em>`/`italic`) como énfasis sobre una frase; el énfasis se logra con peso o layout,
    nunca con familia/frase destacada.

### 2. Paleta y contraste
- *Given* la home,
  * *When* se renderiza cualquier elemento,
  * *Then* todos los verdes usados pertenecen a una única escala de marca derivada de
    `#6b8e6b` / `#547354` (ningún verde "a mano" como `#2f4a2f` ni la clase `.yellow` pintada
    de verde), y los neutros están tintados al hue del verde (no grises fríos puros).
- *Given* cualquier botón o CTA,
  * *When* se verifica contraste de texto contra fondo,
  * *Then* cumple WCAG AA: ≥ 4.5:1 para texto normal, ≥ 3:1 para texto grande (≥18px).
- *Given* la estrategia de color,
  * *When* se comparan las secciones,
  * *Then* hay un solo color de acento (verde de marca) usado en toda la página (Color
    Consistency Lock); ninguna sección introduce un acento distinto.

### 3. Espaciado, radios y densidad
- *Given* las secciones de la home,
  * *When* se inspeccionan los espaciados verticales,
  * *Then* el padding vertical de las secciones de marketing usa la escala de densidad Brand
    del skill de diseño (rango `py-32` a `py-48` en desktop), en lugar de `py-16`/`py-24`.
- *Given* cualquier elemento con borde redondeado,
  * *When* se comparan los radios,
  * *Then* hay UN scale de `border-radius` por tipo con la regla documentada (p. ej.
    "botones pill, cards 16px, íconos 12px") y se respeta en toda la página; no se mezclan
    radios arbitrarios (`rounded-xl` + `rounded-lg` + `rounded-full` sin regla).

### 4. Layout — patrones baneados eliminados
- *Given* la sección de servicios,
  * *When* se renderiza,
  * *Then* no usa una grilla de tarjetas idénticas (mismo radio, misma sombra, misma forma)
    como familia de layout; usa otra familia (listas con `divide-y`, columna de títulos +
    lista, o grid asimétrico) manteniendo los 5 servicios: Gestión de locales, Contratos,
    Pagos, Mantenimientos, Usuarios.
- *Given* la sección de compañías,
  * *When* se renderiza,
  * *Then* las 4 empresas (Amarilo, Nido Rent, Balcones de San Soucci, Mi Inmueble) aparecen
    como wordmarks tipográficos distintivos (no pills grises genéricos, no logos inventados).
- *Given* el copy visible de la página,
  * *When* se audita,
  * *Then* no contiene em-dash ni en-dash en ningún string visible, ni "fake-precise
    numbers", ni verbos de relleno.
- *Given* la intención de acceso,
  * *When* se observan los CTAs,
  * *Then* existe UNA única label de acceso consistente en navbar, hero y CTA final ("Ingresar"),
    sin labels duplicadas con la misma intención.
- *Given* el hero,
  * *When* se renderiza,
  * *Then* el titular no excede 2 líneas en desktop, el subtexto no excede 20 palabras, los
    CTAs son visibles sin scroll, y no hay elementos baneados (taglines bajo CTA, bullets,
    trust strips).

### 5. Dark mode manual
- *Given* la home cargada,
  * *When* el visitante hace clic en el botón de tema del navbar,
  * *Then* la página alterna entre modo claro y modo oscuro, y la elección queda persistida
    en `localStorage` para la próxima visita.
- *Given* que el visitante recarga la página con preferencia guardada,
  * *When* la home se renderiza,
  * *Then* aplica el modo guardado (por defecto claro si no hay preferencia), sin flash de
    modo equivocado.
- *Given* la home en modo oscuro,
  * *When* se observa cualquier sección,
  * *Then* todas las secciones mantienen el mismo tema (no se alterna tema por sección), con
    superficies oscuras de marca y verdes de la misma escala, respetando contraste AA.

### 6. Movimiento
- *Given* el hero,
  * *When* la home carga por primera vez,
  * *Then* se reproduce UN único momento orquestado de entrada (por ejemplo, fade-up de
    titular/subtítulo/CTA escalonado), sin repetir el mismo efecto en todas las secciones.
- *Given* las secciones del cuerpo,
  * *When* el visitante hace scroll,
  * *Then* los reveals usan animaciones de `transform` y `opacity` únicamente, con reveales
    puntuales (no fade+slide en cada sección), con curva `cubic-bezier(0.16,1,0.3,1)` y
    duraciones de 0.4–0.6s.
- *Given* un hover sobre CTAs o elementos interactivos,
  * *When* el puntero pasa por encima,
  * *Then* la transición anima solo `transform`/`opacity` con la curva estándar.
- *Given* un usuario con `prefers-reduced-motion: reduce`,
  * *When* la home carga o hace scroll,
  * *Then* las animaciones de entrada y reveal se desactivan (contenido visible sin
    transformaciones): el contenido nunca queda invisible por una transición pendiente.

### 7. Accesibilidad y regresión
- *Given* la home,
  * *When* se usa navegación por teclado,
  * *Then* los elementos interactivos tienen `:focus-visible` visible.
- *Given* el rediseño,
  * *When* se corren los tests del componente,
  * *Then* se conservan los selectores claves (`#hamburger-toggle`, `#mobile-menu`,
    `aria-expanded`, clase `.hidden` para menú móvil) salvo ajuste documentado, y la suite
    pasa en verde.

## Criterios de Aceptación

1. `styles.css` declara Geist como fuente global; Plus Jakarta Sans no aparece en ninguna
   hoja de estilos. Titular del hero sin `—`/`–` y sin itálica de frase.
2. Todos los botones y CTAs pasan contraste AA verificado (4.5:1 texto normal, 3:1 texto
   grande); ningún verde fuera de la escala de marca; `.yellow` desaparece o se pinta de un
   amarillo real si existe intención.
3. Secciones de marketing con `py-32`+ en desktop; una sola regla de radio documentada y
   aplicada en toda la página.
4. Sección servicios sin la familia "N cards idénticas"; los 5 servicios siguen presentes
   (cubierto por test). Compañías como wordmarks tipográficos con las 4 empresas.
5. Sin em-dash ni en-dash en strings visibles (grep del template); un solo label "Ingresar"
   en navbar/hero/CTA final.
6. Botón de tema visible en navbar; alterna claro/oscuro; persiste en `localStorage`; la home
   arranca en el modo guardado sin flash; en dark todas las secciones son dark.
7. Hero entrance presente; reveals animan solo transform/opacity con la curva estándar; bajo
   `prefers-reduced-motion: reduce` no hay animaciones de entrada (contenido visible).
8. `:focus-visible` presente en interactivos.
9. Suite de `home.component.spec.ts` en verde (test-after); selectores clave conservados.
10. `ng build` compila; no se introducen dependencias nuevas (Geist vía Google Fonts).

## No-objetivos / edge cases excluidos

- No se rediseñan login, landing, dashboard ni otras vistas (solo la fuente global cambia
  para todos).
- No se agregan imágenes, screenshots ni logos reales de compañías; wordmarks tipográficos
  únicamente.
- No se cambia la ruta `/acceder` ni la lógica del menú móvil.
- No se persiste el tema en backend ni se sincroniza entre pestañas (solo `localStorage`).
- La verificación de contraste es estática/manual (cálculo sobre pares de color); no se
  automatiza con herramienta.
- No se agrega animación de cambio de tema (transición de color): solo la clase `.dark` se
  aplica/remueve; evita flash y jank.