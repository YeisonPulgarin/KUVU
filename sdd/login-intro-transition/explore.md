# Explore — login-intro-transition

## Qué existe hoy (presente)

### Flujo auth actual
- **Boot**: `main.ts` → `AppComponent` (solo `<router-outlet>`) → `auth.restaurarSesion()` lee `localStorage` (empresa_id, usuario, empresa), setea signals y aplica el tema de la empresa.
- **Home** (ruta `''`, sin guard): página marketing con CTAs → `/acceder`.
- **Landing** (ruta `/acceder`): selección de empresa. Fetch GET `http://localhost:3000/api/empresas`; buscador filtra por nombre/subdominio; `seleccionar()` guarda en `sessionStorage['empresaPreseleccionada']` y navega a `/login`.
- **Login** (ruta `/login`): credenciales. Lee/elimina `empresaPreseleccionada` (si no existe → `/acceder`); si autenticado → `/dashboard`. `onLogin()` → `auth.login(correo, documento, empresa.id)` → POST `/api/auth/login` → signals + `localStorage` + navega `/dashboard`.
- **Áreas admin**: rutas lazy con `authGuard` (dashboard, contratos, pagos, mantenimiento) y `adminGuard` (locales, usuarios). Cada una usa `.app-layout` + `<app-sidebar>` + `.main-content`.
- **Logout**: limpia signals + `localStorage`, navega `/login` (doble navegación: auth.service + sidebar).

### Detalles relevantes
- El login **no usa contraseña**: campos **correo + número de documento (cédula)**. No hay "recordarme" ni "olvidar contraseña" ni ninguna lógica de recuperación (grep 0 resultados).
- `AuthService.login()` POST `{ correo, documento, empresa_id }`; persiste sesión completa en `localStorage` en claro.
- `@angular/animations` **instalado pero nunca importado** (no hay `provideAnimations`). `withViewTransitions()` activo en `app.config.ts`.
- Identidad visual del login/landing: **dark glassmorphism azul→violeta** (`#3a6fd8 → #7c3aed`, fondo `rgba(7,5,20,…)`), fuentes Syne + Inter; logo `<img src="/Logo_Kuvu.jpeg">` ya integrado; responsive 639/767 aplicado; inputs 44px.
- Home usa identidad verde (`#6b8e6b`, Tailwind `@theme`).
- `public/login-backgrounds/`: `kuvu.webp`, `amarilo.webp`, `balcones.webp`, `miinmueble.webp`, `nido-rent.webp` — usados como fondo dinámico en login (`BG_MAP` en login.ts, por subdominio de empresa) y `kuvu.webp` fijo en landing.
- **CSS muerto en login.scss**: `.empresa-list`, `.empresa-row`, `.skeleton-list`, `.login-hint` — restos de un "paso 1" de empresas que vivió dentro del login y se movió a landing.
- **Código muerto**: `app-navbar` (shared/navbar) sin uso; `src/assets/login-backgrounds/` vacía.
- **Modelo duplicado**: `landing.component.ts` redefine `Empresa` local en vez de `models/empresa.model.ts`.
- **Guardas/URLs**: wildcard `**` → `/login` → sin empresa → `/acceder`. No hay `returnUrl`.
- **Tests**: solo `home.component.spec.ts` (19). Sin specs de login/landing/services/guards. Karma + ChromeHeadless.

### Referencia visual — `fronted/proyecto_angular/public/login-references/Transicion_login.png`
> Analizada por muestreo de píxeles (el modelo no tiene visión de imágenes):

Datos objetivos extraídos:
- 1672×941 (16:9), sin transparencia.
- **Fondo**: dark navy/negro (`9,20,31` → `23,31,42`); centro-tope más claro con glow cálido en el cielo (`177,150,141` a ~28px del borde superior), base/abajo casi negro (`23,24,27`).
- **Casa (focal)**: ocupa la franja central derecha. Glow cálido/ámbar intenso en el bloque central (`223,184,154` en x~800,y~260), con clústeres cálidos de x~624 a x~1540 en la franja vertical y~225–295; el cuerpo entre clústers queda oscuro (~`5,5,7`) → casa iluminada por ventanas/interior cálido y silueta oscura.
- **Fuerte verticalidad de glow** en centro-ancho (y~105 a y~360) → volumen de la casa; bandas cálidas menores en borde superior derecho y base (x~1260–1540 → ala/segundo volumen).
- **Acentos cian/teal** en todo el frame (bbox casi completo, ~2.9k muestras) → líneas técnicas/blueprint + partículas sutiles. **Ámbar cálido** (`96,64,32`) minoritario en samplings anteriores.
- Composición: vitrina de casa moderna de noche (blue hour), silueta arquitectónica con luz interior cálida, mundo blueprint con partículas — coherente con "casa moderna ensamblada + iluminación cálida" del estado final de la intro.

