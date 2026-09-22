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

## Mecanismo concreto — Claude Code

Las skills viven en `.claude/skills/sdd-{fase}/SKILL.md` (copia que mantiene el instalador
desde `.agents/skills/` — nunca las edites ahí). Cada fase se corre invocándola como skill:
`/sdd-{fase}`, o dejando que se active por su `description`. **Invocar la skill es lo que
ejecuta la fase** — leer su `SKILL.md` con Read no es lo mismo y no cuenta como haberla
corrido.

Cuándo arranca el ciclo está definido arriba, en "Cuándo arranca el ciclo", y no se repite
acá. Lo que sigue es solo cómo lo corrés en esta herramienta.

### Camino A (preferido): delegar

Claude Code soporta sub-agentes con contexto aislado. Si podés invocarlos, tu primera acción
al dispararse el ciclo es lanzar el sub-agente `sdd-orchestrator`
(`.claude/agents/orchestrator.md`). Coordina el ciclo con contexto fresco; vos, la sesión
principal, mostrás los resúmenes que devuelve y esperás la respuesta del usuario en cada gate.

Ya orquestando, podés además delegar **cada fase** a un sub-agente nuevo, pasándole: la fase a
ejecutar, las referencias a los artifacts previos que necesita leer, la instrucción de no
preguntarle nada al usuario, y la de guardar su artifact antes de devolver el control. Usá
invocación **síncrona** para todas las fases del núcleo — necesitás el resultado de una antes
de decidir si pausás o seguís.

### Camino B: orquestar en línea

Aplica cuando la delegación no está disponible: la herramienta de sub-agentes está restringida
en esta sesión, el usuario pidió que no se usen, o **vos ya sos `sdd-orchestrator`** — en ese
último caso no te vuelvas a delegar a vos mismo, es el mismo agente y el ciclo no avanzaría.

Corrés vos mismo cada fase invocando su skill `sdd-{fase}`, una por vez, con las mismas pausas
y gates. Entre fase y fase sé explícito sobre qué artifacts leer: sin el contexto fresco de un
sub-agente, lo de la fase anterior sigue en tu ventana y puede arrastrarte a conclusiones que
el artifact no dice.
