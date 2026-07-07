# Adaptadores e Utilitários

Este documento cobre os módulos auxiliares do Hadron que facilitam a integração com diferentes ambientes e fornecem funcionalidades utilitárias.

---

## Visão Geral

O Hadron inclui dois módulos auxiliares:

1. **Adapters**: Ponte entre o motor de física e diferentes sistemas de renderização (DOM, Canvas, WebGL)
2. **Utilitários**: Funções helper para casos de uso comuns

```
┌─────────────────────────────────────────────┐
│            Motor de Física                  │
│         (tickParticles, etc.)               │
└───────────────────┬─────────────────────────┘
                    │
        ┌───────────┼───────────┐
        │           │           │
        ▼           ▼           ▼
   ┌─────────┐ ┌─────────┐ ┌─────────┐
   │  DOM    │ │ Canvas  │ │ WebGL   │
   │ Adapter │ │ (user)  │ │ (user)  │
   └─────────┘ └─────────┘ └─────────┘
```

---

## Módulo Adapters

### applyParticlePositions

Aplica as posições das partículas em elementos DOM via `style.left` e `style.top`.

#### Assinatura

```typescript
function applyParticlePositions(
  particles: Particle[],
  elements: Array<HTMLElement | null>
): void
```

#### Parâmetros

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `particles` | `Particle[]` | Array de partículas com posições atualizadas |
| `elements` | `Array<HTMLElement \| null>` | Array de elementos DOM (mesmo tamanho que particles) |

#### Retorno

`void` - Aplica modificações diretamente nos elementos.

#### Implementação

```typescript
export function applyParticlePositions(
  particles: Particle[],
  elements: Array<HTMLElement | null>
): void {
  for (let i = 0; i < particles.length; i++) {
    const el = elements[i];
    if (el) {
      el.style.left = `${particles[i].x}px`;
      el.style.top = `${particles[i].y}px`;
    }
  }
}
```

#### Exemplo de Uso Vanilla

```typescript
import { initializeParticles, tickParticles } from 'physaac';
import { applyParticlePositions } from 'physaac/adapters';

// Setup
const container = document.getElementById('container');
const particles = initializeParticles(50, 800, 600, 14);

// Cria elementos DOM
const elements = particles.map(() => {
  const el = document.createElement('div');
  el.className = 'particle';
  container.appendChild(el);
  return el;
});

// Loop de animação
let frame = 0;
function animate() {
  tickParticles(particles, frame++, 800, 600, null, null);
  applyParticlePositions(particles, elements);
  requestAnimationFrame(animate);
}

animate();
```

#### Exemplo com React (Alternativo ao Hook)

```typescript
import { useRef, useEffect } from 'react';
import { initializeParticles, tickParticles } from 'physaac';
import { applyParticlePositions } from 'physaac/adapters';

function ParticleComponent() {
  const containerRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const elementsRef = useRef<(HTMLDivElement | null)[]>([]);
  
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    // Inicializa
    particlesRef.current = initializeParticles(
      50,
      container.offsetWidth,
      container.offsetHeight,
      14
    );
    
    // Cria elementos
    elementsRef.current = particlesRef.current.map(() => {
      const el = document.createElement('div');
      el.className = 'particle';
      container.appendChild(el);
      return el;
    });
    
    // Loop
    let frame = 0;
    let rafId: number;
    
    const animate = () => {
      tickParticles(particlesRef.current, frame++, 
        container.offsetWidth, container.offsetHeight, null, null);
      applyParticlePositions(particlesRef.current, elementsRef.current);
      rafId = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => cancelAnimationFrame(rafId);
  }, []);
  
  return <div ref={containerRef} style={{ position: 'relative' }} />;
}
```

#### Performance Considerations

**Vantagens**:
- Simples e direto
- Funciona em qualquer browser
- Fácil de debugar

**Desvantagens**:
- `style.left/top` trigger layout recalculation
- Menos performático que `transform: translate()`
- Limitado a ~100 partículas para 60 FPS

**Otimização com transform**:

```typescript
// Versão otimizada usando transform
function applyParticlePositionsOptimized(
  particles: Particle[],
  elements: Array<HTMLElement | null>
): void {
  for (let i = 0; i < particles.length; i++) {
    const el = elements[i];
    if (el) {
      // Transform é mais performático que left/top
      el.style.transform = `translate(${particles[i].x}px, ${particles[i].y}px)`;
    }
  }
}
```

