<!-- sdd-installer: managed file, no editar a mano -->

# Puente a AGENTS.md

Este proyecto mantiene sus instrucciones en `AGENTS.md` (raíz del repo), compartidas entre
todas las herramientas de IA sin duplicación.

**Leé `AGENTS.md` completo ahora, como si fuera el contenido de este archivo.** Ahí están las
reglas del workflow SDD: el ciclo de fases y su orden, los gates de pausa, el formato de los
artifacts y qué declara `sdd/sdd.config.md`.

Lo que sigue son las dos cosas que necesitás **antes** de seguir ese puntero: cuándo arranca
el ciclo, y el mecanismo concreto de esta herramienta.

## Cuándo arranca el ciclo

Esta es la regla de activación y vale igual en todas las herramientas. Tu sección "Mecanismo
concreto" describe *cómo* corrés las fases; **cuándo** empezás se decide acá.

El ciclo arranca apenas el usuario pida **migrar, crear, implementar, desarrollar,
refactorizar, arreglar o agregar** algo que no sea un cambio trivial de una línea — **antes**
de que leas archivos, explores el repo o analices nada. Pedir el trabajo *es* el disparador:
no esperes a que el usuario nombre "SDD", "spec" o una fase, y no confíes en que la skill de
alguna fase se active sola por las palabras del prompt. Las skills describen qué hace cada
fase, no cuándo empieza el ciclo.

**No arranca** para preguntas sueltas ("¿cómo funciona X?", "¿dónde está Y?"), typos,
ediciones de una sola línea, o pedidos de solo lectura. Eso se responde o se hace directo.

**Implementar directo, sin ciclo, no es una opción disponible** para lo que sí lo dispara. Si
por alguna razón no podés correrlo (falta config, la herramienta te restringe algo), decíselo
al usuario y preguntá cómo seguir — no resuelvas la tarea por fuera del workflow en silencio.

Por default corrés cada fase vos mismo, **una por vez**, invocando su skill `sdd-{fase}` en el
orden obligatorio y respetando cada pausa y cada gate. Si tu sección "Mecanismo concreto"
describe delegación en sub-agentes, preferila para las fases pesadas. Que la delegación no
esté disponible nunca es motivo para saltear el ciclo ni para degradarlo: es solo la
diferencia entre correr las fases delegadas o en línea.

## Mecanismo concreto — Gemini CLI

Gemini CLI lee las skills desde `.agents/skills/sdd-{fase}/SKILL.md`, alias documentado de
`.gemini/skills/`. **Invocá cada fase explícitamente** por nombre de skill: las `description`
describen el trabajo de cada fase, no el arranque del ciclo, así que un pedido como "agregá X"
no activa ninguna por sí solo y confiar en eso deja el workflow sin arrancar.

No hay sub-agentes con contexto aislado: corrés el ciclo en línea, una fase por vez, según el
default de "Cuándo arranca el ciclo". Por eso, al
avanzar de fase, sé explícito sobre **qué artifacts leer** (rutas concretas bajo
`sdd/{change-name}/`) y cerrá cada fase con su artifact antes de empezar la siguiente.
