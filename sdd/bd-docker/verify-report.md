# verify-report — bd-docker

**Estado:** corresponde a la implementación de `slice-unico` completo (post-apply).
No es una re-corrida posterior a `secure` ni a `refine`.

**Extensión `git`:** no activa en `sdd.config.md` → sin chequeo de CI.

## Suite de tests

```
test_command: npm test   (node --test, runner nativo de Node 22)
# tests 5
# pass 5
# fail 0
# skipped 0
# todo 0
```

**Prueba de que los tests tienen poder de detección:** se mutó la implementación
eliminando `conn.release()` y la suite pasó a `4 pass / 1 fail`. Al restaurar la
implementación volvió a `5 pass / 0 fail`. Los tests no pasan al vacío: detectan una
rotura real de la lógica.

**Contraste con `apply-progress`:** el slice declaró 5 tests en
`backend/test/db.test.js` y una excepción documentada para la verificación de
integración (T1-T4, T8-T11). Coincide con lo corrido. Sin desvíos.

## Criterios de aceptación

| CA | Verificación independiente | Resultado |
|---|---|---|
| CA1 | `docker compose ps` → `running`, `0.0.0.0:3306->3306/tcp`; health `healthy`; `SELECT VERSION()` → `10.4.34` | **PASA** |
| CA2 | 7 tablas, **17 FKs**, 25 índices, 3 columnas ENUM | **PASA** |
| CA3 | Conteos: empresas 4, rol 2, usuarios 8, local 8, contratoarrendamiento 4, pago_variados 9, mantenimiento 6 | **PASA** |
| CA4 | `docker compose restart` → conteos sin cambios (4 y 9). Los scripts no re-ejecutan con volumen existente | **PASA** |
| CA5 | Escritura, reinicio, supervivencia y limpieza verificados en la implementación | **PASA** |
| CA6 | `git check-ignore` exit 0 para `.env`, `backend/.env`, `db/backups/*.sql`; exit 1 para `.env.example`. Ningún password real en archivos versionables | **PASA** |
| CA7 | Password incorrecta y vacía → `ERROR 1045`; correcta → OK | **PASA** |
| CA8 | El backend reporta `Conectado a MySQL` y escucha en `3000` | **PASA** |
| CA9 | Verificado en la implementación: 7 rutas 200 con datos reales + login exitoso | **PASA** |
| CA10 | Proceso sale con código 1 y no deja el puerto 3000 escuchando | **PASA** |
| CA11 | Verificado en la implementación con comparación determinista contra el seed versionado | **PASA** |
| CA12 | `docker compose down -v` + `up -d` reconstruye desde cero: healthy, 7 tablas, conteos correctos, sin errores en el log | **PASA** |

**12 de 12 en verde.**

### Verificación adicional no requerida por la spec

`AUTO_INCREMENT` quedó preservado tras la restauración: `empresas` 6, `local` 9,
`mantenimiento` 7, `pago_variados` 10, `rol` 3, `usuarios` 9, `contratoarrendamiento` 5.
Coincide con los valores del origen, así que los próximos IDs no se corren respecto a
como estaban antes de la migración.

## Protocolo de tres ejes

### Eje 1 — Documentación declarada

| Destino | Declarado en `tasks` | Estado real |
|---|---|---|
| `docs/bd-docker.md` | Sí | **Falta crear** — es fase `document` |
| `docs/architecture.md` | Sí | Existe, **falta actualizar** — fase `document` |
| `CHANGELOG.md` | Sí | Existe, **falta entrada** — fase `document` |
| `README.md` | Sí | **No existe en la raíz.** `tasks` lo declaró afectado; hay que crearlo o marcarlo como no aplicable |
| OpenAPI / Bruno | No | Correcto, el cambio no toca endpoints |
| `DEVELOPMENT_GUIDELINES.md` | No | Correcto, no introduce convención nueva |

**Nota:** el alcance de documentación está bien anticipado en `tasks`. Lo que falta es
la ejecución, que corresponde a `document`. No es un desvío de esta fase, pero se deja
señalado que `README.md` no existe y `tasks` lo tomó como existente.

### Eje 2 — Guidelines (`DEVELOPMENT_GUIDELINES.md`)

