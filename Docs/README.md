# Hadron - Documentação Completa

Bem-vindo à documentação completa do **Hadron**, um motor de física de partículas leve e versátil escrito em TypeScript.

---

## 📚 Índice de Documentos

Esta documentação está organizada em 8 documentos temáticos:

### 1. [Introdução](./01-introducao.md)
- Visão geral do projeto
- Características principais
- Arquitetura do código
- Casos de uso típicos
- Instalação e importação básica

### 2. [Conceitos Fundamentais](./02-conceitos-fundamentais.md)
- Estrutura de dados da partícula
- Sequência de Halton (distribuição quasi-aleatória)
- Ruído suave determinístico
- Física de forças (Euler integration, damping, thermal noise)
- Repulsão entre partículas
- Colisão com bordas e obstáculos

### 3. [API Reference - Opções e Configuração](./03-api-opcoes.md)
- `collisionRadius`: Raio de colisão
- `repulsionStrength`: Força de repulsão
- `maxSpeed`: Velocidade máxima
- `damping`: Amortecimento
- `minSpeed`: Limiar para thermal noise
- `noiseStrength`: Intensidade do ruído
- `externalForceRef`: Força externa (giroscópio)
- `obstaclesRef`: Obstáculos retangulares
- Receitas de configuração para diferentes efeitos

### 4. [Engine Core - Funções Principais](./04-engine-core.md)
- `initializeParticles()`: Inicialização com Halton
- `tickParticles()`: Loop principal de física
- `smoothNoise()`: Gerador de ruído
- `halton()`: Sequência quasi-aleatória
- Performance considerations e benchmarks

### 5. [Módulo Device Motion](./05-device-motion.md)
- Integração com giroscópio/acelerômetro
- Arquitetura singleton
- Pipeline de processamento de sinal
- Constantes de configuração
- Permissão em iOS 13+
- Exemplos React e Vanilla JS

### 6. [Hooks React](./06-hooks-react.md)
- `usePhysicsParticles`: Hook principal
- `useDeviceMotion`: Hook do giroscópio
- Padrões avançados (obstáculos dinâmicos, canvas, etc.)
- Otimizações de performance
- Troubleshooting

### 7. [Adaptadores e Utilitários](./07-adapters-utils.md)
- `applyParticlePositions`: Adapter DOM
- Padrões de renderização (DOM, Canvas, WebGL, SVG)
- Utilitários customizados (forças, behaviors, stats)
- Exemplos completos (sistema solar, chuva, fireflies)

### 8. [Guia de Modificação e Extensão](./08-modificacao-extensao.md)
- Entendendo a arquitetura interna
- Modificando comportamentos existentes
- Adicionando novas forças
- Efeitos visuais customizados
- Otimizações avançadas (spatial hashing, Web Workers)
- Portando para Vue, Svelte, Vanilla JS

---

## 🚀 Quick Start

### Instalação

```bash
npm install physaac
```

### Uso Básico com React

```typescript
'use client';

import { useRef } from 'react';
import { usePhysicsParticles } from 'physaac/react';

export function ParticleBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const particleRefs = useRef<(HTMLDivElement | null)[]>([]);
  
  const setParticleRef = (index: number) => (el: HTMLDivElement | null) => {
    particleRefs.current[index] = el;
  };
  
  usePhysicsParticles(50, containerRef, particleRefs);
  
  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%', height: '100vh' }}>
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
          }}
        />
      ))}
    </div>
  );
}
```

### Uso com Giroscópio

```typescript
import { usePhysicsParticles, useDeviceMotion } from 'physaac/react';

function InteractiveParticles() {
  const motionRef = useDeviceMotion();
  
  usePhysicsParticles(50, containerRef, particleRefs, {
    externalForceRef: motionRef,  // Conecta giroscópio
  });
  
  // ... renderização
}
```

---

## 🎯 Recursos Principais

