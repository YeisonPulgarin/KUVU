# Archive report — menu-hover-scrollspy-breadcrumb

## Acciones fuera del código
- Secretos a rotar: ninguno. Dependencias: ninguna. Infra: ninguna (`secure-report`).

## Qué se hizo
- Menú móvil: hover y `:focus-visible` visibles (color de marca, tinte 14 %, subrayado que
  crece, desplazamiento de 12 px solo con movimiento; con movimiento reducido el cambio visual
  se mantiene).
- Home: scroll-spy (`SectionSpyService`, raíz) que resalta el ítem del menú de la sección
  leída, en escritorio y móvil; `aria-current="page"` sigue en la página real.
- Home: rastro acumulativo "Inicio › Servicios › …" colgado bajo la barra del header, con
  pasos enlazados a sus secciones; el offset de anclas suma su alto.
- Equipo: Carlos Arciniegas · Wilson Solano · Yeison Pulgarin, el orden de izquierda a
  derecha en las fotos (confirmado por el usuario), en la home y en `/nosotros`.

## Decisiones
- Spy y rastro solo en la home; las páginas internas resaltan por ruta y conservan su
  breadcrumb estático con JSON-LD.
- Cálculo por scroll con línea de lectura al 35 % del viewport (y "fondo de página → última
  sección") en lugar de `IntersectionObserver`.
- Rastro dentro del header en `position: absolute` (sin saltos de layout).

## Verificación
- `ng test` 702/702 en verde; `ng build` sin errores (warnings `css-inline-fonts`
  preexistentes de landing/login). Re-verificado tras `secure` (sin hallazgos) y `refine`
  (sin cambios).

## Documentación
- `docs/menu-hover-scrollspy-breadcrumb.md` (nuevo).
- `docs/architecture.md`: clúster público y decisiones estructurales.
- `CHANGELOG.md` (Unreleased): Added (scroll-spy/rastro, hover del menú móvil) y Fixed
  (orden del equipo).
- README: no aplica (no cambian instalación, comandos ni descripción). OpenAPI/Bruno: no
  aplica (sin endpoints HTTP).

## Deuda y no tocado (de `refine-report`)
- `pathOf` duplicado en `anchor-smooth-scroll.ts` y el header (Regla de Tres).
- Spy y `ScrollMotionService` leen layout en frames distintos; `getElementById` por frame.
  Ambos dejados así por KISS (costo despreciable).

## Pendientes
- **Entrega:** commits solo locales en `release/integracion` (de `ade2fb1` a este archivo),
  sin push ni PR, por decisión del usuario. El cambio supera el umbral de riesgo (≈625
  líneas de frontend) y está partido en un commit por slice para revisar por partes.
- Revisión visual a cargo del usuario en su servidor local.
- Extensión `git` no activa: sin CI ni PR que registrar.
