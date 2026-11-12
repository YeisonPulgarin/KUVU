# Archive report — ajustes-hover-movil-y-textura

## Acciones fuera del código
- Secretos a rotar: ninguno. Dependencias: ninguna. Infra: ninguna (`secure-report`).
- Riesgo residual aceptado: ninguno.

## Qué se hizo
- **Menú hamburguesa del sitio.** Causa: en táctil no hay hover y el clic cerraba el panel en
  el mismo instante, así que la opción tocada nunca mostraba el cambio. El CSS sí llegaba al
  bundle. Ahora `:active` y la opción elegida (`is-pressed`) muestran color, tinte, subrayado
  que crece y desplazamiento, y el panel se cierra tras 320 ms (`TAP_FEEDBACK_MS`) sin demorar
  la navegación.
- **Textura de la app interna.** Causa: el velo del 93 % dejaba ~3 niveles de variación del
  ruido gris, imperceptibles. Ahora hay motas pizarra con transparencia (`$grain-specks`) y un
  brillo radial del color de la empresa al 8 %; tarjetas, tablas y modales siguen lisos.
- **Menú lateral de la app interna (ampliación pedida por el usuario).** Mismo lenguaje para
  ambos roles, en escritorio y en el drawer móvil: acento del color de empresa aclarado con
  blanco (≥ 4.5 : 1 sobre el fondo oscuro para cualquier color), tinte, subrayado que crece y
  desplazamiento de 4 px; en el drawer, la misma pausa de cierre. El activo conserva su barra.

## Verificación
- `ng test` 720/720 en verde; `ng build` sin errores (warnings `css-inline-fonts`
  preexistentes). CSS compilado revisado para header, sidebar y fondo; captura en Chrome
  headless del fondo antes y después.
- Re-verificado tras `secure` (sin hallazgos) y `refine` (borró el `:hover` del sidebar que la
  hoja nueva ya redefinía).

## Documentación
- `docs/ajustes-hover-movil-y-textura.md` (nuevo).
- `CHANGELOG.md` (Unreleased): Added (feedback del menú lateral) y Fixed (feedback táctil del
  menú del sitio; textura visible de la app).
- `docs/architecture.md`: sin cambios (sin componentes, capas ni límites nuevos).
- README: no aplica (no cambian instalación, comandos ni descripción). OpenAPI/Bruno: no
  aplica (sin endpoints HTTP).

## Deuda y no tocado (de `refine-report`)
- Pausa de cierre repetida en header y sidebar; subrayado por gradiente en dos componentes.
  Regla de Tres: extraer si aparece un tercer menú.
- Alias `MENU_TAP_FEEDBACK_MS` y fundido de color base del sidebar con movimiento reducido:
  dejados a propósito.

## Pendientes
- **Entrega:** commits solo locales en `release/integracion` (`bf61958` a este archivo), sin
  push, sin PR y sin deploy. El usuario decide la entrega.
- Revisión visual del usuario: recargar alcanza (`ng serve` recompila solo; Ctrl+F5 si el
  navegador conserva estilos viejos).
- Extensión `git` no activa: sin CI ni PR que registrar.
