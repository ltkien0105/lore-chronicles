import { useRef, useMemo, useEffect, useCallback, type JSX } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import { getEffectiveZoom } from "@/lib/utils";
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
import TerrainDisplacement from "@/assets/images/tiles/depth_z1.jpg";

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

/**
 * Create a plane geometry with a second UV channel for displacement map sampling.
 * - uv (channel 0): Default 0-1 for the tile's color texture
 * - uv1 (channel 1): Offset UVs for sampling the global displacement map
 */
function createTileGeometry(
  width: number,
  height: number,
  widthSegments: number,
  heightSegments: number,
  row: number,
  col: number,
  gridSize: number,
): THREE.PlaneGeometry {
  const geometry = new THREE.PlaneGeometry(
    width,
    height,
    widthSegments,
    heightSegments,
  );

  // Get the original UV attribute (for color texture - stays 0-1)
  const uvAttribute = geometry.getAttribute("uv");
  const uvArray = uvAttribute.array as Float32Array;

  // Create a second UV channel for displacement map with offset coordinates
  const uv1Array = new Float32Array(uvArray.length);

  // Calculate UV offset and scale for this tile's position in the global map
  const uScale = 1 / gridSize;
  const vScale = 1 / gridSize;
  const uOffset = col / gridSize;
  // V is inverted in UV space (0 at bottom, 1 at top), and rows go top-to-bottom
  const vOffset = (gridSize - 1 - row) / gridSize;

  // Copy and remap UVs for the displacement map channel
  for (let i = 0; i < uvArray.length; i += 2) {
    const u = uvArray[i];
    const v = uvArray[i + 1];

    // UV1 samples the correct region of the global displacement map
    uv1Array[i] = uOffset + u * uScale;
    uv1Array[i + 1] = vOffset + v * vScale;
  }

  // Add the second UV channel
  geometry.setAttribute("uv1", new THREE.BufferAttribute(uv1Array, 2));

  return geometry;
}

/**
 * Custom shader material that uses uv1 for displacement map sampling
 * while keeping uv for the color texture
 */
