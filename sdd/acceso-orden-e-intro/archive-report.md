# Archive report — acceso-orden-e-intro

**Estado:** cerrado. Verify en verde (corrida posterior a I18–I20) y documentado. Almacenamiento:
`files`, sin memoria que sincronizar. Extensión `git` inactiva: el usuario pide un commit local en
`feat/acceso-orden-e-intro`, sin push (el hash queda en el mensaje de cierre del orquestador).

## Qué se hizo

- **Orden de empresas:** `GET /api/empresas` devuelve las empresas activas `ORDER BY id`. El
  selector de `/acceder` las muestra en ese orden y el filtro lo conserva.
- **Intro "hoja que pasa"** (reemplaza la casa 3D): una hoja de papel con el logo KUVU y una casa en
  trazo fino que se dibuja, se curva en 6 franjas anidadas y pasa en ~2,9 s, con sonido sintetizado.
  - Se salta con clic o tap, con Escape, Enter o Espacio, o con el botón "Saltar".
  - Se recuerda por pestaña (`sessionStorage`) y se omite con movimiento reducido.
  - El selector se descubre durante 1,33–1,40 s en 360, 1366 y 1920 px.
  - La casa se ve dibujarse: capa plana para la presentación, selector sin renderizar hasta el
    levante y sin cross-fade del router al entrar a `/acceder`.
- **Higiene SDD:** `sdd.config.md` declara MariaDB 10.4 y los slices, y `sdd-init.md` declara
  `expone_api_http: true`.

Slices: `backend-orden` (B1–B3), `intro` (I1–I20, con la enmienda I9–I14 y las correcciones
I15–I20) y `cierre` (C1–C3). Tests: backend 10/10, Karma 241/241. Build OK, con initial de 499,98 kB.

## Decisiones clave

- La intro es CSS con 6 franjas anidadas, sin canvas, WebGL ni librerías. El fin lo marca un timer en
  TS (`INTRO_DURATION_MS = 2900`), alineado con el SCSS por tests sobre la animación real.
- Perspectiva `max(2200px, 500vw)`, levante a −12°, easing `cubic-bezier(.3,0,.8,1)` hasta −91°.
- R2.2.1 / CA3.1 miden el pase visible por lo que se ve descubrirse (decisión del usuario).
- Sombreado como una rampa continua repartida entre las franjas.
- Sin `AudioContext` cuando no hubo un gesto previo del usuario (entrada directa por URL: silencio).
- Presentación en una capa plana con traspaso a las franjas a los 600 ms, señal `tapado` en el landing
  (`content-visibility` en el selector, para que el buscador reciba foco al final) y
  `skipViewTransitionIntoIntro` en el router.
- Recordado por pestaña y movimiento reducido sin intro ni sonido.
- Gate E: `secure` y `refine` ofrecidos; el usuario respondió `ninguna`.

## Documentación (de `document-report`)

| Destino | Estado |
|---|---|
| `docs/acceso-orden-e-intro.md` | nuevo |
| `docs/login-intro-transition.md` | actualizado: flujo de acceso con la intro nueva |
| `docs/architecture.md` | actualizado: clúster autenticado (auth-intro, hook del router, sonido, recordado) y flujo de acceso |
| `CHANGELOG.md` | `[Unreleased]`: Added (intro "hoja que pasa", en lugar de la entrada de la casa 3D, que no salió en un release) y Changed (orden por id) |
| `frontend/proyecto_angular/README.md` | nota de acceso y árbol de estructura |
| `DEVELOPMENT_GUIDELINES.md` | sin cambios: no introduce convenciones nuevas |
| OpenAPI / Bruno | no aplica: el proyecto no tiene spec OpenAPI ni colecciones, y el contrato HTTP de `GET /api/empresas` no cambia (solo el orden) |

## Pendientes y riesgo residual

- **Levante:** en headless hay ~250–300 ms sin cuadros al levante (600–870 ms) mientras se renderiza el
  selector bajo la hoja casi plana.
- **Deuda transversal:** el `console.error` del backend en `routes/empresas.js` sigue fuera de la
  política de logs.

## Integración con `home-profesional` (PR #1)

La rama integra `feat/home-profesional` con un merge commit:
- `app.config.ts` une `withInMemoryScrolling` + `provideAppInitializer` (offset bajo el header) con
  `withViewTransitions({ onViewTransitionCreated: skipViewTransitionIntoIntro })`.
- `sdd.config.md` y `sdd-init.md` unen las dos tablas de slices
  (`backend-orden, contenido, chrome, paginas, home, intro, cierre`) y declaran `expone_api_http: true`.
- `CHANGELOG.md` y `docs/architecture.md` conservan las entradas de los dos cambios.
- La política de cookies (`content/legal.ts`) lista "Intro vista" (almacenamiento de la sesión del
  navegador), con fecha de vigencia 8 de noviembre de 2026.

Con `/acceder` lazy, el landing y la intro salen del bundle inicial: **424,49 kB** (112,09 kB
transfer), contra 499,98 kB antes de integrar. Tests después de integrar: backend 10/10, Karma
372/372, `ng build` OK (solo el warning `css-inline-fonts`). En Chrome sobre el build integrado: la
casa se ve dibujarse (~215–450 ms) y el pase visible es de 1336–1399 ms en 360, 1366 y 1920 px.

