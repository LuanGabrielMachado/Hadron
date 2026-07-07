# Engine Core - Funções Principais

Este documento detalha as funções centrais do motor de física, explicando como cada uma funciona internamente, seus parâmetros, retorno, e como usá-las em diferentes contextos.

---

## 1. initializeParticles

### Propósito

Inicializa um array de partículas com posições e velocidades distribuídas uniformemente usando a sequência de Halton. Esta função garante que todas as partículas comecem em posições bem distribuídas sem aglomerações.

### Assinatura

```typescript
function initializeParticles(
  count: number,
  width: number,
  height: number,
  collisionRadius: number
): Particle[]
```

### Parâmetros

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `count` | `number` | Número de partículas para criar |
| `width` | `number` | Largura do container em pixels |
| `height` | `number` | Altura do container em pixels |
| `collisionRadius` | `number` | Raio de colisão das partículas |

### Retorno

Array de objetos `Particle` com propriedades inicializadas:
- `x`, `y`: Posições distribuídas uniformemente
- `vx`, `vy`: Velocidades iniciais com direções variadas
- `noiseSeed`: Semente única para ruído determinístico

### Implementação Detalhada

```typescript
export function initializeParticles(
  count: number,
  width: number,
  height: number,
  collisionRadius: number
): Particle[] {
  const margin = collisionRadius + 4;
  
  return Array.from({ length: count }, (_, i) => {
    // Posição X usando Halton base 2
    const x = margin + halton(i + 1, 2) * (width - margin * 2);
    
    // Posição Y usando Halton base 3
    const y = margin + halton(i + 1, 3) * (height - margin * 2);
    
    // Ângulo inicial: distribuição circular + variação Halton
    const angle = (i / count) * Math.PI * 2 + halton(i + 1, 5) * 1.2;
    
    // Velocidade inicial: base + variação Halton
    const speed = 0.3 + halton(i + 1, 7) * 0.5;
    
    // Componentes de velocidade
    const vx = Math.cos(angle) * speed;
    const vy = Math.sin(angle) * speed;
    
    // Seed única para ruído (Halton base 11)
    const noiseSeed = halton(i + 1, 11) * 100;
    
    return { x, y, vx, vy, noiseSeed };
  });
}
```

### Análise da Inicialização

#### 1. Margem de Segurança

```typescript
const margin = collisionRadius + 4;
```

Adiciona uma margem além do raio de colisão para garantir que nenhuma partícula nasça colidindo com as bordas. O `+4` é um buffer extra.

#### 2. Posicionamento Uniforme

```typescript
const x = margin + halton(i + 1, 2) * (width - margin * 2);
const y = margin + halton(i + 1, 3) * (height - margin * 2);
```

- Usa bases diferentes (2 para X, 3 para Y) para evitar correlação
- Escala para caber dentro da área útil (`width - margin * 2`)
- Desloca para começar após a margem

**Exemplo**: Para `count = 10`, `width = 300`, `collisionRadius = 14`:
- `margin = 18`
- Área útil: `300 - 36 = 264`
- Partícula 1: `x = 18 + halton(1, 2) × 264 = 18 + 0.5 × 264 = 150`
- Partícula 2: `x = 18 + halton(2, 2) × 264 = 18 + 0.25 × 264 = 84`

#### 3. Distribuição Angular

```typescript
const angle = (i / count) * Math.PI * 2 + halton(i + 1, 5) * 1.2;
```

- `(i / count) × 2π`: Distribui partículas uniformemente em círculo
- `+ halton(i + 1, 5) × 1.2`: Adiciona variação quasi-aleatória (±0.6 radianos)

Isso evita que todas as partículas se movam na mesma direção inicialmente.

#### 4. Variação de Velocidade

```typescript
const speed = 0.3 + halton(i + 1, 7) * 0.5;
```

- Velocidade base: 0.3 px/frame
- Variação: 0 a 0.5 px/frame (baseado em Halton)
- Resultado: Velocidades entre 0.3 e 0.8 px/frame

### Exemplos de Uso

#### Uso Básico

```typescript
import { initializeParticles } from 'physaac';

const particles = initializeParticles(
  50,    // 50 partículas
  800,   // container 800px largura
  600,   // container 600px altura
  14     // raio de colisão 14px
);

console.log(particles[0]);
// { x: 400, y: 300, vx: 0.5, vy: 0.2, noiseSeed: 42.5 }
```

#### Uso com React

