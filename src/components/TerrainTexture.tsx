import * as THREE from "three";
import { PinManager } from "./pins/PinManager";
import { RegionManager } from "./regions/RegionManager";
import { useTexture } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useRef } from "react";
import TerrainMap from "@/assets/images/tiles/terrain_z1.jpg";
import TerrainDisplacement from "@/assets/images/tiles/depth_z1.jpg";

export default function TerrainTexture({
  planeWidth,
  planeHeight,
}: {
  planeWidth: number;
  planeHeight: number;
}) {
  const { camera } = useThree();
  const terrainTexture = useTexture(
    TerrainMap,
    (texture) => (texture.colorSpace = THREE.SRGBColorSpace),
  );
  const terrainDisplacement = useTexture(
    TerrainDisplacement,
    (texture) => (texture.colorSpace = THREE.SRGBColorSpace),
  );

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
        <planeGeometry args={[planeWidth, planeHeight, 512, 512]} />
        <meshStandardMaterial
          map={terrainTexture}
          displacementMap={terrainDisplacement}
          displacementScale={15}
        />
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
