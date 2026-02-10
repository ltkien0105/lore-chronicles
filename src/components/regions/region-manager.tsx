import { useState, useCallback } from "react";
import { REGIONS } from "./region-config";
import { useRegionTextures } from "./use-region-textures";
import { RegionIcon } from "./region-icon";
import { RegionTerrainOverlay } from "./region-terrain-overlay";
import { DebugPositionLogger } from "./debug-position-logger";

interface RegionManagerProps {
  planeSize: number;
}

/**
 * Region manager component - container for all region icons and terrain overlays.
 * Manages hover state and coordinates rendering of all region components.
 */
export function RegionManager({ planeSize }: RegionManagerProps) {
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);
  const textures = useRegionTextures();

  const handleHover = useCallback((regionId: string | null) => {
    setHoveredRegion(regionId);
  }, []);

  return (
    <group>
      {/* Debug: Click anywhere to log position. Remove after calibration. */}
      <DebugPositionLogger planeSize={planeSize} />

      {/* Render terrain overlays first (lower z-index) */}
      {REGIONS.map((region) => {
        if (!region.hasTerrain || !textures.terrains[region.id]) return null;

        return (
          <RegionTerrainOverlay
            key={`terrain-${region.id}`}
            region={region}
            terrainTexture={textures.terrains[region.id]}
            isHovered={hoveredRegion === region.id}
            planeSize={planeSize}
          />
        );
      })}

      {/* Render icons on top */}
      {REGIONS.map((region) => {
        const iconTextures = textures.icons[region.id];
        if (!iconTextures) return null;

        return (
          <RegionIcon
            key={`icon-${region.id}`}
            region={region}
            baseTexture={iconTextures.base}
            hoverTexture={iconTextures.hover}
            isHovered={hoveredRegion === region.id}
            onHover={handleHover}
          />
        );
      })}
    </group>
  );
}
