# Document-report — sitio-contenido

```
docs_archivo: docs/sitio-contenido.md (creado)
architecture: actualizado — docs/architecture.md reescrito desde el template: clúster público
  (content/, chrome, páginas, services, directives) + clúster autenticado (landing/login/gestión),
  flujos (navegación pública y acceso autenticado), decisiones estructurales y límites
guidelines: sin cambios — no hay convención de stack nueva (Angular ya es el stack; las páginas
  siguen el patrón standalone existente). Desvío a letra: ninguno
openapi: no aplica — el cambio no toca endpoints HTTP; el sitio público es contenido estático
  del SPA y el backend no se modificó
collections: no aplica — sin endpoints tocados (mismo motivo que openapi)
changelog: entrada agregada bajo [Unreleased] — secciones Added (5 secciones de la home, /nosotros,
  /preguntas-frecuentes, title+description por página) y Changed (chrome compartido + footer en la
  home)
readme: actualizado — frontend/proyecto_angular/README.md, secciones afectadas: encabezado
  (Angular 21 + sitio público), descripción, sección "Pruebas" (comando con CHROME_BIN), árbol de
  estructura (content/, components/public/, components/pages/, services/directives nuevos) y tabla
  de dependencias (Angular 21 + Tailwind v4)
config_sdd: actualizado (T10) — sdd/sdd.config.md: comando de test corregido
  (`fronted/` → `frontend/proyecto_angular`, con CHROME_BIN y ChromeHeadless) y tabla de slices
  alineada a los usados por este cambio (contenido, chrome, home-expandida, paginas, cierre)
desvios: el selector de reveals del design (`appReveal`) es en el código `[data-reveal]` (selector
  real de RevealDirective). Ya registrado en apply-progress/paginas.md y verify-report; no cambia
  comportamiento (aceptación 12 pasa). Sin otros desvíos entre design y lo implementado
```

## Notas

- Documentación escrita siguiendo el estándar de artifacts (solo tiempo presente). No se
  regeneró `DEVELOPMENT_GUIDELINES.md`: la política de logs no aplica (sin logging nuevo) y no
  hay convención nueva que registrar.
- No se tocó código de producción en esta fase; la suite siguió en verde (119/119) desde
  `verify`.
- La deuda residual (chrome duplicado entre las dos páginas, `document.write` en `pagos`) quedó
  documentada en `docs/sitio-contenido.md` → Limitaciones conocidas.