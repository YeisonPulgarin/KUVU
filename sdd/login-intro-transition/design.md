# Design — login-intro-transition

Referencia `spec.md` (requisitos) y `propose.md` (alcance). Solo decisiones técnicas.

## Arquitectura de componentes

```
AppComponent (router-outlet)
├── /  HomeComponent (sin cambios)
├── /acceder  LandingComponent  ── orquesta INTRO → COMPANY_SELECTION
│   ├── AuthIntroComponent (nuevo)  — animación 5s, aislada de la auth
│   └── tarjeta selección (buscador + lista empresas, existente)
├── /login  LoginComponent  — rediseño PANTALLA 2 (credenciales)
└── /dashboard + áreas admin (sin cambios)
```

- `IntroStateService` (nuevo, `providedIn: 'root'`): singleton con `introVistoEnEstaCarga` (boolean, memoria de vida corta — se pierde en reload real). Decide `debeReproducirse()`: `!introVistoEnEstaCarga && !matchMedia('(prefers-reduced-motion: reduce)')`.
- El flag vive en un servicio (no en localStorage/sessionStorage) → cumple "una sola vez por carga de app": sobrevive la navegación SPA `/acceder→/login→/acceder` (no relanza la intro) y se resetea al recargar el documento (F5).

## AuthIntroComponent — motor de la animación

**Timeline dirigido por TS, rendering por CSS.** El componente expone un signal `fase` (1..5) y un `output() completa`.

- `ngOnInit` programa los cambios de fase con timers (1000/2000/3000/4000/5000 ms). Cada tick setea `fase.set(n)`.
- El template aplica la clase de fase al host (`[class.fase-1]…[class.fase-5]`); el SCSS dispara transiciones/keyframes según la fase.
- `fase-1` (blueprint): fondo navy + grid cian/teal (CSS `background-image` con líneas), SVGs de líneas arquitectónicas que se dibujan y partículas sutiles (capa con manchas radiales animadas).
- `fase-2` (exploded): las piezas entran flotando con `transform: var(--desde)` (scatter 3D con `translate3d`/`rotate`), animación de flotado (bob) y opacidad 0→1. Cada pieza define custom props CSS `--desde`/`--hasta`.
- `fase-3` (ensamblaje): se agrega la clase `.ensamblado` → `transform: var(--hasta)` con `transition: transform 1.1s cubic-bezier(.55,.15,.2,1)` — las piezas convergen (sensación de ensamblaje).
- `fase-4` (iluminación): las ventanas (pseudo-elementos de las piezas) encienden glow ámbar (`opacity` 0→1, `filter: drop-shadow`), aparece una luz interior radial.
- `fase-5` (casa terminada + transición): glow cálido global (overlay radial ámbar `bg`), micro sway de cámara (rotación/traslación leve del stage con `perspective`), y `completa.emit()` a los 5s para que el landing haga el crossfade hacia la selección.

**Piezas de la casa:** ~12 divs en un `stage` con `perspective: 900px` y `transform-style: preserve-3d`, representando: losa piso, 4 muros, 2 planos de techo inclinado, 2 ventanas, puerta, balcón/volado. Silueta de casa moderna minimalista; el ensamblado final reproduce la lectura de la referencia (bloque central + ala derecha, glow interior). Cada pieza lleva `--desde`/`--hasta` en SCSS (no en TS).

**Decisiones vs alternativas:**
- **three.js / WebGL: descartado.** La escena es geométrica estilizada; CSS 3D (perspective + preserve-3d) alcanza el resultado premium sin dependencia, sin coste de bundle ni GPU para un efecto que dura 5s. (YAGNI/ponytail.)
- **`@angular/animations`: descartado.** La fase está controlada por timers TS y la animación real es CSS; evita habilitar el módulo de animations que hoy está sin uso.
- **Keyframes CSS puros por fase (sin timer TS): descartado.** El timer TS hace la máquina de estados testeable en Karma (assert de `fase()` por tick) y permite respetar `prefers-reduced-motion` sin CSS condicional.
- **Intro en overlay sobre `/login`: descartada** (decisión de rutas del usuario — intro solo en `/acceder`).

## LandingComponent — orquesta INTRO → COMPANY_SELECTION

