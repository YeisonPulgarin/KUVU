# Testing — Vitest + Testing Library + Playwright

## Setup Vitest (vitest.config.ts)

```ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
})
```

```ts
// src/test/setup.ts
import '@testing-library/jest-dom'
```

## Test de hook con TanStack Query

```tsx
// src/features/products/hooks/__tests__/use-products.test.tsx
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { useProducts } from '../use-products'
import { api } from '../../api'

vi.mock('../../api')

function wrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>
}

describe('useProducts', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns products from api', async () => {
    const mockProducts = [{ id: '1', name: 'Test' }]
    vi.mocked(api.list).mockResolvedValue(mockProducts)

    const { result } = renderHook(() => useProducts(), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(mockProducts)
  })

  it('handles api error', async () => {
    vi.mocked(api.list).mockRejectedValue(new Error('Network error'))

    const { result } = renderHook(() => useProducts(), { wrapper })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})
```

## Test de componente

```tsx
// src/features/products/components/__tests__/product-list.test.tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { ProductList } from '../product-list'

const mockProducts = [
  { id: '1', name: 'Widget', price: 10 },
  { id: '2', name: 'Gadget', price: 20 },
]

describe('ProductList', () => {
  it('renders all products', () => {
    render(<ProductList products={mockProducts} />)

    expect(screen.getByText('Widget')).toBeInTheDocument()
    expect(screen.getByText('Gadget')).toBeInTheDocument()
  })

  it('calls onDelete when delete button clicked', async () => {
    const onDelete = vi.fn()
    render(<ProductList products={mockProducts} onDelete={onDelete} />)

    await userEvent.click(screen.getAllByRole('button', { name: /eliminar/i })[0])

    expect(onDelete).toHaveBeenCalledWith('1')
  })

  it('shows empty state when no products', () => {
    render(<ProductList products={[]} />)

    expect(screen.getByText(/no hay productos/i)).toBeInTheDocument()
  })
})
```

## Test de schema Zod

```ts
// src/features/products/schemas.test.ts
import { describe, it, expect } from 'vitest'
import { createProductSchema } from './schemas'

describe('createProductSchema', () => {
  it('accepts valid input', () => {
    const result = createProductSchema.safeParse({
      name: 'Widget',
      price: 10.99,
      category_id: '550e8400-e29b-41d4-a716-446655440000',
    })
    expect(result.success).toBe(true)
  })

  it('rejects negative price', () => {
    const result = createProductSchema.safeParse({ name: 'Widget', price: -1 })
    expect(result.success).toBe(false)
    expect(result.error?.flatten().fieldErrors.price).toBeDefined()
  })
})
```

## Playwright E2E (playwright.config.ts)

```ts
import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
})
```

```ts
// e2e/products.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Products', () => {
  test.beforeEach(async ({ page }) => {
    // Login si es necesario
    await page.goto('/login')
    await page.fill('[name=email]', 'test@example.com')
    await page.fill('[name=password]', 'password')
    await page.click('button[type=submit]')
    await page.waitForURL('/dashboard')
  })

  test('shows products list', async ({ page }) => {
    await page.goto('/products')
    await expect(page.getByRole('heading', { name: 'Productos' })).toBeVisible()
    await expect(page.getByRole('row')).toHaveCount.greaterThan(1)
  })

  test('creates a new product', async ({ page }) => {
    await page.goto('/products/new')
    await page.fill('[name=name]', 'Test Product')
    await page.fill('[name=price]', '99.99')
    await page.click('button[type=submit]')
    await page.waitForURL('/products')
    await expect(page.getByText('Test Product')).toBeVisible()
  })
})
```

## Qué testear y qué no

| Testear | No testear |
|---------|-----------|
| Schemas Zod (unidad) | Componentes puramente visuales sin lógica |
| Hooks con lógica de query | Estilos Tailwind |
| Formularios (submit, validación) | Implementación interna de librerías |
| Flows críticos (login, checkout) | Cada prop de cada componente |
| Mappers snake_case → camelCase | Código de terceros |
