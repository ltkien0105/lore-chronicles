import * as THREE from "three";
import { PinManager } from "./pins/PinManager";
import { RegionManager } from "./regions/RegionManager";
import { useFrame, useThree } from "@react-three/fiber";
import { useRef, useMemo } from "react";
import { TerrainLodMesh } from "./terrain-lod";
import { useTexture } from "@react-three/drei";
import { getEffectiveZoom } from "@/lib/utils";

// Import bottom row tiles for background extension (tiles 57-64 = bottom row of 8x8 grid)
import Tile57 from "@/images/tiles/en_us/terrain_z2_57.jpg";
import Tile58 from "@/images/tiles/en_us/terrain_z2_58.jpg";
import Tile59 from "@/images/tiles/en_us/terrain_z2_59.jpg";
import Tile60 from "@/images/tiles/en_us/terrain_z2_60.jpg";
import Tile61 from "@/images/tiles/en_us/terrain_z2_61.jpg";
import Tile62 from "@/images/tiles/en_us/terrain_z2_62.jpg";
import Tile63 from "@/images/tiles/en_us/terrain_z2_63.jpg";
import Tile64 from "@/images/tiles/en_us/terrain_z2_64.jpg";

// X-axis tilt configuration
// const TILT_CONFIG = {
//   MIN_ANGLE: 0, // Flat at min zoom (radians)
//   MAX_ANGLE: Math.PI / 6, // ~30° at max zoom (radians)
//   MIN_ZOOM: 15, // Start tilting from this zoom level
//   MAX_ZOOM: 60, // Max tilt at this zoom level
//   EASING: 0.08, // Lerp factor for smooth transition
// };

export default function TerrainTexture({ planeSize }: { planeSize: number }) {
  const { camera, size } = useThree();

  // Load bottom row textures for background extension
  const bottomRowTextures = useTexture(
    [Tile57, Tile58, Tile59, Tile60, Tile61, Tile62, Tile63, Tile64],
    (textures) => {
      const textureArray = Array.isArray(textures) ? textures : [textures];
      textureArray.forEach((tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
      });
    },
  );

  // Use ref to track visibility without causing re-renders
  const pinGroupRef = useRef<THREE.Group>(null);
  const regionGroupRef = useRef<THREE.Group>(null);
  const terrainGroupRef = useRef<THREE.Group>(null);

  // Track current tilt angle for smooth animation
  // const currentTilt = useRef(0);

  useFrame(() => {
    const effectiveZoom = getEffectiveZoom(
      camera as THREE.PerspectiveCamera,
      size,
    );

    if (pinGroupRef.current) {
      pinGroupRef.current.visible = effectiveZoom >= 35;
    }

    if (regionGroupRef.current) {
      regionGroupRef.current.visible = effectiveZoom < 35;
    }

    // Calculate target tilt based on zoom level
    // if (terrainGroupRef.current) {
    //   // Normalize zoom to 0-1 range within tilt range
    //   const zoomNormalized = THREE.MathUtils.clamp(
    //     (effectiveZoom - TILT_CONFIG.MIN_ZOOM) /
    //       (TILT_CONFIG.MAX_ZOOM - TILT_CONFIG.MIN_ZOOM),
    //     0,
    //     1,
    //   );

    //   // Calculate target tilt angle (negative for backward tilt)
    //   const targetTilt =
    //     -TILT_CONFIG.MIN_ANGLE -
    //     zoomNormalized * (TILT_CONFIG.MAX_ANGLE - TILT_CONFIG.MIN_ANGLE);

    //   // Smooth lerp to target
    //   currentTilt.current = THREE.MathUtils.lerp(
    //     currentTilt.current,
    //     targetTilt,
    //     TILT_CONFIG.EASING,
    //   );

    //   // Apply X-axis rotation around camera target (not world origin)
    //   // This prevents the bottom of map from rotating out of view
    //   const cameraTarget = camera.position;

    //   // Reset transform
    //   terrainGroupRef.current.position.set(0, 0, 0);
    //   terrainGroupRef.current.rotation.set(0, 0, 0);

    //   // Translate to pivot point (camera Y position), rotate, translate back
    //   // This rotates around the camera's view center instead of world origin
    //   const pivotY = cameraTarget.y;

    //   // Apply rotation around pivot point
    //   terrainGroupRef.current.position.y = -pivotY;
    //   terrainGroupRef.current.rotation.x = currentTilt.current;
    //   terrainGroupRef.current.position.y +=
    //     pivotY * Math.cos(currentTilt.current);
    //   terrainGroupRef.current.position.z =
    //     -pivotY * Math.sin(currentTilt.current);
    // }
  });

  // Calculate tile size for the 8x8 grid
  const GRID_SIZE = 8;
  const tileSize = planeSize / GRID_SIZE;

  // Bottom row extension tiles - positioned below the main terrain
  // These tiles seamlessly continue the bottom row of the map
  const bottomRowTilesMeshes = useMemo(() => {
    const textureArray = Array.isArray(bottomRowTextures)
      ? bottomRowTextures
      : [bottomRowTextures];

    return textureArray.map((texture, index) => {
      // Calculate X position: tiles are arranged left to right (col 0-7)
      // Center of tile = -planeSize/2 + tileSize/2 + col * tileSize
      const col = index;
      const x = -planeSize / 2 + tileSize / 2 + col * tileSize;

      // Position below the main terrain (row 8 would be at y = -planeSize/2 - tileSize/2)
      const y = -planeSize / 2 - tileSize / 2;

      return (
        <mesh key={`bottom-ext-${index}`} position={[x, y, 0]}>
          <planeGeometry args={[tileSize, tileSize]} />
          <meshBasicMaterial map={texture} />
        </mesh>
      );
    });
  }, [bottomRowTextures, planeSize, tileSize]);

  return (
    <>
      <group ref={terrainGroupRef}>
        {/* LOD Terrain: switches between low-res (2048x2048) and high-res tiles (8x8 grid of 1024x1024) */}
        <TerrainLodMesh planeSize={planeSize} />

        {/* Bottom row extension - seamlessly continues terrain below the visible area */}
        {bottomRowTilesMeshes}

        <group ref={regionGroupRef}>
          <RegionManager planeSize={planeSize} />
        </group>
        <group ref={pinGroupRef}>
          <PinManager />
        </group>
      </group>
    </>
  );
}
