# Módulo Device Motion - Giroscópio e Acelerômetro

Este documento detalha o módulo de captura de movimento do dispositivo, que integra dados do acelerômetro (DeviceMotion) para criar interatividade baseada em inclinação e agitação do dispositivo.

---

## Visão Geral

O módulo `device-motion` fornece uma interface simples para capturar movimentos físicos do dispositivo (celular, tablet) e convertê-los em forças aplicadas às partículas. É particularmente útil para:

- **Interatividade**: Usuários podem "empurrar" as partículas inclinando o dispositivo
- **Efeito shake**: Agitar o dispositivo cria movimento energético nas partículas
- **Imersão**: Conexão física entre o mundo real e a animação digital

### Arquitetura Singleton

O módulo usa um padrão **singleton** - há apenas UM listener de DeviceMotion ativo para toda a aplicação, independente de quantos componentes usem o hook. Isso evita:

- Múltiplos listeners consumindo recursos desnecessariamente
- Conflitos entre diferentes partes da aplicação
- Vazamento de memória por listeners não limpos

```
┌─────────────────────────────────────────────┐
│           Aplicação React/Vue/etc           │
│  ┌───────────┐  ┌───────────┐  ┌─────────┐ │
│  │ Componente│  │ Componente│  │ Hook    │ │
│  │     A     │  │     B     │  │ Vanilla │ │
│  └─────┬─────┘  └─────┬─────┘  └────┬────┘ │
│        │              │              │      │
│        └──────────────┼──────────────┘      │
│                       │                      │
│              ┌────────▼────────┐            │
│              │  deviceMotion   │            │
│              │    Singleton    │            │
│              │  (ÚNICO listener)│            │
│              └────────┬────────┘            │
└───────────────────────┼─────────────────────┘
                        │
                        ▼
              ┌─────────────────┐
              │ DeviceMotionEvent│
              │   (Browser API)  │
              └─────────────────┘
```

---

## API Reference

### Interfaces

#### ExternalForce

```typescript
interface ExternalForce {
  fx: number;  // Força no eixo X (-0.022 a 0.022 típico)
  fy: number;  // Força no eixo Y (-0.022 a 0.022 típico)
}
```

Objeto mutável que contém as forças atuais calculadas a partir do movimento do dispositivo.

### Funções Exportadas

#### 1. startDeviceMotion

Inicia o listener de DeviceMotion e começa a atualizar `deviceMotionForce`.

**Assinatura**:
```typescript
function startDeviceMotion(): void
```

**Comportamento**:
- Verifica se está em ambiente browser (`typeof window !== 'undefined'`)
- Verifica se já existe listener ativo (evita duplicação)
- Filtra dispositivos iOS antigos (iPad, iPhone, iPod) que requerem permissão explícita
- Verifica suporte à API DeviceMotion
- Adiciona listener com opção `{ passive: true }` para melhor performance

**Exemplo**:
```typescript
import { startDeviceMotion } from 'physaac/device-motion';

// Inicia o listener
startDeviceMotion();

// Agora deviceMotionForce será atualizado automaticamente
```

**Idempotência**: Pode ser chamado múltiplas vezes sem efeitos colaterais adicionais.

---

#### 2. requestDeviceMotionPermission

Solicita permissão para acessar DeviceMotion (necessário em iOS 13+).

**Assinatura**:
```typescript
async function requestDeviceMotionPermission(): Promise<boolean>
```

**Retorno**:
- `true`: Permissão concedida, listener iniciado
- `false`: Permissão negada ou erro

**Quando usar**:
- Em iOS 13+, a permissão deve ser solicitada explicitamente
- Deve ser chamado em resposta a uma interação do usuário (clique, tap)
- Navegadores desktop geralmente não requerem permissão

**Exemplo**:
```typescript
import { requestDeviceMotionPermission } from 'physaac/device-motion';

// Em um botão ou interação do usuário
const handleEnableMotion = async () => {
  const granted = await requestDeviceMotionPermission();
  
  if (granted) {
    console.log('Permissão concedida!');
    // O listener já foi iniciado automaticamente
  } else {
    console.log('Permissão negada ou não disponível');
  }
};
```

**Fluxo em iOS**:
```
Usuário clica "Ativar Movimento"
         │
         ▼
requestDeviceMotionPermission()
         │
         ▼
iOS mostra dialog nativo:
"Permitir acesso ao movimento?"
         │
    ┌────┴────┐
    │         │
 Permitir   Negar
    │         │
    ▼         ▼
  true     false
```

---

