# Tasks — ajustes-logo-menu-app

Rutas relativas a `frontend/proyecto_angular/src/app/`. Modalidad `test-after`: cada tarea
cierra con sus specs en verde.

## Slices involucrados

Orden default de `sdd.config.md`, sin desvíos: `chrome` → `intro` → `app` → `cierre`.
No se tocan `backend-orden`, `contenido` (`content/logo.ts` no cambia), `paginas` ni `home`
(salvo el spec de home que asegura el logo del header; va con `chrome`, porque prueba el
header compartido).

### Slice `chrome` (R1–R4, R8)

- **T1** `components/public/site-header`: una sola `<img>` con `logo.responsive`; limpiar
  reglas `--full`/`--responsive`. Specs: `site-header.component.spec.ts` (una imagen, `src`
  responsive en claro y oscuro, sin `logo.web`) y `home.component.spec.ts` (bloque `logo`).
- **T2** `components/public/site-footer`: quitar `.footer-logo` (HTML + SCSS); sacar el
  import de `logo` si queda sin uso. Spec: sin `<img>` de logo, nombre y tagline visibles.
- **T3** `site-header.component.scss`: superficie del header a `.site-header::before`
  (fondo, translucidez compacta y `backdrop-filter`); `.site-header` sin `backdrop-filter`.
  Spec: con `.is-compact`, `getComputedStyle(.site-header).backdropFilter` es `none` y el
  panel abierto tiene alto > 0 en un viewport < 1024 px (si el runner lo permite; si no,
  verificación manual en verify).
- **T4** `site-header.component.scss`: estados del panel móvil (separador al `<li>`, hover/
  focus tintado con `translateX` bajo `no-preference`, activo con barra `inset` y fondo suave).
  Spec: el enlace de la ruta actual del panel tiene `is-active` y `aria-current="page"`.

- **T4b** `components/back-to-top/back-to-top.component.ts` (nuevo) montado en `app.ts`
  (R8, D7). Spec nuevo `back-to-top.component.spec.ts` (CA9). Va en `chrome` porque es una
  pieza compartida montada en la raíz de la app.

### Slice `intro` (R5)

- **T5** `components/landing`: `.brand-lockup` con `logo.responsive` + `.brand-wordmark`
  "KUVU" dentro de `a.brand-link`; estilos en `landing.component.scss`. Spec: reemplazar los
  casos que esperan `Logo_Kuvu.png` por símbolo + texto, y conservar el del enlace accesible.
- **T6** `components/login` y `components/cambiar-password`: mismo lockup; estilos en
  `login.component.scss` (compartido). Specs: símbolo + "KUVU" en ambos.

### Slice `app` (R6, R7)

- **T7** `../../styles/_grain.scss` (nuevo, solo `$grain`); `_site.scss` lo carga con `@use`.
- **T8** `components/shared/shared.styles.scss`: `.modal__footer .btn-action` con la medida
  del primario y `.app-layout .main-content` con el grano bajo un velo de `--color-bg` al 93 %.
- **T9** `components/shared/confirm/confirm-host.component.ts`: descarte con
  `btn-action btn-action--danger` + ícono `x`. Spec `confirm.spec.ts`: clase e ícono en el
  descarte (también con `cancelarTexto: 'Volver'`); casos de foco y resolución sin cambios.
- **T10** Cancelar de `contratos`, `locales`, `pagos`, `mantenimiento`, `usuarios` (×2):
  clase + ícono. Specs de cada pantalla: el Cancelar del modal tiene `btn-action--danger` e
  ícono `x`.

### Slice `cierre`

- **T11** `sdd/sdd-init.md`: convención de `$grain` en `styles/_grain.scss` y de la superficie
  del header en `::before` (no `backdrop-filter` en ancestros de un `position: fixed`).

### Verificación final

- `npx ng test --watch=false --browsers=ChromeHeadless` y `npx ng build` (presupuestos).

## Forecast de riesgo

| Métrica | Estimado |
|---|---|
| Archivos tocados | ~29 (16 de producción + 12 specs + `sdd-init.md`) |
| Líneas cambiadas (agregadas + borradas, tests incluidos) | ~520 (≈270 producción, de ellas ~60 borradas de CSS/HTML; ≈250 de specs) |
| Repos | 1 |
| Umbral `sdd.config.md` | 300 líneas |
| **Riesgo** | **Alto por volumen (~1,7× el umbral)**; complejidad baja: plantillas y estilos más un componente chico con lógica de scroll; sin backend |

Estrategia de entrega del config: `ask-on-risk`. Opciones: un solo PR con un commit por slice
(`chrome`, `intro`, `app`, `cierre`), o PRs encadenados (`chrome` sin el botón,
`back-to-top`, `intro`, `app`), de ~100–150 líneas cada uno.

## Alcance previsto de `document`

- `openapi_afectado`: no
- `changelog_afectado`: sí (cambio visible en sitio público, acceso y app interna)
- `readme_afectado`: no
- `architecture_afectado`: no
- `guidelines_afectado`: no (las convenciones nuevas van a `sdd-init.md`)
- Documento del cambio: `docs/ajustes-logo-menu-app.md`; revisar `docs/logo-web-responsive.md`.

## Decisión del Gate C

Entrega (a): un solo PR con un commit por slice, en este orden: `chrome` (con el botón
"Volver arriba"), `intro`, `app` y `cierre`. Los cuatro slices sugeridos están confirmados. Los
commits son locales en `release/integracion`; push y PR quedan a cargo del usuario.
