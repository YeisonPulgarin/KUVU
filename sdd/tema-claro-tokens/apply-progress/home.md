# Apply progress — tema-claro-tokens / home

Rama: `fix/tema-claro-tokens`. Se apoya en el slice `chrome` (T-1, `@theme static`).

```
test_mode: test-after
test_command: $env:CHROME_BIN='C:\Program Files\Google\Chrome\Application\chrome.exe'; npx ng test --watch=false --browsers=ChromeHeadless (desde frontend/proyecto_angular)
tests_status: verde (467/467 en 3 corridas seguidas)
tests_agregados: frontend/proyecto_angular/src/app/components/home/home.component.spec.ts (modificado), team-band/team-band.component.spec.ts (comentario y título), steps-journey/steps-journey.component.spec.ts (comentario)
excepciones_sin_test: T-6 — quitar fallbacks idénticos al token no cambia el estilo calculado; se verifica por diff de píxeles. Test de presencia de tokens: no-objetivo aceptado (design D-4).
logs_conforme: sí (sin logs)
```

## Tareas

| Tarea | Estado | Detalle |
|---|---|---|
| T-6 | Completa | Fallbacks quitados en `companies-marquee` (4), `team-band` (2), `steps-journey` (2), `home.component.scss` (2) y `hero` (1). Comentarios de fallback quitados en `companies-marquee`, `steps-journey`, `home.component.scss` (`.cta-final`) y `team-band` (cabecera) |
| T-7 | Completa | Karma en verde y CA-04 cumplido: 0 coincidencias de `var(--color-home-*|--color-brand-*|--radius-*, …)` en `frontend/proyecto_angular/src` |

## Desvío — test que fijaba el contrato anterior

`home.component.spec.ts` → `cta final legible` tenía el test *"should keep the green background
when the brand token is not defined"*. Ese test anulaba `--color-brand-700` (`initial`) y exigía
que el fondo siguiera verde, es decir, comprobaba que existía el fallback literal. Ese contrato es
justamente el que la spec elimina (RF-03: sin fallbacks), así que el test falló de forma
determinista (2 de 2 corridas: `Expected 'rgba(0, 0, 0, 0)' to be 'rgb(47, 74, 47)'`).

No es una regresión del comportamiento observable: en el sitio, el token existe en `:root` en los
dos temas (CA-01 a CA-03). El test pasa a verificar el contrato vigente:

- *"should take the green background from the global brand token"*: el fondo resuelve a
  `rgb(47, 74, 47)` sin anular nada, porque Karma carga `styles.css`, igual que el build.
- *"should keep the heading and lead white over the band"*: deja de anular el token, pero la
  aserción no cambia.
- Se quita la constante `BRAND_TOKEN`, que armaba el nombre por partes para ocultarlo del escaneo
  de Tailwind y ya no se usa.

Además, se reescriben en presente dos comentarios de spec que describían el defecto como vigente
(`steps-journey` y `team-band`). En `team-band` cambia también el título del test, a *"should
resolve the brand green from the global --color-brand-700 token"*; las aserciones no cambian.

Con este fallo identificado, el 1/467 intermitente de la primera corrida del slice `paginas` no
encaja: en ese momento los fallbacks de la home seguían en su lugar y el resultado de este test
no dependía de nada externo. El spec de aquella corrida sigue sin identificarse. En las 7 corridas
completas posteriores (3 de `paginas`, 1 de esta validación previa y 3 finales) no reapareció.

## Evidencia

- **`ng build`:** total inicial de 438,52 kB. El primer build falló por el presupuesto
  `css-inline-fonts`: la hoja de Google Fonts midió 20,63 kB, contra un tope de 20 kB. El
  siguiente build pasó con 19,14 kB (warning). Es el pendiente P-4: depende del tamaño que
  devuelve Google Fonts y no del cambio, así que queda para `verify`.
- **Diff de píxeles contra `shots-paginas`:** 32 de 36 escenarios iguales con 0 px de diferencia,
  incluida la home en los 4 escenarios. Las otras 4 son `/nosotros` (filas 1321-2056 a 1280 y
  1418-1645 a 375, en los dos temas), y la diferencia es la foto del equipo: con carga diferida,
  en una corrida llega a pintarse y en la otra no. Lo confirmé mirando las dos capturas. Es ruido
  de la herramienta: este slice no toca `/nosotros`. En `verify`, `qa.mjs` tiene que forzar la
  carga de las imágenes antes de capturar.
- **Contra `shots-base`**, resultado acumulado de los tres slices:
  - contacto, legal, servicios y 404 solo cambian en el header (196 px, redondeo de botones);
  - `/acceder` y `/login` quedan idénticos;
  - la home oscura cambia ~1.950 px, que es el redondeo de tarjetas e íconos (RF-06);
  - la home clara cambia un 52-54 % y FAQ y nosotros en claro también cambian (RF-04).
