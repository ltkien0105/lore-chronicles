/**
 * Region icon sprite component with hover detection
 * Swaps between base and hover texture variants on pointer events
 */

import { memo, useRef } from "react";
import * as THREE from "three";
import type { ThreeEvent } from "@react-three/fiber";
import type { RegionConfig } from "./region-config";
import { Z_LAYERS } from "./region-config";

interface RegionIconProps {
  region: RegionConfig;
  baseTexture: THREE.Texture;
  hoverTexture: THREE.Texture;
  isHovered: boolean;
  onHover: (regionId: string | null) => void;
}

function RegionIconInner({
  region,
  baseTexture,
  hoverTexture,
  isHovered,
  onHover,
}: RegionIconProps) {
  const spriteRef = useRef<THREE.Sprite>(null);

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

  return (
    <sprite
      ref={spriteRef}
      position={[region.position[0], region.position[1], Z_LAYERS.ICONS]}
      scale={region.iconSize}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    >
      <spriteMaterial
        map={currentTexture}
        transparent
        depthWrite={false}
        depthTest={true}
      />
    </sprite>
  );
}

export const RegionIcon = memo(RegionIconInner);
