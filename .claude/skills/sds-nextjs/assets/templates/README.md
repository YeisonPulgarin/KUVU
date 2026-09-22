# Templates — sds-nextjs

Placeholders usados en todos los templates:

| Placeholder | Ejemplo | Descripción |
|-------------|---------|-------------|
| `{{FEATURE}}` | `products` | nombre del feature en kebab-case |
| `{{FEATURE_PASCAL}}` | `Product` | nombre del dominio en PascalCase (singular) |
| `{{FEATURE_PASCAL_PLURAL}}` | `Products` | plural para listas/pages |
| `{{API_PATH}}` | `/products` | path del endpoint en el backend |
| `{{PROJECT}}` | `taplog` | nombre del proyecto |

## Archivos por feature

Al crear un feature nuevo, usar en este orden:

1. `feature-types.ts.template` → `src/features/{{FEATURE}}/types.ts`
2. `feature-schemas.ts.template` → `src/features/{{FEATURE}}/schemas.ts`
3. `feature-api.ts.template` → `src/features/{{FEATURE}}/api.ts`
4. `feature-hooks.ts.template` → `src/features/{{FEATURE}}/hooks/use-{{FEATURE}}.ts`
5. `feature-store.ts.template` → `src/features/{{FEATURE}}/store.ts` (solo si tiene estado global)
6. `page.tsx.template` → `src/app/(protected)/{{FEATURE}}/page.tsx`

## Archivos de infraestructura (una vez por proyecto)

- `api-client.ts.template` → `src/lib/api-client.ts`
- `query-client.tsx.template` → `src/lib/query-client.tsx`
- `auth-store.ts.template` → `src/stores/auth.store.ts`
- `ui-store.ts.template` → `src/stores/ui.store.ts`
