# Archive Report — logo-responsive

## Cambio resumido

KUVU ahora usa el logo real (`Logo_Kuvu.jpeg`) en HomePage, Login, Landing y navbar interno; la app es responsiva para móvil en toda la superficie (público + admin, incluido el sidebar como overlay con cierre al navegar); la app Flutter `kuvu_mobile/` fue eliminada del repo; y las dependencias `@angular/*` se subieron de 21.2.8 a 21.2.23 por 3 vulns XSS conocidas (decisión del usuario en `secure`).

**Resultado:** `verify` verde, 19/19 tests, build OK, `npm audit` 0 vulnerabilidades.

## Decidido durante el cambio

- Logo en **todos** los componentes y responsive de **toda** la app (Gate A).
- Entrega **separada en 3 bloques/PRs por dominio** ante riesgo ALTO (Gate C): 1 Logo, 2 Responsive público, 3 Responsive admin. Sin extensión `branch`; el usuario commitea cada bloque.
- **Texto "KUVU" removido** junto a la imagen del logo (la imagen ya lo dice) — decisión del usuario en revisión del Bloque 1.
- **SCA Angular §21.2.23** aplicado ahora por decisión del usuario (`Actualizar ahora`) — no queda como follow-up.
- `secure`/`refine`: se corrieron ambas; `secure` sin hallazgos en el cambio + fix SCA; `refine` eliminó una animación que violaba el no-objetivo de la spec ("sin animaciones nuevas").

## Deuda técnica residual & deliberadamente no tocado (de `refine`)

- `home.component.scss`: 15.4 kB supera el budget de warning (10 kB). Revisar extracción de rules responsive o subir budget en `angular.json`.
- Warnings `css-inline-fonts` (Google Fonts inline 16–18 kB) — preexistente.
- `.brand-logo-img` duplicado en login/landing y hamburgers navbar/sidebar (2 ocurrencias) — no se abstraen (Regla de Tres).
- `docs/architecture.md`: sigue siendo el template del instalador sin completar (pendiente de un cambio mayor).

## Seguridad — acciones fuera del código (de `secure`)

- **Secretos a rotar:** ninguno.
- **Dependencias:** ✅ actualizadas (`@angular/*` 21.2.23, audit 0 vulns) — completado dentro del ciclo.
- **Configuración/infra a endurecer:** revisar headers de seguridad y CSP en el despliegue nginx (deuda de proyecto, no de este cambio).
- **Riesgo residual aceptado:** ninguno material (el único riesgo aceptado temporalmente — Angular <21.2.20 — se resolvió con el upgrade dentro del ciclo).

## Documentado (de `document`)

- **`docs/logo-responsive.md`** — creado (qué hace, cómo funciona, decisiones, limitaciones).
- **`docs/architecture.md`** — sin cambios (no altera arquitectura).
- **`CHANGELOG.md`** — entrada en `[Unreleased]`: Added (logo), Changed (responsive, touch targets, upgrade Angular), Removed (`kuvu_mobile/`, texto KUVU).
- **`README.md`** — no aplica: no existe; el cambio no altera superficie pública documentada.
- **OpenAPI / Bruno** — no aplica: no se tocaron endpoints HTTP (el proyecto no expone API pública por config).

## Artifacts

Almacenamiento `files`: 10 artifacts en `sdd/logo-responsive/` confirmados (init no generó artifact — documentado su ausencia: cfg trabajado en `sdd.config.md` + `sdd-init` no aplica a cambios puntuales). Sin push de memoria (backend `files`).

## Pendiente para el usuario (manual, fuera del ciclo)

- Commitear/PR de los 3 bloques (1 Logo, 2 Responsive público, 3 Responsive admin) según la estrategia de entrega acordada. Los bloques 1–3 están implementados y verificados; `git status` muestra los cambios sin commitear (solo `kuvu_mobile/` con el delete staged).
- Opcional: considerar completar `docs/architecture.md` y crear `README.md` en cambios dedicados.
- Nota: `kuvu_mobile/` eliminada del working tree persiste en el historial de git (no contenía secretos; sin purga requerida).

## Cierre

Cambio completo y verificado. `document-report` presente → precondición de archivo cumplida. Cerrado.