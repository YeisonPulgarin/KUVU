---
name: sdd-secure
description: This skill should be used after sdd-verify, before sdd-refine, to threat-model the change, triage security findings by exploitability and reachability, and fix confirmed vulnerabilities in the right layer. Defensive scope only — finds and closes weaknesses in the user's own code and infra, never produces exploits. Optional phase, always offered to the user.
---

# Fase: secure

Lee `AGENTS.md` antes de continuar. Esta skill implementa la fase 10 del ciclo
("Security gate: ¿lo construido resiste una amenaza real?"). Es **opcional** — el orquestador
la ofrece siempre tras `verify`, junto con `refine`, y el usuario decide si corre una, las dos
o ninguna. Si corre, `verify` se vuelve a correr al terminar, antes de `archive`.

También es invocable sobre código o infraestructura existente sin haber pasado por el ciclo
completo, en cuyo caso el alcance lo define el usuario en lugar de la spec.

**Alcance defensivo.** Esta fase encuentra y corrige debilidades en el código y la infra del
propio proyecto. No produce exploits ni instrucciones de ataque: describe cada vulnerabilidad
con el mínimo detalle necesario para remediarla.

## Principio rector — leé esto antes que cualquier otra cosa

La postura se **invierte** respecto de `refine`: allí el default es "no cambiar"; acá **una
vulnerabilidad confirmada y alcanzable no se puede ignorar**. Pero el filtro sigue existiendo,
orientado distinto:

**Todo control tiene que mapear a una amenaza real del modelo. Si no reduce riesgo real, es
*security theater* y se descarta.**

Posturas no negociables:

- **Nunca confíes en el input ni en el cliente.** Todo lo que cruza una frontera de confianza
  es hostil hasta que se demuestre lo contrario. La validación y la autorización viven en el
  **servidor**, siempre.
- **Deny-by-default.** El acceso, las acciones y las excepciones fallan cerrado.
- **Defensa en profundidad.** Ninguna defensa única alcanza; capas para que un fallo no sea fatal.
- **Assume breach.** Diseñá como si una capa ya estuviera comprometida: minimizá el daño de un
  secreto filtrado, un token robado o un servicio caído.
- **No inventes cripto ni auth.** Librerías y estándares vetados. Rodar tu propio esquema de
  criptografía o de sesión es un smell de seguridad en sí mismo.

**Regla cardinal:** primero **modelo de amenazas**, después triage por **explotabilidad y
alcanzabilidad** — nunca por volumen del scanner.

## Triage — no todos los hallazgos son iguales

Clasificá cada hallazgo en dos ejes antes de tocar nada:

| Clase | Qué es | Acción |
|---|---|---|
| **Vulnerabilidad confirmada** | explotable y **alcanzable** en este contexto | fix priorizado por severidad (impacto × probabilidad) |
| **Hardening / defensa en profundidad** | sin vuln confirmada, pero reduce superficie o contiene un fallo futuro | aplicar solo si mapea a una amenaza del modelo |
| **Higiene** | secretos, dependencias desactualizadas, configuración | corregir; es parte del baseline |

Severidad por impacto y explotabilidad, estilo CVSS: qué se compromete (confidencialidad,
integridad, disponibilidad) y qué tan fácil es. **Confirmá alcanzabilidad antes de marcar algo
como crítico** — un SQLi en código muerto no es un crítico. Pero nunca descartes sin razonar:
la ausencia de explotabilidad hoy no es ausencia mañana si el código cambia.

> Contraste con `refine`: allí "no cambiar" es un resultado frecuente y válido. Acá, ante una
> vuln confirmada y alcanzable, "no cambiar" **no** es una opción — a lo sumo el riesgo se
> acepta explícitamente, con justificación y con nombre de quién lo acepta.

## Entradas

- `sdd/{change-name}/spec` — qué datos maneja el sistema y su **clasificación de sensibilidad**
  (PII, credenciales, financieros), qué exige en auth/autorización, quiénes son los actores.
- `sdd/{change-name}/design` y `verify-report` — qué se construyó y qué ya se validó.
- El código, SQL, infra, IaC y configuración afectados.
- El manifiesto de dependencias (para SCA).
- El modelo de autenticación y autorización existente.
- El contexto de despliegue: ¿internet-facing o interno? ¿multi-tenant? ¿qué fronteras de red hay?
- El historial de git, para buscar secretos filtrados en commits pasados.

## Pipeline — en orden

1. **Modelo de amenazas.** Mapeá activos (qué protegés), **fronteras de confianza**, puntos de
   entrada y flujos de datos. STRIDE-lite por componente: Spoofing, Tampering, Repudiation,
   Information disclosure, Denial of service, Elevation of privilege. Esto define qué buscar y
   cómo priorizar; sin esto, el resto es ruido.
