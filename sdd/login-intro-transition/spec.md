# Spec — login-intro-transition

## Requisitos funcionales

### R1 — Intro cinematográfica
- Al llegar a `/acceder` con la app recién cargada, se ejecuta **automáticamente** una intro cinematográfica de máximo 5 segundos antes de mostrar la selección de inmobiliaria.
- La intro es una **animación real** (CSS 3D), no una imagen estática. Representa una casa moderna que se construye con técnica *exploded view*.
- Timeline de la intro (referencia: `Transicion_login.png`):
  - **0–1s**: fondo dark navy/negro con blueprint arquitectónico (líneas técnicas cian/teal y partículas sutiles).
  - **1–2s**: aparecen piezas de la casa separadas/flotando (muros, pisos, ventanas, techo y elementos arquitectónicos).
  - **2–3s**: las piezas se desplazan hacia su posición (sensación de ensamblaje arquitectónico real).
  - **3–4s**: la casa termina de ensamblarse; aparecen iluminación y detalles.
  - **4–5s**: casa terminada, iluminación cálida (glow ámbar), leve movimiento de cámara y transición cinematográfica hacia la selección.
- La intro se ejecuta **una sola vez por carga de app** (flag no persistente). Navegar `/login` → `/acceder` (cambiar inmobiliaria) **no** reproduce la intro. Recargar la página (F5/reload) hace que la intro corra de nuevo.
- Si el sistema reporta `prefers-reduced-motion`, la intro se omite y se muestra la selección directamente.

### R2 — PANTALLA 1: selección de inmobiliaria (`/acceder`)
- Tras la intro (o al omitirse), se muestra la selección de inmobiliaria con:
  - Título **"Bienvenido"**.
  - Subtítulo **"Gestiona tu operación inmobiliaria desde un solo lugar"**.
  - Encabezado **"Selecciona tu inmobiliaria"**.
  - El buscador y la lista de inmobiliarias existentes (fetch `GET /api/empresas`, filtrado por nombre/subdominio, skeleton y estado vacío) se mantienen funcionales.
- Cada inmobiliaria es seleccionable.

### R3 — PANTALLA 2: credenciales (`/login`)
- Al seleccionar una inmobiliaria se navega a `/login` **sin recargar la página** (navegación SPA) y se muestran las credenciales con:
  - Título **"Inicia sesión"**.
  - Campo **"Correo electrónico"**.
  - Campo **"Número de documento"** (cédula).
  - Fila con **"Recordarme"** y **"¿Olvidaste tu contraseña?"** como **enlaces decorativos no funcionales** (sin acción al hacer clic).
  - Botón **`Iniciar sesión →`**.
  - Botón **`← Cambiar de inmobiliaria`** que regresa a `/acceder`.
- El envío usa el contrato existente `POST /api/auth/login {correo, documento, empresa_id}` manteniendo el manejo de errores actual (401 → "Correo o documento incorrecto"; otros → "Error de conexión…") y la redirección a `/dashboard` en éxito.

### R4 — Estados y flujo
- Flujo: `INTRO → COMPANY_SELECTION → CREDENTIALS`.
- La transición INTRO → COMPANY_SELECTION es suave (fade/slide interno).
- La transición COMPANY_SELECTION → CREDENTIALS es suave (navegación SPA con View Transitions activo), sin recarga.
- La transición CREDENTIALS → (cambiar inmobiliaria) regresa a COMPANY_SELECTION sin reproducir la intro.

### R5 — Estética y responsive
- La estética global replica la composición de la referencia: fondo **navy profundo**, líneas de blueprint **cian/teal**, glow interior **ámbar cálido** en la casa, glassmorphism en las tarjetas (identidad azul→violeta existente preservada en PANTALLA 2).
- Responsive en 640/767 px: la casa y las tarjetas se adaptan sin cortes; controles con target ≥44px (token existente).

## Criterios de aceptación

| # | Verificación |
|---|---|
| CA1 | Carga fresca de `/acceder` → intro animada de ≤5.5s → aparece "Bienvenido" + lista de inmobiliarias. La intro no es una imagen estática (hay movimiento 3D real). |
| CA2 | Tras navegar `/acceder→login→acceder`, la intro **no** se reproduce. Tras un reload de la app, se reproduce de nuevo. |
| CA3 | Con `prefers-reduced-motion: reduce`, al cargar `/acceder` no se reproduce la intro y se ve la selección de inmediato. |
| CA4 | Seleccionar una inmobiliaria navega a `/login` sin recargar el documento (verificable: sin F5, el badge de empresa muestra la seleccionada). |
| CA5 | `/login` muestra "Inicia sesión", correo, documento, "Recordarme", "¿Olvidaste tu contraseña?" (sin acción), `Iniciar sesión →` y `← Cambiar de inmobiliaria`. |
| CA6 | Enviar credenciales dispara exactamente `POST /api/auth/login {correo, documento, empresa_id}`; 401 y error de conexión muestran los mensajes existentes; éxito navega a `/dashboard`. |
| CA7 | `← Cambiar de inmobiliaria` regresa a `/acceder` mostrando la selección sin intro. |
| CA8 | En viewport ≤767px la composición se mantiene completa y operativa (casa + tarjetas), controles ≥44px. |
| CA9 | La suite de tests (Karma `ng test --watch=false`) corre en verde e incluye specs nuevas de landing (estado intro/selection) y login (formulario/envío). |
| CA10 | No se modificó el contrato de login del backend ni la lógica de `AuthService` (login/logout/restaurarSesion). |

## No-objetivos / edge cases excluidos

- **Fuera**: autenticación con contraseña, "recordarme" real, "olvidar contraseña"/recuperación de cuenta, cambio de contrato del backend.
- **Fuera**: unificar rutas, tocar `auth.guard`/`adminGuard`, home, dashboard o áreas admin.
- **Fuera**: three.js u otra librería 3D.
- **Fuera**: persistir la selección de inmobiliaria entre sesiones (se mantiene `sessionStorage['empresaPreseleccionada']`).
- **Edge case heredado (se conserva)**: ingresar directo a `/login` sin empresa preseleccionada redirige a `/acceder`.
- **Edge case heredado (se conserva)**: si el fetch de empresas falla, la lista queda vacía con el estado visual actual.
- **Limitación conocida**: los enlaces decorativos "Recordarme"/"¿Olvidaste tu contraseña?" no tienen comportamiento.