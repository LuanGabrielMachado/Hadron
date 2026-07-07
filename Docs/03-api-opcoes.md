# API Reference - Opções e Configuração

Este documento detalha todas as opções de configuração disponíveis no Hadron, explicando o propósito de cada uma, valores típicos, e como alterá-las para modificar o comportamento das partículas.

## Interface PhysicsOptions

```typescript
interface PhysicsOptions {
  collisionRadius?: number;      // Raio de colisão entre partículas (px)
  repulsionStrength?: number;    // Força de repulsão entre partículas
  maxSpeed?: number;             // Velocidade máxima (px/frame)
  damping?: number;              // Amortecimento por frame (0–1)
  minSpeed?: number;             // Velocidade mínima — abaixo injeta thermal noise
  noiseStrength?: number;        // Intensidade do thermal noise
  externalForceRef?: { current: ExternalForce | null };
  obstaclesRef?: { current: ObstacleRect[] | null };
}
```

---

## 1. collisionRadius

### Descrição

Define o raio de colisão das partículas em pixels. Este valor determina:
- Quão perto as partículas podem chegar umas das outras antes de se repelirem
- O tamanho da "zona de exclusão" ao redor de cada partícula
- A margem usada para colisão com bordas e obstáculos

**Importante**: Este é um valor de física, não necessariamente o tamanho visual da partícula. Você pode renderizar a partícula com qualquer tamanho visual independente deste valor.

### Valor Padrão

```typescript
DEFAULT_COLLISION_RADIUS = 14
```

### Unidade

Pixels

### Faixa Recomendada

- **Mínimo prático**: 5 (partículas muito pequenas)
- **Típico**: 10–20 (bom equilíbrio)
- **Máximo prático**: 50 (partículas grandes, muitas colisões)

### Como Afeta o Comportamento

| Valor | Efeito Visual | Performance |
|-------|--------------|-------------|
| 5 | Partículas podem se aproximar muito, movimento mais caótico | Mais rápido (menos colisões detectadas) |
| 14 | Equilíbrio natural, movimento orgânico | Bom |
| 30 | Partículas se mantêm distantes, movimento mais espaçado | Mais lento (mais colisões detectadas) |

### Exemplo de Uso

```typescript
// Partículas menores e mais ágeis
const options: PhysicsOptions = {
  collisionRadius: 8
};

// Partículas grandes tipo "bolhas"
const options: PhysicsOptions = {
  collisionRadius: 25
};
```

### Fórmula Relacionada

A distância mínima para ativação da repulsão é:
```
distânciaMinima = collisionRadius × 2
```

Para `collisionRadius = 14`, a repulsão começa a atuar quando as partículas estão a 28px de distância (centro a centro).

### Dicas de Ajuste

1. **Relacione com o tamanho visual**: Se você renderiza círculos de 28px de diâmetro, use `collisionRadius = 14` para correspondência perfeita.

2. **Considere o número de partículas**: Com muitas partículas (>100), um raio menor reduz cálculos de colisão.

3. **Espaçamento desejado**: Quer partículas bem separadas? Aumente o raio. Quer aglomeração? Diminua.

---

## 2. repulsionStrength

### Descrição

Controla a intensidade da força repulsiva entre partículas quando elas se aproximam demais. Valores maiores criam repulsão mais forte e rápida.

### Valor Padrão

```typescript
DEFAULT_REPULSION_STRENGTH = 1.4
```

### Unidade

Unidades arbitrárias de força (aceleração por frame)

### Faixa Recomendada

- **Mínimo**: 0.1 (repulsão muito suave)
- **Típico**: 0.5–2.0 (movimento natural)
- **Alto**: 3.0–5.0 (repulsão agressiva, quase elástica)
- **Extremo**: >5.0 (partículas "explodem" ao se tocar)

### Como Afeta o Comportamento

| Valor | Efeito Visual |
|-------|--------------|
| 0.1 | Partículas quase se sobrepõem, movimento suave |
| 0.5 | Repulsão sutil, boa para multidões densas |
| 1.4 | Equilíbrio natural (padrão) |
| 3.0 | Partículas saltam rapidamente ao se aproximar |
| 5.0 | Colisões quase elásticas, alta energia |

