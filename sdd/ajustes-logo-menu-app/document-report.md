# Document report — ajustes-logo-menu-app

docs_archivo: docs/ajustes-logo-menu-app.md (nuevo)
architecture: actualizado
  - componentes del header/footer: logo, superficie en `::before`, nuevo `components/back-to-top/`
  - decisiones: "Un logo por punto de marca" y "Un único Volver arriba global"
guidelines: sin cambios. `DEVELOPMENT_GUIDELINES.md` no tiene sección Angular; las
  convenciones nuevas quedan en `sdd/sdd-init.md` (slice `cierre`), como en cambios
  anteriores. Si se quiere una sección Angular en los guidelines, va como work item propio
  por `spec`.
openapi: no aplica (no hay endpoints HTTP nuevos ni cambiados; el backend no se toca)
collections: no aplica (ídem)
changelog: entradas bajo Unreleased
  - Added: botón "Volver arriba"
  - Changed: logo del header y footer, marca del acceso, estados del menú móvil, Cancelar y
    fondo de la app
  - Fixed: el menú móvil abre con la página scrolleada
readme: no aplica (no cambian instalación, comandos, variables ni la descripción del proyecto)
otros: `docs/logo-web-responsive.md` actualizado
  - header con un solo símbolo y footer sin logo
  - acceso con lockup
  - navbar e intro con logo completo
  - se quitó la decisión de "dos `<img>` + toggle"
desvios: ninguno nuevo. Los desvíos de design ya están registrados en verify-report y se
  documentan como implementados: lockup en `brand-lockup.scss` y regla de medida que incluye
  `.pasarela-actions`.
