# Conceitos Fundamentais

Este documento explica os conceitos matemáticos e físicos que fundamentam o motor Hadron. Entender estes conceitos é essencial para modificar o comportamento das partículas e criar efeitos personalizados.

## 1. A Partícula

### Estrutura de Dados

Uma partícula no Hadron é definida pela interface `Particle`:

```typescript
interface Particle {
  x: number;        // Posição horizontal (pixels)
  y: number;        // Posição vertical (pixels)
  vx: number;       // Velocidade horizontal (pixels/frame)
  vy: number;       // Velocidade vertical (pixels/frame)
  noiseSeed: number; // Semente única para ruído determinístico
}
```

**Importante**: A partícula não possui propriedades como massa, raio ou cor. O raio de colisão é definido globalmente nas opções, e a renderização (cor, tamanho visual) é responsabilidade do consumidor.

### Sistema de Coordenadas

- **Origem (0, 0)**: Canto superior esquerdo do container
- **Eixo X**: Cresce da esquerda para direita
- **Eixo Y**: Cresce de cima para baixo (padrão DOM/CSS)
- **Unidades**: Pixels para posição, pixels/frame para velocidade

---

## 2. Sequência de Halton - Distribuição Quasi-Aleatória

### O Problema do Aleatório Puro

Se usássemos `Math.random()` para posicionar partículas inicialmente, poderíamos ter aglomerações indesejadas (clusters) e regiões vazias. Isso ocorre porque o aleatório puro não garante distribuição uniforme em amostras pequenas.

### A Solução: Sequências de Baixa Discrepância

A **sequência de Halton** é uma sequência quasi-aleatória que produz pontos uniformemente distribuídos sem aglomerações. É determinística (sempre gera os mesmos valores para o mesmo índice) mas parece aleatória visualmente.

### Algoritmo da Sequência de Halton

```typescript
function halton(index: number, base: number): number {
  let f = 1, r = 0, i = index;
  while (i > 0) {
    f /= base;           // Divide o fator pela base
    r += f * (i % base); // Adiciona o dígito atual ponderado
    i = Math.floor(i / base); // Remove o dígito menos significativo
  }
  return r;
}
```

### Como Funciona - Exemplo Passo a Passo

Vamos calcular `halton(5, 2)` (índice 5, base 2):

| Iteração | i  | f      | i % base | Contribuição     | r acumulado |
|----------|----|--------|----------|------------------|-------------|
| Inicial  | 5  | 1      | -        | -                | 0           |
| 1        | 5  | 0.5    | 1        | 0.5 × 1 = 0.5    | 0.5         |
| 2        | 2  | 0.25   | 0        | 0.25 × 0 = 0     | 0.5         |
| 3        | 1  | 0.125  | 1        | 0.125 × 1 = 0.125 | 0.625      |
| Final    | 0  | -      | -        | -                | **0.625**   |

**Representação binária**: 5 = 101₂ → inverte-se para 0.101₂ = 0.625₁₀

### Primeiros Valores da Sequência de Halton (Base 2)

| Índice | Valor Halton | Representação Binária |
|--------|--------------|----------------------|
| 1      | 0.5          | 0.1₂                 |
| 2      | 0.25         | 0.01₂                |
| 3      | 0.75         | 0.11₂                |
| 4      | 0.125        | 0.001₂               |
| 5      | 0.625        | 0.101₂               |
| 6      | 0.375        | 0.011₂               |
| 7      | 0.875        | 0.111₂               |

### Uso no Hadron

O Hadron usa bases primas diferentes (2, 3, 5, 7, 11) para gerar valores independentes para cada propriedade:

```typescript
// Na inicialização de partículas
const x = margin + halton(i + 1, 2) * (width - margin * 2);
const y = margin + halton(i + 1, 3) * (height - margin * 2);
const angle = (i / count) * Math.PI * 2 + halton(i + 1, 5) * 1.2;
const speed = 0.3 + halton(i + 1, 7) * 0.5;
const noiseSeed = halton(i + 1, 11) * 100;
```

