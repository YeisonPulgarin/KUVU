# Apply progress — home-profesional / home

Rama: `feat/home-profesional`. Slice 4 de 5. Estado: **completo**.

## Tareas

| # | Tarea | Estado |
|---|---|---|
| T4.1 | Home escaparate: servicios como resumen con `app-service-icon` y "Ver servicios →"; beneficios por rol sale de la home; seguridad, compañías y origen se quedan; eyebrows 01–07; enlace secundario en el hero ("Conocé los servicios →") y en el CTA final ("Contactanos →"); `setPage(pageMeta.home)` + JSON-LD `@graph` (Organization + WebSite) retirado en `ngOnDestroy` | hecho |
| T4.2 | `/nosotros` sobre `app-public-page`, eyebrows 01–05, enlace secundario al formulario de contacto | hecho |
| T4.3 | `/preguntas-frecuentes` sobre `app-public-page`, eyebrows por grupo, grupo "Contacto y datos" visible, enlaces a `/contacto` y a la política de datos | hecho |
| T4.4 | `navLinks` y `pageNavLinks` retirados de `content/site.ts`; el header deja de tener input y usa `siteNavLinks`; specs migrados | hecho |

## Desvíos del plan

1. **`overflow-x: clip`** en `.home-layout` (en lugar de `overflow-x-hidden`), para que el
   header sticky funcione en la home. `/nosotros` y `/preguntas-frecuentes` lo heredan de
   `app-public-page`.
2. **Hero con enlace secundario** "Conocé los servicios →" junto a "Ingresar" (la spec pedía
   enlaces visibles a las 4 páginas internas; "Ingresar" sigue como único CTA principal).
3. **Botón de WhatsApp de `/nosotros`** pasa a `#1a7a43` (contraste 5.4 : 1), igual que el
   footer.
4. El ícono de servicio de la home usa `app-service-icon` (el `ngSwitch` inline sale del
   template).

## Resultado

- Suite: **295 tests, 295 SUCCESS, 0 FAILED** (281 → 295).
- `ng build`: initial total **421.39 kB** (presupuesto 500 kB). Warning preexistente de
  fuentes inline.

```
test_mode: test-after
test_command: $env:CHROME_BIN='C:\Program Files\Google\Chrome\Application\chrome.exe'; npx ng test --watch=false --browsers=ChromeHeadless + npx ng build (desde frontend/proyecto_angular)
tests_status: verde
tests_agregados: src/app/components/home/home.component.spec.ts, src/app/components/pages/nosotros/nosotros.component.spec.ts, src/app/components/pages/preguntas-frecuentes/preguntas-frecuentes.component.spec.ts, src/app/content/content.spec.ts, src/app/components/public/breadcrumb/breadcrumb.component.spec.ts
excepciones_sin_test: (vacío)
logs_conforme: sí — el slice no agrega logs
```
