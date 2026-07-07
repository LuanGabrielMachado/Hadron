# Hadron - Motor de Física de Partículas

## Visão Geral

**Hadron** é um motor de física de partículas leve, escrito em TypeScript, projetado para criar animações fluidas e interativas de partículas que se movem organicamente dentro de um container. O motor foi construído com foco em performance, simplicidade e compatibilidade com múltiplos frameworks (React, Vue, Svelte, Vanilla JS).

### Características Principais

- **Zero dependências** no núcleo (vanilla TypeScript)
- **Física baseada em forças**: repulsão entre partículas, damping, thermal noise
- **Colisão com bordas**: partículas ricocheteiam nas bordas do container
- **Colisão com obstáculos**: suporte a zonas retangulares de exclusão
- **Integração com giroscópio**: força externa baseada em DeviceMotion (acelerômetro)
- **Distribuição quasi-aleatória**: usa sequência de Halton para posicionamento inicial uniforme
- **Ruído suave determinístico**: movimento orgânico e natural
- **Hooks React opcionais**: integração fácil com aplicações React
- **Adaptador DOM**: utilitário para manipulação direta do DOM

### Arquitetura do Projeto

```
src/
├── engine/                 # Núcleo do motor de física
│   ├── particle.ts         # Definição da interface Particle
│   ├── options.ts          # Opções de configuração (PhysicsOptions)
│   ├── tick-particles.ts   # Loop principal de atualização da física
│   ├── init-particles.ts   # Inicialização de partículas com Halton
│   ├── halton.ts           # Sequência de Halton (distribuição quasi-aleatória)
│   ├── noise.ts            # Ruído suave determinístico
│   └── index.ts            # Exportações públicas do engine
│
├── adapters/               # Adaptadores para diferentes ambientes
│   ├── dom.ts              # Helper para aplicar posições no DOM
│   └── index.ts            # Exportações dos adaptadores
│
├── device-motion/          # Módulo de captura de movimento do dispositivo
│   ├── singleton.ts        # Singleton do listener DeviceMotion
│   └── index.ts            # Exportações do device-motion
│
├── react/                  # Hooks e componentes React
│   ├── use-physics-particles.ts  # Hook principal para gerenciar partículas
│   ├── use-device-motion.ts      # Hook para DeviceMotion
│   └── index.ts            # Exportações do módulo React
│
└── index.ts                # Entry point principal
```

### Casos de Uso Típicos

1. **Animações de fundo**: Partículas flutuando organicamente em páginas web
2. **Efeitos interativos**: Partículas que respondem ao movimento do dispositivo
3. **Visualizações de dados**: Representação visual de entidades que se repelem
4. **Jogos simples**: Sistemas de partículas com colisão básica
5. **UI/UX**: Elementos decorativos que adicionam vida à interface

### Instalação

```bash
npm install physaac
```

### Importação Básica

```typescript
// Importar núcleo vanilla
import { tickParticles, initializeParticles } from 'physaac';

// Importar hooks React
import { usePhysicsParticles, useDeviceMotion } from 'physaac/react';

// Importar utilitários DOM
import { applyParticlePositions } from 'physaac/adapters';

// Importar controle de giroscópio
import { startDeviceMotion, deviceMotionForce } from 'physaac/device-motion';
```

---

[Próximo: Conceitos Fundamentais](./02-conceitos-fundamentais.md)