function TileMesh({
  index,
  position,
  geometry,
  displacementTexture,
  tileRefs,
}: {
  index: number;
  position: [number, number, number];
  geometry: THREE.PlaneGeometry;
  displacementTexture: THREE.Texture;
  tileRefs: React.MutableRefObject<Map<number, TileMeshRef>>;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  // Register mesh in refs
  useEffect(() => {
    if (meshRef.current) {
      const existing = tileRefs.current.get(index);
      tileRefs.current.set(index, {
        mesh: meshRef.current,
        texture: existing?.texture || null,
        loaded: existing?.loaded || false,
      });
    }
  }, [index, tileRefs]);

  // Custom shader that uses uv1 for displacement
  const shaderMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        map: { value: null },
        displacementMap: { value: displacementTexture },
        displacementScale: { value: 10.0 },
        opacity: { value: 0.0 },
      },
      vertexShader: `
        attribute vec2 uv1;
        uniform sampler2D displacementMap;
        uniform float displacementScale;

        varying vec2 vUv;

        void main() {
          vUv = uv; // Use default uv for color texture

          // Sample displacement using uv1 (offset coordinates)
          float displacement = texture2D(displacementMap, uv1).r;
          vec3 newPosition = position + normal * displacement * displacementScale;

          gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D map;
        uniform float opacity;

        varying vec2 vUv;

        void main() {
          if (opacity < 0.01) discard;

          vec4 texColor = texture2D(map, vUv);
          // Output texture as-is (lighting is baked into the texture)
          gl_FragColor = vec4(texColor.rgb, texColor.a * opacity);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide,
      toneMapped: false,
    });
  }, [displacementTexture]);

  return (
    <mesh ref={meshRef} position={position} geometry={geometry}>
      <primitive object={shaderMaterial} ref={materialRef} attach="material" />
    </mesh>
  );
}

export function TerrainLodMesh({ planeSize }: TerrainLodMeshProps) {
  const { camera, size } = useThree();
  const tileSize = planeSize / GRID_SIZE;

  // Low-res texture for fallback/far view
  const lowResTexture = useTexture(TerrainMapLowRes, (texture) => {
    texture.colorSpace = THREE.SRGBColorSpace;
  });

  // Load normal/bump map for depth appearance
  const displacementTexture = useTexture(TerrainDisplacement, (texture) => {
    texture.colorSpace = THREE.LinearSRGBColorSpace;
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
            const material = ref.mesh.material as THREE.ShaderMaterial;
            material.uniforms.map.value = texture;
            material.needsUpdate = true;
            ref.texture = texture;
            ref.loaded = true;
          }
        });
      }
    },
    [planeSize, isTileLoaded, loadTileTexture],
  );

  // Create tile meshes with displacement using custom shader for UV offset
  const tileMeshes = useMemo(() => {
    const meshes: JSX.Element[] = [];

    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        const index = row * GRID_SIZE + col + 1;
        const { x, y } = getTileWorldPosition(row, col, planeSize);

        // Create geometry with UV1 channel for displacement map offset
        const geometry = createTileGeometry(
          tileSize,
          tileSize,
          64,
          64,
          row,
          col,
          GRID_SIZE,
        );

        meshes.push(
          <TileMesh
            key={`tile-${index}`}
            index={index}
            position={[x, y, 0.01]}
            geometry={geometry}
            displacementTexture={displacementTexture}
            tileRefs={tileRefs}
          />,
        );
      }
    }

    return meshes;
  }, [planeSize, tileSize, displacementTexture]);

  // Update visibility and load tiles on each frame
  useFrame(() => {
    const effectiveZoom = getEffectiveZoom(
      camera as THREE.PerspectiveCamera,
      size,
    );
    const isZoomedIn = effectiveZoom >= LOD_ZOOM_THRESHOLD;

    // Count how many tiles are loaded in the visible area
    let loadedTileCount = 0;
    let totalVisibleTiles = 0;

    if (isZoomedIn) {
      const cameraX = camera.position.x;
      const cameraY = camera.position.y;
      updateTiles(cameraX, cameraY);

      // Check tiles in the camera's visible area
      const { row: centerRow, col: centerCol } = worldPositionToGridPosition(
        cameraX,
        cameraY,
        planeSize,
      );
      const visibleTiles = getTilesToLoad(
        centerRow,
        centerCol,
        TILE_LOAD_RADIUS,
      );
      totalVisibleTiles = visibleTiles.length;

      for (const tileIndex of visibleTiles) {
        const ref = tileRefs.current.get(tileIndex);
        if (ref?.loaded) {
          loadedTileCount++;
        }
      }

      // Update tile opacities based on loaded state
      tileRefs.current.forEach((ref) => {
        if (ref.mesh) {
          const material = ref.mesh.material as THREE.ShaderMaterial;
          material.uniforms.opacity.value = ref.loaded ? 1 : 0;
        }
      });
    }

    // Determine if enough tiles are loaded to hide low-res
    // Keep low-res visible until at least 50% of visible tiles are loaded
    const hasEnoughTilesLoaded =
      totalVisibleTiles > 0 && loadedTileCount >= totalVisibleTiles * 0.5;

    // Toggle visibility - keep low-res as fallback until tiles load
    if (lowResMeshRef.current) {
      // Show low-res when zoomed out OR when zoomed in but tiles not loaded yet
      lowResMeshRef.current.visible = !isZoomedIn || !hasEnoughTilesLoaded;
    }
    if (highResGroupRef.current) {
      highResGroupRef.current.visible = isZoomedIn;
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
        <meshStandardMaterial
          map={lowResTexture}
          displacementMap={displacementTexture}
          displacementScale={15}
        />
      </mesh>

      {/* High-res tile grid (visible when zoomed in) - with displacement for depth */}
      <group ref={highResGroupRef} visible={false}>
        {tileMeshes}
      </group>
    </group>
  );
}
