# Archive report — tema-claro-tokens

**Estado: cerrado.** Ciclo completo: init → explore → clarify → propose → spec → design → tasks
→ apply (`chrome`, `paginas`, `home`, `cierre`) → verify → secure → refine → document → archive.

**Secretos a rotar: ninguno.**

## Qué se hizo

Resuelve el pendiente P-2 de `home-animaciones` (hallazgo F-1 de su `verify-report`).

- Los 15 tokens de marca (`--color-brand-*`, `--color-home-*`, `--radius-*`) se declaran en el
  bloque `@theme static` de `frontend/proyecto_angular/src/styles.css`, así que existen siempre
  en `:root`, en tema claro y en tema oscuro.
- Se quitan los 89 fallbacks literales de 15 SCSS. Los valores viven solo en `styles.css`.
- Resultado visible en tema claro: home, nosotros, preguntas frecuentes y header muestran
  fondos, bordes y textos de token, tarjetas de "¿Cómo funciona?" con borde y radio, números de
  paso legibles e íconos de servicios con fondo. En los dos temas aparecen los radios.

## Decisiones (Gate A y posteriores, del usuario)

| Decisión | Valor |
|---|---|
| Mecanismo | `@theme static` (una sola fuente) |
| Fallbacks literales | Se quitan todos |
| Valores de los tokens | Sin cambios |
| Tema oscuro | Dentro del alcance; `brand-200/300/700` y radios reutilizan el valor claro (sin overrides en `.dark`) |
| Test de guardia de los 15 tokens | No se agrega (no-objetivo) |
| Base de capturas | `feat/home-animaciones` sin el cambio |
| Fases opcionales | `secure` y `refine`: ambas corrieron, sin cambios de código |

## Verificación

`verify-report`: **pasa**. Karma 467/467 y `ng build` OK (total inicial de 438,52 kB; CSS global
+325 B). CA-01 a CA-10 se cumplen, con CA-10 cubierto por `document`. Diff de píxeles contra la
base en 36 escenarios: solo cambia lo previsto en RF-04 y RF-06. `secure` y `refine` no
cambiaron código, así que no hizo falta re-verificar.

## Documentación

| Destino | Resultado |
|---|---|
| `docs/tema-claro-tokens.md` | Creado |
| `docs/architecture.md` | Actualizado: las dos decisiones sobre tokens no emitidos y fallback se reemplazan por "Tokens de marca en `@theme static`" |
| `docs/breadcrumb-y-cta-legible.md`, `docs/home-imagen-equipo.md` | Corregidos para describir el sistema actual (sin fallback) |
| `CHANGELOG.md` | Unreleased → Fixed |
| OpenAPI / Bruno | No aplica: no toca endpoints HTTP y el proyecto no expone API pública |
| `README.md` | No aplica: no cambian instalación, comandos, variables ni stack |
| `DEVELOPMENT_GUIDELINES.md` | Sin cambios: no tiene sección de Angular. La convención de tokens está en `sdd/sdd-init.md` |

## Seguridad (secure)

Sin hallazgos. No hay secretos a rotar ni dependencias nuevas. Se mantiene el riesgo residual H-1
de `home-animaciones` (advisories de `@angular/router` solo alcanzables con SSR), **aceptado por
el usuario (Wilson Solano) el 2026-11-08**.

## Pendiente (trabajo consciente no hecho)

| # | Pendiente | Origen | Sugerencia |
|---|---|---|---|
| P-1 | Actualizar `@angular/*` a ≥ 21.2.25 | `home-animaciones` secure H-1 | Cambio propio de dependencias; prioridad alta si se adopta SSR |
| P-3 | Ajuste fino de la altura del recorrido (250vh) y del ritmo del párrafo 01 (`--scrub-rate: 1.6`) | `home-animaciones` verify | Solo si la experiencia lo pide; es CSS |
| P-4 | El presupuesto `css-inline-fonts` depende del tamaño de la hoja de Google Fonts y a veces pasa a error (tope de 20 kB). Pasó una vez durante este cambio (20,63 kB) | `home-animaciones` apply / este `verify-report` V-4 | Autoalojar Geist o subir el presupuesto con criterio. Riesgo para el build del merge |
| P-5 | `sdd/sdd-init.md` dice `expone_api_http: true` y `sdd.config.md` dice que no hay API pública | `home-animaciones` cierre | Corregir la config |
| V-3 | Fallo intermitente de Karma (1/467) una vez, sin identificar el spec; no reapareció en 9 corridas completas | este `verify-report` | Si reaparece, guardar la salida completa de Karma para identificarlo |

P-2 de `home-animaciones` queda marcado como resuelto en su `archive-report`.

### Deliberadamente sin tocar (refine)

- Alias `--team-band-green`: nombra el color de la banda en un solo lugar (4 usos y spec).
- Alias `--header-surface` / `--header-border`: anteriores a este cambio, fuera de alcance.
- Unificar `.dark` en el sistema de `@theme`: re-arquitectura sin problema presente (YAGNI).

### Observaciones de verify (no bloqueantes)

- V-1: el spec de `.cta-final` verifica el token global en lugar del fallback.
- V-2: en tema oscuro, el redondeo de los botones `rounded-*` de header, footer y nosotros apenas
  se nota (el contorno casi no contrasta).

## Rama y commits

Rama `fix/tema-claro-tokens`, apilada sobre `feat/home-animaciones` (PR #4). Es **local, sin
push**; el usuario hace el push y abre el PR #5.

| Commit | Contenido |
|---|---|
| `5894259` | chore(sdd): planificación |
| `8323b5d` | fix(chrome): `@theme static` y fallbacks de piezas compartidas |
| `5a0b9b5` | fix(paginas): fallbacks de páginas |
| `c10e9b4` | fix(home): fallbacks de la home y spec de `.cta-final` |
| `5d3cc57` | chore(sdd): convención en `sdd-init.md` |
| `b4312db` | chore(sdd): verify-report |
| `0b8cd33` | chore(sdd): secure-report |
| `f0622f4` | chore(sdd): refine-report |
| `d164744` | docs(tema-claro-tokens): documentación |
| el commit que contiene este archivo | chore(sdd): archive |

## Siguiente paso manual

1. `git push -u origin fix/tema-claro-tokens`.
2. Abrir el PR #5 con base `feat/home-animaciones`. Título sugerido:
   `fix(tema): emite los tokens de marca en :root y quita los fallbacks literales`.
3. Al mergear la pila (#1 → #2 → #3 → #4 → #5), cambiar la base de cada PR a la rama destino
   (o rebasear) para que su diff no arrastre commits ya mergeados.
