---
name: sds-nextjs
description: Desarrollo frontend Next.js — App Router, TypeScript, Tailwind, TanStack Query, Zustand, RHF+Zod. Pregunta si usar shadcn/ui o componentes a medida.
version: 1.0.0
---

# Activation Contract

**Soy:** experto en frontend Next.js para proyectos salomondevsystems  
**Activo cuando:** trabajo en proyectos Next.js con App Router  
**Excelente en:** arquitectura de features, data fetching, formularios, estado global, componentes

---

# Fase 1 — Entrevista (SIEMPRE primero)

Hacer estas preguntas antes de escribir cualquier archivo.

## Pregunta 1 — Nombre del proyecto
```
¿Cuál es el nombre del proyecto? (ej: taplog, crm, dashboard)
```

## Pregunta 2 — Librería de componentes UI
```
¿Qué enfoque de componentes UI preferís?

  a) shadcn/ui — componentes basados en Radix UI + Tailwind instalados como
     código propio (copy-paste). Rápido de arrancar, accesible, personalizable.
     Ideal cuando querés velocidad y consistencia sin un look muy "custom".

  b) A medida — componentes propios construidos sobre Radix UI (headless) +
     Tailwind. Más trabajo inicial, control total sobre la API y el diseño.
     Ideal cuando el proyecto tiene un design system propio o identidad visual
     muy específica.
```
→ La elección afecta `src/components/ui/`, los templates de componentes y el setup inicial.

## Pregunta 3 — Autenticación
```
¿El proyecto requiere autenticación?
  a) Sí — gestión de sesión propia (con el backend Go vía JWT/Keycloak)
  b) Sí — Auth.js (NextAuth v5)
  c) No por ahora
```

## Pregunta 4 — URL base del backend
```
¿Cuál es la URL base de la API del backend? (ej: http://localhost:8000/api/v1)
```
→ Usada en `NEXT_PUBLIC_API_URL` y en el API client.

---

# Hard Rules

## 1. Stack fijo (NO negociable)

✅ **SIEMPRE:**
- Next.js App Router (nunca Pages Router)
- TypeScript estricto (`strict: true` en tsconfig)
- Tailwind CSS para estilos
- TanStack Query para data fetching del lado cliente
- Zustand para estado global
- React Hook Form + Zod para formularios
- Vitest + Testing Library para tests unitarios
- Playwright para tests E2E

❌ **NUNCA:**
- `useEffect` para data fetching — usar Server Components o TanStack Query
- Estado global en React Context para datos del servidor
- `any` en TypeScript
- Lógica de negocio en componentes — ir a hooks o server actions
- CSS inline (`style={{}}`) salvo excepciones justificadas

## 2. Server Component por defecto

```tsx
// ✅ CORRECTO: Server Component por defecto (sin directiva)
export default async function ProductsPage() {
  const products = await fetchProducts() // fetch directo en server
  return <ProductList products={products} />
}

// ✅ CORRECTO: Client Component solo cuando es necesario
'use client'
export function ProductFilter({ onChange }: Props) { ... }

// ❌ INCORRECTO: Client Component innecesario para data estática
'use client'
export default function ProductsPage() {
  useEffect(() => { fetchProducts() }, []) // anti-patrón
}
```

## 3. Zod en el límite del sistema

```ts
// ✅ CORRECTO: validar en el borde (form submit, server action, API response)
const schema = z.object({ email: z.string().email(), name: z.string().min(2) })
type FormData = z.infer<typeof schema>

// ❌ INCORRECTO: validar solo en el componente con lógica manual
if (!email.includes('@')) setError('invalid email')
```

## 4. Nunca fetch directo en Client Components

```ts
// ✅ CORRECTO: TanStack Query en client
const { data } = useQuery({ queryKey: ['products'], queryFn: api.products.list })

// ❌ INCORRECTO: fetch en useEffect
useEffect(() => { fetch('/api/products').then(...) }, [])
```

## 5. Mutations vía Server Actions o TanStack Mutation

