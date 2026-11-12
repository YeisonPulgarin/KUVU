# Color de empresa acotado a la app interna

Cada empresa tiene sus colores de marca, que tiñen la app de gestión (sidebar, botón
principal, avatares, focos de formulario). Esos colores se aplican solo dentro de la app
interna. El sitio público y el flujo de acceso (`/acceder`, `/login`) usan siempre el azul
KUVU, incluido el botón "Ingresar", aunque haya una sesión de empresa activa o restaurada al
recargar.

## Cómo funciona

Rutas relativas a `frontend/proyecto_angular/src/app/`.

- `styles.css` declara en `:root` los tokens por defecto: `--color-primario: #2B4C8C`,
  `--color-secundario: #3A6FD8`, `--color-texto: #FFFFFF`. `shared.styles.scss` agrega
  `--color-primario-contraste: #ffffff`.
- `services/auth.service.ts` exporta `temaDeEmpresa(empresa)`, una función pura que devuelve
  `{ primario, secundario, texto, contraste }` o `null` sin empresa. `secundario` cae en
  `primario` y `texto` en `#FFFFFF` si faltan; `contraste` es el color de texto sobre la
  marca, elegido por luminancia (`components/shared/color-contrast.ts`). `AuthService` no
  escribe estilos en el documento: solo guarda la empresa activa (`empresaActiva`), al iniciar
  sesión y al restaurarla desde `localStorage`.
- `components/shared/app-layout/app-layout.component.ts` calcula
  `tema = computed(() => temaDeEmpresa(auth.empresaActiva()))` y lo declara en su host con
  `[style.--color-primario]`, `[style.--color-secundario]`, `[style.--color-texto]` y
  `[style.--color-primario-contraste]`. Sin empresa, los bindings quedan en `null` y rigen los
  de `:root`.
- Todo lo que usa la marca en la app interna desciende de ese host: sidebar, la pantalla
  proyectada, modales (`<dialog>`, que hereda las variables por el árbol DOM aunque se muestre
  en el top layer), toasts y confirmaciones.
- El `.btn-primary` global (gradiente `--color-primario` → `--color-secundario`) es el mismo
  en todo el sitio; fuera de `<app-layout>` resuelve a los azules de `:root`.

## Decisiones

- **El tema se acota en el layout, no se "repara" en el sitio público.** Fijar el azul solo en
  los botones públicos dejaría el color de empresa aplicado al resto del documento (barra de
  progreso de la home, acceso, piezas futuras). Tradeoff: una superficie interna nueva que
  necesite la marca tiene que vivir dentro de `<app-layout>`.
- **Sin limpieza al navegar.** Quitar el tema al entrar a rutas públicas dependería del orden
  de navegación y de la restauración al recargar; con el tema en el host del layout, salir de
  la app interna lo retira solo, al destruirse el componente.

## Limitaciones conocidas

- `components/shared/navbar/` no se usa y lee `--color-primario`; fuera de `<app-layout>`
  mostraría el azul por defecto. Está registrado para borrarse en un cambio de limpieza.
- Una pestaña abierta con una versión anterior del sitio conserva el color hasta recargar.
