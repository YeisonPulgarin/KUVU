# spec — auth-contrasenas

Fuentes: `propose.md`, `explore.md` → "Decisiones de clarify". Términos:

- **Cuenta**: fila de `usuarios` identificada por correo dentro de una empresa.
- **Credenciales completas**: correo + documento + contraseña + empresa.
- **Contraseña temporal**: la que asigna la migración o un administrador; obliga a cambiarla.
- **Mensaje genérico de acceso**: un único texto para todo rechazo de credenciales, p. ej.
  "Los datos de acceso no son válidos o la cuenta está bloqueada temporalmente. Revisa e
  intenta de nuevo en unos minutos." No dice qué dato falló ni si la cuenta existe.

## Requisitos funcionales

### RF-1 Política de contraseñas

Una contraseña nueva (definida por el usuario o escrita por un administrador) es válida solo si:

1. tiene entre 8 y 64 caracteres y no supera 72 bytes en UTF-8;
2. contiene al menos una mayúscula, una minúscula, un número y un símbolo (carácter que no es
   letra ni número; el espacio cuenta como símbolo);
3. no está en la lista negra de contraseñas comunes (comparación sin distinguir mayúsculas). La
   lista incluye variantes que cumplen la composición (`Password1!`, `Qwerty123*`, `Kuvu2026!`,
   etc.);
4. no contiene, sin distinguir mayúsculas, el correo del usuario, la parte local del correo
   (antes de `@`) cuando tiene 4 o más caracteres, ni el documento;
5. en un cambio, es distinta de la contraseña actual.

Cuando no es válida, el backend responde 400 con la lista de reglas incumplidas (códigos
estables y mensajes en español). El frontend muestra las reglas y su estado mientras se
escribe; el backend es la autoridad.

### RF-2 Almacenamiento

- La contraseña se guarda solo como hash bcrypt con sal propia (costo ≥ 10). Dos usuarios con la
  misma contraseña tienen hashes distintos.
- Ninguna respuesta de la API (login, listado, detalle, creación, cambio, restablecimiento)
  incluye el hash ni campos de bloqueo internos.
- Ningún log incluye contraseñas, hashes, documento ni correo.

### RF-3 Login

`POST /api/auth/login` recibe correo, documento, contraseña y empresa.

- Falta algún dato → 400.
- Credenciales completas correctas, cuenta no bloqueada, sin cambio obligatorio → 200 con el
  mismo contenido de hoy (`usuario` sin hash, `empresa`). El contador de fallos vuelve a 0.
- Credenciales correctas con contraseña temporal → 200 que indica que se requiere cambio de
  contraseña, **sin** datos de `usuario` ni `empresa`. No cuenta como fallo.
- Cualquier dato incorrecto, cuenta inexistente, empresa inactiva o cuenta bloqueada → 401 con
  el mensaje genérico de acceso.
- Una cuenta sin hash (no migrada) no puede entrar: 401 con el mensaje genérico.

### RF-4 Bloqueo por intentos

- Cada rechazo de login, de cambio de contraseña o de verificación de las credenciales de un
  administrador (RF-7/RF-8) sobre una cuenta existente (correo + empresa) suma un fallo, sea
  cual sea el dato incorrecto.
- Al llegar a 5 fallos seguidos, la cuenta queda bloqueada 15 minutos. Durante el bloqueo, todo
  intento se rechaza con el mensaje genérico, aunque las credenciales sean correctas, y no
  extiende el bloqueo.
- Al vencer el bloqueo, la cuenta admite intentos con el contador en 0.
- Un acceso o cambio exitoso deja el contador en 0.
- El restablecimiento por administrador desbloquea la cuenta y deja el contador en 0.

### RF-5 Cambio obligatorio en el primer ingreso

- Si el login indica cambio requerido, el frontend lleva al usuario a la pantalla de cambio de
  contraseña sin entrar a la app; no se guarda sesión en el navegador.
- El usuario escribe la contraseña nueva dos veces. Al confirmarse el cambio, el usuario queda
  autenticado como en un login normal y va al dashboard.
- Si abandona la pantalla, no queda autenticado; la próxima vez vuelve a pasar por el cambio.

### RF-6 Cambiar mi contraseña

