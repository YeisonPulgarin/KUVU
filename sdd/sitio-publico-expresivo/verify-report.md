# Verify report — sitio-publico-expresivo

## Re-verificación tras `secure` y `refine` (estado `37467b0`)

- `secure`: sin hallazgos accionables ni cambios de código (`secure-report.md`).
- `refine`: dos refactors preservadores (`refine-report.md`): borra `.site-container` sin uso
  y la sección de pasos usa la clase global `.surface-dots`.
- Karma completo: **verde, 484/484**.
- `ng build`: initial **446,44 kB** (mejor que los 448,08 kB de la primera corrida); solo el
  `css-inline-fonts` preexistente de `/acceder`.
- QA CDP (36 escenarios): 0 fallas en las aserciones automáticas; `/acceder` sigue idéntico a
  la base en los 4 escenarios. La sección de pasos de la home no cambia contra la captura
  previa.
- Los CA1–CA13 siguen pasando; ninguna métrica empeoró.

## Primera corrida (estado `1ea138a`)

Estado verificado: `feat/sitio-publico-expresivo-home` en `1ea138a` (incluye las ramas A y B
apiladas). Slices completados: `contenido`, `chrome`, `paginas`, `home`, `cierre`. Sin
slices omitidos. Primera corrida (sin `secure` ni `refine`).

## Tests y build

| Chequeo | Resultado |
|---|---|
| Karma completo | **Verde: 484/484.** Además hubo 3 corridas seguidas en verde en `paginas` tras aislar el tema entre specs |
| `ng build` (producción) | OK. Initial **448,08 kB** contra un warning de 500 kB (base 438,52 kB, +9,56 kB) |
| `css-inline-fonts` | Solo el preexistente de `/acceder` (Syne + Inter, 19,14 kB, sin cambios). La display no se incrusta |
| `anyComponentStyle` | Sin warnings |
| QA CDP | 9 rutas × 375/1280 × claro/oscuro (36 escenarios, `prefers-reduced-motion: reduce`): 0 fallas en las aserciones automáticas (un `h1`, h1 en Big Shoulders Display con tamaño ≥ mínimo, grano presente, sin scroll horizontal, "Ingresar" con el gradiente azul de la base, eyebrows solo en `/legal`) |

## Criterios de aceptación

| CA | Resultado | Evidencia |
|---|---|---|
| CA1 | Pasa | Capturas de las 7 rutas públicas × 375/1280 × claro/oscuro: titulares en display, `scrollWidth ≤ clientWidth` en todas, grano (`.site-root::before`) en todas |
| CA2 | Pasa | Hero 116,5 px a 1280 y 47,7 px a 375 (mín. 64/40). h1 de página 80 / 39,65 px y h2 de sección 48–80 / 32–39,65 px (mín. 44/32). Cuerpo `--text-body-site` 19 / 16,2 px (mín. 17/16). Lead 27,5 px a 1280 (mín. 20) |
| CA3 | Pasa | `font-family` computado: h1/h2 = Big Shoulders Display; párrafos, leads, nav y botones = Geist |
| CA4 | Pasa | El diff contra `fix/tema-claro-tokens` no agrega literales de color en estilos ni plantillas (los únicos `rgb()` nuevos son valores esperados en specs). Derivados: `color-mix` de tokens con transparente para la trama y el hover del botón de pausa |
| CA5 | Pasa | Ver la tabla de contraste más abajo. Todos los pares cumplen AA, incluido el texto atenuado del word-reveal (4,66:1 claro, 7,1:1 oscuro; exigido ≥ 3:1 por ser texto grande) |
| CA6 | Pasa | Specs de `companies-marquee`: el botón de pausa alterna su estado y su nombre; con reduced motion simulado la banda es estática, sin copias ni botón |
| CA7 | Pasa | Specs: la home y `/nosotros` renderizan `equipo-kuvu-*` con `alt` igual al del contenido y sin nombres. `content.spec` verifica que ninguna `basePath` contiene `equipo-ycw`; `public/Imagenes_web/` ya no tiene archivos `equipo-ycw` |
| CA8 | Pasa | Specs: un solo `h1` en la home y en `app-public-page`; `app-headline` deja el texto una sola vez y sin `aria-label`/copias; los titulares partidos son iguales a su `title` |
| CA9 | Pasa | Initial 448,08 kB < 500 kB; `css-inline-fonts` sin crecer; sin errores de `anyComponentStyle` |
| CA10 | Pasa, con alcance | Suite en verde. `/acceder` idéntico píxel a píxel en los 4 escenarios. `/login` difiere en 17 px en la fila del input: es el cursor de texto, la misma diferencia en cada corrida. `/dashboard` no se capturó: la QA headless no tiene backend y la sesión se cae. Se verificó por código: el diff no toca ningún archivo de la app interna (`landing`, `login`, `dashboard`, módulos, `shared/`), y las reglas globales nuevas solo seleccionan clases del sitio público (`.site-root`, `.surface-*`, `.block-brand`, `.display-title`, `.tape`, `.btn-site`, `.site-*`) más tokens nuevos que la app no usa |
| CA11 | Pasa | Spec de la home: el orden de secciones y las anclas no cambian |
| CA12 | Pasa | Los specs existentes de `/contacto` (campos, validación, WhatsApp, sin almacenamiento) siguen en verde |
| CA13 | Pasa | "Ingresar" en header, hero y CTA final: `background-image` `linear-gradient(135deg, rgb(43, 76, 140), rgb(58, 111, 216))`, igual que la base en las 7 rutas × 4 escenarios |

