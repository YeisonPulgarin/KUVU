## Seguridad — tema-claro-tokens

Alcance: diff de `fix/tema-claro-tokens` contra `feat/home-animaciones`. Son 19 archivos de
`frontend` (17 SCSS/CSS y 3 specs) y artifacts SDD.

**Resultado: sin hallazgos accionables.** No se cambió código, así que no hace falta re-verificar
por esta fase.

### Modelo de amenazas (resumen)

- **Activos / datos sensibles:** ninguno en el alcance. El cambio solo declara variables CSS
  estáticas y quita valores literales repetidos en estilos de componentes. No maneja PII,
  credenciales ni datos del backend.
- **Fronteras de confianza y puntos de entrada:** ninguno nuevo. Los valores de los tokens son
  literales compilados en el bundle y ningún input de usuario llega a CSS. El único dato de
  cliente relacionado es `localStorage['kuvu-theme']`, que el script de `index.html` y
  `ThemeService` comparan con `'dark'` para alternar una clase. Este cambio no lo toca, y el peor
  caso de manipularlo es elegir el tema de la propia pestaña.
- **STRIDE-lite:** sin superficie de spoofing, elevation ni information disclosure. Tampering:
  solo el propio usuario sobre su propia vista. DoS: no aplica (+325 B de CSS estático).

### Hallazgos por severidad

Ninguno.

| Revisión | Resultado |
|---|---|
| Inyección en CSS (valores dinámicos en `var()`, `url()`, `@import`, `expression()`) | No hay: todos los valores son literales de color o de longitud en `styles.css` |
| Recursos externos nuevos (URLs, fuentes, imágenes) | Ninguno |
| Cambios en specs | Solo comentarios y la aserción de `.cta-final`; ningún control de seguridad involucrado |

### Acciones fuera del código

- **Secretos a ROTAR:** ninguno. El escaneo del diff (patrones de password, secret, api key,
  clave privada y tokens largos) no encontró coincidencias.
- **Dependencias a actualizar (SCA):** ninguna por este cambio. `package.json` y
  `package-lock.json` no cambian. Sigue abierto P-1 (`@angular/*` ≥ 21.2.25, advisories SSR no
  alcanzables), que es de otro cambio.
- **Configuración / infra a endurecer:** ninguna.

### Riesgo residual aceptado

Ninguno nuevo. Se mantiene el H-1 de `home-animaciones` (advisories de `@angular/router` solo
alcanzables con SSR), ya aceptado.

### Alcance de la búsqueda

- **Qué se hizo:** revisión manual del diff completo y un grep de secretos y referencias externas
  sobre las líneas agregadas. Se comprobó además que no cambian manifiestos de dependencias.
- **Qué no se hizo y por qué:** no se corrió DAST, porque no hay endpoints nuevos ni cambios de
  backend. Tampoco se hizo secret scanning del historial completo del repo, porque está fuera del
  alcance de un cambio de estilos.
- Un scan limpio no prueba que no haya vulnerabilidades: el alcance es el diff de este cambio.
