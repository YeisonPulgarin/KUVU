---
name: sds-3d
description: Escenas 3D y WebGL premium — React Three Fiber, Drei, shaders GLSL, partículas, modelos GLTF, postprocessing y scroll integration con GSAP. Para heros 3D, fondos interactivos y portfolios de alto nivel en Next.js y Astro.
version: 1.0.0
---

# sds-3d — 3D y WebGL Premium

> Para heros 3D, fondos WebGL, portfolios de alto nivel, y cualquier superficie donde el movimiento y la profundidad son el producto.
> Complemento de `sds-nextjs`, `sds-astro` y `sds-design-taste`.

---

## Cuándo usar 3D (y cuándo no)

**Usar cuando:**
- El brief pide explícitamente 3D, WebGL, o "algo generativo / inmersivo"
- Es un portfolio de estudio creativo o diseñador de alto nivel
- El producto físico justifica un modelo 3D (hardware, arquitectura, joyería, producto DTC premium)
- La diferenciación visual ES el argumento de venta y el presupuesto lo soporta
- `MOTION_INTENSITY >= 8` en `sds-design-taste`

**No usar cuando:**
- El brief es B2B SaaS mainstream, dashboard, o herramienta de productividad
- No hay assets 3D de calidad y el presupuesto no alcanza para crearlos
- La escena no agrega información ni narrativa — solo "se ve cool"
- El target LCP < 2.5s es no negociable y la escena no puede optimizarse lo suficiente

**Regla de oro:** si quitar el 3D no cambia lo que el usuario entiende o siente, no va.

---

## Stack

```bash
npm install three @react-three/fiber @react-three/drei @react-three/postprocessing gsap
npm install -D @types/three
```

✅ **SIEMPRE:**
- `three` — librería base
- `@react-three/fiber` (R3F) — renderer React para Three.js
- `@react-three/drei` — helpers (Environment, Float, Text3D, OrbitControls, useGLTF, useCursor, etc.)
- `@react-three/postprocessing` — efectos de postprocesamiento
- `gsap` + `ScrollTrigger` — integración con scroll

❌ **NUNCA:**
- Three.js vanilla sin R3F en proyectos React/Next.js/Astro — R3F maneja el render loop y la integración con React
- R3F en Server Components — siempre `'use client'`
- `useEffect` + `requestAnimationFrame` para el animation loop — usar `useFrame`
- `useState` para valores animados leídos en `useFrame` — usar `useRef`
- Three.js en Astro sin `client:only="react"` — ver Sección 9

---

## 1. Canvas y estructura base

El `<Canvas>` es siempre un Client Component. Nunca en un Server Component.

```tsx
// components/scene/HeroScene.tsx
'use client'
import { Canvas } from '@react-three/fiber'
import { Environment, Float } from '@react-three/drei'
import { Suspense } from 'react'

export function HeroScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 45 }}
      dpr={[1, 2]}                   // DPR adaptativo — nunca fijo en 2 (destruye FPS en 4K)
      gl={{ antialias: true }}
      style={{ background: 'transparent' }}
    >
      <Suspense fallback={null}>
        <SceneContent />
      </Suspense>
    </Canvas>
  )
}

function SceneContent() {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 5, 5]} intensity={2} castShadow />
      <Environment preset="city" />
      <Float speed={1.5} rotationIntensity={0.4} floatIntensity={0.6}>
        {/* mesh aquí */}
      </Float>
    </>
  )
}
```

**Reglas de Canvas:**
- `dpr={[1, 2]}` — siempre adaptativo, nunca `dpr={window.devicePixelRatio}` fijo
- Siempre definir `camera` — sin esto R3F usa defaults que pueden no encajar con el layout
- `gl.antialias: true` para geometrías con edges visibles; desactivar si el postprocessing hace AA propio
- `style={{ background: 'transparent' }}` para compositing con CSS del layout

---

## 2. Iluminación

