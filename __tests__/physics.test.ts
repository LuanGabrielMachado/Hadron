import { describe, it, expect } from 'vitest';
import { tickParticles } from '../src/engine/tick-particles';
import type { Particle } from '../src/engine/particle';

function halton(index: number, base: number): number {
  let f = 1; let r = 0; let i = index;
  while (i > 0) { f /= base; r += f * (i % base); i = Math.floor(i / base); }
  return r;
}

function smoothNoise(seed: number, t: number): number {
  return Math.sin(seed * 127.1 + t * 0.018) * Math.cos(seed * 311.7 + t * 0.011);
}

describe('Motor de física — bounce nas bordas', () => {
  const W = 300, H = 44, MARGIN = 10;

  it('reverte vx ao atingir borda esquerda', () => {
    const particles: Particle[] = [{ x: 5, y: 22, vx: -0.5, vy: 0, noiseSeed: 1 }];
    tickParticles(particles, 0, W, H, null, null, { collisionRadius: MARGIN });
    expect(particles[0].vx).toBeGreaterThan(0);
    expect(particles[0].x).toBeGreaterThanOrEqual(MARGIN);
  });

  it('reverte vx ao atingir borda direita', () => {
    const particles: Particle[] = [{ x: W - 5, y: 22, vx: 0.5, vy: 0, noiseSeed: 2 }];
    tickParticles(particles, 0, W, H, null, null, { collisionRadius: MARGIN });
    expect(particles[0].vx).toBeLessThan(0);
    expect(particles[0].x).toBeLessThanOrEqual(W - MARGIN);
  });

  it('reverte vy ao atingir borda superior', () => {
    const particles: Particle[] = [{ x: 150, y: 5, vx: 0, vy: -0.5, noiseSeed: 3 }];
    tickParticles(particles, 0, W, H, null, null, { collisionRadius: MARGIN });
    expect(particles[0].vy).toBeGreaterThan(0);
    expect(particles[0].y).toBeGreaterThanOrEqual(MARGIN);
  });

  it('reverte vy ao atingir borda inferior', () => {
    const particles: Particle[] = [{ x: 150, y: H - 5, vx: 0, vy: 0.5, noiseSeed: 4 }];
    tickParticles(particles, 0, W, H, null, null, { collisionRadius: MARGIN });
    expect(particles[0].vy).toBeLessThan(0);
    expect(particles[0].y).toBeLessThanOrEqual(H - MARGIN);
  });

  it('partícula parada na borda esquerda é corrigida', () => {
    const particles: Particle[] = [{ x: 0, y: 22, vx: 0, vy: 0, noiseSeed: 5 }];
    tickParticles(particles, 0, W, H, null, null, { collisionRadius: MARGIN });
    expect(particles[0].x).toBeGreaterThanOrEqual(MARGIN);
    expect(particles[0].vx).toBeGreaterThanOrEqual(0);
  });

  it('partícula parada na borda direita é corrigida', () => {
    const particles: Particle[] = [{ x: W, y: 22, vx: 0, vy: 0, noiseSeed: 6 }];
    tickParticles(particles, 0, W, H, null, null, { collisionRadius: MARGIN });
    expect(particles[0].x).toBeLessThanOrEqual(W - MARGIN);
    expect(particles[0].vx).toBeLessThanOrEqual(0);
  });
});

describe('Motor de física — thermal noise', () => {
  it('injeta força quando velocidade está abaixo de minSpeed', () => {
    const particles: Particle[] = [{ x: 150, y: 22, vx: 0.001, vy: 0.001, noiseSeed: 7 }];
    tickParticles(particles, 100, 300, 44, null, null, { minSpeed: 0.08, noiseStrength: 0.1 });
    const speedAfter = Math.sqrt(particles[0].vx ** 2 + particles[0].vy ** 2);
    expect(speedAfter).toBeGreaterThan(0.001); // se moveu
  });

  it('smoothNoise retorna valores entre -1 e 1', () => {
    for (let i = 0; i < 100; i++) {
      const v = smoothNoise(i * 3.7, i * 1.3);
      expect(v).toBeGreaterThanOrEqual(-1);
      expect(v).toBeLessThanOrEqual(1);
    }
  });

  it('thermal noise mantém movimento mínimo', () => {
    const particles: Particle[] = [{ x: 150, y: 22, vx: 0, vy: 0, noiseSeed: 10 }];
    tickParticles(particles, 50, 300, 400, null, null, { minSpeed: 0.08, noiseStrength: 0.05 });
    const speed = Math.sqrt(particles[0].vx ** 2 + particles[0].vy ** 2);
    expect(speed).toBeGreaterThan(0);
  });
});

