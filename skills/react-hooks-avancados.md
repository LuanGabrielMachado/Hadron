# React Hooks Avançados

## Descrição
Criação de hooks customizados complexos com gerenciamento de ciclo de vida, refs estáveis, zero re-renders e integração com APIs imperativas.

## Evidências no Projeto

### 1. Hook usePhysicsParticles
Hook principal que orquestra:
- Inicialização de partículas com `useMemo`
- Loop de animação com `requestAnimationFrame`
- Cleanup automático no unmount
- Zero re-renders (atualização direta do DOM)

```typescript
export function usePhysicsParticles(
  count: number,
  containerRef: RefObject<HTMLDivElement | null>,
  particleRefs: RefObject<(HTMLDivElement | null)[]>,
  options: PhysicsOptions = {}
): void {
  // useMemo para inicialização única
  const particlesRef = useMemo(() => 
    initializeParticles(count, width, height, collisionRadius), 
  [count, width, height, collisionRadius]);
  
  // useRef para RAF ID
  const rafRef = useRef<number | null>(null);
  
  // useEffect para loop de animação
  useEffect(() => {
    function tick() {
      tickParticles(particlesRef.current, frameRef.current++, ...);
      applyPositions(); // DOM direto, sem setState
      rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [/* deps */]);
}
```

### 2. Hook useDeviceMotion
- Singleton pattern integrado com hook React
- Cleanup de listeners
- Compatibilidade iOS/Android

### 3. Técnicas Avançadas

#### Zero Re-Renders
```typescript
// ✅ CORRETO: atualiza DOM diretamente
particleRefs.current[i].style.left = `${x}px`;

// ❌ ERRADO: causaria re-render
// setParticles(newParticles);
```

#### Refs Estáveis
```typescript
const particlesRef = useRef<Particle[]>([]);
// Não causa re-render quando mutado
```

#### Cleanup de RAF
```typescript
useEffect(() => {
  rafRef.current = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(rafRef.current!);
}, []);
```

#### Callback Ref Pattern
```typescript
const setParticleRef = (index: number) => (el: HTMLDivElement | null) => {
  particleRefs.current[index] = el;
};

// Uso no JSX
<div ref={setParticleRef(i)} />
```

## Competências Demonstradas

- ✅ Criação de hooks customizados complexos
- ✅ Gerenciamento de ciclo de vida (mount/unmount)
- ✅ Otimização com useMemo e useCallback
- ✅ Refs para estado mutável sem re-render
- ✅ Integration com APIs imperativas (RAF, DOM)
- ✅ Pattern de cleanup em useEffect
- ✅ Callback refs para arrays de elementos

## Nível
**Avançado** - Hooks de biblioteca, patterns complexos, performance crítica

## Padrões Implementados
- Custom Hook com parâmetros genéricos
- Ref forwarding
- Controlled vs Uncontrolled patterns
- Singleton integration com hooks