### Fórmula da Força de Repulsão

```typescript
force = (repulsionStrength × (2R - dist)) / dist
```

Onde:
- `R` = collisionRadius
- `dist` = distância atual entre partículas
- `2R - dist` = quanto falta para tocar (quanto menor a distância, maior este valor)

### Exemplo de Uso

```typescript
// Movimento suave, tipo cardume de peixes
const options: PhysicsOptions = {
  collisionRadius: 14,
  repulsionStrength: 0.5
};

// Partículas energéticas tipo bolas de pingue-pongue
const options: PhysicsOptions = {
  collisionRadius: 14,
  repulsionStrength: 3.0
};

// Simulação de cargas elétricas similares
const options: PhysicsOptions = {
  collisionRadius: 14,
  repulsionStrength: 5.0
};
```

### Interação com Outros Parâmetros

- **damping**: Repulsão alta + damping baixo = movimento muito energético
- **maxSpeed**: Repulsão alta pode precisar de maxSpeed maior para não ser desperdiçada
- **collisionRadius**: Aumentar o raio sem aumentar a força pode resultar em colisões "moles"

### Dicas de Ajuste

1. **Comece com 1.4** e ajuste conforme necessário.

2. **Observe a velocidade pós-colisão**: Se as partículas param muito após colidir, aumente a força.

3. **Combine com damping**: Para colisões realistas, use repulsionStrength alto com damping próximo de 1.0.

---

## 3. maxSpeed

### Descrição

Define a velocidade máxima absoluta que uma partícula pode atingir, em pixels por frame. Atua como um limitador (clamp) aplicado após todas as forças.

### Valor Padrão

```typescript
DEFAULT_MAX_SPEED = 1.2
```

### Unidade

Pixels por frame

### Contexto de Tempo

Considerando 60 FPS (frames por segundo):
- `1.2 px/frame` = `72 px/segundo`
- `0.5 px/frame` = `30 px/segundo`
- `3.0 px/frame` = `180 px/segundo`

### Faixa Recomendada

- **Muito lento**: 0.1–0.3 (movimento quase imperceptível)
- **Lento**: 0.3–0.8 (relaxante, meditativo)
- **Normal**: 0.8–2.0 (movimento natural)
- **Rápido**: 2.0–5.0 (energético, dinâmico)
- **Muito rápido**: >5.0 (pode causar tunneling em colisões)

### Como Afeta o Comportamento

| Valor | Efeito Visual |
|-------|--------------|
| 0.3 | Movimento lento, calmo, quase hipnótico |
| 0.8 | Passeio relaxante pelo container |
| 1.2 | Velocidade padrão, equilibrada |
| 3.0 | Partículas rápidas, chamativas |
| 8.0 | Movimento frenético, difícil de acompanhar |

### Algoritmo de Clamp

```typescript
const speed = Math.sqrt(vx * vx + vy * vy);
if (speed > maxSpeed) {
  // Normaliza o vetor velocidade e escala para maxSpeed
  vx = (vx / speed) * maxSpeed;
  vy = (vy / speed) * maxSpeed;
}
```

**Nota**: Isso preserva a direção exata, apenas reduz a magnitude.

### Exemplo de Uso

```typescript
// Animação de fundo calma para site corporativo
const options: PhysicsOptions = {
  maxSpeed: 0.5,
  damping: 0.998
};

// Jogo interativo responsivo
const options: PhysicsOptions = {
  maxSpeed: 4.0,
  damping: 0.99,
  repulsionStrength: 2.5
};

// Demo técnica mostrando capacidade do motor
const options: PhysicsOptions = {
  maxSpeed: 10.0,
  damping: 0.995
};
```

### Problema de Tunneling

Com velocidades muito altas, partículas podem "atravessar" barreiras:

```
Frame N:   partícula em x=25, velocidade=15 → próxima posição seria x=40
Frame N+1: obstáculo começa em x=30
Resultado: partícula atravessou o obstáculo!
```

**Solução**: Mantenha `maxSpeed < collisionRadius` para evitar tunneling significativo.

### Relação com Refresh Rate

Se seu animation rodar a diferentes FPS, a velocidade efetiva muda:

