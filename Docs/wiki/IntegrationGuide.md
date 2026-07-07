---
tags: [integration, react, vue, svelte, vanilla, examples]
created: 2026-01-03
updated: 2026-01-03
sources: [src/react/use-physics-particles.ts, src/adapters/dom.ts]
complexity: N/A
performance_notes: Zero re-renders em todos os frameworks
---

# Integration Guide

Guia de integração do Hadron com diferentes frameworks.

## 🎯 Visão Geral

Hadron foi projetado para ser **framework-agnostic**. O engine core funciona em qualquer ambiente JavaScript, e adapters específicos fornecem integração otimizada para cada framework.

### Camadas

```
┌─────────────────────────────────────┐
│   Seu App (React/Vue/Svelte/Vanilla) │
└─────────────────┬───────────────────┘
                  │
        ┌─────────┴─────────┐
        │                   │
┌───────▼────────┐  ┌──────▼───────┐
│ React Hooks    │  │ Vanilla Adapter │
│ usePhysics...  │  │ applyParticle...│
└───────┬────────┘  └──────┬───────┘
        │                   │
        └─────────┬─────────┘
                  │
        ┌─────────▼─────────┐
        │   Engine Core      │
        │ tickParticles()    │
        └────────────────────┘
```

---

## ⚛️ React

### Instalação

```bash
npm install physaac
# ou
yarn add physaac
```

### Uso Básico

```tsx
import { useRef } from 'react';
import { usePhysicsParticles } from 'physaac';

function ParticleBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const particleRefs = useRef<(HTMLDivElement | null)[]>([]);
  
  usePhysicsParticles(50, containerRef, particleRefs, {
    collisionRadius: 14,
    repulsionStrength: 1.4,
    maxSpeed: 1.2,
    damping: 0.994,
    minSpeed: 0.08,
    noiseStrength: 0.012,
  });
  
  return (
    <div 
      ref={containerRef} 
      className="relative w-full h-full overflow-hidden"
    >
      {Array.from({ length: 50 }).map((_, i) => (
        <div
          key={i}
          ref={el => particleRefs.current[i] = el}
          className="absolute w-3 h-3 bg-blue-500 rounded-full"
          style={{ left: 0, top: 0 }}
        />
      ))}
    </div>
  );
}
```

### Com Giroscópio (Device Motion)

```tsx
import { useRef } from 'react';
import { usePhysicsParticles, useDeviceMotion } from 'physaac';

function InteractiveParticles() {
  const containerRef = useRef<HTMLDivElement>(null);
  const particleRefs = useRef<(HTMLDivElement | null)[]>([]);
  const motionRef = useDeviceMotion();
  
  usePhysicsParticles(50, containerRef, particleRefs, {
    collisionRadius: 14,
    repulsionStrength: 1.4,
    externalForceRef: motionRef, // ← força do giroscópio
  });
  
  return (/* ... mesmo JSX ... */);
}
```

### Com Obstáculos

```tsx
import { useRef, useMemo } from 'react';
import { usePhysicsParticles } from 'physaac';
import type { ObstacleRect } from 'physaac';

function ParticlesWithObstacles() {
  const containerRef = useRef<HTMLDivElement>(null);
  const particleRefs = useRef<(HTMLDivElement | null)[]>([]);
  
  const obstacles = useMemo<ObstacleRect[]>(() => [
    { x: 100, y: 100, w: 50, h: 200 },
    { x: 300, y: 50, w: 100, h: 50 },
  ], []);
  
  const obstaclesRef = useRef(obstacles);
  
  usePhysicsParticles(50, containerRef, particleRefs, {
    collisionRadius: 14,
    repulsionStrength: 1.4,
    obstaclesRef: obstaclesRef, // ← obstáculos
  });
  
  return (/* ... */);
}
```

### TypeScript Types

```typescript
import type { PhysicsOptions, ExternalForce, ObstacleRect } from 'physaac';

const options: PhysicsOptions = {
  collisionRadius: 14,
  repulsionStrength: 1.4,
};

const force: ExternalForce = { fx: 0.001, fy: 0.002 };

const obstacle: ObstacleRect = { x: 0, y: 0, w: 100, h: 100 };
```

---

## 🟢 Vue 3

### Setup Básico

```vue
<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { initializeParticles, tickParticles } from 'physaac';

const containerRef = ref<HTMLElement | null>(null);
const particleRefs = ref<(HTMLElement | null)[]>([]);
const particles = ref<any[]>([]);
let rafId: number | null = null;
let frame = 0;

onMounted(() => {
  if (!containerRef.value) return;
  
  const rect = containerRef.value.getBoundingClientRect();
  particles.value = initializeParticles(50, rect.width, rect.height, 14);
  
  function tick() {
    tickParticles(
      particles.value,
      frame++,
      rect.width,
      rect.height,
      null,
      null
    );
    
    // Aplica posições
    particles.value.forEach((p, i) => {
      if (particleRefs.value[i]) {
        particleRefs.value[i]!.style.left = `${p.x}px`;
        particleRefs.value[i]!.style.top = `${p.y}px`;
      }
    });
    
    rafId = requestAnimationFrame(tick);
  }
  
  tick();
});

onUnmounted(() => {
  if (rafId !== null) cancelAnimationFrame(rafId);
});
</script>

<template>
  <div ref="containerRef" class="relative w-full h-full overflow-hidden">
    <div
      v-for="i in 50"
      :key="i"
      :ref="el => particleRefs[i - 1] = el as HTMLElement"
      class="absolute w-3 h-3 bg-blue-500 rounded-full"
    />
  </div>
</template>
```

