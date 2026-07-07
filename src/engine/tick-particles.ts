import { Particle } from './particle';
import { PhysicsOptions, ExternalForce, ObstacleRect } from './options';
import { smoothNoise } from './noise';

const DEFAULT_COLLISION_RADIUS = 14;
const DEFAULT_REPULSION_STRENGTH = 1.4;
const DEFAULT_MAX_SPEED = 1.2;
const DEFAULT_DAMPING = 0.994;
const DEFAULT_MIN_SPEED = 0.08;
const DEFAULT_NOISE_STRENGTH = 0.012;

/**
 * Atualiza as partículas em um frame.
 * 
 * @param particles - array mutável de partículas
 * @param t - número do frame atual
 * @param containerWidth - largura do container onde as partículas estão confinadas
 * @param containerHeight - altura do container
 * @param externalForce - força externa atual (ex: giroscópio) ou null
 * @param obstacles - array de retângulos de obstáculo
 * @param options - parâmetros opcionais (thresholds)
 */
export function tickParticles(
  particles: Particle[],
  t: number,
  containerWidth: number,
  containerHeight: number,
  externalForce: ExternalForce | null,
  obstacles: ObstacleRect[] | null,
  options: PhysicsOptions = {}
): void {
  const collisionRadius   = options.collisionRadius   ?? DEFAULT_COLLISION_RADIUS;
  const repulsionStrength = options.repulsionStrength ?? DEFAULT_REPULSION_STRENGTH;
  const maxSpeed          = options.maxSpeed          ?? DEFAULT_MAX_SPEED;
  const damping           = options.damping           ?? DEFAULT_DAMPING;
  const minSpeed          = options.minSpeed          ?? DEFAULT_MIN_SPEED;
  const noiseStrength     = options.noiseStrength     ?? DEFAULT_NOISE_STRENGTH;

  const margin = collisionRadius + 2;
  const extFx = externalForce?.fx ?? 0;
  const extFy = externalForce?.fy ?? 0;
  const shakeEnergy = Math.sqrt(extFx * extFx + extFy * extFy);
  const minDistSq = (collisionRadius * 2) ** 2;

  // 1. Repulsão entre partículas (otimizado: evita Math.sqrt desnecessário)
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[j].x - particles[i].x;
      const dy = particles[j].y - particles[i].y;
      const distSq = dx * dx + dy * dy;
      if (distSq < minDistSq && distSq > 0) {
        const dist = Math.sqrt(distSq);
        const force = (repulsionStrength * (collisionRadius * 2 - dist)) / dist;
        const fx = dx * force;
        const fy = dy * force;
        particles[i].vx -= fx;
        particles[i].vy -= fy;
        particles[j].vx += fx;
        particles[j].vy += fy;
      }
    }
  }

  // 2. Atualização individual
  for (const p of particles) {
    // damping adaptativo
    const adaptiveDamping = shakeEnergy > 0.002 ? damping * 0.97 : damping;
    p.vx *= adaptiveDamping;
    p.vy *= adaptiveDamping;

    // impulso do giroscópio (ou força externa)
    if (shakeEnergy > 0.001) {
      const angle = smoothNoise(p.noiseSeed * 3.7, t * 0.3) * Math.PI * 2;
      const impulse = shakeEnergy * 3.5;
      p.vx += Math.cos(angle) * impulse;
      p.vy += Math.sin(angle) * impulse;
    }

    // thermal noise
    const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
    if (speed < minSpeed) {
      p.vx += smoothNoise(p.noiseSeed,      t) * noiseStrength;
      p.vy += smoothNoise(p.noiseSeed + 50, t) * noiseStrength;
    }

    // clamp velocidade
    const speedAfter = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
    if (speedAfter > maxSpeed) {
      p.vx = (p.vx / speedAfter) * maxSpeed;
      p.vy = (p.vy / speedAfter) * maxSpeed;
    }

    p.x += p.vx;
    p.y += p.vy;

    // bounce com obstáculos
    if (obstacles) {
      const r = collisionRadius;
      for (const obs of obstacles) {
        if (
          p.x + r > obs.x && p.x - r < obs.x + obs.w &&
          p.y + r > obs.y && p.y - r < obs.y + obs.h
        ) {
          const overlapLeft  = (p.x + r) - obs.x;
          const overlapRight = (obs.x + obs.w) - (p.x - r);
          const overlapTop   = (p.y + r) - obs.y;
          const overlapBot   = (obs.y + obs.h) - (p.y - r);
          const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBot);
          if (minOverlap === overlapLeft)  { p.x = obs.x - r;           p.vx = -Math.abs(p.vx); }
          else if (minOverlap === overlapRight) { p.x = obs.x + obs.w + r; p.vx =  Math.abs(p.vx); }
          else if (minOverlap === overlapTop)   { p.y = obs.y - r;          p.vy = -Math.abs(p.vy); }
          else                                  { p.y = obs.y + obs.h + r;  p.vy =  Math.abs(p.vy); }
        }
      }
    }

    // bounce nas bordas
    if (p.x < margin)          { p.x = margin;          p.vx =  Math.abs(p.vx); }
    if (p.x > containerWidth - margin)  { p.x = containerWidth - margin;  p.vx = -Math.abs(p.vx); }
    if (p.y < margin)          { p.y = margin;           p.vy =  Math.abs(p.vy); }
    if (p.y > containerHeight - margin) { p.y = containerHeight - margin; p.vy = -Math.abs(p.vy); }
  }
}
