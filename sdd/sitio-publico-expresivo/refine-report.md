# Refinamiento — sitio-publico-expresivo

Aplicado en la rama más alta de la pila (`feat/sitio-publico-expresivo-home`). Los controles
del `secure-report` no se tocan (no hubo controles nuevos).

## Red de seguridad

- Suite Karma: 484/484 antes y después (se suma una aserción de la clase de trama en un test
  existente de la home).
- Baseline: initial 448,08 kB y styles 35,7 kB; capturas CDP `spe-home` de las 9 rutas ×
  375/1280 × claro/oscuro.

## Cambios aplicados

1. **Refactor: borrar código muerto.** `.site-container` de `_site.scss` no lo usa ninguna
   plantilla. Lente C (contención / borrar antes que agregar). Beneficio: menos CSS global
   (styles 35,62 kB después).
2. **Refactor: duplicación (Regla de Tres).** La trama de puntos estaba escrita tres veces
   (`.surface-dots` global, `:host` de `steps-journey` y la celda 2 del bento). La sección
   `#como-funciona` usa ahora la clase global `.surface-dots` y el `:host` de `steps-journey`
   solo conserva su borde. Beneficio: una fuente menos de verdad para la trama.

Verificación: suite en verde; `ng build` con initial 446,44 kB (−1,64 kB). El diff de capturas
de la home contra el estado previo no muestra cambios en la sección de pasos. Las únicas
diferencias están en la cinta de compañías (filas 4466–4597 a 1280 px y 5512–5744 a 375 px) y
vienen del ajuste de separación del modo estático hecho al cerrar `home`, antes de este
refinamiento.

## Deliberadamente NO tocado

- **Bloque `.container` repetido** en las 4 páginas, `app-public-page`, el hero, `team-band` y
  `_section-heading`. Los estilos encapsulados de Angular no cruzan componentes, y
  centralizarlo pide una clase global en cada plantilla (más superficie de cambio que la
  duplicación que quita, en archivos de las ramas A y B). Riesgo > beneficio.
- **Trama en la celda 2 del bento:** usar la clase global cambiaría su color de fondo (el
  `background-color` del componente gana sobre el global). Queda como regla local.
- **Patrón "título display en página"** (`font-family` + `font-size` + uppercase) repetido en
  los h3 de servicios, roles, seguridad y equipo. Son tamaños distintos por contexto y no hay
  una abstracción estable todavía.

## Deuda técnica residual

- Unificar el contenedor de 72rem en una primitiva global cuando se toquen de nuevo las
  páginas.
