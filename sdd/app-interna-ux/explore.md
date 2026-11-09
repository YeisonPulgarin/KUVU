# explore — app-interna-ux

Pedido: dentro de cada empresa (app interna, roles Administrador y Arrendatario), botones con
semántica visual (eliminar en rojo y demás) y mejor UX con animaciones y detalles.

Fuente leída: worktree de solo lectura en `fix/tema-claro-tokens` (08d9b24). Rutas relativas a
`frontend/proyecto_angular/src/app/` salvo que se indique. BD consultada solo con `SELECT`.
No se levantó la app ni se tomaron capturas: el diagnóstico sale de las plantillas y estilos.

## 1. Qué existe hoy

### Estructura y wiring

- Seis rutas lazy en `app.routes.ts`: `dashboard`, `contratos`, `pagos`, `mantenimiento`
  (`authGuard`) y `locales`, `usuarios` (`adminGuard`, `idRol === 1`).
- Cada pantalla repite el layout a mano: `.app-layout` > `<app-sidebar>` + `main.main-content`
  (`[class.collapsed]` desde `SidebarService`). El layout vive en `src/styles.css`.
- Estilos comunes en `components/shared/shared.styles.scss` (501 líneas), cargado global vía
  `@use` en `src/styles.scss`. Los `.scss` de `contratos`, `locales`, `mantenimiento` están
  vacíos; `pagos` y `usuarios` agregan estilos propios; `dashboard` tiene 204 líneas propias.
- Datos: `services/data.service.ts` guarda signals por entidad, `cargarSiVacio()`/`cargarTodo()`
  y operaciones CRUD que recargan la entidad con `tap()`. Expone `cargando`, que ninguna
  plantilla usa.
- Color de marca: `AuthService` publica `--color-primario`, `--color-secundario`,
  `--color-texto` en `:root` desde la tabla `empresas`. Defaults en `src/styles.css`.
- Movimiento: tokens `--ease-*`, `--dur-*` en `src/styles/_motion.scss` (sitio público).
  La app interna no los usa: sus transiciones son literales (`.15s`, `.2s`) y las dos
  animaciones (`fadeIn`, `slideUp` del modal) no están guardadas por
  `prefers-reduced-motion` (incumple RNF-03).
- Foco visible: regla global `:focus-visible` con `--color-brand-500` (verde de KUVU), no con
  el color de la empresa. Los inputs tienen `:focus` propio con `--color-primario`.
- Tema oscuro: la app interna no tiene modo oscuro (todo hex claro); no hay toggle en el
  sidebar.

### Colores de marca de las empresas (BD)

| id | Empresa | primario | secundario |
|---|---|---|---|
| 1 | Amarilo | `#F5A623` | `#F0851A` |
| 2 | Nido Rent | `#2C7A7B` | `#38A169` |
| 3 | Balcones de San Soucci | `#8B4513` | `#A0522D` |
| 4 | Mi Inmueble | `#2B4C8C` | `#3A6FD8` |

- `.btn-primary` pinta texto blanco sobre el degradado primario→secundario. En **Amarilo**
  (la empresa de las credenciales de prueba) el contraste blanco sobre `#F5A623` es ≈ 2:1, por
  debajo de 4.5:1 (AA).
- El secundario de Nido Rent (`#38A169`) es el mismo verde que hoy significa "éxito/completar";
  el marrón/siena de Balcones queda cerca de un rojo apagado. Un set semántico tiene que
  distinguirse de las cuatro marcas.

### Botones e íconos

- Variantes en `shared.styles.scss`: `.btn-primary` (degradado de marca), `.btn-secondary`
  (blanco con borde), `.btn-sm` + color (`.btn-edit`, `.btn-blue`, `.btn-green`, `.btn-gray`,
  `.btn-red`). `.btn-edit` y `.btn-blue` son idénticos. **`.btn-red` no se usa en ninguna
  plantilla.** Paleta con hex sueltos (Chakra v1), sin tokens semánticos.
- `usuarios` define `.btn-icon` y `.btn-icon--danger`: el rojo aparece solo en `:hover`; en
  reposo eliminar y editar se ven iguales. Solo tienen `title`, sin `aria-label`.
- Íconos: emoji en botones y títulos (✏️, 🗑️, ▶, ✔, ✕, 💳, 📄, 🔧, 🏗️, 👥…). El sidebar y las
  stat cards del dashboard ya usan SVG de trazo; el resto mezcla ambos sistemas.
- Etiquetas con "+" literal ("+ Nuevo Local") en vez de ícono.

### Diálogos y feedback