describe('Sequência de Halton', () => {
  it('base 2: primeiros valores são 0.5, 0.25, 0.75', () => {
    expect(halton(1, 2)).toBeCloseTo(0.5);
    expect(halton(2, 2)).toBeCloseTo(0.25);
    expect(halton(3, 2)).toBeCloseTo(0.75);
  });

  it('todos os valores estão entre 0 e 1', () => {
    for (let i = 1; i <= 20; i++) {
      expect(halton(i, 2)).toBeGreaterThanOrEqual(0);
      expect(halton(i, 2)).toBeLessThan(1);
      expect(halton(i, 3)).toBeGreaterThanOrEqual(0);
      expect(halton(i, 3)).toBeLessThan(1);
    }
  });

  it('bases diferentes produzem sequências diferentes', () => {
    const base2 = halton(5, 2);
    const base3 = halton(5, 3);
    const base5 = halton(5, 5);
    expect(base2).not.toBe(base3);
    expect(base3).not.toBe(base5);
    expect(base2).not.toBe(base5);
  });

  it('sequência é determinística', () => {
    expect(halton(7, 2)).toBe(halton(7, 2));
    expect(halton(100, 3)).toBe(halton(100, 3));
  });
});

describe('Repulsão entre partículas', () => {
  it('partículas próximas se repelem', () => {
    const particles: Particle[] = [
      { x: 50, y: 50, vx: 0, vy: 0, noiseSeed: 1 },
      { x: 55, y: 50, vx: 0, vy: 0, noiseSeed: 2 },
    ];
    tickParticles(particles, 0, 300, 400, null, null, { collisionRadius: 14, repulsionStrength: 1.4 });
    // Após repulsão, as velocidades devem ser opostas
    expect(particles[0].vx).toBeLessThan(0);
    expect(particles[1].vx).toBeGreaterThan(0);
  });

  it('partículas distantes não sofrem repulsão', () => {
    const particles: Particle[] = [
      { x: 50, y: 50, vx: 0, vy: 0, noiseSeed: 1 },
      { x: 200, y: 200, vx: 0, vy: 0, noiseSeed: 2 },
    ];
    tickParticles(particles, 0, 300, 400, null, null, { collisionRadius: 14, repulsionStrength: 1.4 });
    // Partículas distantes não devem ter velocidade significativa
    expect(Math.abs(particles[0].vx)).toBeLessThan(0.1);
    expect(Math.abs(particles[0].vy)).toBeLessThan(0.1);
  });

  it('múltiplas partículas se repelem corretamente', () => {
    const particles: Particle[] = [
      { x: 50, y: 50, vx: 0, vy: 0, noiseSeed: 1 },
      { x: 60, y: 50, vx: 0, vy: 0, noiseSeed: 2 },
      { x: 55, y: 60, vx: 0, vy: 0, noiseSeed: 3 },
    ];
    tickParticles(particles, 0, 300, 400, null, null, { collisionRadius: 14, repulsionStrength: 1.4 });
    // Todas devem ter alguma velocidade após repulsão mútua
    particles.forEach((p, i) => {
      const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
      expect(speed).toBeGreaterThan(0);
    });
  });
});

describe('Colisão com obstáculos', () => {
  it('partícula ricocheteia em obstáculo', () => {
    const particles: Particle[] = [
      { x: 50, y: 50, vx: 1, vy: 0, noiseSeed: 1 },
    ];
    const obstacles = [{ x: 60, y: 40, w: 20, h: 20 }];
    tickParticles(particles, 0, 300, 400, null, obstacles, { collisionRadius: 14 });
    // Deve ter batido e invertido velocidade
    expect(particles[0].vx).toBeLessThanOrEqual(0);
  });

  it('partícula ricocheteia em múltiplos obstáculos', () => {
    const particles: Particle[] = [
      { x: 100, y: 50, vx: 1, vy: 0, noiseSeed: 1 },
    ];
    const obstacles = [
      { x: 60, y: 40, w: 20, h: 20 },
      { x: 120, y: 40, w: 20, h: 20 },
    ];
    tickParticles(particles, 0, 300, 400, null, obstacles, { collisionRadius: 14 });
    // Deve interagir com pelo menos um obstáculo
    expect(particles[0].vx).not.toBe(1);
  });

  it('partícula não atravessa obstáculo', () => {
    const particles: Particle[] = [
      { x: 70, y: 50, vx: 0.5, vy: 0, noiseSeed: 1 },
    ];
    const obstacles = [{ x: 80, y: 40, w: 20, h: 20 }];
    const collisionRadius = 14;
    tickParticles(particles, 0, 300, 400, null, obstacles, { collisionRadius });
    // Partícula deve estar fora do obstáculo
    const obs = obstacles[0];
    const p = particles[0];
    const isOutside = (
      p.x + collisionRadius <= obs.x ||
      p.x - collisionRadius >= obs.x + obs.w ||
      p.y + collisionRadius <= obs.y ||
      p.y - collisionRadius >= obs.y + obs.h
    );
    expect(isOutside).toBe(true);
  });
});
