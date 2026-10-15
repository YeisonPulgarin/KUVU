# explore — acceso-orden-e-intro

## Pedido

1. Ordenar las inmobiliarias del selector `/acceder` por `id` (Amarilo 1, Nido Rent 2, Balcones de San Soucci 3, Mi Inmueble 4).
2. Rediseñar la intro animada de la casa que precede al selector para que sea notablemente más profesional y sorprendente.

## Qué existe hoy

### Orden de empresas

- `backend/routes/empresas.js` — `GET /api/empresas` ejecuta
  `SELECT * FROM empresas WHERE activo = 1 ORDER BY nombre` (orden alfabético). Es el único punto que define el orden.
- `frontend/proyecto_angular/src/app/services/auth.service.ts` — `cargarEmpresas()` hace `GET http://localhost:3000/api/empresas` y guarda el array tal cual en una signal.
- `frontend/.../components/landing/landing.component.ts` — `empresasFiltradas` filtra por texto sin reordenar; el template itera en el orden recibido.
- Datos: `db/init/02-seed.sql` inserta ids 1..4 (Amarilo, Nido Rent, Balcones de San Soucci, Mi Inmueble), todas `activo = 1`. MariaDB 10.4 en contenedor `kuvu_db`.
- Otros consumidores de `GET /api/empresas`: solo `AuthService` (también lo invoca como fallback en la restauración de sesión, sin depender del orden).
- Tests backend: `node --test` con `backend/test/db.test.js` (solo `checkConnection`); no hay tests de rutas. Frontend: Karma/Jasmine, `landing.component.spec.ts` (137 líneas).

Cambio mínimo identificado: `ORDER BY nombre` → `ORDER BY id`. Sin cambios de esquema ni datos.

### Intro de la casa

- Ruta `/acceder` → `LandingComponent` orquesta estados `INTRO → SELECTION` con crossfade de 650 ms (`transicionando`).
- `components/shared/auth-intro/` — `AuthIntroComponent` (TS 32 l., HTML 48 l., SCSS 302 l., spec 56 l.):
  - Máquina de 5 fases por `setTimeout` de 1000 ms; signal `fase` 0..5; `output completada` al llegar a 5.
  - Tecnología: CSS 3D puro (`perspective` + `preserve-3d`), 12 `div.pieza` con custom props de explosión/ensamble; SVG de blueprint con trazos (`dibujar`), 12 partículas (`derivar`), glow ámbar de ventanas, `sway` de cámara, viñeta. Sin three.js, sin `@angular/animations` en uso (aunque el paquete está instalado), sin assets de imagen propios.
  - Duración total: 5 s de intro + 650 ms de crossfade (~5,65 s hasta ver el selector).
  - Fases: 1 blueprint, 2 piezas flotando, 3 ensamblaje, 4 iluminación de ventanas, 5 casa terminada + sway.
  - No hay botón ni gesto para saltarla. No hay audio.
  - Responsive con `@media (max-width: 767px)` y `480px`.
- `services/intro-state.service.ts` — la intro corre una vez por carga de app (flag en memoria), vuelve tras F5, y se omite si `prefers-reduced-motion: reduce`.
- Fondo del landing: `/login-backgrounds/kuvu.webp` + overlay; logo `/logo-rediseno/Logo_Kuvu.png`. Referencias visuales en `public/login-references/`.
- Documentación vigente: `docs/login-intro-transition.md`; artifacts del cambio anterior en `sdd/login-intro-transition/` (cerrado/archivado).
- Dependencias frontend: Angular 21, Tailwind v4, RxJS; no hay librerías de animación/3D (GSAP, three, Lottie). La skill `sds-3d` del proyecto contempla React Three Fiber, no aplica directo a Angular; three.js puro sí sería viable.

## Archivos relevantes

| Archivo | Rol |
|---|---|
| `backend/routes/empresas.js` | Consulta y orden de empresas |
| `frontend/proyecto_angular/src/app/services/auth.service.ts` | Fetch de empresas |
| `frontend/proyecto_angular/src/app/components/landing/*` | Orquestación intro → selector, lista |
| `frontend/proyecto_angular/src/app/components/shared/auth-intro/*` | Intro animada actual |
| `frontend/proyecto_angular/src/app/services/intro-state.service.ts` | Regla de reproducción / reduced-motion |
| `docs/login-intro-transition.md` | Doc vigente del flujo |

## Desalineaciones detectadas

- `sdd/sdd.config.md` declara stack "PostgreSQL" y `sdd/sdd-init.md` dice `expone_api_http: false`; la base real es MariaDB 10.4 y el backend Express expone `/api/*` (consumido por el SPA). Conviene corregirlo en `cierre`.
- Los slices declarados en `sdd.config.md` son de un cambio de contenido anterior; para este cambio se necesitan slices propios (p. ej. `backend-orden`, `intro`).

## Dirección visual definida por el usuario

La intro nueva es suave, sutil y elegante, al estilo de una hoja que pasa (page-turn). Queda descartada una animación pesada de "construcción de una casa" como la actual.

## Ambigüedades para Gate A

1. Si la casa se conserva como elemento inicial (por ejemplo, una ilustración estática en la "hoja" que pasa) o si se elimina por completo y la hoja revela directamente el selector o el logo KUVU.
2. Qué contiene la hoja que pasa: logo KUVU sobre fondo navy, una portada con la casa, o una superficie neutra.
3. Estilo del pase de hoja: curl realista de página con sombra, o un deslizamiento/pliegue plano y minimalista.
4. Duración aceptable: hoy son unos 5,65 s; la propuesta es entre 1,2 y 2 s.
5. Posibilidad de saltarla (clic, tecla o botón "Saltar") y si se recuerda entre recargas.
6. Comportamiento con `prefers-reduced-motion`: omitir como hoy, o un fundido breve.
7. Restricción de dependencias: CSS/Angular sin librerías nuevas, o se acepta alguna.
