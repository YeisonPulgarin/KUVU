# Propose — login-intro-transition

## Intent

Elevar la experiencia de acceso al portal KUVU: una intro cinematográfica de 5s (casa moderna ensamblándose en 3D exploded view, estética navy + glow ámbar de la referencia `Transicion_login.png`) da paso a una selección de inmobiliaria y luego a las credenciales, con transiciones suaves entre los tres estados y sin romper el contrato de autenticación existente.

## Alcance

- **Intro cinematográfica** en `/acceder`: se ejecuta automáticamente una sola vez por carga de app, animación en 5 fases (blueprint → piezas flotando → ensamblaje → iluminación → casa terminada + transición a la selección).
- **PANTALLA 1** (selección de inmobiliaria, en `/acceder`): copy nuevo ("Bienvenido" / "Gestiona tu operación inmobiliaria desde un solo lugar" / "Selecciona tu inmobiliaria") + reutiliza el buscador y la lista de empresas existentes de `landing`.
- **PANTALLA 2** (credenciales, en `/login`): rediseño visual acorde a la referencia (glassmorphism sobre navy nocturno), campos **correo electrónico + número de documento** (contrato real intacto), línea "Recordarme" + "¿Olvidaste tu contraseña?" como **enlaces decorativos no funcionales**, botón `Iniciar sesión →` y `← Cambiar de inmobiliaria`.
- **Transiciones suaves** entre INTRO → SELECCIÓN → CREDENCIALES (incluida la navegación `/acceder` → `/login` y el regreso sin recargar la página).
- **Animación con CSS 3D puro** (perspective + transform 3D sobre piezas geométricas), sin dependencias nuevas.
- Resonancia visual con la referencia: fondo navy profundo, líneas de blueprint cian/teal, partículas sutiles, glow interior cálido ámbar en la casa terminada.
- Responsive (móvil 640/767), manteniendo los estándares de touch targets de `shared.styles.scss`.

## No-objetivos

- **No** cambiar el contrato de login del backend (`{correo, documento, empresa_id}`) ni inventar autenticación con contraseña, "recordarme", "olvidar contraseña" o recuperación de cuenta.
- **No** unificar las rutas `/acceder` y `/login` ni tocar la lógica del `AuthService` (login/logout/restaurarSesion/theming).
- **No** introducir three.js ni librerías 3D.
- **No** modificar home, dashboard, guards ni las áreas admin.
- **No** eliminar el componente `landing` por completo: se mantiene como la pantalla de selección de `/acceder` (con la intro encapsulada aparte).

## Approach (alto nivel)

1. **Componente intro independiente** `LoginIntroComponent` (o `AuthIntroComponent`): encapsula toda la animación (5 fases, ~5s), se monta al entrar a `/acceder` y al terminar dispara un evento/estado para mostrar la selección. Lógica de animación aislada de la autenticación.
2. `/acceder` (landing) orquesta: `INTRO → COMPANY_SELECTION` con un flag de vida corta (no persistente) para que la intro corra una vez por carga de app. Reutiliza el fetch `/api/empresas` y el buscador existentes.
3. `/login` (credenciales): rediseño visual + enlaces decorativos + conserva `onLogin()`, `volverAlLanding()`, el badge de empresa y el mapeo de fondos `BG_MAP`.
4. Transiciones: CSS state transitions dentro de cada pantalla + ya hay `withViewTransitions()` para la navegación entre rutas; se refina el crossfade si hace falta.
5. Tests (`test-after`, según `sdd.config.md`): specs de `landing` (estados intro/selection) y `login` (formulario/envío), siguiendo el patrón Karma existente.