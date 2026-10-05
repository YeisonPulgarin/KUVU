## Seguridad — bd-docker

### Modelo de amenazas (resumen)

- **Activos / datos sensibles:** `bd_arrendamientos` con 7 tablas. Contiene PII de
  contactos (nombre, documento, teléfono, correo de `usuarios`) y datos de líneas
  contractuales (empresas, contratos, pagos, mantenimiento). Las credenciales de MySQL
  son el activo más crítico del cambio.
- **Fronteras de confianza y puntos de entrada:**
  1. **LAN → host:3306.** El puerto publicado es el punto de entrada principal. Cualquier
     máquina en la red local alcanzaba el servidor MariaDB.
  2. **Repositorio → historial de git.** Un secreto en un archivo versionable se propaga a
     todo el que clone, y sobrevive al commit que lo borra.
  3. **Proceso backend → base.** El backend usa `kuvu_app`, no `root`.
  4. **Contenedor → sistema.** Superficie del contenedor (privilegios, mounts, red).
- **Contexto de despliegue:** entorno de desarrollo local, no internet-facing. Sin
  multi-tenant. El host está en una red universitaria compartida (`172.30.64.1`), lo que
  hace la exposición de red un riesgo real y no teórico.
- **No modelado (fuera de alcance por la spec):** autorización de la API, CORS, y
  autenticación de usuarios. Son preexistentes y la `spec` los declara fuera de alcance.

### Hallazgos por severidad

#### H1 — Crítico: base de datos y `root` accesibles desde toda la red local

- **Severidad:** Crítico (confidencialidad + integridad). Explotabilidad: trivial — solo
  hace falta estar en la misma LAN y conocer el puerto. Alcanzabilidad: confirmada.
- **Categoría:** CWE-668 / OWASP A01 — exposición de servicio en red no autorizada.
  Se combina con CWE-284 (root alcanzable desde cualquier host).
- **Descripción:** el compose publicaba `${DB_PORT}:3306`, que Docker traduce a
  `0.0.0.0:3306`. Además, la imagen oficial de MariaDB crea un usuario `root@'%'` cuando
  `MARIADB_ROOT_HOST` no está definido, lo que habilita el login de root desde cualquier
  dirección IP con la contraseña de root. Se verificó conectividad real de `root` por TCP
  desde una IP no-loopback. Esta exposición no existía con XAMPP: `mysqld` escuchaba solo en
  local.
- **Estado:** Corregido
- **Fix aplicado y capa:** infraestructura (`docker-compose.yml`) + estado de la base.
  1. Puerto publicado con loopback explícito: `127.0.0.1:${DB_PORT:-3306}:3306`.
  2. `MARIADB_ROOT_HOST: localhost` para que una reconstrucción de volumen no reintroduzca
     `root@'%'`.
  3. `DROP USER 'root'@'%'` sobre el volumen existente, ya que la variable de entorno solo
     aplica a la creación inicial del volumen.
- **Verificación:**
  - `netstat` muestra únicamente `127.0.0.1:3306` en LISTENING; desapareció `0.0.0.0:3306`.
  - `SELECT user,host FROM mysql.user WHERE user='root'` devuelve solo `root@localhost`.
  - Conexión de `root` por TCP a `172.17.0.1` falla (timeout), confirmando que ya no es
    alcanzable desde la red.
  - `checkConnection()` del backend sigue resolviendo OK por loopback.
  - Conteo de las 7 tablas sin cambios: 4/2/8/8/4/9/6.
- **¿Cambia comportamiento observable?** no → no toca la `spec`. El backend y los clientes
  externos de administración se conectan por `localhost`, que sigue funcionando igual.

#### H2 — Alto: contraseña de root escrita en un artifact versionado

- **Severidad:** Alto (confidencialidad). Explotabilidad: requiere acceso al repositorio.
  Alcanzabilidad: confirmada — `sdd/` no está en `.gitignore`, por lo que el artifact se
  versiona.
- **Categoría:** CWE-798 / CWE-259 — credencial hardcodeada.
- **Descripción:** el `apply-progress` documentaba `DB_ROOT_PASSWORD` y `DB_APP_PASSWORD`
  con sus valores literales. Los artifacts del workflow se commitean al repositorio, así que
  los valores habrían quedado disponibles para cualquiera con acceso al repo o a un clon
  histórico. Se Compounds con H1: mientras ambos existían, la credencial de root de una base
  expuesta a la red estaba a un commit de distancia.
- **Estado:** Corregido
- **Fix aplicado y capa:** artifact. Reemplazados los literales por referencias a `.env` y
  `backend/.env`, con nota de que los valores no se registran porque `sdd/` sí se versiona.