#### 3. deviceMotionForce (Singleton)

Objeto exportado que contém as forças atuais calculadas.

**Tipo**:
```typescript
const deviceMotionForce: ExternalForce = { fx: 0, fy: 0 };
```

**Uso**:
```typescript
import { deviceMotionForce } from 'physaac/device-motion';

// Lê as forças atuais
console.log(deviceMotionForce.fx, deviceMotionForce.fy);

// Passe como ref para o motor de física
usePhysicsParticles(count, containerRef, particleRefs, {
  externalForceRef: { current: deviceMotionForce }
});
```

**Importante**: Este objeto é MUTÁVEL. As propriedades `fx` e `fy` são atualizadas continuamente pelo listener.

---

## Pipeline de Processamento

O processamento do sinal do acelerômetro segue este pipeline:

```
rawX, rawY (acelerômetro bruto)
       │
       ▼
┌─────────────┐
│  Deadzone   │ ← Filtra tremor de mão e ruído (< 0.4 m/s²)
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Sinal +    │ ← Inverte eixo X (Android), aplica sensibilidade
│ Sensitivity │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│     EMA     │ ← Suavização exponencial (alpha = 0.18)
│ (Exponential│
│  Moving Avg)│
└──────┬──────┘
       │
       ▼
┌─────────────┐
│    Decay    │ ← Volta a zero quando em repouso (decay = 0.80)
└──────┬──────┘
       │
       ▼
┌─────────────┐
│    Clamp    │ ← Limita a ±0.022 (MAX_FORCE)
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Epsilon   │ ← Zera hard se < 0.0005 (evita drift)
└──────┬──────┘
       │
       ▼
   fx, fy (força final aplicada às partículas)
```

### Detalhe de Cada Etapa

#### 1. Leitura Bruta

```typescript
const acc = e.acceleration;
const rawX = acc.x ?? 0;
const rawY = acc.y ?? 0;
```

Valores típicos: -10 a 10 m/s² dependendo da inclinação.

#### 2. Deadzone

```typescript
const DEADZONE = 0.4;  // m/s²

const inDeadzoneX = Math.abs(rawX) <= DEADZONE;
const inDeadzoneY = Math.abs(rawY) <= DEADZONE;

if (inDeadzoneX) {
  ema.x *= DECAY;  // Apenas decai, não aplica força
} else {
  // Processa normalmente
}
```

**Propósito**: Ignora micro-movimentos (tremor de mão, ruído do sensor) abaixo de 0.4 m/s².

#### 3. Conversão e Inversão

```typescript
// Eixo X: negativo = direita no Android, por isso inverte
const target = -(rawX) * SENSITIVITY;

// Eixo Y: mantém direção natural
const target = (rawY) * SENSITIVITY;
```

**SENSITIVITY = 0.010**: Converte m/s² para px/frame.

**Inversão do eixo X**: No Android, inclinar para a DIREITA produz `acc.x` negativo. Para intuitividade, invertemos o sinal.

#### 4. EMA (Exponential Moving Average)

```typescript
const EMA_ALPHA = 0.18;

ema.x = EMA_ALPHA * target + (1 - EMA_ALPHA) * ema.x;
```

**Propósito**: Suaviza transições bruscas, criando movimento fluido.

**Alpha = 0.18**: 
- 18% do novo valor
- 82% do valor anterior
- Equilíbrio entre responsividade e suavidade

#### 5. Decay em Repouso

```typescript
const DECAY = 0.80;

if (inDeadzone) {
  ema.x *= DECAY;  // Reduz para 80% a cada frame
}
```

**Propósito**: Quando o dispositivo para, as forças voltam rapidamente a zero.

**Decay = 0.80**:
- Frame 0: 100% da força
- Frame 1: 80%
- Frame 2: 64%
- Frame 3: 51%
- Frame 5: 33%
- Frame 10: 11%
- Frame 20: 1%

#### 6. Clamp

```typescript
const MAX_FORCE = 0.022;

function clamp(v: number) {
  return Math.max(-MAX_FORCE, Math.min(MAX_FORCE, v));
}

deviceMotionForce.fx = clamp(ema.x);
deviceMotionForce.fy = clamp(ema.y);
```

**Propósito**: Evita forças extremas que quebrariam a simulação.

#### 7. Epsilon Zero

```typescript
const EPSILON = 0.0005;

if (Math.abs(ema.x) < EPSILON) ema.x = 0;
if (Math.abs(ema.y) < EPSILON) ema.y = 0;
```

