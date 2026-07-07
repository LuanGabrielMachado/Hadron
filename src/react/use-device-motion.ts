'use client';

import { useEffect, useRef } from 'react';
import { deviceMotionForce, startDeviceMotion } from '../device-motion/singleton';

/**
 * Hook React para gerenciar o listener de DeviceMotion.
 * 
 * Este hook inicia o listener de movimento do dispositivo e retorna
 * uma ref estável com a força externa atualizada.
 * 
 * @returns ref com a força externa { fx, fy } do giroscópio
 */
export function useDeviceMotion() {
  const motionRef = useRef(deviceMotionForce);
  
  useEffect(() => {
    startDeviceMotion();
  }, []);
  
  return motionRef;
}
