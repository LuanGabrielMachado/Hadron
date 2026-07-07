# Hadron

Motor de física newtoniana para partículas em interfaces web — com thermal noise, giroscópio e zero re-renders.

## Visão Geral

Hadron é um motor de física de partículas altamente performático projetado para animações em interfaces web. Ele oferece:

- **Movimento eterno** via thermal noise (força aleatória suave por frame)
- **Repulsão entre partículas** para evitar sobreposição
- **Colisão com obstáculos** retangulares
- **Suporte a giroscópio** para dispositivos móveis
- **Zero re-renders** no React (atualização direta do DOM)

## Instalação

```bash
npm install physaac
```

## Uso

### Vanilla JS (sem framework)

```javascript
import { tickParticles, halton } from 'physaac';

// Inicializar partículas
const particles = Array.from({ length: 50 }, (_, i) => ({
  x: 100 + halton(i + 1, 2) * 200,
  y: 100 + halton(i + 1, 3) * 200,
  vx: Math.cos(i / 50 * Math.PI * 2) * 0.5,
  vy: Math.sin(i / 50 * Math.PI * 2) * 0.5,
  noiseSeed: halton(i + 1, 11) * 100,
}));

// Loop de animação
let frame = 0;
function animate() {
  tickParticles(
    particles,
    frame++,
    containerWidth,
    containerHeight,
    null, // externalForce (opcional)
    null, // obstacles (opcional)
    { collisionRadius: 14 }
  );
  
  // Aplicar posições no DOM
  particles.forEach((p, i) => {
    elements[i].style.left = `${p.x}px`;
    elements[i].style.top = `${p.y}px`;
  });
  
  requestAnimationFrame(animate);
}
animate();
```

### React (com hook)

```tsx
import { useRef } from 'react';
import { usePhysicsParticles } from 'physaac/react';

function ParticleContainer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const particleRefs = useRef<(HTMLDivElement | null)[]>([]);
  
  usePhysicsParticles(
    50, // número de partículas
    containerRef,
    particleRefs,
    {
      collisionRadius: 14,
      repulsionStrength: 1.4,
      maxSpeed: 1.2,
      damping: 0.994,
      minSpeed: 0.08,
      noiseStrength: 0.012,
    }
  );
  
  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%', height: '400px' }}>
      {Array.from({ length: 50 }).map((_, i) => (
        <div
          key={i}
          ref={(el) => (particleRefs.current[i] = el)}
          style={{
            position: 'absolute',
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: '#3b82f6',
          }}
        />
      ))}
    </div>
  );
}
```

### Com Giroscópio (dispositivos móveis)

```tsx
import { useRef } from 'react';
import { usePhysicsParticles } from 'physaac/react';
import { deviceMotionForce, startDeviceMotion } from 'physaac/device-motion';

function ParticleContainerWithGyro() {
  const containerRef = useRef<HTMLDivElement>(null);
  const particleRefs = useRef<(HTMLDivElement | null)[]>([]);
  const motionRef = useRef(deviceMotionForce);
  
  // Iniciar listener do giroscópio
  useEffect(() => {
    startDeviceMotion();
  }, []);
  
  usePhysicsParticles(50, containerRef, particleRefs, {
    externalForceRef: motionRef,
  });
  
  // ... render
}
```

## API

### Opções de Física (PhysicsOptions)

| Propriedade | Tipo | Padrão | Descrição |
|-------------|------|--------|-----------|
| `collisionRadius` | `number` | `14` | Raio de colisão entre partículas (px) |
| `repulsionStrength` | `number` | `1.4` | Força de repulsão entre partículas |
| `maxSpeed` | `number` | `1.2` | Velocidade máxima (px/frame) |
| `damping` | `number` | `0.994` | Amortecimento por frame (0–1) |
| `minSpeed` | `number` | `0.08` | Velocidade mínima — abaixo disso injeta thermal noise |
| `noiseStrength` | `number` | `0.012` | Intensidade do thermal noise |
| `externalForceRef` | `{ current: { fx, fy } }` | `null` | Ref com força externa (ex: giroscópio) |
| `obstaclesRef` | `{ current: ObstacleRect[] }` | `null` | Zonas retangulares de exclusão |

### Funções Principais

#### `tickParticles()`

Atualiza as partículas em um frame.

```typescript
function tickParticles(
  particles: Particle[],
  t: number,
  containerWidth: number,
  containerHeight: number,
  externalForce: ExternalForce | null,
  obstacles: ObstacleRect[] | null,
  options?: PhysicsOptions
): void
```

#### `halton()`

Gera números quasi-aleatórios usando a sequência de Halton.

```typescript
function halton(index: number, base: number): number
```

#### `smoothNoise()`

Ruído suave determinístico baseado em seno.

```typescript
function smoothNoise(seed: number, t: number): number
```

## Módulos

- **`physaac`** — Núcleo vanilla (zero dependências)
- **`physaac/react`** — Hook React `usePhysicsParticles`
- **`physaac/device-motion`** — Singleton do giroscópio
- **`physaac/adapters`** — Helpers para manipulação do DOM

## License

MIT
