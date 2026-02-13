import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import TerrainMap from "@/assets/images/tiles/terrain_z1.jpg";
import TerrainDisplacement from "@/assets/images/tiles/depth_z1.jpg";
import { useRef } from "react";
import { PinManager } from "./pins/pin-manager";
import { RegionManager } from "./regions/region-manager";
import { ZOOM_DEFAULT } from "@/lib/constants";
import { useTexture } from "@react-three/drei";

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
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    // Calculate rotation based on zoom level
    const rotationX = -Math.PI / (90 * (ZOOM_DEFAULT / camera.zoom / 4));

    if (pinGroupRef.current) {
      pinGroupRef.current.visible = camera.zoom >= 35;
      // Apply same rotation to pins so they stay anchored to terrain
      pinGroupRef.current.rotation.set(rotationX, 0, 0);
    }

    if (regionGroupRef.current) {
      regionGroupRef.current.visible = camera.zoom < 35;
      // Apply same rotation to regions so they stay anchored to terrain
      regionGroupRef.current.rotation.set(rotationX, 0, 0);
    }

    if (meshRef.current) {
      meshRef.current.rotation.set(rotationX, 0, 0);
    }
  });

  return (
    <group>
      <mesh ref={meshRef}>
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
