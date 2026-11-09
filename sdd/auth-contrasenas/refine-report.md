## Refinamiento — auth-contrasenas

**Resultado: sin cambios necesarios.**

### Red de seguridad

- Backend: 79 tests `node --test` (rutas con doble de BD, credenciales con reloj simulado,
  política, hash, logs, bootstrap). Frontend: 499 specs (PR 1) y 572 (PR 2).
- Baseline relevante: una verificación bcrypt (costo 12, ≈ 250–300 ms) por intento de acceso, que
  es intencional (seguridad) y no un objetivo de optimización. Volumen de datos: decenas de
  usuarios; cada login hace un `SELECT` por correo + empresa y como mucho un `UPDATE` por fila.

### Cambios aplicados

Ninguno.

### Deliberadamente NO tocado

- **Política de contraseñas duplicada en backend (`auth/password-policy.js`) y frontend
  (`services/password-policy.ts`)** — motivo: viven en runtimes distintos y el backend es la
  autoridad (incluye la lista negra); el frontend es solo ayuda en vivo. Compartir código exigiría
  un paquete común o un endpoint de política: más complejidad que la duplicación (KISS).
- **`MENSAJE_ACCESO` repetido en backend y frontend** — mismo motivo; el frontend muestra su propia
  copia para no depender del cuerpo del 401.
- **Registro del rechazo repetido en `login` y `cambiar-password` (`routes/auth.js`)** — dos
  apariciones; Regla de Tres, sin abstracción.
- **`password-policy.ts` copiado idéntico en `feat/auth-contrasenas-usuarios`** — necesario
  mientras las ramas no compartan base; se integra sin conflicto al ser idéntico.
- **`registrarFallo` con un `UPDATE` por fila** — en la práctica hay una fila por correo y empresa;
  agruparlo en un solo `UPDATE` no tiene beneficio medible.
- **`test/helpers/fake-db.js`** — doble de prueba con un mini-parser de SQL; es código de test, cubre
  lo que usan las rutas y falla ante SQL desconocido. Reescribirlo no aporta.
- **Controles de seguridad** (verificación contra `DUMMY_HASH` en todos los rechazos, allowlist de
  logs, re-verificación del administrador, columnas explícitas): intocables por regla de la fase.

### Deuda técnica residual (registrada, no resuelta ahora)

- El resto del backend registra errores con `console.error` suelto, fuera de la política de logs
  JSON (no-objetivo de este cambio).
- `backend/node_modules` tiene archivos versionados aunque `backend/.gitignore` lo ignora;
  conviene sacarlos del índice (`git rm -r --cached backend/node_modules`) en un cambio propio.
- Dependencias del backend con avisos de `npm audit` preexistentes (ver `secure-report`).