| FPS | maxSpeed=1.2 resulta em |
|-----|------------------------|
| 30  | 36 px/segundo |
| 60  | 72 px/segundo |
| 120 | 144 px/segundo |

Para movimento consistente independente do FPS, considere ajustar dinamicamente.

---

## 4. damping

### Descrição

Fator de amortecimento aplicado à velocidade a cada frame. Simula resistência do ar, atrito ou viscosidade do meio.

### Valor Padrão

```typescript
DEFAULT_DAMPING = 0.994
```

### Unidade

Fator multiplicativo adimensional (0 a 1)

### Interpretação Física

Após `n` frames sem aceleração, a velocidade restante é:
```
velocidadeFinal = velocidadeInicial × damping^n
```

Exemplo com `damping = 0.994`:
- Após 1 frame: 99.4% da velocidade original
- Após 10 frames: 94.2%
- Após 100 frames: 54.6%
- Após 200 frames: 29.8%

### Faixa Recomendada

- **Sem atrito**: 1.0 (movimento perpétuo, cuidado!)
- **Baixo atrito**: 0.995–0.999 (gelo, espaço)
- **Atrito normal**: 0.990–0.995 (ar, água leve)
- **Alto atrito**: 0.950–0.990 (óleo, mel)
- **Atrito extremo**: 0.900–0.950 (para rapidamente)
- **Congelante**: <0.900 (quase imóvel)

### Como Afeta o Comportamento

| Valor | Frames para reduzir a 50% | Sensação |
|-------|--------------------------|----------|
| 1.000 | ∞ (nunca) | Espaço sideral, patins no gelo |
| 0.999 | ~693 frames (~11s a 60fps) | Muito escorregadio |
| 0.994 | ~115 frames (~2s a 60fps) | Ar, movimento natural |
| 0.990 | ~69 frames (~1.2s) | Água |
| 0.980 | ~34 frames (~0.6s) | Óleo leve |
| 0.950 | ~13 frames (~0.2s) | Mel |
| 0.900 | ~6 frames (~0.1s) | Areia movediça |

### Damping Adaptativo

Durante shake (giroscópio ativo), o damping é temporariamente reduzido:

```typescript
const adaptiveDamping = shakeEnergy > 0.002 ? damping * 0.97 : damping;
```

Com `damping = 0.994`:
- Normal: 0.994
- Durante shake: 0.994 × 0.97 = 0.964 (mais deslizante)

Isso permite que as partículas respondam mais dramaticamente ao movimento do dispositivo.

### Exemplo de Uso

```typescript
// Movimento quase perpétuo (tipo espaço)
const options: PhysicsOptions = {
  damping: 0.999,
  minSpeed: 0.01,  // Necessário para não parar completamente
  noiseStrength: 0.02
};

// Movimento natural no ar
const options: PhysicsOptions = {
  damping: 0.994
};

// Partículas em líquido viscoso
const options: PhysicsOptions = {
  damping: 0.970,
  maxSpeed: 0.8,
  repulsionStrength: 0.8
};

// Resposta dramática ao giroscópio
const options: PhysicsOptions = {
  damping: 0.985,  // Um pouco mais baixo que o normal
  repulsionStrength: 2.0
};
```

### Cálculo de Tempo de Parada

Para estimar quanto tempo leva para uma partícula parar (atingir `minSpeed`):

```typescript
const framesParaParar = Math.log(minSpeed / velocidadeInicial) / Math.log(damping);
const segundosParaParar = framesParaParar / 60;
```

Exemplo: `velocidadeInicial = 2.0`, `minSpeed = 0.08`, `damping = 0.994`
```
frames = Math.log(0.08 / 2.0) / Math.log(0.994)
       = Math.log(0.04) / Math.log(0.994)
       = -3.219 / -0.006
       = 536 frames
segundos = 536 / 60 = ~9 segundos
```

---

## 5. minSpeed

### Descrição

Limiar de velocidade abaixo do qual o thermal noise é aplicado. Previne que partículas parem completamente, mantendo movimento orgânico mínimo.

### Valor Padrão

```typescript
DEFAULT_MIN_SPEED = 0.08
```

### Unidade

Pixels por frame (magnitude do vetor velocidade)

