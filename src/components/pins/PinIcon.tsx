/**
 * Region icon sprite component with hover detection
 * Swaps between base and hover texture variants on pointer events
 * Displays region name text below the icon
 */

import * as THREE from "three";
import { memo, useRef } from "react";
import { Text, type TextProps } from "@react-three/drei";
import type { PinConfig } from "./pin-config";
import { useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { Z_LAYERS } from "../regions/region-config";
import { ZOOM_DEFAULT } from "@/lib/constants";
// import { BeaufortforLOLBold } from "@/assets/fonts";

interface PinIconProps {
  pin: PinConfig;
  baseTexture: THREE.Texture;
  hoverTexture: THREE.Texture;
  isHovered: boolean;
  onHover: (regionId: string | null) => void;
}

function PinIconInner({
  pin,
  baseTexture,
  hoverTexture,
  isHovered,
  onHover,
}: PinIconProps) {
  const { camera } = useThree();
  const spriteRef = useRef<THREE.Sprite>(null);
  const textRef = useRef<TextProps>(null);
  const textX =
    pin.anchorX === "right"
      ? pin.position[0] - pin.iconSize.base[0] / 2 - 0.2
      : pin.position[0] + pin.iconSize.base[0] / 2 + 0.2; // position text to the right of the icon

  const handlePointerOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    onHover(pin.id);
    document.body.style.cursor = "pointer";
  };

  const handlePointerOut = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    onHover(null);
    document.body.style.cursor = "auto";
  };

  const currentTexture = isHovered ? hoverTexture : baseTexture;
  const currentIconSize = isHovered ? pin.iconSize.hover : pin.iconSize.base;

  useFrame(() => {
    if (textRef.current) {
      textRef.current.fontSize = 1 * (ZOOM_DEFAULT / camera.zoom); // Adjust text size based on zoom to keep it readable
    }
  });

  return (
    <group>
      <sprite
        ref={spriteRef}
        position={[pin.position[0], pin.position[1], Z_LAYERS.PINS]}
        scale={currentIconSize}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        <spriteMaterial
          map={currentTexture}
          transparent
          depthWrite={false}
          depthTest={false}
        />
      </sprite>
      <Text
        ref={textRef}
        position={[textX, pin.position[1], Z_LAYERS.TEXT]}
        fontSize={0.5}
        color={"#ffffff"}
        anchorX={pin.anchorX || "left"}
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="#000000"
        fontWeight="bold"
        // font={BeaufortforLOLBold}
      >
        {pin.name}
        <meshBasicMaterial
          attach="material"
          depthTest={false}
          depthWrite={false}
        />
      </Text>
    </group>
  );
}

export const PinIcon = memo(PinIconInner);
