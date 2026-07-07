# Guia de Modificação e Extensão

Este documento ensina como modificar o comportamento do motor de física e estendê-lo com funcionalidades personalizadas. Destina-se a desenvolvedores que querem ir além do uso básico e criar comportamentos únicos.

---

## Índice

1. [Entendendo a Arquitetura](#entendendo-a-arquitetura)
2. [Modificando Comportamentos Existentes](#modificando-comportamentos-existentes)
3. [Adicionando Novas Forças](#adicionando-novas-forças)
4. [Criando Efeitos Visuais Customizados](#criando-efeitos-visuais-customizados)
5. [Otimizações Avançadas](#otimizações-avançadas)
6. [Portando para Outros Ambientes](#portando-para-outros-ambientes)

---

## Entendendo a Arquitetura

### Diagrama de Fluxo de Dados

```
┌─────────────────────────────────────────────────────────────┐
│                    usePhysicsParticles                       │
│  (React Hook - orquestra inicialização e loop RAF)          │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                     tickParticles                            │
│  (Função principal - atualiza todas as partículas)          │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ FASE 1: Repulsão entre partículas (O(n²))           │    │
│  │ - Loop duplo compara todos os pares                 │    │
│  │ - Aplica força repulsiva baseada na distância       │    │
│  └─────────────────────────────────────────────────────┘    │
│                          │                                   │
│                          ▼                                   │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ FASE 2: Atualização individual (O(n))               │    │
│  │ Para cada partícula:                                │    │
│  │   1. Aplica damping                                 │    │
│  │   2. Aplica força externa (giroscópio)              │    │
│  │   3. Aplica thermal noise                           │    │
│  │   4. Clamp da velocidade máxima                     │    │
│  │   5. Atualiza posição (x += vx, y += vy)            │    │
│  │   6. Colisão com obstáculos                         │    │
│  │   7. Colisão com bordas                             │    │
│  └─────────────────────────────────────────────────────┘    │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                   applyParticlePositions                     │
│  (Aplica posições no DOM via style.left/top)                │
└─────────────────────────────────────────────────────────────┘
```

### Pontos de Extensão Principais

| Local | O que modificar | Dificuldade |
|-------|-----------------|-------------|
| `tickParticles` | Adicionar novas forças | Fácil |
| `initializeParticles` | Mudar distribuição inicial | Fácil |
| `smoothNoise` | Alterar padrão de ruído | Médio |
| Colisão com bordas | Comportamento de bounce | Médio |
| Repulsão | Fórmula de força entre partículas | Médio |
| Renderização | Substituir DOM por Canvas/WebGL | Fácil |

---

## Modificando Comportamentos Existentes

### 1. Alterar a Física de Repulsão

**Padrão atual**:
```typescript
const force = (repulsionStrength * (collisionRadius * 2 - dist)) / dist;
```

Esta é uma força linear que aumenta conforme as partículas se aproximam.

#### Opção A: Repulsão Exponencial

Para uma repulsão mais dramática quando muito próximas:

```typescript
// No arquivo tick-particles.ts, modifique a fórmula:
const minDist = collisionRadius * 2;
const overlap = minDist - dist;

// Força exponencial
const force = repulsionStrength * Math.exp(overlap / collisionRadius);

// Ou força quadrática
const force = repulsionStrength * Math.pow(overlap / collisionRadius, 2);
```

**Efeito visual**: Partículas "saltam" mais vigorosamente quando muito próximas.

#### Opção B: Repulsão Suave (Lennard-Jones simplificado)

Para um comportamento mais orgânico tipo "moléculas":

```typescript
const sigma = collisionRadius * 2;
const ratio = sigma / dist;

// Potência 12 para repulsão, potência 6 para atração fraca
const force = repulsionStrength * (Math.pow(ratio, 12) - Math.pow(ratio, 6));

// Só aplica se positivo (repulsão)
if (force > 0) {
  const fx = dx * force;
  const fy = dy * force;
  // ... aplica forças
}
```

**Efeito visual**: Partículas mantêm distância ideal, mas podem se aproximar suavemente.

#### Opção C: Zona Morta (Sem repulsão até certo ponto)

```typescript
const deadzone = collisionRadius;  // Sem repulsão dentro desta zona
const effectiveRadius = collisionRadius * 2;

if (dist < effectiveRadius && dist > deadzone) {
  const force = repulsionStrength * (effectiveRadius - dist) / (effectiveRadius - deadzone);
  // ... aplica forças
}
```

**Efeito visual**: Partículas podem se sobrepor parcialmente antes de se repelirem.

---

### 2. Modificar Colisão com Bordas

**Padrão atual**: Ricochete elástico simples.

#### Opção A: Colisão com Perda de Energia

```typescript
const bounceFactor = 0.8;  // Perde 20% da velocidade ao bater

if (p.x < margin) {
  p.x = margin;
  p.vx = -p.vx * bounceFactor;  // Inverte e reduz
}
```

**Efeito visual**: Partículas gradualmente param de bater nas bordas.

#### Opção B: Teletransporte (Pac-Man style)

```typescript
// Em vez de ricochetear, teleporta para o lado oposto
if (p.x < -collisionRadius) {
  p.x = containerWidth + collisionRadius;
}
if (p.x > containerWidth + collisionRadius) {
  p.x = -collisionRadius;
}
```

**Efeito visual**: Partículas saem de um lado e reaparecem no outro.

#### Opção C: Bordas Elásticas (Mola)

```typescript
const springConstant = 0.05;

if (p.x < margin) {
  const penetration = margin - p.x;
  p.vx += penetration * springConstant;  // Empurra de volta como mola
  p.x = margin;
}
```

**Efeito visual**: Partículas "afundam" levemente na borda antes de serem empurradas.

---

### 3. Alterar o Thermal Noise

**Padrão atual**:
```typescript
vx += smoothNoise(noiseSeed, t) * noiseStrength;
vy += smoothNoise(noiseSeed + 50, t) * noiseStrength;
```

#### Opção A: Noise Direcional Preferencial

```typescript
// Noise mais forte em uma direção (ex: vento vertical)
const directionalBias = 0.7;  // 70% vertical, 30% horizontal

vx += smoothNoise(noiseSeed, t) * noiseStrength * (1 - directionalBias);
vy += smoothNoise(noiseSeed + 50, t) * noiseStrength * (1 + directionalBias);
```

**Efeito visual**: Movimento browniano alongado verticalmente.

#### Opção A: Noise Pulsante

```typescript
// Intensidade varia com o tempo
const pulse = Math.sin(t * 0.01) * 0.5 + 0.5;  // Oscila entre 0.5 e 1.5
const varyingStrength = noiseStrength * pulse;

vx += smoothNoise(noiseSeed, t) * varyingStrength;
vy += smoothNoise(noiseSeed + 50, t) * varyingStrength;
```

**Efeito visual**: Agitação aumenta e diminui ciclicamente.

#### Opção C: Noise Baseado em Posição

```typescript
// Noise mais forte nas bordas
const centerX = containerWidth / 2;
const centerY = containerHeight / 2;
const distFromCenter = Math.sqrt(
  Math.pow(p.x - centerX, 2) + Math.pow(p.y - centerY, 2)
);
const maxDist = Math.sqrt(centerX * centerX + centerY * centerY);
const edgeFactor = distFromCenter / maxDist;  // 0 no centro, 1 nas bordas

const positionBasedStrength = noiseStrength * (0.5 + edgeFactor * 0.5);

vx += smoothNoise(noiseSeed, t) * positionBasedStrength;
vy += smoothNoise(noiseSeed + 50, t) * positionBasedStrength;
```

**Efeito visual**: Partículas mais agitadas perto das bordas, calmas no centro.

---

### 4. Modificar Damping

**Padrão atual**: Damping constante.

#### Opção A: Damping Dependente da Velocidade

```typescript
// Mais damping em altas velocidades (resistência do ar realista)
const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
const velocityDependentDamping = damping - (speed * 0.001);

p.vx *= velocityDependentDamping;
p.vy *= velocityDependentDamping;
```

**Efeito visual**: Partículas rápidas desaceleram mais rápido que lentas.

#### Opção B: Damping Zonal

```typescript
// Damping diferente em regiões do container
const centerX = containerWidth / 2;
const zoneRadius = containerWidth / 4;
const distFromCenter = Math.sqrt(
  Math.pow(p.x - centerX, 2) + Math.pow(p.y - centerY, 2)
);

const isViscousZone = distFromCenter < zoneRadius;
const zoneDamping = isViscousZone ? 0.95 : 0.994;  // Mel no centro, ar fora

p.vx *= zoneDamping;
p.vy *= zoneDamping;
```

**Efeito visual**: Partículas movem-se lentamente no centro, rapidamente nas bordas.

---

## Adicionando Novas Forças

### Estrutura para Nova Força

Adicione após a fase de repulsão e antes da atualização individual:

```typescript
// Dentro de tickParticles, após o loop de repulsão:

// === NOVA FORÇA PERSONALIZADA ===
for (const p of particles) {
  // Calcula força
  const forceX = /* sua lógica */;
  const forceY = /* sua lógica */;
  
  // Aplica à velocidade
  p.vx += forceX;
  p.vy += forceY;
}
// =================================
```

### Exemplo 1: Força Gravitacional Central

```typescript
// Atração para o centro do container
const centerX = containerWidth / 2;
const centerY = containerHeight / 2;
const gravityStrength = 0.002;

for (const p of particles) {
  const dx = centerX - p.x;
  const dy = centerY - p.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  
  if (dist > 0) {
    // Força inversamente proporcional à distância (tipo gravidade)
    const force = gravityStrength / (dist + 1);
    p.vx += (dx / dist) * force;
    p.vy += (dy / dist) * force;
  }
}
```

### Exemplo 2: Vórtice/Rodopio

```typescript
// Faz partículas orbitarem o centro
const vortexCenterX = containerWidth / 2;
const vortexCenterY = containerHeight / 2;
const vortexStrength = 0.01;

for (const p of particles) {
  const dx = p.x - vortexCenterX;
  const dy = p.y - vortexCenterY;
  
  // Vetor tangente (perpendicular ao radial)
  const tangentX = -dy;
  const tangentY = dx;
  
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist > 0) {
    // Força tangencial cria rotação
    const force = vortexStrength / (dist + 1);
    p.vx += (tangentX / dist) * force;
    p.vy += (tangentY / dist) * force;
  }
}
```

### Exemplo 3: Magnetismo (Atração/Repulsão Seletiva)

```typescript
// Algumas partículas atraem, outras repelem
const magnetStrength = 0.005;

for (let i = 0; i < particles.length; i++) {
  for (let j = i + 1; j < particles.length; j++) {
    const dx = particles[j].x - particles[i].x;
    const dy = particles[j].y - particles[i].y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    if (dist > 0 && dist < 200) {  // Alcance limitado
      // Partículas pares atraem, ímpares repelem
      const polarityI = i % 2 === 0 ? 1 : -1;
      const polarityJ = j % 2 === 0 ? 1 : -1;
      
      const attraction = polarityI * polarityJ;  // +1 atrai, -1 repele
      const force = attraction * magnetStrength / dist;
      
      particles[i].vx += dx * force;
      particles[i].vy += dy * force;
      particles[j].vx -= dx * force;
      particles[j].vy -= dy * force;
    }
  }
}
```

### Exemplo 4: Correntes de Fluido

```typescript
// Campo vetorial simulando correnteza
function getCurrentForce(x: number, y: number, t: number) {
  // Padrão senoidal que muda com o tempo
  const flowX = Math.sin(y * 0.01 + t * 0.001) * 0.002;
  const flowY = Math.cos(x * 0.01 + t * 0.001) * 0.002;
  return { flowX, flowY };
}

for (const p of particles) {
  const { flowX, flowY } = getCurrentForce(p.x, p.y, t);
  p.vx += flowX;
  p.vy += flowY;
}
```

---

## Criando Efeitos Visuais Customizados

### 1. Trails/Rastros

```typescript
// No componente React ou código de renderização:

const canvasRef = useRef<HTMLCanvasElement>(null);
const trailsRef = useRef<ImageData[]>([]);

function animate() {
  const ctx = canvas.getContext('2d')!;
  
  // Desenha frame anterior com transparência (cria rastro)
  const imageData = ctx.getImageData(0, 0, width, height);
  trailsRef.current.push(imageData);
  if (trailsRef.current.length > 5) trailsRef.current.shift();
  
  // Limpa e redesenha rastros
  ctx.clearRect(0, 0, width, height);
  trailsRef.current.forEach((trail, i) => {
    ctx.globalAlpha = (i + 1) / trailsRef.current.length * 0.3;
    ctx.putImageData(trail, 0, 0);
  });
  
  // Desenha partículas atuais
  ctx.globalAlpha = 1;
  particles.forEach(p => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, 8, 0, Math.PI * 2);
    ctx.fill();
  });
  
  requestAnimationFrame(animate);
}
```

### 2. Conexões entre Partículas Próximas

```typescript
// Desenha linhas entre partículas próximas
ctx.strokeStyle = 'rgba(100, 150, 255, 0.3)';
ctx.lineWidth = 1;

for (let i = 0; i < particles.length; i++) {
  for (let j = i + 1; j < particles.length; j++) {
    const dx = particles[j].x - particles[i].x;
    const dy = particles[j].y - particles[i].y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    if (dist < 100) {
      const alpha = 1 - dist / 100;
      ctx.strokeStyle = `rgba(100, 150, 255, ${alpha})`;
      ctx.beginPath();
      ctx.moveTo(particles[i].x, particles[i].y);
      ctx.lineTo(particles[j].x, particles[j].y);
      ctx.stroke();
    }
  }
}
```

### 3. Partículas que Mudam de Cor

```typescript
// Cor baseada na velocidade
function getSpeedColor(speed: number): string {
  // Mapeia velocidade (0-2) para hue (240-0, azul para vermelho)
  const hue = Math.max(0, 240 - speed * 120);
  return `hsl(${hue}, 70%, 60%)`;
}

particles.forEach(p => {
  const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
  ctx.fillStyle = getSpeedColor(speed);
  ctx.beginPath();
  ctx.arc(p.x, p.y, 8, 0, Math.PI * 2);
  ctx.fill();
});
```

### 4. Efeito de Pulso

```typescript
// Tamanho baseado em onda senoidal do tempo
const baseSize = 8;
const pulseSpeed = 0.05;
const pulseAmplitude = 3;

particles.forEach((p, i) => {
  const pulse = Math.sin(t * pulseSpeed + i * 0.5) * pulseAmplitude;
  const size = baseSize + pulse;
  
  ctx.beginPath();
  ctx.arc(p.x, p.y, Math.max(2, size), 0, Math.PI * 2);
  ctx.fill();
});
```

---

## Otimizações Avançadas

### 1. Spatial Hashing para Repulsão

Para >200 partículas, substitua o loop O(n²) por grid espacial:

```typescript
interface GridCell {
  particles: number[];  // Índices das partículas nesta célula
}

function createGrid(particles: Particle[], cellSize: number): GridCell[][] {
  const cols = Math.ceil(containerWidth / cellSize);
  const rows = Math.ceil(containerHeight / cellSize);
  const grid: GridCell[][] = [];
  
  // Inicializa grid
  for (let i = 0; i < rows; i++) {
    grid[i] = [];
    for (let j = 0; j < cols; j++) {
      grid[i][j] = { particles: [] };
    }
  }
  
  // Popula grid
  particles.forEach((p, idx) => {
    const col = Math.floor(p.x / cellSize);
    const row = Math.floor(p.y / cellSize);
    if (col >= 0 && col < cols && row >= 0 && row < rows) {
      grid[row][col].particles.push(idx);
    }
  });
  
  return grid;
}

function getNearbyParticles(
  grid: GridCell[][],
  p: Particle,
  cellSize: number,
  searchRadius: number
): number[] {
  const col = Math.floor(p.x / cellSize);
  const row = Math.floor(p.y / cellSize);
  const cellsToCheck = Math.ceil(searchRadius / cellSize);
  
  const nearby: number[] = [];
  
  for (let dr = -cellsToCheck; dr <= cellsToCheck; dr++) {
    for (let dc = -cellsToCheck; dc <= cellsToCheck; dc++) {
      const r = row + dr;
      const c = col + dc;
      if (r >= 0 && r < grid.length && c >= 0 && c < grid[0].length) {
        nearby.push(...grid[r][c].particles);
      }
    }
  }
  
  return nearby;
}

// Uso em tickParticles:
const cellSize = collisionRadius * 4;
const grid = createGrid(particles, cellSize);

for (let i = 0; i < particles.length; i++) {
  const nearby = getNearbyParticles(grid, particles[i], cellSize, collisionRadius * 2);
  
  for (const j of nearby) {
    if (j <= i) continue;  // Evita duplicação
    
    // ... lógica de repulsão normal
  }
}
```

### 2. Usando Web Workers

```typescript
// worker.ts
self.onmessage = (e) => {
  const { particles, t, width, height, options } = e.data;
  
  // Roda tickParticles no worker
  tickParticles(particles, t, width, height, null, null, options);
  
  self.postMessage({ particles });
};

// Main thread
const worker = new Worker('worker.js');

worker.postMessage({
  particles: particlesRef.current,
  t: frame++,
  width: containerWidth,
  height: containerHeight,
  options
});

worker.onmessage = (e) => {
  particlesRef.current = e.data.particles;
  applyParticlePositions(particlesRef.current, elementsRef.current);
  requestAnimationFrame(animate);
};
```

### 3. Batch Updates no DOM

```typescript
// Em vez de atualizar style individualmente, usa CSS custom properties
const particleElements = particles.map(() => {
  const el = document.createElement('div');
  el.style.setProperty('--x', '0px');
  el.style.setProperty('--y', '0px');
  el.style.transform = 'translate(var(--x), var(--y))';
  return el;
});

function updatePositions() {
  // Atualiza variáveis CSS em batch
  particles.forEach((p, i) => {
    particleElements[i].style.setProperty('--x', `${p.x}px`);
    particleElements[i].style.setProperty('--y', `${p.y}px`);
  });
}
```

---

## Portando para Outros Ambientes

### Vue.js

```vue
<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { initializeParticles, tickParticles } from 'physaac';

const containerRef = ref(null);
const particleRefs = ref([]);
const particles = ref([]);
let rafId = null;

onMounted(() => {
  const container = containerRef.value;
  particles.value = initializeParticles(50, container.offsetWidth, container.offsetHeight, 14);
  
  const animate = () => {
    tickParticles(particles.value, Date.now(), container.offsetWidth, container.offsetHeight, null, null);
    
    particles.value.forEach((p, i) => {
      particleRefs.value[i].style.left = `${p.x}px`;
      particleRefs.value[i].style.top = `${p.y}px`;
    });
    
    rafId = requestAnimationFrame(animate);
  };
  
  animate();
});

onUnmounted(() => {
  if (rafId) cancelAnimationFrame(rafId);
});
</script>

<template>
  <div ref="containerRef" class="container">
    <div
      v-for="(_, i) in 50"
      :key="i"
      ref="particleRefs"
      class="particle"
    />
  </div>
</template>
```

### Svelte

```svelte
<script>
  import { onMount, onDestroy } from 'svelte';
  import { initializeParticles, tickParticles } from 'physaac';
  
  let container;
  let particles = [];
  let particleElements = [];
  let rafId;
  
  onMount(() => {
    particles = initializeParticles(50, container.offsetWidth, container.offsetHeight, 14);
    
    const animate = () => {
      tickParticles(particles, Date.now(), container.offsetWidth, container.offsetHeight, null, null);
      
      particles.forEach((p, i) => {
        particleElements[i].style.left = `${p.x}px`;
        particleElements[i].style.top = `${p.y}px`;
      });
      
      rafId = requestAnimationFrame(animate);
    };
    
    animate();
  });
  
  onDestroy(() => {
    if (rafId) cancelAnimationFrame(rafId);
  });
</script>

<div bind:this={container} class="container">
  {#each Array(50) as _, i}
    <div bind:this={particleElements[i]} class="particle" />
  {/each}
</div>
```

### Vanilla JS com ES Modules

```html
<script type="module">
  import { initializeParticles, tickParticles } from 'https://cdn.jsdelivr.net/npm/physaac/+esm';
  
  const container = document.getElementById('container');
  const particles = initializeParticles(50, container.offsetWidth, container.offsetHeight, 14);
  
  const elements = particles.map(() => {
    const el = document.createElement('div');
    el.className = 'particle';
    container.appendChild(el);
    return el;
  });
  
  let frame = 0;
  function animate() {
    tickParticles(particles, frame++, container.offsetWidth, container.offsetHeight, null, null);
    
    particles.forEach((p, i) => {
      elements[i].style.left = `${p.x}px`;
      elements[i].style.top = `${p.y}px`;
    });
    
    requestAnimationFrame(animate);
  }
  
  animate();
</script>
```

---

## Checklist de Debug

Ao modificar o motor, use este checklist:

- [ ] As partículas são inicializadas corretamente?
- [ ] A repulsão está funcionando (partículas não se sobrepõem)?
- [ ] O damping está reduzindo velocidade gradualmente?
- [ ] O thermal noise mantém partículas lentas em movimento?
- [ ] As colisões com bordas funcionam em todos os lados?
- [ ] Obstáculos estão sendo respeitados?
- [ ] A velocidade máxima está sendo limitada?
- [ ] Não há memory leaks (RAF limpo no unmount)?
- [ ] Performance está aceitável (>30 FPS)?

---

[Índice Principal](./README.md)