- `POST /api/auth/cambiar-password` recibe credenciales completas (con la contraseña actual) y
  la contraseña nueva.
- Credenciales incorrectas o cuenta bloqueada → 401 genérico (y suma fallo según RF-4).
- Contraseña nueva inválida (RF-1) → 400 con las reglas incumplidas; no suma fallo.
- Éxito → 200 con el contenido de un login exitoso; la cuenta queda sin cambio obligatorio.
- Desde la app interna, un usuario autenticado accede a "Cambiar contraseña" (desde el menú de
  usuario / sidebar). El frontend pide contraseña actual, nueva y confirmación; correo, documento
  y empresa salen de la sesión.

### RF-7 Creación de usuarios con contraseña temporal

- `POST /api/usuarios` exige, además de los datos actuales, una contraseña temporal que cumple
  RF-1 (respecto del correo y documento del usuario nuevo) y las credenciales completas del
  administrador que crea.
- El administrador debe existir, tener rol Administrador, pertenecer a la misma empresa del
  usuario nuevo, no estar bloqueado y no tener cambio obligatorio pendiente. Si no → 401
  genérico (credenciales) o 403 (rol/empresa).
- El usuario creado queda con cambio obligatorio.
- En la pantalla de usuarios, el formulario de creación pide la contraseña temporal (con ayuda
  de política) y la contraseña del administrador para confirmar; el formulario de edición no
  muestra campos de contraseña.

### RF-8 Restablecimiento por administrador

- `POST /api/usuarios/:id/restablecer-password` recibe una contraseña temporal (RF-1 respecto del
  usuario destino) y las credenciales completas del administrador.
- Mismas reglas de autorización que RF-7; el usuario destino debe ser de la misma empresa. Un
  administrador no se restablece a sí mismo (400: usa "Cambiar contraseña"). Usuario
  inexistente → 404.
- Éxito → 200; el usuario destino queda con esa temporal, cambio obligatorio, desbloqueado y con
  contador en 0.
- En la pantalla de usuarios, cada fila tiene la acción "Restablecer contraseña" que pide la
  temporal y la contraseña del administrador.

### RF-9 Edición sin contraseña

`PUT /api/usuarios/:id` no lee ni modifica la contraseña ni el estado de bloqueo, aunque el
cuerpo traiga esos campos. `GET /api/usuarios` y `GET /api/usuarios/:id` devuelven las columnas
de hoy más, como mucho, la marca de cambio obligatorio pendiente.

### RF-10 Pantalla de login

- `/login` muestra correo, documento y contraseña (campo oculto, con botón mostrar/ocultar y
  `autocomplete="current-password"`).
- Si falta un dato: "Ingresa tu correo, número de documento y contraseña."
- 401 → mensaje genérico de acceso. Otros errores → mensaje de conexión de hoy.
- "¿Olvidaste tu contraseña?" es funcional: muestra que el administrador de la
  inmobiliaria puede restablecerla.

### RF-11 Migración no destructiva

- Un script SQL agrega a `usuarios` las columnas necesarias (hash, cambio obligatorio,
  contador de fallos, fin de bloqueo) sin modificar ni borrar columnas, filas ni restricciones
  existentes. Ejecutarlo dos veces no da error ni cambia nada la segunda vez.
- Un script de bootstrap asigna a cada usuario **sin hash** una contraseña temporal igual a su
  documento (hasheada) con cambio obligatorio. A los usuarios que ya tienen hash no los toca.
  Ejecutarlo dos veces no cambia nada la segunda vez. Informa cuántos usuarios actualizó, sin
  imprimir documentos ni contraseñas.
- La temporal de la migración está exenta de RF-1 (es la decisión del usuario); cualquier
  contraseña definida después la cumple.
- Una instalación nueva (`docker compose up` con volumen vacío) queda con las columnas y con los
  usuarios demo en el mismo estado (temporal = documento, cambio obligatorio).
- La guía de aplicación exige un respaldo completo de `kuvu_db` (dump) antes de ejecutar la
  migración y describe cómo restaurarlo.

### RF-12 Logs de autenticación

