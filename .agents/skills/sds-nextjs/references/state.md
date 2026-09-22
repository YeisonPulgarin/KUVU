# Estado global — Zustand

## Regla: cuándo usar Zustand vs TanStack Query

| Estado | Usar |
|--------|------|
| Datos del servidor (listas, entidades) | **TanStack Query** — no Zustand |
| Sesión del usuario (token, perfil) | **Zustand** — `auth.store.ts` |
| UI global (sidebar, theme, modals) | **Zustand** — `ui.store.ts` |
| Estado de un formulario | **React Hook Form** |
| Estado local de un componente | **useState** |

## Auth Store (src/stores/auth.store.ts)

```ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type User = {
  id: string
  email: string
  firstName: string
  lastName: string
}

type AuthState = {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  setSession: (user: User, token: string) => void
  clearSession: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      setSession: (user, token) =>
        set({ user, token, isAuthenticated: true }),

      clearSession: () =>
        set({ user: null, token: null, isAuthenticated: false }),
    }),
    {
      name: 'auth-store',           // clave en localStorage
      partialize: (state) => ({     // solo persistir lo necesario
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
)
```

**Uso:**
```tsx
'use client'
import { useAuthStore } from '@/stores/auth.store'

export function UserAvatar() {
  const user = useAuthStore((state) => state.user)
  if (!user) return null
  return <span>{user.firstName}</span>
}
```

**Leer en apiClient (fuera de componentes):**
```ts
const token = useAuthStore.getState().token  // snapshot, sin reactividad
```

## UI Store (src/stores/ui.store.ts)

```ts
import { create } from 'zustand'

type UIState = {
  sidebarOpen: boolean
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
}

export const useUIStore = create<UIState>()((set) => ({
  sidebarOpen: true,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
}))
```

## Feature Store (cuando un feature tiene estado complejo)

```ts
// src/features/notifications/store.ts
import { create } from 'zustand'

type Notification = { id: string; message: string; type: 'success' | 'error' }

type NotificationState = {
  notifications: Notification[]
  push: (notification: Omit<Notification, 'id'>) => void
  dismiss: (id: string) => void
}

export const useNotificationStore = create<NotificationState>()((set) => ({
  notifications: [],
  push: (n) =>
    set((s) => ({
      notifications: [...s.notifications, { ...n, id: crypto.randomUUID() }],
    })),
  dismiss: (id) =>
    set((s) => ({ notifications: s.notifications.filter((n) => n.id !== id) })),
}))
```

## Selector granular (evitar re-renders)

```tsx
// ❌ INCORRECTO: re-render en cualquier cambio del store
const { user, token } = useAuthStore()

// ✅ CORRECTO: suscripción granular
const user = useAuthStore((state) => state.user)
const token = useAuthStore((state) => state.token)
```
