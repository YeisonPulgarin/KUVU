# App interna: acciones semánticas, retroalimentación y movimiento

La app de gestión de cada empresa (rutas `/dashboard`, `/locales`, `/contratos`, `/pagos`,
`/mantenimiento` y `/usuarios`, para Administrador y Arrendatario) comunica cada acción con un
color y un ícono con significado. Pide confirmación con un diálogo propio antes de lo
destructivo, informa cada resultado con un aviso y anima la interfaz con propósito, respetando
el movimiento reducido del sistema operativo.

## Cómo funciona

### Estructura

Cada pantalla se envuelve en `<app-layout pagina="…">`
(`frontend/proyecto_angular/src/app/components/shared/app-layout/`). El layout pinta:

- el sidebar (`shared/sidebar/`);
- la columna principal con el breadcrumb `{Empresa} › {Página}`
  (`nav[aria-label="Ruta"]`, último ítem con `aria-current="page"`; en el dashboard la página
  es `Inicio` y la empresa no es enlace);
- los hosts de avisos (`<app-toast-host>`) y confirmaciones (`<app-confirm-host>`).

Si la carga de datos de la empresa falla, el layout muestra el aviso de error.

### Colores y botones

Los colores semánticos están al inicio de `components/shared/shared.styles.scss` y son iguales
para todas las empresas: `--sem-{danger,success,warning,info,neutral}-{fg,bg,border,solid}`.

El color de la empresa (`--color-primario`) solo rellena el botón principal de cada pantalla.
El texto de ese botón es `--color-primario-contraste`: `AuthService` lo calcula por luminancia
WCAG del primario (`shared/color-contrast.ts`). Sale oscuro sobre marcas claras como Amarilo y
blanco sobre las oscuras.

| Clase | Uso |
|---|---|
| `.btn-primary` | CTA de marca, uno por pantalla |
| `.btn-secondary` | Cancelar / Volver / descargar: neutro, texto ≥ 10:1 |
| `.btn-action--info` | Editar, Iniciar |
| `.btn-action--success` | Completar |
| `.btn-action--danger` | Eliminar, Cancelar solicitud |
| `.btn-action--icon` | variante de solo ícono, siempre con `aria-label` |
| `.btn-solid--{rol}` | botón de confirmación del diálogo |

Los refinamientos de `.btn-primary` y `.btn-secondary` viven bajo `.app-layout`, porque el
sitio público usa esas mismas clases globales en el header y el hero.

Los íconos son `<app-icon name="…">` (`shared/icon/`): SVG de trazo inline, decorativos
(`aria-hidden`), que heredan el color del botón.

Los badges salen de `shared/badges.ts`:

| Función | Valores |
|---|---|
| `badgeEstado` | pendiente → advertencia, en proceso → info, completado → éxito, cancelado → neutro |
| `badgePrioridad` | urgente → peligro, normal → info, baja → neutro |
| `badgeTipoPago` | Arriendo → info, Multa → peligro, Otro → neutro |
| `badgeVigencia` | vigente → éxito, vencido → peligro |

Fechas (`dd/mm/aaaa`, sin desplazar el día por zona horaria) y moneda (COP sin decimales) se
formatean con `shared/formato.ts`.

### Diálogos y avisos

- **Modales:** `<app-modal titulo>` (`shared/modal/`) envuelve un `<dialog>` nativo abierto
  con `showModal()`. El navegador aporta la capa superior, el fondo inerte y la trampa de
  foco.
  - El componente agrega el foco inicial (el `[autofocus]` proyectado o el primer campo), el
    retorno del foco al control que lo abrió, el cierre con ✕, fondo o Escape, y la animación
    de salida.
  - La pantalla lo pinta dentro de un `@if` y lo cierra con `modal()?.cerrar()`. En
    `(closed)` resetea su estado, así "Nuevo" siempre abre un formulario limpio.
- **Confirmación:** `ConfirmService.confirmar({ titulo, mensaje, confirmarTexto, variante })`
  (`shared/confirm/`) devuelve una promesa: `true` al confirmar y `false` al cancelar, con
  Escape o con el fondo. El mensaje nombra lo que se afecta. El foco inicial va a "Cancelar".
- **Avisos:** `ToastService.exito()` / `error()` (`shared/toast/`) muestran mensajes que se
  cierran solos (4 s el de éxito, 6 s el de error). Hay como máximo tres a la vez. La región
  es `aria-live="polite"` y los de error llevan `role="alert"`.
- **Errores de formulario:** se muestran dentro del modal en `.error-msg[role=alert]`, con los
  campos faltantes marcados `aria-invalid`.

En la app interna no se usa `confirm()`, `alert()` ni `prompt()`.

### Acciones por pantalla

