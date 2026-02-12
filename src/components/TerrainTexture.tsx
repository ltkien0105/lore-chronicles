import * as THREE from "three";
import { useFrame, useLoader, useThree } from "@react-three/fiber";
import Terrain from "@/assets/images/tiles/terrain_z1.jpg";
import { useRef } from "react";
import { PinManager } from "./pins/pin-manager";
import { RegionManager } from "./regions/region-manager";

export default function TerrainTexture({
  planeWidth,
  planeHeight,
}: {
  planeWidth: number;
  planeHeight: number;
}) {
  const { camera } = useThree();
  const terrainTexture = useLoader(THREE.TextureLoader, Terrain);
  terrainTexture.colorSpace = THREE.SRGBColorSpace;

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
      <mesh>
        <planeGeometry args={[planeWidth, planeHeight]} />
        <meshBasicMaterial map={terrainTexture} />
      </mesh>
      <group ref={regionGroupRef}>
        <RegionManager planeSize={planeWidth} />
      </group>
      <group ref={pinGroupRef}>
        <PinManager />
      </group>
    </group>
  );
}
