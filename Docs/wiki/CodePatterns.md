---
tags: [patterns, typescript, conventions, code-style]
created: 2026-01-03
updated: 2026-01-03
sources: [src/**/*.ts]
complexity: N/A
performance_notes: Padrões visam legibilidade e performance
---

# Code Patterns

Padrões TypeScript, convenções e estilo de código do Hadron.

## 📝 Convenções Gerais

### Nomenclatura

| Tipo | Convenção | Exemplo |
|------|-----------|---------|
| Funções | camelCase | `tickParticles`, `initializeParticles` |
| Variáveis | camelCase | `particles`, `containerWidth` |
| Tipos/Interfaces | PascalCase | `Particle`, `PhysicsOptions` |
| Constantes | UPPER_SNAKE_CASE | `DEFAULT_COLLISION_RADIUS` |
| Arquivos | kebab-case | `tick-particles.ts`, `use-physics-particles.ts` |

### Estrutura de Arquivos

```typescript
// 1. Imports (relativos primeiro, depois absolute)
import { Particle } from './particle';
import { smoothNoise } from './noise';
import type { ExternalForce } from '../types';

// 2. Constantes
const DEFAULT_VALUE = 42;

// 3. Types/Interfaces
export interface MyInterface {
  // ...
}

// 4. Funções principais
export function mainFunction() {
  // ...
}

// 5. Funções auxiliares (private)
function helperFunction() {
  // ...
}
```

---

## 🎯 Padrões Específicos

### Refs para Compatibilidade Multi-Framework

Para funcionar com React e Vanilla JS simultaneamente, refs são objetos com propriedade `.current`:

```typescript
// Definição no options.ts
externalForceRef?: { current: ExternalForce | null | undefined };

// Uso em React
const motionRef = useDeviceMotion();
usePhysicsParticles(count, containerRef, particleRefs, {
  externalForceRef: motionRef,
});

// Uso em Vanilla
const forceRef = { current: { fx: 0, fy: 0 } };
tickParticles(particles, frame, w, h, forceRef.current, null);
```

### Valores Padrão com Nullish Coalescing

```typescript
const collisionRadius   = options.collisionRadius   ?? DEFAULT_COLLISION_RADIUS;
const repulsionStrength = options.repulsionStrength ?? DEFAULT_REPULSION_STRENGTH;
```

**Por que `??` e não `||`?**
- `??` trata apenas `null` ou `undefined` como ausente
- `||` trataria `0` como falso, o que seria problemático se quiséssemos desativar uma feature com zero

### Otimização: Evitar Math.sqrt Desnecessário

```typescript
const distSq = dx * dx + dy * dy;
const minDistSq = (collisionRadius * 2) ** 2;

// Só calcula sqrt se realmente precisar
if (distSq < minDistSq && distSq > 0) {
  const dist = Math.sqrt(distSq);
  // ... calcula força
}
```

### Loop de Repulsão O(n²) Otimizado

```typescript
// Itera apenas pares únicos (i, j) onde j > i
for (let i = 0; i < particles.length; i++) {
  for (let j = i + 1; j < particles.length; j++) {
    // Calcula força uma vez e aplica em ambos
    particles[i].vx -= fx;
    particles[i].vy -= fy;
    particles[j].vx += fx;
    particles[j].vy += fy;
  }
}
```

### Damping Adaptativo Baseado em Energia

```typescript
const shakeEnergy = Math.sqrt(extFx * extFx + extFy * extFy);
const adaptiveDamping = shakeEnergy > 0.002 ? damping * 0.97 : damping;
p.vx *= adaptiveDamping;
p.vy *= adaptiveDamping;
```

### Bounce com Resolução de Colisão Mínima

