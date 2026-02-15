import { useRef, useMemo, useEffect, useCallback } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import {
  GRID_SIZE,
  LOD_ZOOM_THRESHOLD,
  getTileWorldPosition,
  worldPositionToGridPosition,
  getTilesToLoad,
  formatTileIndex,
  TILE_LOAD_RADIUS,
} from "./tile-grid-config";
import { useTileStore } from "./use-tile-store";

// Import low-res terrain for fallback
import TerrainMapLowRes from "@/assets/images/tiles/terrain_z1.jpg";

// Dynamic import for high-res tiles
const tileModules = import.meta.glob<{ default: string }>(
  "/src/images/tiles/en_us/terrain_z2_*.jpg",
  { eager: false },
);

interface TileMeshRef {
  mesh: THREE.Mesh | null;
  texture: THREE.Texture | null;
  loaded: boolean;
}

interface TerrainLodMeshProps {
  planeSize: number;
}

export function TerrainLodMesh({ planeSize }: TerrainLodMeshProps) {
  const { camera } = useThree();
  const tileSize = planeSize / GRID_SIZE;

  // Low-res texture for fallback/far view
  const lowResTexture = useTexture(TerrainMapLowRes, (texture) => {
    texture.colorSpace = THREE.SRGBColorSpace;
  });

  // Refs for tile meshes and textures
  const tileRefs = useRef<Map<number, TileMeshRef>>(new Map());
  const lowResMeshRef = useRef<THREE.Mesh>(null);
  const highResGroupRef = useRef<THREE.Group>(null);

  // Store for tracking loaded tiles
  const { isTileLoaded, markTileLoading, markTileLoaded, markTileError } =
    useTileStore();

  // Track last loaded position to avoid redundant loads
  const lastLoadedPosition = useRef<{ row: number; col: number } | null>(null);

  // Load a specific tile texture
  const loadTileTexture = useCallback(
    async (index: number) => {
      const formattedIndex = formatTileIndex(index);
      const path = `/src/images/tiles/en_us/terrain_z2_${formattedIndex}.jpg`;

      const moduleLoader = tileModules[path];
      if (!moduleLoader) {
        console.warn(`Tile not found: ${path}`);
        return null;
      }

      try {
        markTileLoading(index);
        const module = await moduleLoader();
        const textureUrl = module.default;

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
            reject,
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
    [markTileLoading, markTileLoaded, markTileError],
  );

  // Update tile visibility and load tiles as needed
  const updateTiles = useCallback(
    async (cameraX: number, cameraY: number) => {
      const { row: centerRow, col: centerCol } = worldPositionToGridPosition(
        cameraX,
        cameraY,
        planeSize,
      );

      // Skip if same position
      if (
        lastLoadedPosition.current?.row === centerRow &&
        lastLoadedPosition.current?.col === centerCol
      ) {
        return;
      }
      lastLoadedPosition.current = { row: centerRow, col: centerCol };

      // Get tiles to load
      const tilesToLoad = getTilesToLoad(
        centerRow,
        centerCol,
        TILE_LOAD_RADIUS,
      );

      // Load new tiles
      for (const tileIndex of tilesToLoad) {
        if (isTileLoaded(tileIndex)) continue;

        const existing = tileRefs.current.get(tileIndex);
        if (existing?.loaded) continue;

        // Load texture asynchronously
        loadTileTexture(tileIndex).then((texture) => {
          if (!texture) return;

          const ref = tileRefs.current.get(tileIndex);
          if (ref?.mesh) {
            const material = ref.mesh.material as THREE.MeshBasicMaterial;
            material.map = texture;
            material.needsUpdate = true;
            ref.texture = texture;
            ref.loaded = true;
          }
        });
      }
    },
    [planeSize, isTileLoaded, loadTileTexture],
  );

  // Create tile meshes
  const tileMeshes = useMemo(() => {
    const meshes: JSX.Element[] = [];

    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        const index = row * GRID_SIZE + col + 1;
        const { x, y } = getTileWorldPosition(row, col, planeSize);

        meshes.push(
          <mesh
            key={`tile-${index}`}
            position={[x, y, 0.01]}
            ref={(mesh: THREE.Mesh | null) => {
              if (mesh) {
                const existing = tileRefs.current.get(index);
                tileRefs.current.set(index, {
                  mesh,
                  texture: existing?.texture || null,
                  loaded: existing?.loaded || false,
                });
              }
            }}
          >
            <planeGeometry args={[tileSize, tileSize]} />
            <meshBasicMaterial transparent opacity={0} />
          </mesh>,
        );
      }
    }

    return meshes;
  }, [planeSize, tileSize]);

  // Update visibility and load tiles on each frame
  useFrame(() => {
    const zoom = camera.zoom;
    const isZoomedIn = zoom >= LOD_ZOOM_THRESHOLD;

    // Toggle visibility
    if (lowResMeshRef.current) {
      lowResMeshRef.current.visible = !isZoomedIn;
    }
    if (highResGroupRef.current) {
      highResGroupRef.current.visible = isZoomedIn;
    }

    // Load tiles when zoomed in
    if (isZoomedIn) {
      const cameraX = camera.position.x;
      const cameraY = camera.position.y;
      updateTiles(cameraX, cameraY);

      // Update tile opacities based on loaded state
      tileRefs.current.forEach((ref, index) => {
        if (ref.mesh) {
          const material = ref.mesh.material as THREE.MeshBasicMaterial;
          material.opacity = ref.loaded ? 1 : 0;
        }
      });
    }
  });

  // Cleanup textures on unmount
  useEffect(() => {
    return () => {
      tileRefs.current.forEach((ref) => {
        if (ref.texture) {
          ref.texture.dispose();
        }
      });
      tileRefs.current.clear();
    };
  }, []);

  return (
    <group>
      {/* Low-res terrain (visible when zoomed out) */}
      <mesh ref={lowResMeshRef} position={[0, 0, 0]}>
        <planeGeometry args={[planeSize, planeSize, 512, 512]} />
        <meshBasicMaterial map={lowResTexture} />
      </mesh>

      {/* High-res tile grid (visible when zoomed in) */}
      <group ref={highResGroupRef} visible={false}>
        {tileMeshes}
      </group>
    </group>
  );
}
