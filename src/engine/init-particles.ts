import { halton } from './halton';
import type { Particle } from './particle';

/**
 * Inicializa partículas com distribuição Halton para posicionamento quasi-aleatório.
 * 
 * Esta função centraliza a lógica de inicialização para garantir consistência
 * entre diferentes consumidores (React, Vue, Svelte, vanilla JS).
 * 
 * @param count - número de partículas para criar
 * @param width - largura do container
 * @param height - altura do container
 * @param collisionRadius - raio de colisão das partículas
 * @returns array de partículas inicializadas
 */
export function initializeParticles(
  count: number,
  width: number,
  height: number,
  collisionRadius: number
): Particle[] {
  const margin = collisionRadius + 4;
  return Array.from({ length: count }, (_, i) => {
    const x = margin + halton(i + 1, 2) * (width - margin * 2);
    const y = margin + halton(i + 1, 3) * (height - margin * 2);
    const angle = (i / count) * Math.PI * 2 + halton(i + 1, 5) * 1.2;
    const speed = 0.3 + halton(i + 1, 7) * 0.5;
    return {
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      noiseSeed: halton(i + 1, 11) * 100,
    };
  });
}
