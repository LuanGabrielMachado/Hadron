# Hooks React - Integração com React

Este documento detalha os hooks React fornecidos pelo Hadron, explicando como integrá-los em aplicações React de forma eficiente e idiomática.

---

## Visão Geral

O Hadron fornece dois hooks React principais:

1. **`usePhysicsParticles`**: Hook principal que gerencia o ciclo de vida completo das partículas
2. **`useDeviceMotion`**: Hook para capturar movimento do dispositivo (giroscópio)

### Filosofia de Design

Os hooks foram projetados com estes princípios:

- **Zero re-renders**: As posições são aplicadas diretamente no DOM, não via estado React
- **Performance**: Usa `requestAnimationFrame` sincronizado com o refresh rate do browser
- **Simplicidade**: API mínima, configuração via objeto de opções
- **Flexibilidade**: Funciona com React Server Components (RSC) usando `'use client'`

---

## usePhysicsParticles

### Propósito

Gerencia o ciclo de vida completo de um sistema de partículas dentro de um container DOM, incluindo:
- Inicialização das partículas
- Loop de animação com `requestAnimationFrame`
- Aplicação direta das posições no DOM
- Cleanup automático no unmount

### Assinatura

```typescript
function usePhysicsParticles(
  count: number,
  containerRef: React.RefObject<HTMLElement | null>,
  particleRefs: React.RefObject<(HTMLElement | null)[]>,
  options?: PhysicsOptions
): void
```

### Parâmetros

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `count` | `number` | Número de partículas para criar |
| `containerRef` | `RefObject<HTMLElement>` | Ref do container DOM onde as partículas vivem |
| `particleRefs` | `RefObject<(HTMLElement \| null)[]>` | Array de refs para os elementos DOM das partículas |
| `options` | `PhysicsOptions` | Opções de configuração da física (opcional, usa padrões se omitido) |

### Retorno

`void` - O hook não retorna nada; ele gerencia efeitos colaterais internamente.

### Como Funciona Internamente

```typescript
export function usePhysicsParticles(
  count: number,
  containerRef: React.RefObject<HTMLElement | null>,
  particleRefs: React.RefObject<(HTMLElement | null)[]>,
  options: PhysicsOptions = {},
) {
  // 1. Extrai opções com defaults
  const {
    collisionRadius = 14,
    repulsionStrength = 1.4,
    maxSpeed = 1.2,
    damping = 0.994,
    minSpeed = 0.08,
    noiseStrength = 0.012,
    externalForceRef,
    obstaclesRef,
  } = options;

  // 2. Cria refs internas
  const particles = useRef<Particle[]>([]);
  const rafRef = useRef<number | null>(null);
  const frameRef = useRef(0);

  // 3. Função de inicialização (memoizada)
  const init = useCallback((w: number, h: number) => {
    particles.current = initializeParticles(count, w, h, collisionRadius);
  }, [count, collisionRadius]);

  // 4. Efeito principal
  useEffect(() => {
    // Validações iniciais
    const container = containerRef.current;
    if (!container || count === 0) return;
    
    // Obtém dimensões do container
    const rect = container.getBoundingClientRect();
    const w = rect.width || container.offsetWidth;
    const h = rect.height || container.offsetHeight;
    if (w === 0 || h === 0) return;

    // Inicializa partículas
    init(w, h);
    frameRef.current = 0;

    // 5. Loop de animação
    const tick = () => {
      const cw = container.offsetWidth;
      const ch = container.offsetHeight;

      // Chama o motor de física
      tickParticles(
        particles.current,
        frameRef.current++,
        cw, ch,
        externalForceRef?.current ?? null,
        obstaclesRef?.current ?? null,
        options,
      );

      // Aplica posições no DOM (ZERO re-renders)
      for (let i = 0; i < particles.current.length; i++) {
        const el = particleRefs.current?.[i];
        if (el) {
          el.style.left = `${particles.current[i].x}px`;
          el.style.top  = `${particles.current[i].y}px`;
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    // Inicia loop
    rafRef.current = requestAnimationFrame(tick);

    // 6. Cleanup
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [count, options, init, containerRef, particleRefs, externalForceRef, obstaclesRef]);
}
```

### Fluxo de Execução

