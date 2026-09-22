# Validación y encoding, bien hechos

Son **dos defensas distintas, en puntos distintos**. Confundirlas es el error más común: se
"sanitiza al entrar" y se cree que eso detiene la inyección. No lo hace.

## 1. Validación de entrada (allowlist), en la frontera de confianza

Definí qué es válido y rechazá todo lo demás — modelo positivo, no denylist. Protege la lógica
de negocio y es **defensa en profundidad**. No es la barrera principal contra inyección.

## 2. Encoding de salida sensible al contexto, en el sink

Cada destino tiene su encoding o su mecanismo de parametrización propio: SQL, HTML body,
atributo HTML, JavaScript, shell, LDAP, URL. **Acá se detiene realmente la inyección.**

## Reglas operativas

| Destino | Qué hacer |
|---|---|
| SQL | **parametrizar**; nunca escapado manual |
| HTML / JS | **encodear en la salida según el contexto**; preferir el auto-escape del framework |
| Shell | **no usar shell**; API con argumentos como lista |
| LDAP / URL / CSS | encoding propio de ese contexto |

**Validá SIEMPRE en el servidor.** La validación en el cliente es UX, no seguridad: el cliente
está bajo control del atacante.
