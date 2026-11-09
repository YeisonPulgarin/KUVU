## Seguridad — acceso-volver-inicio

### Modelo de amenazas (resumen)

- Activos / datos sensibles: ninguno nuevo. El cambio agrega dos enlaces estáticos a `/` en
  `/acceder`. No lee ni escribe datos, no toca `sessionStorage`, auth ni llamadas HTTP.
- Fronteras de confianza y puntos de entrada: ninguno nuevo. El destino es una constante del
  template (`routerLink="/"`), sin parámetros de URL ni input del usuario.
- STRIDE-lite: Spoofing / Tampering / Repudiation / Elevation no aplican (sin identidad ni
  estado). Information disclosure: salir a `/` no expone datos (no se selecciona empresa, test
  CA-3 lo comprueba). DoS: no aplica.

### Hallazgos por severidad

Ninguno accionable.

- Open redirect (CWE-601): descartado. El destino es fijo e interno, sin valor controlable.
- XSS (CWE-79): descartado. Texto y `aria-label` son literales del template; no hay
  `innerHTML` ni `bypassSecurityTrust*`.
- Reverse tabnabbing: descartado. No hay `target="_blank"` ni enlaces externos.

### Acciones fuera del código (obligatorio marcar)

- Secretos a ROTAR: ninguno (sin secretos en el diff).
- Dependencias a actualizar (SCA): ninguna; el cambio no agrega dependencias.
- Configuración / infra a endurecer: ninguna.

### Riesgo residual aceptado

- Ninguno introducido por este cambio.

### Alcance de la búsqueda

- Revisión manual del diff `08d9b24..HEAD` en `frontend/` y búsqueda de patrones de secretos y
  sinks peligrosos (`password|secret|token|api_key|innerHTML|bypassSecurity|target=|href="http`)
  sobre las líneas agregadas: sin coincidencias.
- Fuera de alcance: el resto del flujo de acceso (`/login`, `AuthService`, el uso de
  `sessionStorage` para la empresa preseleccionada) y el backend, que este cambio no toca.
  Un scan limpio no prueba ausencia de vulnerabilidades.