```ts
// ✅ Server Action (App Router)
'use server'
export async function createProduct(data: CreateProductInput) { ... }

// ✅ TanStack Mutation (client con API REST)
const mutation = useMutation({ mutationFn: api.products.create })
```

## 6. snake_case en JSON, camelCase en TypeScript

```ts
// API responde snake_case → transformar al mapear
type ApiProduct = { created_at: string; first_name: string }
type Product = { createdAt: Date; firstName: string }

function toProduct(raw: ApiProduct): Product {
  return { createdAt: new Date(raw.created_at), firstName: raw.first_name }
}
```

---

# Arquitectura

## Estructura de directorios

```
src/
  app/                        ← Next.js App Router (solo routing)
    (public)/                 ← route group: páginas sin auth
      login/
        page.tsx
      page.tsx                ← landing
    (protected)/              ← route group: páginas con auth
      layout.tsx              ← verifica sesión
      dashboard/
        page.tsx
      [feature]/
        page.tsx
    layout.tsx                ← root layout: providers
    not-found.tsx
    error.tsx

  components/
    ui/                       ← shadcn/ui o componentes a medida
      button.tsx
      input.tsx
      ...
    layout/                   ← header, sidebar, footer, nav
    common/                   ← componentes reutilizables cross-feature

  features/                   ← módulos por dominio (espejo del backend)
    auth/
      components/             ← componentes específicos del feature
      hooks/                  ← useAuth, useSession, etc.
      actions.ts              ← server actions del feature
      api.ts                  ← funciones que llaman al backend
      schemas.ts              ← schemas Zod del feature
      store.ts                ← Zustand store (si tiene estado global)
      types.ts                ← tipos TypeScript del feature
    products/
      ...

  lib/
    api-client.ts             ← fetch wrapper con auth headers y error handling
    query-client.ts           ← configuración de TanStack Query
    utils.ts                  ← cn(), formatDate(), etc.

  stores/                     ← stores Zustand globales (sesión, UI global)
    auth.store.ts
    ui.store.ts

  types/                      ← tipos compartidos entre features
    api.ts                    ← tipos de respuesta genéricos
    common.ts

  hooks/                      ← hooks globales (useDebounce, useMediaQuery, etc.)
```

## Regla de capas dentro de un feature

```
page.tsx (Server Component)
  └─ fetches data directamente o via server action
  └─ pasa data a Client Components

<Feature>List (Client Component — solo si necesita interactividad)
  └─ usa useQuery de feature/hooks/
  └─ usa feature/api.ts via TanStack Query

feature/api.ts
  └─ llama a lib/api-client.ts

lib/api-client.ts
  └─ fetch al backend Go
```

---

# Decision Gates

## ¿Server Component o Client Component?

| Necesita | Usar |
|----------|------|
| Solo mostrar datos (sin interacción) | Server Component |
| Estado local (`useState`) | `'use client'` |
| Event handlers (`onClick`, `onChange`) | `'use client'` |
| Browser APIs (`localStorage`, `window`) | `'use client'` |
| TanStack Query / hooks | `'use client'` |
| Formularios interactivos | `'use client'` |

**Regla práctica:** empezar como Server Component. Agregar `'use client'` solo cuando el compilador o la lógica lo requiere.

## ¿Server Action o TanStack Mutation?

| Caso | Usar |
|------|------|
| Mutación simple sin loading state | Server Action |
| Necesita `isPending`, optimistic update, retry | TanStack `useMutation` |
| Formulario con RHF | Server Action + `useActionState` o Mutation |
| Mutación con invalidación de cache | TanStack `useMutation` + `queryClient.invalidateQueries` |

## ¿Zustand o TanStack Query para el estado?

| Tipo de estado | Usar |
|----------------|------|
| Datos del servidor (listas, entidades) | TanStack Query |
| Sesión del usuario / token | Zustand (`auth.store.ts`) |
| UI global (sidebar open, theme, modal) | Zustand (`ui.store.ts`) |
| Estado de formulario | React Hook Form |
| Estado local del componente | `useState` |

---

# Execution Steps

## 1. Setup inicial del proyecto

