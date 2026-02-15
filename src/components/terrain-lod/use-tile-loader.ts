import { useCallback } from "react";
import * as THREE from "three";
import { useTileStore } from "./use-tile-store";
import { formatTileIndex } from "./tile-grid-config";

// Dynamic import map for tile textures
// Vite will generate optimized chunks for these
const tileModules = import.meta.glob<{ default: string }>(
  "/src/images/tiles/en_us/terrain_z2_*.jpg",
  { eager: false }
);

/**
 * Hook to dynamically load tile textures on demand
 */
export function useTileLoader() {
  const { markTileLoading, markTileLoaded, markTileError, requestTiles } =
    useTileStore();

  const loadTile = useCallback(
    async (index: number): Promise<THREE.Texture | null> => {
      const formattedIndex = formatTileIndex(index);
      const path = `/src/images/tiles/en_us/terrain_z2_${formattedIndex}.jpg`;

      const moduleLoader = tileModules[path];
      if (!moduleLoader) {
        console.warn(`Tile module not found: ${path}`);
        return null;
      }

      try {
        markTileLoading(index);

        // Load the module to get the resolved URL
        const module = await moduleLoader();
        const textureUrl = module.default;

        // Load the texture
        const textureLoader = new THREE.TextureLoader();
        const texture = await new Promise<THREE.Texture>((resolve, reject) => {
          textureLoader.load(
            textureUrl,
            (tex) => {
              tex.colorSpace = THREE.SRGBColorSpace;
              tex.needsUpdate = true;
              resolve(tex);
            },
            undefined,
            reject
          );
        });

        markTileLoaded(index, textureUrl);
        return texture;
      } catch (error) {
        console.error(`Failed to load tile ${index}:`, error);
        markTileError(index);
        return null;
      }
    },
    [markTileLoading, markTileLoaded, markTileError]
  );

  const loadTiles = useCallback(
    async (indices: number[]): Promise<Map<number, THREE.Texture>> => {
      const tilesToLoad = requestTiles(indices);
      const results = new Map<number, THREE.Texture>();

      await Promise.all(
        tilesToLoad.map(async (index) => {
          const texture = await loadTile(index);
          if (texture) {
            results.set(index, texture);
          }
        })
      );

      return results;
    },
    [loadTile, requestTiles]
  );

  return { loadTile, loadTiles };
}
