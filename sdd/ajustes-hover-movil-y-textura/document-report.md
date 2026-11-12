docs_archivo: docs/ajustes-hover-movil-y-textura.md
architecture: sin cambios (sin componentes, capas ni límites nuevos; `TAP_FEEDBACK_MS` es una constante compartida y los estilos viven en componentes existentes)
guidelines: sin cambios (las convenciones van a `sdd/sdd-init.md`; `DEVELOPMENT_GUIDELINES.md` no tiene sección Angular)
openapi: no aplica: el cambio no toca endpoints HTTP (solo frontend)
collections: no aplica: sin endpoints HTTP
changelog: entradas bajo Unreleased: Added (feedback del menú lateral) y Fixed (feedback táctil del menú del sitio; textura visible de la app de gestión)
readme: no aplica: no cambian instalación, comandos, variables ni la descripción del proyecto
desvios: ninguno entre design y lo implementado (en refine se borró el `:hover` del sidebar que la hoja nueva ya redefinía)