```bash
npx create-next-app@latest {{PROJECT}} \
  --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"

cd {{PROJECT}}

# Dependencias base
npm install @tanstack/react-query @tanstack/react-query-devtools
npm install zustand
npm install react-hook-form @hookform/resolvers zod
npm install -D vitest @vitejs/plugin-react @testing-library/react @testing-library/user-event
npm install -D playwright @playwright/test
```

**Si shadcn/ui:**
```bash
npx shadcn@latest init
# Seleccionar: Default style, slate color, CSS variables: yes
npx shadcn@latest add button input label form card dialog table
```

**Si componentes a medida:**
```bash
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu
npm install @radix-ui/react-label @radix-ui/react-slot
npm install class-variance-authority clsx tailwind-merge
```

## 2. Configurar providers (src/app/layout.tsx)

```tsx
import { QueryProvider } from '@/lib/query-client'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  )
}
```

## 3. Nuevo feature

1. Crear `src/features/{{feature}}/types.ts` — tipos TypeScript
2. Crear `src/features/{{feature}}/schemas.ts` — schemas Zod
3. Crear `src/features/{{feature}}/api.ts` — llamadas al backend
4. Crear `src/features/{{feature}}/hooks/use-{{feature}}.ts` — TanStack Query hooks
5. Crear `src/features/{{feature}}/components/` — componentes del feature
6. Crear `src/app/(protected)/{{feature}}/page.tsx` — página (Server Component)
7. Si tiene estado global: `src/features/{{feature}}/store.ts`

Ver templates en `assets/templates/`.

## 4. Nueva página (Server Component)

```tsx
// src/app/(protected)/products/page.tsx
import { ProductList } from '@/features/products/components/product-list'
import { apiClient } from '@/lib/api-client'
import type { Product } from '@/features/products/types'

export default async function ProductsPage() {
  // Fetch server-side — sin loading state, datos disponibles al renderizar
  const products = await apiClient.get<Product[]>('/products')

  return (
    <main>
      <h1>Productos</h1>
      <ProductList initialData={products} />
    </main>
  )
}
```

## 5. Formulario con RHF + Zod

```tsx
'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createProductSchema, type CreateProductInput } from '../schemas'
import { api } from '../api'

export function CreateProductForm() {
  const queryClient = useQueryClient()
  const form = useForm<CreateProductInput>({
    resolver: zodResolver(createProductSchema),
    defaultValues: { name: '', price: 0 },
  })

  const mutation = useMutation({
    mutationFn: api.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      form.reset()
    },
  })

  return (
    <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))}>
      {/* campos */}
      <button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? 'Creando...' : 'Crear'}
      </button>
      {mutation.isError && <p>{mutation.error.message}</p>}
    </form>
  )
}
```

---

# Output Contract

**Entrego al crear un feature:**
- ✅ `types.ts` — tipos TypeScript inferidos desde Zod donde sea posible
- ✅ `schemas.ts` — schemas Zod para validación de forms y API responses
- ✅ `api.ts` — funciones que usan `apiClient`, tipadas
- ✅ `hooks/` — TanStack Query hooks (`useQuery`, `useMutation`)
- ✅ `components/` — Server o Client Components según corresponda
- ✅ Página en `app/` como Server Component

**Garantizo:**
- Sin `useEffect` para data fetching
- Sin `any` en TypeScript
- Formularios con `zodResolver` siempre
- Errores de API mapeados a errores de UX (nunca exponer stack traces)
- `queryKey` consistentes por feature (`['products']`, `['products', id]`)
- Invalidación de cache tras mutaciones

---

# References

- `references/architecture.md` — App Router en profundidad, route groups, layouts
- `references/data-fetching.md` — Server Components, TanStack Query, Server Actions
- `references/forms.md` — React Hook Form + Zod, patrones de error handling
- `references/state.md` — Zustand: stores, slices, persistencia
- `references/testing.md` — Vitest + Testing Library, Playwright
- `assets/templates/README.md` — catálogo de templates y placeholders
- `DEVELOPMENT_GUIDELINES.md` (raíz) — el documento que define cómo se construye en este
  proyecto: estructura de features, páginas y la política de logs (Logging & Observability)