```
Componente monta
       │
       ▼
useEffect é executado
       │
       ├──► Valida container
       │
       ├──► Obtém dimensões
       │
       ├──► Inicializa partículas (Halton)
       │
       └──► Inicia loop RAF
              │
              ├─► tickParticles() calcula física
              │
              ├─► Aplica style.left/top no DOM
              │
              └─► requestAnimationFrame(tick)
                     │
                     └──────┘ (loop infinito)

Componente desmonta
       │
       ▼
Cleanup function
       │
       ▼
cancelAnimationFrame()
```

---

### Exemplo Básico

```typescript
'use client';

import { useRef } from 'react';
import { usePhysicsParticles } from 'physaac/react';

export function ParticleBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const particleRefs = useRef<(HTMLDivElement | null)[]>([]);
  
  // Configura refs das partículas
  const setParticleRef = (index: number) => (el: HTMLDivElement | null) => {
    particleRefs.current[index] = el;
  };
  
  // Inicializa física
  usePhysicsParticles(
    50,            // 50 partículas
    containerRef,  // container
    particleRefs,  // refs dos elementos
    {              // opções (opcionais)
      collisionRadius: 14,
      repulsionStrength: 1.4,
      maxSpeed: 1.2,
    }
  );
  
  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%',
        height: '100vh',
        overflow: 'hidden',
        background: '#0a0a0a',
      }}
    >
      {Array.from({ length: 50 }).map((_, i) => (
        <div
          key={i}
          ref={setParticleRef(i)}
          style={{
            position: 'absolute',
            width: 28,
            height: 28,
            borderRadius: '50%',
            background: 'rgba(100, 150, 255, 0.6)',
            willChange: 'transform',  // Dica de otimização para o browser
          }}
        />
      ))}
    </div>
  );
}
```

---

### Exemplo com Giroscópio

```typescript
'use client';

import { useRef } from 'react';
import { usePhysicsParticles, useDeviceMotion } from 'physaac/react';

export function InteractiveParticles() {
  const containerRef = useRef<HTMLDivElement>(null);
  const particleRefs = useRef<(HTMLDivElement | null)[]>([]);
  const motionRef = useDeviceMotion();  // Hook do giroscópio
  
  const setParticleRef = (index: number) => (el: HTMLDivElement | null) => {
    particleRefs.current[index] = el;
  };
  
  usePhysicsParticles(
    80,
    containerRef,
    particleRefs,
    {
      externalForceRef: motionRef,  // Conecta giroscópio
      collisionRadius: 12,
      repulsionStrength: 1.8,
      maxSpeed: 2.0,
      damping: 0.992,
    }
  );
  
  return (
    <div ref={containerRef} style={{ /* ... */ }}>
      {Array.from({ length: 80 }).map((_, i) => (
        <div key={i} ref={setParticleRef(i)} style={{ /* ... */ }} />
      ))}
    </div>
  );
}
```

---

### Exemplo com Obstáculos Dinâmicos

```typescript
'use client';

import { useRef, useState, useEffect } from 'react';
import { usePhysicsParticles } from 'physaac/react';
import type { ObstacleRect } from 'physaac';

export function ParticlesWithObstacles() {
  const containerRef = useRef<HTMLDivElement>(null);
  const particleRefs = useRef<(HTMLDivElement | null)[]>([]);
  const obstaclesRef = useRef<ObstacleRect[]>([]);
  
  const [obstacles, setObstacles] = useState<ObstacleRect[]>([]);
  
  // Sincroniza obstáculos state com ref
  useEffect(() => {
    obstaclesRef.current = obstacles;
  }, [obstacles]);
  
  // Adiciona obstáculo no clique
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const newObstacle: ObstacleRect = {
      x: e.clientX - rect.left - 25,
      y: e.clientY - rect.top - 25,
      w: 50,
      h: 50,
    };
    
    setObstacles(prev => [...prev, newObstacle]);
  };
  
  usePhysicsParticles(
    50,
    containerRef,
    particleRefs,
    {
      obstaclesRef,
      collisionRadius: 14,
    }
  );
  
  const setParticleRef = (index: number) => (el: HTMLDivElement | null) => {
    particleRefs.current[index] = el;
  };
  
  return (
    <div
      ref={containerRef}
      onClick={handleClick}
      style={{ position: 'relative', width: '100%', height: '100vh' }}
    >
      {/* Partículas */}
      {Array.from({ length: 50 }).map((_, i) => (
        <div key={i} ref={setParticleRef(i)} className="particle" />
      ))}
      
      {/* Obstáculos renderizados */}
      {obstacles.map((obs, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: obs.x,
            top: obs.y,
            width: obs.w,
            height: obs.h,
            background: 'rgba(255, 100, 100, 0.5)',
            border: '2px solid rgba(255, 100, 100, 0.8)',
          }}
        />
      ))}
      
      <p style={{ position: 'absolute', bottom: 20, left: 20 }}>
        Clique para adicionar obstáculos
      </p>
    </div>
  );
}
```