### Faixa Recomendada

- **Desativado**: 0 (partículas podem parar completamente)
- **Muito baixo**: 0.01–0.05 (quase parado, tremor mínimo)
- **Normal**: 0.05–0.15 (movimento browniano sutil)
- **Alto**: 0.15–0.30 (sempre em movimento perceptível)
- **Muito alto**: >0.30 (nunca para, pode parecer artificial)

### Como Funciona

```typescript
const speed = Math.sqrt(vx * vx + vy * vy);
if (speed < minSpeed) {
  // Aplica thermal noise para manter movimento
  vx += smoothNoise(noiseSeed, t) * noiseStrength;
  vy += smoothNoise(noiseSeed + 50, t) * noiseStrength;
}
```

### Interação com damping

O damping constantemente reduz a velocidade. Sem `minSpeed` + `noiseStrength`, eventualmente todas as partículas parariam:

```
Frame 0:   speed = 1.2
Frame 100: speed = 0.66  (com damping 0.994)
Frame 200: speed = 0.36
Frame 300: speed = 0.20
Frame 400: speed = 0.11
Frame 500: speed = 0.06  ← Abaixo de minSpeed! Thermal noise ativa.
```

### Exemplo de Uso

```typescript
// Partículas podem descansar completamente
const options: PhysicsOptions = {
  minSpeed: 0,
  noiseStrength: 0
};

// Movimento browniano sutil (tipo pólen na água)
const options: PhysicsOptions = {
  minSpeed: 0.08,
  noiseStrength: 0.012,
  damping: 0.994
};

// Sempre em movimento ativo
const options: PhysicsOptions = {
  minSpeed: 0.25,
  noiseStrength: 0.03,
  damping: 0.990
};
```

### Cálculo da Velocidade Atual

Para depurar ou ajustar, você pode calcular a velocidade de uma partícula:

```typescript
function getParticleSpeed(p: Particle): number {
  return Math.sqrt(p.vx * p.vx + p.vy * p.vy);
}

// Verifica se thermal noise está ativo
const speed = getParticleSpeed(particle);
const noiseAtivo = speed < minSpeed;
```

---

## 6. noiseStrength

### Descrição

Intensidade da força aplicada pelo thermal noise quando a velocidade está abaixo de `minSpeed`. Controla quão vigorosamente o ruído empurra a partícula.

### Valor Padrão

```typescript
DEFAULT_NOISE_STRENGTH = 0.012
```

### Unidade

Pixels por frame² (aceleração)

### Faixa Recomendada

- **Nenhum**: 0 (sem thermal noise)
- **Muito sutil**: 0.001–0.005 (tremor quase imperceptível)
- **Sutil**: 0.005–0.015 (movimento browniano natural)
- **Moderado**: 0.015–0.030 (movimento orgânico claro)
- **Forte**: 0.030–0.050 (agitação constante)
- **Extremo**: >0.050 (vibração intensa)

### Como Afeta o Comportamento

| Valor | Efeito Visual |
|-------|--------------|
| 0 | Partículas param completamente se damping for alto |
| 0.005 | Tremor sutil, quase imperceptível |
| 0.012 | Movimento browniano natural (padrão) |
| 0.025 | Agitação orgânica clara |
| 0.050 | Vibração constante, energética |

### Aplicação do Noise

O noise é aplicado separadamente em X e Y com seeds diferentes:

```typescript
vx += smoothNoise(noiseSeed, t) * noiseStrength;
vy += smoothNoise(noiseSeed + 50, t) * noiseStrength;
```

Como `smoothNoise` retorna valores entre -1 e 1:
- Força máxima aplicada: ±`noiseStrength` por eixo
- Força resultante máxima: `noiseStrength × √2` (diagonal)

### Exemplo de Uso

```typescript
// Sem movimento residual
const options: PhysicsOptions = {
  minSpeed: 0,
  noiseStrength: 0
};

// Poeira flutuando em raio de sol
const options: PhysicsOptions = {
  minSpeed: 0.05,
  noiseStrength: 0.008,
  damping: 0.996
};

// Partículas em ebulição
const options: PhysicsOptions = {
  minSpeed: 0.15,
  noiseStrength: 0.04,
  damping: 0.985
};
```