El backend emite una línea JSON por evento: login exitoso, login rechazado (con motivo interno:
datos faltantes, credenciales, bloqueada, sin hash), cuenta bloqueada, cambio requerido,
contraseña cambiada, contraseña restablecida, usuario creado. Campos: marca de tiempo, nivel,
evento, `empresa_id`, `idUsuario` cuando se conoce (del actor y del destino). Niveles: INFO para
éxitos, WARN para rechazos y bloqueos, ERROR para fallos internos.

## Criterios de aceptación

- **CA-1** Política: tests unitarios cubren cada regla de RF-1 (límites 7/8/64/65 caracteres,
  72 bytes, cada clase faltante, lista negra con mayúsculas variadas, correo/parte local/
  documento contenidos, igual a la actual) y una contraseña válida.
- **CA-2** Hash: test verifica que el valor guardado no es la contraseña, que verifica contra la
  correcta y no contra otra, y que dos hashes de la misma contraseña difieren.
- **CA-3** Ninguna respuesta de login, `GET /api/usuarios`, `GET /api/usuarios/:id`,
  `POST /api/usuarios`, cambio o restablecimiento contiene el hash ni campos de bloqueo (tests de
  ruta con doble de `db`); las consultas de usuarios no usan `SELECT u.*`.
- **CA-4** Login: tests de 400, 200 normal, 200 con cambio requerido sin `usuario`, 401 por cada
  dato incorrecto, cuenta inexistente, sin hash y bloqueada; todos los 401 con el mismo cuerpo.
- **CA-5** Bloqueo: 5 fallos → bloqueo; credenciales correctas durante el bloqueo → 401; vencido
  el plazo → acceso; éxito resetea contador (reloj controlable en tests).
- **CA-6** Cambio de contraseña: tests de 401, 400 por política, 200 que limpia el cambio
  obligatorio y devuelve el contenido del login.
- **CA-7** Creación y restablecimiento: tests de 201/200, 401 sin credenciales de admin válidas,
  403 por rol arrendatario o por otra empresa, 400 por política, 404 por destino inexistente,
  400 por auto-restablecimiento; el usuario resultante queda con cambio obligatorio.
- **CA-8** `PUT /api/usuarios/:id` ignora campos de contraseña y bloqueo (test sobre el SQL y
  los parámetros enviados).
- **CA-9** Frontend: specs Karma de `/login` (tres campos, mensajes, redirección a cambio
  requerido sin sesión guardada), de la pantalla de cambio (validación en vivo, confirmación,
  éxito autentica y navega) y de `AuthService` (nuevas firmas; no persiste sesión con cambio
  requerido).
- **CA-10** Frontend de usuarios: specs del formulario de creación (temporal + confirmación del
  admin), de "Restablecer contraseña" y de que la edición no envía contraseña.
- **CA-11** Migración: ejecutada dos veces sobre una BD de prueba con datos (nunca sobre
  `kuvu_db` sin respaldo y autorización), la segunda corrida no cambia nada; columnas y filas
  previas intactas (conteo y valores de columnas existentes iguales); cada usuario migrado entra
  con correo + documento + documento como contraseña y se le exige el cambio.
- **CA-12** Logs: test verifica que los eventos se emiten como JSON con los campos de RF-12 y
  que ninguna línea contiene la contraseña, el documento ni el correo usados en el test.
- **CA-13** Suites completas en verde: `npm test` (backend) y `ng test` (frontend).

## No-objetivos y edge cases excluidos

- Sin sesión/JWT: `PUT` y `DELETE` de usuarios y las demás rutas siguen sin verificar identidad
  (limitación conocida, documentada). La exigencia de credenciales del administrador aplica solo
  a crear usuarios y restablecer contraseñas.
- El bloqueo por cuenta permite que un tercero que conozca un correo bloquee esa cuenta 15
  minutos (denegación de servicio acotada). No hay límite por IP.
- Si dos filas comparten correo en la misma empresa (el esquema lo permite; hoy no ocurre), el
  fallo cuenta para todas ellas y el login exige además el documento para distinguirlas.
- Sin recuperación por correo, expiración periódica ni historial de contraseñas.
- Sin cambios a `UNIQUE`/`NOT NULL` de `correo`.
- La lista negra es embebida y acotada (no consulta servicios externos como HIBP).
- Mientras un usuario no complete el cambio obligatorio, su temporal (el documento) sigue siendo
  válida para iniciar el cambio.
