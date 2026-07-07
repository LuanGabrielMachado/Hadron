'use client';

import { useRef, useEffect, useCallback } from 'react';
import { initializeParticles, tickParticles } from '../engine';
import type { Particle, PhysicsOptions } from '../engine';

/**
 * Hook React para gerenciar partículas com física.
 * 
 * Este hook é um orquestrador que:
 * 1. Inicializa partículas com distribuição Halton
 * 2. Roda um loop requestAnimationFrame
 * 3. Chama tickParticles para calcular a física
 * 4. Aplica as posições diretamente no DOM (zero re-renders)
 * 
 * @param count - número de partículas
 * @param containerRef - ref do container DOM
 * @param particleRefs - ref array dos elementos das partículas
 * @param options - opções de configuração da física
 */
export function usePhysicsParticles(
  count: number,
  containerRef: React.RefObject<HTMLElement | null>,
  particleRefs: React.RefObject<(HTMLElement | null)[]>,
  options: PhysicsOptions = {},
) {
  const {
    collisionRadius = 14,
    repulsionStrength = 1.4,
    maxSpeed = 1.2,
    damping = 0.994,
    minSpeed = 0.08,
    noiseStrength = 0.012,
    externalForceRef,
    obstaclesRef,
  } = options;

  const particles = useRef<Particle[]>([]);
  const rafRef = useRef<number | null>(null);
  const frameRef = useRef(0);

  const init = useCallback((w: number, h: number) => {
    particles.current = initializeParticles(count, w, h, collisionRadius);
  }, [count, collisionRadius]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || count === 0) return;
    const rect = container.getBoundingClientRect();
    const w = rect.width || container.offsetWidth;
    const h = rect.height || container.offsetHeight;
    if (w === 0 || h === 0) return;

    init(w, h);
    frameRef.current = 0;

    const tick = () => {
      const cw = container.offsetWidth;
      const ch = container.offsetHeight;

      // Chama o motor de física principal
      tickParticles(
        particles.current,
        frameRef.current++,
        cw, ch,
        externalForceRef?.current ?? null,
        obstaclesRef?.current ?? null,
        options,
      );

      // Aplica posições no DOM (zero re-renders)
      for (let i = 0; i < particles.current.length; i++) {
        const el = particleRefs.current?.[i];
        if (el) {
          el.style.left = `${particles.current[i].x}px`;
          el.style.top  = `${particles.current[i].y}px`;
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [count, options, init, containerRef, particleRefs, externalForceRef, obstaclesRef]);
}
