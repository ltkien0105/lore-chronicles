/**
 * Debug component to log world position on click.
 * Click anywhere on the plane to see coordinates in console.
 * Remove this component after position calibration is complete.
 */

import { useRef } from "react";
import type { ThreeEvent } from "@react-three/fiber";

interface DebugPositionLoggerProps {
  planeSize: number;
}

export function DebugPositionLogger({ planeSize }: DebugPositionLoggerProps) {
  const lastClick = useRef<{ x: number; y: number } | null>(null);

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    const { x, y } = e.point;

    // Round to 1 decimal for cleaner output
    const roundedX = Math.round(x * 10) / 10;
    const roundedY = Math.round(y * 10) / 10;

    lastClick.current = { x: roundedX, y: roundedY };

    // Log to console with copy-paste friendly format
    console.log(`Position: [${roundedX}, ${roundedY}]`);
    console.log(`  // Copy for region-config.ts:`);
    console.log(`  position: [${roundedX}, ${roundedY}],`);
  };

  return (
    <mesh position={[0, 0, 0.05]} onClick={handleClick}>
      <planeGeometry args={[planeSize, planeSize]} />
      <meshBasicMaterial transparent opacity={0} depthWrite={false} />
    </mesh>
  );
}
