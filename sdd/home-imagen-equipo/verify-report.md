# Verify report — home-imagen-equipo

- **Estado verificado:** slices `imagen-base` + `imagen-ui` completos, incluida la iteración 2 de `imagen-ui` (corrección de D-1 y D-2). Working tree sin commits.
- **Corrida:** re-verificación después de corregir los desvíos de la verificación inicial. No hubo `secure` ni `refine`.
- **Veredicto: PASA.** Todos los criterios de aceptación se cumplen. Quedan pendientes de revisión manual, que no bloquean.

## Historial de corridas

| Corrida | Resultado | Motivo |
|---|---|---|
| 1 | NO PASA | D-1: `--color-brand-700` no existe en runtime (Tailwind v4 no lo emite al CSS global), así que la banda queda sin velo ni fondo. Contraste p5 de 1.7 en desktop y ≈ 1.1 en mobile. D-2: el recorte cortaba el logo YCW |
| 2 | **PASA** | Corrección local en `team-band.component.scss` (fallback `#2f4a2f`, velo más denso, encuadre `center 10%`) + spec de regresión |

## Tests y build

| Chequeo | Comando | Resultado |
|---|---|---|
| Suite | `npx ng test --watch=false --browsers=ChromeHeadless` (CHROME_BIN fijado) | **157 / 157 SUCCESS** |
| Build | `npx ng build` | OK. Único warning: `css-inline-fonts` (19.14 kB > 17 kB), que ya existía antes de este cambio |

Cobertura frente a `apply-progress`: todo el código de producción tiene tests. El script
Python es una excepción documentada (se verifica por su salida). `TeamBandComponent` tiene un
spec propio, `team-band.component.spec.ts` (4 tests, incluida la regresión del fallback de
color).

Alcance de la corrección: el tema global no cambió. `git diff` sobre `src/styles.css`,
`src/styles.scss`, `home.component.scss`, `site-header/` y `angular.json` sale vacío. Los CTA
del hero, del header y de `cta-final` siguen como estaban, según la decisión del usuario.

## Criterios de aceptación

| # | Resultado | Evidencia |
|---|---|---|
| CA-1 | pasa | `equipo-ycw-{640,1024,1536}.{webp,jpeg}`, aspecto 1.499 a 1.5, ≤ 1536 px |
| CA-2 | pasa | `grep "Equipo YCW\|Equipo%20YCW" src/` → sin resultados |
| CA-3 | pasa | `home.component.spec.ts` → 'team band' |
| CA-4 | pasa | orden `como-funciona, beneficios, seguridad, equipo, origen, faq`; `equipo` justo después de `companias` |
| CA-5 | pasa | `nosotros.component.spec.ts` → 'team photo'; captura de escritorio con la foto completa |
| CA-6 | pasa | `content.spec.ts` → 'team' |
| CA-7 | pasa | `responsive-image.component.spec.ts` (10 tests) |
| CA-8 | **pasa** | medición píxel a píxel (tabla de abajo): mínimo absoluto 6.12:1, contra 4.5:1 requerido |
| CA-9 | pasa | `src/styles.scss` desactiva el reveal con `prefers-reduced-motion: reduce`; la directiva marca visible de inmediato |
| CA-10 | pasa | 157/157 |
| CA-11 | pasa | sin warnings nuevos |

Requisitos RF-1 a RF-7: se cumplen.

## Contraste medido (CA-8)

Método: capturas del build de producción en Chrome headless con la banda aislada y el reveal
forzado a visible. Para cada elemento se compara una captura con solo ese elemento contra una
sin texto. En cada píxel de texto se calcula el contraste WCAG entre el color efectivo del texto
(blanco con la opacidad del elemento: bajada 90 %, caption 85 %) y el fondo real (foto + velo).
Cada captura se repite hasta confirmar que la foto cargó. Para los anchos de 360 y 390 px se usa
un iframe, porque Chrome headless no baja de unos 500 px de ventana.

