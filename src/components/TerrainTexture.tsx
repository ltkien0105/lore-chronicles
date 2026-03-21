import * as THREE from "three";
import { PinManager } from "./pins/PinManager";
import { RegionManager } from "./regions/RegionManager";
import { useFrame, useThree } from "@react-three/fiber";
import { useRef } from "react";
import { TerrainLodMesh } from "./terrain-lod";
import { getEffectiveZoom } from "@/lib/utils";

// X-axis tilt configuration
const TILT_CONFIG = {
  MIN_ANGLE: 0, // Flat at min zoom (radians)
  MAX_ANGLE: Math.PI / 6, // ~30° at max zoom (radians)
  MIN_ZOOM: 15, // Start tilting from this zoom level
  MAX_ZOOM: 60, // Max tilt at this zoom level
  EASING: 0.08, // Lerp factor for smooth transition
};

export default function TerrainTexture({
  planeSize,
  onRegionClick,
}: {
  planeSize: number;
  onRegionClick?: (slug: string) => void;
}) {
  const { camera, size } = useThree();

  // Use ref to track visibility without causing re-renders
  const pinGroupRef = useRef<THREE.Group>(null);
  const regionGroupRef = useRef<THREE.Group>(null);
  const terrainGroupRef = useRef<THREE.Group>(null);

  // Track current tilt angle for smooth animation
  const currentTilt = useRef(0);

  useFrame(() => {
    const effectiveZoom = getEffectiveZoom(
      camera as THREE.PerspectiveCamera,
      size,
    );

    if (pinGroupRef.current) {
      pinGroupRef.current.visible = effectiveZoom >= 35;
    }

    if (regionGroupRef.current) {
      regionGroupRef.current.visible = effectiveZoom < 35;
    }

    // Calculate target tilt based on zoom level
    if (terrainGroupRef.current) {
      // Normalize zoom to 0-1 range within tilt range
      const zoomNormalized = THREE.MathUtils.clamp(
        (effectiveZoom - TILT_CONFIG.MIN_ZOOM) /
          (TILT_CONFIG.MAX_ZOOM - TILT_CONFIG.MIN_ZOOM),
        0,
        1,
      );

      // Calculate target tilt angle (negative for backward tilt)
      const targetTilt =
        -TILT_CONFIG.MIN_ANGLE -
        zoomNormalized * (TILT_CONFIG.MAX_ANGLE - TILT_CONFIG.MIN_ANGLE);

      // Smooth lerp to target
      currentTilt.current = THREE.MathUtils.lerp(
        currentTilt.current,
        targetTilt,
        TILT_CONFIG.EASING,
      );

      // Apply X-axis rotation around camera target (not world origin)
      // This prevents the bottom of map from rotating out of view
      const cameraTarget = camera.position;

      // Reset transform
      terrainGroupRef.current.position.set(0, 0, 0);
      terrainGroupRef.current.rotation.set(0, 0, 0);

      // Translate to pivot point (camera Y position), rotate, translate back
      // This rotates around the camera's view center instead of world origin
      const pivotY = cameraTarget.y;

      // Apply rotation around pivot point
      terrainGroupRef.current.position.y = -pivotY;
      terrainGroupRef.current.rotation.x = currentTilt.current;
      terrainGroupRef.current.position.y +=
        pivotY * Math.cos(currentTilt.current);
      terrainGroupRef.current.position.z =
        -pivotY * Math.sin(currentTilt.current);
    }
  });

  return (
    <>
      <group ref={terrainGroupRef}>
        {/* LOD Terrain: switches between low-res (2048x2048) and high-res tiles (8x8 grid of 1024x1024) */}
        <TerrainLodMesh planeSize={planeSize} />

        <group ref={regionGroupRef}>
          <RegionManager planeSize={planeSize} onRegionClick={onRegionClick} />
        </group>
        <group ref={pinGroupRef}>
          <PinManager />
        </group>
      </group>
    </>
  );
}
