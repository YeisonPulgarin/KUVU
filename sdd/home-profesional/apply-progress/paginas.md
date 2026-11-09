# Apply progress — home-profesional / paginas

Rama: `feat/home-profesional`. Slice 3 de 5. Estado: **completo**.

## Tareas

| # | Tarea | Estado |
|---|---|---|
| T3.1 | `/servicios` (`ServiciosComponent`): servicios con `app-service-icon`, beneficios por rol, CTA secundario "Contactar →", eyebrows 01–03, reveal, `setPage` | hecho |
| T3.2 | `buildContactMessage` (pura) + spec | hecho |
| T3.3 | `/contacto` (`ContactoComponent`): Reactive Form con `emailOrPhone`, `requiredTrue`, errores con `aria-invalid`/`aria-describedby`, `window.open` + corte de `opener`, fallback si se bloquea, región `aria-live`, otros canales y 3 pasos | hecho |
| T3.4 | `/legal` (`LegalComponent`): aviso, fecha de vigencia, índice 01–04 con fragment, 4 artículos con `id` = ancla, `app-rich-text`; importa `content/legal` directo | hecho |
| T3.5 | 404 (`NotFoundComponent`): mensaje, "Volver al inicio →", enlaces del sitio, `noindex` | hecho |
| T3.6 | Rutas lazy `servicios`, `contacto`, `legal`; `**` → `NotFoundComponent`; spec de rutas (`app.routes.spec.ts`) | hecho |

## Desvíos del plan

1. **`window.open` sin el feature `noopener`.** Con `noopener`, `window.open` devuelve
   siempre `null` y no se puede distinguir un bloqueo. Se abre con `_blank` y se corta
   `opener` a mano; `null` significa pestaña bloqueada y se muestra el enlace directo. Tras
   un envío exitoso también se ofrece "Abrir WhatsApp de nuevo".
2. **Rutas sin `title`.** `nosotros` y `preguntas-frecuentes` tenían `title` en la ruta, que
   el router aplica después de `setPage` y deja el `<title>` distinto de `og:title`. Se quita;
   cada página publica su título con `PageMetaService`.
3. **Teléfono validado** con dígitos, espacios, guiones, paréntesis y `+` inicial (7 a 20
   caracteres); la spec decía "dígitos, espacios y `+`".
4. `/legal` agrega estilos de impresión mínimos (oculta el índice); los estilos de impresión
   generales siguen como no-objetivo.

## Resultado

- Suite: **281 tests, 281 SUCCESS, 0 FAILED** (234 → 281).
- `ng build`: initial total **422.41 kB** (presupuesto 500 kB). Los textos legales quedan
  solo en el chunk lazy de `/legal` (verificado: el bundle principal lo referencia con
  `import()` dinámico). Warning preexistente de fuentes inline.

```
test_mode: test-after
test_command: $env:CHROME_BIN='C:\Program Files\Google\Chrome\Application\chrome.exe'; npx ng test --watch=false --browsers=ChromeHeadless + npx ng build (desde frontend/proyecto_angular)
tests_status: verde
tests_agregados: src/app/components/pages/servicios/servicios.component.spec.ts, src/app/components/pages/contacto/contact-message.spec.ts, src/app/components/pages/contacto/contacto.component.spec.ts, src/app/components/pages/legal/legal.component.spec.ts, src/app/components/pages/not-found/not-found.component.spec.ts, src/app/app.routes.spec.ts
excepciones_sin_test: (vacío)
logs_conforme: sí — el slice no agrega logs; el formulario no registra datos personales (test que lo verifica)
```
