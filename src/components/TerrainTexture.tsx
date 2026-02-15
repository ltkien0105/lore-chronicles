import * as THREE from "three";
import { PinManager } from "./pins/PinManager";
import { RegionManager } from "./regions/RegionManager";
import { useFrame, useThree } from "@react-three/fiber";
import { useRef } from "react";
import { TerrainLodMesh } from "./terrain-lod";

export default function TerrainTexture({
  planeWidth,
  planeHeight,
}: {
  planeWidth: number;
  planeHeight: number;
}) {
  const { camera } = useThree();

  // Use ref to track visibility without causing re-renders
  const pinGroupRef = useRef<THREE.Group>(null);
  const regionGroupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (pinGroupRef.current) {
      pinGroupRef.current.visible = camera.zoom >= 35;
    }

    if (regionGroupRef.current) {
      regionGroupRef.current.visible = camera.zoom < 35;
    }
  });

  return (
    <group>
      {/* LOD Terrain: switches between low-res (2048x2048) and high-res tiles (8x8 grid of 1024x1024) */}
      <TerrainLodMesh planeSize={planeWidth} />

      <group ref={regionGroupRef}>
        <RegionManager planeSize={planeWidth} />
      </group>
      <group ref={pinGroupRef}>
        <PinManager />
      </group>
    </group>
  );
}
