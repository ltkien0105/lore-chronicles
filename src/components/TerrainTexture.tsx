import * as THREE from "three";
import TerrainMap from "@/assets/images/tiles/terrain_z1.jpg";
import TerrainDisplacement from "@/assets/images/tiles/depth_z1.jpg";
import { PinManager } from "./pins/PinManager";
import { RegionManager } from "./regions/RegionManager";
import { useTexture } from "@react-three/drei";

export default function TerrainTexture({
  planeWidth,
  planeHeight,
}: {
  planeWidth: number;
  planeHeight: number;
}) {
  const terrainTexture = useTexture(
    TerrainMap,
    (texture) => (texture.colorSpace = THREE.SRGBColorSpace),
  );
  const terrainDisplacement = useTexture(
    TerrainDisplacement,
    (texture) => (texture.colorSpace = THREE.SRGBColorSpace),
  );

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
      <group>
        <RegionManager planeSize={planeWidth} />
      </group>
      <group>
        <PinManager />
      </group>
    </group>
  );
}