### Contraste (R10.1)

| Par | Claro | Oscuro |
|---|---|---|
| Texto atenuado del word-reveal (`--dim .65`) / fondo | 4,66 | 7,10 |
| `em` `brand-600` / fondo | 6,95 | 7,52 |
| `em` `brand-600` / `brand-100` | 6,39 | 5,91 |
| `on-brand` / `brand-700` (bloques, cinta, pasos) | 9,12 | 8,55 |
| Blanco / `brand-700` (CTA final) · blanco 85 % | 9,81 · 7,62 | igual |
| muted / `brand-100` (equipo, bento) | 6,23 | 6,35 |
| muted / surface (tarjetas) | 7,29 | 7,37 |

El grano (opacidad 0,06 / 0,05) modula estos valores en menos de un 6 %; todos conservan
margen sobre su umbral.

## Pre-flight de la skill de diseño

- Sin `—` ni `–` en plantillas ni en contenido nuevo (el único match es la regex de un spec).
- Eyebrows numerados: 0 en las páginas rediseñadas; `/legal` conserva los suyos (fuera de
  alcance).
- Un solo marquee por página (compañías, en la home).
- CTA principal único: "Ingresar". "Contactar"/"Contáctanos" quedan como secundarios.
- Sin scroll cue, sin cursor propio y sin texto con gradiente.

## Ejes del protocolo

- **Documentación declarada:** `tasks` anticipa `changelog_afectado`, `architecture_afectado`,
  `guidelines_afectado` (a confirmar) y `docs/sitio-publico-expresivo.md`. Correcto.
- **Guidelines:** `DEVELOPMENT_GUIDELINES.md` no tiene sección de Angular (cubre Next.js y
  Astro). El código sigue las convenciones vigentes de `sdd-init.md`: componentes standalone,
  contenido en `content/*.ts`, sin `@apply` en estilos del bundle inicial, tokens
  `var(--token)` sin respaldo y movimiento dentro de `prefers-reduced-motion`. `document`
  debería sumar las convenciones del sitio público a los guidelines.
- **Logs:** el cambio no agrega logs (frontend de presentación). `logs_conforme: sí` en los 5
  slices.
- **Cobertura:** cada slice declara `tests_agregados`. Las excepciones documentadas son
  estilos y composición visual, cubiertos por QA CDP, y el script de variantes de imagen,
  verificado por sus salidas.

## Desvíos

Ninguno bloqueante. Desvíos de implementación ya registrados en los `apply-progress`:

1. Los titulares partidos viven en `content/headlines.ts`, no como `titleParts` dentro de cada
   módulo.
2. Contenedor de 72rem en lugar de un ancho nuevo. `--text-display-m` sube su mínimo a 2rem y
   `.display-title` usa `line-height: 1` para no pisar los acentos.
3. og:image apunta a `equipo-kuvu-1-1024.jpeg`, que es vertical.
4. El botón de WhatsApp de `/nosotros` toma el estilo `.btn-site` invertido; el envío de
   `/contacto` conserva su verde.
5. Aislamiento de specs de tema (`afterEach`) para eliminar un fallo intermitente que existía
   antes del cambio.

## Limitaciones conocidas

- En oscuro, la cinta (`.tape`, `brand-700`) contrasta poco con el fondo oscuro como
  superficie. Su texto es legible (8,55:1), pero el efecto de cinta pierde fuerza.
- `/dashboard` se verificó por código, no por captura.
