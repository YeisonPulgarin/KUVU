# Apply progress — home

Rama: `feat/sitio-publico-expresivo-home` (apilada sobre `feat/sitio-publico-expresivo-paginas`).

| Tarea | Estado | Nota |
|---|---|---|
| T5.1 | Completa | Hero alineado a la izquierda: marca "KUVU." en display, h1 `display-xl` vía `app-headline` con "empresas" en `.tape`, subtítulo a `--text-lead`, "Ingresar" `.btn-primary` azul magnético (R5.4); sin `.hero-scroll-cue` ni centrado |
| T5.2 | Completa | "Qué es": statement a `--text-display-m` en Geist 500 con `split-text` scrub (`--dim: .65`). "Origen": h2 display con word-reveal scrub (`--dim: .65`), primer párrafo como pull-quote y el resto en 2 columnas |
| T5.3 | Completa | `steps-journey`: fondo con trama, tarjetas con borde de 2 px, numerales display en cuadro de marca; sticky sin cambios |
| T5.4 | Completa | Servicios en bento de 5 celdas (la primera ocupa 4/6, celdas 1 y 4 tintadas, celda 2 con trama). Seguridad como lista con regla sobre `.surface-dots` a sangre completa |
| T5.5 | Completa | `companies-marquee` como cinta de marca: nombres en display, separador ✳ decorativo (`content: '✳' / ''`), botón de pausa con borde `--color-on-brand` |
| T5.6 | Completa | `team-band` sobre superficie tintada: Ima1 en marco con borde, sombra dura y `rotate: -2deg`, que se endereza con `--p` en desktop con movimiento; titular con "KUVU" en cinta, lead, nombres y enlace `.btn-site--ghost` |
| T5.7 | Completa | FAQ con regla de 2 px y preguntas a `--text-lead`; CTA final `.block-brand` con `display-xl` ("inmobiliarias" en cinta) e "Ingresar" azul; sin `.section-eyebrow` |
| T5.8 | Completa | Spec de home: anclas y orden intactos, un solo `h1`, h2 display, titulares partidos iguales a su texto, sin eyebrows ni scroll cue, cierre en bloque de marca |
| T5.9 | Completa | Ver QA |

## Desvíos

- `_section-heading.scss` (mixin de la home y sus secciones extraídas): `.section-title`
  pasa a display (`--text-display-l`) y `.section-lead` a `--text-lead`. Los estilos de
  componente ganan sobre los globales, así que la regla se repite acá.
- La foto del equipo en la home es contenido (con `alt`), no fondo decorativo: es la foto
  destacada en su marco.
- El CTA final conserva su texto blanco (`#fff`, ya existente) sobre el bloque de marca.
- El separador ✳ va como carácter literal en el CSS: el escape `\2733` lo deformaba al
  compilar.

## QA

- `ng build`: initial 448,08 kB (< 500 kB), solo el `css-inline-fonts` preexistente de
  `/acceder` (19,14 kB).
- CDP home 375/1280 × claro/oscuro: h1 Big Shoulders Display 116,5 / 47,7 px, h2 80 /
  39,65 px, lead 27,5 / 20 px, sin scroll horizontal, "Ingresar" con el mismo gradiente azul
  que la base.
- Diff contra la base: `/acceder` idéntico en los 4 escenarios; `/login` difiere en 17 px en
  la fila del input (cursor de texto), igual que en la QA del chrome.

```
test_mode: test-after
test_command: npx ng test --watch=false --browsers=ChromeHeadless (frontend/proyecto_angular)
tests_status: verde (484/484)
tests_agregados: src/app/components/home/home.component.spec.ts, src/app/components/home/hero/home-hero.component.spec.ts, src/app/components/home/team-band/team-band.component.spec.ts, src/app/components/home/companies-marquee/companies-marquee.component.spec.ts
excepciones_sin_test: composición visual (bento, marco, cinta): verificada por QA CDP
logs_conforme: sí (sin logs nuevos)
```
