# Fase Propose: Home UI/UX — aplicar estrictamente las reglas de diseño

## Intent
Rediseñar la home page de KUVU para que cumpla estrictamente las reglas de diseño del
proyecto (`.agents/rules/frontend-design.md` + skill `sds-design-taste`): paleta coherente y
con contraste AA, tipografía fuera de la lista de rechazo, escala de espaciado y radios
consistente, layout sin patrones baneados (cards idénticas, em-dash, itálica en titular,
eyebrow duplicado) y movimiento motivado con respeto a `prefers-reduced-motion`. La home es la
cara pública de un producto de administración inmobiliaria multi-empresa; el diseño debe
comunicar seriedad (inmobiliaria) y modernidad (tecnología) sin caer en el slop de IA.

## Decisiones de Gate A (acordadas con el usuario)

1. **Paleta:** el verde KUVU (`#6b8e6b`/`#547354`) se preserva como acento de marca, pero se
   juega con una paleta más acorde a inmobiliaria + tecnología: neutros tintados al verde
   (apagados), verdes corregidos para contraste AA, y un verde profundo para superficies dark.
   Se elige UNA escala de verde y se aplica en toda la página (Color Consistency Lock).
2. **Tipografía:** se reemplaza Plus Jakarta Sans (lista de rechazo) por **Geist** (recomendada
   por el propio skill, fuera de la lista, disponible en Google Fonts). Cambio global en
   `styles.css`, coherente con "un solo tipo por proyecto".
3. **Copy visible:** se reescribe el titular (sin em-dash, sin itálica), se unifican los 3
   labels de CTA en una sola label ("Ingresar") y se audita el copy en cada sección.
4. **Dark mode:** se agrega un **botón de alternancia manual** (sol/luna) en el navbar, con
   preferencia persistida en `localStorage`; arranca en modo claro. Se configura la variant
   `dark:` de Tailwind v4 por clase `.dark` en `<html>`.

## Alcance

- Rediseño visual completo de la home page (`home.component.html` + `home.component.scss`):
  navegación, hero, secciones de contenido, servicios, compañías y CTA final.
- Nuevo sistema de tokens en `styles.css`: paleta (verde de marca, neutros tintados,
  superficies light/dark), tipografía Geist, radios y espaciado consistentes.
- Botón de alternancia dark/light con persistencia (`localStorage`) y variant `dark:` por
  clase; se respeta `prefers-reduced-motion` en todas las animaciones.
- Animaciones: un único momento orquestado (hero entrance) + hovers con easing estándar
  `cubic-bezier(0.16,1,0.3,1)`, animando solo `transform` y `opacity`; reveals en scroll para
  secciones clave, sin fade+slide genérico en cada sección.
- Ajuste de los tests existentes de `home.component.spec.ts` si el rediseño cambia selectores
  verificados, manteniendo `#hamburger-toggle`, `#mobile-menu` y `aria-expanded`.

## No-objetivos

- No se modifican otras vistas (login, landing, dashboard, sidebar, etc.) más allá del cambio
  de fuente en `styles.css` (que es global) y de lo necesario para la home.
- No se agregan imágenes/logos nuevos de compañías: se usa tratamiento tipográfico distintivo
  para las 4 empresas (no hay assets reales; un logo wall falso es un tell baneado).
- No se cambia comportamiento de negocio, rutas ni contenido semántico de secciones.
- No se agregan dependencias nuevas (Geist entra por Google Fonts; `@angular/animations` ya
  está instalado y se usa para transiciones si aplica).
- No se toca la arquitectura del proyecto ni otros componentes.

## Approach

1. **Tokens primero:** definir en `styles.css` (o un archivo de tokens de home) la paleta de
   marca con verdes corregidos a AA, neutros tintados, superficie light/dark, radios (una
   escala + regla documentada) y la fuente Geist.
2. **Dark mode infra:** agregar botón de tema + clase `.dark` + variant `dark:` de Tailwind v4
   + persistencia en `localStorage` + oyente que asegure arranque sin flash.
3. **Rediseño de componentes:** reescribir las secciones una a una aplicando las reglas
   (hero sin em-dash ni itálica, servicios sin "cards idénticas" → familia de layout distinta,
   compañías con wordmarks tipográficos, CTA unificado "Ingresar").
4. **Movimiento:** hero entrance (un solo momento orquestado), reveals puntuales en scroll,
   hovers con la curva estándar, todo respetando `prefers-reduced-motion`.
5. **Tests:** ajustar/ampliar `home.component.spec.ts` según la estructura final; dejar la
   suite en verde. Test mode acordado: `test-after`.
6. **Documentación:** `docs/{change-name}.md`, README/changelog si aplica (cambio visible
   desde afuera), `docs/architecture.md` inmutable (no toca arquitectura).