/**
 * Region icon sprite component with hover detection
 * Swaps between base and hover texture variants on pointer events
 * Displays region name text below the icon
 */

import * as THREE from "three";
import { memo, useRef } from "react";
import { Text, type TextProps } from "@react-three/drei";
import type { PinConfig, PinType } from "./pin-config";
import { useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { Z_LAYERS } from "../regions/region-config";
import { ZOOM_DEFAULT } from "@/lib/constants";
import { getEffectiveZoom } from "@/lib/utils";
import { TOWN_MED_PIN_ICON_SIZE, Pin } from "./pin-config";
import { usePinTextures } from "./use-pin-textures";
// import { BeaufortforLOLBold } from "@/assets/fonts";

interface PinIconProps {
  pin: PinConfig;
  isHovered: boolean;
  onHover: (regionId: string | null) => void;
}

function PinIconInner({ pin, isHovered, onHover }: PinIconProps) {
  const { camera, size } = useThree();
  const spriteRef = useRef<THREE.Sprite>(null);
  const textRef = useRef<TextProps>(null);
  const textX =
    pin.anchorX === "right"
      ? pin.position[0] - TOWN_MED_PIN_ICON_SIZE.base[0] / 2 - 0.2
      : pin.position[0] + TOWN_MED_PIN_ICON_SIZE.base[0] / 2 + 0.2; // position text to the right of the icon
  const pintextures = usePinTextures();

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

  const getCurrentTexture = (pinType: PinType, isHovered: boolean) => {
    if (pinType === Pin.TOWN_MED) {
      return isHovered
        ? pintextures["town-med"].hover
        : pintextures["town-med"].base;
    }

    return pintextures.town; // Default to town texture for other pin types (can be expanded in the future)
  };

  const getCurrentIconSize = (
    pinType: PinType,
    isHovered: boolean,
  ): [number, number, number] => {
    if (pinType === Pin.TOWN_MED) {
      return isHovered
        ? TOWN_MED_PIN_ICON_SIZE.hover
        : TOWN_MED_PIN_ICON_SIZE.base;
    }

    return [0.7, 0.7, 1]; // Default size for town pins (can be expanded in the future)
  };

  const currentTexture = getCurrentTexture(pin.pinType, isHovered);
  const currentIconSize = getCurrentIconSize(pin.pinType, isHovered);

  useFrame(() => {
    if (textRef.current) {
      const effectiveZoom = getEffectiveZoom(
        camera as THREE.PerspectiveCamera,
        size,
      );
      textRef.current.fontSize = 1 * (ZOOM_DEFAULT / effectiveZoom); // Adjust text size based on zoom to keep it readable
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