- Señal `estado = signal<'INTRO'|'SELECTION'>('INTRO')`.
- `ngOnInit`: si `introState.debeReproducirse()` → queda en INTRO (monta `app-auth-intro` fullscreen/overlay); si no → `estado.set('SELECTION')` directo (sin intro; cubre `prefers-reduced-motion` y regreso desde `/login`).
- Al `(completa)` de la intro: `introState.marcarComoReproducida()`, `estado.set('SELECTION')`.
- `@if (estado() === 'SELECTION')`: se muestra la tarjeta con copy nuevo (Bienvenido / Gestión… / Selecciona tu inmobiliaria), buscador y lista existentes, con animación de entrada `fadeUp`.
- `seleccionar()` intacto: `sessionStorage['empresaPreseleccionada']` + `router.navigate(['/login'])` (SPA, sin recarga).
- Copy PANTALLA 1: "Bienvenido" + "Gestiona tu operación inmobiliaria desde un solo lugar" + "Selecciona tu inmobiliaria".
- **Modelo**: se reemplaza la interfaz `Empresa` local por `models/empresa.model.ts` (subconjunto compatible; elimina la duplicación detectada en explore).

## LoginComponent — PANTALLA 2 (credenciales)

- Pantalla: header "Inicia sesión" + descripción; se mantienen campo **Correo electrónico** y **Número de documento**, badge de empresa, `BG_MAP` de fondos por subdominio, error handling, `onLogin()` (contrato intacto).
- **Fila extras (decorativos, por decisión del usuario):**
  - "Recordarme": checkbox puramente visual; al hacer clic togglea un signal local `recordarme` (sin persistencia ni efecto en el login).
  - "¿Olvidaste tu contraseña?": `<span>` con estilo de link, **sin `click` handler** (no navega, no abre nada); `cursor: default` para ser honesto con el usuario; se documenta en el código como decorativo.
- Botones: `Iniciar sesión →` (envía `onLogin`) y back `← Cambiar de inmobiliaria` → `volverAlLanding()` (regresa a `/acceder`, que muestra la selección sin intro gracias al flag).
- Estética: se alinea el overlay con el navy profundo de la referencia manteniendo glassmorphism azul→violeta del CTA y la marca/logo/footer existentes.

## Transiciones entre estados

- INTRO → COMPANY_SELECTION: crossfade dentro de `LandingComponent` (el overlay de la intro se desvanece y la tarjeta hace `fadeUp`).
- COMPANY_SELECTION → CREDENTIALS: navegación SPA con `withViewTransitions()` ya activo en `app.config.ts` (no se toca config).
- CREDENTIALS → COMPANY_SELECTION: misma navegación inversa; sin re-intro.

## Tests (modalidad `test-after`, escritos en el slice antes de cerrarlo)

- `auth-intro.component.spec.ts`: avance de `fase()` en ticks (fakeAsync), emisión de `completa`, cleanup de timers al destruir.
- `landing.component.spec.ts`: con `fakeAsync`/`TestBed` mockeando `IntroStateService` y `HttpClient`: (a) si `debeReproducirse()` → estado INTRO y monta intro; (b) al `completa` → SELECTION y se marca flag; (c) si no debe → SELECTION directo; (d) `seleccionar()` setea sessionStorage y navega.
- `login.component.spec.ts`: render de PANTALLA 2 (campos, decorativos, botones), `onLogin()` dispara `auth.login(correo, documento, empresa.id)` (mock de `AuthService`), error 401 → mensaje, éxito → navega `/dashboard`.
- Mocking: `provideHttpClientTesting()` para Http; `AuthService`/`IntroStateService` espías si se prefiere aislar.

## Alcance de archivos

| Archivo | Acción |
|---|---|
| `src/app/components/shared/auth-intro/auth-intro.component.ts|html|scss` | nuevo |
| `src/app/services/intro-state.service.ts` | nuevo |
| `src/app/components/landing/landing.component.ts|html|scss` | modificar |
| `src/app/components/login/login.component.ts|html|scss` | modificar |
| `src/app/components/shared/auth-intro/auth-intro.component.spec.ts`, `landing.component.spec.ts`, `login.component.spec.ts` | nuevos (test-after) |

No se tocan: `app.routes.ts`, `auth.service.ts`, `app.config.ts`, guards, home ni áreas admin. Sin dependencias nuevas.

## Riesgos técnicos

- Timing de piezas/glow puede requerir ajuste empírico de delays en SCSS; se controla con la máquina de fases TS y `transition` (no depende de la duración exacta del keyframe).
- `preserve-3d` + `filter` en piezas: el `filter` rompe `preserve-3d` en algunos navegadores → el glow de ventanas usa capas pseudo-elemento overlay (no `filter` en el mismo elemento 3D).
- Karma en Windows: la suite actual ya corre con ChromeHeadless; se respeta `ng test --watch=false` del config.