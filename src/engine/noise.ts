/**
 * Ruído suave determinístico, baseado em seno.
 * @param seed - semente única da partícula
 * @param t - frame atual
 * @returns valor entre -1 e 1
 */
export function smoothNoise(seed: number, t: number): number {
  return Math.sin(seed * 127.1 + t * 0.018) * Math.cos(seed * 311.7 + t * 0.011);
}
