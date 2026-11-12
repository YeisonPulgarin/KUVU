# Verify report — menu-hover-scrollspy-breadcrumb

Estado verificado: commits `ade2fb1`, `3b9bd8a`, `7dd9974`, `9c739d8` sobre `release/integracion`.
Slices completados: `contenido`, `chrome`, `home`, `cierre`. Omitidos: ninguno.

## Tests y build
- `npx ng test --watch=false --browsers=ChromeHeadless`: **702/702 en verde**.
- `npx ng build`: sin errores. Persisten los dos warnings `css-inline-fonts` de las hojas de
  landing y login (Google Fonts), ajenos al cambio; no se tocaron esas hojas.
- Cobertura contra `apply-progress`: cada slice declara sus `tests_agregados`; la única
  excepción (animaciones CSS no medibles en Karma) está documentada en `chrome`.

## Criterios de aceptación
| CA | Resultado | Evidencia |
|---|---|---|
| CA-1 hover/foco visible | pasa | `.mobile-label` con subrayado y tinte 14 % fuera del bloque de movimiento; `translateX(12px)` y transiciones solo en `no-preference` (`site-header.component.scss`); test de `.mobile-label` |
| CA-2 spy en `/` | pasa | specs "home scroll-spy" (resalta Servicios en escritorio y móvil; `aria-current="page"` queda en Inicio) |
| CA-3 ruta fuera de la home | pasa | specs "active page" existentes + "fall back to the route" |
| CA-4 cálculo de sección | pasa | `activeSectionIndex` (4 casos) + servicio (crece/se recorta) |
| CA-5 rastro | pasa | specs "scroll trail" (1→3 pasos, `aria-current="location"`, anclas `/#inicio`, `/#servicios`, oculto arriba, sin spy y con menú abierto, posición absoluta sin alterar el alto del header) |
| CA-6 spy apagado al salir | pasa | spec de home (destroy → `activeHref` null) + `stop()` quita listeners y cancela el frame |
| CA-7 offset de anclas | pasa | `scroll-offset.spec.ts` (alto del header + rastro + gap) |
| CA-8 orden del equipo | pasa | `content.spec.ts`, banda de home y `figcaption` de `/nosotros` |
| CA-9 suite y build | pasa | arriba |

## Ejes del protocolo
- **Documentación declarada:** `tasks.md` prevé CHANGELOG y `docs/architecture.md` (servicio
  raíz home → header); guidelines no. OK.
- **Guidelines:** `DEVELOPMENT_GUIDELINES.md` no tiene sección Angular; se siguen las
  convenciones de `sdd-init.md` (tokens sin fallback, movimiento en `no-preference`, hojas
  nuevas aparte, ningún `backdrop-filter` en ancestros de `.mobile-menu`, sin `@apply` en la
  hoja nueva). OK.
- **Logs:** sin logs agregados (UI pura); `logs_conforme: sí` en todos los slices. OK.

## Desvíos y observaciones
- Sin desvíos contra spec/design.
- No verificado en navegador real (solo Karma headless): sensación del hover, línea de
  lectura del spy (35 % del viewport) y la animación del rastro conviene revisarlas a ojo.
- Orden del equipo: el usuario confirma que coincide con la posición de izquierda a derecha
  en las fotos; el test de la banda lo afirma ("left to right as in the photo").
- Riesgo de revisión: ~650 líneas de frontend (625 agregadas, 27 quitadas, 16 archivos) entre código y tests, sobre el umbral de 300.