2. **Detectar.** Combiná herramientas y revisión manual sobre las categorías de
   `references/categorias.md`:
   - **SAST** para patrones de inyección y similares.
   - **Secret scanning** en el código **y en el historial de git**.
   - **SCA** para dependencias vulnerables y supply chain.
   - **DAST** donde haya endpoints ejecutables.
   - **Revisión manual de la lógica de autorización** — las herramientas la detectan mal; IDOR
     casi siempre requiere ojo humano o del agente sobre el modelo de datos.

   Para los stacks del ecosistema (Go, Next.js, Astro, nginx, Docker) hay material concreto en
   `references/` — patterns vulnerables y seguros lado a lado, valores de headers, y
   configuración endurecida. Usalo como guía de qué buscar en ese stack.

   **Conocé el límite de las herramientas:** falsos positivos y, sobre todo, falsos negativos.
   Un scan limpio no es "no hay vulnerabilidades".
3. **Triage.** Explotabilidad × alcanzabilidad × severidad. Confirmá que el hallazgo es real y
   alcanzable antes de escalarlo.
4. **Corregir en la capa correcta.** No parchees el síntoma donde aparece: parametrizá en la
   query, encodeá en el sink, autorizá en el servidor. Un fix que **cambia el comportamiento
   observable** (por ejemplo, ahora rechaza input que antes se aceptaba) se **declara
   explícitamente** y, si es material, toca la `spec` — nunca se aplica en silencio.
5. **Verificar.** Confirmá que el fix **cierra** la vía y no solo la mueve, idealmente con un
   test de regresión de seguridad que fallaría si la vuln vuelve.
6. **Endurecer.** Agregá capas de defensa en profundidad donde el modelo de amenazas las
   justifique — ver `references/arquitectura-segura.md`.
7. **Reportar.** Por severidad, sin detalle explotable innecesario, marcando lo que requiere
   **rotación de secretos** y el **riesgo residual** aceptado.

## Material de referencia

Leelo cuando el hallazgo caiga en ese dominio, no de entrada:

- `references/categorias.md` — las categorías de vulnerabilidad como lentes (OWASP Top 10 /
  CWE-SANS Top 25), cada una con su **patrón de fix correcto** y el **gotcha** que hace que
  devs y agentes lo hagan mal.
- `references/validacion-encoding.md` — validación de entrada vs encoding de salida: dos
  defensas distintas, en puntos distintos, que no hay que confundir.
- `references/arquitectura-segura.md` — least privilege, defensa en profundidad, fail secure y
  logging/auditoría seguros.

Material concreto por stack, para la pasada de detección y para escribir el fix:

- `references/owasp-top10.md` — OWASP Top 10 con patterns vulnerables y seguros lado a lado en
  Go, Next.js y Astro, y los CWE asociados a cada riesgo.
- `references/headers-checklist.md` — tabla de security headers con valores recomendados y
  dónde configurarlos según el stack.
- `references/nginx-hardening.md` — configuración endurecida de nginx: TLS, headers, límites.
- `references/docker-hardening.md` — contenedores sin root, capabilities, superficie mínima.

## Artifact que produce

`sdd/{change-name}/secure-report`:

```
## Seguridad — {change-name}

### Modelo de amenazas (resumen)
- Activos / datos sensibles: ...
- Fronteras de confianza y puntos de entrada: ...

### Hallazgos por severidad
Por cada uno:
- Severidad: {Crítico | Alto | Medio | Bajo} + explotabilidad / alcanzabilidad
- Categoría: {OWASP / CWE}
- Descripción: mínima para remediar, sin exploit
- Estado: {Corregido | Mitigado | Riesgo aceptado}
- Fix aplicado y capa: ...
- Verificación / test de regresión: ...
- ¿Cambia comportamiento observable?: sí/no → (spec)

### Acciones fuera del código (obligatorio marcar)
- Secretos a ROTAR: {cuáles} (+ purga de historial)
- Dependencias a actualizar (SCA): ...
- Configuración / infra a endurecer: ...

### Riesgo residual aceptado
- {riesgo} — justificación + quién lo acepta

### Alcance de la búsqueda
- Qué se buscó, con qué herramientas, y qué quedó fuera de alcance.
```

**Un scan limpio no es prueba de ausencia de vulnerabilidades.** El reporte dice qué se buscó,
con qué, y qué quedó afuera — no promete un sistema "seguro" en absoluto.

## No hagas

- **No debilites un control de seguridad para hacer pasar un test.** Si un test falla por un
  fix de seguridad, se ajusta el test, no el control.
- **No filtres detalle explotable** en reportes, PRs o comentarios. El mínimo para remediar.
- **No des por resuelto un secreto al borrarlo del código.** Ya está comprometido: marcalo para
  **rotación** y purga de historial. Ver `references/categorias.md` → Secretos hardcodeados.
- **No apliques en silencio un fix que cambia comportamiento observable.** Declaralo y, si es
  material, llevalo a la `spec` vía el orquestador.
- **No ruedes tu propia criptografía ni tu propio esquema de autenticación.**
- **No agregues controles sin amenaza en el modelo** — rotación forzada de contraseñas,
  validación agresiva que rompe datos legítimos, tokens CSRF donde no hay sesión por cookie.
- **No corrijas el síntoma en vez de la causa.** El fix va en la capa correcta.
- No le hables al usuario directamente: la aceptación de un riesgo residual y cualquier cambio
  de spec se devuelven al orquestador.
