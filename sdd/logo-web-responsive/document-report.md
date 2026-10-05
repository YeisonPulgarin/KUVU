# Document-report — logo-web-responsive

docs_archivo: `docs/logo-web-responsive.md` (creado)

## Actualizado

| Destino | Cambio |
|---|---|
| `docs/logo-web-responsive.md` | **Creado.** Documenta el sistema de 2 logos: tabla de assets, cómo lo consume cada componente, decisiones (el tema no participa, claves `web`/`responsive`, dos `<img>` + CSS en lugar de `<picture>`, nombres de archivo) y limitaciones (un solo logo para ambos temas, favicon no cuadrado, peso sin derivados, sin variante responsive en login/landing/navbar, contraste revisado a mano). |
| `docs/architecture.md` | Actualizado el bloque del clúster público: "4 variantes (light/dark)" → 2 variantes con alternancia por viewport; el favicon es "el símbolo" y ya no "light". |
| `docs/sitio-contenido.md` | Corregida la ruta del favicon en "Limitaciones conocidas": `/Logo_Kuvu.jpeg` (asset inexistente) → `/logo-rediseno/Logo_Responsive.png`. |
| `CHANGELOG.md` | Actualizadas las 3 entradas de logo del bloque `[Unreleased]` para que describan el estado que se va a publicar: el asset del logo real, las 2 variantes, y el párrafo del rediseño del sistema de variantes (ya sin alternancia por tema). |

## Consolidado (documentos eliminados)

| Eliminado | Motivo |
|---|---|
| `docs/logo-rediseno.md` | Describía el sistema de 4 variantes con favicon "símbolo light"; ese sistema no existe. Queda reemplazado por `docs/logo-web-responsive.md`. |
| `docs/logo-responsive.md` | Describía el logo único `Logo_Kuvu.jpeg`, un asset que no está en el repo. Ya estaba desactualizado y este cambio lo volvía moot. |

Ninguno de los dos estaba referenciado desde documentos vivos: los únicos refs eran artifacts
archivados de `sdd/logo-responsive/` y `sdd/logo-rediseno/`, que son registro histórico del
proceso y no se editan. La historia de ambos sistemas queda en `CHANGELOG.md` y en esos
artifacts.

## No aplica

- **OpenAPI / colecciones Bruno**: el proyecto no expone API HTTP pública (`sdd.config.md`).
- **README**: no existe archivo `README.md` en el repo.
- **DEVELOPMENT_GUIDELINES.md**: el cambio no introduce convención de código nueva; los
  templates de stack del documento (Go/Next/Astro) no aplican a este frontend Angular y no se
  tocan.

## Regla de solo-tiempo-presente

Verificado: ningún documento vivo describe el sistema anterior. Las referencias al estado
previo quedan únicamente en `CHANGELOG.md` (único lugar permitido para hablar de versiones
anteriores) y en los artifacts archivados de `sdd/`.
