---
tags: [architecture, overview, engine]
created: 2026-01-03
updated: 2026-01-03
sources: [src/engine/index.ts, src/engine/tick-particles.ts, src/engine/init-particles.ts, src/react/use-physics-particles.ts]
complexity: O(n²) para repulsão entre partículas
performance_notes: 60 FPS target, <100 partículas para DOM
---

# Architecture

Visão geral da arquitetura do sistema Hadron.

## 🎯 Propósito

Hadron é um motor de física newtoniana leve para animações de partículas em interfaces web. O sistema foi projetado para:

- **Zero re-renders**: Atualiza posições diretamente no DOM via refs
- **Performance previsível**: Frame budget de 16ms (60 FPS)
- **Multi-framework**: Funciona com React, Vue, Svelte e Vanilla JS
- **Física orgânica**: Movimento natural com noise determinístico e thermal noise

## 🏗️ Estrutura de Módulos

```
src/
├── engine/              # Motor de física principal
│   ├── particle.ts      # Interface Particle
│   ├── options.ts       # PhysicsOptions e tipos relacionados
│   ├── halton.ts        # Sequência de Halton para distribuição quasi-aleatória
│   ├── noise.ts         # smoothNoise() para movimento orgânico
│   ├── init-particles.ts# Inicialização de partículas
│   ├── tick-particles.ts# Loop de atualização de física
│   └── index.ts         # exports do engine
├── react/               # Hooks para React
│   ├── use-physics-particles.ts # Hook principal
│   ├── use-device-motion.ts     # Hook para giroscópio
│   └── index.ts         # exports do React
├── device-motion/       # Singleton do giroscópio
│   ├── singleton.ts     # deviceMotionForce e listeners
│   └── index.ts         # exports
└── adapters/            # Utils para vanilla JS
    ├── dom.ts           # applyParticlePositions()
    └── index.ts         # exports
```

## 🔄 Fluxo de Dados

### 1. Inicialização

```typescript
// React hook ou vanilla JS chama initializeParticles()
particles = initializeParticles(count, width, height, collisionRadius);
// Retorna array de Particle { x, y, vx, vy, noiseSeed }
```

### 2. Loop de Animação

```
requestAnimationFrame(tick)
  ↓
tickParticles(particles, frame, width, height, externalForce, obstacles, options)
  ↓
1. Repulsão entre partículas (O(n²))
2. Aplica damping adaptativo
3. Aplica força externa (giroscópio)
4. Aplica thermal noise se velocidade < minSpeed
5. Clamp velocidade máxima
6. Detecta colisão com obstáculos
7. Bounce nas bordas do container
  ↓
Aplica posições no DOM (element.style.left/top)
  ↓
requestAnimationFrame(tick) - repete
```

## 📦 Componentes Principais

| Componente | Responsabilidade | Arquivo |
|------------|------------------|---------|
| **Engine Core** | Física newtoniana, integração de Euler | `tick-particles.ts` |
| **Initializer** | Distribuição Halton, seeds de noise | `init-particles.ts` |
| **React Hook** | Orquestra RAF, zero re-renders | `use-physics-particles.ts` |
| **Device Motion** | Singleton de giroscópio, deadzone filtering | `singleton.ts` |
| **DOM Adapter** | Helper vanilla para aplicar posições | `dom.ts` |

## 🔗 Dependências e Interfaces

### Entradas (Inputs)

- `count`: número de partículas
- `container dimensions`: largura e altura do container
- `PhysicsOptions`: configuração da física (ver [[ConfigurationRecipes]])
- `externalForceRef`: força externa opcional (giroscópio)
- `obstaclesRef`: obstáculos retangulares opcionais

### Saídas (Outputs)

- Partículas atualizadas no DOM (via refs ou elementos diretos)
- Zero re-renders do framework (React/Vue/Svelte)

## ⚡ Considerações de Performance

| Aspecto | Estratégia | Complexidade |
|---------|------------|--------------|
| Repulsão | Força par-a-par, evita Math.sqrt desnecessário | O(n²) |
| Noise | Seno/cosseno determinístico, sem alocações | O(1) por partícula |
| DOM Updates | style.left/top direto, sem re-render | O(n) |
| Memory | RAF cleanup, refs estáveis | Zero leaks |

## 🧩 Pontos de Extensão

1. **Novos Adapters**: Criar adapters para Vue, Svelte seguindo padrão React
2. **Spatial Hashing**: Otimizar repulsão O(n²) → O(n) para >100 partículas
3. **Obstáculos Circulares**: Estender `ObstacleRect` para círculos
4. **Forças Personalizadas**: Adicionar campos magnéticos, vento, etc.

## 📄 Links Relacionados

- [[PhysicsConcepts]] — detalhes matemáticos (Halton, noise, Euler)
- [[ConfigurationRecipes]] — receitas de configuração
- [[Components]] — descrição detalhada de cada componente
- [[IntegrationGuide]] — como integrar em diferentes frameworks
- [tick-particles.ts](../../src/engine/tick-particles.ts) — implementação do loop
- [use-physics-particles.ts](../../src/react/use-physics-particles.ts) — hook React
