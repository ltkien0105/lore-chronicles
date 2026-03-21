/**
 * Region icon sprite component with hover detection and click navigation
 * Swaps between base and hover texture variants on pointer events
 * Displays region name text below the icon
 * Implements click-vs-drag detection with 5px threshold
 */

import { memo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import type { RegionConfig } from "./region-config";
import { Z_LAYERS } from "./region-config";
import { BeaufortforLOLBold } from "@/assets/fonts";
import { ZOOM_DEFAULT } from "@/lib/constants";
import { getEffectiveZoom } from "@/lib/utils";

interface RegionIconProps {
  region: RegionConfig;
  baseTexture: THREE.Texture;
  hoverTexture: THREE.Texture;
  isHovered: boolean;
  onHover: (regionId: string | null) => void;
  onRegionClick?: (slug: string) => void;
}

// Pointer delta tracking constants
const DRAG_THRESHOLD_PX = 5; // Pointer movement threshold to distinguish click from drag

function RegionIconInner({
  region,
  baseTexture,
  hoverTexture,
  isHovered,
  onHover,
  onRegionClick,
}: RegionIconProps) {
  const { camera, size } = useThree();
  const spriteRef = useRef<THREE.Sprite>(null);

  // Use ref instead of state to avoid unnecessary re-renders in R3F
  const pointerStartRef = useRef<{ x: number; y: number } | null>(null);

  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    // Store initial pointer position
    pointerStartRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();

    // Only fire click if pointer hasn't moved more than threshold (drag detection)
    if (pointerStartRef.current && onRegionClick) {
      const deltaX = Math.abs(e.clientX - pointerStartRef.current.x);
      const deltaY = Math.abs(e.clientY - pointerStartRef.current.y);
      const delta = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      if (delta < DRAG_THRESHOLD_PX) {
        onRegionClick(region.id);
      }
    }

    pointerStartRef.current = null;
  };

  const handlePointerOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    onHover(region.id);
    document.body.style.cursor = "pointer";
  };

  const handlePointerOut = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    onHover(null);
    document.body.style.cursor = "auto";
  };

  const currentTexture = isHovered ? hoverTexture : baseTexture;

  // Calculate text position below icon
  const textY = region.position[1] - region.iconSize[1] / 2;

  useFrame(() => {
    if (spriteRef.current) {
      const effectiveZoom = getEffectiveZoom(
        camera as THREE.PerspectiveCamera,
        size,
      );
      const sizeFactor = ZOOM_DEFAULT / (effectiveZoom === 0 ? 1 : effectiveZoom);
      spriteRef.current.scale.set(
        region.iconSize[0] * sizeFactor,
        region.iconSize[1] * sizeFactor,
        region.iconSize[2],
      );
    }
  });

  return (
    <group>
      <sprite
        ref={spriteRef}
        position={[region.position[0], region.position[1], Z_LAYERS.ICONS]}
        scale={region.iconSize}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
      >
        <spriteMaterial
          map={currentTexture}
          transparent
          depthWrite={false}
          depthTest={false}
        />
      </sprite>
      <Text
        position={[region.position[0], textY, Z_LAYERS.TEXT]}
        fontSize={1.3}
        color={"#ffffff"}
        anchorX="center"
        anchorY="top"
        outlineWidth={0.02}
        outlineColor="#000000"
        fontWeight="bold"
        font={BeaufortforLOLBold}
      >
        {region.name.toUpperCase()}
        <meshBasicMaterial
          attach="material"
          depthTest={false}
          depthWrite={false}
        />
      </Text>
    </group>
  );
}

export const RegionIcon = memo(RegionIconInner);
