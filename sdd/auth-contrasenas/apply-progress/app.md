# apply-progress — app

Rama `feat/auth-contrasenas-usuarios`, apilada sobre `feat/app-interna-ux-gestion` (9a44105).
Los artifacts de planificación del cambio están en la rama `feat/auth-contrasenas`.

```
test_mode: test-after
test_command: $env:CHROME_BIN=...chrome.exe; npx ng test --watch=false --browsers=ChromeHeadless (frontend/proyecto_angular) + npx ng build
tests_status: verde (572 specs, 0 fallos; build OK)
tests_agregados:
  - src/app/components/usuarios/usuarios.component.spec.ts (9 casos nuevos, 1 reescrito)
  - src/app/services/data.service.spec.ts ("users and passwords")
  - src/app/components/shared/sidebar/sidebar.component.spec.ts (enlace a cambio de contraseña)
  - src/app/services/password-policy.spec.ts (copia idéntica a la de feat/auth-contrasenas)
  - src/app/components/shared/testing/app-doubles.ts (doble `restablecerPassword`, correos y marca temporal)
excepciones_sin_test: ninguna
logs_conforme: sí (el slice no agrega logs; se quita un `console.error` del error de creación, que podía volcar la respuesta del backend)
```

## Tareas

| Tarea | Estado |
|---|---|
| T-20 `Usuario.debe_cambiar_password`, `DataService.agregarUsuario(usuario, temporal, admin)`, `restablecerPassword`, `actualizarUsuario` con campos editables | completa |
| T-21 pantalla `usuarios`: temporal + confirmación del admin al crear, "Restablecer contraseña" (modal + toast), badge "Contraseña temporal" | completa |
| T-22 sidebar: enlace "Cambiar contraseña" | completa |

## Desvíos y notas

- Ícono `lock` (ya existe en el set de app-interna-ux) en lugar de agregar `key`.
- `services/password-policy.ts` y su spec se copian idénticos desde `feat/auth-contrasenas`: esta
  rama no parte de esa, y un archivo agregado con el mismo contenido en las dos ramas se integra
  sin conflicto.
- El botón de restablecer no se muestra en la tarjeta propia (el administrador usa "Cambiar
  contraseña").
- La temporal se escribe en un campo de texto visible (el administrador tiene que poder dictarla);
  la contraseña del administrador va en un campo `password` y se limpia tras cada intento y al
  cerrar el modal.
- En una de las corridas de Karma falló una vez `StepsJourneyComponent … brand colours` (home,
  ajeno a este cambio); en las corridas siguientes pasó. Se registra como test inestable
  preexistente.
- En ejecución, esta rama necesita el backend y `/cambiar-contrasena` de `feat/auth-contrasenas`.
