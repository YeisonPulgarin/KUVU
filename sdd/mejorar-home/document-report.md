# Document Report: Mejorar Home Page

```
docs_archivo: docs/mejorar-home.md (creado)
architecture: sin cambios — el cambio es visual de un componente + integración de
    Tailwind; no altera componentes/capas/flujos. Nota: es el template del instalador
    sin completar (placeholders {backend}/{frontend}...); completarlo queda como
    deuda del proyecto, no de este cambio.
guidelines: sin cambios — Tailwind v4 es decisión de estilos (lo visual vive aparte del
    guideline). DESVÍO reportado al orquestador: el cambio introduce una convención de
    stack (integración Tailwind v4 + Angular 21, vía @tailwindcss/postcss + postcss.config.json
    + @reference en componentes) que podría merecer una entrada en DEVELOPMENT_GUIDELINES.md.
    No se escribió directo: requiere decisión del orquestador (entrar por spec o dejarlo
    documentado solo en docs/mejorar-home.md).
openapi: no aplica — el proyecto no expone API HTTP (expone_api_http: false en sdd-init).
collections: no aplica — no hay endpoints HTTP.
changelog: creado CHANGELOG.md con entrada bajo [Unreleased] → Changed (home responsiva
    mobile-first, menú hamburguesa, Tailwind v4).
readme: no aplica — el cambio no altera instalación, comandos, variables de entorno ni
    descripción del proyecto.
desvios: 
    - INTEGRACIÓN (resuelta en apply): el build fallaba con Tailwind v4 + Angular 21;
      la corrección quedó documentada en apply-progress/slice-unico.md y
      verify-report.md. La convención de integración (sin tailwind.config.js,
      postcss.config.json, @reference) es lo que se propone considerar para guidelines.
    - docs/architecture.md es el template sin completar (pre-existente, fuera de alcance).
    - README del frontend declara "Angular 19" pero el proyecto está en Angular 21
      (pre-existente, no tocado por este cambio).
```

## Documentación producida

- `docs/mejorar-home.md` — descripción del cambio en tiempo presente: integración Tailwind v4,
  mecánica del menú móvil, layout responsivo, decisiones y limitaciones conocidas.
- `CHANGELOG.md` (nuevo en la raíz) — entrada `[Unreleased]` → `Changed` con las mejoras
  visibles de la home page.

## Pendientes reportados al orquestador

1. **Convención Tailwind v4 para guidelines** — decidir si entra a `DEVELOPMENT_GUIDELINES.md`
   (por el flujo spec/design) o si basta `docs/mejorar-home.md`.
2. **`docs/architecture.md`** sigue siendo el template del instalador sin completar (deuda
   pre-existente del proyecto).
3. **README del frontend** declara Angular 19 y el proyecto es Angular 21 (deuda pre-existente).