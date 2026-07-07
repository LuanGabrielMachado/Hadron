/**
 * Helper vanilla para aplicar posições de partículas no DOM.
 * Uso opcional - quem usa React pode usar o hook usePhysicsParticles.
 */

import type { Particle } from '../engine';

/**
 * Aplica as posições das partículas nos elementos DOM via style.left/top.
 * 
 * @param particles - array de partículas com posições atualizadas
 * @param elements - array de elementos DOM (mesmo tamanho que particles)
 */
export function applyParticlePositions(
  particles: Particle[],
  elements: Array<HTMLElement | null>
): void {
  for (let i = 0; i < particles.length; i++) {
    const el = elements[i];
    if (el) {
      el.style.left = `${particles[i].x}px`;
      el.style.top = `${particles[i].y}px`;
    }
  }
}
