# Archive report — ajustes-logo-menu-app

## Acciones fuera del código

Ninguna. `secure` no encontró secretos para rotar, dependencias para actualizar ni
configuración para endurecer.

## Qué se hizo

Cambio de UI en el frontend Angular, en la rama `release/integracion`, con commits locales sin
push:

| Commit | Slice / fase | Contenido |
|---|---|---|
| `1c9dd7d` | chrome | Header solo con el símbolo, footer sin logo, superficie del header en `::before` (arregla el menú móvil con la página scrolleada), estados hover/activo del panel móvil y botón global "Volver arriba" |
| `39cd25a` | intro | `/acceder`, `/login` y `/cambiar-contrasena` con símbolo + "KUVU" en blanco (`brand-lockup.scss`) |
| `9a2b352` | app | Cancelar y "Volver" con el estilo de Eliminar más el ícono "x"; grano en `.main-content`; `$grain` en `styles/_grain.scss` (todos los roles) |
| `3ae78b3` | cierre | Convenciones nuevas en `sdd/sdd-init.md` |
| `56fbc5b` | document | `docs/ajustes-logo-menu-app.md`, `docs/architecture.md`, `docs/logo-web-responsive.md`, `CHANGELOG.md` |
| (este commit) | archive | Artifacts de `sdd/ajustes-logo-menu-app/` |

## Qué se decidió

- **Modo y Gate A.** Ejecución automática con Gates C y E. Header solo con el símbolo; footer
  sin logo; acceso con símbolo y texto (en las tres vistas prevaleció la opción (a)); Cancelar
  en rojo, decisión explícita del usuario; grano solo en `.main-content`.
- **Gate C.** Riesgo alto por volumen (~520 líneas estimadas, umbral 300). El usuario eligió
  un solo PR con un commit por slice.
- **Gate E.** Corrieron `secure` (sin hallazgos) y `refine` (sin cambios).
- **Desvíos del design (implementados y documentados):**
  - los estilos del lockup en una hoja aparte, por el presupuesto `anyComponentStyle`;
  - la regla de medida del descarte cubre también `.pasarela-actions`;
  - el botón oculto lleva `tabindex="-1"` y `aria-hidden`.

## Verificación

- Tests: `npx ng test --watch=false --browsers=ChromeHeadless`, 677/677 en verde. La línea
  base era 654.
- Build: `npx ng build` OK, con Initial total de 474,53 kB. Solo queda el warning conocido de
  `css-inline-fonts`, y bajó: landing pasó de 19,96 a 19,80 kB y login de 17,80 a 17,62 kB.
- Navegador real (build de producción + Chrome headless por CDP):
  - el menú móvil scrolleado ocupa el viewport y se puede clickear;
  - el logo del header es único en claro y en oscuro;
  - "Volver arriba" aparece, sube y se oculta;
  - el acceso muestra el lockup en blanco.
- CA1–CA9 pasan. El verify final después de `secure`/`refine` está en verde.

## Documentación

- `docs/ajustes-logo-menu-app.md`: documento nuevo del cambio.
- `docs/architecture.md`: actualizado (header/footer, `back-to-top`, decisiones de logo y del
  botón global).
- `docs/logo-web-responsive.md`: actualizado al reparto de logos vigente.
- `CHANGELOG.md`: entradas bajo Unreleased en Added, Changed y Fixed.
- `DEVELOPMENT_GUIDELINES.md`: sin cambios. No tiene sección Angular y las convenciones viven
  en `sdd/sdd-init.md`.
- OpenAPI y Bruno: no aplican, porque no hay endpoints nuevos ni cambiados.
- README: no aplica, porque no cambian la instalación, los comandos ni la descripción del
  proyecto.

## Pendiente

- **Revisión visual humana:**
  - el hover del panel móvil;
  - la intensidad del grano y el botón "Volver arriba" en la app interna con sesión real;
  - Cancelar rojo junto a la confirmación roja sólida del diálogo de borrado (riesgo de UX
    aceptado por el usuario).
- **Push, PR y deploy:** los decide el usuario. Los commits son locales en
  `release/integracion`.

### Deuda técnica residual (de refine)

- El `@import` de Google Fonts (Syne/Inter) en `landing.component.scss` y
  `login.component.scss` deja esas hojas cerca del límite de presupuesto (error en 20 kB) y
  produce el warning `css-inline-fonts`. Autohospedarlas es un work item aparte.

### Deliberadamente sin tocar (de refine)

- SVG del grano duplicado en el CSS compilado: gzip ahorraría solo 4 B. Se descarta por KISS.
- Markup del lockup repetido en tres plantillas: son 3–4 líneas estáticas y los estilos ya
  están centralizados. Se descarta por KISS.

## Memoria compartida

El almacenamiento es `files` (`sdd.config.md`), así que no hay sincronización de memoria
compartida. Los artifacts quedan versionados en `sdd/ajustes-logo-menu-app/`.
