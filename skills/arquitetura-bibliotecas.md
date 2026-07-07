# Arquitetura de Bibliotecas JavaScript/TypeScript

## Descrição
Design e implementação de bibliotecas multi-framework com exports modulares, compatibilidade ESM/CJS, tree-shaking e APIs bem definidas.

## Evidências no Projeto

### 1. Estrutura de Módulos Multi-Entry Point
```json
{
  "exports": {
    ".": {
      "import": "./dist/esm/index.js",
      "require": "./dist/cjs/index.js",
      "types": "./dist/cjs/index.d.ts"
    },
    "./react": {
      "import": "./dist/esm/react/index.js",
      "require": "./dist/cjs/react/index.js"
    },
    "./device-motion": {
      "import": "./dist/esm/device-motion/index.js",
      "require": "./dist/cjs/device-motion/index.js"
    },
    "./adapters": {
      "import": "./dist/esm/adapters/index.js",
      "require": "./dist/cjs/adapters/index.js"
    }
  }
}
```

**Benefícios:**
- Tree-shaking: usuários importam apenas o que usam
- Separação clara de concerns
- Compatibilidade com bundlers modernos

### 2. Núcleo Vanilla Zero Dependências
```typescript
// engine/ - sem dependências externas
import { Particle } from './particle';
import type { PhysicsOptions } from './options';
// Apenas imports internos, zero npm packages
```

### 3. Camadas de Abstração
```
src/
├── engine/           # Core vanilla (zero deps)
├── react/            # Hooks React (opcional)
├── device-motion/    # Singleton gyro (opcional)
├── adapters/         # Utils DOM (opcional)
└── index.ts          # Exports públicos
```

### 4. Design Pattern: Ref Wrapper para Multi-Framework
```typescript
// Funciona com React E Vanilla JS
externalForceRef?: { current: ExternalForce | null | undefined };

// React
const motionRef = useDeviceMotion();

// Vanilla
const forceRef = { current: { fx: 0, fy: 0 } };
```

### 5. Build Configuration (tsup)
```typescript
// tsup.config.ts
export default {
  entry: ['src/index.ts', 'src/react/index.ts', ...],
  format: ['esm', 'cjs'],  // Dual build
  dts: true,               // Gera tipos
  splitting: false,        // Tree-shaking friendly
};
```

### 6. API Design Principles

#### Funções Puras quando possível
```typescript
// Halton sequence - pura, determinística
export function halton(index: number, base: number): number {
  // Sem efeitos colaterais
}
```

#### Mutação Documentada
```typescript
// tickParticles muta o array de partículas (documentado)
export function tickParticles(particles: Particle[], ...): void {
  // Mutação intencional para performance
}
```

#### Options Object Pattern
```typescript
// Flexível, extensível, backwards compatible
export function tickParticles(..., options: PhysicsOptions = {}) {
  const collisionRadius = options.collisionRadius ?? DEFAULT;
}
```

## Competências Demonstradas

- ✅ Design de APIs públicas estáveis
- ✅ Multi-entry point para tree-shaking
- ✅ Dual build ESM/CJS
- ✅ TypeScript declaration files (.d.ts)
- ✅ Peer dependencies opcionais (React)
- ✅ Separation of concerns por módulo
- ✅ Backwards compatibility via options object
- ✅ Documentation-driven development

## Nível
**Avançado** - Arquitetura de biblioteca profissional pronta para npm publish

## Padrões de Indústria Implementados
- Semantic Versioning (package.json)
- Exports field moderno (subpath exports)
- Types versions alignment
- Optional peer dependencies
- Zero breaking changes via nullish coalescing

## Ferramentas
- **tsup**: Build tool rápido com esbuild
- **TypeScript**: Type checking e geração de .d.ts
- **vitest**: Testing framework
- **npm**: Package management e publish
