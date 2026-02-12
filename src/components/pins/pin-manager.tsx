import { useState, useCallback, memo } from "react";
import { PINS } from "./pin-config";
import { usePinTextures } from "./use-pin-textures";
import { PinIcon } from "./PinIcon";

/**
 * Region manager component - container for all region icons and terrain overlays.
 * Manages hover state and coordinates rendering of all region components.
 */
function PinManagerInner() {
  const [hoveredPin, setHoveredPin] = useState<string | null>(null);
  const textures = usePinTextures();

  const handleHover = useCallback((pinId: string | null) => {
    setHoveredPin(pinId);
  }, []);

  return (
    <group>
      {PINS.map((pin) => (
        <PinIcon
          key={`pin-${pin.id}`}
          pin={pin}
          baseTexture={textures.base}
          hoverTexture={textures.hover}
          isHovered={hoveredPin === pin.id}
          onHover={handleHover}
        />
      ))}
    </group>
  );
}

export const PinManager = memo(PinManagerInner);
