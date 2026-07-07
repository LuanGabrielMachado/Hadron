---
tags: [physics, math, concepts, halton, noise, euler]
created: 2026-01-03
updated: 2026-01-03
sources: [src/engine/halton.ts, src/engine/noise.ts, src/engine/tick-particles.ts, src/engine/init-particles.ts]
complexity: O(n²) para repulsão, O(1) para noise
performance_notes: Noise determinístico evita alocações por frame
---

# Physics Concepts

Conceitos físicos e matemáticos que fundamentam o motor Hadron.

## 📐 Sequência de Halton

### Por Que Halton?

A sequência de Halton gera números **quasi-aleatórios** com distribuição uniforme. Diferente de `Math.random()`, que pode criar clusters e gaps, Halton garante que as partículas sejam distribuídas uniformemente pelo espaço desde o primeiro frame.

### Implementação

```typescript
// De halton.ts
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

### Uso no Hadron

- **Posição inicial**: `halton(i+1, 2)` para X, `halton(i+1, 3)` para Y
- **Ângulo inicial**: `halton(i+1, 5)` para direção
- **Velocidade inicial**: `halton(i+1, 7)` para magnitude
- **Noise seed**: `halton(i+1, 11)` para semente única da partícula

### Bases Primas

Cada dimensão usa um número primo diferente para evitar correlação:
- Base 2 → X
- Base 3 → Y
- Base 5, 7, 11 → atributos adicionais

---

## 🌊 Ruído Suave Determinístico

### Conceito

O ruído suave cria movimento orgânico e imprevisível sem usar `Math.random()` por frame. É **determinístico**: mesma seed + mesmo frame = mesmo valor.

### Implementação

```typescript
// De noise.ts
export function smoothNoise(seed: number, t: number): number {
  return Math.sin(seed * 127.1 + t * 0.018) * Math.cos(seed * 311.7 + t * 0.011);
}
```

### Características

| Propriedade | Valor |
|-------------|-------|
| Output | -1 a 1 |
| Periodo | ~350 frames para ciclo completo |
| Complexidade | O(1) — apenas seno/cosseno |
| Alocações | Zero |

### Aplicações

1. **Thermal Noise**: Mantém partículas em movimento mesmo quando "paradas"
   ```typescript
   p.vx += smoothNoise(p.noiseSeed, t) * noiseStrength;
   p.vy += smoothNoise(p.noiseSeed + 50, t) * noiseStrength;
   ```

2. **Impulso do Giroscópio**: Direção variável baseada em shake energy
   ```typescript
   const angle = smoothNoise(p.noiseSeed * 3.7, t * 0.3) * Math.PI * 2;
   const impulse = shakeEnergy * 3.5;
   p.vx += Math.cos(angle) * impulse;
   p.vy += Math.sin(angle) * impulse;
   ```

---

## 🔢 Integração de Euler

### Modelo Físico

Hadron usa integração de Euler simplificada para atualizar posições:

```
velocidade += aceleração
posição += velocidade
```

### Loop tickParticles

```typescript
// 1. Aplica forças (repulsão, externa)
p.vx -= fx;  // força de repulsão
p.vy -= fy;

// 2. Aplica damping (atrito)
p.vx *= damping;
p.vy *= damping;

// 3. Integra posição
p.x += p.vx;
p.y += p.vy;
```

### Por Que Euler?

- **Simples**: Fácil de entender e depurar
- **Rápido**: Uma adição e multiplicação por eixo
- **Estável o suficiente**: Para animações visuais, precisão física perfeita não é necessária

---

## 🎯 Damping Adaptativo

### Conceito

O damping (amortecimento) controla quanto da velocidade é mantida a cada frame. Valores próximos de 1 (ex: 0.994) criam movimento suave e duradouro.

### Damping Adaptativo

Quando há energia de shake (giroscópio ativo), o damping é reduzido para dissipar energia mais rápido:

```typescript
const shakeEnergy = Math.sqrt(extFx * extFx + extFy * extFy);
const adaptiveDamping = shakeEnergy > 0.002 ? damping * 0.97 : damping;
p.vx *= adaptiveDamping;
p.vy *= adaptiveDamping;
```

### Efeito

| Condição | Damping Efetivo | Comportamento |
|----------|-----------------|---------------|
| Repouso | 0.994 | Movimento suave, decai lentamente |
| Shake ativo | 0.994 × 0.97 ≈ 0.964 | Dissipa energia rápido, estabiliza |

---

## 💥 Repulsão Entre Partículas

### Fórmula

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
      
      particles[i].vx -= fx;
      particles[i].vy -= fy;
      particles[j].vx += fx;
      particles[j].vy += fy;
    }
  }
}
```