---

## Padrões de Renderização

### 1. Renderização DOM (Padrão)

Melhor para:
- Poucas partículas (<100)
- Prototipagem rápida
- Integração simples com CSS

```typescript
// HTML
<div class="particle"></div>

// CSS
.particle {
  position: absolute;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(100, 150, 255, 0.6);
  will-change: transform;
}
```

### 2. Renderização Canvas

Melhor para:
- Muitas partículas (100-1000+)
- Performance crítica
- Efeitos visuais customizados

```typescript
import { initializeParticles, tickParticles } from 'physaac';

const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;
const particles = initializeParticles(500, 800, 600, 8);

function render() {
  // Limpa
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Atualiza física
  tickParticles(particles, frame++, canvas.width, canvas.height, null, null);
  
  // Renderiza
  particles.forEach(p => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, 8, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(100, 150, 255, 0.8)';
    ctx.fill();
  });
  
  requestAnimationFrame(render);
}
```

### 3. Renderização WebGL (Avançado)

Melhor para:
- Milhares de partículas
- Efeitos GPU-accelerated
- Visualizações complexas

```typescript
// Exemplo conceitual com Three.js
import * as THREE from 'three';
import { initializeParticles, tickParticles } from 'physaac';

const scene = new THREE.Scene();
const geometry = new THREE.BufferGeometry();
const material = new THREE.PointsMaterial({ color: 0x6496ff, size: 0.5 });

const particles = initializeParticles(10000, 800, 600, 2);
const positions = new Float32Array(particles.length * 3);

geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
const points = new THREE.Points(geometry, material);
scene.add(points);

function animate() {
  tickParticles(particles, frame++, 800, 600, null, null);
  
  // Atualiza buffer WebGL
  particles.forEach((p, i) => {
    positions[i * 3] = p.x;
    positions[i * 3 + 1] = p.y;
    positions[i * 3 + 2] = 0;
  });
  
  geometry.attributes.position.needsUpdate = true;
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
```

### 4. Renderização SVG

Melhor para:
- Escalabilidade vetorial
- Integração com gráficos SVG existentes
- Animações CSS combinadas

```typescript
const svg = document.getElementById('svg') as SVGSVGElement;
const particles = initializeParticles(50, 800, 600, 14);

// Cria círculos SVG
const circles = particles.map(() => {
  const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  circle.setAttribute('r', '14');
  circle.setAttribute('fill', 'rgba(100, 150, 255, 0.6)');
  svg.appendChild(circle);
  return circle;
});

function animate() {
  tickParticles(particles, frame++, 800, 600, null, null);
  
  particles.forEach((p, i) => {
    circles[i].setAttribute('cx', String(p.x));
    circles[i].setAttribute('cy', String(p.y));
  });
  
  requestAnimationFrame(animate);
}
```

---

## Utilitários Customizados

### 1. Calculadora de Velocidade

```typescript
/**
 * Calcula a magnitude da velocidade de uma partícula
 */
export function getParticleSpeed(particle: Particle): number {
  return Math.sqrt(particle.vx * particle.vx + particle.vy * particle.vy);
}

/**
 * Calcula a velocidade média de um sistema de partículas
 */
export function getAverageSpeed(particles: Particle[]): number {
  if (particles.length === 0) return 0;
  
  const totalSpeed = particles.reduce((sum, p) => {
    return sum + getParticleSpeed(p);
  }, 0);
  
  return totalSpeed / particles.length;
}

/**
 * Verifica se alguma partícula está abaixo da velocidade mínima
 */
export function hasSlowParticles(
  particles: Particle[],
  minSpeed: number
): boolean {
  return particles.some(p => getParticleSpeed(p) < minSpeed);
}
```

### 2. Debug Visual

```typescript
/**
 * Desenha linhas de velocidade para debug
 */
export function drawVelocityVectors(
  ctx: CanvasRenderingContext2D,
  particles: Particle[],
  scale: number = 10
): void {
  ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
  ctx.lineWidth = 1;
  
  particles.forEach(p => {
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    ctx.lineTo(p.x + p.vx * scale, p.y + p.vy * scale);
    ctx.stroke();
  });
}

/**
 * Desenha zonas de colisão para debug
 */
export function drawCollisionCircles(
  ctx: CanvasRenderingContext2D,
  particles: Particle[],
  radius: number
): void {
  ctx.strokeStyle = 'rgba(0, 255, 0, 0.3)';
  ctx.lineWidth = 1;
  
  particles.forEach(p => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
    ctx.stroke();
  });
}
```