- **Verificación:** escaneo de ambos valores sobre los 15 archivos del cambio
  (compose, `.env.example`, los dos SQL, `db.js`, `server.js`, `db.test.js`, `package.json`
  y los 7 artifacts de `sdd/bd-docker/`): **0 coincidencias**. `.env` y `backend/.env`
  siguen conteniendo los valores y ambos están correctamente ignorados
  (`.gitignore:2` y `backend/.gitignore:2`).
- **¿Cambia comportamiento observable?** no.

### Acciones fuera del código (obligatorio marcar)

- **Secretos a ROTAR: ninguna rotación es obligatoria.** Las credenciales nunca entraron a un
  commit: `git log --all -S <password>` no devuelve coincidencias para ninguno de los dos
  valores, y el `.env` histórico (`2c576fc`, borrado en ese commit) contenía
  `DB_PASSWORD=` vacío. Como tampoco se publicaron fuera de la máquina, borrarlos del
  artifact es suficiente.
  - Si en algún momento estas credenciales se comparten con otra persona o se suben a un
    repositorio remoto, la rotación pasa a ser obligatoria: actualizar `DB_ROOT_PASSWORD` /
    `DB_APP_PASSWORD` en `.env` y `backend/.env`, ejecutar
    `ALTER USER 'kuvu_app'@'%' IDENTIFIED BY '...'` y `ALTER USER 'root'@'localhost' IDENTIFIED BY '...'`,
    y reiniciar el backend. Cambiar solo el `.env` no alcanza: el volumen conserva el password
    original.
- **Dependencias a actualizar (SCA):** ninguna. No se agregó ninguna dependencia; el backend
  sigue usando `mysql2`, `express` y `cors` en las versiones preexistentes.
- **Configuración / infra a endurecer:** ninguna adicional pendiente. `privileged: false`,
  `CapAdd: []`, sin `docker.sock`, sin `network_mode: host`, y el bind mount de `db/init` es
  de solo lectura (`RW=false`). El `root` de la base ya no existe como usuario remoto.

### Riesgo residual aceptado

- **API con CORS abierto (`app.use(cors())` sin origen restringido).** Cualquier sitio web
  puede llamar a la API desde el navegador de un usuario. Aceptado: es preexistente y la
  `spec` declara la autorización y la autenticación fuera de alcance. Riesgo real si algún
  día la API se expone fuera de la máquina de desarrollo. Revisar cuando exista autenticación
  que proteger.
- **Login por documento sin contraseña.** `usuarios` no tiene columna de password, así que
  cualquier documento válido entra. Aceptado: preexistente, fuera de alcance de este cambio.
  Es el hallazgo de seguridad más grande pendiente del proyecto a nivel de producto, con
  independencia de la migración.
- **Puerto 3306 abierto en loopback.** Cualquier proceso local puede intentar conectar. Aceptado:
  es el tradeoff de permitir que el usuario administre la base desde un cliente externo, un
  requisito explícito de la `spec`. El residual es acotado a procesos de la propia máquina.

### Alcance de la búsqueda

- **Buscado:** superficie Docker (compose, `.env`, mounts, red, privilegios, healthcheck);
  credenciales en archivos del cambio y en el historial completo de git; permisos efectivos
  de los usuarios de MariaDB; alcanzabilidad real de la base por red y por loopback;
  integridad de los datos tras el cambio.
- **Herramientas:** `netstat`, `docker inspect`, `docker exec` con consultas a
  `mysql.user` e `information_schema`, `git check-ignore`, `git log --all -S` (secret
  scanning sobre el historial) y escaneo por regex sobre los archivos del cambio. Verificación
  negativa explícita: se intentó la conexión que el hallazgo describía, tanto antes del fix
  (con éxito, confirmando alcance) como después (con fallo, confirmando el cierre).
- **Revisión manual:** modelo de autenticación y autorización del backend, y configuración de
  CORS. Se determinaron preexistentes y fuera de alcance por la `spec`.
- **Fuera de alcance:** superficie de la API (inyección SQL, IDOR, validación de input) más
  allá de que `db.js` use consultas parametrizadas de `mysql2`; dependencias de npm de
  terceros sin auditoría de versiones; configuración de TLS para la conexión MySQL, que no
  aplica a un enlace por loopback.

**Nota sobre el alcance del scan:** un escaneo limpio no prueba ausencia de
vulnerabilidades. Lo verificado a mano es que los dos hallazgos descritos estaban presentes y
que las correcciones los cierran; el resto del modelo de amenazas no fue ejercitado de forma
exhaustiva.
