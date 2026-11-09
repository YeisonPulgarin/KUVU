# Seguridad — sitio-publico-expresivo

## Modelo de amenazas (resumen)

- **Activos:** integridad del sitio público (contenido, marca), privacidad de las personas que
  aparecen en las fotos y disponibilidad/rendimiento de la SPA. El cambio no maneja PII de
  visitantes, credenciales ni datos financieros, ni toca auth, guards o la app interna.
- **Fronteras de confianza:** ninguna nueva. El contenido es estático y está empaquetado
  (`content/*.ts`). La fuente y las imágenes se sirven desde el mismo origen (`public/`). No
  hay endpoints, formularios nuevos ni datos de terceros. El formulario de `/contacto` conserva
  su lógica (abre WhatsApp, sin almacenamiento).
- **STRIDE-lite:** Tampering/XSS sobre los titulares partidos (fuente: módulos TS propios) y
  Information disclosure por metadatos de las fotos. El resto no aplica.

## Hallazgos por severidad

Ninguna vulnerabilidad confirmada ni hallazgo accionable.

- **XSS en `app-headline`:** descartado. Renderiza solo por interpolación (`{{ }}`), sin
  `innerHTML`, `bypassSecurityTrust*` ni HTML construido. Los datos son constantes de
  `content/headlines.ts`.
- **Metadatos de las fotos:** descartado. Las 14 variantes `equipo-kuvu-*` no tienen EXIF,
  XMP ni GPS (verificado con Pillow); los originales tampoco tenían EXIF.
- **Enlaces externos:** el único `target="_blank"` tocado (WhatsApp en `/nosotros`) conserva
  `rel="noopener"`.
- **Fuente de terceros:** se autohospeda (sin petición a Google para la display) y lleva su
  licencia OFL en `public/fonts/OFL.txt`. El SVG del grano es un data-URI estático.

## Acciones fuera del código

- Secretos a ROTAR: ninguno (sin secretos en el diff ni en los archivos nuevos).
- Dependencias a actualizar (SCA): ninguna; el cambio no modifica `package.json` ni el lock.
- Configuración / infra a endurecer: ninguna nueva.

## Riesgo residual aceptado

- **Fotos de personas reales** (los tres integrantes del equipo) publicadas en el sitio. El
  material lo aporta el propio equipo y los `alt` no nombran a nadie; el consentimiento de
  publicación es responsabilidad del equipo. No es un riesgo de código. Lo registra el
  orquestador.

## Alcance de la búsqueda

- Revisión manual del diff completo `fix/tema-claro-tokens..feat/sitio-publico-expresivo-home`
  (81 archivos de frontend): búsqueda de sinks (`innerHTML`, `outerHTML`,
  `bypassSecurityTrust`, `eval`, `new Function`, `document.write`), de `target="_blank"` sin
  `noopener`, de patrones de secretos en el diff, de cambios de dependencias y de metadatos en
  las imágenes nuevas.
- Fuera de alcance: backend, app interna, `/acceder` y `/login` (no se tocaron), y DAST
  (sin endpoints nuevos). Un scan limpio no prueba ausencia de vulnerabilidades.
