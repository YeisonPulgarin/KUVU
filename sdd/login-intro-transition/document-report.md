# Document report — login-intro-transition

```
docs_archivo: docs/login-intro-transition.md (creado)
architecture: actualizado: completado el template de docs/architecture.md con la arquitectura real
  (vista de componentes, capas, flujos de request/auth/sesión, decisiones estructurales, límites
  y no-goals, incluyendo el riesgo de autorización de la API)
guidelines: sin cambios — el cambio no introduce una convención nueva de código (el naming en
  español del proyecto es una convención local preexistente, ya validada en verify)
openapi: no aplica: el cambio no agrega, quita ni modifica rutas ni request/response bodies HTTP;
  POST /api/auth/login y GET /api/empresas quedaron intactos
collections: no aplica: no hay endpoints HTTP nuevos ni modificados (misma razón que openapi)
changelog: entrada agregada bajo [Unreleased] — secciones Added (intro, selección) y Changed
  (rediseño /login, separación de la selección con vuelta sin re-intro)
readme: secciones afectadas actualizadas en fronted/proyecto_angular/README.md — árbol de
  estructura (agrega landing, auth-intro, intro-state.service) y nota de credenciales/flujo de
  acceso en /acceder. El resto del README (Angular 19, DataService como fuente, credenciales con
  contraseña) está desactualizado de base y queda fuera del alcance de este cambio
desvios: ninguno entre design y lo implementado; la intro se resolvió como `AuthIntroComponent` y
  el servicio como `IntroStateService` (design proponía `LoginIntroComponent`), nombres del design
  aproximados — el código es la fuente de verdad y los docs describen los nombres reales
```

## Notas

- Estándar de tiempo presente aplicado en `docs/login-intro-transition.md` y en las secciones
  actualizadas de `architecture.md`.
- La deuda registrada por `secure` (autorización de la API y PII en localStorage) quedó como
  Limitaciones conocidas en el feature doc, junto con los warnings de bundle.