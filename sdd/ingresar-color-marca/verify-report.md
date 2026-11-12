# Verify report — ingresar-color-marca

Estado verificado: `6e4163b` (fix) y `7904e54` (artifacts) sobre `release/integracion`.
Slices completados: `intro`, `app`, `cierre`. Omitidos: ninguno.

## Tests y build
- `npx ng test --watch=false --browsers=ChromeHeadless`: **709/709 en verde** (los `ERROR`
  en consola son logs esperados de specs existentes de errores 500).
- `npx ng build`: sin errores; solo los warnings `css-inline-fonts` preexistentes de
  landing/login.

## Criterios de aceptación
| CA | Resultado | Evidencia |
|---|---|---|
| CA-1 sesión restaurada sin tokens en `<html>` + "Ingresar" azul | pasa | `auth.service.spec.ts` ("restoring a saved session") + `app-layout.component.spec.ts` (`.btn-primary.afuera` con `rgb(43, 76, 140)` y `rgb(58, 111, 216)`, sin amarillo) |
| CA-2 login sin tokens en `<html>` | pasa | `auth.service.spec.ts` ("when signing in") |
| CA-3 tokens de empresa en el host del layout | pasa | specs "company brand" (cuatro tokens, contraste `#1a202c` sobre amarillo; botón interno amarillo) + `temaDeEmpresa` (blanco sobre azul oscuro) |
| CA-4 sin empresa, sin tokens | pasa | spec "declares no tokens without an active company" |
| CA-5 suite y build | pasa | arriba |

## Ejes del protocolo
- **Documentación declarada:** `tasks.md` prevé CHANGELOG (Fixed) y `docs/architecture.md`.
- **Guidelines:** sin sección Angular en `DEVELOPMENT_GUIDELINES.md`; se sigue `sdd-init.md`
  (convención nueva registrada allí). OK.
- **Logs:** sin logs (UI). OK.

## Desvíos y observaciones
- Desvío de entrega: los slices `intro` y `app` van en un solo commit de código (`6e4163b`);
  separados, el commit intermedio dejaba la app interna sin color de empresa.
- Las fases propose a tasks se escribieron directamente en la misma sesión, siguiendo las
  skills ya cargadas para el cambio anterior.
- Toda superficie interna que use la marca debe estar dentro de `<app-layout>`; hoy lo están
  las seis pantallas con `authGuard`/`adminGuard`. `shared/navbar` (sin uso) quedaría azul.
- Tras desplegar, una pestaña abierta con la versión anterior conserva el inline en `<html>`
  hasta recargar.

## Re-verificación (después de secure y refine)
Estado verificado: `adc549a` (secure sin hallazgos) y `76f7243` (refine sin cambios). Ninguna
de las dos fases tocó código.
- `ng test`: **709/709 en verde**. `ng build`: sin errores (mismos warnings
  `css-inline-fonts` preexistentes).
- CA-1 a CA-5 siguen pasando. Sin desvíos nuevos. Habilita `document` y `archive`.