**Propósito**: Elimina drift residual infinitesimal que acumularia com o tempo.

---

## Constantes de Configuração

| Constante | Valor | Descrição |
|-----------|-------|-----------|
| `EMA_ALPHA` | 0.18 | Fator de suavização do EMA |
| `DECAY` | 0.80 | Fator de decay em repouso |
| `SENSITIVITY` | 0.010 | Conversão m/s² → px/frame |
| `MAX_FORCE` | 0.022 | Limite máximo de força por eixo |
| `DEADZONE` | 0.4 | Limiar de ruído (m/s²) |
| `EPSILON` | 0.0005 | Limiar para zero absoluto |

### Como Ajustar

#### Mais Sensibilidade

```typescript
// Aumentar SENSITIVITY
SENSITIVITY = 0.020;  // Dobro da sensibilidade

// Diminuir DEADZONE
DEADZONE = 0.2;  // Detecta movimentos mais sutis
```

#### Mais Suavidade

```typescript
// Diminuir EMA_ALPHA
EMA_ALPHA = 0.10;  // Mais peso no histórico, menos responsivo

// Aumentar DECAY
DECAY = 0.90;  // Demora mais para voltar a zero
```

#### Mais Responsividade

```typescript
// Aumentar EMA_ALPHA
EMA_ALPHA = 0.30;  // Reage mais rápido a mudanças

// Diminuir DECAY
DECAY = 0.60;  // Volta a zero mais rápido
```

---

## Integração com React

### Hook useDeviceMotion

O hook React encapsula o singleton de forma conveniente:

```typescript
import { useDeviceMotion } from 'physaac/react';

function MeuComponente() {
  const motionRef = useDeviceMotion();
  
  // motionRef.current contém { fx, fy } atualizados
  
  return <div>...</div>;
}
```

**Implementação do hook**:
```typescript
export function useDeviceMotion() {
  const motionRef = useRef(deviceMotionForce);
  
  useEffect(() => {
    startDeviceMotion();
  }, []);
  
  return motionRef;
}
```

### Exemplo Completo React

```typescript
'use client';

import { useRef } from 'react';
import { usePhysicsParticles, useDeviceMotion } from 'physaac/react';

export function ParticleBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const particleRefs = useRef<(HTMLDivElement | null)[]>([]);
  const motionRef = useDeviceMotion();
  
  // Cria refs para os elementos das partículas
  const setParticleRef = (index: number) => (el: HTMLDivElement | null) => {
    particleRefs.current[index] = el;
  };
  
  // Inicializa física com giroscópio
  usePhysicsParticles(
    50,  // 50 partículas
    containerRef,
    particleRefs,
    {
      externalForceRef: motionRef,
      collisionRadius: 14,
      repulsionStrength: 1.4,
      maxSpeed: 1.2,
      damping: 0.994,
    }
  );
  
  return (
    <div 
      ref={containerRef}
      style={{ position: 'relative', width: '100%', height: '100vh', overflow: 'hidden' }}
    >
      {Array.from({ length: 50 }).map((_, i) => (
        <div
          key={i}
          ref={setParticleRef(i)}
          style={{
            position: 'absolute',
            width: 28,
            height: 28,
            borderRadius: '50%',
            background: 'rgba(100, 150, 255, 0.6)',
            willChange: 'transform',
          }}
        />
      ))}
    </div>
  );
}
```

### Botão de Permissão iOS

```typescript
function EnableMotionButton() {
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null);
  
  const handleRequestPermission = async () => {
    const granted = await requestDeviceMotionPermission();
    setPermissionGranted(granted);
  };
  
  return (
    <div>
      {permissionGranted === null && (
        <button onClick={handleRequestPermission}>
          Ativar Controle por Movimento
        </button>
      )}
      
      {permissionGranted === true && (
        <p>✅ Movimento ativado! Incline seu dispositivo.</p>
      )}
      
      {permissionGranted === false && (
        <p>❌ Permissão negada. Funcionalidade indisponível.</p>
      )}
    </div>
  );
}
```

---

## Integração Vanilla JS

### Exemplo Básico

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    #container {
      position: relative;
      width: 100vw;
      height: 100vh;
      overflow: hidden;
    }
    .particle {
      position: absolute;
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: rgba(100, 150, 255, 0.6);
    }
  </style>
