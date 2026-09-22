# Secure-report — sitio-contenido

## Modelo de amenazas (resumen)

- **Activos / datos sensibles:** ninguna PII, credencial ni dato financiero en alcance. El
  único "dato" es el número de WhatsApp de contacto (`573223192760`) y su mensaje prefilled,
  **públicos por diseño** (es el CTA de contacto del sitio de marketing).
- **Fronteras de confianza y puntos de entrada:** 3 rutas públicas de contenido estático
  (`/`, `/nosotros`, `/preguntas-frecuentes`). Cero formularios, cero input de usuario, cero
  llamadas a API, cero escritura. Los únicos datos que fluyen son constantes TS tipadas en
  `src/app/content/*.ts` renderizadas por interpolación Angular (`{{ }}`).
- **Actores:** visitantes anónimos. Cualquier flujo autenticado (`/acceder`, `/login`,
  dashboard) es preexistente y está **fuera del alcance** de este cambio.

## STRIDE-lite por componente

| Amenaza | Relevancia | Verificación |
|---|---|---|
| Spoofing / Tampering / Repudiation | n/a | No hay actores autenticados ni escrituras en este cambio |
| Information disclosure | Baja | Contenido institucional ya verificado sin mecanismos internos (tests bloquean `cifrado/encriptad/servidor/base de datos/infraestructura`); solo texto público intencional |
| Denial of service | n/a | No se agregan endpoints ni superficie server-side |
| Elevation of privilege | n/a | Rutas nuevas intencionalmente públicas, sin guards; el wildcard final (`redirectTo: /login`) no cambió |

## Hallazgos por severidad

**Sin vulnerabilidades confirmadas ni alcanzables dentro del alcance del cambio.**

Pasada de detección aplicada (revisión manual + grep dirigido):

1. **XSS (OWASP A03 / CWE-79).** Interpolación Angular escapa por default. Se buscó
   `innerHTML`, `bypassSecurityTrust*`, `DomSanitizer`, `eval`, `document.write` en
   `components/pages/`, `components/public/` y `content/`: **cero coincidencias**. Todo el
   contenido viaja por `{{ }}`.
2. **Reverse tabnabbing (CWE-1022).** Todos los enlaces externos con `target="_blank"` llevan
   `rel="noopener"`: CTA de `/nosotros`, icono de WhatsApp del header y CTA del footer
   (verificado en los 3 templates). El resto son `routerLink` internos sin `target`.
3. **Open redirect (OWASP A04).** Las URLs que salen del sitio son estáticas
   (`https://wa.me/...` desde `contactWhatsAppLink`) o `routerLink` con literales del repo. No
   hay parámetro de URL ni input que defina un destino. No aplica.
4. **Information disclosure (OWASP A01/02).** Sin datos sensibles nuevos. El contenido de
   seguridad del sitio no expone mecanismos internos (criterio de aceptación 4, con tests).
5. **Secret scanning.** Los archivos nuevos del cambio no contienen secretos: solo el número
   de WhatsApp, que es público y está **dentro** del reproducción intencional (footer/header/CTA)
   — no es un secreto. No se hallaron credenciales ni tokens.
6. **SCA.** Este cambio no agrega ni modifica dependencias (`package.json` intacto en el slice
   `paginas`). Sin superficie nueva de supply chain.

### Observación fuera de alcance (no aplicada en este cambio)

- `src/app/components/pagos/pagos.component.ts:167` usa `ventana.document.write(html)`.
  Es un componente **interno de la app autenticada, preexistente y ajeno** a `sitio-contenido`.
  No se corrige acá (fuera del alcance de este cambio; tocaría un módulo activo de la app).
  Se registra como **work item de seguridad pendiente** para un cambio dedicado.

## Acciones fuera del código

- **Secretos a ROTAR:** ninguno (no hay secretos en el cambio).
- **Dependencias a actualizar (SCA):** ninguna afectada por este cambio.
- **Configuración / infra a endurecer:** ninguno requerido por este cambio (no hay servidor
  propio del sitio; es SPA estática servida por la infra existente).

## Riesgo residual aceptado

- **Preexistente y fuera de alcance:** `document.write` en `pagos.component.ts` — no se
  acepta, se delega a un cambio de seguridad dedicado (registrado arriba).
- **Sin riesgo residual aceptado intencionalmente en este cambio:** el resultado del threat
  model no encontró vulnerabilidad alcanzable; "sin hallazgos accionables" es el resultado
  legítimo de esta fase.

## Alcance de la búsqueda

- **Qué se buscó:** patrones de inyección/sink peligrosos, enlaces externos sin
  `rel="noopener"`, prosecución de open redirect, exposición de detalles internos, y secretos
  en los archivos agregados/modificados por el cambio `sitio-contenido`.
- **Con qué:** revisión manual de templates/TS + grep dirigido sobre `components/pages/`,
  `components/public/` y `content/` + verificación de tests existentes (bloqueo de términos de
  seguridad). Sin herramientas SAST/DAST automáticas: el cambio no expone ejecución server-side
  ni input de usuario, donde esas herramientas tendrían superficie que analizar.
- **Qué quedó fuera:** la app autenticada interna (dashboard/contratos/pagos/locales/usuarios)
  y sus datos, el backend, la infraestructura de despliegue, y el historial completo de git del
  repo (el cambio no introduce secretos; la copia de secretos históricos es una tarea de repo,
  no de este work item).

## Veredicto

**Sin vulnerabilidades confirmadas y alcanzables en el cambio.** Un scan limpio no prueba
ausencia: el reporte documenta qué se buscó y qué quedó fuera. Unica observación: el defecto
`document.write` de `pagos` (preexistente, out-of-scope) listado como work item dedicado.

```
secure_status: sin hallazgos accionables en alcance
comportamiento_observable_cambiado: no
secretos_a_rotar: ninguno
work_items_pendientes: audit/remoción de document.write en pagos.component.ts
```