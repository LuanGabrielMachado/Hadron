export interface ExternalForce {
  fx: number;
  fy: number;
}

export interface ObstacleRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/**
 * Opções de configuração do motor de física.
 * 
 * Nota sobre refs: Para compatibilidade com React e vanilla JS, as refs
 * devem ser objetos com a propriedade `.current`. Em React, use useRef.
 * Em vanilla, crie um objeto simples { current: valor }.
 */
export interface PhysicsOptions {
  /** Raio de colisão entre partículas (px) */
  collisionRadius?: number;
  /** Força de repulsão entre partículas */
  repulsionStrength?: number;
  /** Velocidade máxima (px/frame) */
  maxSpeed?: number;
  /** Amortecimento por frame (0–1, próximo de 1 = muito lento) */
  damping?: number;
  /** Velocidade mínima — abaixo disso injeta thermal noise */
  minSpeed?: number;
  /** Intensidade do thermal noise (força suave por frame) */
  noiseStrength?: number;
  /**
   * Ref com força externa { fx, fy } lida a cada frame.
   * Valores tipicamente muito pequenos (0.001–0.005).
   * Pode ser uma React.RefObject ou qualquer objeto { current: T }.
   */
  externalForceRef?: { current: ExternalForce | null | undefined };
  /**
   * Zonas retangulares de exclusão — partículas ricocheteiam nelas.
   * Coordenadas relativas ao container. Pode ser uma React.RefObject
   * ou qualquer objeto { current: T }.
   */
  obstaclesRef?: { current: ObstacleRect[] | null | undefined };
}