### Características

| Aspecto | Detalhes |
|---------|----------|
| Complexidade | O(n²) — par-a-par |
| Força | Linear com sobreposição: `(2r - dist) / dist` |
| Conservação | Momento conservado (ação = reação) |
| Otimização | Evita `Math.sqrt` se `distSq >= minDistSq` |

### Threshold de Colisão

- `minDistSq = (collisionRadius * 2)²`
- Apenas calcula força se partículas estão dentro do raio de colisão

---

## ⬜ Colisão AABB-Círculo

### Detecção

Verifica se círculo (partícula) intersecta retângulo (obstáculo):

```typescript
if (
  p.x + r > obs.x && p.x - r < obs.x + obs.w &&
  p.y + r > obs.y && p.y - r < obs.y + obs.h
) {
  // Colisão detectada
}
```

### Resolução

Calcula overlap mínimo em cada direção e resolve na menor:

```typescript
const overlapLeft  = (p.x + r) - obs.x;
const overlapRight = (obs.x + obs.w) - (p.x - r);
const overlapTop   = (p.y + r) - obs.y;
const overlapBot   = (obs.y + obs.h) - (p.y - r);
const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBot);

if (minOverlap === overlapLeft)  { p.x = obs.x - r;           p.vx = -Math.abs(p.vx); }
else if (minOverlap === overlapRight) { p.x = obs.x + obs.w + r; p.vx =  Math.abs(p.vx); }
else if (minOverlap === overlapTop)   { p.y = obs.y - r;          p.vy = -Math.abs(p.vy); }
else                                  { p.y = obs.y + obs.h + r;  p.vy =  Math.abs(p.vy); }
```

### Bounce nas Bordas

Partículas ricocheteiam nas bordas do container:

```typescript
if (p.x < margin) { p.x = margin; p.vx = Math.abs(p.vx); }
if (p.x > containerWidth - margin) { p.x = containerWidth - margin; p.vx = -Math.abs(p.vx); }
// ... mesmo para Y
```

---

## 🔥 Thermal Noise

### Propósito

Manter partículas em movimento mesmo quando a velocidade cai abaixo de `minSpeed`. Evita que partículas "congelem" completamente.

### Implementação

```typescript
const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
if (speed < minSpeed) {
  p.vx += smoothNoise(p.noiseSeed, t) * noiseStrength;
  p.vy += smoothNoise(p.noiseSeed + 50, t) * noiseStrength;
}
```

### Parâmetros Típicos

| Parâmetro | Valor Padrão | Efeito |
|-----------|--------------|--------|
| `minSpeed` | 0.08 | Threshold para ativar thermal noise |
| `noiseStrength` | 0.012 | Intensidade da força aplicada |

---

## 📊 Complexidade Computacional

| Operação | Complexidade | Notas |
|----------|--------------|-------|
| Repulsão | O(n²) | Par-a-par, otimizado com threshold |
| Noise por partícula | O(1) | Seno/cosseno direto |
| Atualização individual | O(1) | Euler integration |
| Colisão obstáculos | O(m) | m = número de obstáculos |
| DOM update | O(n) | style.left/top direto |

### Recomendações

- **<100 partículas**: DOM é eficiente
- **>100 partículas**: Considerar Canvas ou spatial hashing para repulsão
- **Muitos obstáculos**: Pre-filter com spatial partitioning

---

## 📄 Links Relacionados

- [[ConfigurationRecipes]] — valores práticos para diferentes efeitos
- [[Architecture]] — visão geral do sistema
- [halton.ts](../../src/engine/halton.ts) — implementação completa
- [noise.ts](../../src/engine/noise.ts) — implementação completa
- [tick-particles.ts](../../src/engine/tick-particles.ts) — loop de física
