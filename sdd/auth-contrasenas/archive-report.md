# archive-report — auth-contrasenas

## Pendientes fuera del código (leer primero)

- **Secretos a rotar: ninguno** (`secure-report`).
- **`npm install` en `backend/`** en cada checkout: `bcryptjs` no está versionado. Sin eso, el
  backend no arranca.
- **La migración ya está aplicada en `kuvu_db`** (respaldo previo en
  `db/backups/bd_arrendamientos-20261109-175018-pre-auth-contrasenas.sql`, ignorado por git).
  Hasta mergear el PR 1, un backend de otra rama sobre esa BD devuelve `password_hash` en
  `GET /api/usuarios`: correr el backend desde `feat/auth-contrasenas`.
- **Dependencias con avisos de `npm audit` preexistentes** (`express` vía `body-parser`, `qs`,
  `proxy-addr`; `mysql2`), con arreglo disponible: actualizar en un cambio propio.
- **Volumen Docker anónimo huérfano** del primer contenedor descartable de la verificación de la
  migración: eliminar tras confirmar su id (`docker volume ls -f dangling=true`).
- **Integración con app-interna-ux**: al mergear, `auth.service.spec.ts` choca (lo crean las dos
  ramas) y el spec de app-interna-ux llama a `login` con 3 argumentos; se resuelve conservando los
  dos specs y pasando una contraseña (verificado en un merge de prueba, 597/597).

## Qué se hizo

Login con correo + documento + contraseña; contraseñas solo como hash bcrypt (`bcryptjs`, costo
12); política 8–64 con mayúscula, minúscula, número, símbolo, lista negra y sin correo ni
documento; bloqueo de 15 minutos tras 5 fallos con mensaje genérico; contraseña temporal con
cambio obligatorio; cambio voluntario; creación con temporal y restablecimiento por el
administrador, autorizados re-verificando sus credenciales; logs JSON de autenticación sin datos
personales; migración idempotente que solo agrega columnas, bootstrap de temporales (= documento)
y seed de instalación nueva.

## Ramas y commits (sin push ni PR, por indicación del usuario)

- **PR 1 — `feat/auth-contrasenas`** ← `fix/tema-claro-tokens`: planificación, `backend-orden`,
  `intro`, verify, fix de `secure`, refine/re-verify, document y este archivo.
- **PR 2 — `feat/auth-contrasenas-usuarios`** ← `feat/app-interna-ux-gestion`: `app` (pantalla de
  usuarios, `DataService`, sidebar) y `cierre` (`sdd.config.md`, `sdd-init.md`). Sus
  `apply-progress/app.md` y `cierre.md` viven en esa rama.
- Siguiente paso manual: abrir los PRs (PR 2 después de que la pila de app-interna-ux avance) y
  mergear PR 1 antes o junto con PR 2 (PR 2 necesita el backend y `/cambiar-contrasena` en
  ejecución).

## Decisiones

Del Gate A (usuario): login de tres datos; columna nueva por migración aditiva con respaldo
previo; bcryptjs; política clásica; temporal = documento para los existentes y temporal escrita
por el admin para los nuevos; bloqueo 5 → 15 min; cambiar mi contraseña + restablecimiento por
admin; JWT fuera; logs JSON; frontend de usuarios apilado sobre app-interna-ux. Del Gate C: 2 PRs,
slices `backend-orden`, `intro`, `app`, `cierre`; migración de `kuvu_db` autorizada.

Por default (orquestación): crear usuarios también exige credenciales de administrador (sin eso,
cualquiera podría crear un admin y restablecer cuentas); los fallos de re-verificación del admin
cuentan para su bloqueo; un admin no se restablece a sí mismo; salir del cambio obligatorio cierra
la sesión pendiente; `01-schema.sql` sin tocar (columnas solo en `03`).

## Verificación

`verify-report`: CA-1 a CA-13 pasan. Backend 79/79, Karma 499/499 (PR 1) y 572/572 (PR 2),
builds OK. Re-verificado tras `secure`. Migración probada en contenedores descartables y aplicada a
`kuvu_db` con snapshot antes/después idéntico en todos los datos existentes.

## Seguridad (`secure-report`)

- Corregido: diferencia de tiempo que revelaba una cuenta bloqueada (CWE-208), con test de
  regresión.
- **Riesgo residual aceptado por el usuario**: `PUT`/`DELETE` de usuarios y el resto de la API sin
  autenticación (sin sesión/JWT); temporal inicial = documento, mitigada por el cambio
  obligatorio. Aceptados en la spec: bloqueo por cuenta como DoS acotado; sin límite por IP.

## Refinamiento (`refine-report`)

Sin cambios necesarios. Deliberadamente no tocado: política y `MENSAJE_ACCESO` duplicados entre
backend y frontend (runtimes distintos, el backend es la autoridad), registro de rechazo repetido
dos veces en `routes/auth.js` (Regla de Tres), `password-policy.ts` copiado en PR 2 (idéntico),
`UPDATE` por fila en `registrarFallo`, doble de BD de tests. Deuda técnica residual: el resto del
backend con `console.error` fuera de la política de logs; `backend/node_modules` con archivos
versionados aunque está ignorado; dependencias con avisos de `npm audit`.

## Documentación (`document-report`)

- `docs/auth-contrasenas.md` (nuevo): funcionamiento, endpoints, migración paso a paso, decisiones
  y limitaciones.
- `docs/architecture.md`: clúster de acceso, capas (backend `auth/`, `scripts/`, esquema con
  migraciones aditivas), flujo de acceso y una decisión estructural.
- `CHANGELOG.md` → Unreleased: Added y Changed (cambio incompatible del contrato de login y de
  creación de usuarios, con pasos de migración).
- `backend/INSTRUCCIONES.md`: ingreso con contraseña temporal y errores 401 / `bcryptjs`.
- No aplica: OpenAPI y Bruno (el proyecto no los mantiene, por `sdd.config.md`), README (no existe
  en la raíz), `DEVELOPMENT_GUIDELINES.md` (sin convención nueva).
- Fuera del repo versionado: `docs/KUVU-Requerimientos.docx` (RF-06) describe el login anterior; es
  del usuario y no se modificó.

## Artifacts

`sdd/auth-contrasenas/`: `init`, `explore` (con decisiones de clarify), `propose`, `spec`,
`design`, `tasks` (con decisiones del Gate C), `apply-progress/{backend-orden,intro}` (+ `app`,
`cierre` en PR 2), `verify-report`, `secure-report`, `refine-report`, `document-report`,
`archive-report`. Almacenamiento: `files` (sin memoria compartida que sincronizar).
