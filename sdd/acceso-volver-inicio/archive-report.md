# Archive report — acceso-volver-inicio

**Estado: cerrado.** Ciclo completo en modo automático: init (refresco, sin regenerar) →
explore → clarify (resuelto por default) → propose → spec → design → tasks → apply (`intro`,
`cierre`) → verify → secure → refine → document → archive.

**Secretos a rotar: ninguno.**

## Qué se hizo

`/acceder` tiene dos salidas a la home (`/`): el enlace "Volver al inicio" arriba de la marca,
con el estilo del botón de volver de `/login`, y el logo como enlace con nombre accesible
"KUVU, volver al inicio". Ambos son `routerLink`, con foco visible celeste, área de toque de
44px, inertes durante la intro y sin transición con `prefers-reduced-motion: reduce`.

## Decisiones (por default, modo automático, revisables por el usuario)

| Decisión | Valor |
|---|---|
| Ubicación | Arriba del selector, fuera de la card, alineado a la izquierda |
| Elemento | `<a routerLink="/">` (no botón) |
| Texto | "Volver al inicio" |
| Logo | Enlace a `/`; `<img alt="">`, nombre en `aria-label` |
| Contraste | Texto a opacidad .55 (`/login` usa .4) |
| Slices | `intro` y `cierre`; riesgo bajo (~120 líneas, umbral 300) |
| Fases opcionales | `secure` y `refine` elegidas por el usuario; ninguna cambió código, sin re-verificación |

## Verificación

`verify-report`: **pasa**. Karma 474/474 (467 antes del cambio) y `ng build` completo, solo con
el warning conocido de presupuesto `css-inline-fonts` (P-4). CA-1 a CA-6 se cumplen; RF-4, RF-6
y RF-7 (CSS) verificados por inspección.

## Documentación

| Destino | Resultado |
|---|---|
| `docs/acceso-volver-inicio.md` | Creado |
| `docs/architecture.md` | Actualizado: línea de `components/landing/` en "Clúster autenticado" |
| `CHANGELOG.md` | Unreleased → Added |
| OpenAPI / Bruno | No aplica: no toca endpoints HTTP y el proyecto no expone API pública |
| `README.md` | No aplica: no existe en la raíz y no cambian instalación, comandos ni requisitos |
| `DEVELOPMENT_GUIDELINES.md` | Sin cambios: la convención de salidas del flujo de acceso está en `sdd/sdd-init.md` |

## Seguridad (secure)

Sin hallazgos (enlaces internos fijos, sin input ni datos). Sin secretos, dependencias nuevas
ni configuración que endurecer. Sin riesgo residual nuevo.

## Pendiente (trabajo consciente no hecho)

| # | Pendiente | Origen | Sugerencia |
|---|---|---|---|
| 1 | `.empresa-row:hover` (`translateX`) y las animaciones `slowZoom` / `fadeUp` de `/acceder` no respetan `prefers-reduced-motion` | `refine-report` (deuda residual), no-objetivo de la spec | Work item propio en el slice `intro` |
| 2 | `:focus-visible` repetido en `.back-home` y `.brand-link`; CA-4 no reusa `createWithIntro()` | `refine-report` (deliberadamente no tocado, Regla de Tres) | Unificar si aparece una tercera repetición |
| 3 | Revisión visual en navegador del enlace y del foco (no se tomaron capturas) | Modo automático | Revisar `/acceder` en escritorio y móvil antes del PR |

## Rama y entrega

Rama `feat/acceso-volver-inicio`, creada desde `fix/tema-claro-tokens`. Extensión `git`
inactiva: sin push ni PR, a cargo del usuario.

Archivos bajo `sdd/acceso-volver-inicio/`: explore, propose, spec, design, tasks,
apply-progress/intro, apply-progress/cierre, verify-report, secure-report, refine-report,
document-report, archive-report.