| Pantalla | Administrador | Arrendatario |
|---|---|---|
| Dashboard | indicadores con conteo animado, pagos recientes, urgentes, accesos rápidos | lo mismo, filtrado a lo suyo |
| Locales | crear, editar, eliminar | — |
| Contratos | crear, editar, eliminar | solo lectura |
| Pagos | filtrar, reporte, eliminar | filtrar, reporte, pagar arriendo |
| Mantenimiento | crear, iniciar, completar, cancelar solicitud (confirmación), eliminar | solicitar |
| Usuarios | crear, editar, eliminar (no a sí mismo) | — |

- Eliminar usa los `DELETE /api/{entidad}/:id` del backend a través de `DataService`
  (`eliminarLocal`, `eliminarContrato`, `eliminarPago`, `eliminarMantenimiento`,
  `eliminarUsuario`).
- Mientras corre un borrado, el botón de esa fila queda ocupado (`aria-busy`) y el resto de
  los botones de borrar se deshabilita.
- "Ir a pagar" se bloquea desde el primer clic hasta que el backend responde: un doble clic
  registra un solo pago.

### Carga

`DataService` expone:

- `listo()`: los datos de la empresa activa llegaron al menos una vez; sigue en verdadero
  mientras se refrescan.
- `errorCarga()`: la última carga falló.
- `esperandoDatos()`: ni lo uno ni lo otro.

Mientras `esperandoDatos()`, las pantallas muestran `<app-skeleton>` (`table`, `cards` o
`stats`) en lugar del estado vacío.

### Movimiento

Todo vive en `prefers-reduced-motion: no-preference` y usa los tokens de
`src/styles/_motion.scss`.

- **Entrada y salida:** de modales (fundido y desplazamiento) y de avisos (deslizamiento).
- **Botones:** respuesta al presionar (`scale(.97)`).
- **Lista:** `[appStagger]` (`shared/stagger.directive.ts`) numera los hijos y anima su
  entrada escalonada solo en el primer pintado. Lo que aparece al filtrar no se anima.
- **Cifras:** `<app-count-up>` (`shared/count-up/`) cuenta los indicadores hasta su valor. El
  lector de pantalla oye solo el valor final.
- **Pantallas:** el router ya usa View Transitions. `.sidebar` lleva
  `view-transition-name: app-sidebar` y queda quieto; `.main-content` lleva `app-main` y su
  contenido entra con fundido y desplazamiento.

Con movimiento reducido, todo aparece en su estado final: las cifras sin conteo y las listas
sin escalonado.

## Decisiones

- **Colores semánticos fijos y no teñidos por la marca.** El rojo de eliminar es el mismo en
  las cuatro empresas. Tradeoff: el verde de "completar" comparte tono con el secundario de
  Nido Rent. Se distinguen por estilo (tinte claro con texto oscuro frente al relleno de
  marca) y por ícono.
- **Contraste del botón principal calculado contra el primario, no contra el peor color del
  degradado.** Con el criterio del peor color, Nido Rent pasaba a texto oscuro por una
  diferencia mínima, aunque el blanco sobre su primario da 5:1. El extremo secundario del
  degradado puede quedar por debajo de 4.5:1 en alguna marca.
- **`<dialog>` nativo con animación de salida propia** en lugar de `@angular/animations`. El
  cierre espera `animationend` (con un tope de 300 ms) y con movimiento reducido es inmediato.
  Deja el foco y el fondo inerte a cargo del navegador.
- **Un `<app-layout>` en cada pantalla** en lugar de una ruta padre: las URLs y los guards
  quedan como están, a cambio de repetir el envoltorio en seis plantillas.
- **El flujo de eliminar se repite en cada pantalla** (confirmar, marcar ocupado, llamar,
  avisar) en lugar de un helper genérico. Cada pantalla arma su propio mensaje y mantenimiento
  comparte el estado ocupado con los cambios de estado.
- **Breadcrumb propio de la app**, no el del sitio público, que publica JSON-LD de SEO y usa
  los colores de KUVU.

## Limitaciones conocidas

- **La confirmación es un control de experiencia, no de seguridad.** La API no autentica:
  cualquier cliente que llegue a `/api/*` puede borrar datos. Es riesgo residual aceptado por
  el usuario.
- **Errores de borrado genéricos.** Cuando el backend rechaza un borrado (por ejemplo, por
  registros asociados) responde 500 genérico, y el aviso solo puede sugerir la causa.
- **Sin deshacer** después de eliminar.
- **Pagos sin edición ni registro manual.** No hay edición de pagos (el backend no tiene
  `PUT /api/pagos/:id`), y el administrador no registra pagos a mano ni imprime comprobantes
  (RF-15 y RF-16 del documento de requerimientos, trabajo futuro).
- **La app interna no tiene tema oscuro.**
- **Navegadores sin View Transitions** cambian de pantalla sin animación.
- **Peso global.** El CSS de la app interna se carga global (`shared.styles.scss`, ~42 kB sin
  comprimir, 7.3 kB gzip), también en el sitio público.
- **Flake en specs del sitio público.** Dos specs (`CompaniesMarqueeComponent`,
  `StepsJourneyComponent`) fallan de forma intermitente según el orden de Karma porque leen el
  tema de `:root`.
