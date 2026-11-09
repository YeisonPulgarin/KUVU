# Apply progress — paginas

Rama: `feat/sitio-publico-expresivo-paginas` (apilada sobre `feat/sitio-publico-expresivo`).

| Tarea | Estado | Nota |
|---|---|---|
| T4.1 | Completa | `/servicios`: servicios en filas con regla de 2 px (ícono en bloque de marca, h3 display), beneficios por rol en 2 columnas `.surface-tint` con tarjetas de sombra dura, CTA "Contactar" `.btn-site` en `.block-brand`; sin eyebrows |
| T4.2 | Completa | `/nosotros`: secciones editoriales con titular sticky, galería asimétrica de las 3 fotos (la primera en 2 filas) con nombres en `figcaption`, origen con pull-quote, CTA `.block-brand` (WhatsApp como `.btn-site` invertido) |
| T4.3 | Completa | `/preguntas-frecuentes`: título de grupo display sticky, preguntas a `--text-lead` con regla de 2 px; markup de pregunta/respuesta igual; cierre en `.block-brand` con los dos enlaces |
| T4.4 | Completa | `/contacto`: formulario en `.contact-card` (borde 2 px, sombra dura), canales en `.surface-tint`, pasos con numeral display en una banda `.block-brand` final; lógica y campos sin cambios |
| T4.5 | Completa | Sin `—` ni `–` en las plantillas tocadas, `headlines.ts` ni `team.ts` |

## Desvíos

- `_site.scss` suma `.site-section`, `.site-section-head` y `.site-cta` (primitivas de página
  compartidas) y el estado hover de `.link-arrow-icon` dentro de `.btn-site`; `.btn-site` no se
  combina con `.link-arrow` (su color pisaría el del botón).
- `--text-display-m` pasa a `clamp(2rem, 1.4rem + 2.2vw, 3rem)` (32 px a 375, 48 px a 1280)
  para cumplir R2.2 en los h2 de sección.
- `.display-title` usa `line-height: 1`: con 0.92 las mayúsculas acentuadas (Á, É) tocaban la
  línea de arriba en titulares de varias líneas.
- En `/nosotros`, el botón de WhatsApp toma el estilo `.btn-site` invertido del bloque de marca
  en lugar del verde WhatsApp propio de la página; en `/contacto`, el botón de envío conserva
  su verde WhatsApp.
- En `/contacto`, los pasos salen del aside y forman la banda final de marca (R4.2).
- Aislamiento de tests: `theme.service`, `site-header`, `site-footer` y `home` limpian
  `kuvu-theme` y `.dark` en `afterEach`. Sin eso, el orden aleatorio de Jasmine dejaba el tema
  oscuro activo y `steps-journey` fallaba de forma intermitente.

## QA

- `ng build`: initial 444,61 kB; chunks lazy servicios 5,33 kB, nosotros 5,86 kB, contacto
  15,57 kB; solo el `css-inline-fonts` preexistente.
- CDP (4 páginas × 375/1280 × claro/oscuro): h1 80 / 39,65 px y h2 display 48 / 32 px, sin
  scroll horizontal, 0 eyebrows (legal conserva los suyos).

```
test_mode: test-after
test_command: npx ng test --watch=false --browsers=ChromeHeadless (frontend/proyecto_angular)
tests_status: verde (481/481, 3 corridas seguidas)
tests_agregados: src/app/components/pages/{servicios,nosotros,preguntas-frecuentes,contacto}/*.spec.ts, src/app/services/theme.service.spec.ts, src/app/components/public/site-header/site-header.component.spec.ts, src/app/components/public/site-footer/site-footer.component.spec.ts, src/app/components/home/home.component.spec.ts
excepciones_sin_test: composición visual (grillas, sticky, sombras): verificada por QA CDP
logs_conforme: sí (sin logs nuevos)
```
