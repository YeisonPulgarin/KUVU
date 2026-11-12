# Design — ingresar-color-marca

Referencias: `propose.md`, `spec.md`. Rutas relativas a `frontend/proyecto_angular/src/app/`.

## D1 — El tema de empresa es un dato, no un efecto global
`services/auth.service.ts` exporta la función pura `temaDeEmpresa(empresa)`, que devuelve
`{ primario, secundario, texto, contraste }` (secundario = primario y texto = `#FFFFFF` cuando
faltan; contraste = `textoSobreMarca(primario)`) o `null` sin empresa. `aplicarTemaEmpresa` y
`resetearTema` desaparecen: `AuthService` no toca el DOM.

## D2 — `<app-layout>` publica el tema en su host
`AppLayoutComponent` calcula `tema = computed(() => temaDeEmpresa(auth.empresaActiva()))` y lo
enlaza en el host con `[style.--color-primario]`, `[style.--color-secundario]`,
`[style.--color-texto]` y `[style.--color-primario-contraste]` (`null` las quita). Todo lo que
usa esos tokens en la app interna es descendiente del host (sidebar, pantalla proyectada,
modales `<dialog>`, hosts de toasts y confirmaciones); las variables CSS se heredan por el
árbol DOM aunque el `<dialog>` esté en el top layer.

- Descartado: fijar los azules en `.site-root` o en el `.btn-primary` público. Tapa el síntoma
  en una superficie y deja el tema filtrándose en el resto del documento (barra de progreso,
  `/acceder`, piezas futuras): es el mismo enfoque de compartir tokens que causó el bug
  (`sitio-publico-expresivo` R5.4).
- Descartado: quitar el tema al navegar a rutas públicas. Depende del orden de navegación y de
  la restauración al recargar; el estado global vuelve a filtrarse ante cualquier carrera.

## D3 — Sin cambios de estilos
`.btn-primary`, `:root` y `--color-primario-contraste: #ffffff` (default de `shared.styles`)
siguen igual. Fuera del layout rigen los azules de `:root`.

## Logs
Sin logs (UI). Política en `DEVELOPMENT_GUIDELINES.md`.
