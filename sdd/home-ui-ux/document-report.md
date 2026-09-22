docs_archivo: docs/home-ui-ux.md (creado)
architecture: sin cambios — el cambio es interno al `HomeComponent` (mismo componente standalone, sin componentes nuevos, capas ni flujos estructurales). `docs/architecture.md` sigue siendo el template del instalador sin completar; brecha pre-existente, no la introduce este cambio.
guidelines: sin cambios en el documento — desvío reportado al orquestador: este cambio fija convenciones que el template de guidelines no cubre: (1) Geist como tipografía del proyecto; (2) sistema de tokens vía `@theme` con paleta de marca y superficies `home-*`; (3) escala de forma (`--radius-pill/card/icon`); (4) dark mode por clase `.dark` + script inline anti-FOUC; (5) densidad de secciones (py-32+ en desktop); (6) patrón de reveal `[data-reveal]` con IntersectionObserver. Decisión del usuario si entran por `spec`.
openapi: no aplica — el cambio no toca endpoints HTTP; el proyecto es un frontend Angular sin API propia ni `docs/api/openapi.yaml`.
collections: no aplica — sin endpoints ni colección Bruno en el proyecto.
changelog: entrada agregada bajo [Unreleased] — secciones Added y Changed.
readme: no aplica — el repo no tiene `README.md`; el cambio no altera instalación, comandos, variables de entorno ni requisitos.
desvios: ninguno — `docs/` describe lo que quedó en el código, consistente con `design` y `apply-progress`. Los 2 desvíos detectados en `verify` (contraste en hover de texto y radio del logo) ya se resolvieron en el micro-fix previo y no afectan la documentación.