Interpretación utilizada para el diseño: determinará fondo navy profundo, líneas de blueprint cian, piezas arquitectónicas con luz cálida interior y glow final ámbar.

## Ambiguidades estructurales → Gate A

1. **Contrato de credenciales (crítico)**: el backend autentica con **correo + documento**, no contraseña; no hay *recordarme* ni *olvidar contraseña*. La PANTALLA 2 pedida lista "Correo electrónico / Contraseña / Recordarme / ¿Olvidaste tu contraseña?". El requisito "no inventar funcionalidades de autenticación" choca con ese copy. → Decisión del usuario (ver Gate A).
2. **Estructura de rutas**: hoy `/acceder` (selección) y `/login` (credenciales) son dos rutas. El flujo pedido es una sola experiencia con 3 estados. → ¿Unificar en `/login` (reutilizando UI/info de landing) y `/acceder` como redirect/alias? (Dejará el formulario único; no se borra lógica, se reubica.)
3. **Confirmación de lectura de la referencia**: casa como hero central deriva del análisis de píxeles (el agente no ve la imagen). Se pide confirmación de que esa es la lectura deseada antes de fijarla en spec/design.
4. **Motor de la animación 3D**: no hay three.js; `@angular/animations` instalado sin uso. Para "exploded view" se recomienda **CSS 3D puro** (perspective + translate3d/rotate sobre piezas geométricas CSS) — sin dependencias nuevas, coherente con YAGNI. Se decide en `design`, no bloquea el Gate A.

## Decisiones de Gate A (resueltas por el usuario)

1. **Credenciales**: la PANTALLA 2 usa los campos reales **correo electrónico + número de documento**. Se agregan **"Recordarme" y "¿Olvidaste tu contraseña?" como enlaces decorativos no funcionales** (visuales). El contrato `POST /api/auth/login {correo, documento, empresa_id}` se mantiene intacto.
2. **Rutas**: se **preservan las dos rutas** `/acceder` y `/login`. La intro cinematográfica se ejecuta al ingresar al flujo auth (en `/acceder`); tras la intro se muestra la selección de inmobiliaria; al seleccionar se navega a `/login` con transición suave (SPA sin recarga). El estado CREDENTIALS vive en `/login` con botón "← Cambiar de inmobiliaria".
3. **Referencia**: confirmado — la casa moderna es el hero central; la animación la ensambla pieza a pieza y el login aparece como glassmorphism sobre el mismo fondo navy nocturno.
4. **Intro "una sola vez por carga"**: la intro corre automáticamente al montar `/acceder` la primera vez tras una carga de app; no se repite al navegar de regreso `/login` → `/acceder` (cambio de inmobiliaria). Se implementa con flag de vida corta (no persistente), reseteándolo en carga real.

## Archivos clave (mapa)

| Archivo | Rol |
|---|---|
| `src/app/components/landing/landing.component.ts|html|scss` | Selección de empresa actual (`/acceder`) |
| `src/app/components/login/login.component.ts|html|scss` | Credenciales actuales (`/login`) |
| `src/app/app.routes.ts` | Rutas + guards |
| `src/app/services/auth.service.ts` | Signals, login/logout, restaurarSesion, tema por empresa |
| `src/app/services/data.service.ts` | Datos de negocio por empresa |
| `src/app/app.ts`, `src/app/app.config.ts` | Bootstrap, providers, View Transitions |
| `src/styles.css`, `src/app/components/shared/shared.styles.scss` | Tokens, breakpoints, touch targets |
| `public/Logo_Kuvu.jpeg`, `public/login-backgrounds/*.webp` | Assets visuales |
| `src/app/components/home/*` | Página marketing (origen del flujo) |
| `public/login-references/Transicion_login.png` | Referencia visual del ciclo |

## Notas no bloqueantes
- Estado git: ciclo anterior (`logo-responsive`) implementado y verificado pero sin commitear (22+ archivos modificados, `kuvu_mobile/` staged-delete).
- `docs/architecture.md` sigue siendo template sin completar.
- Footer `© 2026 KUVU · YCW` en login/landing.