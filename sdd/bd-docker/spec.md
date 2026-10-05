# spec — bd-docker

## Requisitos funcionales

### RF1 — El motor de base de datos corre en un contenedor

La base de datos `bd_arrendamientos` se sirve desde un contenedor Docker, no desde una instalación
del sistema operativo.

- **Given** una máquina con Docker y sin XAMPP instalado, **when** se levanta el servicio de base de
  datos con el comando documentado, **then** el motor queda accesible en `127.0.0.1:3306`.
- **Given** el servicio ya levantado, **when** se consulta el puerto `3306`, **then** responde un
  motor MariaDB versión `10.4`.
- **Given** el servicio ya levantado, **when** se consulta su estado de salud, **then** el estado es
  saludable y no se considera listo antes de que acepte conexiones.

### RF2 — El esquema y los datos se reconstruyen desde el repo

El esquema y los datos iniciales existen como archivos versionados, de modo que una instalación
limpia produce la misma base de datos sin necesidad de XAMPP ni de un dump manual.

- **Given** un volumen de datos vacío, **when** el motor arranca, **then** crea automáticamente las
  7 tablas con sus claves primarias, foráneas, índices, ENUMs y valores por defecto, respetando el
  orden de dependencias entre ellas.
- **Given** el esquema recién creado, **when** termina la inicialización, **then** las 7 tablas
  están pobladas con los datos del proyecto.
- **Given** un volumen con datos ya existentes, **when** el motor arranca de nuevo, **then** los
  datos preexistentes no se duplican ni se sobrescriben: la carga inicial ocurre una sola vez.

### RF3 — Las credenciales son reales y no se versionan

- **Given** un archivo `.env` presente en el repo, **when** se levanta el servicio, **then** el motor
  exige usuario y contraseña definidos en ese archivo.
- **Given** el estado de git, **when** se inspecciona el contenido versionado, **then** el archivo
  con credenciales reales no está trackeado.
- **Given** un `.env.example` versionado, **when** alguien configura una máquina nueva siguiendo el
  documento, **then** tiene todas las variables necesarias con valores de ejemplo que no sirven para
  conectar a una instancia real.

### RF4 — El backend se conecta sin cambios de configuración

- **Given** el backend arrancado con su configuración actual, **when** el motor corre en el
  contenedor, **then** el backend se conecta y ejecuta sus consultas sin modificar sus variables de
  entorno.
- **Given** el motor detenido, **when** el backend arranca, **then** el fallo de conexión queda
  visible de forma inequívoca en la salida del proceso, en lugar de quedar reducido a una línea de
  log mientras el proceso sigue en pie fingiendo estar operativo.

### RF5 — Los datos sobreviven a reinicios y hay respaldo

- **Given** el motor con datos escritos, **when** se detiene y vuelve a levantar el servicio, **then**
  los datos siguen presentes.
- **Given** un volumen con datos, **when** se ejecuta el procedimiento de respaldo documentado,
  **then** se produce un archivo `.sql` que permite reconstruir la base de datos completa.
- **Given** ese archivo `.sql`, **when** se ejecuta el procedimiento de restauración documentado en
  un motor vacío, **then** la base de datos queda con el mismo contenido.

### RF6 — El cambio es reversible

- **Given** la migración completada, **when** se decide volver atrás, **then** el dump de la base de
  datos original está disponible en el repo y XAMPP puede restaurarse sin pérdida de información.

### RF7 — La operación está documentada

- **Given** alguien sin contexto previo del proyecto, **when** lee el documento del cambio,
  **then** puede levantar la base de datos, respaldarla, restaurarla y detenerla siguiendo los
  pasos escritos, sin conocimiento no documentado.

## Criterios de aceptación

| # | Criterio | Cómo se verifica |
|---|---|---|
| CA1 | El servicio de base de datos arranca y queda saludable | El estado de salud del servicio reporta saludable |
| CA2 | El esquema se crea completo y en el orden correcto | Las 7 tablas existen con sus claves foráneas e índices; el motor arranca sin errores de dependencia |
| CA3 | Los datos cargan completos | Conteos de filas idénticos a los de origen: empresas 4, rol 2, usuarios 8, local 8, contratoarrendamiento 4, pago_variados 9, mantenimiento 6 |
| CA4 | La carga inicial es idempotente | Un segundo arranque no cambia los conteos ni duplica filas |
| CA5 | La persistencia funciona | Se escribe una fila de prueba, se reinicia el servicio y la fila sigue presente; luego se elimina |
| CA6 | Las credenciales reales no están versionadas | `git status` no reporta el archivo de credenciales; el archivo de ejemplo sí está versionado |
| CA7 | El motor exige contraseña | Una conexión con contraseña incorrecta es rechazada |
| CA8 | El backend se conecta al contenedor | El log del backend reporta conexión exitosa al iniciar y los endpoints responden con datos |
| CA9 | Paridad funcional del backend | Las 7 rutas `/api/*` responden con los mismos datos que antes de la migración |
| CA10 | El fallo de conexión es visible | Con el motor detenido, el arranque del backend deja un error inequívoco en la salida |
| CA11 | El respaldo y la restauración funcionan | El ciclo respaldar → vaciar → restaurar devuelve los mismos conteos |
| CA12 | Una máquina limpia puede repetir el proceso | Siguiendo únicamente lo documentado, sin XAMPP, el servicio llega a saludable con el esquema y los datos |

## No-objetivos y edge cases excluidos

- **No se prueba una instalación desde cero en otra máquina.** El criterio CA12 se valida en esta
  máquina simulando ausencia de XAMPP, no en un equipo nuevo.
- **No se prueban fallos de hardware, disco lleno ni corrupción del volumen.** El objetivo es que un
  volumen sano sobreviva a reinicios, no a fallas del medio físico.
- **No se valida el dump más allá de una restauración completa y exitosa.** No se somete a pruebas de
  corrupción ni a verificación de checksums.

- **No se migra el motor a MySQL de Oracle.** MariaDB 10.4 es el destino final.
- **No se agregan servicios al Compose** más allá del motor: ni backend, ni frontend, ni UI de
  administración.
- **No se endurece la API**: CORS abierto, ausencia de rate limiting y login por documento quedan
  como están.
- **No se redefine el esquema**: sin migraciones de columnas, sin normalización, sin índices nuevos.
- **No se implementa `dotenv`** ni ninguna dependencia nueva en el backend.
- **No se automatiza la parada de XAMPP.** Es un paso manual del usuario.
- **No se cubre el escenario de dos motores corriendo a la vez** salvo durante la validación previa
  en puerto alternativo, que es una etapa de verificación y no un modo de operación soportado.
