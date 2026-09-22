# Forms — React Hook Form + Zod

## Patrón completo

```tsx
'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { z } from 'zod'
import { api } from '../api'

// 1. Schema Zod → tipo inferido (único fuente de verdad)
const createUserSchema = z.object({
  email: z.string().email('Email inválido'),
  first_name: z.string().min(2, 'Mínimo 2 caracteres'),
  last_name: z.string().min(2, 'Mínimo 2 caracteres'),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
})
type CreateUserInput = z.infer<typeof createUserSchema>

export function CreateUserForm() {
  const queryClient = useQueryClient()

  // 2. RHF con zodResolver
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setError,
  } = useForm<CreateUserInput>({
    resolver: zodResolver(createUserSchema),
    defaultValues: { email: '', first_name: '', last_name: '', password: '' },
  })

  // 3. Mutación TanStack
  const mutation = useMutation({
    mutationFn: api.users.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      reset()
    },
    onError: (error) => {
      // Mapear errores de API a campos del form
      if (error instanceof ApiError && error.code === 'USER_EXISTS') {
        setError('email', { message: 'Este email ya está registrado' })
      }
    },
  })

  const onSubmit = (data: CreateUserInput) => mutation.mutate(data)

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div>
        <label htmlFor="email">Email</label>
        <input id="email" type="email" {...register('email')} />
        {errors.email && <p role="alert">{errors.email.message}</p>}
      </div>

      <div>
        <label htmlFor="first_name">Nombre</label>
        <input id="first_name" {...register('first_name')} />
        {errors.first_name && <p role="alert">{errors.first_name.message}</p>}
      </div>

      {mutation.isError && !mutation.error.code && (
        <p role="alert">Error inesperado. Intentá de nuevo.</p>
      )}

      <button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? 'Creando...' : 'Crear usuario'}
      </button>
    </form>
  )
}
```

## Schema en archivo separado (features/{{feature}}/schemas.ts)

```ts
// Separar schemas del componente — reutilizables en server actions y tests
import { z } from 'zod'

export const createProductSchema = z.object({
  name: z.string().min(1, 'Requerido').max(100),
  price: z.coerce.number().positive('Debe ser positivo'),
  category_id: z.string().uuid('UUID inválido'),
  description: z.string().optional(),
})

export const updateProductSchema = createProductSchema.partial().extend({
  id: z.string().uuid(),
})

export type CreateProductInput = z.infer<typeof createProductSchema>
export type UpdateProductInput = z.infer<typeof updateProductSchema>
```

## Formulario de edición (valores iniciales desde API)

```tsx
'use client'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { Product } from '../types'
import { updateProductSchema, type UpdateProductInput } from '../schemas'

export function EditProductForm({ product }: { product: Product }) {
  const form = useForm<UpdateProductInput>({
    resolver: zodResolver(updateProductSchema),
    defaultValues: {
      name: product.name,
      price: product.price,
      description: product.description ?? '',
    },
  })

  // Si el product cambia externamente, sincronizar
  useEffect(() => {
    form.reset({
      name: product.name,
      price: product.price,
      description: product.description ?? '',
    })
  }, [product, form])

  // ...
}
```

## Validación condicional

```ts
const schema = z.object({
  type: z.enum(['individual', 'company']),
  company_name: z.string().optional(),
  tax_id: z.string().optional(),
}).refine(
  (data) => data.type !== 'company' || !!data.company_name,
  { message: 'Nombre de empresa requerido', path: ['company_name'] },
)
```

## Error handling de API → campo del form

| Código de error API | Acción en form |
|---------------------|----------------|
| `USER_EXISTS` | `setError('email', { message: '...' })` |
| `INVALID_CREDENTIALS` | `setError('root', { message: '...' })` |
| `MISSING_FIELDS` | `setError('root', { message: '...' })` |
| 5xx / desconocido | Mostrar error general sin `setError` |
