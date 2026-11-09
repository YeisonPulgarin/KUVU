stack: Angular 21, TypeScript, RxJS (frontend/proyecto_angular) / Node.js 22 + Express 4 + mysql2 + bcryptjs (backend/) / MariaDB 10.4 en Docker
test_command: ng test (frontend) / npm test (backend, node --test)
test_mode: test-after
config_found: true
slices_declarados: [backend-orden, contenido, chrome, paginas, home, intro, app, cierre]
expone_api_http: true
docs_existentes: docs/

## Convenciones del frontend relevantes para próximos cambios

- `frontend/proyecto_angular/src/app/motion/`: piezas de movimiento reutilizables y sin
  dependencias. `motion-preferences.ts` es la única fuente de las media queries de movimiento
  en TS (`reducedMotion`, `finePointer`, `desktop`). Además están `ScrollMotionService`,
  `[appScrollProgress]`, `<app-split-text>` y `[appMagnetic]`. Los dobles de test
  (`matchMedia`, `requestAnimationFrame`, `IntersectionObserver`) están en `motion/testing/`.
- `ScrollMotionService` no es `providedIn: 'root'`: lo provee el componente que lo usa (hoy
  `HomeComponent`), así que el injector de ese componente lo destruye junto con sus listeners.
  Un componente que use `[appScrollProgress]` necesita un ancestro que lo provea.
- Movimiento: el JS publica variables CSS (`--p`, `--page-progress`, `--mx`/`--my`) y el CSS
  anima, siempre dentro de `prefers-reduced-motion: no-preference`. Los tokens de duración,
  curva y distancia están en `src/styles/_motion.scss`.
- Rutas del sitio público: llevan `data: { publicSite: true }` en `app.routes.ts`.
  `route-view-transition.ts` (transición propia entre páginas públicas, compuesta con el salteo
  de la intro) y `anchor-smooth-scroll.ts` solo actúan entre rutas con ese flag.
- Estilos de componentes: evitá `@apply` de Tailwind cuando el componente va en el bundle
  inicial. Tailwind v4 lo expande con fallbacks y un bloque `@layer properties` en cada
  componente, y el presupuesto inicial es ajustado.
- Tokens de marca del sitio público (`--color-brand-*`, `--color-home-*`, `--radius-*`): se
  declaran en el bloque `@theme static` de `src/styles.css`, así que Tailwind los emite siempre
  en `:root` aunque ninguna utilidad los use. Los overrides oscuros están en `.dark` del mismo
  archivo. Los componentes los consumen con `var(--token)`, sin fallback literal, y sus nombres
  pueden escribirse tal cual en `.ts`/`.html` (el escaneo de Tailwind no cambia lo que se emite).
  Un token nuevo de marca va en ese bloque, no en un `:root` aparte.

## Convenciones del backend relevantes para próximos cambios

- `backend/auth/`: contraseñas (`password.js`, bcryptjs costo 12), política (`password-policy.js`,
  lista negra en `common-passwords.js`), credenciales y bloqueo por intentos (`credentials.js`),
  autorización de administrador por re-verificación de credenciales (`admin.js`) y logs JSON de
  autenticación con allowlist de campos (`auth-log.js`). La API no tiene sesión: una operación
  sensible se autoriza con las credenciales completas de quien la pide.
- Las consultas de `usuarios` enumeran columnas: nunca `SELECT u.*` (el hash y el estado de bloqueo
  no salen del servidor).
- Esquema de BD: `db/init/01-02` son el dump base; los cambios de esquema van en scripts
  idempotentes y solo aditivos (`03-…`), que corren en una instalación nueva y se aplican a mano a
  una BD existente después de un respaldo en `db/backups/`.
- Tests de rutas: `backend/test/helpers/fake-db.js` (doble de `mysql2` que responde por forma de
  SQL) y `route-harness.js` (Express efímero con el doble instalado en `require.cache`).
