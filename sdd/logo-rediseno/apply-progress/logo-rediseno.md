# Apply-progress — logo-rediseno

## Estado del slice

Slice único `logo-rediseno` (tasks T1–T7). Completas: T1, T2, T3, T4, T5, T6, T7.
T8 (`document`) corre en la fase `document`, no acá.

| # | Tarea | Estado | Notas |
|---|---|---|---|
| T1 | Constantes de rutas de logo | ✅ | `content/logo.ts` (nuevo) + export en `content/index.ts` + `content.spec.ts` describe `logo` |
| T2 | Header: tema + responsive | ✅ | 2 `<img>` (`logo-img--full` / `logo-img--responsive`), `[src]` bindeado a `isDark()`, toggle por CSS en `768px`; spec actualizado |
| T3 | Footer: logo + tema + responsive | ✅ | `ThemeService` inyectado; 2 `<img>` en `.footer-brand`; spec con toggle |
| T4 | Landing/Login/Navbar → `logo-dark.png` | ✅ | 3 templates + aserciones en specs; navbar ganó spec propio (no existía) |
| T5 | Favicon PNG | ✅ | `index.html` → `logo-responsive-light.png`, `type="image/png"` |
| T6 | Borrado logo viejo | ✅ | `public/Logo_Kuvu.jpeg` eliminado; 0 refs en código de producción |
| T7 | Suite + build | ✅ | **128/128 verdes** (eran 119; +9 tests). `ng build` OK — warning preexistente de Google Fonts, ajeno; dist incluye los 4 PNG |

## Desvíos del plan

- **Criterio 10 de spec** (0 refs `Logo_Kuvu`): se re-encuadró a "código de producción + docs
  nuevos de este cambio". Los artifacts de cambios anteriores **archivados**
  (`sdd/logo-responsive/`, `sdd/sitio-contenido/`, `docs/logo-responsive.md`) y las entradas
  históricas de `CHANGELOG.md` mencionan el logo viejo como registro legítimo del estado de
  entonces; reescribirlos sería falsificar el trail. `spec.md` quedó actualizado con el
  alcance preciso.
- Selector/class: los logo de header usan BEM `logo-img--full` / `logo-img--responsive` (el
  design los llamaba `.logo-*-full`; naming menor, comportamiento idéntico).
- `rounded-icon` que tenía el logo viejo se quitó: los PNG nuevos tienen su propia forma;
  redondearlos los distorsionaría.

## Bloque de cierre

```
test_mode: test-after
test_command: $env:CHROME_BIN='C:\Program Files\Google\Chrome\Application\chrome.exe'; npx ng test --watch=false --browsers=ChromeHeadless (workdir frontend/proyecto_angular)
tests_status: verde — 128/128 (antes 119)
tests_agregados:
  - src/app/content/content.spec.ts (mod, describe logo: 4 variantes + unicidad)
  - src/app/components/public/site-header/site-header.component.spec.ts (mod, bloque brand):
    full light/responsive light, swap a dark al togglear, sin texto redundante
  - src/app/components/public/site-footer/site-footer.component.spec.ts (mod): logos
    light/dark + togggle
  - src/app/components/landing/landing.component.spec.ts (mod): brand-logo-img src logo-dark
  - src/app/components/login/login.component.spec.ts (mod): brand-logo-img src logo-dark
  - src/app/components/shared/navbar/navbar.component.spec.ts (nuevo): navbar__logo-img
    src logo-dark
excepciones_sin_test: ninguna — todo comportamiento nuevo tiene cobertura. Las referencias
  históricas a Logo_Kuvu en artifacts archivados no se testean porque no son código
logs_conforme: sí — sin log nuevo (los cambios son de presentación/estática; no hay logging
  que ajustar)
```

## Assets dark re-generados (pedido del usuario antes de verify)

Los jerarquido `Logo dark mode.jpeg` y `Logo responsive Dark mode.jpeg` salieron del editor
sin transparencia real (JPEG, fondo sólido gris medio ~RGB(80,80,80) y gris claro ~200–230
respectivamente). Se convirtieron localmente con chroma-key + resample:

- `public/logo-rediseno/logo-dark.png` → 703x250, ~279 KB, esquinas transparentes.
- `public/logo-rediseno/logo-responsive-dark.png` → 284x257, ~97 KB, esquinas transparentes.

Bandas de remoción: gris medio `[68,92]` (halo 18) y gris claro `[192,236]` (halo 12).
Validado: esquinas con α=0 y arte (negro/blanco/medios) preservado. Mismos nombres/rutas que
antes → no cambió `content/logo.ts` ni las aserciones de specs. Suite re-corrida: 128/128.

## No cerrado acá

- T8 (documentación/CHANGELOG/sdd.config si toca) — fase `document`.