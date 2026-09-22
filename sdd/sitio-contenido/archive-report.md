# Archive-report — sitio-contenido

## Resumen de cierre

**Qué se construyó.** El sitio público de KUVU quedó como un clúster propio dentro del
frontend Angular (standalone, signals): contenido institucional centralizado y tipado en
`src/app/content/*.ts`, chrome compartido (`SiteHeader`/`SiteFooter`, `ThemeService`,
`RevealDirective`, `PageMetaService`), la home ampliada con cinco secciones nuevas, y dos
páginas públicas nuevas — `/nosotros` y `/preguntas-frecuentes` — con rutas lazy, `title` de
ruta y `meta description` por página. Quedaron fuera de alcance las páginas con formularios
(funciona solo WhatsApp) y la app autenticada interna (intacta).

**Decisión del usuario que definió el resultado.** El CTA de contacto del sitio es WhatsApp
(`wa.me/573223192760`, mensaje prefilled). Sin formulario de contacto, sin blog, sin legal.

**Verificación.** Suite completa **119/119 verde**; `ng build` AOT compila (solo warning de
presupuesto de fuentes, preexistente y ajeno). Sin cambios de producción después de `verify`:
`secure` y `refine` cerraron sin tocar código. No hizo falta re-verificar.

## Pendientes consciente y deliberadamente no hecho (de `refine`)

- `.container` (mismo cuerpo) duplicado en 5 SCSS de componentes del sitio público. Si llega
  una **tercera** página de tipo "subpágina" (misma columna de chrome), extraer
  `PageShellComponent` (descartado hoy por Regla de Tres). Deuda registrada, no bloqueante.
- Canvas 3D/animaciones y refactors del chrome ya cerrados no se re-decidieron (instrucción de
  los apply-progress: no tocar `home.*`, `chrome`, `content/*` salvo bug).

## Acciones fuera del código (de `secure`)

- **Secretos a rotar: ninguno** (el único número compromisible sería el de WhatsApp, público
  por diseño — no es un secreto).
- **Dependencias a actualizar: ninguna** (este cambio no toca `package.json`).
- **Configuración/infra a endurecer: ninguno** requerido por este cambio (SPA estática sobre la
  infra existente).

## Work item pendiente que sobrevive al cierre

- **Auditar/remover `document.write` en `pagos.component.ts:167`** (app autenticada,
  preexistente, fuera del alcance de este cambio). No se corrige acá. Es un trabajo dedicado de
  seguridad, primero en prioridad si se toca el módulo de pagos.

## Riesgo residual aceptado

- Ninguno *dentro* de este cambio: el threat model no encontró vulnerabilidad alcanzable en el
  alcance (3 rutas estáticas, cero input, cero API). El defecto `document.write` no es riesgo
  aceptado: está delegado al work item de arriba, no aceptado.

## Documentado — y dónde (de `document`)

| Destino | Estado |
|---|---|
| `docs/sitio-contenido.md` | **creado** — feature doc del cambio |
| `docs/architecture.md` | **actualizado** — reescrito desde el template: clúster público + autenticado, flujos, decisiones y límites |
| `CHANGELOG.md` | **entrada nueva** en `[Unreleased]` (Added + Changed) — cambio visible desde afuera |
| `frontend/proyecto_angular/README.md` | **actualizado** — Angular 21, sección Pruebas, árbol de estructura, dependencias |
| OpenAPI / Bruno | **no aplica** — el cambio no toca endpoints HTTP (sitio estático) |
| `DEVELOPMENT_GUIDELINES.md` | **sin cambios** — no hay convención de stack nueva; política de logs n/a (no hay logging nuevo) |
| `sdd/sdd.config.md` | **actualizado (T10)** — comando de test corregido (`fronted` → `frontend`, con CHROME_BIN) y slices alineados a este cambio |

## Backend de almacenamiento

- Archivos en el repo: todos los artifacts de `sdd/sitio-contenido/` confirmados en su lugar
  (`explore/propose/spec/design/tasks/continuation`, `apply-progress/{contenido,chrome,home-expandida,paginas}`,
  `verify-report`, `secure-report`, `refine-report`, `document-report`). No hay memoria
  compartida configurada para push.
- Extensión `git` inactiva en `sdd.config.md`: **sin commits ni PR en esta fase** — los
  cambios quedan en el working tree para que el usuario los commitee/abra PR de producción.

```
archive_status: completo
cambio: sitio-contenido
ciclo: init → explore → propose → spec → design → tasks → apply (4 slices) → verify → secure → refine → document → archive
commit: n/a (extensión git inactiva)
pr: n/a
work_item_abierto: audit de document.write en pagos.component.ts (seguridad, dedicado)
```