- Modales propios (`.modal-overlay` + `.modal`) en `locales`, `contratos`, `mantenimiento`,
  `usuarios`, `pagos` (pasarela). Sin `role="dialog"`, `aria-modal`, `aria-labelledby`, cierre
  con Escape, foco inicial ni retorno de foco. Animan solo al abrir; al cerrar desaparecen.
- Nativos del navegador: `confirm()` ×2 (eliminar local, eliminar usuario) y `alert()` ×6
  (errores de borrado, "no puedes eliminarte a ti mismo", pago exitoso/fallido, sin contrato).
- Sin toasts ni confirmación visual después de crear, editar, borrar o cambiar estado: el
  modal se cierra y la lista se recarga sin señal.
- Errores de `cambiarEstado` (mantenimiento) y de `cargarTodo` solo van a `console.error`.
- Sin estados de carga: tablas vacías muestran "No hay … registrados" mientras cargan.

## 2. Inventario de pantallas y acciones por rol

| Pantalla | Administrador | Arrendatario |
|---|---|---|
| **Dashboard** | 4 stat cards (locales, contratos, recaudado, mant. pendientes); tabla "Pagos recientes" (5); panel "Mantenimientos urgentes"; 5 accesos rápidos | 3 stat cards (mis contratos, total pagado, solicitudes pendientes); mis pagos recientes; mis urgentes; 3 accesos rápidos |
| **Locales** | Buscar por dirección; Nuevo local (modal); Editar (`.btn-edit`). `eliminar()` existe en el TS **sin botón** | sin acceso |
| **Contratos** | Nuevo contrato (modal); Editar (`.btn-blue`). **Sin eliminar** (ni botón ni método en `DataService`, aunque el backend tiene `DELETE /api/contratos/:id`) | "Mi contrato": tabla de solo lectura |
| **Pagos** | Filtro por tipo; total; "Descargar reporte" (abre ventana e imprime). **No puede registrar ni eliminar pagos** (`eliminarPago` existe en `DataService` y `DELETE /api/pagos/:id` en backend, sin UI) | Filtro; total; Descargar reporte; "Pagar arriendo" → modal pasarela → "Ir a pagar" registra el pago y muestra `alert()` |
| **Mantenimiento** | 4 stats; filtros estado/prioridad; Nuevo mantenimiento (modal con arrendatario); por tarjeta: Iniciar (`.btn-blue`), Completar (`.btn-green`), Cancelar (`.btn-gray`, sin confirmación) | 4 stats propias; filtros; Solicitar mantenimiento (modal) |
| **Usuarios** | Buscar; filtro rol; Nuevo usuario (modal); por tarjeta: Editar (✏️) y Eliminar (🗑️, `confirm()` nativo) | sin acceso |
| **Sidebar** | Colapsar/expandir; links por rol; cerrar sesión (sin confirmación). En móvil: hamburguesa + backdrop | igual, sin Locales/Usuarios |

Requerimientos (`docs/KUVU-Requerimientos.docx`) que piden acciones sin UI hoy:
RF-13 (eliminar locales), RF-14 (eliminar contratos), RF-15 (registrar y eliminar pagos por
el administrador), RF-16 ("imprimir comprobantes", hoy solo reporte general). RNF-01 pide un solo CTA principal por pantalla y RNF-03 desactivar
animaciones con movimiento reducido.

## 3. Problemas de UX concretos

**Semántica visual**
1. Eliminar no se distingue de editar en `usuarios` (rojo solo en hover) y no existe en ninguna
   tabla. `.btn-red` está huérfano.
2. Acciones de estado en mantenimiento: "Cancelar" (destructiva, irreversible en la UI) es gris
   neutro; "Iniciar" usa el mismo azul que "Editar".
3. `.btn-primary` ilegible en Amarilo (≈ 2:1) y degradado con sombra negra fija que no
   depende de la marca.
4. Badges: prioridad "baja" en verde (lee como "bien/completado"); `estado` y `prioridad` se
   muestran crudos (`en_proceso`, `urgente` en minúscula).
5. **Bug** en el dashboard: el badge de tipo de pago usa `'badge--' + tipo.toLowerCase()`
   (`badge--arriendo`, `badge--multa`, `badge--otro`), clases que no existen; los tipos salen
   sin color. `pagos` sí mapea (`getBadgeClass`).
6. Dos sistemas de íconos (emoji y SVG); los emoji cambian de aspecto por sistema operativo y
   no heredan color.

**Flujo y feedback**
7. `confirm()`/`alert()` nativos rompen la estética de marca y no se pueden estilizar ni
   probar con facilidad.
8. **Bug** en contratos: "+ Nuevo contrato" solo hace `mostrarFormulario.set(true)` y el clic
   en el overlay solo oculta el modal, sin `cerrarFormulario()`. Tras editar un contrato y
   cerrar tocando afuera, "Nuevo contrato" abre en modo edición con los datos del anterior.
   Mantenimiento tiene el mismo patrón (el formulario queda con lo escrito).