**Por que bases diferentes?** Usar bases primas diferentes garante que as sequências para X, Y, ângulo e velocidade sejam não correlacionadas, evitando padrões visíveis.

### Vantagens sobre Math.random()

| Característica | Math.random() | Halton |
|---------------|---------------|--------|
| Distribuição em amostras pequenas | Pode ter clusters | Uniforme |
| Reprodutibilidade | Não (seed aleatória) | Sim (determinístico) |
| Cobertura do espaço | Lacunas possíveis | Cobertura completa |
| Performance | Rápido | Rápido |

---

## 3. Ruído Suave Determinístico

### O Problema do Movimento Robótico

Se as partículas se movessem apenas com velocidade constante, o movimento pareceria artificial e robótico. Precisamos de variação suave e orgânica.

### Solução: Ruído Baseado em Seno

O Hadron usa uma função de ruído suave baseada em combinações de seno e cosseno:

```typescript
function smoothNoise(seed: number, t: number): number {
  return Math.sin(seed * 127.1 + t * 0.018) * 
         Math.cos(seed * 311.7 + t * 0.011);
}
```

### Características do Ruído

- **Retorno**: Valor entre -1 e 1
- **Determinístico**: Mesma seed + mesmo tempo = mesmo valor
- **Suave**: Variações graduais, sem saltos bruscos
- **Periódico longo**: Os coeficientes 127.1 e 311.7 são primos entre si, criando um período muito longo antes de repetir

### Como Funciona

A função combina duas ondas senoidais com frequências e fases diferentes:

1. **Primeira onda**: `sin(seed × 127.1 + t × 0.018)`
   - Frequência espacial: 127.1 (define quão diferente é para seeds próximas)
   - Frequência temporal: 0.018 (define quão rápido muda com o tempo)

2. **Segunda onda**: `cos(seed × 311.7 + t × 0.011)`
   - Frequência espacial: 311.7 (diferente da primeira para evitar padrões)
   - Frequência temporal: 0.011 (velocidade diferente da primeira)

3. **Multiplicação**: O produto das duas ondas cria interferência construtiva e destrutiva, gerando um padrão complexo e orgânico.

### Visualização do Comportamento

Para uma seed fixa, ao longo do tempo:
```
t=0:    sin(127.1×seed) × cos(311.7×seed) = valor inicial
t=100:  sin(127.1×seed + 1.8) × cos(311.7×seed + 1.1) = valor evoluído
t=1000: sin(127.1×seed + 18) × cos(311.7×seed + 11) = valor muito diferente
```

### Uso no Hadron

O ruído é aplicado em dois contextos:

1. **Thermal Noise**: Quando a partícula está quase parada, adiciona pequena força aleatória
   ```typescript
   p.vx += smoothNoise(p.noiseSeed, t) * noiseStrength;
   p.vy += smoothNoise(p.noiseSeed + 50, t) * noiseStrength;
   ```

2. **Impulso do Giroscópio**: Durante shake, direciona o impulso de forma orgânica
   ```typescript
   const angle = smoothNoise(p.noiseSeed * 3.7, t * 0.3) * Math.PI * 2;
   const impulse = shakeEnergy * 3.5;
   p.vx += Math.cos(angle) * impulse;
   p.vy += Math.sin(angle) * impulse;
   ```

---

## 4. Física de Forças

### Modelo de Integração de Euler

O Hadron usa integração de Euler simples para atualizar posições:

```typescript
// 1. Aplica forças à velocidade
vx += forçaX;
vy += forçaY;

// 2. Atualiza posição baseada na velocidade
x += vx;
y += vy;
```

**Vantagens**: Simples, rápido, suficiente para animações visuais
**Desvantagens**: Menos preciso que métodos como Verlet ou Runge-Kutta (mas irrelevante para este caso de uso)

### Damping (Amortecimento)

O damping simula resistência do ar ou atrito, reduzindo gradualmente a velocidade:

```typescript
p.vx *= damping;  // damping típico: 0.994
p.vy *= damping;
```

