# propose — auth-contrasenas

## Intent

El acceso de KUVU depende de dos datos que no son secretos (correo y documento). Este cambio
agrega una contraseña guardada como hash, con política de seguridad, bloqueo por intentos y
ciclo de vida (temporal, cambio obligatorio, cambio voluntario y restablecimiento por el
administrador). Responde a la observación de la docente: "Guardar las contraseñas en hash y
aplicar las políticas de seguridad de contraseñas".

## Alcance

- **Login con tres datos**: correo + documento + contraseña, dentro de la empresa elegida en
  `/acceder`. El documento sigue siendo dato del usuario y factor de acceso.
- **Hash**: la contraseña se guarda solo como hash bcrypt (`bcryptjs`). Ninguna respuesta de la
  API devuelve el hash.
- **Política**: 8–64 caracteres; mayúscula, minúscula, número y símbolo; lista negra de
  contraseñas comunes; no puede contener el correo ni el documento. Se valida en el backend
  (autoridad) y se refleja en el frontend (ayuda en vivo).
- **Migración no destructiva**: script SQL idempotente que solo agrega columnas a `usuarios`,
  más un paso que asigna a cada usuario existente una contraseña temporal igual a su documento
  (hasheada) con cambio obligatorio. Antes de aplicarla sobre `kuvu_db`, respaldo completo. El
  esquema y el seed de instalación nueva quedan alineados.
- **Cambio obligatorio en el primer ingreso**: un usuario con contraseña temporal no entra a la
  app hasta definir una contraseña que cumpla la política.
- **Cambiar mi contraseña**: el usuario autenticado cambia la suya indicando la actual.
- **Administración**: al crear un usuario, el administrador escribe una contraseña temporal; el
  administrador puede restablecer la contraseña de un usuario de su empresa a una temporal.
  Ambas dejan el cambio obligatorio activo.
- **Bloqueo**: 5 intentos fallidos seguidos sobre una cuenta la bloquean 15 minutos. El mensaje
  de error es genérico y no revela qué dato falló ni si la cuenta existe.
- **Logs**: los eventos de autenticación se registran como JSON estructurado, sin datos
  sensibles.
- Tests de backend (`node --test`) y frontend (Karma) para todo lo anterior; documentación del
  cambio.

## No-objetivos

- Sesión o token (JWT) en la API, vencimiento de sesión y aislamiento por empresa en el
  servidor (RF-09/RF-20). La API sigue sin verificar identidad en sus demás rutas; queda como
  limitación conocida.
- Restringir CORS (RNF-13).
- Recuperación de contraseña por correo (no hay servicio de correo). "¿Olvidaste tu
  contraseña?" indica que el administrador la restablece.
- Expiración periódica e historial de contraseñas.
- Cambios de datos existentes más allá de agregar columnas y poblarlas: no se borran, renombran
  ni modifican columnas ni filas existentes; no se agregan restricciones `UNIQUE`/`NOT NULL`
  sobre `correo`.
- Logging estructurado del resto del backend (solo los eventos de autenticación).
- "Recordarme" sigue decorativo.

## Approach

1. **Backend primero**: un módulo de contraseñas (hash, verificación, política) y las rutas de
   auth y usuarios ajustadas: login con verificación de hash y bloqueo, cambio de contraseña,
   restablecimiento por administrador y creación con temporal. Las consultas de usuarios pasan
   a columnas explícitas para que el hash nunca salga.
2. **Autorización sin sesión**: como la API no tiene sesión, cada operación sobre contraseñas
   se autoriza con las credenciales completas de quien la ejecuta (el usuario para su cambio, el
   administrador para el restablecimiento). Así el cambio no abre una vía nueva para tomar
   cuentas.
3. **Migración en dos pasos**: SQL idempotente de columnas (válido para la BD actual y para
   instalaciones nuevas) y un script Node que asigna las temporales solo a usuarios sin hash.
   Ambos se pueden re-ejecutar sin efecto. Se aplican sobre `kuvu_db` después del respaldo y
   con autorización explícita del usuario.
4. **Frontend**: `/login` con el campo de contraseña y los nuevos mensajes; pantalla de cambio
   de contraseña (obligatorio y voluntario); en la pantalla de usuarios, contraseña temporal al
   crear y acción de restablecer, apilado sobre la rama de `app-interna-ux`.
