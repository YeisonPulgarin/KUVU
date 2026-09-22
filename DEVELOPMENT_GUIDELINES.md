<!-- sdd-installer: managed file, no editar a mano -->

# Development Guidelines

Este documento define **cómo se escribe el código** en este proyecto: convenciones de
lenguaje, estructura de módulos/features, naming, testing, logging y workflow. Es la fuente
única de las reglas de construcción; las skills de stack (`sds-backend-go`, `sds-nextjs`,
`sds-astro`) aplican estos criterios y dan los pasos concretos de ejecución.

**Lo visual vive aparte.** Tokens de color, tipografía, estados de pantalla, copy e
accesibilidad no son parte de este documento. Este archivo responde "cómo lo construyo".

Adaptá este template a tu proyecto: **borrá las secciones de stacks que no usás** (solo
backend, solo frontend Next, solo Astro, etc.) y completá los placeholders entre `{}`.

---

## Índice

- [Lenguaje & Naming](#lenguaje--naming)
- [Backend Guidelines (Go)](#backend-guidelines-go)
  - [Estructura de módulos](#estructura-de-modulos)
  - [Nuevo módulo vs nueva operación](#nuevo-módulo-vs-nueva-operación)
  - [Handlers](#handlers)
  - [Repositorios](#repositorios)
  - [Capa de dominio](#capa-de-dominio)
  - [Errores](#errores)
  - [Migraciones](#migraciones)
  - [Testing (Backend)](#testing-backend)
- [Frontend Guidelines (Next.js)](#frontend-guidelines-nextjs)
  - [Estructura de features](#estructura-de-features)
  - [Nuevo feature y nueva página](#nuevo-feature-y-nueva-página)
  - [Data fetching & estado](#data-fetching--estado)
  - [Formularios & validación](#formularios--validación)
  - [Testing (Frontend)](#testing-frontend)
- [Frontend Guidelines (Astro)](#frontend-guidelines-astro)
  - [Estructura de páginas](#estructura-de-páginas)
  - [Nueva sección y nueva página](#nueva-sección-y-nueva-página)
  - [Islands & contenido](#islands--contenido)
- [API Contract](#api-contract)
- [Base de datos & migraciones](#base-de-datos--migraciones)
- [Logging & Observability](#logging--observability)
- [Git Workflow](#git-workflow)
- [Code Review Checklist](#code-review-checklist)

---

## Lenguaje & Naming

| Contexto | Idioma |
|---|---|
| Identificadores de código (variables, funciones, tipos, interfaces) | Inglés |
| Mensajes de error devueltos al cliente | Inglés |
| Comentarios de código | Inglés |
| Mensajes de commit | Inglés (Conventional Commits) |
| Artifacts SDD, docs internas, descripciones de PR | Español |
| README, guías de desarrollador | Español |
| Claves i18n | Inglés (camelCase) |

**Rationale:** el código se mantiene legible universalmente; la documentación y los
artifacts del workflow quedan en el idioma de trabajo del equipo.

---

## Backend Guidelines (Go)

### Estructura de módulos

Cada módulo de negocio vive bajo `internal/<módulo>/` con el mismo layout por capas
(hexagonal):

```
internal/<módulo>/
├── domain/           # entidades + invariantes + interfaces (ports)
├── application/      # use cases (un archivo por operación)
└── infrastructure/   # adaptadores: http/, repository/, service/
```

**Dirección de dependencias:** siempre hacia adentro. `infrastructure` depende de
`application`; `application` depende de `domain`; `domain` no importa nada de afuera.

### Nuevo módulo vs nueva operación

- **Nuevo módulo**: crear `domain/`, `application/`, `infrastructure/`, la migración SQL, y
  wirear en `injector.go` (`injector.go` / DI) y `routes.go`. Aplicar la guía de
  `sds-backend-go`, sección "Nuevo módulo completo".
- **Nueva operación** en módulo existente: agregar el use case en `application/`, el método
  en el handler, y la ruta en `routes.go`.

### Handlers

Los handlers hacen **solo tres cosas**: parsear/validar la request, llamar el use case,
escribir la response. **Prohibido** en handlers: SQL, acceso directo a repos, lógica de
negocio, llamar a otros handlers.

### Repositorios

- Implementan la interfaz definida en `domain/repository.go`.
- Usan GORM exclusivamente (no SQL crudo, no pgx directo, no `db.AutoMigrate()`).
- Retornan la interfaz del domain, no el concreto.

### Capa de dominio

- Structs puros con invariantes y validación si hacen falta.
- Cero imports de `infrastructure/` ni `application/`.
- Las interfaces de repositorio viven acá (ports).

### Errores

- Todos los errores al cliente pasan por `pkg/apierrors`.
- Errores conocidos: `apierrors.New(code, message)`; inesperados: `apierrors.Internal(cause)`.
- Nunca exponer stack traces, errores SQL ni detalles internos al cliente.
- Los códigos de error son estables y parte del contrato de API.

### Migraciones

- Herramienta de migración: `goose` (SQL embebido).
- Cada migración tiene `-- +goose Up` y `-- +goose Down`.
- **Nunca** `db.AutoMigrate()`.

### Testing (Backend)

- Unit test de cada use case (`application/*_test.go`).
- Fakes de las interfaces de repositorio (no mocks con expectativas).
- Correr con `-race -count=1`.

---

## Frontend Guidelines (Next.js)

### Estructura de features

Cada feature vive bajo `src/features/<feature>/`:

```
src/features/<feature>/
├── components/     # componentes específicos del feature
├── hooks/          # TanStack Query hooks
├── schemas.ts      # schemas Zod
├── api.ts          # funciones que llaman al backend
├── store.ts        # slice Zustand (si aplica)
└── types.ts        # tipos TypeScript
```

### Nuevo feature y nueva página

- **Nuevo feature**: crear `src/features/<f>/` con types, schemas, api, hooks, components; y
  la página en `src/app/(protected)/<f>/page.tsx` como Server Component. Aplicar la guía de
  `sds-nextjs`, sección "Nuevo feature".
- **Nueva página**: archivo en `app/` como Server Component por defecto.

### Data fetching & estado

| Necesidad | Solución |
|---|---|
| Datos server-side (carga inicial) | RSC `fetch` directo |
| Estado server-side en cliente | TanStack Query |
| Estado global de UI / sesión | Zustand |
| Estado local | `useState` |
| Formularios | React Hook Form |

**Nunca** `useEffect` + `fetch` para cargar datos.

### Formularios & validación

- Zod schemas en `schemas.ts` para todo formulario.
- `@hookform/resolvers/zod` para conectar con React Hook Form.
- Validar en el borde (submit, server action, respuesta de API).

### Testing (Frontend)

- Vitest + Testing Library.
- Testear lo que el usuario ve y hace, no detalles de implementación.

---

## Frontend Guidelines (Astro)

### Estructura de páginas

```
src/pages/          # routing (.astro, .md, .mdx)
src/layouts/        # BaseLayout.astro (único dueño del <head>), sub-layouts
src/components/     # ui/ (Astro), react/ (islands), sections/, layout/
src/content/        # Content Collections con schema Zod
src/lib/            # api.ts, utils, seo
```

### Nueva sección y nueva página

- **Nueva sección**: componente `.astro` en `src/components/sections/`.
- **Nueva página**: archivo en `src/pages/` con layout aplicado; los meta tags de la página
  se pasan al layout (nunca hardcodear `<head>` en la página).

### Islands & contenido

- `.astro` por defecto; React **solo** para islands interactivos.
- Directiva `client:` mínima necesaria (`client:visible` por defecto).
- Content Collections (Markdown) para contenido; fetch al backend para datos dinámicos.

---

## API Contract

- **JSON body** para requests y responses.
- **snake_case** en los nombres JSON (frontera de API); **camelCase** en TypeScript.
- Métodos HTTP REST: GET (read), POST (create), PUT (full update), PATCH (partial),
  DELETE (remove).
- Rutas: `POST /api/<resource>`, `GET /api/<resource>`, `GET /api/<resource>/{id}`, etc.
- Forma de error: `{ "code": "ERROR_CODE", "message": "mensaje legible" }`.

---

## Base de datos & migraciones

- Reglas de naming: tablas snake_case plural; columnas snake_case; FK
  `<tabla_singular>_id`; timestamps `created_at`/`updated_at` (UTC); soft delete
  `deleted_at`; UUIDs como PK generados en la app.
- Detalle de tooling según el stack en las secciones de backend arriba.

---

## Logging & Observability

**Esta es la política de logs del proyecto, aplicable a todos los stacks.** Pensada para
métricas e ingestas de logs a futuro. La convención vive acá, en un solo lugar; cada skill de
stack muestra cómo aplicarla en su lenguaje.

### Formato

- **Estructurado, por defecto en JSON** (backend). En frontend, logs estructurados o al menos
  con campos consistentes.
- **Campos base comunes** en todos los stacks:
  - `service` — nombre del servicio/componente.
  - `env` — entorno de despliegue.
  - `level` — nivel (ERROR/WARN/INFO/DEBUG).
  - `msg` / `message` — descripción en texto.
  - `timestamp` — marca de tiempo.
  - `request_id` — id de request para correlación.
  - `trace_id` / `span_id` — cuando el stack tiene trazas (OTel), para correlación entre
    servicios.

### Backend (Go)

- Usar **siempre el `*slog.Logger` inyectado**, nunca `slog.<Nivel>(...)` suelto ni el
  paquete `log`. El logger inyectado es el que lleva los campos base y (si el proyecto lo
  expone) el puente a la ingesta.
- Pasar `ctx` (`InfoContext`, `ErrorContext`): es lo que adjunta `trace_id`/`span_id` y
  correlaciona el log con su traza. Un log sin `ctx` queda huérfano.
- El `request_id` viaja en el `ctx`; el logger lo agrega automáticamente.

### Niveles, con significado operativo

| Nivel | Cuándo | Ejemplo |
|---|---|---|
| ERROR | Alguien tiene que actuar | Falla la base, se descarta una entrada crítica |
| WARN | Degradado pero manejado | Rate limit alcanzado, dependencia opcional caída |
| INFO | Evento de negocio que vale conservar | Login exitoso, cambio de configuración |
| DEBUG | Diagnóstico puntual | Apagado en producción |

El **access log** elige su nivel según el status: **5xx es ERROR, 4xx es WARN**. Un 500
logueado como INFO es un fallo invisible.

### Reglas duras

- **No loguees datos sensibles.** Contraseñas, tokens, cuerpos con credenciales. Las
  cabeceras del access log pasan por una denylist si el stack lo soporta.
- **No loguees lo que debería contar una métrica.** "login failed" repetido no es un
  indicador; un contador sí. Si querés graficarlo o alertarlo, es métrica.
- **No expongas stack traces ni errores internos al cliente.**
- Un error de infraestructura no es un error de negocio: un repo caído es 500 (ERROR), no
  un 401/404 camuflado.

---

## Git Workflow

- Rama base `main`; merge **squash**.
- Branches: `feat/<slug>`, `fix/<slug>`, `chore/<slug>`.
- Commits: [Conventional Commits](https://www.conventionalcommits.org/):
  `<type>(<scope>): <descripción>`.
- Ver `sds-git` para el detalle completo (hooks, PR template, merge strategy).

---

## Code Review Checklist

Antes de aprobar un PR, verificar:

- [ ] Los identifiers, comentarios y mensajes de error están en inglés.
- [ ] El use case tiene unit tests con fakes (no mocks).
- [ ] El handler no contiene lógica de negocio.
- [ ] El repositorio usa GORM solo (sin SQL crudo).
- [ ] La capa de dominio no importa de `infrastructure/`.
- [ ] Las rutas nuevas están registradas con el middleware de auth/permisos adecuado.
- [ ] No hay `useEffect` + `fetch` para load data (Next).
- [ ] Los JSON usan snake_case; TypeScript camelCase.
- [ ] Los logs siguen la política de "Logging & Observability" de este documento.
- [ ] No se loguean datos sensibles.
- [ ] `docs/architecture.md` y este documento están al día si el cambio afecta la
      arquitectura o las convenciones.
- [ ] La suite de tests pasa en verde.
