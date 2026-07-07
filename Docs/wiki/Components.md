---
tags: [components, modules, engine, react, adapters]
created: 2026-01-03
updated: 2026-01-03
sources: [src/engine/index.ts, src/react/index.ts, src/adapters/index.ts, src/device-motion/index.ts]
complexity: N/A
performance_notes: Cada componente é tree-shakeable
---

# Components

Descrição detalhada dos componentes do Hadron.

## 🏗️ Engine Core

### Localização
`src/engine/`

### Responsabilidade
Motor de física newtoniana para partículas. Contém toda a lógica de simulação física independente de framework.

### Módulos

| Arquivo | Export | Descrição |
|---------|--------|-----------|
| `particle.ts` | `Particle` (type) | Interface da partícula: x, y, vx, vy, noiseSeed |
| `options.ts` | `PhysicsOptions`, `ExternalForce`, `ObstacleRect` | Tipos de configuração |
| `halton.ts` | `halton()` | Sequência de Halton para distribuição quasi-aleatória |
| `noise.ts` | `smoothNoise()` | Ruído suave determinístico baseado em seno/cosseno |
| `init-particles.ts` | `initializeParticles()` | Inicializa partículas com distribuição Halton |
| `tick-particles.ts` | `tickParticles()` | Loop principal de atualização de física |
| `index.ts` | Todos acima | Ponto de entrada do engine |

### API Pública

```typescript
// Tipos
type Particle = { x, y, vx, vy, noiseSeed }
type PhysicsOptions = { collisionRadius, repulsionStrength, maxSpeed, damping, minSpeed, noiseStrength, externalForceRef, obstaclesRef }
type ExternalForce = { fx, fy }
type ObstacleRect = { x, y, w, h }

// Funções
function halton(index: number, base: number): number
function smoothNoise(seed: number, t: number): number
function initializeParticles(count, width, height, collisionRadius): Particle[]
function tickParticles(particles, frame, width, height, externalForce, obstacles, options): void
```

### Links
- [particle.ts](../../src/engine/particle.ts)
- [options.ts](../../src/engine/options.ts)
- [halton.ts](../../src/engine/halton.ts)
- [noise.ts](../../src/engine/noise.ts)
- [init-particles.ts](../../src/engine/init-particles.ts)
- [tick-particles.ts](../../src/engine/tick-particles.ts)

---

## ⚛️ React Hooks

### Localização
`src/react/`

### Responsabilidade
Hooks React que orquestram o engine core com gerenciamento de lifecycle e refs.

### Módulos

| Arquivo | Export | Descrição |
|---------|--------|-----------|
| `use-physics-particles.ts` | `usePhysicsParticles()` | Hook principal para gerenciar partículas |
| `use-device-motion.ts` | `useDeviceMotion()` | Hook para acessar força do giroscópio |
| `index.ts` | Todos acima | Ponto de entrada do React |

### usePhysicsParticles

**Assinatura:**
```typescript
function usePhysicsParticles(
  count: number,
  containerRef: React.RefObject<HTMLElement | null>,
  particleRefs: React.RefObject<(HTMLElement | null)[]>,
  options?: PhysicsOptions
): void
```

**Características:**
- Zero re-renders (atualiza DOM diretamente via refs)
- Auto cleanup de requestAnimationFrame
- Re-inicialização automática ao mudar dimensões

**Exemplo:**
```tsx
const containerRef = useRef<HTMLDivElement>(null);
const particleRefs = useRef<(HTMLDivElement | null)[]>([]);

usePhysicsParticles(50, containerRef, particleRefs, {
  collisionRadius: 14,
  repulsionStrength: 1.4,
});
```

### useDeviceMotion

**Assinatura:**
```typescript
function useDeviceMotion(): React.RefObject<ExternalForce>
```

**Características:**
- Singleton de DeviceMotion
- Auto inicia listener no mount
- Retorna ref estável com { fx, fy }

**Exemplo:**
```tsx
const motionRef = useDeviceMotion();
usePhysicsParticles(50, containerRef, particleRefs, {
  externalForceRef: motionRef,
});
```

