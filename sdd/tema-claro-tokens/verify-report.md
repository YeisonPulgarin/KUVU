# Verify report — tema-claro-tokens

**Veredicto: PASA.** Los 4 slices están completos (`chrome`, `paginas`, `home`, `cierre`) y no se
omitió ninguno. CA-01 a CA-09 pasan; CA-10 corresponde a la fase `document`. No hay desvíos
bloqueantes.

Estado verificado: rama `fix/tema-claro-tokens`, `5d3cc57` (base `e16d732`).

| Chequeo | Resultado |
|---|---|
| Karma (ChromeHeadless) | **467/467 en verde** |
| `ng build` | OK en el primer intento. Total inicial de 438,52 kB (base: 438,51 kB). Único warning: `css-inline-fonts` (P-4) |
| Diff del cambio | 19 archivos de `frontend`, +99/−110 líneas; con artifacts SDD, 29 archivos, +839/−110 |
| Dependencias, backend, contenido | Sin cambios |
| CI | No aplica (la extensión `git` está inactiva) |

## Cobertura declarada en `apply-progress`

| Slice | tests_status | Excepciones | ¿Producción sin cobertura ni excepción? |
|---|---|---|---|
| `chrome` | verde | Cambio de estilos; se verifica por CDP | No |
| `paginas` | verde | Fallbacks idénticos; diff de píxeles en 0 | No |
| `home` | verde | Ídem; spec de `.cta-final` ajustado al contrato nuevo | No |
| `cierre` | n/a | Solo configuración SDD | No |

## Criterios de aceptación

| CA | Resultado | Evidencia |
|---|---|---|
| CA-01 | Pasa | `styles-*.css`: los 15 tokens están en `:root, :host` con los valores de RF-01 |
| CA-02 | Pasa | CDP en las 7 rutas públicas × 2 viewports en tema claro: los 15 tokens coinciden con lo esperado, 0 errores |
| CA-03 | Pasa | Mismo chequeo en tema oscuro: 9 tokens con valores de `.dark`; `brand-200/300/700` y radios con el valor claro, 0 errores |
| CA-04 | Pasa | 0 `var(--color-home-*\|--color-brand-*\|--radius-*, …)` en `frontend/proyecto_angular/src` |
| CA-05 | Pasa | Home en claro, a 1280 y 375: tarjeta de paso con fondo `#fff`, borde 1 px `#cddccd` y radio de 16 px; número de paso con fondo `#3e5c40`, texto blanco y radio de 12 px; ícono de servicio con fondo `#e8efe8` y radio de 12 px. Nosotros y FAQ en claro muestran fondos, bordes y textos de token (capturas) |
| CA-06 | Pasa | Diff de píxeles contra la base recapturada (36 escenarios). Contacto, legal, servicios y 404: idénticas salvo 196 px del header en claro a 1280 (redondeo de los botones de WhatsApp y de tema, RF-04). Home, FAQ y nosotros en claro: cambios de RF-04. En oscuro: home con ~1.950 px (radios de tarjetas e íconos, RF-06) y el resto idéntico |
| CA-07 | Pasa | `/acceder` y `/login`: idénticas, salvo 17 px en `login-1280-dark`. Ese mismo ruido aparece entre dos corridas del mismo build (zona del formulario), así que no es un cambio |
| CA-08 | Pasa | 467/467, incluidas las aserciones de color resuelto de `steps-journey` |
| CA-09 | Pasa | Sin warnings nuevos. CSS global: 28.775 → 29.100 B (+325 B, < 1 kB) |
| CA-10 | Pendiente de `document` | Alcance declarado en `tasks` |

## Ejes del protocolo

- **Documentación declarada:** `tasks` anticipa `changelog_afectado` y `architecture_afectado`.
  En `architecture.md` hay que reemplazar las dos decisiones que describen el defecto.
  `guidelines_afectado` es false: la convención quedó en `sdd-init.md`. Conforme.
- **Guidelines:** `DEVELOPMENT_GUIDELINES.md` no tiene sección de Angular. El cambio sigue las
  convenciones de `sdd-init.md`: sin `@apply` nuevos y estilos en el SCSS de cada componente.
  Conforme.
- **Logs:** el cambio no agrega logs (`logs_conforme: sí` en los 4 slices). Conforme.

## Hallazgos (no bloqueantes)

- **V-1 — Spec ajustado en `home`.** El test de `.cta-final` que anulaba `--color-brand-700` y
  exigía el fallback comprobaba el contrato que RF-03 elimina. Ahora verifica que el verde sale
  del token global. Desvío justificado en `apply-progress/home`.
- **V-2 — Redondeo en oscuro menor que el previsto en RF-06.** En tema oscuro, los botones de
  header, footer y nosotros con `rounded-pill`/`rounded-icon` no muestran diferencia de píxeles
  contra la base. El radio se aplica (el token resuelve a `9999px`/`12px`), pero el contorno no
  contrasta con el fondo. RF-06 lo permite ("salvo"), no lo exige.
- **V-3 — Fallo intermitente de Karma sin identificar.** Ocurrió una vez, 1/467, en la primera
  corrida del slice `paginas`. No reapareció en 9 corridas completas posteriores.
- **V-4 — `css-inline-fonts` (P-4) puede pasar a error.** Ya pasó una vez durante `home` (20,63 kB
  contra un tope de 20 kB) y el reintento pasó. Depende de Google Fonts, no de este cambio. Es un
  riesgo para el build de quien mergee.

## QA visual

Herramientas (scratchpad de la sesión, fuera del repo):

- `qa.mjs`: servidor estático con fallback SPA, Chrome headless por CDP, `prefers-reduced-motion:
  reduce`, tema por `localStorage['kuvu-theme']` y carga forzada de imágenes diferidas.
- `diff.mjs`: diff de píxeles con tolerancia de 24 en la suma RGB.

Base recapturada con el script vigente desde el build de `e16d732` (`shots-base2`). El cambio está
en `shots-r1`.
