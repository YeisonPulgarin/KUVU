# Explore — home-imagen-equipo

## Pedido

Agregar la primera imagen de `frontend/proyecto_angular/public/Imagenes_web/` a la home page,
en una ubicación de máximo impacto visual, respetando paleta y estilo existentes.

## Contexto del proyecto

- `sdd/sdd-init.md`: Angular 21 + Tailwind v4, sin API HTTP pública.
- `sdd/sdd.config.md`: modalidad de tests `test-after`, almacenamiento `files`, umbral de riesgo 300 líneas, estrategia `ask-on-risk`. Sin extensiones activas.
- Cambios sin `archive-report` en `sdd/`: `bd-docker`, `mejorar-home`. No se solapan con este cambio.

## La imagen

- Archivo: `frontend/proyecto_angular/public/Imagenes_web/Equipo YCW.jpeg` (única imagen de la carpeta; carpeta sin trackear en git).
- 1536 x 1024 px, aspecto 3:2 horizontal, JPEG de 236 KB.
- Contenido: foto grupal de los tres integrantes del equipo, de traje negro y corbata, frente a un muro oscuro con el logo "YCW SYSTEMS" en letras plateadas; plantas a la izquierda y oficina iluminada a la derecha. Tonos dominantes: negro/gris carbón, blanco, verde de las plantas.
- El nombre tiene un espacio: la URL pública es `/Imagenes_web/Equipo%20YCW.jpeg`.
- Sin variantes responsive (no hay WebP/AVIF ni tamaños menores).

## Lo que existe hoy en la home

`src/app/components/home/home.component.html` (ruta `''`), secciones en orden:

| id | Rol |
|---|---|
| `inicio` (`.hero`) | Hero centrado solo texto: "KUVU.", H1, subtítulo, CTA "Ingresar". Fondo `--color-home-bg` con patrón de puntos de marca. Alto `100dvh - header`. Animación de entrada escalonada con soporte de reduced motion. |
| `que-es` | Párrafo "¿Qué es KUVU?" |
| `como-funciona` | Pasos |
| `servicios` | Tarjetas de servicios |
| `beneficios` | Beneficios por rol |
| `seguridad` | Seguridad y soporte |
| `companias` | Compañías que confían |
| `origen` (`.origin`) | "El origen de KUVU": tres párrafos desde `content/origin.ts` ("tres estudiantes universitarios en la biblioteca de su universidad"), link a `/nosotros`. Solo texto, una columna `max-w-3xl`. |
| `faq` | FAQ corto |
| `.cta-final` | CTA de cierre |

Ninguna sección de la home usa imágenes hoy; las únicas `<img>` del sitio público son los logos (header/footer).

## Archivos relevantes

| Archivo | Rol |
|---|---|
| `src/app/components/home/home.component.html` | Template de la home |
| `src/app/components/home/home.component.scss` | Estilos (Tailwind `@apply`, easing `$ease-out-expo`, `.hero`, `.origin`) |
| `src/app/components/home/home.component.ts` | Importa `origin` y demás contenido de `content/` |
| `src/app/components/home/home.component.spec.ts` | Tests: texto del origen (l.205), orden de ids de secciones (l.229) |
| `src/app/content/origin.ts`, `content/types.ts` | Contenido tipado de la sección origen |
| `src/app/content/content.spec.ts` | Tests de forma del contenido |
| `src/app/components/pages/nosotros/nosotros.component.ts` | Página `/nosotros`, también consume `origin` |
| `src/styles.css` | Tokens: `--color-brand-*` (verdes, 700 `#2f4a2f` a 100 `#e8efe8`), `--color-home-*`, con variantes dark |
| `src/app/directives` (`RevealDirective`, `data-reveal`) | Animación de aparición al hacer scroll |

## Ubicaciones candidatas

1. **Sección "El origen de KUVU" como split editorial** — foto grande a un lado (o arriba en mobile) con los tres párrafos al otro. Encaje narrativo exacto: el texto habla de "tres estudiantes" y la foto los muestra. Bordes redondeados, sombra suave, `data-reveal`. Impacto alto sin competir con el CTA del hero.
2. **Hero en split** — texto a la izquierda, foto a la derecha. Máxima visibilidad, pero cambia el hero centrado y desplaza el foco de "producto" a "equipo"; la foto de traje con logo YCW (no KUVU) puede confundir la marca en el primer pantallazo.
3. **Banda full-bleed de equipo** — sección nueva a ancho completo con la foto de fondo, overlay oscuro con gradiente de marca y una frase corta ("El equipo detrás de KUVU") + link a `/nosotros`. Muy cinematográfica; el muro oscuro de la foto favorece texto blanco encima. Agrega una sección nueva (impacta el test de orden de ids).
4. **Hero con la foto de fondo** — el más dramático, pero tapa el patrón de marca, compromete legibilidad del H1 y presenta personas en vez del producto.

Recomendación del explore: opción 1 (origen en split), o la 3 si se busca un efecto más "wow".

## Ambigüedades para el Gate A

1. Ubicación: ¿origen en split (1), hero en split (2), banda full-bleed nueva (3) o hero de fondo (4)?
2. Texto acompañante: ¿la foto refuerza el texto existente o se agrega un rótulo/caption tipo "Equipo YCW Systems — creadores de KUVU"? ¿Se nombra a las personas?
3. Marca "YCW": la foto muestra "YCW SYSTEMS" y el footer ya firma "· YCW". ¿YCW es el equipo/empresa creadora y está bien mostrarlo en la home de KUVU?
4. Optimización: ¿se renombra el archivo sin espacios (p. ej. `equipo-ycw.jpeg`) y se generan variantes WebP/tamaños responsive, o se usa tal cual?
5. ¿La misma foto se reutiliza también en `/nosotros`, o solo en la home?
6. Las próximas imágenes de `Imagenes_web/`: ¿se deja un patrón reutilizable (p. ej. campo opcional `image` en el contenido tipado) o solo se resuelve esta imagen?

## Decisiones del Gate A

1. Ubicación: sección nueva a ancho completo (opción 3), foto de fondo con velo oscuro/verde de marca, frase "El equipo detrás de KUVU" y link a `/nosotros`. El test de orden de ids de secciones se ajusta.
2. Caption con los nombres, de izquierda a derecha en la foto: Wilson Solano, Carlos Arciniegas, Yeison Pulgarin.
3. YCW es el equipo detrás de KUVU; su marca se muestra.
4. El archivo se renombra sin espacios (`equipo-ycw.jpeg`) y se generan variantes WebP y responsive.
5. La foto también aparece en la página `/nosotros`.
6. Se deja un patrón reutilizable para las próximas imágenes de `Imagenes_web/`.
7. Modo de ejecución: interactivo. Modalidad de tests: `test-after`.
