# Propose — breadcrumb-y-cta-legible

Fuente: `sdd/breadcrumb-y-cta-legible/explore.md` (sección 3, decisiones del Gate A).

## Intent

La banda final de la home ("¿Listo para administrar tus inmobiliarias?") es ilegible en modo
claro, con texto blanco sobre `#f0f4f8` (1.1 : 1), porque su fondo verde depende de un token
de Tailwind que solo se emite por casualidad. Además, las páginas públicas internas no le
indican al visitante dónde está dentro del sitio. El cambio hace que la banda tenga siempre
su fondo verde y agrega breadcrumb, visual y estructurado (JSON-LD), a esas páginas.

## Alcance

1. **Banda `cta-final` legible en modo claro y oscuro.** El fondo de `.cta-final` tiene un
   valor de respaldo `#2f4a2f` para cuando `--color-brand-700` no existe en runtime, con el
   mismo patrón que `team-band`. Un test de regresión cubre el caso del token ausente.
   Objetivo: `h2` ≥ 3 : 1 y párrafo ≥ 4.5 : 1 (medido hoy con el verde: 9.81 y 7.63).
   El botón "Ingresar" de esta banda queda azul (gradiente de `.btn-primary`) con texto blanco,
   igual que los del hero y el header. Sus estados hover y foco siguen siendo legibles (D-3).
2. **Breadcrumb visual en `/nosotros` y `/preguntas-frecuentes`.** Un componente público
   reutilizable, dentro de `.page-hero` y arriba del `h1`: "Inicio › {Página}", separador "›",
   "Inicio" enlaza a `/` y el último ítem es la página actual. Accesible como navegación
   (`nav` con etiqueta, lista ordenada, página actual marcada).
3. **JSON-LD `BreadcrumbList` en esas dos páginas**, emitido a través de `PageMetaService`
   (que ya fija título y descripción en ambas). El script se retira al salir de la página.
4. **Tests** (`test-after`) del componente, del servicio y de la integración en las dos
   páginas. **Documentación**: `docs/breadcrumb-y-cta-legible.md`, CHANGELOG, y nota en
   `docs/architecture.md` sobre el respaldo de tokens y el breadcrumb del clúster público.

## No-objetivos

- **Botones del hero y del header:** no se tocan (`.hero-cta` y "Ingresar" del header siguen
  como están). El único botón dentro del alcance es "Ingresar" de `cta-final` (D-3).
- **Arreglo global de tokens Tailwind** (`@theme static` o valores en `:root`), y el resto de
  tokens ausentes en modo claro (`--color-home-*`, `--radius-*`, `brand-100/200/300/600`).
  Queda como candidato a un cambio propio.
- **Breadcrumb en otras rutas:** ni home, ni `/acceder`, ni `/login`, ni el módulo de gestión.
- Cambiar el color o el diseño de la banda más allá de garantizar su fondo verde actual.
- Breadcrumb de más de dos niveles o generado a partir del router.

## Approach

- **Banda y su botón:** cambios locales en el bloque `.cta-final` de `home.component.scss`
  más tests en `home.component.spec.ts`. No toca estilos globales ni `.btn-primary`.
- **Breadcrumb:** componente standalone en `components/public/` que recibe los ítems por
  input, con etiquetas de `content/site.ts` (`pageNavLinks`). Cada página declara su ruta de
  dos niveles.
- **JSON-LD:** `PageMetaService` suma la responsabilidad de publicar y limpiar un
  `BreadcrumbList` a partir de los mismos ítems, para que el visual y el estructurado no
  diverjan. Las URLs absolutas que pide schema.org se construyen en runtime con
  `window.location.origin` (decisión del usuario: no hay dominio de producción, se trabaja
  localmente).

## Decisiones del usuario

| # | Decisión |
|---|---|
| D-1 | `home-imagen-equipo` no se archiva ni se commitea por ahora: los dos cambios conviven en el mismo working tree |
| D-2 | Origen de las URLs del JSON-LD: `window.location.origin` en runtime |
| D-3 | El botón "Ingresar" de `cta-final` entra en alcance: azul (gradiente actual de `.btn-primary`) con texto blanco, ≥ 4.5 : 1 en todo el gradiente, con hover y foco legibles. Hero y header no se tocan |

## Riesgo estimado

Bajo. Entre 7 y 9 archivos (1 SCSS, componente nuevo con 3 a 4 archivos, servicio, dos
páginas, specs) y unas 150 a 250 líneas con tests y docs, por debajo del umbral de 300 de
`sdd.config.md`. Un solo slice.

**Riesgo registrado: working tree compartido (D-1).** `nosotros.component.*` y
`home.component.spec.ts` tienen cambios sin commitear de `home-imagen-equipo`, que convive con
este cambio. `tasks` identifica con precisión qué hunks de esos archivos pertenecen a cada
cambio (tomando `git diff HEAD` como línea base) y `apply` registra en su `apply-progress` las
líneas exactas que agrega, para que cada cambio se pueda commitear por separado
(`git add -p`).
