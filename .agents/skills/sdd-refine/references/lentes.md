# Los principios como lentes

No son un checklist de ítems independientes: son lentes agrupadas por el problema que
resuelven. Cada una incluye su **cuándo NO aplicar**, que es lo que evita el exceso.

## Grupo A — Responsabilidad y cohesión: *"¿dónde debe vivir esto?"*

SRP · SoC · GRASP (Information Expert, Creator, Controller) · Alta cohesión.

- **Aplicar cuando:** una unidad hace varias cosas no relacionadas, o la lógica está lejos de
  los datos que necesita (viola Information Expert).
- **NO aplicar cuando:** partirías algo cohesivo en piezas anémicas solo para "cumplir SRP".
  La cohesión alta puede significar que varias cosas **deben** estar juntas. Una clase con una
  responsabilidad clara y varios métodos no viola SRP.

## Grupo B — Acoplamiento: *"¿cómo dependen las partes entre sí?"*

Bajo acoplamiento · DIP · Law of Demeter · ISP · Composición sobre herencia.

- **Aplicar cuando:** cadenas `a.getB().getC().doD()` (LoD); dependencias hacia
  implementaciones concretas en fronteras que realmente cambian (DIP); interfaces gordas que
  fuerzan a implementar métodos vacíos (ISP); jerarquías de herencia frágiles que se
  resolverían mejor delegando (composición).
- **NO aplicar cuando:** introducirías una interfaz o inyección para una dependencia con **una
  sola implementación** que no va a cambiar. Eso es abstracción especulativa y rompe YAGNI.
  DIP se paga cuando la frontera *realmente* varía.

## Grupo C — Contención: *"¿esto debería siquiera existir?"*

KISS · YAGNI · DRY con criterio · anti-generalidad-especulativa.

Es el grupo que **frena** a los demás. Ante conflicto, este grupo gana casi siempre. Es el
gate de contención de la skill.

Señales de que se está violando: parámetros de configuración que nadie usa; `abstract` o
`interface` con una sola clase hija; flags "por si acaso"; genéricos que solo se instancian
con un tipo; capas de mapeo que copian objeto a objeto idéntico.

## Grupo D — Tolerancia al cambio: *"pagar solo cuando el cambio es probable"*

OCP · LSP · patrones de diseño (creacionales, estructurales, comportamentales).

- **Aplicar cuando:** hay un eje de variación **demostrado** — ya cambió dos o tres veces, o
  la spec anticipa variantes concretas. Ahí el patrón agrega valor real.
- **NO aplicar cuando:** se anticipa flexibilidad futura sin evidencia. OCP aplicado
  profilácticamente es deuda.
- **LSP es no-negociable** donde hay herencia: un subtipo que no puede sustituir a su base es
  un bug latente, no una cuestión de estilo.
- Regla: **patrón reactivo, no profiláctico.** Se introduce cuando el dolor ya apareció.

## Grupo E — Ergonomía: *"¿el próximo humano se va a sorprender?"*

POLA · CUPID · Boy Scout Rule · código idiomático.

- **POLA:** nombres, firmas y efectos secundarios coinciden con lo que se espera. Una función
  `getX()` no escribe en la base de datos.
- **CUPID** como propiedades a favorecer, no reglas rígidas: componible, hace una cosa bien,
  predecible, idiomático al lenguaje y al repo, modelado alrededor del dominio.
- **Boy Scout:** dejá el código mejor de lo que estaba, **limitado a lo que ya tocaste**. No
  es licencia para refactorizar el repo entero.
- **Idiomático manda:** la convención existente del proyecto le gana a la "mejor práctica"
  abstracta.

## Grupo F — Integridad de datos: *"¿es correcto bajo concurrencia y fallos?"*

ACID · fronteras transaccionales · niveles de aislamiento · idempotencia.

Este eje es **ortogonal** a los anteriores: un código impecable en SOLID puede corromper datos
si la transacción está mal delimitada. Ver `datos-sql.md`.
