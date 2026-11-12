# Archive report — ingresar-color-marca

## Acciones fuera del código
- Secretos a rotar: ninguno. Dependencias: ninguna. Infra: ninguna (`secure-report`).
- Riesgo residual aceptado: ninguno.

## Qué se hizo
- Causa del bug: `AuthService` escribía el tema de la empresa en `<html>` (al iniciar sesión
  y al restaurarla en cada recarga). Eso teñía todo el documento, incluido el botón
  "Ingresar" del sitio público, con el color de la última empresa.
- Fix: `temaDeEmpresa()` es un cálculo puro y `<app-layout>` declara los tokens de la empresa
  en su host. El sitio público y el acceso usan siempre el azul KUVU de `:root`.
- Tests de regresión con una empresa amarilla: `AuthService` no escribe tokens en `<html>`
  (login y restauración) y un `.btn-primary` fuera del layout queda azul mientras uno dentro
  queda amarillo.

## Decisiones
- Acotar el tema al layout (causa) en lugar de fijar el azul en los botones públicos
  (síntoma). El enfoque previo de `sitio-publico-expresivo` (R5.4) compartía los tokens con el
  tema de empresa y por eso no protegía el azul.

## Verificación
- `ng test` 709/709 en verde; `ng build` sin errores (warnings `css-inline-fonts`
  preexistentes). Re-verificado tras `secure` (sin hallazgos) y `refine` (sin cambios).

## Documentación
- `docs/ingresar-color-marca.md` (nuevo).
- `docs/architecture.md`: componentes de la app de gestión y decisiones estructurales.
- `CHANGELOG.md` (Unreleased → Fixed): "Ingresar" siempre azul KUVU.
- README: no aplica (no cambian instalación, comandos ni descripción). OpenAPI/Bruno: no
  aplica (sin endpoints HTTP).

## Deuda y no tocado (de `refine-report`)
- `components/shared/navbar/` sin uso (único consumidor de `--color-primario` fuera del
  layout): candidato a borrarse en un cambio de limpieza.
- Comentarios `✅ FIX` en `restaurarSesion()` y los cuatro bindings de host: dejados así (KISS).

## Pendientes
- **Entrega y despliegue:** commits solo locales en `release/integracion` (`6e4163b` a este
  archivo), sin push, sin PR y sin deploy. El usuario decide el despliegue.
- Tras desplegar, las pestañas abiertas con la versión anterior conservan el color hasta
  recargar.
- Extensión `git` no activa: sin CI ni PR que registrar.
