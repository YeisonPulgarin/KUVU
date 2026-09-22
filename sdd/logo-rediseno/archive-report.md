# Archive-report — logo-rediseno

## Resumen de cierre

Cambio completado: el sitio reemplazó la imagen única de logo por un sistema de **4 variantes**
(completo/símbolo × tema claro/oscuro) con swap por tema vía `isDark()` y por viewport en el
breakpoint `768px`. Alcance: header y footer públicos (variantes según tema + símbolo en móvil),
landing (`/acceder`), login y navbar (variante `logo-dark.png` fija sobre fondos oscuros),
favicon PNG (`logo-responsive-light.png`), y borrado de `public/Logo_Kuvu.jpeg`. Rutas
centralizadas en `content/logo.ts`.

Actualizaciones durante apply: los exports del editor para las variantes dark salieron como
JPEG sin transparencia real (fondos sólidos gris). Se reconvirtieron localmente a PNG con
alpha (chroma-key + resample a 703x250 y 284x257) manteniendo los nombres de archivo, por lo
que no tocó código ni tests.

## Verificación final

- Suite de tests: **128/128 verde** (Karma + ChromeHeadless; eran 119 antes del cambio).
- `ng build` AOT OK — solo warning de presupuesto de Google Fonts, preexistente y ajeno.
- 12/12 criterios de aceptación de `spec` pasan (`verify-report.md`).
- `secure` y `refine` corrieron sin tocar código → no hizo falta re-verificar.

## Deuda técnica residual (de `refine-report`)

- Patrón header/footer de logo (tema + responsive) duplicado: solo 2 usos, se revisa ante una
  tercera ocurrencia (Regla de Tres).
- Breakpoints de SCSS como literales (`768px`, `639px`, `767px`, `1024px`) sin variables:
  preexistente en todo el frontend, no introducido por este cambio.
- `document.write` en `pagos.component.ts` — **work item de seguridad abierto** (de ciclos
  anteriores), pendiente de su propio cambio.

## Deliberadamente sin tocar (`refine-report`)

- Control/áreas de `secure` (no hubo hallazgos). `logo_url` de empresa y sidebar (fuera de spec).

## Acciones fuera del código (de `secure-report`)

- **Secretos a rotar: ninguno.** Dependencias a actualizar: ninguna nueva en este cambio.
  Configuración/infra a endurecer: ninguna que mapee a una amenaza real de este alcance.

## Riesgo residual aceptado (de `secure-report`)

- Ninguno material para este cambio. El cambio es 100% presentación (assets estáticos PNG con
  `src` fijos); sin input, auth ni endpoints nuevos.

## Documentación (de `document-report`)

- `docs/logo-rediseno.md` — creado (cómo funciona el sistema de variantes, decisiones,
  limitaciones).
- `docs/architecture.md` — actualizado: sección "Clúster público" (assets del logo + chrome) y
  "Decisiones estructurales" (logo multi-variante con swap CSS+TS).
- `CHANGELOG.md` — entrada bajo `[Unreleased]`: `Added` (4 variantes + favicon PNG) y `Changed`
  (sistema de variantes que reemplaza la imagen única).
- `openapi`: no aplica (sin endpoints HTTP). `collections`: no aplica (idem). `readme`: no
  aplica (el README del frontend no documenta `public/` ni el logo).
- Extensión `git` inactiva: **sin commit ni PR**; los cambios quedan en el working tree.

## Artifacts del cambio

Completos y consistentes en `sdd/logo-rediseno/`: `explore`, `propose`, `spec`, `design`,
`tasks`, `apply-progress/logo-rediseno`, `verify-report`, `secure-report`, `refine-report`,
`document-report`, `continuation` (este cierre). Backend de artifacts: archivos en el repo
(no hay MCP de memoria configurado) — sin push de memoria.

## Pendientes abiertos tras el merge

- Work item de seguridad: audit/refactor de `document.write` en `pagos.component.ts`.
- El usuario debe validar visualmente el logo dark sobre su página (el agente no renderiza
  imágenes); los PNG son transparentes y coinciden en nombre/ruta con lo esperado.