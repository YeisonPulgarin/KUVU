# Propose — logo-web-responsive

## Intent

El juego de branding pasa de **4 variantes de logo** (completo/símbolo × tema claro/oscuro) a
**2 assets**: uno para web (completo, con wordmark) y uno responsive (símbolo). La marca se
adapta al viewport, no al tema: el mismo asset se usa en tema claro y oscuro.

## Alcance

- `content/logo.ts` expone dos rutas: `web` (logo completo) y `responsive` (símbolo).
- `site-header` y `site-footer` muestran `logo.web` en desktop y `logo.responsive` en móvil,
  sin swap por tema.
- Landing (`/acceder`), login (`/login`) y navbar autenticada muestran el logo web.
- `index.html` apunta el favicon al logo responsive.
- Specs de contenido, header, footer, home, landing, login y navbar alineados al contrato de
  dos logos.
- Documentación: documento del cambio, `docs/architecture.md`, `docs/sitio-contenido.md` y
  `CHANGELOG.md`. Los documentos de logo que describen sistemas ya extintos
  (`docs/logo-rediseno.md`, `docs/logo-responsive.md`) se consolidan en el documento nuevo.

## No-objetivos

- No se redesignan header, footer, landing, login ni navbar: solo cambia la `src` del logo.
- No se aplican filtros CSS ni variantes por tema sobre los logos.
- No se optimizan los PNG (144 KB y 56 KB se entregan tal cual; réduire peso es un work item
  aparte).
- No se toca el ícono de empresa del sidebar autenticado ni `logo_url` en los datos.
- No se editan artifacts de cambios archivados (`sdd/logo-responsive/`, `sdd/logo-rediseno/`) ni
  las entradas históricas del `CHANGELOG.md`.
- No se agregan tests de contraste visual ni de carga de la imagen en el navegador.

## Enfoque

Los dos assets ya están en `public/logo-rediseno/` con los nombres entregados; el trabajo es
reapuntar el sistema y sus tests. Se conserva la estructura actual (dos `<img>` conviviendo en
el DOM conmutados por CSS en `768px`) porque ya resuelve el caso responsive y no depende del
tema — que es justamente lo que dejó de importar.

## Alternativas descartadas

| Alternativa | Por qué no |
|---|---|
| `<picture>` + `srcset` con un solo `<img>` | Reemplaza lógica de SCSS probada sin ganancia: el breakpoint ya funciona y hay tests sobre las dos imágenes del DOM. |
| Filtro CSS (`invert`/`brightness`) en tema oscuro | Exige que el logo sea monocromático o de color plano; con el asset definitivo se decidió que se ve bien en ambos temas. |
| Mantener los nombres `logo-light`/`logo-dark` para los 2 assets nuevos | `light`/`dark` mienten: ya no hay relación con el tema. Se usan `web` y `responsive`, que describen el uso real. |