```tsx
<>
  {/* Base ambiental — sin esto las sombras son puro negro */}
  <ambientLight intensity={0.3} />

  {/* Key light — luz principal, fuente de sombras */}
  <directionalLight
    position={[5, 8, 5]}
    intensity={2}
    castShadow
    shadow-mapSize={[2048, 2048]}
  />

  {/* Fill light — suaviza sombras del lado opuesto */}
  <directionalLight position={[-3, 2, -3]} intensity={0.5} color="#4488ff" />

  {/* Environment map — reflections y GI aproximado */}
  <Environment preset="studio" />
</>
```

**Presets de Environment:**
| Preset | Cuándo |
|--------|--------|
| `"studio"` | Luz suave y pareja, ideal para producto |
| `"city"` | Reflexiones urbanas, tech y moderno |
| `"sunset"` | Cálido, premium consumer |
| `"dawn"` | Frío suave, editorial |
| `files="/hdr/custom.hdr"` | Control total de iluminación |

---

## 3. Materiales

### PBR estándar

```tsx
<meshStandardMaterial color="#ffffff" metalness={0.8} roughness={0.2} />
```

### Glass / liquid / crystal

```tsx
<meshPhysicalMaterial
  color="#ffffff"
  metalness={0}
  roughness={0}
  transmission={0.95}  // transparencia física
  thickness={0.5}      // grosor para refracción
  ior={1.5}            // índice de refracción (vidrio = 1.5, agua = 1.33)
  reflectivity={0.5}
  iridescence={0.3}
/>
```

### ShaderMaterial — efectos custom con GLSL