### 3. Estatísticas em Tempo Real

```typescript
interface PhysicsStats {
  particleCount: number;
  avgSpeed: number;
  maxSpeed: number;
  minSpeed: number;
  avgDistance: number;
}

/**
 * Coleta estatísticas do sistema de partículas
 */
export function collectStats(particles: Particle[]): PhysicsStats {
  if (particles.length === 0) {
    return {
      particleCount: 0,
      avgSpeed: 0,
      maxSpeed: 0,
      minSpeed: 0,
      avgDistance: 0,
    };
  }
  
  const speeds = particles.map(p => getParticleSpeed(p));
  const avgSpeed = speeds.reduce((a, b) => a + b, 0) / speeds.length;
  const maxSpeed = Math.max(...speeds);
  const minSpeed = Math.min(...speeds);
  
  // Distância média entre partículas
  let totalDist = 0;
  let count = 0;
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[j].x - particles[i].x;
      const dy = particles[j].y - particles[i].y;
      totalDist += Math.sqrt(dx * dx + dy * dy);
      count++;
    }
  }
  
  return {
    particleCount: particles.length,
    avgSpeed,
    maxSpeed,
    minSpeed,
    avgDistance: count > 0 ? totalDist / count : 0,
  };
}

// Uso
setInterval(() => {
  const stats = collectStats(particles);
  console.log('Stats:', stats);
}, 1000);
```

### 4. Forças Personalizadas

```typescript
/**
 * Cria uma força gravitacional apontando para um ponto
 */
export function createGravityForce(
  targetX: number,
  targetY: number,
  strength: number = 0.001
): (particles: Particle[]) => void {
  return (particles: Particle[]) => {
    particles.forEach(p => {
      const dx = targetX - p.x;
      const dy = targetY - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist > 0) {
        p.vx += (dx / dist) * strength;
        p.vy += (dy / dist) * strength;
      }
    });
  };
}

/**
 * Cria uma força de vento constante
 */
export function createWindForce(
  angle: number,
  strength: number = 0.005
): ExternalForce {
  return {
    fx: Math.cos(angle) * strength,
    fy: Math.sin(angle) * strength,
  };
}

/**
 * Cria uma força de repulsão a partir de um ponto
 */
export function createRepulsionForce(
  centerX: number,
  centerY: number,
  radius: number,
  strength: number = 0.01
): (particles: Particle[]) => void {
  return (particles: Particle[]) => {
    particles.forEach(p => {
      const dx = p.x - centerX;
      const dy = p.y - centerY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist < radius && dist > 0) {
        const force = strength * (1 - dist / radius);
        p.vx += (dx / dist) * force;
        p.vy += (dy / dist) * force;
      }
    });
  };
}
```

### 5. Comportamentos Especiais

```typescript
/**
 * Faz partículas orbitarem um ponto central
 */
export function applyOrbitalBehavior(
  particles: Particle[],
  centerX: number,
  centerY: number,
  orbitalSpeed: number = 0.02
): void {
  particles.forEach(p => {
    const dx = p.x - centerX;
    const dy = p.y - centerY;
    
    // Vetor tangente à órbita
    const tangentX = -dy;
    const tangentY = dx;
    
    // Normaliza e aplica
    const len = Math.sqrt(tangentX * tangentX + tangentY * tangentY);
    if (len > 0) {
      p.vx += (tangentX / len) * orbitalSpeed;
      p.vy += (tangentY / len) * orbitalSpeed;
    }
  });
}

/**
 * Confina partículas a uma região circular
 */
export function applyCircularContainment(
  particles: Particle[],
  centerX: number,
  centerY: number,
  radius: number
): void {
  particles.forEach(p => {
    const dx = p.x - centerX;
    const dy = p.y - centerY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    if (dist > radius) {
      // Empurra de volta para dentro
      const angle = Math.atan2(dy, dx);
      p.x = centerX + Math.cos(angle) * (radius - 1);
      p.y = centerY + Math.sin(angle) * (radius - 1);
      
      // Inverte componente radial da velocidade
      const radialVx = Math.cos(angle) * p.vx;
      const radialVy = Math.sin(angle) * p.vy;
      p.vx -= 2 * radialVx;
      p.vy -= 2 * radialVy;
    }
  });
}
```

