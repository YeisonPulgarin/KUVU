## Seguridad — breadcrumb-y-cta-legible

**Resultado: sin vulnerabilidades confirmadas en el alcance del cambio. Sin cambios de
código.** Un hallazgo de higiene en una dependencia, que ya existía y no es alcanzable en este
despliegue, queda como propuesta fuera del cambio.

### Modelo de amenazas (resumen)

- **Activos / datos sensibles:** ninguno en el alcance. El cambio solo maneja etiquetas y
  rutas públicas estáticas (`pageNavLinks` en `content/site.ts`) y estilos. No hay PII,
  credenciales, sesión ni datos financieros. La spec no declara datos sensibles.
- **Fronteras de confianza y puntos de entrada:**
  - SPA solo cliente (Angular, sin SSR ni prerender), servida como estáticos.
  - Entradas del cambio: el input `items` de `app-breadcrumb` (lo fijan las páginas con
    constantes de código) y `document.location.origin` (lo fija el navegador; un atacante solo
    lo controla sirviendo la app desde su propio origen, donde ya controla todo).
  - No hay entrada de usuario, parámetros de URL, API ni almacenamiento en el flujo.
  - Sink nuevo: un `<script type="application/ld+json">` creado por DOM en `<head>`.
- **STRIDE-lite por componente:**

| Componente | Amenaza considerada | Conclusión |
|---|---|---|
| `PageMetaService.setBreadcrumb` | Tampering / XSS por el sink del script | No alcanzable: datos estáticos, `JSON.stringify` asignado a `textContent` de un elemento creado por DOM (sin parseo HTML), y el tipo `application/ld+json` es un bloque de datos que el navegador no ejecuta |
| `PageMetaService.clearBreadcrumb` | DoS / borrado de un nodo ajeno por colisión de id | Solo borra `#kuvu-breadcrumb-jsonld`, id propio. Sin impacto de seguridad |
| `BreadcrumbComponent` | XSS por interpolación o URL `javascript:` en `routerLink` | Interpolación `{{ }}` escapada por Angular. `routerLink` recibe rutas internas constantes y el router no navega a esquemas externos |
| `breadcrumbFor` | Información o error expuesto | Lanza error solo ante un href fuera de `pageNavLinks`, que es un error de programación cubierto por tests. Nunca ocurre con input externo |
| JSON-LD | Information disclosure | Publica etiquetas y URLs públicas del sitio y el origen local, que ya es visible para quien navega |
| `.cta-final` (SCSS) | — | Solo presentación, sin superficie |

### Hallazgos por severidad

**H-1 — Dependencia `@angular/router` 21.2.23 con aviso alto de DoS en SSR (higiene, ya existía)**
- Severidad: según el aviso, Alto. **En este despliegue: no alcanzable**, porque el aviso
  (GHSA-ff3f-86qr-9cv3, "Denial of Service via Numeric URL Matrix Parameters", rango
  `>=21.0.0 <21.2.24`) afecta a Angular con renderizado en servidor, y KUVU es una SPA solo
  cliente sin SSR.
- Categoría: OWASP A06 (componentes vulnerables), CWE-400.
- Descripción: versión del router dentro del rango afectado. La corrige el parche `21.2.24`
  (`fixAvailable: true`).
- Estado: **no corregido en este cambio**. El lockfile no forma parte del alcance y la versión
  viene del commit `d5c3abd`. Se propone como acción separada (abajo).
- ¿Cambia comportamiento observable?: no (actualización de parche).

**Hardening evaluado y descartado (security theater en el contexto actual)**
- *Escapar `<` como `<` en el JSON-LD:* protege contra cortar el `</script>` cuando el
  JSON se serializa como HTML en servidor. Aquí no hay SSR y el script se arma por DOM con
  `textContent`, así que no reduce ningún riesgo actual. Revisar si se agrega SSR/prerender
  **y** las etiquetas pasan a venir de una fuente no confiable (CMS, API).
- *Content-Security-Policy para el bloque JSON-LD:* los bloques de datos no se ejecutan, así
  que CSP no aplica a ellos. Una CSP general del sitio es infraestructura, fuera de este
  cambio.

### Acciones fuera del código (obligatorio marcar)

- **Secretos a ROTAR: ninguno.** Escaneo de patrones (claves de API, tokens, contraseñas,
  `AKIA…`, bloques PEM) sobre todos los archivos del cambio: sin coincidencias reales; las
  únicas son la palabra "token" en comentarios sobre tokens de diseño CSS. El número de
  WhatsApp de `site.ts` ya existía y es público por diseño.
- **Dependencias a actualizar (SCA):** `@angular/router` 21.2.23 → ≥ 21.2.24 (H-1). Propuesta
  para un cambio aparte: alinear todos los paquetes `@angular/*` a la misma versión de parche
  y correr suite y build. Prioridad baja mientras no haya SSR, y alta si se incorpora.
- **Configuración / infra a endurecer:** ninguna derivada de este cambio.

### Riesgo residual aceptado

- H-1, mientras siga sin actualizarse: riesgo nulo en el despliegue actual (sin SSR).
  Justificación: la vía vulnerable no existe en una SPA solo cliente. **Decisión del usuario:
  "actualizar después".** Queda como **cambio pendiente** a registrar en el `archive-report`:
  subir `@angular/*` a ≥ 21.2.24 (misma versión de parche en todos los paquetes) y correr
  suite y build. Prioridad **baja** mientras no haya SSR; **alta** si se incorpora SSR o
  prerender.
- JSON-LD con URLs del origen local (`http://localhost:…`): no es un riesgo de seguridad, es
  la limitación funcional ya declarada en la spec (sin dominio).

### Alcance de la búsqueda

- **Revisado:** `page-meta.service.ts` (+ spec), `components/public/breadcrumb/*`,
  `content/site.ts`, la integración en `pages/nosotros` y `pages/preguntas-frecuentes`, y el
  bloque `.cta-final` de `home.component.scss`.
- **SAST (grep dirigido):** `innerHTML`, `outerHTML`, `insertAdjacentHTML`,
  `bypassSecurityTrust*`, `eval`, `new Function`, `document.write`, `javascript:`. Única
  coincidencia: un comentario que dice que **no** se usa `innerHTML`.
- **Revisión manual:** flujo de datos de `items` (de las constantes al DOM y al JSON-LD),
  sink `textContent` y uso de `routerLink`.
- **Secret scanning:** los archivos del cambio. No se escaneó el historial completo de git: el
  cambio no agrega archivos de configuración ni credenciales, y está sin commitear.
- **SCA:** `npm audit --omit=dev`, con 1 hallazgo (H-1). `package.json` y el lockfile no
  cambian en este cambio.
- **DAST:** no aplica (no hay endpoints nuevos).
- **Fuera de alcance:** backend Node, módulo de gestión y autenticación, headers del servidor
  que sirve el frontend, dependencias de desarrollo.

Un análisis limpio no prueba ausencia de vulnerabilidades: el reporte cubre lo listado arriba.
