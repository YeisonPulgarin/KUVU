# Secure Report — logo-responsive

## Seguridad — logo-responsive

### Modelo de amenazas (resumen)
- **Activos / datos sensibles:** ninguno nuevo. El cambio es presentacional: logo estático (`public/Logo_Kuvu.jpeg`), CSS responsive y signals de UI del sidebar. No maneja datos más allá de los que ya renderizaban los templates existentes.
- **Fronteras de confianza y puntos de entrada:** asset público estático (imagen) + plantillas de componentes. Sin endpoints nuevos, sin cambios de auth/authz, sin nuevo almacenamiento.
- **Contexto de despliegue:** SPA Angular admin + públicas. Cambio no modifica servidor, headers ni red.

### Hallazgos por severidad

No se encontraron hallazgos dentro del alcance del cambio.

- Revisión manual del diff de presentación: los templates usan interpolación `{{ }}` (escapada por Angular) y rutas estáticas (`/Logo_Kuvu.jpeg`). El SVG del hamburger del sidebar es inline con paths estáticos — sin input de usuario → sin XSS/inyección.
- No hay `innerHTML`, `eval`, `bypassSecurityTrust` ni construcción dinámica de atributos en el código nuevo (grep sobre `sidebar/` limpio).
- Suscripciones: `matchMedia` se limpia con `destroyRef.onDestroy` (sin leak). La suscripción a `router.events` es vida-app (el sidebar vive lo que la app); no es un leak: el `Router` es singleton de la app y no se destruye.
- `kavu_mobile/` se eliminó entera (reduce superficie; el historial de git la conserva, ver acciones fuera del código).

| Severidad | Categoría | Descripción | Estado |
|---|---|---|---|
| — | — | Sin hallazgos explotables alcanzables dentro del cambio | — |

### Hallazgo SCA (baseline general, fuera del alcance del cambio)

- **Severidad: Alta (3 high / 5 moderate)** — GHSA-58w9-8g37-x9v5, GHSA-f3m7-gqxr-g87x, GHSA-jj27-h5hq-8x99, GHSA-hh8m-fm6v-7cvg.
- **Categoría:** SCA — XSS por bypass de sanitización en Angular (two-way property binding, host bindings, atributos event-handler i18n).
- **Descripción:** `@angular/core|compiler|router|common|forms` instalados en **21.2.8** están dentro del rango vulnerable `21.0.0-next.0 – 21.2.19`. Primera versión parcheada: **21.2.20** (disponibles hasta 21.2.23).
- **Estado: CORREGIDO** (decidido por el usuario, `Actualizar ahora`).
- **Fix aplicado:** `@angular/*` actualizados de **21.2.8 → 21.2.23** (build/cli 21.2.24). `npm audit --omit=dev --audit-level=high` → **0 vulnerabilidades**. Build OK y tests 19/19 verdes tras el upgrade (re-verify).
- **Capa:** actualización de dependencias (SCA) — misma línea minor, sin cambio de API.
- **¿Cambia comportamiento observable?** No (patch-level). Verificado con build + suite completa.
- **Alcanzabilidad:** no confirmada — no se alcanza desde el código de este cambio (solo presentación, sin los patrones de binding afectados); aplica al baseline general del proyecto.
- **¿Cambia comportamiento observable?** El upgrade por sí mismo no (patch-level, mismo minor), pero tocar dependencias en un PR puramente visual inflaría el alcance y requiere re-verificación del build — por eso se separa como trabajo nuevo.

### Acciones fuera del código (obligatorio marcar)
- **Secretos a ROTAR:** ninguno.
- **Dependencias a actualizar (SCA):** ✅ CORREGIDO — `@angular/*` en **21.2.23** (build/cli 21.2.24), audit 0 vulns, build + tests verdes.
- **Configuración / infra a endurecer:** ninguno adicional en este cambio.
- **Historial git:** `kavu_mobile/` persiste en el historial (eliminada del working tree). No contenía secretos (solo assets/plantillas), así que no requiere purga.
- **Hardening recomendado por deuda previa (no bloqueante):** revisar a futuro headers de seguridad y CSP en el despliegue (nginx) — fuera de alcance del cambio.

### Riesgo residual aceptado
- **XSS vía framework (Angular < 21.2.20)** — el proyecto entero corre con una versión con bypasses de sanitización conocidos. Impacto: XSS en contexto admin (robo de sesión si cookies no HttpOnly). Se acepta **temporalmente** hasta decidir el upgrade como cambio separado. Quien acepta: <usuario, vía orquestador> — requiere confirmación en la pausa de secure.

### Alcance de la búsqueda
- **Qué se buscó:** revisión manual del diff completo del cambio (templates, TS, SCSS), patrones de inyección/secrets en el código nuevo (`innerHTML`, `eval`, `bypassSecurityTrust`, `api_key`, `password=`), gestión de suscripciones (leaks), y **SCA** (`npm audit --omit=dev --audit-level=high`).
- **Con qué:** grep dirigido + `npm audit` + revisión manual de diffs.
- **Fuera del alcance:** el backend Node.js (no tocado), la infraestructura de despliegue (nginx/docker — sin cambios), y el análisis DAST del sistema completo (no hay endpoints nuevos). Un scan limpio no es prueba de ausencia de vulnerabilidades.