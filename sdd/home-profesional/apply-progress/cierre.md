# Apply progress — home-profesional / cierre

Rama: `feat/home-profesional`. Slice 5 de 5. Estado: **completo**.

## Tareas

| # | Tarea | Estado |
|---|---|---|
| T5.1 | `sdd/sdd.config.md`: tabla de slices con `contenido → chrome → paginas → home → cierre` y la regla de orden; `sdd/sdd-init.md`: `slices_declarados` y `test_mode: test-after` | hecho |

## Notas

- La línea de stack de `sdd.config.md` (`PostgreSQL`) y `expone_api_http: false` de
  `sdd-init.md` no se tocan: `feat/acceso-orden-e-intro` ya las corrige (MariaDB + Express,
  `true`). Al integrar ambas ramas, la tabla de slices de `sdd.config.md` entra en conflicto y
  se resuelve a mano (quedarse con la de este cambio o fusionar las dos tablas).
- Sin cambios de código: la suite y el build quedan como al cerrar el slice `home`
  (295/295, initial 421.39 kB).

```
test_mode: test-after
test_command: (sin código en este slice; suite y build verificados al cerrar `home`)
tests_status: verde
tests_agregados: (ninguno)
excepciones_sin_test: T5.1 — solo archivos de configuración SDD (Markdown), sin comportamiento ejecutable
logs_conforme: sí — no aplica
```

## Ajustes post-apply (pedidos por el usuario antes de `verify`)

### A1. Voseo → tuteo colombiano

Todo el texto visible del sitio público pasa a tuteo ("Conoce", "Escríbenos", "Cuéntanos",
"puedes", "tienes"). Barrido con grep de formas voseantes (terminaciones acentuadas en
imperativo y presente, enclíticos "-nos/-lo/-le" y "vos") en todo
`frontend/proyecto_angular/src/app`: el voseo estaba solo en el sitio público (lo nuevo de
este cambio y textos previos de la home: hero, "Cómo funciona", beneficios, seguridad, FAQ,
equipo). Login, acceso y módulos de gestión no tenían voseo.

- **49 textos corregidos** en 17 archivos: `content/benefits.ts`, `contact.ts`, `faq.ts`,
  `howItWorks.ts`, `legal.ts`, `pages.ts`, `security.ts`, `team.ts`; templates de home,
  team-band, contacto, nosotros, not-found, preguntas-frecuentes y servicios; specs
  `home.component.spec.ts` y `content.spec.ts`.
- `spec.md` declara el registro: tuteo colombiano, sin voseo.
- Test de regresión nuevo en `content.spec.ts`: ningún texto de contenido usa formas de voseo.

### A2. Datos del responsable derivables

`content/responsible.ts`: `phone` = `+57 322 319 2760` (el WhatsApp ya publicado en
`site.ts`), `attentionArea` = `Equipo KUVU — Protección de datos personales`,
`effectiveDate` = `18 de octubre de 2026`. Siguen en `null` (marcador visible) `legalName`,
`taxId`, `domicile`, `address` y `email`, que da el usuario. Specs de contenido y de `/legal`
actualizados (+3 tests).

### Resultado de los ajustes

- Suite: **298 tests, 298 SUCCESS, 0 FAILED** (295 → 298).
- `ng build`: initial total **421.42 kB** (presupuesto 500 kB).