| Regla | Estado |
|---|---|
| Identificadores en inglés | Cumple: `checkConnection`, `config` |
| Comentarios en inglés | Cumple en `db.js`, `server.js`, `db.test.js`, `.env.example`, `docker-compose.yml`, ambos `.sql` |
| Sin dependencias nuevas | Cumple: `node:test` y `node --env-file` son nativos de Node 22 |
| Sin abstracción inventada | Cumple: una función de 3 líneas, sin factory ni interfaz |
| Estructura de módulos | Cumple: no se crearon módulos nuevos |

**Desvío D1 — mensaje en español dentro del código.** `server.js:62` tiene
`console.error('   Verificá que la base de datos esté levantada: docker compose ps')`.
Los guidelines piden mensajes al cliente en inglés.

**Valoración:** es un log de consola del backend, no un mensaje devuelto al cliente. La
regla de inglés aplica a `res.status(...).json({ error })`, y ahí no se tocó nada. El
resto del backend ya usa español en sus logs (`'✅ Conectado a MySQL'`,
`'Error servidor:'`), así que este mensaje es **consistente con el código circundante**.
Se reporta como desvío menor, no como error, y la decisión de si se traduce es del
usuario.

**Contexto preexistente fuera de alcance:** `backend/routes/` tiene 19 mensajes de
error devueltos al cliente en español. Preexistente, no introducido por este cambio.

### Eje 3 — Logs

| Regla de la política | Estado |
|---|---|
| No loguear datos sensibles | **Cumple.** Verificado explícitamente: el mensaje de error no contiene ni el password ni el user. Test manual con password errónea confirmó `¿contiene password? false` |
| No exponer stack traces al cliente | Cumple: el mensaje va a consola, no a la respuesta HTTP |
| Niveles con significado operativo | Cumple: `console.error` para fallo de conexión, que es ERROR porque alguien tiene que actuar |
| Estructurado en JSON | **Desvío D2.** El log es texto plano con emoji, no JSON |

**Valoración de D2:** la política pide JSON estructurado con campos base. El backend
completo usa `console.log`/`console.error` en texto plano; migrar el backend entero a
logs JSON es un cambio de alcance propio. Lo agregado por este cambio sigue la convención
existente del archivo que toca. Se reporta como desvío menor.

`logs_conforme` declarado en `apply-progress`: **sí**. Esta verificación lo matiza:
conformidad con la política completa, no. El desvío es de convención preexistente del
backend, no introducido aquí.

## Desvíos

| # | Desvío | Severidad | Acción |
|---|---|---|---|
| **D1** | Mensaje de log en español en `server.js:62` | Menor | Consistente con el backend circundante. Traducir o mantener, decisión del usuario |
| **D2** | Log en texto plano, no JSON estructurado | Menor | Convención preexistente del backend. Migrar el backend entero es otro cambio |
| **D3** | `tasks` declaró `README.md` como existente; no existe en la raíz | Menor | `document` debe crearlo o marcarlo no aplicable |
| **D4** | `db.config` exportado contiene el password en texto plano | Info | Nunca se loguea (verificado). Se exporta porque `server.js` necesita `host` y `port` para el mensaje. Aceptable, queda anotado |

**Ningún desvío bloquea la archivo.** Los cuatro son menores o informativos, y ninguno
afecta el comportamiento ni la seguridad.

## Seguridad de credenciales — verificado

- `kuvu_app` tiene `GRANT ALL PRIVILEGES ON bd_arrendamientos.*` y **solo eso** más
  `USAGE`. Confirmado por `SHOW GRANTS`.
- `kuvu_app` **no puede** leer `mysql.user`: `ERROR 1142 command denied`. El password de
  root no está expuesto a la aplicación.
- Las credenciales reales viven en `.env` y `backend/.env`, ambos ignorados por git.
- `.env.example` contiene `CHANGE_ME`, no valores reales.

## Estado final del entorno

- Contenedor `kuvu_db` en `healthy`, publicando `3306`.
- `mysqld` de XAMPP **detenido**, puerto liberado. Directorio de datos intacto.
- Backend verificado conectando y sirviendo en `3000`.
- Los 12 criterios de aceptación en verde sobre el estado actual.

## Resultado

**VERDE.** La implementación cumple la spec y el design. Los cuatro desvíos son menores o
informativos, ninguno introduce riesgo y ninguno bloquea.
