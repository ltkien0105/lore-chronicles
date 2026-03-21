import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import TerrainTexture from "@/components/TerrainTexture";
import MapLogic from "@/components/MapLogic";
import { DEFAULT_FOV, PLANE_SIZE } from "@/lib/constants";

export default function MapCanvas({
  onRegionClick,
}: {
  onRegionClick?: (slug: string) => void;
}) {
  return (
    <Canvas
      camera={{ position: [0, 0, 10], fov: DEFAULT_FOV, near: 0.1, far: 200 }}
      gl={{ alpha: false }}
      style={{ background: "#000" }}
    >
      <Suspense fallback={null}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={5} />
        <TerrainTexture planeSize={PLANE_SIZE} onRegionClick={onRegionClick} />
        <MapLogic planeWidth={PLANE_SIZE} planeHeight={PLANE_SIZE} />
      </Suspense>
    </Canvas>
  );
}