**Interpretação**:
- `damping = 1.0`: Sem amortecimento (movimento perpétuo)
- `damping = 0.994`: Perde 0.6% da velocidade por frame
- `damping = 0.9`: Perde 10% da velocidade por frame (muito lento)
- `damping = 0.5`: Perde 50% da velocidade por frame (para rapidamente)

**Damping Adaptativo**: Durante shake (giroscópio ativo), o damping é reduzido temporariamente:
```typescript
const adaptiveDamping = shakeEnergy > 0.002 ? damping * 0.97 : damping;
```
Isso permite que as partículas se movam mais livremente durante agitação.

### Clamp de Velocidade (Velocidade Máxima)

Para evitar que partículas acelerem indefinidamente, aplica-se um limite máximo:

```typescript
const speed = Math.sqrt(vx * vx + vy * vy);
if (speed > maxSpeed) {
  vx = (vx / speed) * maxSpeed;  // Normaliza e escala
  vy = (vy / speed) * maxSpeed;
}
```

**Matemática**:
1. Calcula magnitude da velocidade: `speed = √(vx² + vy²)`
2. Se exceder `maxSpeed`, normaliza o vetor (divide pela magnitude)
3. Multiplica pelo `maxSpeed` desejado

Isso preserva a direção mas limita a magnitude.

### Thermal Noise (Ruído Térmico)

Inspired by Brownian motion, thermal noise keeps particles moving even when they would otherwise stop:

```typescript
const speed = Math.sqrt(vx * vx + vy * vy);
if (speed < minSpeed) {
  vx += smoothNoise(noiseSeed, t) * noiseStrength;
  vy += smoothNoise(noiseSeed + 50, t) * noiseStrength;
}
```

**Propósito**: Evita que partículas "congelem" completamente, mantendo movimento orgânico mínimo.

**Parâmetros típicos**:
- `minSpeed = 0.08`: Abaixo disso, aplica noise
- `noiseStrength = 0.012`: Intensidade da força aplicada

---

## 5. Repulsão Entre Partículas

### Conceito Físico

Partículas próximas exercem força repulsiva entre si, simulando uma espécie de "campo de força" ou carga elétrica similar.

### Algoritmo de Repulsão

```typescript
for (let i = 0; i < particles.length; i++) {
  for (let j = i + 1; j < particles.length; j++) {
    const dx = particles[j].x - particles[i].x;
    const dy = particles[j].y - particles[i].y;
    const distSq = dx * dx + dy * dy;
    
    // Distância mínima para colisão (diâmetro = 2 × raio)
    const minDistSq = (collisionRadius * 2) ** 2;
    
    if (distSq < minDistSq && distSq > 0) {
      const dist = Math.sqrt(distSq);
      
      // Força aumenta linearmente conforme se aproxima
      const force = (repulsionStrength * (collisionRadius * 2 - dist)) / dist;
      
      const fx = dx * force;
      const fy = dy * force;
      
      // Aplica força oposta às duas partículas (3ª Lei de Newton)
      particles[i].vx -= fx;
      particles[i].vy -= fy;
      particles[j].vx += fx;
      particles[j].vy += fy;
    }
  }
}
```

### Análise da Fórmula de Força

```
force = (repulsionStrength × (2R - dist)) / dist
```

Onde:
- `R` = collisionRadius
- `dist` = distância entre centros
- `repulsionStrength` = constante de proporcionalidade

**Comportamento**:

| Distância | Força | Explicação |
|-----------|-------|------------|
| `dist = 2R` (tocando) | 0 | No limite, força é zero |
| `dist = R` (sobreposição 50%) | repulsionStrength × R / R = repulsionStrength | Força média |
| `dist → 0` (quase mesmo ponto) | → ∞ | Força explode (evitado por distSq > 0) |

**Por que dividir por `dist`?** Para normalizar a direção. O vetor `(dx, dy)` tem magnitude `dist`, então dividindo por `dist` obtemos um vetor unitário na direção correta.

### Complexidade Computacional

O algoritmo de repulsão é **O(n²)** porque compara cada par de partículas:

