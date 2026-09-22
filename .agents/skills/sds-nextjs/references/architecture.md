# Arquitectura — App Router en profundidad

## Route Groups

Los route groups `(nombre)` organizan rutas sin afectar la URL. Úsalos para:
- Separar layouts (auth vs protegido vs público)
- Agrupar features relacionados

```
app/
  (public)/                  ← sin layout de dashboard
    page.tsx                 → /
    login/page.tsx           → /login
    register/page.tsx        → /register

  (protected)/               ← con layout que verifica sesión
    layout.tsx               ← redirect a /login si no autenticado
    dashboard/page.tsx       → /dashboard
    products/
      page.tsx               → /products
      [id]/page.tsx          → /products/abc123
      [id]/edit/page.tsx     → /products/abc123/edit
      new/page.tsx           → /products/new

  api/                       ← Route Handlers (si se necesitan)
    webhooks/route.ts
```

## Protected Layout

```tsx
// src/app/(protected)/layout.tsx
import { redirect } from 'next/navigation'
import { getServerSession } from '@/lib/auth'   // implementar según auth elegida

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession()
  if (!session) redirect('/login')

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto p-6">{children}</main>
    </div>
  )
}
```

## Parallel Routes y Intercepting Routes

Solo usar cuando el diseño lo requiere explícitamente. No sobre-diseñar.

```
app/
  @modal/               ← parallel route: modal superpuesto
    (.)products/[id]/   ← intercepting: /products/123 en modal desde lista
```

## Convenciones de archivos en app/

| Archivo | Propósito |
|---------|-----------|
| `page.tsx` | UI de la ruta — único componente que Next.js expone |
| `layout.tsx` | Wrapper persistente (no re-renderiza al navegar) |
| `loading.tsx` | Suspense fallback automático |
| `error.tsx` | Error boundary de la ruta |
| `not-found.tsx` | 404 de la ruta |
| `route.ts` | Route Handler (API endpoint) |

## Separación app/ vs features/

**`app/`** — solo routing. Lo más delgado posible:
```tsx
// src/app/(protected)/products/page.tsx
import { ProductsView } from '@/features/products/components/products-view'

export default async function ProductsPage() {
  return <ProductsView />
}
```

**`features/`** — toda la lógica de dominio. Los componentes de feature pueden ser Server Components también:
```tsx
// src/features/products/components/products-view.tsx
import { apiClient } from '@/lib/api-client'

export async function ProductsView() {
  const products = await apiClient.get('/products')
  return <ProductList products={products} />
}
```

## Metadata y SEO

```tsx
// src/app/(protected)/products/[id]/page.tsx
import type { Metadata } from 'next'

type Props = { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const product = await apiClient.get<Product>(`/products/${id}`)
  return {
    title: product.name,
    description: product.description,
  }
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params
  // ...
}
```

## Naming conventions

| Elemento | Convención |
|----------|-----------|
| Archivos de componentes | `product-list.tsx` (kebab-case) |
| Nombres de componentes | `ProductList` (PascalCase) |
| Hooks | `use-products.ts` / `useProducts` |
| Stores | `auth.store.ts` / `useAuthStore` |
| Schemas | `schemas.ts` → `createProductSchema` |
| API functions | `api.ts` → `const api = { list, get, create, update, delete }` |
| Types | `types.ts` → `type Product = { ... }` |

## Variables de entorno

```
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1   ← visible en cliente
API_SECRET_KEY=...                                  ← solo servidor (sin NEXT_PUBLIC_)
```

**Regla:** si la variable contiene un secreto → sin `NEXT_PUBLIC_`. Si la necesitás en un Client Component → debe ser pública y no puede ser un secreto.
