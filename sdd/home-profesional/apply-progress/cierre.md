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

### A3. Empresa ficticia: sin marcadores

Decisión del usuario: KUVU es una empresa ficticia (proyecto académico) y se prefieren datos
inventados a marcadores, con el criterio de no inventar nada que pueda pertenecer a un tercero
real. Registrada en `spec.md` (HP-13, CA-09.3, CA-12.3, HP-14) y `propose.md` (D1).

- `content/responsible.ts`: `legalName` = `KUVU`, `domicile` = `Bogotá D.C., Colombia`.
  `taxId`, `address` y `email` pasan a campos **opcionales** del modelo `Responsible` y no se
  definen.
- Un segmento de campo de `RichText` acepta `prefix`/`suffix`: si el campo no existe, se omite
  la frase completa. `/legal` no renderiza ítems que quedan vacíos (`isEmptyRichText`).
- El mecanismo de marcadores se elimina (`placeholderLabel`, `responsibleText`, `<mark>` y
  sus estilos): ya no había datos pendientes y mantenerlo no era trivial.
- Footer y `/contacto` muestran la línea de correo solo si existe; `/contacto` suma
  "WhatsApp y teléfono: +57 322 319 2760".
- Textos de `/legal` cambiados:
  - Aviso inicial: "KUVU es un proyecto académico desarrollado en la Universidad Cooperativa
    de Colombia. Estos textos son una base de referencia preparada a partir de la Ley 1581 de
    2012 y el Decreto 1377 de 2013. No constituyen asesoría legal: una empresa real debe
    revisarlos con un abogado antes de adoptarlos."
  - Identificación: "… es KUVU, con domicilio en Bogotá D.C., Colombia." + "Teléfono y
    WhatsApp: +57 322 319 2760" + "Formulario: página de contacto" (sin NIT, dirección ni
    correo).
  - Área y canales: consultas y reclamos por el formulario de la página de contacto o el
    WhatsApp, indicando que es una consulta o reclamo sobre datos personales.
  - Aviso de privacidad: "KUVU, con domicilio en Bogotá D.C., Colombia, es responsable…".
  - Términos de uso (contacto): "escríbenos desde la página de contacto o por WhatsApp al
    +57 322 319 2760."
- Footer: nueva línea "KUVU es un proyecto académico desarrollado en la Universidad
  Cooperativa de Colombia." sobre el copyright. `academicNote` en `content/site.ts` es la
  fuente única del texto.

Resultado: **304 tests, 304 SUCCESS, 0 FAILED**; `ng build` initial total **421.02 kB**.

