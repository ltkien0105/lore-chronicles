/**
 * Hook for preloading all region textures (icons + terrain masks)
 * Uses drei's useTexture for optimized loading within React Three Fiber
 */

import * as THREE from "three";
import { useTexture } from "@react-three/drei";
import { REGIONS } from "./region-config";

// Import all icon textures
import {
  bilgewaterIcon,
  bilgewaterHover,
  demaciaIcon,
  demaciaHover,
  freljordIcon,
  freljordHover,
  ioniaIcon,
  ioniaHover,
  ixtalIcon,
  ixtalHover,
  noxusIcon,
  noxusHover,
  piltoverZaunIcon,
  piltoverZaunHover,
  shadowIslesIcon,
  shadowIslesHover,
  shurimaIcon,
  shurimaHover,
  targonIcon,
  targonHover,
} from "@/assets/images/regions";

// Import terrain masks
import {
  bilgewaterTerrain,
  demaciaTerrain,
  freljordTerrain,
  ioniaTerrain,
  ixtalTerrain,
  noxusTerrain,
  shadowIslesTerrain,
  shurimaTerrain,
  targonTerrain,
} from "@/assets/images/regions/terrain";

// Icon texture paths by region ID
const ICON_PATHS: Record<string, { base: string; hover: string }> = {
  bilgewater: { base: bilgewaterIcon, hover: bilgewaterHover },
  demacia: { base: demaciaIcon, hover: demaciaHover },
  freljord: { base: freljordIcon, hover: freljordHover },
  ionia: { base: ioniaIcon, hover: ioniaHover },
  ixtal: { base: ixtalIcon, hover: ixtalHover },
  noxus: { base: noxusIcon, hover: noxusHover },
  "piltover-zaun": { base: piltoverZaunIcon, hover: piltoverZaunHover },
  "shadow-isles": { base: shadowIslesIcon, hover: shadowIslesHover },
  shurima: { base: shurimaIcon, hover: shurimaHover },
  targon: { base: targonIcon, hover: targonHover },
};

// Terrain texture paths by region ID
const TERRAIN_PATHS: Record<string, string> = {
  bilgewater: bilgewaterTerrain,
  demacia: demaciaTerrain,
  freljord: freljordTerrain,
  ionia: ioniaTerrain,
  ixtal: ixtalTerrain,
  noxus: noxusTerrain,
  "shadow-isles": shadowIslesTerrain,
  shurima: shurimaTerrain,
  targon: targonTerrain,
};

export interface RegionTextures {
  icons: Record<string, { base: THREE.Texture; hover: THREE.Texture }>;
  terrains: Record<string, THREE.Texture>;
}

/**
 * Preloads all region textures for icons and terrain masks.
 * Must be called within a React Three Fiber Canvas context.
 */
export function useRegionTextures(): RegionTextures {
  // Collect all texture paths for batch loading
  const allIconPaths: string[] = [];
  const allTerrainPaths: string[] = [];

  REGIONS.forEach((region) => {
    const iconPaths = ICON_PATHS[region.id];
    if (iconPaths) {
      allIconPaths.push(iconPaths.base, iconPaths.hover);
    }
    if (region.hasTerrain && TERRAIN_PATHS[region.id]) {
      allTerrainPaths.push(TERRAIN_PATHS[region.id]);
    }
  });

  // Load all textures
  const iconTextures = useTexture(allIconPaths, (textures) => {
    // Disable premultiplied alpha to preserve original colors
    const textureArray = Array.isArray(textures) ? textures : [textures];
    textureArray.forEach((texture) => {
      texture.premultiplyAlpha = false;
      texture.needsUpdate = true;
    });
  });
  const terrainTextures = useTexture(allTerrainPaths);

  // Map textures back to region IDs
  const icons: RegionTextures["icons"] = {};
  const terrains: RegionTextures["terrains"] = {};

  let iconIndex = 0;
  let terrainIndex = 0;

  REGIONS.forEach((region) => {
    const iconPaths = ICON_PATHS[region.id];
    if (iconPaths) {
      icons[region.id] = {
        base: iconTextures[iconIndex++],
        hover: iconTextures[iconIndex++],
      };
    }
    if (region.hasTerrain && TERRAIN_PATHS[region.id]) {
      terrains[region.id] = terrainTextures[terrainIndex++];
    }
  });

  return { icons, terrains };
}

// Export for external access if needed
export { ICON_PATHS, TERRAIN_PATHS };
