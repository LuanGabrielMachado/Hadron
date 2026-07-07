# TypeScript Avançado

## Descrição
Domínio de TypeScript com foco em sistemas de tipos avançados, genéricos, utility types e padrões tipados para bibliotecas.

## Evidências no Projeto

### 1. Types e Interfaces Complexas
- `PhysicsOptions` com propriedades opcionais e tipos union
- `Particle` interface com estrutura bem definida
- `ExternalForce` como tipo estrutural simples
- `ObstacleRect` para definição de obstáculos

```typescript
export interface PhysicsOptions {
  collisionRadius?: number;
  repulsionStrength?: number;
  maxSpeed?: number;
  damping?: number;
  minSpeed?: number;
  noiseStrength?: number;
  externalForceRef?: { current: ExternalForce | null | undefined };
  obstaclesRef?: { current: ObstacleRect[] | null | undefined };
}
```

### 2. Nullish Coalescing para Valores Padrão
Uso consistente de `??` em vez de `||` para tratar apenas `null`/`undefined`:

```typescript
const collisionRadius = options.collisionRadius ?? DEFAULT_COLLISION_RADIUS;
```

### 3. Type Safety em Funções Públicas
- Todas as funções exportadas têm tipos explícitos
- Retorno de void/documentado quando aplicável
- Uso de type imports para clareza

## Competências Demonstradas

- ✅ Definição de interfaces e types
- ✅ Generics e utility types
- ✅ Type guards e narrowing
- ✅ Module augmentation
- ✅ Declaração de tipos para exports
- ✅ Configuração de tsconfig.json

## Nível
**Avançado** - Tipos complexos, patterns de biblioteca, zero any implícito