- 10 partículas: 45 comparações
- 50 partículas: 1.225 comparações
- 100 partículas: 4.950 comparações
- 500 partículas: 124.750 comparações

**Otimização possível**: Para muitas partículas (>500), poderia usar spatial hashing (grid) para reduzir para O(n), mas para o caso de uso típico (<100 partículas), O(n²) é aceitável.

### Terceira Lei de Newton

Note que a força é aplicada igualmente e em direções opostas:
```typescript
particles[i].vx -= fx;  // Partícula i é empurrada para trás
particles[j].vx += fx;  // Partícula j é empurrada para frente
```

Isso conserva o momento linear do sistema (em teoria, ignorando damping).

---

## 6. Colisão com Bordas

### Detecção de Colisão

Uma partícula colide com uma borda quando sua posição ± raio ultrapassa o limite:

```typescript
const margin = collisionRadius + 2;

// Borda esquerda
if (p.x < margin) {
  p.x = margin;           // Corrige posição
  p.vx = Math.abs(p.vx);  // Inverte velocidade (sempre positiva)
}

// Borda direita
if (p.x > containerWidth - margin) {
  p.x = containerWidth - margin;
  p.vx = -Math.abs(p.vx);  // Inverte velocidade (sempre negativa)
}

// Borda superior
if (p.y < margin) {
  p.y = margin;
  p.vy = Math.abs(p.vy);
}

// Borda inferior
if (p.y > containerHeight - margin) {
  p.y = containerHeight - margin;
  p.vy = -Math.abs(p.vy);
}
```

### Por que `Math.abs()`?

Usar `Math.abs()` garante que após a colisão:
- Na esquerda/topo: velocidade seja positiva (afastando da borda)
- Na direita/baixo: velocidade seja negativa (afastando da borda)

Isso evita um bug comum onde a partícula fica "presa" na borda se a velocidade for muito baixa.

### Margem de Segurança

O `+ 2` na margem (`collisionRadius + 2`) é um pequeno buffer para evitar que partículas visualmente ultrapassem a borda devido a arredondamentos.

---

## 7. Colisão com Obstáculos

### Representação de Obstáculos

Obstáculos são retângulos definidos por:
```typescript
interface ObstacleRect {
  x: number;  // Posição X do canto superior esquerdo
  y: number;  // Posição Y do canto superior esquerdo
  w: number;  // Largura
  h: number;  // Altura
}
```

### Detecção de Colisão AABB-Círculo

A detecção verifica se o círculo da partícula intersecta o retângulo do obstáculo:

```typescript
if (
  p.x + r > obs.x && p.x - r < obs.x + obs.w &&  // Sobreposição horizontal
  p.y + r > obs.y && p.y - r < obs.y + obs.h     // Sobreposição vertical
) {
  // Colisão detectada
}
```

### Resolução de Colisão

Quando detectada colisão, determina-se qual lado foi atingido calculando a sobreposição mínima:

```typescript
const overlapLeft  = (p.x + r) - obs.x;           // Quanto penetrou pela esquerda
const overlapRight = (obs.x + obs.w) - (p.x - r); // Quanto penetrou pela direita
const overlapTop   = (p.y + r) - obs.y;           // Quanto penetrou por cima
const overlapBot   = (obs.y + obs.h) - (p.y - r); // Quanto penetrou por baixo

const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBot);

if (minOverlap === overlapLeft) {
  p.x = obs.x - r;      // Move para fora pela esquerda
  p.vx = -Math.abs(p.vx); // Inverte velocidade horizontal
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
```

### Diagrama de Colisão

```
┌─────────────────────────┐
│    Container            │
│                         │
│   ┌───────────┐         │
│   │ Obstáculo │         │
│   │           │    ●←   │  Partícula colidindo pela direita
│   └───────────┘         │
│                         │
│              ●↓         │  Partícula colidindo por baixo
│                         │
└─────────────────────────┘
```

---

[Próximo: API Reference - Opções e Configuração](./03-api-opcoes.md)