### Links
- [use-physics-particles.ts](../../src/react/use-physics-particles.ts)
- [use-device-motion.ts](../../src/react/use-device-motion.ts)

---

## 📱 Device Motion

### Localização
`src/device-motion/`

### Responsabilidade
Singleton independente para captura de movimento do dispositivo (giroscópio).

### Módulos

| Arquivo | Export | Descrição |
|---------|--------|-----------|
| `singleton.ts` | `deviceMotionForce`, `startDeviceMotion()`, `requestDeviceMotionPermission()` | Singleton e controle do listener |
| `index.ts` | Todos acima | Ponto de entrada |

### Pipeline de Processamento

```
rawX/Y → deadzone (0.4 m/s²) → sinal → EMA (α=0.18) → decay (0.80) → clamp → fx/fy
```

### Características

| Aspecto | Detalhes |
|---------|----------|
| SEM calibração de bias | Evita deriva direcional |
| Deadzone | 0.4 m/s² filtra tremor de mão |
| EMA Alpha | 0.18 para suavização |
| Decay | 0.80 volta a zero rápido quando parado |
| Sensitivity | 0.010 px/frame por m/s² |
| Max Force | 0.022 px/frame |

### Links
- [singleton.ts](../../src/device-motion/singleton.ts)

---

## 🔌 Adapters (Vanilla JS)

### Localização
`src/adapters/`

### Responsabilidade
Helpers para uso do Hadron sem frameworks (Vanilla JavaScript).

### Módulos

| Arquivo | Export | Descrição |
|---------|--------|-----------|
| `dom.ts` | `applyParticlePositions()` | Aplica posições das partículas no DOM |
| `index.ts` | Todos acima | Ponto de entrada |

### applyParticlePositions

**Assinatura:**
```typescript
function applyParticlePositions(
  particles: Particle[],
  elements: Array<HTMLElement | null>
): void
```

**Uso:**
```typescript
import { initializeParticles, tickParticles, applyParticlePositions } from 'physaac';

const particles = initializeParticles(50, width, height, 14);
const elements = document.querySelectorAll('.particle');

function tick() {
  tickParticles(particles, frame++, width, height, null, null);
  applyParticlePositions(particles, elements);
  requestAnimationFrame(tick);
}
```

### Links
- [dom.ts](../../src/adapters/dom.ts)

---

## 📦 Pontos de Entrada (Entry Points)

### Root Index
`src/index.ts`

Exporta todos os módulos públicos:

```typescript
// Engine
export { halton, smoothNoise, tickParticles, initializeParticles }
export type { Particle, PhysicsOptions, ExternalForce, ObstacleRect }

// React (se disponível)
export { usePhysicsParticles, useDeviceMotion }

// Adapters
export { applyParticlePositions }

// Device Motion
export { deviceMotionForce, startDeviceMotion, requestDeviceMotionPermission }
```

### Tree Shaking

Cada módulo é independente. Bundlers modernos (Vite, Webpack, Rollup) removem código não utilizado automaticamente.

**Exemplo:** Se usar apenas engine core sem React:
```typescript
import { initializeParticles, tickParticles } from 'physaac';
// React hooks não serão incluídos no bundle
```

---

## 🔄 Dependências Entre Componentes

```
┌─────────────────┐
│   React App     │
└────────┬────────┘
         │ usa
         ▼
┌─────────────────┐
│ usePhysics-     │───────┐
│ Particles       │       │
└────────┬────────┘       │
         │ chama          │
         ▼                │
┌─────────────────┐       │
│ tickParticles   │◄──────┤
│ (engine core)   │       │
└────────┬────────┘       │
         │ usa            │
         ├────────────────┤
         │                │
         ▼                ▼
┌─────────────────┐  ┌─────────────────┐
│ deviceMotion    │  │ obstaclesRef    │
│ singleton       │  │ (usuário)       │
└─────────────────┘  └─────────────────┘
```

---

## 📄 Links Relacionados

- [[Architecture]] — visão geral do sistema
- [[PhysicsConcepts]] — conceitos físicos usados pelos componentes
- [[ConfigurationRecipes]] — como configurar os componentes
- [[IntegrationGuide]] — exemplos de integração por framework