---

### Exemplo com Canvas (Renderização Customizada)

```typescript
'use client';

import { useRef, useEffect } from 'react';
import { initializeParticles, tickParticles } from 'physaac';

export function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<ReturnType<typeof initializeParticles>>([]);
  const frameRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const width = canvas.width;
    const height = canvas.height;
    
    // Inicializa partículas
    particlesRef.current = initializeParticles(100, width, height, 10);
    
    // Loop de animação
    const animate = () => {
      // Limpa canvas
      ctx.clearRect(0, 0, width, height);
      
      // Atualiza física
      tickParticles(
        particlesRef.current,
        frameRef.current++,
        width,
        height,
        null,
        null,
        {}
      );
      
      // Renderiza partículas
      ctx.fillStyle = 'rgba(100, 150, 255, 0.8)';
      particlesRef.current.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 10, 0, Math.PI * 2);
        ctx.fill();
      });
      
      rafRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);
  
  return (
    <canvas
      ref={canvasRef}
      width={800}
      height={600}
      style={{ display: 'block' }}
    />
  );
}
```

---

## useDeviceMotion

### Propósito

Hook React que encapsula o singleton de Device Motion, fornecendo uma ref atualizada com as forças atuais do giroscópio.

### Assinatura

```typescript
function useDeviceMotion(): React.RefObject<ExternalForce>
```

### Retorno

`RefObject<ExternalForce>` - Ref estável com `{ fx, fy }` atualizados continuamente.

### Implementação

```typescript
export function useDeviceMotion() {
  const motionRef = useRef(deviceMotionForce);
  
  useEffect(() => {
    startDeviceMotion();
  }, []);
  
  return motionRef;
}
```

### Uso Básico

```typescript
import { useDeviceMotion } from 'physaac/react';

function MeuComponente() {
  const motionRef = useDeviceMotion();
  
  // Acessa valores atuais
  const fx = motionRef.current?.fx ?? 0;
  const fy = motionRef.current?.fy ?? 0;
  
  return (
    <div>
      <p>Força X: {fx.toFixed(4)}</p>
      <p>Força Y: {fy.toFixed(4)}</p>
    </div>
  );
}
```

### Uso com usePhysicsParticles

```typescript
import { usePhysicsParticles, useDeviceMotion } from 'physaac/react';

function ParticlesInterativos() {
  const containerRef = useRef<HTMLDivElement>(null);
  const particleRefs = useRef<(HTMLDivElement | null)[]>([]);
  const motionRef = useDeviceMotion();
  
  usePhysicsParticles(
    50,
    containerRef,
    particleRefs,
    {
      externalForceRef: motionRef,  // Passa a ref diretamente
    }
  );
  
  // ... renderização
}
```

---

## Padrões Avançados

### 1. Partículas com Estado Customizado

Adicione dados customizados às partículas:

```typescript
interface CustomParticle extends Particle {
  color: string;
  size: number;
  opacity: number;
}

const particles = useRef<CustomParticle[]>([]);

// Inicializa com dados customizados
useEffect(() => {
  const baseParticles = initializeParticles(50, width, height, 14);
  particles.current = baseParticles.map((p, i) => ({
    ...p,
    color: `hsl(${i * 7}, 70%, 60%)`,
    size: 10 + (i % 5) * 4,
    opacity: 0.5 + (i % 3) * 0.2,
  }));
}, [width, height]);
```

### 2. Redimensionamento Responsivo

Reinicializa partículas quando o container muda de tamanho:

```typescript
const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

useEffect(() => {
  const updateDimensions = () => {
    if (containerRef.current) {
      setDimensions({
        width: containerRef.current.offsetWidth,
        height: containerRef.current.offsetHeight,
      });
    }
  };
  
  updateDimensions();
  window.addEventListener('resize', updateDimensions);
  return () => window.removeEventListener('resize', updateDimensions);
}, []);

// Reinicializa quando dimensões mudam
useEffect(() => {
  if (dimensions.width > 0 && dimensions.height > 0) {
    particles.current = initializeParticles(
      count,
      dimensions.width,
      dimensions.height,
      collisionRadius
    );
  }
}, [dimensions, count, collisionRadius]);
```

### 3. Pausar/Retomar Animação

```typescript
const [isPaused, setIsPaused] = useState(false);
const rafRef = useRef<number | null>(null);

usePhysicsParticlesWithPause(
  count,
  containerRef,
  particleRefs,
  options,
  isPaused
) {
  // ... lógica similar ao hook original
  
  useEffect(() => {
    if (isPaused) {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    } else {
      rafRef.current = requestAnimationFrame(tick);
    }
    
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [isPaused]);
}
```

### 4. Múltiplos Sistemas de Partículas

```typescript
function MultiParticleSystem() {
  const container1Ref = useRef<HTMLDivElement>(null);
  const particles1Ref = useRef<(HTMLDivElement | null)[]>([]);
  
  const container2Ref = useRef<HTMLDivElement>(null);
  const particles2Ref = useRef<(HTMLDivElement | null)[]>([]);
  
  // Sistema 1: Calmo
  usePhysicsParticles(30, container1Ref, particles1Ref, {
    maxSpeed: 0.5,
    damping: 0.998,
  });
  
  // Sistema 2: Energético
  usePhysicsParticles(50, container2Ref, particles2Ref, {
    maxSpeed: 3.0,
    repulsionStrength: 2.5,
  });
  
  return (
    <>
      <div ref={container1Ref}>{/* ... */}</div>
      <div ref={container2Ref}>{/* ... */}</div>
    </>
  );
}
```

---

## Otimizações de Performance

### 1. Use `will-change` CSS

```typescript
<div
  ref={ref}
  style={{
    willChange: 'transform',  // Avisa o browser sobre mudanças
    // ou
    willChange: 'left, top',
  }}
/>
```

### 2. Evite Re-renders Desnecessários

O hook já aplica posições diretamente no DOM. Não use estado para posições:

```typescript
// ❌ RUIM - Causa re-render a cada frame
const [positions, setPositions] = useState([]);

// ✅ BOM - Aplica direto no DOM
elementRef.current.style.left = `${x}px`;
```

### 3. Memoize Callbacks de Ref

```typescript
// ❌ Cria nova função a cada render
{particles.map((_, i) => (
  <div ref={(el) => (particleRefs.current[i] = el)} />
))}

// ✅ Memoizado
const setParticleRef = useCallback((index: number) => (el: HTMLDivElement | null) => {
  particleRefs.current[index] = el;
}, []);

{particles.map((_, i) => (
  <div key={i} ref={setParticleRef(i)} />
))}
```

### 4. Limite o Número de Partículas

| Dispositivo | Partículas Recomendadas |
|-------------|------------------------|
| Mobile básico | 20-40 |
| Mobile flagship | 40-80 |
| Desktop médio | 50-100 |
| Desktop high-end | 100-200 |

---

## Troubleshooting

### Problema: Partículas não aparecem

**Causas possíveis**:
1. Container sem dimensões definidas
2. Refs não configuradas corretamente
3. Count = 0

**Solução**:
```typescript
// Verifica dimensões do container
useEffect(() => {
  console.log('Container:', containerRef.current);
  console.log('Dimensões:', containerRef.current?.offsetWidth, containerRef.current?.offsetHeight);
}, []);

// Verifica refs das partículas
useEffect(() => {
  console.log('Particle refs:', particleRefs.current);
}, [particleRefs.current]);
```

### Problema: Memory leak

**Sintoma**: Animação continua após componente desmontar.

**Verificação**:
```typescript
useEffect(() => {
  return () => {
    console.log('Cleanup executado');
  };
}, []);
```

**Solução**: Certifique-se de que o hook está limpando o RAF no cleanup (já faz isso internamente).

### Problema: Performance ruim

**Sintoma**: FPS baixo, travamentos.

**Soluções**:
1. Reduza número de partículas
2. Use `will-change` CSS
3. Evite outros cálculos pesados no mesmo componente
4. Considere usar Canvas em vez de DOM

---

[Próximo: Adaptadores e Utilitários](./07-adapters-utils.md)