---

## 🔷 Svelte

### Setup Básico

```svelte
<script lang="ts">
import { onMount, onDestroy } from 'svelte';
import { initializeParticles, tickParticles } from 'physaac';

let container: HTMLDivElement;
let particles: any[] = [];
let particleEls: HTMLElement[] = [];
let rafId: number | null = null;
let frame = 0;

onMount(() => {
  const rect = container.getBoundingClientRect();
  particles = initializeParticles(50, rect.width, rect.height, 14);
  
  function tick() {
    tickParticles(particles, frame++, rect.width, rect.height, null, null);
    
    particles.forEach((p, i) => {
      if (particleEls[i]) {
        particleEls[i].style.left = `${p.x}px`;
        particleEls[i].style.top = `${p.y}px`;
      }
    });
    
    rafId = requestAnimationFrame(tick);
  }
  
  tick();
});

onDestroy(() => {
  if (rafId !== null) cancelAnimationFrame(rafId);
});
</script>

<div bind:this={container} class="relative w-full h-full overflow-hidden">
  {#each Array(50) as _, i}
    <div
      bind:this={particleEls[i]}
      class="absolute w-3 h-3 bg-blue-500 rounded-full"
    />
  {/each}
</div>
```

---

## 🌐 Vanilla JavaScript

### Setup Completo

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Hadron Vanilla</title>
  <style>
    .container {
      position: relative;
      width: 100vw;
      height: 100vh;
      overflow: hidden;
      background: #000;
    }
    .particle {
      position: absolute;
      width: 12px;
      height: 12px;
      background: #4fc3f7;
      border-radius: 50%;
      transform: translate(-50%, -50%);
    }
  </style>
</head>
<body>
  <div id="container" class="container"></div>
  
  <script type="module">
    import { 
      initializeParticles, 
      tickParticles,
      applyParticlePositions 
    } from 'physaac';
    
    const container = document.getElementById('container');
    const count = 50;
    const collisionRadius = 14;
    
    // Cria elementos DOM
    const elements = Array.from({ length: count }, (_, i) => {
      const el = document.createElement('div');
      el.className = 'particle';
      container.appendChild(el);
      return el;
    });
    
    // Inicializa partículas
    let particles = initializeParticles(
      count,
      container.offsetWidth,
      container.offsetHeight,
      collisionRadius
    );
    
    // Loop de animação
    let frame = 0;
    function tick() {
      tickParticles(
        particles,
        frame++,
        container.offsetWidth,
        container.offsetHeight,
        null, // externalForce
        null, // obstacles
        {
          collisionRadius,
          repulsionStrength: 1.4,
          maxSpeed: 1.2,
          damping: 0.994,
          minSpeed: 0.08,
          noiseStrength: 0.012,
        }
      );
      
      applyParticlePositions(particles, elements);
      requestAnimationFrame(tick);
    }
    
    tick();
    
    // Re-inicializa ao redimensionar
    window.addEventListener('resize', () => {
      particles = initializeParticles(
        count,
        container.offsetWidth,
        container.offsetHeight,
        collisionRadius
      );
      frame = 0;
    });
  </script>
</body>
</html>
```

### Com Device Motion (Mobile)

```javascript
import { 
  initializeParticles, 
  tickParticles,
  startDeviceMotion,
  deviceMotionForce
} from 'physaac';

// Inicia listener de movimento
startDeviceMotion();

// No loop tickParticles, passa deviceMotionForce
function tick() {
  tickParticles(
    particles,
    frame++,
    width,
    height,
    deviceMotionForce, // ← força do giroscópio
    null
  );
  // ...
}
```

---

## 📱 React Native (Adaptação Necessária)

Hadron foi feito para DOM web. Para React Native, você precisaria:

1. Substituir `requestAnimationFrame` por `requestAnimationFrame` do React Native
2. Usar `Animated` API ou `react-native-reanimated` em vez de style.left/top
3. Adaptar colisão para coordenadas nativas

**Exemplo conceitual:**

```typescript
// NÃO FUNCIONA DIRETAMENTE - requer adaptação
import { useFrameCallback } from 'react-native-reanimated';

function usePhysicsParticlesNative(count: number) {
  const particles = useRef(initializeParticles(count, width, height, 14));
  
  useFrameCallback((frameInfo) => {
    tickParticles(particles.current, frameInfo.frameNumber, ...);
    // Aplica com Animated API
  });
}
```

---

## 🧪 Testing

### Vitest / Jest

```typescript
import { describe, it, expect } from 'vitest';
import { halton, smoothNoise, initializeParticles } from 'physaac';

describe('halton', () => {
  it('deve gerar valores entre 0 e 1', () => {
    for (let i = 1; i < 100; i++) {
      const value = halton(i, 2);
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThanOrEqual(1);
    }
  });
});

describe('smoothNoise', () => {
  it('deve ser determinístico', () => {
    const a = smoothNoise(42, 100);
    const b = smoothNoise(42, 100);
    expect(a).toBe(b);
  });
});
```

---

## 📄 Links Relacionados

- [[Architecture]] — visão geral do sistema
- [[Components]] — descrição dos componentes
- [[ConfigurationRecipes]] — configurações prontas
- [use-physics-particles.ts](../../src/react/use-physics-particles.ts) — hook React
- [dom.ts](../../src/adapters/dom.ts) — adapter vanilla
