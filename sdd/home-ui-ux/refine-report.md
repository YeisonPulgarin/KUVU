## Refinamiento — home-ui-ux

### Red de seguridad

- **Tests preexistentes:** 60 en verde antes de tocar nada (`home.component.spec.ts` + resto
  de la suite), cubren tema, copy audit, estructura, reveals y los guards de storage.
- **Baseline capturado:** `home.component.scss` compilado ≈ 16.07 kB; `ng build` ≈ 8.2 s;
  `ng test` 60/60. Tras el refactor: 16.0 kB, 8.7 s, 60/60 (métricas neutrales, sin regresión).

### Cambios aplicados

#### 1. Eliminación de variables SCSS muertas

- **Tipo:** Refactor (comportamiento idéntico).
- **Qué:** se borraron `$brand-700/600/500/300/200` en `home.component.scss`. Estaban
  declaradas pero **ninguna regla las usaba**: todo el archivo referencia `var(--color-brand-*)`
  directamente. También se borró el comentario que las presentaba como "referencias para
  legibilidad", que era engañoso.
- **Principio / lente:** borrar código donde borrar resuelve el problema (C — contención).
  Evita que un futuro lector crea que hay un indirección activa y que el cambio de token
  pasa por ahí.
- **Beneficio concreto (medido):** −5 líneas de código muerto (y su comentario). Tamaño
  compilado neutral (16.07 → 16.0 kB), sin impacto en runtime.
- **Riesgo y verificación:** riesgo nulo (código no referenciado). Verificado con `ng test`
  (60/60 SUCCESS) y `ng build` (compila) antes y después.

### Deliberadamente NO tocado

- **Mixin `pill-button` para las 4 apariciones de `.btn-primary`** — motivo: **KISS**. Las
  variantes difieren en tamaño (nav `px-6 py-2.5`, drawer `px-5 py-3`, hero/CTA final
  `px-10 py-4`) y color por contexto; un mixin parametrizado cambia CSS explícito por
  indirección con args, con beneficio marginal. La duplicación es más barata que la
  abstracción equivocada.
- **Nav links duplicados** entre `.nav-links` (desktop) y `.mobile-menu` (drawer, 4 anchors
  cada uno) — motivo: **Regla de Tres**. Son 2 repeticiones, no 3; extraer un array en el
  componente tocaría markup bajo test por un beneficio pequeño. Registrado como deuda.
- **`--radius-card` (16px) sin uso** — motivo: es parte de la escala Shape **documentada** en
  `design.md` ("botones pill, cards 16, íconos 12"). Borrarlo contradiría la regla documentada;
  la página no tiene cards porque los servicios son lista dividida.
- **`--color-brand-200` / `--color-brand-300` sin uso en el componente** — motivo: forman parte
  de la escala de marca documentada (tintes de superficie/hairlines); se conservan para el
  sistema, no son código muerto de un archivo.
- **Literal `'kuvu-theme'` duplicado** entre `index.html` (script inline pre-bundle) y
  `home.component.ts` (`THEME_KEY`) — motivo: son dos runtimes distintos; el script corre antes
  del bundle y no puede importar la constante sin templating de build. Duplicación inherente,
  no accidental.
- **Guards `try/catch` de `readStoredTheme()` / `persistTheme()`** (aplicados por `secure`) —
  **intocables**: son un control de robustez deliberado, no se simplifican por elegancia.

### Deuda técnica residual (registrada, no resuelta ahora)

- Nav links duplicados entre desktop y drawer móvil (candidato a `*ngFor` sobre un array
  cuando la lista crezca o cambie una tercera vez).
- Base de botón pill repetida en 4 contextos (revisar si aparece un quinto).
- `--radius-card`, `--color-brand-200`, `--color-brand-300` definidos sin uso actual en la
  home (esperados por la escala documentada).

### Resultado

Refactor aplicado: 1 (borrado de código muerto). Comportamiento observable **sin cambios**.
Ninguna propuesta superó el gate como para justificar cambios mayores: el resto es
deliberadamente conservador.
