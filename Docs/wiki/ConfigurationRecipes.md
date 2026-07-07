---
tags: [configuration, recipes, parameters, tuning]
created: 2026-01-03
updated: 2026-01-03
sources: [src/engine/tick-particles.ts, src/engine/options.ts]
complexity: N/A
performance_notes: Ajustes afetam diretamente o frame budget
---

# Configuration Recipes

Catálogo de configurações prontas para diferentes efeitos visuais.

## 📋 Parâmetros Disponíveis

| Parâmetro | Tipo | Padrão | Descrição |
|-----------|------|--------|-----------|
| `collisionRadius` | number | 14 | Raio de colisão entre partículas (px) |
| `repulsionStrength` | number | 1.4 | Força de repulsão entre partículas |
| `maxSpeed` | number | 1.2 | Velocidade máxima (px/frame) |
| `damping` | number | 0.994 | Amortecimento por frame (0–1) |
| `minSpeed` | number | 0.08 | Velocidade mínima para thermal noise |
| `noiseStrength` | number | 0.012 | Intensidade do thermal noise |
| `externalForceRef` | Ref | null | Ref com força externa { fx, fy } |
| `obstaclesRef` | Ref | null | Ref com array de obstáculos retangulares |

---

## 🎨 Receitas Prontas

### Background Calmo

Partículas em movimento suave e relaxante, ideal para backgrounds de sites institucionais.

```typescript
const options: PhysicsOptions = {
  collisionRadius: 14,
  repulsionStrength: 0.8,
  maxSpeed: 0.5,
  damping: 0.998,
  minSpeed: 0.05,
  noiseStrength: 0.008,
};
```

| Característica | Valor |
|----------------|-------|
| Energia | Baixa |
| Movimento | Lento, quase meditativo |
| Separação | Suave |
| Uso recomendado | Home pages, landing pages |

---

### Demo Interativa

Configuração padrão balanceada para demonstrações e protótipos.

```typescript
const options: PhysicsOptions = {
  collisionRadius: 14,
  repulsionStrength: 1.4,
  maxSpeed: 1.2,
  damping: 0.994,
  minSpeed: 0.08,
  noiseStrength: 0.012,
};
```

| Característica | Valor |
|----------------|-------|
| Energia | Média |
| Movimento | Natural, orgânico |
| Separação | Equilibrada |
| Uso recomendado | Demos, portfólios |

---

### Alta Energia

Partículas rápidas e reativas, ideais para experiências interativas intensas.

```typescript
const options: PhysicsOptions = {
  collisionRadius: 12,
  repulsionStrength: 2.5,
  maxSpeed: 3.0,
  damping: 0.990,
  minSpeed: 0.15,
  noiseStrength: 0.025,
};
```

| Característica | Valor |
|----------------|-------|
| Energia | Alta |
| Movimento | Rápido, caótico |
| Separação | Forte repulsão |
| Uso recomendado | Jogos, experiências imersivas |

---

### Simulação Orbital

Movimento mais livre, simulando corpos celestes ou átomos.

```typescript
const options: PhysicsOptions = {
  collisionRadius: 8,
  repulsionStrength: 0.5,
  maxSpeed: 2.0,
  damping: 0.999,
  minSpeed: 0.02,
  noiseStrength: 0.005,
};
```

| Característica | Valor |
|----------------|-------|
| Energia | Variável |
| Movimento | Fluido, orbital |
| Separação | Mínima |
| Uso recomendado | Visualizações científicas, arte generativa |

---

### Fluido Denso

Partículas próximas que se comportam como um fluido viscoso.

```typescript
const options: PhysicsOptions = {
  collisionRadius: 10,
  repulsionStrength: 3.0,
  maxSpeed: 0.8,
  damping: 0.992,
  minSpeed: 0.10,
  noiseStrength: 0.015,
};
```

| Característica | Valor |
|----------------|-------|
| Energia | Média-Baixa |
| Movimento | Viscoso, aglomerado |
| Separação | Muito forte |
| Uso recomendado | Simulações de fluidos, lava lamps |

