# Data Fetching — Patrones canónicos

## API Client (lib/api-client.ts)

```ts
// src/lib/api-client.ts
const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1'

type RequestOptions = Omit<RequestInit, 'body'> & { body?: unknown }

class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, headers, ...rest } = options

  const res = await fetch(`${BASE_URL}${path}`, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText, code: 'UNKNOWN' }))
    throw new ApiError(res.status, err.code ?? 'UNKNOWN', err.message ?? res.statusText)
  }

  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

function getAuthHeaders(): Record<string, string> {
  // Implementar según auth: leer desde Zustand store o cookie
  // const token = useAuthStore.getState().token  // NO: solo en Client Components
  // Usar cookies/headers del servidor en Server Components
  return {}
}

export const apiClient = {
  get: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { method: 'GET', ...options }),
  post: <T>(path: string, body: unknown, options?: RequestOptions) =>
    request<T>(path, { method: 'POST', body, ...options }),
  put: <T>(path: string, body: unknown, options?: RequestOptions) =>
    request<T>(path, { method: 'PUT', body, ...options }),
  patch: <T>(path: string, body: unknown, options?: RequestOptions) =>
    request<T>(path, { method: 'PATCH', body, ...options }),
  delete: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { method: 'DELETE', ...options }),
}

export { ApiError }
```

## TanStack Query — Setup (lib/query-client.ts)

```tsx
// src/lib/query-client.ts
'use client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState } from 'react'

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,         // 1 minuto
            retry: (failureCount, error) => {
              // No reintentar en 4xx (errores del cliente)
              if (error instanceof ApiError && error.status < 500) return false
              return failureCount < 2
            },
          },
        },
      }),
  )

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
```

## Server Component — fetch directo

```tsx
// src/app/(protected)/products/page.tsx
import { apiClient } from '@/lib/api-client'
import type { Product } from '@/features/products/types'

// No 'use client' → Server Component → fetch en servidor
export default async function ProductsPage() {
  const products = await apiClient.get<Product[]>('/products')
  return <ProductList initialData={products} />
}
```

**Cuándo usar:** data que no cambia sin interacción del usuario. SEO. Carga inicial.

## TanStack Query — useQuery en Client Component

```tsx
// src/features/products/hooks/use-products.ts
'use client'
import { useQuery } from '@tanstack/react-query'
import { api } from '../api'

export function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: api.list,
  })
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: ['products', id],
    queryFn: () => api.get(id),
    enabled: !!id,
  })
}
```

**QueryKey convention:**
- Lista: `['products']`
- Ítem: `['products', id]`
- Con filtros: `['products', { status: 'active', page: 1 }]`
- Nested: `['users', userId, 'products']`

## TanStack Query — useMutation

```tsx
// src/features/products/hooks/use-products.ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../api'

export function useCreateProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: api.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
    },
  })
}

export function useDeleteProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
    },
  })
}
```

## Server Actions (App Router)

```ts
// src/features/products/actions.ts
'use server'
import { revalidatePath } from 'next/cache'
import { apiClient } from '@/lib/api-client'
import { createProductSchema } from './schemas'

export async function createProductAction(formData: FormData) {
  const raw = Object.fromEntries(formData)
  const parsed = createProductSchema.safeParse(raw)

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors }
  }

  await apiClient.post('/products', parsed.data)
  revalidatePath('/products')
}
```

**Usar Server Actions cuando:** el form es simple y no necesita feedback en tiempo real.  
**Preferir useMutation cuando:** necesitás `isPending`, optimistic updates, o invalidación de cache granular.

## Paginación con cursor

```tsx
// hooks/use-products-paged.ts
import { useInfiniteQuery } from '@tanstack/react-query'
import { api } from '../api'

export function useProductsPaged() {
  return useInfiniteQuery({
    queryKey: ['products', 'paged'],
    queryFn: ({ pageParam }) => api.list({ cursor: pageParam as string | undefined }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.next_cursor ?? undefined,
  })
}
```