---

## Exemplos Completos

### 1. Sistema Solar Simulado

```typescript
import { initializeParticles, tickParticles } from 'physaac';
import { createGravityForce, applyOrbitalBehavior } from './utils';

const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;

// Sol no centro
const sunX = canvas.width / 2;
const sunY = canvas.height / 2;

// Planetas (partículas)
const planets = initializeParticles(8, canvas.width, canvas.height, 10);

// Posiciona planetas em órbitas circulares
planets.forEach((p, i) => {
  const orbitRadius = 50 + i * 40;
  const angle = (i / planets.length) * Math.PI * 2;
  p.x = sunX + Math.cos(angle) * orbitRadius;
  p.y = sunY + Math.sin(angle) * orbitRadius;
  p.vx = 0;
  p.vy = 0;
});

const gravity = createGravityForce(sunX, sunY, 0.5);

function animate() {
  // Aplica gravidade customizada antes da física padrão
  gravity(planets);
  
  // Física padrão (sem gravidade externa)
  tickParticles(planets, frame++, canvas.width, canvas.height, null, null);
  
  // Renderiza
  ctx.fillStyle = '#ffff00';
  ctx.beginPath();
  ctx.arc(sunX, sunY, 30, 0, Math.PI * 2);
  ctx.fill();
  
  planets.forEach(p => {
    ctx.fillStyle = '#6496ff';
    ctx.beginPath();
    ctx.arc(p.x, p.y, 10, 0, Math.PI * 2);
    ctx.fill();
  });
  
  requestAnimationFrame(animate);
}

animate();
```

### 2. Chuva de Partículas

```typescript
import { initializeParticles, tickParticles } from 'physaac';

const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;

// Cria "gotas" de chuva
const raindrops = Array.from({ length: 200 }, (_, i) => ({
  x: Math.random() * canvas.width,
  y: Math.random() * canvas.height,
  vx: Math.random() * 0.5 - 0.25,  // Leve vento horizontal
  vy: 3 + Math.random() * 2,       // Velocidade vertical alta
  noiseSeed: Math.random() * 100,
}));

function animate() {
  tickParticles(raindrops, frame++, canvas.width, canvas.height, null, null);
  
  // Reset quando sai da tela
  raindrops.forEach(p => {
    if (p.y > canvas.height) {
      p.y = -10;
      p.x = Math.random() * canvas.width;
    }
  });
  
  // Renderiza como linhas (efeito de movimento)
  ctx.strokeStyle = 'rgba(174, 194, 224, 0.8)';
  ctx.lineWidth = 1;
  
  raindrops.forEach(p => {
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    ctx.lineTo(p.x + p.vx * 3, p.y + p.vy * 3);
    ctx.stroke();
  });
  
  requestAnimationFrame(animate);
}

animate();
```

### 3. Firefly Effect (Vagalumes)

```typescript
import { initializeParticles, tickParticles } from 'physaac';

const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;

// Vagalumes
const fireflies = initializeParticles(50, canvas.width, canvas.height, 5);

// Ajusta parâmetros para movimento suave e lento
fireflies.forEach(f => {
  f.vx *= 0.3;  // Mais lento
  f.vy *= 0.3;
});

const time = 0;

function animate() {
  // Thermal noise mais forte para movimento errático
  tickParticles(fireflies, frame++, canvas.width, canvas.height, null, null, {
    minSpeed: 0.02,
    noiseStrength: 0.05,
    damping: 0.998,
    maxSpeed: 0.5,
  });
  
  // Renderiza com glow
  fireflies.forEach((f, i) => {
    const pulse = Math.sin(time * 2 + i) * 0.3 + 0.7;
    
    // Glow externo
    const gradient = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, 20);
    gradient.addColorStop(0, `rgba(255, 255, 100, ${pulse})`);
    gradient.addColorStop(1, 'rgba(255, 255, 100, 0)');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(f.x, f.y, 20, 0, Math.PI * 2);
    ctx.fill();
    
    // Núcleo brilhante
    ctx.fillStyle = `rgba(255, 255, 200, ${pulse})`;
    ctx.beginPath();
    ctx.arc(f.x, f.y, 3, 0, Math.PI * 2);
    ctx.fill();
  });
  
  requestAnimationFrame(animate);
}

animate();
```

---

[Próximo: Guia de Modificação e Extensão](./08-modificacao-extensao.md)