| Recurso | Descrição |
|---------|-----------|
| **Zero dependências** | Núcleo vanilla TypeScript |
| **Física realista** | Repulsão, damping, colisões |
| **Giroscópio integrado** | Interatividade com movimento do dispositivo |
| **Distribuição Halton** | Posicionamento inicial uniforme |
| **Ruído suave** | Movimento orgânico e natural |
| **Hooks React** | Integração fácil com React |
| **Multi-framework** | Funciona com Vue, Svelte, Vanilla |
| **Performance** | Otimizado para 60 FPS |

---

## 📊 Comparação de Configurações

| Configuração | Partículas | Velocidade | Energia | Caso de Uso |
|-------------|------------|------------|---------|-------------|
| Calma | 30-50 | 0.3-0.6 | Baixa | Background de site |
| Normal | 50-80 | 0.8-1.5 | Média | Demo interativa |
| Energética | 80-120 | 2.0-4.0 | Alta | Jogo, visualização |
| Espaço | 50-100 | 1.0-2.0 | Variável | Simulação orbital |
| Líquido | 100-200 | 0.5-1.0 | Baixa-Média | Simulação de fluido |

---

## 🔧 Parâmetros de Ajuste Rápido

### Para Partículas Mais Lentas/Calmas

```typescript
{
  maxSpeed: 0.5,
  damping: 0.998,
  repulsionStrength: 0.8,
  minSpeed: 0.05,
  noiseStrength: 0.008
}
```

### Para Partículas Mais Rápidas/Energéticas

```typescript
{
  maxSpeed: 3.0,
  damping: 0.990,
  repulsionStrength: 2.5,
  minSpeed: 0.15,
  noiseStrength: 0.025
}
```

### Para Mais Partículas (Performance)

```typescript
{
  collisionRadius: 8,  // Menor raio = menos colisões detectadas
  maxSpeed: 1.0,
  // Evite muitas partículas + obstáculos
}
```

---

## 📱 Suporte a Dispositivos

| Plataforma | Suporte | Notas |
|------------|---------|-------|
| iOS Safari | ✅ | Permissão necessária (iOS 13+) |
| Android Chrome | ✅ | Funciona out-of-the-box |
| Desktop | ⚠️ | Sem giroscópio, usa fallback |
| Tablet | ✅ | Excelente experiência |

---

## 🐛 Troubleshooting Comum

### Partículas não aparecem

```typescript
// Verifica dimensões do container
console.log(containerRef.current?.offsetWidth, containerRef.current?.offsetHeight);

// Verifica se count > 0
console.log('Count:', count);

// Verifica refs das partículas
console.log(particleRefs.current);
```

### Performance ruim

- Reduza número de partículas (<100 para DOM)
- Use `will-change: transform` no CSS
- Considere Canvas para >100 partículas
- Remova obstáculos se houver muitos

### Giroscópio não funciona

```typescript
// Em iOS, solicite permissão
import { requestDeviceMotionPermission } from 'physaac/device-motion';

<button onClick={async () => {
  const granted = await requestDeviceMotionPermission();
  console.log('Permissão:', granted);
}}>
  Ativar Movimento
</button>
```

---

## 📖 Guia de Leitura Recomendado

**Para usuários iniciantes:**
1. Comece com [Introdução](./01-introducao.md)
2. Leia [Quick Start](#-quick-start) acima
3. Consulte [Opções e Configuração](./03-api-opcoes.md) para ajustes
4. Veja exemplos em [Hooks React](./06-hooks-react.md)

**Para desenvolvedores experientes:**
1. Pule para [Conceitos Fundamentais](./02-conceitos-fundamentais.md)
2. Estude [Engine Core](./04-engine-core.md)
3. Explore [Modificação e Extensão](./08-modificacao-extensao.md)

**Para integração mobile:**
1. Leia [Device Motion](./05-device-motion.md)
2. Implemente botão de permissão iOS
3. Teste em dispositivo físico

---

## 🤝 Contribuição

Para contribuir com melhorias ou reportar bugs, consulte o repositório principal.

---

## 📄 Licença

MIT License - veja arquivo LICENSE no repositório.

---

**Próximo**: [Introdução ao Hadron](./01-introducao.md)
