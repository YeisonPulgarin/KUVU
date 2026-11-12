# Spec — ingresar-color-marca

## Requisitos funcionales
- **RF-1** Con una sesión de empresa activa (recién iniciada o restaurada al recargar) y en
  cualquier ruta del sitio público, `/acceder` o `/login`, el documento no lleva variables de
  tema de empresa: `--color-primario` y `--color-secundario` valen el azul de marca
  (`#2B4C8C` → `#3A6FD8`) y el botón "Ingresar" se pinta con ese gradiente.
- **RF-2** Dentro de la app interna (`<app-layout>`), `--color-primario`,
  `--color-secundario`, `--color-texto` y `--color-primario-contraste` toman los valores de la
  empresa activa (sidebar, botones, modales, toasts y confirmaciones).
- **RF-3** Sin empresa activa, `<app-layout>` no declara tokens propios (rigen los de `:root`).
- **RF-4** `logout()` sigue limpiando la sesión; no queda tema de empresa en ningún lado.

## Criterios de aceptación
- CA-1 (regresión): con la sesión de una empresa amarilla (`#F5A623`) restaurada desde
  `localStorage`, `document.documentElement.style` no tiene `--color-primario` y un
  `.btn-primary` fuera de `<app-layout>` tiene un `background-image` con los azules
  `rgb(43, 76, 140)` y `rgb(58, 111, 216)`.
- CA-2: tras iniciar sesión con esa empresa, lo mismo que CA-1.
- CA-3: el host de `<app-layout>` declara los cuatro tokens con los valores de la empresa y su
  contraste por luminancia (oscuro sobre amarillo, blanco sobre azul oscuro); un
  `.btn-primary` dentro del layout usa el color de la empresa.
- CA-4: sin empresa activa, el host del layout no declara tokens.
- CA-5: suite y build en verde.

## Fuera de alcance
- Tema por empresa en `/cambiar-contrasena` (no lee esos tokens).
