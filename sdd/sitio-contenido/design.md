# Design — sitio-contenido

## Contexto

Referencia a `spec.md` (RF-1..RF-11) y `propose.md`. Todo vive en el Angular actual
(`frontend/proyecto_angular`), standalone components, Tailwind v4 con `@reference` a
`src/styles.css`, tema `.dark`, reveals `[data-reveal]` con `IntersectionObserver`.

## Arquitectura

### 1. Contenido versionado — `src/app/content/*.ts`

Los textos del sitio viven en módulos TS tipados, fuente única, reutilizables entre home y
páginas. Cada módulo exporta una constante y su interfaz vive en `types.ts` (o adjunta).

```
src/app/content/
├── types.ts          # interfaces compartidas (NavItem, FaqGroup, HowStep, BenefitRow…)
├── site.ts           # nombre, tagline, nav (anclas + páginas), contact target
├── services.ts       # los 5 servicios que hoy están hardcodeados en home.html
├── companies.ts      # lista de compañías (hoy hardcodeada en home.html)
├── howItWorks.ts     # pasos de "cómo funciona"
├── benefits.ts       # beneficios por rol (dueño/gerente vs equipo operativo)
├── security.ts       # destacados de seguridad y soporte (sin mecanismos internos)
├── origin.ts         # origen real de KUVU
├── about.ts          # secciones de /nosotros (quién es, cómo opera, con quién trabaja)
└── faq.ts            # preguntas agrupadas; la home usa un subconjunto (3–5)
```

El contenido es texto en español (dato mostrado al usuario); los identificadores/código van
en inglés según los guidelines. No hay cifras ni logros no verificados.

### 2. Chrome compartido del sitio público

Hoy el header (navbar + menú móvil + toggle de tema + tema oscuro) vive embebido en
`home.component`. Para que las páginas nuevas compartan header/footer y el toggle/reveals
funcionen en todas (aceptación 12), se extrae:

- **`src/app/services/theme.service.ts`** — estado de tema: leer/persistir (`kuvu-theme`) y
  aplicar la clase `.dark`. Reemplaza la lógica hoy duplicada en `home.component.ts`.
- **`src/app/components/public/site-header/site-header.component.ts`** — header compartido
  (logo, nav con anclas + páginas, acciones de acceso, toggle de tema, drawer móvil), tomado
  del header actual de la home.
- **`src/app/components/public/site-footer/site-footer.component.ts`** — footer compartido:
  marca/copyright y navegación (inicio, nosotros, preguntas frecuentes, acceso a la app).
- **`src/app/directives/reveal.directive.ts`** — reemplaza el bloque `IntersectionObserver`
  actual: el atributo `appReveal` aplica `is-visible` respetando
  `prefers-reduced-motion`. Se usa en home y en las páginas nuevas.

La home se refactoriza: reemplaza su header/menu/toggle por `SiteHeader` y agrega
`SiteFooter`, manteniendo idéntico el resto del markup. Comportamiento preservado: no deja
de funcionar el flujo actual.

### 3. Home expandida

`home.component.html` conserva las secciones actuales (se mueve su texto a `content/`) y
agrega, en orden: **cómo funciona** (`howItWorks`), **beneficios por rol** (`benefits`),
**seguridad y soporte** (`security`), **origen de KUVU** (`origin`) y **FAQ corto**
(`faq` → subconjunto de 3–5 preguntas, cada una con su respuesta, enlace a
`/preguntas-frecuentes`). La navbar agrega anclas a las secciones nuevas.

### 4. Rutas nuevas

`app.routes.ts` agrega:

```ts
{ path: 'nosotros', title: 'Nosotros · KUVU', loadComponent: () => import('./components/pages/nosotros/nosotros.component').then(m => m.NosotrosComponent) },
{ path: 'preguntas-frecuentes', title: 'Preguntas frecuentes · KUVU', loadComponent: () => import('./components/pages/preguntas-frecuentes/preguntas-frecuentes.component').then(m => m.PreguntasFrecuentesComponent) },
```

Siguen el patrón lazy `loadComponent` existente en el proyecto. Los componentes viven bajo
`components/pages/` (páginas públicas) y usan `SiteHeader` + `SiteFooter` + `appReveal`.

### 5. Metadata y favicon

- `title` por ruta (opción `title` del router) y `meta description` seteado en el `ngOnInit`
  de cada página vía un helper mínimo compartido (`src/app/services/page-meta.service.ts`)
  que inyecta `Meta` y `Title`.
- `index.html` apunta el favicon al asset existente (`<link rel="icon" type="image/jpeg"
  href="/Logo_Kuvu.jpeg">`), eliminando la referencia al `favicon.ico` inexistente.

### 6. Tests

Suite Karma/Jasmine existente (60 tests). Se agregan specs de forma para cada módulo de
`content/` y specs de render para las secciones nuevas de la home y las páginas nuevas
(contenido presente, FAQ corto con enlace, origen mencionado, seguridad sin términos
internos). Modalidad `test-after`: tests inmediatamente después de la implementación,
dentro del mismo slice.

## Decisiones técnicas

| # | Decisión | Justificación |
|---|---|---|
| D1 | Textos centralizados en `content/*.ts` | Una sola fuente; el FAQ corto y la página completa comparten preguntas; testeable; HTML limpio |
| D2 | Header/footer compartidos + `ThemeService` + `RevealDirective` | Regla de tres: 3 páginas públicas usan el mismo chrome; evita duplicar el toggle/reveals |
| D3 | Páginas nuevas lazy (`loadComponent`) | Consistente con las rutas internas; no paga el bundle de /nosotros en la home |
| D4 | `title` vía router + `PageMetaService` para description | Zero plumbing en cada página para el título; fuente única para la descripción |
| D5 | Favicon = asset existente (`Logo_Kuvu.jpeg`) | El `.ico` referenciado no existe; no se genera un binario nuevo |
| D6 | Sección seguridad solo descriptiva | Aceptación 4: nunca se publican mecanismos internos |

## Fuera de alcance para esta implementación

- No se toca el backend, ni el producto interno, ni el sistema visual.
- No se agrega formulario de contacto; el CTA de `/nosotros` apunta a la vía de contacto que
  el usuario decida (ver pendiente).

## Pendiente resuelto (decisión del usuario)

**Destino del CTA de contacto** (RF-7 / página `/nosotros`): **WhatsApp**. Número
`573223192760` con mensaje prellenado _"Hola, queremos información sobre KUVU, sus servicios
y como vincularnos"_.

- En `content/site.ts` viven `contactWhatsApp = '573223192760'` y
  `contactWhatsAppMessage = 'Hola, queremos información sobre KUVU, sus servicios y como
  vincularnos'`, como fuente única.
- Un helper mínimo (`buildWhatsAppLink(phone, message)`) arma `https://wa.me/{phone}?text=…`
  con `encodeURIComponent`, para que el texto siempre viaje bien codificado.
- El CTA de `/nosotros` usa ese enlace. El icono de WhatsApp que hoy existe en el header de
  la home (un `<button>` sin acción) pasa a ser un enlace `<a>` al mismo target, con
  `target="_blank" rel="noopener"` y `aria-label`.