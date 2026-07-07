# Device Motion e APIs de Sensores

## Descrição
Integração com APIs nativas de dispositivos móveis (giroscópio, acelerômetro) com tratamento de permissões, filtering de sinal e compatibilidade cross-platform.

## Evidências no Projeto

### 1. Singleton Pattern para Listener
```typescript
// device-motion/singleton.ts
export const deviceMotionForce: ExternalForce = { fx: 0, fy: 0 };
let listenerActive = false;

export function startDeviceMotion(): void {
  if (listenerActive) return; // previne múltiplos listeners
  
  window.addEventListener('devicemotion', (event: DeviceMotionEvent) => {
    // Processa dados do sensor
  });
  listenerActive = true;
}
```

**Benefícios:**
- Único listener global (evita duplicação)
- Estado compartilhado reativo
- Memory leak prevention

### 2. Deadzone Filtering para Ruído
```typescript
const DEADZONE_THRESHOLD = 0.0005;
const MOVING_AVG_ALPHA = 0.1;

// Filtra ruído de baixa intensidade
if (shakeEnergy < DEADZONE_THRESHOLD) {
  return { fx: 0, fy: 0 };
}

// Média móvel exponencial para suavização
filteredFx = filteredFx * (1 - alpha) + rawFx * alpha;
```

### 3. Permissão iOS 13+
```typescript
// iOS 13+ requer solicitação explícita de permissão
export async function requestDeviceMotionPermission(): Promise<boolean> {
  if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
    try {
      const permission = await (DeviceMotionEvent as any).requestPermission();
      return permission === 'granted';
    } catch (e) {
      return false;
    }
  }
  return true; // Android e iOS <13 não precisam
}
```

### 4. Mapeamento de Coordenadas
```typescript
// Converte aceleração do dispositivo para coordenadas da tela
const acceleration = event.accelerationIncludingGravity || { x: 0, y: 0, z: 0 };

// Inverte e rotaciona conforme orientação
const fx = -acceleration.y * sensitivity;
const fy = acceleration.x * sensitivity;
```

### 5. Hook React Integration
```typescript
export function useDeviceMotion(): RefObject<ExternalForce> {
  const motionRef = useRef(deviceMotionForce);
  
  useEffect(() => {
    startDeviceMotion();
    
    return () => {
      // Cleanup se necessário
    };
  }, []);
  
  return motionRef;
}
```

## Competências Demonstradas

- ✅ DeviceMotionEvent API
- ✅ DeviceOrientationEvent API
- ✅ Solicitação de permissão iOS
- ✅ Signal processing (deadzone, moving average)
- ✅ Singleton pattern para recursos globais
- ✅ Cross-platform compatibility (iOS/Android)
- ✅ Integration com React hooks
- ✅ Fallbacks para desktop

## Nível
**Intermediário-Avançado** - APIs nativas de mobile com tratamento robusto de edge cases

## Desafios Específicos

### iOS vs Android
| Plataforma | Permissão | Notas |
|------------|-----------|-------|
| iOS <13 | Automática | Funciona out-of-the-box |
| iOS 13+ | Requer user gesture | Botão necessário |
| Android | Automática | Chrome permite sem prompt |
| Desktop | Não disponível | Fallback para null |

### Ruído do Sensor
- **Problema**: Sensores têm noise mesmo em repouso
- **Solução**: Deadzone threshold + média móvel exponencial

### Orientação do Dispositivo
- **Problema**: Coordenadas mudam com rotação
- **Solução**: Mapeamento consistente independente da orientação

## Referências
- [MDN DeviceMotionEvent](https://developer.mozilla.org/en-US/docs/Web/API/DeviceMotionEvent)
- [iOS 13 DeviceMotion Changes](https://medium.com/@jordanmedge/requesting-permission-for-deviceorientation-in-ios-13-2676d8ef6981)
- [Sensor Filtering Techniques](https://www.oliverlewis.com/2013/04/smoothing-accelerometer-data-with-a-moving-average/)
