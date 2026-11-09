# Tasks — acceso-volver-inicio

## Slices involucrados

- `intro` — `LandingComponent` (`/acceder`) y sus tests Karma.
- `cierre` — `sdd/sdd-init.md` si queda una convención reutilizable (enlaces "volver" del flujo
  de acceso).

Orden default de la tabla (`intro` → `cierre`); el resto de slices no aplica.

## Tareas

### Slice `intro`

1. **T-1** `landing.component.ts`: agregar `RouterLink` a `imports`. (D-1)
2. **T-2** `landing.component.html`: enlace `<a routerLink="/" class="back-home">` con chevron
   `aria-hidden` y texto "Volver al inicio", primer hijo de `.landing-container`. (RF-1, RF-3,
   D-2)
3. **T-3** `landing.component.html`: envolver el logo en
   `<a routerLink="/" class="brand-link" aria-label="KUVU, volver al inicio">`, `alt=""` en el
   `<img>`. (RF-2, D-5)
4. **T-4** `landing.component.scss`: `.back-home` y `.brand-link` (estilo, área de toque,
   `:focus-visible`, `prefers-reduced-motion: reduce`). (RF-4, RF-6, RF-7, D-3, D-4, D-6)
5. **T-5** `landing.component.spec.ts`: tests CA-1 a CA-5 (depende de T-1..T-3).
6. **T-6** Correr Karma y `ng build`.

### Slice `cierre`

7. **T-7** `sdd/sdd-init.md`: convención breve de "volver" en el flujo de acceso (enlace
   `routerLink` dentro de `.landing-container` para heredar `inert`).

## Forecast de riesgo

- Archivos: 4 de código/tests + 1 de config SDD.
- Líneas estimadas: ~120 (≈15 html/ts, ≈50 scss, ≈50 tests, ≈5 config).
- Repos: 1. Umbral: 300 líneas → **riesgo bajo**. Estrategia `ask-on-risk`: no aplica.

## Alcance previsto de `document`

- `openapi_afectado`: no (sin endpoints).
- `changelog_afectado`: sí (visible para el usuario, entrada en `Added`).
- `readme_afectado`: no (no existe `README.md` en la raíz; no se crea por este cambio).
- `architecture_afectado`: sí, mínimo — la línea de `components/landing/` en
  `docs/architecture.md` menciona la salida a `/`.
- `guidelines_afectado`: no.
- Documento del cambio: `docs/acceso-volver-inicio.md`.
