/**
 * Region terrain overlay component with animated opacity fade
 * Displays colored terrain mask when region is hovered
 */

import { memo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import type { RegionConfig } from "./region-config";
import { Z_LAYERS } from "./region-config";

interface RegionTerrainOverlayProps {
  region: RegionConfig;
  terrainTexture: THREE.Texture;
  isHovered: boolean;
  planeSize: number;
}

// Animation constants
const TARGET_OPACITY = 0.6;
const FADE_SPEED = 8; // Higher = faster fade

function RegionTerrainOverlayInner({
  region,
  terrainTexture,
  isHovered,
  planeSize,
}: RegionTerrainOverlayProps) {
  const materialRef = useRef<THREE.MeshBasicMaterial>(null);
  const currentOpacity = useRef(0);

  // Animate opacity with ease-out using exponential decay
  useFrame((_, delta) => {
    if (!materialRef.current) return;

    const targetOpacity = isHovered ? TARGET_OPACITY : 0;
    const diff = targetOpacity - currentOpacity.current;

    // Exponential decay for smooth ease-out
    currentOpacity.current += diff * FADE_SPEED * delta;

    // Clamp very small values to 0 to avoid floating point issues
    if (Math.abs(diff) < 0.001) {
      currentOpacity.current = targetOpacity;
    }

    materialRef.current.opacity = currentOpacity.current;
  });

  const color = new THREE.Color(region.color);

  return (
    <mesh position={[0, 0, Z_LAYERS.OVERLAY]}>
      <planeGeometry args={[planeSize, planeSize]} />
      <meshBasicMaterial
        ref={materialRef}
        map={terrainTexture}
        color={color}
        transparent
        opacity={0}
        depthWrite={false}
        depthTest={true}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

export const RegionTerrainOverlay = memo(RegionTerrainOverlayInner);
