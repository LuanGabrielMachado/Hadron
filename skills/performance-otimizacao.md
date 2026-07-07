# Performance e Otimização

## Descrição
Otimização de código para animações em tempo real com target de 60 FPS, minimizando alocações de memória, GC pressure e re-renders desnecessários.

## Evidências no Projeto

### 1. Zero Re-Renders no React
```typescript
// Atualização direta do DOM via refs
for (let i = 0; i < particles.length; i++) {
  const el = particleRefs.current?.[i];
  if (el) {
    el.style.left = `${particles[i].x}px`;
    el.style.top = `${particles[i].y}px`;
  }
}
// Zero chamadas de setState = zero re-renders
```

### 2. Evitando Math.sqrt Desnecessário
```typescript
const distSq = dx * dx + dy * dy;
const minDistSq = (collisionRadius * 2) ** 2;

// Só calcula sqrt se realmente precisar da distância exata
if (distSq < minDistSq && distSq > 0) {
  const dist = Math.sqrt(distSq);
  // Calcula força usando dist
}
```

### 3. Loop O(n²) Otimizado
```typescript
// Itera apenas pares únicos (i, j) onde j > i
for (let i = 0; i < particles.length; i++) {
  for (let j = i + 1; j < particles.length; j++) {
    // Calcula força UMA vez e aplica em ambos
    particles[i].vx -= fx;
    particles[i].vy -= fy;
    particles[j].vx += fx;
    particles[j].vy += fy;
  }
}
// Economia: 50% menos iterações vs loop completo
```

### 4. Mutação Controlada vs Imutabilidade
```typescript
// MUTAÇÃO PERMITIDA: partículas são estado transitório
p.x += p.vx;  // mutação direta, sem criar novo objeto

// IMUTÁVEL: options é apenas lido
const damping = options.damping ?? DEFAULT_DAMPING;
```

**Justificativa:**
- Criar novos objetos a cada frame causaria GC pressure
- Partículas são atualizadas 60x/segundo
- Mutação é segura porque é interna e documentada

### 5. Threshold para Operações Caras
```typescript
// Só processa repulsão se partículas estão próximas
const threshold = collisionRadius * 2;
if (dist < threshold) {
  // Calcula força repulsiva
}

// Deadzone filtering para sensor
const shakeEnergy = Math.sqrt(extFx * extFx + extFy * extFy);
if (shakeEnergy < DEADZONE_THRESHOLD) {
  return { fx: 0, fy: 0 }; // ignora ruído
}
```

### 6. Cleanup de Listeners e RAF
```typescript
useEffect(() => {
  rafRef.current = requestAnimationFrame(tick);
  
  return () => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
    }
  };
}, []);

// Evita memory leaks e múltiplos loops rodando
```

### 7. Singleton para Device Motion
```typescript
let listenerActive = false;

export function startDeviceMotion(): void {
  if (listenerActive) return; // evita múltiplos listeners
  // ... adiciona listener único
  listenerActive = true;
}
```

## Métricas de Performance

| Métrica | Target | Estratégia |
|---------|--------|------------|
| Frame Time | <16ms (60 FPS) | Hot path otimizado |
| Partículas (DOM) | <100 | Acima disso, usar Canvas |
| Alocações/frame | Zero | Mutação controlada |
| Memory Leaks | Zero | Cleanup de RAF/listeners |
| Re-renders React | Zero | Atualização direta do DOM |

## Competências Demonstradas

- ✅ Profiling mental de hot paths
- ✅ Otimização de operações matemáticas
- ✅ Gerenciamento de memória em loops críticos
- ✅ Pattern de mutation vs immutability
- ✅ Lazy evaluation e thresholds
- ✅ Cleanup de recursos (RAF, listeners)
- ✅ Singleton para recursos compartilhados

## Nível
**Avançado** - Otimizações específicas para gráficos em tempo real e animações 60 FPS

## Ferramentas e Técnicas
- RequestAnimationFrame para sync com refresh rate
- Refs estáveis para evitar re-renders
- Nullish coalescing para defaults performáticos
- Spatial hashing (documentado como extensão futura)
