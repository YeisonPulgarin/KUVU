# Document report — tema-claro-tokens

```
docs_archivo: docs/tema-claro-tokens.md (creado)
architecture: actualizado: "Decisiones estructurales". Las entradas "Tokens de Tailwind v4 solo usados en componentes no existen en runtime" y "Patrón var(--token, valor)" se reemplazan por una sola, "Tokens de marca en @theme static"
guidelines: sin cambios. DEVELOPMENT_GUIDELINES.md no tiene sección de Angular; la convención de tokens está en sdd/sdd-init.md (slice cierre). Elevarla a guideline es un cambio aparte
openapi: no aplica: el cambio no toca endpoints HTTP y el proyecto no expone API pública
collections: no aplica: misma razón
changelog: entrada agregada bajo Unreleased, sección Fixed
readme: no aplica: no cambian instalación, comandos, variables ni stack
desvios: ninguno entre design y código
```

## Otros documentos corregidos

Dos documentos de cambios anteriores describían el defecto como estado vigente. Se corrigen para
que `docs/` describa el sistema actual:

- `docs/breadcrumb-y-cta-legible.md`: los estilos del breadcrumb y la decisión "Fallback literal
  en los tokens de Tailwind" pasan a "Tokens de marca sin fallback".
- `docs/home-imagen-equipo.md`: la decisión del verde de la banda pasa a "alias local" sin
  fallback, y se quita la limitación sobre tokens no emitidos, que ya no existe.

## Notas

- La afirmación de `home-imagen-equipo.md` de que emitir los tokens globalmente "cambia el color
  de otros CTA" no se cumple: `--color-brand-700` ya se emitía y el diff de píxeles del hero y
  del header en tema oscuro es 0 (`verify-report` CA-06). Se quitó junto con la decisión.
