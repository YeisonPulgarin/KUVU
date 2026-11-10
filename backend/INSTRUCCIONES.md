# 🚀 Guía de instalación — ArrendApp (Angular + Node.js + MySQL XAMPP)

---

## Estructura final en tu PC

```
C:\Users\TuUsuario\
└── arrendapp\                   ← crea esta carpeta donde quieras
    ├── backend\                 ← el backend Node.js (este ZIP)
    └── frontend\
        └── proyecto_angular\   ← el proyecto Angular del ZIP anterior
```

---

## PASO 1 — Verificar XAMPP

1. Abre **XAMPP Control Panel**
2. Inicia **Apache** y **MySQL**
3. Abre el navegador en: `http://localhost/phpmyadmin`
4. Verifica que la BD **bd_arrendamientos** ya está importada ✅

---

## PASO 2 — Instalar el backend Node.js

Abre una terminal (cmd o PowerShell) y ejecuta:

```bash
# Entra a la carpeta del backend
cd C:\ruta\donde\pusiste\backend

# Instala las dependencias (solo la primera vez)
npm install

# Inicia el servidor
node server.js
```

Deberías ver:
```
✅ Conectado a bd_arrendamientos (MySQL XAMPP)
🚀 ArrendApp Backend corriendo en http://localhost:3000
```

> ⚠️ Si tu MySQL de XAMPP tiene contraseña, abre `db.js` y cambia:
> `password: ''` → `password: 'tu_contraseña'`

**Prueba que funciona:** abre `http://localhost:3000` en el navegador — debe aparecer el JSON con los endpoints.

---

## PASO 3 — Actualizar el proyecto Angular

Reemplaza estos archivos en tu proyecto Angular con los del archivo `angular-updates/`:

| Archivo en angular-updates/     | Reemplaza en frontend/src/app/                |
|---------------------------------|-----------------------------------------------|
| `auth.service.ts`               | `services/auth.service.ts`                    |
| `data.service.ts`               | `services/data.service.ts`                    |
| `login.component.ts`            | `components/login/login.component.ts`         |
| `login.component.html`          | `components/login/login.component.html`       |
| `dashboard.component.ts`        | `components/dashboard/dashboard.component.ts` |

---

## PASO 4 — Correr Angular

Abre **otra terminal** (deja el backend corriendo en la primera):

```bash
cd C:\ruta\donde\pusiste\frontend\proyecto_angular

# Solo la primera vez:
npm install

# Iniciar Angular
ng serve
```

Abre: `http://localhost:4200`

---

## PASO 5 — Ingresar al sistema

En la pantalla de login:

1. **Selecciona una empresa** (se cargan desde la BD automáticamente)
2. **Ingresa tu correo**, tu **número de cédula** y tu **contraseña**
3. La primera vez la contraseña es temporal (tu número de cédula): el sistema te pide definir una
   nueva antes de entrar. Si la olvidas, un administrador de tu inmobiliaria la restablece.

Una base de datos que ya tenía usuarios necesita la migración de contraseñas: ver
`docs/auth-contrasenas.md` → "Migrar una BD existente".

### Usuarios de prueba:

| Correo                        | Documento  | Rol           |
|-------------------------------|------------|---------------|
| juan.arciniegas@gmail.com     | 1128074279 | Administrador |
| wilsonsolano96@gmail.com      | 1127723432 | Administrador |
| yeisonpulgarin@gmail.com      | 1176243589 | Arrendatario  |
| maria.lopez@gmail.com         | 1002345678 | Arrendatario  |

---

## Resumen de puertos

| Servicio  | Puerto | Cómo iniciarlo         |
|-----------|--------|------------------------|
| XAMPP MySQL | 3306 | Desde XAMPP Control Panel |
| Backend Node.js | 3000 | `node server.js`   |
| Frontend Angular | 4200 | `ng serve`        |

---

## Si algo falla

**Error: "No se pudo conectar al servidor"**
→ Verifica que `node server.js` esté corriendo y que XAMPP MySQL esté activo.

**Error 401 al hacer login**
→ Algún dato es incorrecto o la cuenta está bloqueada por 5 intentos fallidos (espera 15 minutos
o pide a un administrador que restablezca la contraseña).

**Error: "Cannot find module bcryptjs"**
→ Ejecuta `npm install` dentro de la carpeta `backend/`

**Error: "Access to XMLHttpRequest blocked by CORS"**
→ El backend ya tiene CORS configurado para `localhost:4200`. Si usas otro puerto, cambia en `server.js`:
`origin: 'http://localhost:TUPORTE'`

**Error: "Cannot find module mysql2"**
→ Ejecuta `npm install` dentro de la carpeta `backend/`