### Combinação com minSpeed

Estes dois parâmetros trabalham juntos:

| minSpeed | noiseStrength | Resultado |
|----------|---------------|-----------|
| 0 | Qualquer | Thermal noise nunca ativa |
| 0.08 | 0 | Partículas param em 0.08 px/frame |
| 0.08 | 0.012 | Mantém movimento browniano sutil |
| 0.20 | 0.030 | Sempre em movimento ativo |

---

## 7. externalForceRef

### Descrição

Referência para uma força externa aplicada uniformemente a todas as partículas a cada frame. Usada principalmente para integrar com o giroscópio (DeviceMotion), mas pode ser usada para qualquer força externa personalizada.

### Tipo

```typescript
externalForceRef?: { current: ExternalForce | null | undefined }

interface ExternalForce {
  fx: number;  // Força no eixo X
  fy: number;  // Força no eixo Y
}
```

### Valor Típico do Giroscópio

Quando conectado ao DeviceMotion:
- `fx`, `fy`: Tipicamente entre -0.022 e 0.022
- Valores positivos/negativos dependem da direção da inclinação

### Como Funciona

A força externa é aplicada de duas formas:

1. **Diretamente** (quando shakeEnergy é baixo):
   ```typescript
   // Força direta adicionada à velocidade
   p.vx += extFx;
   p.vy += extFy;
   ```

2. **Como gatilho para impulso** (quando shakeEnergy > 0.001):
   ```typescript
   const shakeEnergy = Math.sqrt(extFx * extFx + extFy * extFy);
   if (shakeEnergy > 0.001) {
     const angle = smoothNoise(p.noiseSeed * 3.7, t * 0.3) * Math.PI * 2;
     const impulse = shakeEnergy * 3.5;
     p.vx += Math.cos(angle) * impulse;
     p.vy += Math.sin(angle) * impulse;
   }
   ```

### Exemplo de Uso com Giroscópio

```typescript
import { useDeviceMotion } from 'physaac/react';
import { usePhysicsParticles } from 'physaac/react';

function MeuComponente() {
  const motionRef = useDeviceMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const particleRefs = useRef<(HTMLDivElement | null)[]>([]);
  
  usePhysicsParticles(
    50,  // count
    containerRef,
    particleRefs,
    {
      externalForceRef: motionRef,
      // ... outras opções
    }
  );
  
  return <div ref={containerRef}>...</div>;
}
```

### Exemplo de Uso Personalizado

```typescript
// Força gravitacional simulada (puxa para baixo)
const gravityRef = useRef({ fx: 0, fy: 0.005 });

usePhysicsParticles(count, containerRef, particleRefs, {
  externalForceRef: gravityRef,
  damping: 0.998  // Menos damping para gravidade ser perceptível
});

// Força de vento (puxa para direita)
const windRef = useRef({ fx: 0.003, fy: 0 });

// Força dinâmica (muda com o tempo)
const dynamicForceRef = useRef({ fx: 0, fy: 0 });

useEffect(() => {
  const interval = setInterval(() => {
    const t = Date.now() / 1000;
    dynamicForceRef.current = {
      fx: Math.sin(t) * 0.01,
      fy: Math.cos(t * 0.5) * 0.01
    };
  }, 100);
  return () => clearInterval(interval);
}, []);
```

### Shake Energy Threshold

O sistema calcula a energia do shake:
```typescript
const shakeEnergy = Math.sqrt(fx * fx + fy * fy);
```

Thresholds importantes:
- `> 0.001`: Ativa impulso do giroscópio
- `> 0.002`: Ativa damping adaptativo (reduz para 97%)

---

## 8. obstaclesRef

### Descrição

Referência para um array de retângulos que atuam como obstáculos. Partículas ricocheteiam nestas zonas de exclusão.

### Tipo

```typescript
obstaclesRef?: { current: ObstacleRect[] | null | undefined }

interface ObstacleRect {
  x: number;  // Posição X do canto superior esquerdo
  y: number;  // Posição Y do canto superior esquerdo
  w: number;  // Largura em pixels
  h: number;  // Altura em pixels
}
```

### Coordenadas

