docs_archivo: docs/menu-hover-scrollspy-breadcrumb.md
architecture: actualizado: "Clúster público" (header, `SectionSpyService`, `scroll-offset.ts`) y "Decisiones estructurales" (chrome compartido, scroll-spy como servicio raíz)
guidelines: sin cambios (las convenciones nuevas del frontend Angular quedan en `sdd/sdd-init.md`; `DEVELOPMENT_GUIDELINES.md` no tiene sección Angular)
openapi: no aplica: el cambio no toca endpoints HTTP (solo frontend)
collections: no aplica: sin endpoints HTTP
changelog: entradas bajo Unreleased: Added (scroll-spy y rastro de la home; hover del menú móvil) y Fixed (orden del equipo según las fotos)
readme: no aplica: no cambian instalación, comandos, variables ni la descripción del proyecto
desvios: ninguno entre design y lo implementado (la home arranca el spy con `afterNextRender`, tal como registra `apply-progress/home`)
