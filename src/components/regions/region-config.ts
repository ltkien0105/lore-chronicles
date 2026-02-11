/**
 * Region configuration for map hover effects
 * Positions calibrated for 100x100 plane with terrain_z1.jpg
 */

const ICON_SIZE: [number, number, number] = [5, 5, 1];

export interface RegionConfig {
  id: string;
  name: string;
  position: [number, number]; // [x, y] on plane
  iconSize: [number, number, number]; // [width, height, depth]
  color: string; // hex for terrain tinting
  hasTerrain: boolean; // some regions may not have terrain masks
}

export const REGIONS: RegionConfig[] = [
  {
    id: "bilgewater",
    name: "Bilgewater",
    position: [27.2, -9],
    iconSize: ICON_SIZE,
    color: "#20B2AA",
    hasTerrain: true,
  },
  {
    id: "demacia",
    name: "Demacia",
    position: [-20.8, 2.7],
    iconSize: ICON_SIZE,
    color: "#4A90D9",
    hasTerrain: true,
  },
  {
    id: "freljord",
    name: "Freljord",
    position: [-16.9, 13.2],
    iconSize: ICON_SIZE,
    color: "#87CEEB",
    hasTerrain: true,
  },
  {
    id: "ionia",
    name: "Ionia",
    position: [26.1, 10.7],
    iconSize: ICON_SIZE,
    color: "#DA70D6",
    hasTerrain: true,
  },
  {
    id: "ixtal",
    name: "Ixtal",
    position: [13.5, -16.5],
    iconSize: ICON_SIZE,
    color: "#228B22",
    hasTerrain: true,
  },
  {
    id: "noxus",
    name: "Noxus",
    position: [-0.7, 7.4],
    iconSize: ICON_SIZE,
    color: "#C9302C",
    hasTerrain: true,
  },
  {
    id: "piltover-zaun",
    name: "Piltover & Zaun",
    position: [9.4, -5.7],
    iconSize: ICON_SIZE.map((value, idx) =>
      idx === 1 ? value * 2 : value,
    ) as [number, number, number],
    color: "#FFD700",
    hasTerrain: false, // no terrain mask available
  },
  {
    id: "shadow-isles",
    name: "Shadow Isles",
    position: [34.7, -19.5],
    iconSize: ICON_SIZE,
    color: "#2E8B57",
    hasTerrain: true,
  },
  {
    id: "shurima",
    name: "Shurima",
    position: [3, -17.3],
    iconSize: ICON_SIZE,
    color: "#DAA520",
    hasTerrain: true,
  },
  {
    id: "targon",
    name: "Targon",
    position: [-10.9, -19.5],
    iconSize: ICON_SIZE,
    color: "#9370DB",
    hasTerrain: true,
  },
];

// Z-layer ordering constants
export const Z_LAYERS = {
  TERRAIN: 0,
  OVERLAY: 0.1,
  ICONS: 0.2,
  TEXT: 0.3,
} as const;
