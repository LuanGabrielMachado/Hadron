/**
 * Sequência de Halton — gera números quasi-aleatórios de distribuição uniforme.
 * Usado para posição inicial e semente de noise determinístico.
 */
export function halton(index: number, base: number): number {
  let f = 1, r = 0, i = index;
  while (i > 0) {
    f /= base;
    r += f * (i % base);
    i = Math.floor(i / base);
  }
  return r;
}
