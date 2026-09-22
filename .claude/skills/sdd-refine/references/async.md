# Marco de decisión: síncrono vs cola vs pub/sub vs concurrencia

**Regla previa:** async y distribución tienen un costo real — operacional, cognitivo y de
consistencia eventual. No se introducen para "sentirse moderno": deben resolver un problema
**medido** de latencia, throughput, acoplamiento o resiliencia.

## Llamada síncrona — el default

Usala cuando el llamador **necesita el resultado** para continuar, la latencia es baja, se
requiere consistencia fuerte y la operación es simple. Empezá siempre acá y justificá
cualquier salto a async.

## Cola (point-to-point, distribución de trabajo)

Usala cuando:

- El trabajo puede **diferirse** — no bloquea la respuesta al usuario.
- Necesitás **nivelación de carga / back-pressure**: el productor va más rápido que el consumidor.
- Necesitás **reintentos** y tolerancia a fallos del consumidor.
- **Un solo consumidor** procesa cada mensaje. Es trabajo, no evento.

Ejemplos: mandar emails, procesar uploads, generar reportes, jobs programados.

## Pub/Sub (fan-out, difusión de eventos)

Usalo cuando:

- **Varios consumidores independientes** reaccionan al **mismo hecho**.
- Querés **desacoplar** al productor de un conjunto de consumidores desconocido o creciente.
- La integración es orientada a eventos.

Ejemplo: `pedido.creado` → inventario, facturación y notificaciones reaccionan por separado,
sin que el productor los conozca.

> Regla mnemónica: **cola = "hacé este trabajo" (un dueño)**; **pub/sub = "esto ocurrió" (a
> quien le interese)**.

## Concurrencia / paralelismo

Introducilo solo cuando se cumplen **las tres**:

1. El trabajo es **genuinamente independiente** (paralelizable).
2. Es un **cuello de botella real y medido**, no supuesto.
3. Podés **acotar el uso de recursos** (pools, límites).

Costo: complejidad, condiciones de carrera, debugging difícil. Mitigaciones: preferí
primitivas de alto nivel (thread pools, runtimes async, concurrencia estructurada) sobre hilos
y locks crudos; favorecé inmutabilidad y paso de mensajes sobre estado compartido mutable.

## Preocupaciones transversales de todo lo async

Si proponés cola o pub/sub, tenés que poder responder a **todas**:

- **Idempotencia** del consumidor (por entrega at-least-once).
- **Semántica de entrega**: at-least-once vs exactly-once. Esta última rara vez es real; casi
  siempre es at-least-once + idempotencia.
- **Garantías de orden**: ¿importa el orden? ¿está garantizado?
- **Poison messages** y dead-letter queue.
- **Back-pressure** y límites.
- **Observabilidad**: trazas correlacionadas a través de las fronteras async.
- Implicaciones de **consistencia eventual** en la UX y en las invariantes de negocio.

Si no podés responder a estos puntos, **la propuesta no está lista**.
