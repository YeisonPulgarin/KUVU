# Modalidades de test

Este documento describe las dos modalidades en las que la fase `apply`
(`.agents/skills/sdd-apply/SKILL.md`) escribe tests. Los tests **no son opcionales** en
ninguna de las dos: lo único que se elige es cuándo se escriben.

## Quién elige y cómo

La modalidad se declara en `sdd/sdd.config.md`, sección "Modalidad de tests":

```
## Modalidad de tests (obligatoria)

- [x] `tdd`        — test primero: RED → GREEN → REFACTOR
- [ ] `test-after` — implementación primero, tests antes de cerrar el slice

Comando de test por slice:
  - `{slice-1}`: `{comando}`
  - `{slice-2}`: `{comando}`
```

- Si el archivo declara una, el orquestador la usa y no pregunta.
- Si no declara ninguna (o `sdd.config.md` no existe todavía), el orquestador **le pregunta al
  usuario una sola vez** al arrancar el workflow y cachea la respuesta para toda la sesión.
- Aplica a **todos los slices** por igual — no hay modalidad distinta por slice, aunque cada
  slice puede declarar su propio comando de test (útil cuando backend y frontend corren
  runners distintos).
- Se puede cambiar en cualquier momento editando `sdd.config.md`. El cambio aplica desde el
  próximo slice de `apply` que arranque, nunca retroactivo sobre progreso ya guardado.

`sdd-init` lee esto al arrancar el proyecto y lo guarda en su artifact (`test_mode`,
`test_command`) para que el resto de las fases lo tengan disponible sin releer la config.

## Modalidad `tdd` — el ciclo, paso a paso

Para cada unidad de comportamiento nueva dentro del slice:

1. **Safety net.** Si estás modificando código existente, corré el comando de test declarado
   antes de tocar nada. Si ya está en rojo, no es tu ciclo — reportalo al orquestador como
   bloqueo previo, no lo arregles de paso.
2. **RED.** Escribí (o actualizá) el test que describe el comportamiento nuevo. Corré el
   comando y confirmá que falla, y que falla **por la razón esperada** — un test que falla por
   un typo de sintaxis no cuenta como RED válido.
3. **GREEN.** Implementá lo mínimo necesario para que ese test pase. Si falla después de
   implementar, el problema es la implementación, nunca el test — no relajes ni borres la
   assertion para que pase.
4. **REFACTOR.** Con los tests en verde, limpiá si hace falta (nombres, duplicación,
   estructura). Volvé a correr el comando después de cualquier cambio en este paso — el
   refactor nunca se da por terminado con tests sin correr.

Repetí el ciclo por cada unidad de comportamiento, no una sola vez para todo el slice — los
slices grandes se benefician de varios ciclos RED→GREEN cortos en vez de uno solo al final.

## Modalidad `test-after` — implementar, después cubrir

Para cada tarea del slice:

1. **Safety net.** Igual que en `tdd`: si tocás código existente, corré la suite antes de
   empezar. Rojo previo = bloqueo, se reporta.
2. **Implementá** la tarea completa.
3. **Cubrí** ese comportamiento con tests **antes de pasar a la siguiente tarea** — no al final
   del slice, no "en un commit aparte". La deuda de tests acumulada durante un slice es la
   forma más común de que un slice cierre sin cobertura real.
4. **Verificá que el test puede fallar.** Un test escrito después de la implementación pasa en
   verde desde el minuto cero, lo que hace fácil escribir uno que no prueba nada. Rompé
   deliberadamente la implementación (o comentá la línea clave), confirmá que el test falla, y
   revertí. Este paso es el equivalente del RED y **no se saltea**.
5. Corré la suite completa antes de cerrar la tarea.

## Reglas duras — valen en las dos modalidades

- **Nunca se cierra un slice con código de producción sin su test.** Si una tarea del slice no
  tiene forma razonable de testear (un cambio de configuración puro, un ajuste de copy),
  documentá la excepción en `apply-progress/{slice}` bajo `excepciones_sin_test`, en vez de
  saltear la regla en silencio.
- **Sin assertions triviales.** Un test que no puede fallar (`expect(true).toBe(true)`, un mock
  que devuelve exactamente lo que el propio test espera) no cuenta como cobertura real.
- **La implementación se arregla, el test no se debilita.** Si el test falla, el sospechoso es
  el código de producción.
- **No hagas push si los tests están en rojo.** Si la extensión `git` está activa y hay tests
  fallando al cerrar el slice, reportá el bloqueo al orquestador en vez de pushear código roto
  — ver `.agents/skills/sdd-apply/SKILL.md` sección "Commit al cerrar el slice".

## Qué pasa si el proyecto no tiene test runner detectado

`sdd-init` intenta detectar el comando de test automáticamente al leer los manifiestos del
proyecto. Si el slice no declaró un comando explícito y `init` tampoco lo detectó, `apply`
reporta esto como bloqueo al orquestador **antes de empezar** — no asume ni inventa un comando
de test. Configurar el runner es parte del cambio, no un prerequisito que se puede omitir.
