# Principios de arquitectura segura

## Least privilege — menor privilegio

- Cuentas de base de datos **scopeadas** al mínimo: no una superuser para toda la app; separá
  lectura y escritura donde tenga sentido.
- Cuentas de servicio, roles IAM y permisos de función al mínimo necesario.
- Contenedores sin root, sin capabilities de más.
- Un componente comprometido debe poder hacer el menor daño posible.

## Defense in depth — defensa en profundidad

- Capas independientes: validación + parametrización + autorización + WAF + segmentación, para
  que el fallo de una no sea catastrófico.
- No apuestes la seguridad del sistema a un único control.

## Fail secure — fallar cerrado

- Ante error o excepción, **denegá** por default. Nunca concedas acceso "porque algo falló".
- **Nunca** expongas stack traces, mensajes internos, versiones ni rutas al cliente: error
  genérico para el usuario, detalle en el log del servidor.
- Timeouts, circuit breakers y degradación que no abran huecos de seguridad.

## Logging y auditoría seguros

- **Registrá** los eventos de seguridad: decisiones de autenticación y autorización, fallos de
  acceso, cambios sensibles, actividad anómala. Sin esto no hay detección posible.
- **Nunca registres** contraseñas, tokens, claves, PII, datos de tarjeta ni secretos.
  Enmascarálos o redactálos antes de loguear.
- **Protegé los logs**: integridad, acceso restringido, retención. Son evidencia forense y, por
  eso mismo, un objetivo de ataque.
- Mantené correlación y trazabilidad para poder reconstruir un incidente.
