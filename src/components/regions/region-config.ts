/**
 * Region configuration for map hover effects
 * Positions calibrated for 100x100 plane with terrain_z1.jpg
 */

export interface RegionConfig {
  id: string;
  name: string;
  position: [number, number]; // [x, y] on plane
  iconSize: number;
  color: string; // hex for terrain tinting
  hasTerrain: boolean; // some regions may not have terrain masks
}

export const REGIONS: RegionConfig[] = [
  {
    id: 'bilgewater',
    name: 'Bilgewater',
    position: [-28, -8],
    iconSize: 4,
    color: '#20B2AA',
    hasTerrain: true,
  },
  {
    id: 'demacia',
    name: 'Demacia',
    position: [-18, 18],
    iconSize: 4,
    color: '#4A90D9',
    hasTerrain: true,
  },
  {
    id: 'freljord',
    name: 'Freljord',
    position: [-5, 35],
    iconSize: 4,
    color: '#87CEEB',
    hasTerrain: true,
  },
  {
    id: 'ionia',
    name: 'Ionia',
    position: [35, 18],
    iconSize: 4,
    color: '#DA70D6',
    hasTerrain: true,
  },
  {
    id: 'ixtal',
    name: 'Ixtal',
    position: [-8, -28],
    iconSize: 4,
    color: '#228B22',
    hasTerrain: true,
  },
  {
    id: 'noxus',
    name: 'Noxus',
    position: [8, 18],
    iconSize: 4,
    color: '#C9302C',
    hasTerrain: true,
  },
  {
    id: 'piltover-zaun',
    name: 'Piltover & Zaun',
    position: [-5, 5],
    iconSize: 4,
    color: '#FFD700',
    hasTerrain: false, // no terrain mask available
  },
  {
    id: 'shadow-isles',
    name: 'Shadow Isles',
    position: [-42, 5],
    iconSize: 4,
    color: '#2E8B57',
    hasTerrain: true,
  },
  {
    id: 'shurima',
    name: 'Shurima',
    position: [12, -18],
    iconSize: 4,
    color: '#DAA520',
    hasTerrain: true,
  },
  {
    id: 'targon',
    name: 'Targon',
    position: [-22, -22],
    iconSize: 4,
    color: '#9370DB',
    hasTerrain: true,
  },
];

// Z-layer ordering constants
export const Z_LAYERS = {
  TERRAIN: 0,
  OVERLAY: 0.1,
  ICONS: 0.2,
} as const;