| Viewport | Título (p5 / mín) | Bajada | Caption | Link |
|---|---|---|---|---|
| 1440×900 | 7.53 / 7.19 | 6.80 / 6.52 | 6.83 / 6.65 | 10.18 / 9.13 |
| 1024×768 | 7.90 / 6.95 | 6.69 / 6.50 | 6.55 / **6.12** | 9.83 / 9.42 |
| 768×1024 | 7.79 / 7.53 | 7.10 / 6.79 | 6.93 / 6.75 | 10.66 / 10.00 |
| 390 (iframe) | 9.81 | 8.31 | 7.62 | 9.81 |
| 360 (iframe) | 9.81 | 8.31 | 7.62 | 9.81 |

- Tema claro y oscuro dan valores idénticos: la banda no depende del tema, por diseño. Confirmé que el tema oscuro se aplicó mirando el fondo de la página debajo de la banda (`#141a14` frente a `#f0f4f8`).
- En mobile (< 768px) el texto va sobre el verde sólido `#2f4a2f`, así que el contraste es uniforme.

## Responsive (capturas)

- **1440×900 y 1920×1080**: el logo "YCW SYSTEMS" entra completo, las tres caras son visibles y el bloque de texto queda abajo a la izquierda sobre el velo.
- **1024 y 768 px**: la banda sigue con la foto de fondo y el texto legible.
- **390 y 360 px**: banda apilada; foto 3:2 completa con los tres integrantes, texto sobre fondo verde y caption en dos líneas sin desbordes.
- **`/nosotros` a 1440 px**: foto completa, bordes redondeados, caption legible (≈ 7:1).

Observación estética, sin impacto en los criterios: para garantizar ≥ 4.5:1 en todo el bloque, el velo denso llega al 60 % de la altura y tiñe de verde la parte baja de las caras en escritorio. Si se prefiere más foto, la alternativa es achicar el bloque de texto (por ejemplo, sacar el caption de la banda), no aclarar el velo.

## Desvíos

- **D-1** (corrida 1): resuelto. Fallback local `--team-band-green: var(--color-brand-700, #2f4a2f)`, cubierto por el test de regresión.
- **D-2** (corrida 1): resuelto, con un desvío numérico respecto de lo pedido. El encuadre quedó en `center 10%` en lugar de 20-25 %, porque con 22 % el logo seguía cortado a 1440 px (lo registra `apply-progress/imagen-ui.md`, iteración 2).
- **D-3** (corrida 1): corrección de artifact aplicada en `apply-progress/imagen-ui.md`.
- **Fuera de alcance, ya existía:** `--color-brand-700`, `200` y `300` no se emiten globalmente, y eso afecta a `.hero-cta`, `.cta-final` y al CTA del header, que hoy se ven por el gradiente azul de `.btn-primary`. Por decisión del usuario no se toca en este cambio. Candidato a un work item propio.
- Desvíos de diseño ya aceptados en la corrida 1 (banda en componente propio, template inline, `--responsive-image-position`, `aria-labelledby`): conformes.

## Ejes del protocolo

| Eje | Resultado |
|---|---|
| Documentación declarada | **Conforme.** `tasks.md`: CHANGELOG sí, README sí, `docs/architecture.md` sí, `DEVELOPMENT_GUIDELINES.md` no, OpenAPI no, más `docs/home-imagen-equipo.md`. `document` debería registrar también la nota del fallback de color en architecture, porque es una decisión estructural sobre los tokens de Tailwind v4 |
| Guidelines | **Conforme.** No hay sección de Angular en `DEVELOPMENT_GUIDELINES.md`. El código sigue las convenciones del clúster público de `docs/architecture.md` |
| Logs | **Conforme.** No se agregan logs; `logs_conforme: sí` en ambos `apply-progress` |

## Pendiente de revisión manual (no bloquea)

1. Dispositivos reales (iOS Safari y Android Chrome) a 360-414 px: el iframe emula el viewport, pero no el renderizado móvil real.
2. Estados `:hover` / `:focus-visible` del link pill sobre el velo (contorno global `--color-brand-500`).
3. Carga diferida real al hacer scroll con red lenta, y ausencia de saltos de layout.
4. Animación de reveal de la banda y de la figura en un navegador real.
5. Valoración estética del tinte del velo sobre las caras en escritorio (ver observación).
