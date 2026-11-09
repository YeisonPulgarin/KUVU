# apply-progress — cierre (home-animaciones)

Rama: `feat/home-animaciones`.

```
test_mode: test-after
test_command: no aplica (sin código de producción)
tests_status: verde (la suite completa, 465/465, se corrió al cerrar el slice home y este slice no toca código)
tests_agregados: ninguno
excepciones_sin_test:
  - Z1 solo edita configuración SDD (sdd-init.md, sdd.config.md): no tiene comportamiento que testear.
logs_conforme: sí. No agrega logs.
```

## Tareas

| # | Estado | Notas |
|---|---|---|
| Z1 | Completa | `sdd/sdd-init.md`: sección de convenciones del frontend (`app/motion/`, servicio de scroll provisto por componente, variables CSS publicadas desde JS, flag `data.publicSite`, por qué evitar `@apply` en componentes del bundle inicial). `sdd/sdd.config.md`: la fila de `chrome` nombra como dueño de `app/motion/`, `styles/_motion.scss` y los flags de `app.routes.ts`. Sin cambios de slices |

## Nota

`sdd-init.md` declara `expone_api_http: true`, mientras que `sdd.config.md` dice que el
proyecto no expone una API HTTP pública. La diferencia ya existía y no pertenece a este cambio:
queda para quien revise la config.
