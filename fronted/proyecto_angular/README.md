# 🏢 ArrendApp — Sistema de Gestión de Arriendos

Proyecto Angular 19 (standalone, signals) para la gestión multi-empresa de arriendos.

---

## 📋 Descripción

Aplicación web que permite a múltiples empresas inmobiliarias (Amarilo, Nido Rent, Balcones de San Soucci, Mi Inmueble) gestionar de forma independiente sus locales, contratos, pagos y mantenimientos.

---

## 🚀 Instalación y ejecución

```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar servidor de desarrollo
ng serve

# 3. Abrir en el navegador
# http://localhost:4200
```

---

## 🔐 Credenciales de prueba

| Correo | Contraseña | Rol |
|--------|-----------|-----|
| juan.arciniegas@gmail.com | 1234 | Administrador |
| wilsonsolano96@gmail.com | 1234 | Administrador |
| yeisonpulgarin@gmail.com | 1234 | Arrendatario |

> Seleccionar cualquier empresa en la pantalla de login.

---

## 🗂️ Estructura del proyecto

```
src/
└── app/
    ├── models/
    │   ├── empresa.model.ts          # Interface Empresa
    │   └── index.ts                  # Interfaces: Usuario, Local, Contrato,
    │                                 #   Mantenimiento, PagoVariado, Rol
    │
    ├── services/
    │   ├── auth.service.ts           # Autenticación, sesión, theming por empresa
    │   └── data.service.ts           # Datos mock + CRUD con signals
    │
    ├── guards/
    │   └── auth.guard.ts             # Protección de rutas privadas
    │
    ├── components/
    │   ├── shared/
    │   │   ├── navbar/               # Barra de navegación dinámica por empresa
    │   │   └── shared.styles.scss    # Estilos compartidos (modals, tablas, forms, badges)
    │   │
    │   ├── login/                    # Pantalla de login con selección de empresa
    │   ├── dashboard/                # Panel principal con estadísticas
    │   ├── locales/                  # CRUD de locales
    │   ├── contratos/                # Gestión de contratos de arrendamiento
    │   ├── pagos/                    # Registro y consulta de pagos
    │   ├── mantenimiento/            # Reportes y seguimiento de mantenimientos
    │   └── usuarios/                 # Gestión de usuarios del sistema
    │
    ├── app.routes.ts                 # Rutas con lazy loading y authGuard
    ├── app.config.ts                 # Configuración de providers Angular
    └── app.ts                        # Componente raíz
```

---

## 🔄 Ciclos de vida Angular utilizados

| Hook | Dónde | Para qué |
|------|-------|----------|
| `ngOnInit` | Todos los componentes | Inicializar datos, verificar sesión |
| `ngOnDestroy` | LocalesComponent | Limpiar recursos al desmontar |
| `computed()` | Todos los componentes | Derivar datos reactivos automáticamente |
| `signal()` | Todos los componentes | Estado local reactivo |
| `effect()` | (disponible para expandir) | Reaccionar a cambios de señales |

---

## ⚡ Características Angular 19

- ✅ **Standalone components** — sin NgModules
- ✅ **Signals** — estado reactivo moderno (`signal`, `computed`)
- ✅ **@for / @if / @empty** — nueva sintaxis de control de flujo
- ✅ **Lazy loading** — cada ruta carga su componente bajo demanda
- ✅ **AuthGuard funcional** — `CanActivateFn` moderno
- ✅ **Theming dinámico** — CSS variables cambian por empresa en runtime
- ✅ **Multi-empresa** — datos completamente aislados por `empresa_id`

---

## 🗄️ Base de datos (backend)

Archivo: `bd_arrendamientos.sql` — MariaDB 10.4

**Tablas:** `empresas` · `rol` · `usuarios` · `local` · `contratoarrendamiento` · `mantenimiento` · `pago_variados`

Para conectar al backend real, reemplazar los métodos del `DataService` con llamadas `HttpClient` al API REST.

---

## 📦 Dependencias principales

| Paquete | Versión | Uso |
|---------|---------|-----|
| @angular/core | 19.x | Framework principal |
| @angular/router | 19.x | Enrutamiento SPA |
| @angular/forms | 19.x | Formularios reactivos y template-driven |
| @angular/common | 19.x | Pipes, directivas comunes |

---

## 🔮 Próximos pasos

- [ ] Conectar `DataService` a API REST (Node.js/Express + MySQL)
- [ ] Implementar `HttpInterceptor` para JWT
- [ ] Agregar `ReactiveForms` con validaciones robustas
- [ ] Módulo de reportes con gráficas (Chart.js / ngx-charts)
- [ ] Notificaciones en tiempo real (WebSockets)
- [ ] Subida de imágenes de locales

---

*Desarrollado con Angular 19 · Proyecto DSS · 2025*
