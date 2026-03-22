/**
 * OrbitControls wrapper for graph camera control
 * Provides zoom, pan, and rotate with configured limits
 */

import { forwardRef } from "react";
import { OrbitControls } from "@react-three/drei";
import { GRAPH_CONFIG } from "@/lib/graph-constants";
import type { OrbitControls as OrbitControlsType } from "three-stdlib";

interface GraphControlsProps {
  onBackgroundClick?: () => void;
}

export const GraphControls = forwardRef<OrbitControlsType, GraphControlsProps>(
  ({ onBackgroundClick }, ref) => {
    return (
      <OrbitControls
        ref={ref}
        enableDamping
        dampingFactor={GRAPH_CONFIG.orbitDamping}
        minDistance={GRAPH_CONFIG.zoomMin}
        maxDistance={GRAPH_CONFIG.zoomMax}
        // Enable rotation
        enableRotate
        // Enable zoom
        enableZoom
        // Enable pan
        enablePan
        // Mouse buttons
        mouseButtons={{
          LEFT: 0, // Rotate
          MIDDLE: 1, // Zoom
          RIGHT: 2, // Pan
        }}
        // Touch controls
        touches={{
          ONE: 0, // Rotate
          TWO: 2, // Zoom + pan
        }}
      />
    );
  }
);

GraphControls.displayName = "GraphControls";