---

## 🔧 Guia de Ajuste

### Ajustar Energia do Sistema

| Efeito | Aumentar | Diminuir |
|--------|----------|----------|
| Mais rápido | ↑ `maxSpeed` | ↓ `maxSpeed` |
| Mais agitado | ↓ `damping` (ex: 0.990) | ↑ `damping` (ex: 0.998) |
| Mais thermal noise | ↑ `noiseStrength` | ↓ `noiseStrength` |
| Ativa thermal noise mais cedo | ↑ `minSpeed` | ↓ `minSpeed` |

### Ajustar Interação Entre Partículas

| Efeito | Aumentar | Diminuir |
|--------|----------|----------|
| Mais separação | ↑ `repulsionStrength` | ↓ `repulsionStrength` |
| Partículas maiores | ↑ `collisionRadius` | ↓ `collisionRadius` |
| Mais aglomeração | ↓ `repulsionStrength` | ↑ `repulsionStrength` |

### Performance vs Qualidade

| Cenário | Recomendação |
|---------|--------------|
| <50 partículas | Use valores altos de `repulsionStrength` |
| 50-100 partículas | Balanceie `repulsionStrength` com `maxSpeed` |
| >100 partículas | Considere reduzir contagem ou usar Canvas |

---

## 📊 Comparação de Configurações

| Caso de Uso | collisionRadius | repulsionStrength | maxSpeed | damping | minSpeed | noiseStrength |
|------------|-----------------|-------------------|----------|---------|----------|---------------|
| Background calmo | 14 | 0.8 | 0.5 | 0.998 | 0.05 | 0.008 |
| Demo interativa | 14 | 1.4 | 1.2 | 0.994 | 0.08 | 0.012 |
| Alta energia | 12 | 2.5 | 3.0 | 0.990 | 0.15 | 0.025 |
| Simulação orbital | 8 | 0.5 | 2.0 | 0.999 | 0.02 | 0.005 |
| Fluido denso | 10 | 3.0 | 0.8 | 0.992 | 0.10 | 0.015 |

---

## 🧪 Exemplos de Uso

### React

```tsx
import { usePhysicsParticles } from 'physaac';

function ParticleBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const particleRefs = useRef<(HTMLDivElement | null)[]>([]);
  
  usePhysicsParticles(50, containerRef, particleRefs, {
    collisionRadius: 14,
    repulsionStrength: 1.4,
    maxSpeed: 1.2,
    damping: 0.994,
    minSpeed: 0.08,
    noiseStrength: 0.012,
  });
  
  return (
    <div ref={containerRef} className="container">
      {Array.from({ length: 50 }).map((_, i) => (
        <div
          key={i}
          ref={el => particleRefs.current[i] = el}
          className="particle"
        />
      ))}
    </div>
  );
}
```

### Vanilla JS

```typescript
import { initializeParticles, tickParticles, applyParticlePositions } from 'physaac';

const container = document.getElementById('container');
const particles = initializeParticles(50, container.offsetWidth, container.offsetHeight, 14);
const elements = Array.from({ length: 50 }, (_, i) => 
  document.createElement('div')
);

elements.forEach(el => {
  el.className = 'particle';
  container.appendChild(el);
});

let frame = 0;
function tick() {
  tickParticles(particles, frame++, container.offsetWidth, container.offsetHeight, null, null, {
    collisionRadius: 14,
    repulsionStrength: 1.4,
    maxSpeed: 1.2,
    damping: 0.994,
    minSpeed: 0.08,
    noiseStrength: 0.012,
  });
  
  applyParticlePositions(particles, elements);
  requestAnimationFrame(tick);
}

tick();
```

---

## 📄 Links Relacionados

- [[PhysicsConcepts]] — explicação dos conceitos físicos
- [[IntegrationGuide]] — como integrar em diferentes frameworks
- [options.ts](../../src/engine/options.ts) — definições de tipos
- [tick-particles.ts](../../src/engine/tick-particles.ts) — implementação do loop
