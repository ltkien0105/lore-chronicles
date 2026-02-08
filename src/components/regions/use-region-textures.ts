/**
 * Hook for preloading all region textures (icons + terrain masks)
 * Uses drei's useTexture for optimized loading within React Three Fiber
 */

import * as THREE from 'three';
import { useTexture } from '@react-three/drei';
import { REGIONS } from './region-config';

// Import all icon textures
import bilgewaterIcon from '@/assets/images/regions/bilgewater.png';
import bilgewaterHover from '@/assets/images/regions/bilgewater-hover.png';
import demaciaIcon from '@/assets/images/regions/demacia.png';
import demaciaHover from '@/assets/images/regions/demacia-hover.png';
import freljordIcon from '@/assets/images/regions/freljord.png';
import freljordHover from '@/assets/images/regions/freljord-hover.png';
import ioniaIcon from '@/assets/images/regions/ionia.png';
import ioniaHover from '@/assets/images/regions/ionia-hover.png';
import ixtalIcon from '@/assets/images/regions/ixtal.png';
import ixtalHover from '@/assets/images/regions/ixtal-hover.png';
import noxusIcon from '@/assets/images/regions/noxus.png';
import noxusHover from '@/assets/images/regions/noxus-hover.png';
import piltoverZaunIcon from '@/assets/images/regions/piltover-zaun.png';
import piltoverZaunHover from '@/assets/images/regions/piltover-zaun-hover.png';
import shadowIslesIcon from '@/assets/images/regions/shadow-isles.png';
import shadowIslesHover from '@/assets/images/regions/shadow-isles-hover.png';
import shurimaIcon from '@/assets/images/regions/shurima.png';
import shurimaHover from '@/assets/images/regions/shurima-hover.png';
import targonIcon from '@/assets/images/regions/targon.png';
import targonHover from '@/assets/images/regions/targon-hover.png';

// Import terrain masks
import bilgewaterTerrain from '@/assets/images/regions/terrain/bilgewater.png';
import demaciaTerrain from '@/assets/images/regions/terrain/demacia.png';
import freljordTerrain from '@/assets/images/regions/terrain/freljord.png';
import ioniaTerrain from '@/assets/images/regions/terrain/ionia.png';
import ixtalTerrain from '@/assets/images/regions/terrain/ixtal.png';
import noxusTerrain from '@/assets/images/regions/terrain/noxus.png';
import shadowIslesTerrain from '@/assets/images/regions/terrain/shadow-isles.png';
import shurimaTerrain from '@/assets/images/regions/terrain/shurima.png';
import targonTerrain from '@/assets/images/regions/terrain/targon.png';

// Icon texture paths by region ID
const ICON_PATHS: Record<string, { base: string; hover: string }> = {
  bilgewater: { base: bilgewaterIcon, hover: bilgewaterHover },
  demacia: { base: demaciaIcon, hover: demaciaHover },
  freljord: { base: freljordIcon, hover: freljordHover },
  ionia: { base: ioniaIcon, hover: ioniaHover },
  ixtal: { base: ixtalIcon, hover: ixtalHover },
  noxus: { base: noxusIcon, hover: noxusHover },
  'piltover-zaun': { base: piltoverZaunIcon, hover: piltoverZaunHover },
  'shadow-isles': { base: shadowIslesIcon, hover: shadowIslesHover },
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
  'shadow-isles': shadowIslesTerrain,
  shurima: shurimaTerrain,
  targon: targonTerrain,
};

export interface RegionTextures {
  icons: Record<string, { base: THREE.Texture; hover: THREE.Texture }>;
  terrains: Record<string, THREE.Texture>;
}

/**
 * Preloads all region textures for icons and terrain masks
 * Must be called within a React Three Fiber Canvas context
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
  const iconTextures = useTexture(allIconPaths);
  const terrainTextures = useTexture(allTerrainPaths);

  // Map textures back to region IDs
  const icons: RegionTextures['icons'] = {};
  const terrains: RegionTextures['terrains'] = {};

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
