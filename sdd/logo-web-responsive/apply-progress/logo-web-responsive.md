# Apply-progress — slice `logo-web-responsive`

- **Modalidad:** `test-after` (declarada en `sdd/sdd.config.md`) — implementación primero,
  tests escritos antes de cerrar el slice.
- **Slice único** (`logo-web-responsive`). No hubo cortes intermedios: el repo no quedó con
  specs en rojo en ningún momento.
- **Slices declarados no involucrados:** `home-expandida`, `paginas`, `cierre`. `contenido` y
  `chrome` están parcialmente involucrados (solo `logo.ts` y el logo de header/footer); no se
  abre un slice propio porque el cambio no agrega secciones ni páginas y partirlo obligaría a
  un estado intermediario inconsistente.

## Tareas

| # | Tarea | Estado | Evidencia |
|---|---|---|---|
| T1 | `logo.ts`: 2 claves (`web`, `responsive`) | ✅ | `logo.ts` con `/logo-rediseno/Logo_Kuvu.png` y `/logo-rediseno/Logo_Responsive.png` |
| T2 | Header sin swap por tema | ✅ | `site-header.component.html:7-16` — `[src]="logo.web"` / `[src]="logo.responsive"` |
| T3 | Footer sin swap por tema + limpieza | ✅ | `site-footer.component.html:7-16`; `site-footer.component.ts` sin `isDark` ni import de `Signal` |
| T4 | Landing, login y navbar → logo web | ✅ | `landing.component.html:16`, `login.component.html:9`, `navbar.component.html:3` |
| T5 | Favicon → `Logo_Responsive.png` | ✅ | `index.html:17` con `type="image/png"` |
| T6 | Test de contenido | ✅ | `content.spec.ts:134-146` — 2 rutas exactas + 2 valores distintos |
| T7 | Tests de header y footer | ✅ | `site-header.component.spec.ts:34-60`, `site-footer.component.spec.ts:30-46` |
| T8 | Tests de landing, login, navbar y home | ✅ | `landing.component.spec.ts:93`, `login.component.spec.ts:63`, `navbar.component.spec.ts:32`, `home.component.spec.ts:260` |
| T9 | Verificación | ✅ | ver `verify-report.md` |

## Desvíos respecto del plan

- Ninguno en el alcance. `site-header.component.ts` no se modificó, tal como anticipaba
  `design.md`: `isDark` sigue en uso por los iconos del toggle de tema.
- Los tests de header y footer no se borraron al desaparecer el swap por tema: se
  reescribieron como aserciones de **invariancia** (`should keep both logos unchanged when
  the theme is dark`). Son la cobertura que ata el criterio "el logo no depende del tema"
  (RF1/RF2, criterio 3 y 4 de `spec.md`).

## Assets

Los dos PNG se usan tal como se entregaron, sin recomprimir ni renombrar:

| Asset | Origen | Dimensiones | Peso |
|---|---|---|---|
| `Logo_Kuvu.png` | adjuntado por la persona | 703×271 | 144 KB |
| `Logo_Responsive.png` | adjuntado por la persona | 284×223 | 56 KB |

Los cuatro PNG de la variante por tema se eliminaron del working tree (`D` en `git status`),
sin replacements.

## Comandos ejecutados

```
$env:CHROME_BIN='C:\Program Files\Google\Chrome\Application\chrome.exe'
npx ng test --watch=false --browsers=ChromeHeadless     # TOTAL: 128 SUCCESS
npx ng build                                            # Application bundle generation complete
```

## Logging

No aplica: el cambio no introduce código ejecutable nuevo con logging (solo rutas de assets en
templates y constantes). La política de `DEVELOPMENT_GUIDELINES.md` ("Logging &
Observability") no tiene superficie en este slice.

## Estado

Slice completo. Listo para `verify`.
