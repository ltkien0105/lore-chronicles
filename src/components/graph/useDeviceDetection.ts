/**
 * Hook for device detection
 * Detects mobile devices and low-performance hardware
 */

import { useState, useEffect } from "react";

export function useDeviceDetection() {
  const [isMobile, setIsMobile] = useState(false);
  const [isLowPerfDevice, setIsLowPerfDevice] = useState(false);

  useEffect(() => {
    // Check screen size
    const mql = window.matchMedia("(max-width: 768px)");
    setIsMobile(mql.matches);

    // Check for low performance indicators
    const nav = navigator as any;
    const hasLowMemory = nav.deviceMemory && nav.deviceMemory < 4;
    const hasSlowCPU = navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4;
    setIsLowPerfDevice(hasLowMemory || hasSlowCPU);

    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  return {
    isMobile,
    isLowPerfDevice,
    shouldSimplify: isMobile || isLowPerfDevice,
  };
}
