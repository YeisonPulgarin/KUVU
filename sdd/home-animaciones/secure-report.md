## Seguridad — home-animaciones

Estado analizado: `974ccf1` (diff `3e48726..974ccf1`). Resultado: **sin vulnerabilidades
confirmadas en el cambio y sin fixes aplicados.** Hay un hallazgo de higiene en una dependencia
que ya existía, no alcanzable en este despliegue.

### Modelo de amenazas (resumen)

- **Activos / datos sensibles:** ninguno nuevo. El cambio es de presentación: no lee ni escribe
  datos de usuario, credenciales, tokens, almacenamiento del navegador ni la API. Los textos que
  anima salen de la plantilla o de `content/*` (estáticos, compilados en el bundle).
- **Fronteras de confianza y puntos de entrada:**
  - URL del navegador (path y fragment): la leen `anchor-smooth-scroll.ts` y el hook de
    transición, pero solo para comparar paths y decidir si poner una clase CSS en `<html>`.
    El valor nunca se escribe al DOM ni a estilos.
  - Eventos del navegador (`scroll`, `resize`, `pointermove`, `matchMedia change`,
    `IntersectionObserver`): solo producen números que se publican como variables CSS
    (`toFixed`, acotados).
  - `data.publicSite` en las rutas: flag de **presentación** en el cliente. No controla acceso;
    las rutas autenticadas siguen protegidas por sus guards y, en definitiva, por el backend.
- **STRIDE-lite:**
  - *Spoofing / Elevation:* el cambio no toca guards, servicios de auth ni la intro de acceso
    (specs de intro, login y guards sin cambios y en verde).
  - *Tampering / Info disclosure:* no hay sinks de HTML ni URLs dinámicas (ver "Alcance").
  - *DoS (cliente):* el trabajo por evento está acotado: un rAF por ráfaga, listeners pasivos,
    observers que desactivan targets fuera de la vista, y todo se libera al salir de la home.
    No hay bucles ni timers sin tope; el `setTimeout` de anclas se limpia a los 1.000 ms.
  - *Repudiation:* no aplica (sin acciones de usuario con efecto).

### Hallazgos por severidad

**H-1 — `@angular/router` 21.2.23 con advisories de DoS en SSR**

- Severidad: Alto según `npm audit`. **No alcanzable** en este proyecto: los tres advisories
  (GHSA-ff3f-86qr-9cv3, GHSA-62vg-58rm-qff7, GHSA-57xq-rjx2-v5xh) afectan solo al
  renderizado en servidor, y la app es un SPA sin SSR (`angular.json` sin `server`/`ssr`, sin
  `@angular/ssr`). Riesgo efectivo: bajo.
- Categoría: OWASP A06 (componentes vulnerables), CWE-400.
- Descripción: versiones 21.0.0–21.2.24 del router permiten agotar recursos del servidor de
  SSR con URLs construidas.
- Estado: **no corregido en este cambio** (higiene). La dependencia ya estaba antes del cambio
  y este cambio no agrega dependencias. Actualizarla es un bump de Angular (todo el grupo
  `@angular/*` a ≥ 21.2.25), fuera del alcance de `home-animaciones`.
- Fix recomendado y capa: actualizar `@angular/*` en un cambio propio, con su suite.
- ¿Cambia comportamiento observable?: no.

No hay hallazgos en el código del cambio.

### Acciones fuera del código (obligatorio marcar)

- Secretos a ROTAR: **ninguno** (sin secretos en el diff; ver "Alcance").
- Dependencias a actualizar (SCA): `@angular/router` (y el resto de `@angular/*` para mantener
  versiones alineadas) a ≥ 21.2.25, como cambio aparte. Pasa a prioridad alta si el proyecto
  adopta SSR.
- Configuración / infra a endurecer: ninguna derivada de este cambio.

### Riesgo residual aceptado

- H-1 queda abierto hasta el bump de Angular. Justificación: no es alcanzable sin SSR y no lo
  introdujo este cambio. **Aceptado por el usuario (Wilson Solano) el 2026-11-08**, cuando
  respondió "sí" en la pausa de `secure`.
- `data.publicSite` es un flag del cliente: si en el futuro alguien lo usara para decidir
  acceso, sería un control evadible. Queda anotado como convención en `sdd/sdd-init.md`
  (flag de presentación) y va a `docs/architecture.md` en `document`.

### Alcance de la búsqueda

- **SAST manual + grep sobre el diff:** sinks de HTML y JS (`innerHTML`, `outerHTML`,
  `insertAdjacentHTML`, `document.write`, `eval`, `new Function`, `bypassSecurityTrust*`,
  `DomSanitizer`), `setAttribute`, `[href]` dinámicos, `window.open`, `location.*`,
  `postMessage` y almacenamiento del navegador: **ninguna ocurrencia**. Todo `setProperty` del
  diff escribe números formateados (`toFixed`) en variables CSS propias. El texto de
  `<app-split-text>` se renderiza por interpolación de Angular (escapado).
- **Secret scanning** del diff (patrones de API keys, tokens, passwords, claves privadas): sin
  hallazgos. No se rescaneó el historial completo del repo: el cambio no toca credenciales.
- **SCA:** `npm audit --omit=dev` (1 hallazgo, H-1). Sin dependencias nuevas en el cambio.
- **DAST:** no aplica (el cambio no agrega endpoints; el backend no se tocó).
- **Revisión de autorización:** guards y rutas autenticadas sin cambios; el flag nuevo no
  interviene en autorización.
- **Fuera de alcance:** backend, base de datos, infraestructura y el resto del frontend no
  tocado por el diff. Un scan limpio no prueba ausencia de vulnerabilidades.
