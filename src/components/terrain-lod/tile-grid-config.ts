/**
 * Configuration for the 8x8 tile grid LOD system
 * Tiles numbered 01-64, arranged row by row from top-left
 */

export const GRID_SIZE = 8;
export const TILE_COUNT = GRID_SIZE * GRID_SIZE;

// Zoom threshold for switching between low-res and high-res tiles
export const LOD_ZOOM_THRESHOLD = 35;

// How many tiles to load around the visible center (radius)
export const TILE_LOAD_RADIUS = 1;

/**
 * Convert tile index (1-64) to grid position (row, col)
 * Tiles are numbered 01-64 from top-left, row by row
 */
export function tileIndexToGridPosition(
  index: number
): { row: number; col: number } {
  const adjustedIndex = index - 1; // Convert 1-based to 0-based
  const row = Math.floor(adjustedIndex / GRID_SIZE);
  const col = adjustedIndex % GRID_SIZE;
  return { row, col };
}

/**
 * Convert grid position to tile index (1-64)
 */
export function gridPositionToTileIndex(row: number, col: number): number {
  return row * GRID_SIZE + col + 1;
}

/**
 * Calculate tile position in world coordinates
 * Origin (0,0) is at center of the plane
 */
export function getTileWorldPosition(
  row: number,
  col: number,
  planeSize: number
): { x: number; y: number } {
  const tileSize = planeSize / GRID_SIZE;
  const halfPlane = planeSize / 2;
  const halfTile = tileSize / 2;

  // Top-left tile (row 0, col 0) should be at top-left of the plane
  // Y increases upward in Three.js, so row 0 is at top (positive Y)
  const x = -halfPlane + col * tileSize + halfTile;
  const y = halfPlane - row * tileSize - halfTile;

  return { x, y };
}

/**
 * Get the grid position for a world coordinate
 */
export function worldPositionToGridPosition(
  worldX: number,
  worldY: number,
  planeSize: number
): { row: number; col: number } {
  const tileSize = planeSize / GRID_SIZE;
  const halfPlane = planeSize / 2;

  // Convert world position to grid coordinates
  const col = Math.floor((worldX + halfPlane) / tileSize);
  const row = Math.floor((halfPlane - worldY) / tileSize);

  // Clamp to valid range
  return {
    row: Math.max(0, Math.min(GRID_SIZE - 1, row)),
    col: Math.max(0, Math.min(GRID_SIZE - 1, col)),
  };
}

/**
 * Get tiles that should be loaded based on camera position
 * Returns array of tile indices (1-64)
 */
export function getTilesToLoad(
  centerRow: number,
  centerCol: number,
  radius: number = TILE_LOAD_RADIUS
): number[] {
  const tiles: number[] = [];

  for (let dr = -radius; dr <= radius; dr++) {
    for (let dc = -radius; dc <= radius; dc++) {
      const row = centerRow + dr;
      const col = centerCol + dc;

      if (row >= 0 && row < GRID_SIZE && col >= 0 && col < GRID_SIZE) {
        tiles.push(gridPositionToTileIndex(row, col));
      }
    }
  }

  return tiles;
}

/**
 * Format tile index to string (e.g., 1 -> "01", 10 -> "10")
 */
export function formatTileIndex(index: number): string {
  return index.toString().padStart(2, "0");
}
