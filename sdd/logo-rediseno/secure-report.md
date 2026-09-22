# Secure-report — logo-rediseno

## Seguridad — logo-rediseno

### Modelo de amenazas (resumen)
- **Activos / datos sensibles:** assets estáticos de branding (4 PNG en `public/logo-rediseno/`,
  favicon). No hay datos de usuario, PII, credenciales ni datos financieros en el alcance.
- **Fronteras de confianza y puntos de entrada:** ninguna nueva. El cambio es presentación:
  imágenes estáticas públicas y referencias fijas en templates. No hay input de usuario,
  endpoints HTTP, autenticación, autorización, cookies ni sesión en el alcance.
- **Flujos de datos:** el navegador solicita los PNG estáticos; servido por el hosting estático
  de Angular (`public/` → dist). Sin procesamiento en servidor.

### Hallazgos por severidad

Sin vulnerabilidades confirmadas, alcanzables ni hardening con amenaza real detrás.

- **Categoría considerada — XSS / inyección de imagen:** los assets son **PNG**, no SVG. PNG no
  admite contenido ejecutable. Sin riesgo.
- **Categoría considerada — redirección / path traversal:** los `src` están en constantes
  fijas (`content/logo.ts`) o hardcodeados en templates; no hay componente del valor que venga
  de input de usuario ni de `logo_url` de empresa (fuera de alcance, no se tocó). Sin superficie.
- **Categoría considerada — secretos hardcodeados:** `rg` sobre `src/app/content` (api key,
  secret, token, bearer, password) y sobre el código del cambio: **0 coincidencias**. Sin
  secretos nuevos; verificación de historial: el cambio no añadió binarios ni configs con
  secretos (solo PNG y código de presentación).

### Acciones fuera del código (obligatorio marcar)
- **Secretos a ROTAR:** ninguno.
- **Dependencias a actualizar (SCA):** ninguna nueva deps en este cambio.
- **Configuración / infra a endurecer:** ninguna que mapee a una amenaza real de este cambio.
  (Headres/CSP para assets estáticos de misma org serían *security theater* acá.)

### Riesgo residual aceptado
- Ninguno material. El único riesgo heredado y **ajeno al alcance** es la deuda conocida en
  `pagos.component.ts` (`document.write` estático) — ya está registrada como work item en el
  ciclo anterior; no se toca en este cambio porque no pertenece a su modelo de amenazas ni a su
  spec.

### Alcance de la búsqueda
- Qué se buscó: inyección/XSS (SVG), tampering de ruta de assets, secretos en código del
  cambio, sanitización/bypass en templates (innerHTML, bypassSecurity), autorización (no aplica
  — sin actores ni endpoints).
- Con qué: revisión manual + `rg` sobre `src/app/content` y usos de `src`/sanitización en `*.ts`.
- Quedó fuera de alcance: SCA completo del repo (sin deps nuevas), DAST (sin endpoints HTTP),
  y `logo_url` de la empresa (fuera de espec). Un scan limpio no es prueba de ausencia de
  vulnerabilidades.