```typescript
import { useRef, useEffect } from 'react';
import { initializeParticles, tickParticles } from 'physaac';

function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Inicializa partículas
    particlesRef.current = initializeParticles(
      100,
      canvas.width,
      canvas.height,
      10
    );
    
    // Loop de animação
    let frame = 0;
    const animate = () => {
      tickParticles(particlesRef.current, frame++, canvas.width, canvas.height, null, null);
      
      // Renderizar...
      requestAnimationFrame(animate);
    };
    
    animate();
  }, []);
  
  return <canvas ref={canvasRef} width={800} height={600} />;
}
```

#### Reinicialização Dinâmica

```typescript
// Reinicia partículas quando o container muda de tamanho
useEffect(() => {
  if (containerWidth > 0 && containerHeight > 0) {
    particles.current = initializeParticles(
      particleCount,
      containerWidth,
      containerHeight,
      collisionRadius
    );
  }
}, [containerWidth, containerHeight, particleCount, collisionRadius]);
```

### Dicas e Melhores Práticas

1. **Chame apenas quando necessário**: A inicialização é relativamente cara. Evite chamar a cada frame.

2. **Mantenha referência**: Guarde o array retornado em uma ref ou estado persistente.

3. **Consistência**: Use o mesmo `collisionRadius` da configuração do motor.

4. **Redimensionamento**: Quando o container mudar de tamanho, reinicialize as partículas.

---

## 2. tickParticles

### Propósito

Função principal do motor de física. Atualiza todas as partículas em um frame, aplicando:
- Repulsão entre partículas
- Forças externas (giroscópio, gravidade customizada)
- Damping (amortecimento)
- Thermal noise
- Colisões com bordas
- Colisões com obstáculos

### Assinatura

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

### Parâmetros

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `particles` | `Particle[]` | Array mutável de partículas (modificado in-place) |
| `t` | `number` | Número do frame atual (usado para noise) |
| `containerWidth` | `number` | Largura do container em pixels |
| `containerHeight` | `number` | Altura do container em pixels |
| `externalForce` | `ExternalForce \| null` | Força externa `{ fx, fy }` ou null |
| `obstacles` | `ObstacleRect[] \| null` | Array de obstáculos ou null |
| `options` | `PhysicsOptions` | Opções de configuração (parcial, valores padrão usados se omitido) |

### Retorno

`void` - A função modifica o array `particles` in-place.

### Fluxo de Execução

```
tickParticles
│
├─ 1. Extrai opções (valores padrão ou customizados)
│
├─ 2. FASE DE REPULSÃO
│  └─ Loop duplo O(n²) aplica força repulsiva entre partículas próximas
│
├─ 3. FASE DE ATUALIZAÇÃO INDIVIDUAL (para cada partícula)
│  ├─ 3.1 Aplica damping adaptativo
│  ├─ 3.2 Aplica impulso do giroscópio (se ativo)
│  ├─ 3.3 Aplica thermal noise (se velocidade baixa)
│  ├─ 3.4 Clamp da velocidade máxima
│  ├─ 3.5 Atualiza posição (x += vx, y += vy)
│  ├─ 3.6 Verifica colisão com obstáculos
│  └─ 3.7 Verifica colisão com bordas do container
│
└─ 4. Retorna (partículas modificadas in-place)
```

### Implementação Detalhada - Fase por Fase

#### Fase 1: Extração de Opções

```typescript
const collisionRadius   = options.collisionRadius   ?? DEFAULT_COLLISION_RADIUS;
const repulsionStrength = options.repulsionStrength ?? DEFAULT_REPULSION_STRENGTH;
const maxSpeed          = options.maxSpeed          ?? DEFAULT_MAX_SPEED;
const damping           = options.damping           ?? DEFAULT_DAMPING;
const minSpeed          = options.minSpeed          ?? DEFAULT_MIN_SPEED;
const noiseStrength     = options.noiseStrength     ?? DEFAULT_NOISE_STRENGTH;

const margin = collisionRadius + 2;
const extFx = externalForce?.fx ?? 0;
const extFy = externalForce?.fy ?? 0;
const shakeEnergy = Math.sqrt(extFx * extFx + extFy * extFy);
const minDistSq = (collisionRadius * 2) ** 2;
```

#### Fase 2: Repulsão Entre Partículas

```typescript
for (let i = 0; i < particles.length; i++) {
  for (let j = i + 1; j < particles.length; j++) {
    const dx = particles[j].x - particles[i].x;
    const dy = particles[j].y - particles[i].y;
    const distSq = dx * dx + dy * dy;
    
    if (distSq < minDistSq && distSq > 0) {
      const dist = Math.sqrt(distSq);
      const force = (repulsionStrength * (collisionRadius * 2 - dist)) / dist;
      const fx = dx * force;
      const fy = dy * force;
      
      // Aplica forças opostas (3ª Lei de Newton)
      particles[i].vx -= fx;
      particles[i].vy -= fy;
      particles[j].vx += fx;
      particles[j].vy += fy;
    }
  }
}
```