9. **Bug** en locales: `errorMsg` se setea pero la plantilla no lo muestra; "Guardar" no se
   deshabilita ni cambia a "Guardando…" (sí en las otras pantallas). Guardar sin dirección no
   da ninguna señal.
10. Pago del arrendatario: "Ir a pagar" no tiene estado de carga ni se deshabilita (doble clic
    → doble pago registrado); resultado vía `alert()`.
11. Sin toast/confirmación tras crear, editar, borrar o cambiar estado; errores de cambio de
    estado y carga inicial silenciosos.
12. Sin estado de carga (skeleton o spinner): "No hay registros" aparece mientras carga.
13. Cerrar sesión sin confirmación, a un clic del colapsador.

**Movimiento**
14. Animaciones del modal sin guardia de `prefers-reduced-motion` (RNF-03); sin animación de
    salida; filas/tarjetas aparecen de golpe al filtrar o recargar; sin feedback de presión
    (`:active`) en `.btn-sm`/`.btn-icon`; `transition: all` en varios lugares.
15. Valores de movimiento literales en vez de los tokens de `_motion.scss`.

**Accesibilidad y detalle**
16. Modales sin semántica de diálogo, sin Escape ni manejo de foco; botón cerrar "✕" sin
    `aria-label`; `<label>` de formularios sin `for`/`id`.
17. Hover de filas a `#f8fafc` casi imperceptible; texto de subtítulos y placeholders en
    `#a0aec0`/`#cbd5e0` sobre blanco por debajo de AA.
18. Formatos inconsistentes: el dashboard muestra `fechaPago` cruda (ISO) y `pagos` la formatea
    `dd/mm/aaaa`; contratos muestra fechas crudas.

**Fuera del alcance de UX, para registrar** (candidatos a `secure` o a otro cambio)
- `generarPDF()` arma HTML con `descripcion`, nombre y dirección sin escapar
  (`document.write`): inyección de HTML en la ventana del reporte con datos de la BD.
- La API no autentica: cualquier `DELETE /api/*` funciona sin sesión (RF-20 parcial ya
  registrado en el documento de requerimientos).
- Los `DELETE` del backend devuelven 500 genérico ante violación de FK; el frontend asume que
  todo error es "tiene contratos o pagos asociados".

## 4. Archivos relevantes

| Archivo | Rol |
|---|---|
| `components/shared/shared.styles.scss` | botones, badges, tabla, modal, formularios, cards de mantenimiento, keyframes — punto central del cambio |
| `src/styles.css` | tokens `:root` de la app (`--color-primario`…), layout `.app-layout`/`.main-content`, `:focus-visible` global. Compartido con `sitio-publico-expresivo` |
| `src/styles.scss` | `@use` de `shared.styles` y `styles/motion`. Compartido con `sitio-publico-expresivo` |
| `src/styles/_motion.scss` | tokens de movimiento reutilizables |
| `components/{dashboard,locales,contratos,pagos,mantenimiento,usuarios}/*` | las seis pantallas (plantilla + TS + scss) |
| `components/shared/sidebar/*` | navegación, colapso, menú móvil, logout |
| `components/shared/navbar/*` | sin uso en plantillas (código muerto con spec) |
| `services/data.service.ts` | CRUD; faltan `eliminarContrato` y `eliminarMantenimiento` |
| `services/auth.service.ts` | publica los colores de marca en `:root` |
| `backend/routes/{contratos,pagos,locales,usuarios,mantenimiento}.js` | `DELETE /:id` existe en las cinco; `pagos` no tiene `PUT` |
| `docs/KUVU-Requerimientos.docx` | RF-13…RF-16, RNF-01, RNF-03 (sin trackear, no se stagea) |

## 5. Ambigüedades para el Gate A

1. **Colores semánticos fuera de marca.** ¿Se agrega un set fijo de tokens semánticos
   (`danger` rojo, `success` verde, `warning` ámbar, `info` azul neutro) independiente de la
   empresa, con el primario de marca reservado para el CTA principal? ¿O lo semántico se tiñe
   con la marca? Con Nido Rent (secundario verde) y Balcones (siena) el set fijo tiene que
   diferenciarse a propósito.
2. **Contraste del primario de marca.** ¿Se corrige el texto de `.btn-primary` según la
   luminancia de la marca (texto oscuro sobre Amarilo) o se respeta `color_texto` de la BD
   (`#FFFFFF` en las cuatro)? Lo primero no toca la BD; lo segundo exige actualizar datos, que
   el usuario quiere conservar.