```typescript
const overlapLeft  = (p.x + r) - obs.x;
const overlapRight = (obs.x + obs.w) - (p.x - r);
const overlapTop   = (p.y + r) - obs.y;
const overlapBot   = (obs.y + obs.h) - (p.y - r);
const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBot);

// Resolve na direção do menor overlap
if (minOverlap === overlapLeft)  { p.x = obs.x - r;           p.vx = -Math.abs(p.vx); }
else if (minOverlap === overlapRight) { p.x = obs.x + obs.w + r; p.vx =  Math.abs(p.vx); }
else if (minOverlap === overlapTop)   { p.y = obs.y - r;          p.vy = -Math.abs(p.vy); }
else                                  { p.y = obs.y + obs.h + r;  p.vy =  Math.abs(p.vy); }
```

---

## 🔒 Imutabilidade e Mutação Controlada

### Quando Mutar é Aceitável

Hadron usa mutação controlada para performance crítica:

```typescript
// MUTAÇÃO PERMITIDA: partículas são atualizadas in-place
export function tickParticles(particles: Particle[], ...): void {
  for (const p of particles) {
    p.x += p.vx;  // mutação direta
    p.y += p.vy;
  }
}
```

**Justificativa:**
- Criar novos objetos a cada frame causaria GC pressure
- Partículas são estado transitório (não precisam ser imutáveis)
- API claramente documenta que array é mutado

### Quando Usar Imutabilidade

```typescript
// IMUTÁVEL: options não é mutado, apenas lido
export function tickParticles(..., options: PhysicsOptions = {}): void {
  const damping = options.damping ?? DEFAULT_DAMPING;
  // options.damping nunca é modificado
}
```

---

## 🧩 Pattern: Inicialização Separada do Loop

```typescript
// 1. Inicialização (ocorre uma vez)
const particles = initializeParticles(count, width, height, collisionRadius);

// 2. Loop contínuo (ocorre a cada frame)
function tick() {
  tickParticles(particles, frame++, width, height, ...);
  requestAnimationFrame(tick);
}
```

**Vantagens:**
- Separa concerns: setup vs update
- Facilita re-inicialização quando dimensões mudam
- Permite hot-reload de configurações

---

## ⚡ Performance Patterns

### Zero Re-Renders no React

```typescript
// ✅ CORRETO: atualiza DOM diretamente
for (let i = 0; i < particles.current.length; i++) {
  const el = particleRefs.current?.[i];
  if (el) {
    el.style.left = `${particles.current[i].x}px`;
    el.style.top  = `${particles.current[i].y}px`;
  }
}

// ❌ ERRADO: causaria re-render de todo o componente
// setParticles(particles); // trigger re-render
```

### Cleanup de RequestAnimationFrame

```typescript
useEffect(() => {
  rafRef.current = requestAnimationFrame(tick);
  
  return () => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
  };
}, [deps]);
```

### Singleton para Device Motion

```typescript
// singleton.ts
export const deviceMotionForce: ExternalForce = { fx: 0, fy: 0 };
let listenerActive = false;

export function startDeviceMotion(): void {
  if (listenerActive) return; // evita múltiplos listeners
  // ... adiciona listener
  listenerActive = true;
}
```

---

## 📋 Checklist de Code Review

### Antes de Submeter

- [ ] Nomes de variáveis são descritivos?
- [ ] Funções têm responsabilidade única?
- [ ] Constants estão em UPPER_SNAKE_CASE?
- [ ] Tipos estão exportados corretamente?
- [ ] Mutação está documentada/justificada?
- [ ] RAF listeners têm cleanup?
- [ ] Zero re-renders no React?
- [ ] Comentários explicam "por que", não "o que"?

### Performance

- [ ] Evitou Math.sqrt desnecessário?
- [ ] Loop O(n²) está otimizado com threshold?
- [ ] Não há alocações no hot path?
- [ ] Deadzone filtra ruído do sensor?

---

## 📄 Links Relacionados

- [[Architecture]] — visão geral da arquitetura
- [[Components]] — descrição dos componentes
- [[PhysicsConcepts]] — conceitos físicos implementados
- [src/engine/](../../src/engine/) — código fonte do engine
- [src/react/](../../src/react/) — hooks React