**Otimização**: Compara ao quadrado (`distSq`) para evitar `Math.sqrt` desnecessário.

#### Fase 3: Atualização Individual

##### 3.1 Damping Adaptativo

```typescript
const adaptiveDamping = shakeEnergy > 0.002 ? damping * 0.97 : damping;
p.vx *= adaptiveDamping;
p.vy *= adaptiveDamping;
```

Durante shake, reduz damping para 97% do normal, permitindo movimento mais livre.

##### 3.2 Impulso do Giroscópio

```typescript
if (shakeEnergy > 0.001) {
  const angle = smoothNoise(p.noiseSeed * 3.7, t * 0.3) * Math.PI * 2;
  const impulse = shakeEnergy * 3.5;
  p.vx += Math.cos(angle) * impulse;
  p.vy += Math.sin(angle) * impulse;
}
```

- Direção do impulso: baseada em noise suave (varia organicamente)
- Magnitude: proporcional à energia do shake

##### 3.3 Thermal Noise

```typescript
const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
if (speed < minSpeed) {
  p.vx += smoothNoise(p.noiseSeed, t) * noiseStrength;
  p.vy += smoothNoise(p.noiseSeed + 50, t) * noiseStrength;
}
```

Aplica pequena força aleatória quando a partícula está quase parada.

##### 3.4 Clamp de Velocidade

```typescript
const speedAfter = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
if (speedAfter > maxSpeed) {
  p.vx = (p.vx / speedAfter) * maxSpeed;
  p.vy = (p.vy / speedAfter) * maxSpeed;
}
```

Limita a velocidade máxima preservando a direção.

##### 3.5 Atualização de Posição

```typescript
p.x += p.vx;
p.y += p.vy;
```

Integração de Euler simples.

##### 3.6 Colisão com Obstáculos

```typescript
if (obstacles) {
  const r = collisionRadius;
  for (const obs of obstacles) {
    if (
      p.x + r > obs.x && p.x - r < obs.x + obs.w &&
      p.y + r > obs.y && p.y - r < obs.y + obs.h
    ) {
      // Calcula sobreposição em cada lado
      const overlapLeft  = (p.x + r) - obs.x;
      const overlapRight = (obs.x + obs.w) - (p.x - r);
      const overlapTop   = (p.y + r) - obs.y;
      const overlapBot   = (obs.y + obs.h) - (p.y - r);
      
      const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBot);
      
      // Resolve pelo lado de menor penetração
      if (minOverlap === overlapLeft) {
        p.x = obs.x - r;
        p.vx = -Math.abs(p.vx);
      } else if (minOverlap === overlapRight) {
        p.x = obs.x + obs.w + r;
        p.vx = Math.abs(p.vx);
      } else if (minOverlap === overlapTop) {
        p.y = obs.y - r;
        p.vy = -Math.abs(p.vy);
      } else {
        p.y = obs.y + obs.h + r;
        p.vy = Math.abs(p.vy);
      }
    }
  }
}
```

##### 3.7 Colisão com Bordas

```typescript
if (p.x < margin) {
  p.x = margin;
  p.vx = Math.abs(p.vx);
}
if (p.x > containerWidth - margin) {
  p.x = containerWidth - margin;
  p.vx = -Math.abs(p.vx);
}
if (p.y < margin) {
  p.y = margin;
  p.vy = Math.abs(p.vy);
}
if (p.y > containerHeight - margin) {
  p.y = containerHeight - margin;
  p.vy = -Math.abs(p.vy);
}
```

### Exemplos de Uso

#### Loop de Animação Vanilla

```typescript
import { initializeParticles, tickParticles } from 'physaac';

const container = document.getElementById('container');
const particles = initializeParticles(50, 800, 600, 14);
let frame = 0;

function animate() {
  tickParticles(
    particles,
    frame++,
    800,
    600,
    null,  // sem força externa
    null,  // sem obstáculos
    {}     // usa padrões
  );
  
  // Atualiza DOM
  particles.forEach((p, i) => {
    elements[i].style.left = `${p.x}px`;
    elements[i].style.top = `${p.y}px`;
  });
  
  requestAnimationFrame(animate);
}

animate();
```

#### Com Força Externa Personalizada

```typescript
const gravityForce = { fx: 0, fy: 0.005 };

function animate() {
  tickParticles(
    particles,
    frame++,
    width,
    height,
    gravityForce,  // gravidade constante para baixo
    null,
    { damping: 0.998 }
  );
  requestAnimationFrame(animate);
}
```

