# Explore — ingresar-color-marca

Contexto: `sdd/sdd-init.md`. Rutas relativas a `frontend/proyecto_angular/src/app/`.

## Qué existe hoy

- `services/auth.service.ts` aplica el tema de la empresa escribiendo propiedades **inline en
  `document.documentElement`**: `--color-primario`, `--color-secundario`, `--color-texto` y
  `--color-primario-contraste` (`aplicarTemaEmpresa`). Lo hace al iniciar sesión, y también en
  `restaurarSesion()` (llamado desde `app.ts` en cada arranque) a partir de `localStorage`
  (`empresa_id`, `usuario`, `empresa`), y de nuevo al refrescar la empresa desde la API. Solo
  `logout()` las quita (`resetearTema`).
- El inline de `<html>` gana sobre los defaults de `:root` (`styles.css`: `--color-primario:
  #2B4C8C`, `--color-secundario: #3A6FD8`) y alcanza **todo el documento**.
- Los botones "Ingresar" del sitio público (header escritorio y móvil, hero, banda final)
  usan la clase global `.btn-primary` (`components/shared/shared.styles.scss`), cuyo fondo es
  `linear-gradient(var(--color-primario), var(--color-secundario))`. La barra de progreso de
  lectura de la home también usa `--color-primario`.
- Resultado: con una sesión guardada (o tras usarla sin cerrar sesión), al volver al sitio
  público o al recargar, "Ingresar" toma el color de la empresa (p. ej. Amarilo `#F5A623`).
- Consumidores de los tokens de empresa: todos dentro de `<app-layout>` (sidebar, dashboard,
  `.app-layout .btn-primary`, formularios, modales, toasts y confirmaciones, que el layout
  monta dentro de su `.app-layout`), más el `.btn-primary` global y `shared/navbar` (sin uso
  en ningún template). `/acceder` y `/login` no leen esos tokens: pintan cada empresa con
  `[style.--emp-color]` local.
- Pantallas internas con `<app-layout>`: dashboard, contratos, pagos, mantenimiento, locales,
  usuarios.

## Intento previo
`sdd/sitio-publico-expresivo` (R5.4) decidió que "Ingresar" conserve `.btn-primary` con los
tokens `--color-primario`/`--color-secundario`. Son los mismos tokens que el tema de empresa
sobrescribe en `<html>`, así que esa decisión no protege el azul: es el origen del bug.
`breadcrumb-y-cta-legible` ajustó solo el texto blanco del botón de la banda final.

## Archivos relevantes
- `services/auth.service.ts` (+ spec)
- `components/shared/app-layout/app-layout.component.ts` (+ spec)
- `components/shared/shared.styles.scss` (`.btn-primary`, `--color-primario-contraste`)
- `styles.css` (`:root` con los defaults azules)

## Ambigüedades (resueltas en modo automático)
1. **¿Dónde se corrige?** En la causa: el tema de empresa deja de escribirse en `<html>` y se
   aplica solo en el host de `<app-layout>`, que envuelve toda la app interna. El sitio
   público y el acceso quedan fuera de su alcance por construcción.
2. **¿Se fija además el azul en el sitio público?** No: sin escritura global, los defaults de
   `:root` son el azul de marca. El test de regresión cubre el caso.
3. **`shared/navbar`** (sin uso) queda como está; fuera de `app-layout` toma el azul default.