As coordenadas são **relativas ao container**, não à tela. Se o container tem `position: relative`, os obstáculos devem usar coordenadas dentro desse contexto.

### Exemplo de Uso

```typescript
const obstaclesRef = useRef<ObstacleRect[]>([
  { x: 100, y: 100, w: 50, h: 50 },   // Quadrado no centro
  { x: 200, y: 50, w: 100, h: 20 },   // Retângulo horizontal
]);

usePhysicsParticles(count, containerRef, particleRefs, {
  obstaclesRef,
  collisionRadius: 14
});
```

### Exemplo com Obstáculos Dinâmicos

```typescript
const [obstacles, setObstacles] = useState<ObstacleRect[]>([]);

// Adicionar obstáculo onde o usuário clicar
const handleClick = (e: React.MouseEvent) => {
  const rect = containerRef.current?.getBoundingClientRect();
  if (!rect) return;
  
  const newObstacle: ObstacleRect = {
    x: e.clientX - rect.left - 25,  // Centraliza no clique
    y: e.clientY - rect.top - 25,
    w: 50,
    h: 50
  };
  
  setObstacles(prev => [...prev, newObstacle]);
};

// Atualizar ref quando obstacles mudar
useEffect(() => {
  obstaclesRef.current = obstacles;
}, [obstacles]);
```

### Comportamento de Colisão

Quando uma partícula colide com um obstáculo:
1. É reposicionada para fora do obstáculo (no lado de menor sobreposição)
2. Sua velocidade é invertida no eixo da colisão
3. Continua movendo-se normalmente

### Limitações

- Obstáculos não se sobrepõem automaticamente (cuidado com sobreposições)
- Obstáculos muito pequenos (< collisionRadius × 2) podem ter comportamento estranho
- Muitas partículas + muitos obstáculos = performance reduzida

---

## Resumo dos Valores Padrão

| Parâmetro | Valor Padrão | Descrição Curta |
|-----------|--------------|-----------------|
| collisionRadius | 14 | Raio de colisão em pixels |
| repulsionStrength | 1.4 | Força de repulsão entre partículas |
| maxSpeed | 1.2 | Velocidade máxima (px/frame) |
| damping | 0.994 | Amortecimento por frame |
| minSpeed | 0.08 | Limiar para thermal noise |
| noiseStrength | 0.012 | Intensidade do thermal noise |
| externalForceRef | null | Força externa (ex: giroscópio) |
| obstaclesRef | null | Array de obstáculos retangulares |

---

## Receitas de Configuração

### 1. Partículas Calmas (Animação de Fundo)

```typescript
const calmOptions: PhysicsOptions = {
  collisionRadius: 12,
  repulsionStrength: 0.8,
  maxSpeed: 0.5,
  damping: 0.996,
  minSpeed: 0.05,
  noiseStrength: 0.008
};
```

### 2. Partículas Energéticas (Demo Interativa)

```typescript
const energeticOptions: PhysicsOptions = {
  collisionRadius: 10,
  repulsionStrength: 2.5,
  maxSpeed: 3.0,
  damping: 0.990,
  minSpeed: 0.15,
  noiseStrength: 0.025
};
```

### 3. Simulação de Líquido Viscoso

```typescript
const liquidOptions: PhysicsOptions = {
  collisionRadius: 16,
  repulsionStrength: 1.0,
  maxSpeed: 0.8,
  damping: 0.970,
  minSpeed: 0.1,
  noiseStrength: 0.015
};
```

### 4. Espaço Sideral (Quase Sem Atrito)

```typescript
const spaceOptions: PhysicsOptions = {
  collisionRadius: 8,
  repulsionStrength: 3.0,
  maxSpeed: 2.0,
  damping: 0.999,
  minSpeed: 0.02,
  noiseStrength: 0.003
};
```

### 5. Multidão/Densidade Alta

```typescript
const crowdOptions: PhysicsOptions = {
  collisionRadius: 6,
  repulsionStrength: 0.5,
  maxSpeed: 1.0,
  damping: 0.992,
  minSpeed: 0.08,
  noiseStrength: 0.01
};
```

---

[Próximo: Engine Core - Funções Principais](./04-engine-core.md)