```tsx
import { shaderMaterial } from '@react-three/drei'
import { extend, useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'

const WaveMaterial = shaderMaterial(
  { uTime: 0, uColor: new THREE.Color('#ff6030') },
  // vertex shader
  `
    uniform float uTime;
    varying vec2 vUv;
    void main() {
      vUv = uv;
      vec3 pos = position;
      pos.z += sin(pos.x * 3.0 + uTime) * 0.1;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `,
  // fragment shader
  `
    uniform vec3 uColor;
    uniform float uTime;
    varying vec2 vUv;
    void main() {
      float strength = sin(vUv.x * 10.0 + uTime) * 0.5 + 0.5;
      gl_FragColor = vec4(uColor * strength, 1.0);
    }
  `
)

extend({ WaveMaterial })

export function WavePlane() {
  const matRef = useRef<any>()
  useFrame(({ clock }) => {
    if (matRef.current) matRef.current.uTime = clock.elapsedTime
  })
  return (
    <mesh>
      <planeGeometry args={[4, 4, 64, 64]} />
      {/* @ts-ignore */}
      <waveMaterial ref={matRef} />
    </mesh>
  )
}
```

---

## 4. useFrame — el animation loop

`useFrame` reemplaza `requestAnimationFrame`. Nunca usar `useEffect` + `rAF` en R3F.

```tsx
'use client'
import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import type { Mesh } from 'three'

export function RotatingMesh() {
  const meshRef = useRef<Mesh>(null)

  useFrame((state, delta) => {
    if (!meshRef.current) return
    // delta = tiempo desde el último frame (s) — para frame-rate independence
    meshRef.current.rotation.y += delta * 0.5
    // state.clock.elapsedTime — tiempo total
    // state.pointer — posición del mouse normalizada (-1 a 1)
    // state.camera — cámara activa
  })

  return (
    <mesh ref={meshRef}>
      <icosahedronGeometry args={[1, 2]} />
      <meshStandardMaterial color="#ff6030" wireframe />
    </mesh>
  )
}
```

**Reglas de useFrame:**
- Usar `delta` para velocidades — nunca valores absolutos
- `state.pointer` para seguimiento del mouse sin event listeners
- Minimizar operaciones costosas — el loop corre a 60fps
- Para lógica condicional pesada: usar `useRef` como flag para saltear frames

---

## 5. Modelos GLTF / GLB

```tsx
'use client'
import { useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import type { Group } from 'three'

// Pre-cargar fuera del componente — evita refetch al remount
useGLTF.preload('/models/product.glb')

export function ProductModel() {
  const { scene } = useGLTF('/models/product.glb')
  const groupRef = useRef<Group>(null)

  useFrame((state) => {
    if (!groupRef.current) return
    // Seguimiento suave del mouse con lerp
    groupRef.current.rotation.y += (state.pointer.x * 0.5 - groupRef.current.rotation.y) * 0.05
    groupRef.current.rotation.x += (-state.pointer.y * 0.2 - groupRef.current.rotation.x) * 0.05
  })

  return (
    <group ref={groupRef}>
      <primitive object={scene} />
    </group>
  )
}
```

**Compresión Draco:**
```tsx
// Usar gltf-pipeline para comprimir antes de subir:
// npx gltf-pipeline -i model.glb -o model-draco.glb --draco.compressionLevel 10

// En el loader:
useGLTF('/models/product-draco.glb')
// Drei configura Draco automáticamente apuntando a /draco/
// Copiar archivos: node_modules/three/examples/jsm/libs/draco/ → public/draco/
```

**Reglas de modelos:**
- Comprimir siempre con Draco o Meshopt — modelos > 1MB destruyen LCP
- `useGLTF.preload()` fuera del componente
- Envolver en `<Suspense fallback={...}>` — `useGLTF` es async
- Dispose en unmount para modelos no reutilizados

---

## 6. Partículas

### Points — campo de partículas

```tsx
'use client'
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'

export function ParticleField({ count = 2000 }: { count?: number }) {
  const pointsRef = useRef<THREE.Points>(null)

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      pos[i * 3]     = (Math.random() - 0.5) * 10
      pos[i * 3 + 1] = (Math.random() - 0.5) * 10
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10
    }
    return pos
  }, [count])

  useFrame(({ clock }) => {
    if (!pointsRef.current) return
    pointsRef.current.rotation.y = clock.elapsedTime * 0.04
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.02} color="#ffffff" transparent opacity={0.6} sizeAttenuation />
    </points>
  )
}
```

### InstancedMesh — miles de objetos al precio de uno

```tsx
'use client'
import { useFrame } from '@react-three/fiber'
import { useRef, useMemo, useEffect } from 'react'
import * as THREE from 'three'

export function InstancedSpheres({ count = 500 }: { count?: number }) {
  const meshRef = useRef<THREE.InstancedMesh>(null)

  const { positions, scales } = useMemo(() => ({
    positions: Array.from({ length: count }, () => [
      (Math.random() - 0.5) * 20,
      (Math.random() - 0.5) * 20,
      (Math.random() - 0.5) * 20,
    ] as [number, number, number]),
    scales: Array.from({ length: count }, () => Math.random() * 0.3 + 0.05),
  }), [count])

  useEffect(() => {
    if (!meshRef.current) return
    const dummy = new THREE.Object3D()
    positions.forEach(([x, y, z], i) => {
      dummy.position.set(x, y, z)
      dummy.scale.setScalar(scales[i])
      dummy.updateMatrix()
      meshRef.current!.setMatrixAt(i, dummy.matrix)
    })
    meshRef.current.instanceMatrix.needsUpdate = true
  }, [positions, scales])

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 16, 16]} />
      <meshStandardMaterial color="#ffffff" metalness={0.5} roughness={0.3} />
    </instancedMesh>
  )
}
```

---

## 7. Postprocessing

```tsx
'use client'
import { EffectComposer, Bloom, ChromaticAberration, Noise, Vignette } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import * as THREE from 'three'

export function PostEffects() {
  return (
    <EffectComposer>
      <Bloom
        intensity={1.5}
        luminanceThreshold={0.5}  // solo pixeles más brillantes que este valor brillan
        luminanceSmoothing={0.9}
        mipmapBlur
      />
      <ChromaticAberration
        offset={new THREE.Vector2(0.002, 0.002)}
        blendFunction={BlendFunction.NORMAL}
      />
      <Noise opacity={0.03} />
      <Vignette eskil={false} offset={0.1} darkness={1.1} />
    </EffectComposer>
  )
}

// Usar dentro del Canvas, después de la escena:
// <Canvas>
//   <SceneContent />
//   <PostEffects />
// </Canvas>
```

**Reglas de postprocessing:**
- `<EffectComposer>` dentro del Canvas, nunca fuera
- Bloom requiere materiales con `emissive` + `emissiveIntensity` para brillar — sin eso no tiene efecto
- Cada efecto tiene costo de GPU — testear FPS en mobile antes de agregar más de 2
- Para reduced motion: montar `<PostEffects>` condicionalmente

---

## 8. Interactividad — hover y raycasting

```tsx
'use client'
import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { useCursor } from '@react-three/drei'
import * as THREE from 'three'

export function InteractiveMesh() {
  const meshRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)

  useCursor(hovered)  // cambia el cursor CSS a pointer automáticamente

  useFrame((_, delta) => {
    if (!meshRef.current) return
    // Interpolación suave de escala con lerp
    const target = hovered ? 1.15 : 1
    meshRef.current.scale.x += (target - meshRef.current.scale.x) * delta * 6
    meshRef.current.scale.y = meshRef.current.scale.z = meshRef.current.scale.x
  })

  return (
    <mesh
      ref={meshRef}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <sphereGeometry args={[1, 64, 64]} />
      <meshPhysicalMaterial
        color={hovered ? '#ff6030' : '#ffffff'}
        metalness={0.8}
        roughness={0.1}
        transmission={hovered ? 0 : 0.5}
      />
    </mesh>
  )
}
```

---

## 9. Integración con scroll (GSAP + R3F)

```tsx
'use client'
import { Canvas, useFrame } from '@react-three/fiber'
import { useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import * as THREE from 'three'

gsap.registerPlugin(ScrollTrigger)

// Wrapper: sticky canvas + espacio de scroll
export function ScrollScene() {
  return (
    <div style={{ height: '300vh' }}>
      <div style={{ position: 'sticky', top: 0, height: '100vh' }}>
        <Canvas camera={{ position: [0, 0, 5] }} dpr={[1, 2]}>
          <ambientLight intensity={0.5} />
          <ScrollObject />
        </Canvas>
      </div>
    </div>
  )
}

function ScrollObject() {
  const meshRef = useRef<THREE.Mesh>(null)
  const progressRef = useRef(0)  // useRef, NO useState — evita re-renders en cada frame

  useEffect(() => {
    const trigger = ScrollTrigger.create({
      trigger: document.body,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => { progressRef.current = self.progress },
    })
    return () => trigger.kill()
  }, [])

  useFrame((_, delta) => {
    if (!meshRef.current) return
    const target = progressRef.current * Math.PI * 4
    meshRef.current.rotation.y += (target - meshRef.current.rotation.y) * delta * 3
    meshRef.current.position.y += (-progressRef.current * 3 - meshRef.current.position.y) * delta * 3
  })

  return (
    <mesh ref={meshRef}>
      <icosahedronGeometry args={[1, 2]} />
      <meshStandardMaterial color="#ff6030" metalness={0.6} roughness={0.2} />
    </mesh>
  )
}
```

**Regla crítica:** `useRef` (no `useState`) para el progreso de scroll dentro de R3F. `useState` dispara re-renders del árbol React en cada evento de scroll — el sitio se congela.

---

## 10. SSR Safety

**En Next.js (App Router):**
```tsx
// app/page.tsx — Server Component
import dynamic from 'next/dynamic'

const HeroScene = dynamic(
  () => import('@/components/scene/HeroScene').then(m => m.HeroScene),
  {
    ssr: false,
    loading: () => <div className="w-full h-screen bg-zinc-950" />,  // mismo tamaño — evita CLS
  }
)

export default function Page() {
  return (
    <main>
      <HeroScene />
    </main>
  )
}
```

**En Astro:**
```astro
---
import HeroScene from '../components/react/HeroScene.tsx'
---

<!-- client:only="react" — sin SSR, hidrata solo en el cliente -->
<HeroScene client:only="react" />
```

**Reglas de SSR:**
- R3F usa WebGL que no existe en Node.js — sin `ssr: false` el build de Next.js falla
- Siempre proveer `loading` del mismo tamaño que el Canvas — evita CLS
- En Astro: `client:only="react"`, no `client:load` (que intenta render en servidor)

---

## 11. Performance

- **DPR adaptativo:** `dpr={[1, 2]}` — nunca fijo en 2
- **Dispose en unmount** (para geometrías y materiales custom creados fuera de JSX):
  ```tsx
  useEffect(() => {
    return () => { geometry.dispose(); material.dispose() }
  }, [])
  ```
- **Suspense obligatorio** alrededor de `useGLTF`, texturas, y cualquier asset async
- **Shadow maps:** `shadow-mapSize={[1024, 1024]}` para la mayoría; 2048 solo en close-ups de producto
- **Frame budget:** target 60fps desktop, ≥30fps en mobile mid-range. Testear con Chrome DevTools CPU throttle 6x
- **Geometrías simples para partículas:** `sphereGeometry args={[1, 8, 8]}` en instanced mesh de fondo — el usuario no nota la diferencia a distancia
- **Reduced motion:**
  ```tsx
  const prefersReduced = typeof window !== 'undefined'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches

  useFrame((_, delta) => {
    const speed = prefersReduced ? 0.05 : 1
    meshRef.current.rotation.y += delta * speed
  })
  ```
- **Postprocessing pesado (DepthOfField, SSAO):** solo en heros donde el objeto es el foco. En escenas de fondo: máximo Bloom + Noise

---

## 12. Decision Gates

### ¿R3F o Three.js vanilla?

| Caso | Usar |
|------|------|
| Proyecto Next.js / Astro con React | R3F |
| Script standalone sin framework | Three.js vanilla |
| Integración con estado React o contexto | R3F — el bridge es nativo |
| Visualización de datos con D3 | Three.js vanilla + D3 |

### ¿Qué material?

| Necesita | Material |
|----------|----------|
| PBR con reflexiones, roughness, metalness | `meshStandardMaterial` |
| Glass / crystal / liquid | `meshPhysicalMaterial` con `transmission` |
| Efecto visual procedural (noise, waves, gradientes) | `shaderMaterial` + GLSL |
| Wireframe como estética | `meshStandardMaterial` + prop `wireframe` |
| Toon / cel shading | `meshToonMaterial` |

### ¿Postprocessing o efecto en material?

| Efecto | Approach |
|--------|----------|
| Glow en objetos emissivos | Bloom en EffectComposer + `emissiveIntensity` en material |
| Apariencia analog / película | Noise + Vignette |
| Aberración de lente / glitch | ChromaticAberration |
| Profundidad de campo | DepthOfField (costoso — solo en heros de producto) |
| Brillo en el shader mismo | `emissive` + `emissiveIntensity` en el material |

### ¿Cómo conectar con scroll?

| Caso | Approach |
|------|----------|
| Objeto rota / se mueve según scroll | GSAP ScrollTrigger → `useRef` → `useFrame` |
| Canvas sticky con scroll | `position: sticky` en wrapper + altura de scroll en el padre |
| Shader que evoluciona con scroll | `uProgress` uniform actualizado desde ScrollTrigger |
| Cámara que recorre una escena en scroll | GSAP ScrollTrigger animando `camera.position` via `useRef` |

---

## Output Contract

**Entrego al crear una escena 3D:**
- Canvas con `dpr={[1, 2]}`, `<Suspense>` y cámara definida
- `dynamic(() => import(...), { ssr: false })` en Next.js O `client:only="react"` en Astro
- `useFrame` con `delta` para frame-rate independence
- `useRef` (no `useState`) para valores de scroll/mouse dentro del loop
- Dispose de geometrías y materiales custom al unmount
- Reduced motion: animaciones reducidas o canvas estático
- Loading placeholder del mismo tamaño — evita CLS

**Garantizo:**
- Sin `useEffect` + `requestAnimationFrame` — siempre `useFrame`
- Sin `window.addEventListener('scroll')` dentro de R3F — siempre ScrollTrigger + `useRef`
- Sin `useState` para valores animados en el loop
- SSR safety: el build no falla por WebGL en Node.js
- FPS target: 60fps desktop, ≥30fps en mobile mid-range
