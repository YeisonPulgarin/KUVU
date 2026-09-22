---
name: sdd-explore
description: This skill should be used when the SDD orchestrator needs to investigate what currently exists in the codebase (or a legacy system) before proposing a change — reconstructing existing behavior, reading relevant files, and surfacing structural ambiguities. Triggers right after sdd-init for any new change, on requests like "migrar X", "crear Y", "implementar Z", "agregar W".
---

# Fase: explore

Lee `AGENTS.md` antes de continuar. Esta skill implementa la fase 2 del ciclo.

## Qué hace esta fase

1. Lee `sdd-init/{proyecto}` para saber el stack y evitar re-detectarlo.
2. Investiga qué existe hoy relacionado con el cambio pedido: código actual, módulos
   relacionados, y si aplica, un sistema legado a migrar.
3. Si el cambio es sobre un sistema legado (brownfield), reconstruye el comportamiento
   visible **antes** de proponer nada nuevo — UI, contratos de datos, flujos — sin asumir
   que el código fuente legado está completo o documentado.
4. Identifica ambigüedades estructurales que requieren una decisión humana antes de
   poder especificar (ver Gate A en `AGENTS.md` → "Pausas y gates") — por ejemplo: ¿el módulo
   destino ya existe o hay que crearlo? ¿qué partes del sistema están involucradas?
5. Aplica la regla de "4+ archivos → delegar exploración" si quien ejecuta esta skill es
   a su vez parte de un flujo con sub-delegación disponible (ver `AGENTS.md` → "Antes de hacer nada").

## Artifact que produce

`sdd/{change-name}/explore` con:
- Resumen de lo que existe hoy (presente, sin histórico — ver `AGENTS.md` → "Estándar de documentación de artifacts").
- Lista de archivos/módulos relevantes encontrados, con su rol.
- Lista de ambigüedades detectadas para el Gate A.

## No hagas

- No escribas código ni propongas el diseño todavía — esta fase es solo reconocimiento.
- No asumas respuestas a las ambigüedades que detectaste — repórtalas, no las resuelvas.
