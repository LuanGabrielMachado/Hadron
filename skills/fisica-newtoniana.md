# Física Newtoniana para Animações

## Descrição
Implementação de física clássica simplificada para animações em tempo real, incluindo integração de Euler, forças, damping e colisões.

## Evidências no Projeto

### 1. Integração de Euler
Atualização de posição baseada em velocidade por frame:

```typescript
p.x += p.vx;
p.y += p.vy;
```

### 2. Sistema de Forças Múltiplas
- **Repulsão entre partículas**: força inversamente proporcional à distância
- **Damping**: resistência do ar (0.994 por frame)
- **Thermal Noise**: força aleatória suave via smoothNoise()
- **Força externa**: giroscópio/DeviceMotion
- **Gravidade simulada**: bounce nas bordas

### 3. Detecção e Resolução de Colisões
- Colisão partícula-partícula com threshold de distância
- Colisão partícula-obstáculo retangular
- Bounce elástico nas bordas do container
- Resolução de overlap mínimo

```typescript
const distSq = dx * dx + dy * dy;
const minDistSq = (collisionRadius * 2) ** 2;

if (distSq < minDistSq && distSq > 0) {
  const dist = Math.sqrt(distSq);
  const force = (repulsionStrength * (collisionRadius * 2 - dist)) / dist;
  // Aplica força repulsiva
}
```

### 4. Otimizações Matemáticas
- Evita `Math.sqrt` desnecessário comparando quadrados
- Loop O(n²) otimizado iterando apenas pares únicos (i, j>i)
- Deadzone filtering para ruído de sensor

## Competências Demonstradas

- ✅ Integração numérica (Euler)
- ✅ Cálculo vetorial 2D
- ✅ Detecção de colisão círculo-círculo e círculo-retângulo
- ✅ Resolução de colisões com conservação de momentum
- ✅ Filtering de sinal (deadzone, média móvel)
- ✅ Otimização de operações matemáticas críticas

## Nível
**Intermediário-Avançado** - Física aplicada a gráficos em tempo real com otimizações de performance

## Referências
- Euler Integration para animações
- Sequência de Halton para distribuição quasi-aleatória
- Smooth noise determinístico baseado em seno/cosseno
