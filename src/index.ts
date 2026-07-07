// Hadron - Motor de Física de Partículas
// Exporta o núcleo vanilla (zero dependências)

export { halton } from './engine/halton';
export { smoothNoise } from './engine/noise';
export { tickParticles } from './engine/tick-particles';
export type { Particle } from './engine/particle';
export type { PhysicsOptions, ExternalForce, ObstacleRect } from './engine/options';
