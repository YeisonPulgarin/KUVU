# Islands Architecture — Astro + React

## Concepto

Un "island" es un componente interactivo React hidratado en el cliente. El resto del HTML lo genera Astro en el servidor — sin JS para el usuario.

```
Página HTML completa
├── Header.astro      ← sin JS
├── Hero.astro        ← sin JS
├── SearchBar.tsx     ← ISLAND 🏝 (client:visible)
├── ProductGrid.astro ← sin JS
└── ContactForm.tsx   ← ISLAND 🏝 (client:visible)
```

## Cuándo crear un island React

✅ Crear island cuando:
- El componente tiene `useState`, `useEffect`, `useRef`
- Responde a eventos del usuario (click, input, scroll)
- Necesita acceso a APIs del browser (localStorage, navigator, matchMedia)
- Usa librerías que solo funcionan en cliente (maps, charts, date pickers)

❌ NO crear island cuando:
- El componente solo muestra datos (texto, imágenes, listas)
- Las animaciones son puramente CSS/Tailwind
- El componente solo cambia en deploy (no en runtime)

## Directivas client: — referencia completa

```astro
<!-- Hidrata apenas carga el JS principal. Usar solo para islands críticos. -->
<HeroCarousel client:load />

<!-- Hidrata cuando el browser está idle (requestIdleCallback). Recomendado para UI no crítica above the fold. -->
<LiveChat client:idle />

<!-- Hidrata cuando el componente entra al viewport (IntersectionObserver). DEFAULT para la mayoría de islands. -->
<NewsletterForm client:visible />
<Testimonials client:visible />
<Map client:visible />

<!-- Solo renderiza en el cliente — sin SSR del componente. Útil para libs que asumen window/document. -->
<AnalyticsDashboard client:only="react" />

<!-- Hidrata solo cuando la media query es verdadera. -->
<MobileMenu client:media="(max-width: 768px)" />
```

## Pasar props a islands

```astro
---
import ProductFilter from './ProductFilter.tsx'
const { initialProducts, categories } = Astro.props
---

<!-- Props se serializan — deben ser JSON-serializable -->
<ProductFilter
  client:visible
  initialProducts={initialProducts}
  categories={categories}
/>
```

**Restricción:** las props a islands deben ser serializables (string, number, plain objects, arrays). No se puede pasar funciones ni clases.

## Compartir estado entre islands — Nanostores

Cuando dos islands necesitan compartir estado (ej: carrito + header con contador), usar `nanostores`:

```bash
npm install nanostores @nanostores/react
```

```ts
// src/lib/stores/cart.store.ts
import { atom, computed } from 'nanostores'

type CartItem = { id: string; quantity: number; price: number }

export const cartItems = atom<CartItem[]>([])

export const cartTotal = computed(cartItems, items =>
  items.reduce((sum, item) => sum + item.price * item.quantity, 0)
)

export function addToCart(item: CartItem) {
  const current = cartItems.get()
  const existing = current.find(i => i.id === item.id)
  if (existing) {
    cartItems.set(current.map(i =>
      i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
    ))
  } else {
    cartItems.set([...current, item])
  }
}
```

```tsx
// src/components/react/CartButton.tsx
'use client'  // NO necesario en islands React de Astro — son client by default
import { useStore } from '@nanostores/react'
import { cartItems, cartTotal } from '../../lib/stores/cart.store'

export function CartButton() {
  const items = useStore(cartItems)
  const total = useStore(cartTotal)

  return (
    <button>
      Carrito ({items.length}) — ${total.toFixed(2)}
    </button>
  )
}
```

```astro
<!-- Ambos islands comparten el mismo store reactivo -->
<AddToCartButton client:visible productId={product.id} />
<CartButton client:visible />
```

**Nota:** En Astro NO existe React Context global entre islands — cada island es un árbol React separado. Nanostores es la solución correcta para estado compartido.

## Scripts vanilla para micro-interacciones

Para interacciones muy simples (toggle de menú, accordion básico), no hace falta React:

```astro
---
// Nav.astro
---
<nav>
  <button id="menu-toggle" aria-expanded="false">Menú</button>
  <ul id="menu" class="hidden">...</ul>
</nav>

<script>
  const toggle = document.getElementById('menu-toggle')!
  const menu = document.getElementById('menu')!
  
  toggle.addEventListener('click', () => {
    const expanded = toggle.getAttribute('aria-expanded') === 'true'
    toggle.setAttribute('aria-expanded', String(!expanded))
    menu.classList.toggle('hidden')
  })
</script>
```

`<script>` en `.astro` se bundlea automáticamente — no hay duplicación si el componente se usa varias veces.
