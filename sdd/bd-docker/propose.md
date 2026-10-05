# propose — bd-docker

## Intent

Sacar la base de datos de KUVU del data dir de XAMPP y correrla en un contenedor Docker, de modo
que el motor de base de datos deje de ser una instalación del sistema operativo y pase a ser algo
que se levanta con un comando, se versiona junto al código y se puede replicar en otra máquina.

## Decisiones tomadas en el Gate A

| Decisión | Valor | Por qué |
|---|---|---|
| Motor destino | `mariadb:10.4` | Reproduce el servidor actual (MariaDB 10.4.32) sin fricción de DDL, ENUMs ni defaults |
| Puerto en el host | `3306` | Se para XAMPP y el contenedor toma el puerto; el backend conserva sus defaults |
| Alcance de Compose | Solo la base de datos | El backend sigue con `node`/`nodemon` y el frontend con `ng serve`, con recarga en caliente |
| Esquema y credenciales | Dump versionado en el repo + `.env` con credenciales | `docker compose up` reconstruye la BD desde cero y el proyecto queda reproducible |

## Alcance

### Dentro

1. **`docker-compose.yml`** en la raíz, con un servicio `db` que levanta `mariadb:10.4`, publica
   `3306` en el host, monta un    volumen nombrado para la persistencia y declara healthcheck para que el arranque sea
   verificable en lugar de depender de timing.
2. **Esquema y datos versionados** en `db/init/`, generados desde el servidor actual: DDL de las 7
   tablas en el orden correcto de inserción y un seed idempotente con los datos existentes (4
   empresas, 2 roles, 8 usuarios, 8 locales, 4 contratos, 8 pagos, 6 mantenimientos). Se ejecuta
   automáticamente solo la primera vez, cuando el volumen está vacío.
3. **`.env` + `.env.example`** con credenciales reales y valores por defecto documentados. El
   `.env` queda fuera de git; el `.env.example` dentro.
4. **Corrección de `.gitignore`** para que `.env` no se versione (hoy `backend/.gitignore:1` solo
   ignora `node_modules/`).
5. **Migración efectiva de los datos**: dump desde MariaDB de XAMPP, restauración en el contenedor y
   verificación de igualdad tabla por tabla (conteo de filas) antes de declarar cerrada la BD
   antigua.
6. **Scripts de operación** documentados para el ciclo de vida: levantar, detener, respaldar y
   restaurar. El respaldo es lo que permite deshacer esto sin volver a XAMPP.7. **Ajuste menor en `backend/db.js`** para leer configuración de forma explícita y para que un
   fallo de conexión inicial sea visible en lugar de quedar reducido a un log y dejar la app en un
   estado ambiguo. Sin cambiar el contrato de las variables de entorno.

### Fuera del alcance

- **No se agrega UI de administración al Compose.** El usuario administra la base de datos desde una
  aplicación externa que se conecta por TCP a `127.0.0.1:3306`. Como el contenedor toma ese mismo
  puerto, esas herramientas siguen funcionando sin cambios. Verificado que phpMyAdmin no está
  accesible en la instalación actual, así que no hay nada que reponer.

## No-objetivos

- **No se migra el motor a MySQL de Oracle.** Se mantiene MariaDB 10.4 para no introducir
  incompatibilidades en un cambio cuyo objetivo es la infraestructura, no el motor.
- **No se dockeriza el backend ni el frontend.** El Compose contiene únicamente el motor de base de
  datos.
- **No se rediseña el esquema.** No hay migraciones de columnas, ni normalización, ni cambios de
  tipos. El esquema se traslada tal cual.
- **No se agregan índices, índices compuestos ni ajustes de performance.** No es el problema que se
  está resolviendo.
- **No se implementa autenticación real en la tabla `usuarios`.** El login por documento es una
  decisión de producto de otro cambio.
- **No se endurece la API más allá del scope de credenciales.** CORS abierto y ausencia de rate
  limiting quedan como están.
- **No se desinstala XAMPP del sistema.** Este cambio lo deja de usar; su eliminación es una tarea
  manual del usuario fuera del repo.
- **No se introduce `dotenv`** como dependencia del backend. Las variables llegan por el entorno de
  la shell y por el `env_file` del Compose.

## Approach a alto nivel

El riesgo de esta migración no está en los datos —son 40 filas— sino en dos puntos concretos: que el
puerto `3306` quede libre antes de que el contenedor lo pida, y que el esquema sobreviva intacto al
cambio de entorno. La estrategia atiende ambos de forma explícita.

**Primero, capturar antes de tocar nada.** Se genera el dump desde el MariaDB de XAMPP con
`mysqldump` y se guarda versionado. A partir de ese momento la base de datos es reconstruible y el
resto del proceso es reversible. Ningún paso posterior elimina nada sin que este exista.

**Segundo, preparar el destino sin tocar el origen.** Se escriben el Compose, el esquema, el seed y
el `.env`, y se levantan en un puerto alternativo para validar que la imagen arranca, que el esquema
se crea completo y que el seed corre sin errores —con XAMPP todavía sirviendo la base de datos real.
Esta validación en paralelo es la que permite no working sin red de seguridad.

**Tercero, cortar y conectar.** Se para XAMPP, se levanta el contenedor en `3306` y se verifica que
el backend —sin cambios de configuración— se conecta y responde igual que antes contra la base de
datos nueva. Esa verificación de paridad funcional es el criterio real de éxito.

**Cuarto, poder volver atrás.** XAMPP queda detenido pero intacto, y el dump queda versionado, así
que el retroceso es una cuestión de minutos.

## Criterio de éxito

El proyecto se levanta en una máquina limpia siguiendo únicamente lo documentado en el repo, sin
XAMPP instalado, y el backend responde igual que antes: mismas rutas, mismos datos.
