import * as THREE from "three";
import { useLoader } from "@react-three/fiber";
import Terrain from "@/assets/images/tiles/terrain_z1.jpg";

export default function TerrainTexture({
  planeWidth,
  planeHeight,
}: {
  planeWidth: number;
  planeHeight: number;
}) {
  const terrainTexture = useLoader(THREE.TextureLoader, Terrain);
  terrainTexture.colorSpace = THREE.SRGBColorSpace;

  return (
    <mesh>
      <planeGeometry args={[planeWidth, planeHeight]} />
      <meshBasicMaterial map={terrainTexture} />
    </mesh>
  );
}