#### Com Obstáculos Dinâmicos

```typescript
const obstaclesRef = useRef<ObstacleRect[]>([]);

function animate() {
  tickParticles(
    particles,
    frame++,
    width,
    height,
    motionRef.current,     // giroscópio
    obstaclesRef.current,  // obstáculos atualizados
    options
  );
  requestAnimationFrame(animate);
}
```

### Performance Considerations

#### Complexidade

- **Repulsão**: O(n²) - dominante para muitas partículas
- **Atualização individual**: O(n)
- **Colisão com obstáculos**: O(n × m) onde m = número de obstáculos

#### Benchmarks Aproximados (60 FPS target)

| Partículas | Obstáculos | Tempo por Frame | Status |
|------------|------------|-----------------|--------|
| 10 | 0 | ~0.02ms | ✅ Excelente |
| 50 | 0 | ~0.3ms | ✅ Ótimo |
| 100 | 0 | ~1.2ms | ✅ Bom |
| 200 | 0 | ~5ms | ⚠️ Aceitável |
| 500 | 0 | ~30ms | ❌ Problemas |
| 50 | 10 | ~0.5ms | ✅ Ótimo |
| 50 | 100 | ~3ms | ✅ Bom |

#### Otimizações Possíveis

Para >200 partículas, considere:

1. **Spatial Hashing**: Grid espacial para reduzir comparações de repulsão
2. **QuadTree**: Estrutura hierárquica para detecção de proximidade
3. **Web Workers**: Processar física em thread separada
4. **GPU Acceleration**: Usar WebGL/compute shaders

---

## 3. smoothNoise

### Propósito

Gera um valor de ruído suave e determinístico baseado em uma seed e tempo. Usado para adicionar variação orgânica ao movimento das partículas.

### Assinatura

```typescript
function smoothNoise(seed: number, t: number): number
```

### Parâmetros

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `seed` | `number` | Semente única da partícula |
| `t` | `number` | Tempo/frame atual |

### Retorno

`number` entre -1 e 1

### Implementação

```typescript
export function smoothNoise(seed: number, t: number): number {
  return Math.sin(seed * 127.1 + t * 0.018) * 
         Math.cos(seed * 311.7 + t * 0.011);
}
```

### Características

- **Determinístico**: Mesmos inputs = mesma saída
- **Suave**: Varia gradualmente, sem saltos bruscos
- **Periódico longo**: Leva muito tempo para repetir o padrão
- **Limitado**: Sempre entre -1 e 1

### Exemplo de Uso Direto

```typescript
import { smoothNoise } from 'physaac';

// Gera ruído para uma partícula específica
const seed = 42.5;
const valueAtFrame0 = smoothNoise(seed, 0);
const valueAtFrame100 = smoothNoise(seed, 100);
const valueAtFrame1000 = smoothNoise(seed, 1000);
```

---

## 4. halton

### Propósito

Gera o n-ésimo valor da sequência de Halton para uma base específica. Usado para distribuição quasi-aleatória uniforme.

### Assinatura

```typescript
function halton(index: number, base: number): number
```

### Parâmetros

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `index` | `number` | Índice na sequência (1-based) |
| `base` | `number` | Base prima (2, 3, 5, 7, 11, etc.) |

### Retorno

`number` entre 0 e 1

### Implementação

```typescript
export function halton(index: number, base: number): number {
  let f = 1, r = 0, i = index;
  while (i > 0) {
    f /= base;
    r += f * (i % base);
    i = Math.floor(i / base);
  }
  return r;
}
```

### Exemplo de Uso

```typescript
import { halton } from 'physaac';

// Primeiros valores base 2
halton(1, 2);  // 0.5
halton(2, 2);  // 0.25
halton(3, 2);  // 0.75
halton(4, 2);  // 0.125

// Base 3
halton(1, 3);  // 0.333...
halton(2, 3);  // 0.666...
halton(3, 3);  // 0.111...
```

---

## Resumo das Funções do Engine

| Função | Propósito | Mutação | Típico Uso |
|--------|-----------|---------|------------|
| `initializeParticles` | Criar partículas inicializadas | Não | Uma vez no setup |
| `tickParticles` | Atualizar física por frame | Sim (in-place) | Todo frame (RAF) |
| `smoothNoise` | Gerar ruído determinístico | Não | Interno/Customizado |
| `halton` | Gerar sequência quasi-aleatória | Não | Interno/Customizado |

---

[Próximo: Módulo Device Motion](./05-device-motion.md)