3. **Eliminar faltantes vs solo mejorar existentes.** ¿Se suman los botones de eliminar que
   piden los requerimientos (locales —método ya existe—, contratos —falta método en
   `DataService`—, pagos —método existe—) o el cambio se limita a dar estilo a los que ya
   existen (usuarios)? ¿Eliminar mantenimiento también (no lo pide RF-18; el backend lo tiene)?
4. **Registrar pagos por el administrador (RF-15)** e "imprimir comprobantes" (RF-16): ¿entran
   aquí o quedan como cambio aparte? Son funcionalidad nueva, no UX.
5. **Diálogo propio en vez de `confirm()`/`alert()`.** ¿Un componente de confirmación
   reutilizable (con variante destructiva en rojo, texto que nombra lo que se borra) más un
   toast para éxito/error? ¿O solo confirmación y los avisos siguen inline?
6. **Alcance de animaciones.** Opciones, de menor a mayor: (a) guardia de reduced-motion,
   salida del modal, `:active` en botones y tokens de `_motion.scss`; (b) + entrada escalonada
   de filas/tarjetas y stat cards, skeleton de carga; (c) + conteo animado de cifras del
   dashboard y transición entre pantallas internas. ¿Hasta dónde?
7. **Íconos.** ¿Se reemplazan los emoji de botones (y títulos) por SVG inline como los del
   sidebar, o se mantienen los emoji?
8. **Bugs encontrados** (badge del dashboard, modal de contratos que abre en modo edición,
   locales sin mensaje de error, doble pago sin bloqueo): ¿entran en este cambio?
9. **Accesibilidad de modales** (rol de diálogo, Escape, foco): ¿parte de este cambio?
10. **Slice nuevo.** Propuesta: declarar `app` en `sdd.config.md` (pantallas internas,
    `shared.styles.scss`, sidebar, `data.service.ts` + specs Karma). Si se agregan métodos de
    eliminar que el backend ya tiene, `backend-orden` no se toca. ¿Nombre y alcance?
11. **Rama base y apilamiento.** Hay PRs abiertos (#1–#4 y `sitio-publico-expresivo` en curso
    sobre el mismo árbol, que edita `styles.css`/`styles.scss`). ¿Se parte de `main`, de
    `fix/tema-claro-tokens` o se apila tras `sitio-publico-expresivo`? Si el cambio se limita a
    `shared.styles.scss` y las pantallas, puede evitar los archivos que toca el otro cambio.
12. **Tests.** La app interna no tiene specs. ¿El alcance de tests es solo lo que se toque
    (componente de diálogo, toast, acciones de eliminar, mapeo de badges) o también una base
    mínima por pantalla?
13. **Tema oscuro y `navbar` muerto.** ¿Fuera de alcance? (Propuesta: sí, no-objetivos.)

## 6. Decisiones del Gate A (clarify)

| # | Decisión |
|---|---|
| 1 | Set semántico fijo (`danger` rojo, `success` verde, `warning` ámbar, `info`), independiente de la empresa. El primario de marca queda para el CTA principal |
| 2 | El texto de `.btn-primary` se elige por luminancia de la marca (oscuro en Amarilo). La BD no se toca |
| 3 | Se agregan los eliminar faltantes en locales, contratos, pagos y mantenimiento, sobre los `DELETE` existentes; se suma `eliminarContrato` (y `eliminarMantenimiento`) en `DataService`; confirmación roja |
| 4 | RF-15 (registrar pagos por el admin) y RF-16 (comprobantes) son trabajo futuro, no objetivos |
| 5 | Diálogo de confirmación propio y reutilizable (variante destructiva que nombra lo que se borra) + toasts de éxito/error; reemplazan todo `confirm()`/`alert()` |
| 6 | Animaciones nivel C: reduced-motion, salida del modal, `:active`, tokens de `_motion.scss`, entrada escalonada de filas/tarjetas/indicadores, skeleton de carga, conteo animado de cifras y transición entre pantallas internas |
| 7 | SVG inline en lugar de emoji |
| 8 | Los 4 bugs entran |
| 9 | Accesibilidad de modales entra (rol de diálogo, Escape, foco, `aria-label`, labels asociados) |
| 10 | Se declara el slice `app` en `sdd.config.md` |
| 11 | Rama `feat/app-interna-ux` desde `fix/tema-claro-tokens`, sin tocar `src/styles.css` ni `src/styles.scss` |
| 12 | Tests de todo lo que se toque |
| 13 | No objetivos: tema oscuro de la app interna, navbar muerto, autenticación de la API, escape de `generarPDF()` (anotados para `secure`/otro cambio) |

Modo de ejecución: automático hasta el Gate C.
