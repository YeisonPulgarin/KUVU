# document-report — acceso-orden-e-intro

```
docs_archivo: docs/acceso-orden-e-intro.md (creado)
architecture: actualizado: "Clúster autenticado" (auth-intro, intro-view-transition.ts, page-turn-sound.service.ts, recordado por pestaña de intro-state.service.ts, orden por id en landing) y el diagrama de "Acceso autenticado"
guidelines: sin cambios (no introduce convenciones nuevas; DEVELOPMENT_GUIDELINES.md no tiene sección de Angular)
openapi: no aplica: sdd.config.md declara "Spec OpenAPI: No aplica" y el proyecto no tiene docs/api/openapi.yaml. El contrato de GET /api/empresas no cambia (mismo body y códigos); solo se fija el orden, documentado en docs/acceso-orden-e-intro.md
collections: no aplica: no existe docs/collections/ y el contrato HTTP no cambia
changelog: entrada bajo Unreleased. Added: la entrada de la intro de la casa 3D (sin release) queda reemplazada por la intro "hoja que pasa". Changed: orden fijo por id en el selector
readme: no hay README.md en la raíz; frontend/proyecto_angular/README.md actualizado: nota de acceso (intro de ~3 s, una vez por pestaña, se puede saltar) y árbol de estructura (auth-intro, intro-state.service, page-turn-sound.service)
desvios: ninguno entre design y código. design.md queda alineado con I15–I20
```

## Otros documentos tocados

- `docs/login-intro-transition.md`: la descripción del flujo de acceso queda en presente con la intro
  "hoja que pasa" (recordado por pestaña, `LandingComponent` sin `transicionando`, salto del
  cross-fade al entrar a `/acceder`). Las decisiones y el detalle de la intro remiten a
  `docs/acceso-orden-e-intro.md`.

## Deuda y riesgo que quedan documentados

En "Limitaciones conocidas" de `docs/acceso-orden-e-intro.md`:
- sin sonido entrando directo por URL;
- ~250–300 ms sin cuadros al levante en headless;
- warning `css-inline-fonts`.

Extensión `git` inactiva: no hay commit en esta fase.
