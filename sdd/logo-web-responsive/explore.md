# Explore — logo-web-responsive

## Estado actual

El sistema de logo del frontend Angular es un objeto con **4 variantes** (completo/símbolo ×
claro/oscuro) centralizado en `src/app/content/logo.ts`, más cuatro PNG en
`public/logo-rediseno/`.

```ts
export const logo = {
  light: '/logo-rediseno/logo-light.png',
  dark: '/logo-rediseno/logo-dark.png',
  responsiveLight: '/logo-rediseno/logo-responsive-light.png',
  responsiveDark: '/logo-rediseno/logo-responsive-dark.png'
} as const;
```

Los cuatro PNG (`logo-light.png`, `logo-dark.png`, `logo-responsive-light.png`,
`logo-responsive-dark.png`) están **eliminados** del working tree. En su lugar hay dos assets
nuevos, aún sin referenciar:

| Asset | Dimensiones | Peso |
|---|---|---|
| `public/logo-rediseno/Logo_Kuvu.png` | 703×271 | 144 KB |
| `public/logo-rediseno/Logo_Responsive.png` | 284×223 | 56 KB |

Los nombres siguen la convención `Logo_*.png` que el proyecto ya usó para el asset
`Logo_Kuvu.jpeg` original; el resto de los assets públicos usa kebab-case.

## Inventario de referencias en producción

`frontend/proyecto_angular/src/`:

| Archivo | Línea | Referencia actual | Qué resuelve |
|---|---|---|---|
| `app/content/logo.ts` | 2-5 | las 4 rutas | fuente única de las rutas |
| `app/content/content.spec.ts` | 135-145 | 4 rutas + "4 variantes distintas" | test de forma del contrato |
| `components/public/site-header/site-header.component.html` | 8, 13 | `isDark() ? logo.dark : logo.light` / `... responsiveDark : responsiveLight` | logo del header |
| `components/public/site-footer/site-footer.component.html` | 8, 13 | idéntico | logo del footer |
| `components/landing/landing.component.html` | 16 | `/logo-rediseno/logo-dark.png` hardcodeado | logo de `/acceder` |
| `components/login/login.component.html` | 9 | `/logo-rediseno/logo-dark.png` hardcodeado | logo de `/login` |
| `components/shared/navbar/navbar.component.html` | 3 | `/logo-rediseno/logo-dark.png` hardcodeado | logo post-login |
| `index.html` | 17 | favicon → `logo-responsive-light.png` | favicon |

Specs que assertan esas rutas: `site-header.component.spec.ts:39,48,58-59`,
`site-footer.component.spec.ts:34-35,44-45`, `landing.component.spec.ts:96`,
`login.component.spec.ts:66`, `navbar.component.spec.ts:35`,
`home.component.spec.ts:264` (este último renderiza el `site-header` dentro de la home).

## Mecánica actual de visibilidad

`site-header.component.scss` y `site-footer.component.scss` muestran **las dos** imágenes en el
DOM y las alternan por CSS en el breakpoint `768px`: `.logo-img--full` /
`.footer-logo--full` visible en `width >= 768px`, `.logo-img--responsive` /
`.footer-logo--responsive` por debajo. La visibilidad **no** depende del tema: el tema solo
elegía *cuál* PNG usar en cada una de las dos imágenes.

`isDark()` queda sin uso en `site-footer.component.ts` si el swap por tema desaparece (en el
header sigue usándose para los iconos del toggle de tema).

## Documentos que describen el sistema de logo

- `docs/logo-rediseno.md` — documenta las 4 variantes, el toggle por tema y el favicon.
- `docs/logo-responsive.md` — describe el logo único `Logo_Kuvu.jpeg` (asset borrado).
- `docs/architecture.md:26-32` — "El logo son 4 variantes…", "los 4 PNG del logo", favicon
  "símbolo light".
- `docs/sitio-contenido.md:81` — menciona el favicon `/Logo_Kuvu.jpeg`.

Ninguno de los tres primeros está referenciado desde `README.md` u otros documentos vivos; solo
desde artifacts archivados de `sdd/logo-responsive/` y `sdd/logo-rediseno/`, que son registro
histórico y no se editan.

## Ambigüedades resueltas en `clarify` (Gate A)

| # | Ambigüedad | Resolución |
|---|---|---|
| 1 | ¿Cómo se maneja el tema oscuro con un solo juego de logos? | **Una sola logo en ambos temas.** Desaparece el swap por tema; no se aplica filtro CSS. |
| 2 | ¿Qué pasa con el favicon? | Pasa a `Logo_Responsive.png` (`type="image/png"`). |
| 3 | ¿Se renombran los assets? | No: se conservan los nombres entregados (`Logo_Kuvu.png`, `Logo_Responsive.png`) y la carpeta `logo-rediseno/`. |
| 4 | ¿Dónde/what about landing, login y navbar? | Siguen usando el logo **web** (completo), sin variante responsive ni breakpoint propio. |
| 5 | Modo de ejecución y modalidad de tests | Automático; `test-after` (declarado en `sdd/sdd.config.md`). |

## Extensiones

`validate`, `analyze` y `branch` no están activas en `sdd/sdd.config.md`. No hay contrato
externo (schema, OpenAPI de otro equipo, norma) contra el que validar esta spec.

## Nota de verificación

El modelo del agente no puede leer imágenes, así que la legibilidad de `Logo_Kuvu.png` sobre
fondo claro y oscuro (RF1) la confirma la persona, no la exploración. Queda como criterio de
aceptación visual en `spec.md`.