</head>
<body>
  <div id="container"></div>
  
  <script type="module">
    import { 
      initializeParticles, 
      tickParticles 
    } from 'physaac';
    import { 
      startDeviceMotion, 
      deviceMotionForce,
      requestDeviceMotionPermission 
    } from 'physaac/device-motion';
    
    const container = document.getElementById('container');
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    // Cria elementos DOM
    const particleElements = [];
    for (let i = 0; i < 50; i++) {
      const el = document.createElement('div');
      el.className = 'particle';
      container.appendChild(el);
      particleElements.push(el);
    }
    
    // Inicializa partículas
    const particles = initializeParticles(50, width, height, 14);
    
    // Inicia giroscópio
    startDeviceMotion();
    
    // Loop de animação
    let frame = 0;
    function animate() {
      tickParticles(
        particles,
        frame++,
        width,
        height,
        deviceMotionForce,  // Força do giroscópio
        null,
        {}
      );
      
      // Aplica posições
      particles.forEach((p, i) => {
        particleElements[i].style.left = `${p.x}px`;
        particleElements[i].style.top = `${p.y}px`;
      });
      
      requestAnimationFrame(animate);
    }
    
    animate();
    
    // Botão de permissão para iOS
    document.getElementById('enable-btn')?.addEventListener('click', async () => {
      const granted = await requestDeviceMotionPermission();
      console.log('Permissão:', granted);
    });
  </script>
</body>
</html>
```

---

## Compatibilidade e Limitações

### Navegadores Suportados

| Navegador | Suporte | Permissão Necessária |
|-----------|---------|---------------------|
| Chrome Android | ✅ Sim | Não |
| Firefox Android | ✅ Sim | Não |
| Safari iOS 12- | ✅ Sim | Não |
| Safari iOS 13+ | ✅ Sim | **Sim (explícita)** |
| Desktop Chrome | ⚠️ Sem sensor | N/A |
| Desktop Firefox | ⚠️ Sem sensor | N/A |
| Desktop Safari | ⚠️ Sem sensor | N/A |

### Dispositivos sem Sensor

Em dispositivos sem acelerômetro (desktops):
- `deviceMotionForce` permanece em `{ fx: 0, fy: 0 }`
- O listener não é adicionado
- Sem erros são lançados

### iOS 13+ Requisitos

A Apple requer:
1. **HTTPS**: A página deve ser servida via HTTPS
2. **Interação do usuário**: Permissão deve ser solicitada em resposta a um clique/tap
3. **Dialog nativo**: iOS mostra dialog padrão pedindo permissão

### Alternativas para Desktop

Para testar/debug em desktop:

```typescript
// Força manual para teste
const testForceRef = useRef({ fx: 0.01, fy: 0 });

// Ou simule movimento com teclado
useEffect(() => {
  const handleKey = (e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowLeft':
        deviceMotionForce.fx = -0.01;
        break;
      case 'ArrowRight':
        deviceMotionForce.fx = 0.01;
        break;
      case 'ArrowUp':
        deviceMotionForce.fy = -0.01;
        break;
      case 'ArrowDown':
        deviceMotionForce.fy = 0.01;
        break;
    }
  };
  
  window.addEventListener('keydown', handleKey);
  return () => window.removeEventListener('keydown', handleKey);
}, []);
```

---

## Debug e Troubleshooting

### Verificar se está funcionando

```typescript
// Log das forças atuais
setInterval(() => {
  console.log('Força atual:', deviceMotionForce);
}, 1000);

// Espera-se ver valores mudando ao inclinar o dispositivo
// { fx: 0.005, fy: -0.012 }
// { fx: -0.003, fy: 0.008 }
// etc.
```

### Problemas Comuns

#### 1. Valores sempre zero

**Causas possíveis**:
- Listener não foi iniciado (`startDeviceMotion()` não chamado)
- Dispositivo sem acelerômetro
- Permissão negada em iOS

**Solução**:
```typescript
// Verifica se listener está ativo
console.log('fx:', deviceMotionForce.fx);

// Tenta iniciar novamente
startDeviceMotion();

// Em iOS, solicita permissão
await requestDeviceMotionPermission();
```

#### 2. Movimento invertido

**Causa**: Orientação do dispositivo diferente do esperado.

**Solução**: Inverter manualmente:
```typescript
// Inverte eixo X
deviceMotionForce.fx = -deviceMotionForce.fx;
```

#### 3. Movimento muito lento/rápido

**Solução**: Ajustar SENSITIVITY (requer fork/modificação do código fonte):
```typescript
// No arquivo singleton.ts, ajustar:
const SENSITIVITY = 0.020;  // Mais sensível
// ou
const SENSITIVITY = 0.005;  // Menos sensível
```

---

[Próximo: Hooks React](./06-hooks-react.md)
