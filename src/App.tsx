import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import TerrainTexture from "./components/TerrainTexture";
import MapLogic from "@/components/MapLogic";
import { DEFAULT_FOV, PLANE_SIZE } from "@/lib/constants";

export function App() {
  return (
    <div className="w-screen h-screen">
      <Canvas
        camera={{ position: [0, 0, 10], fov: DEFAULT_FOV, near: 0.1, far: 200 }}
        gl={{ alpha: false }}
        style={{ background: "#000" }}
      >
        <Suspense fallback={null}>
          {/* 1. Ambient Light: Soft global light so shadows aren't pitch black */}
          <ambientLight intensity={0.5} />

          {/* 2. Directional Light: Simulates the sun (creates shadows and 3D depth) */}
          <directionalLight position={[10, 10, 5]} intensity={5} />
          <TerrainTexture planeSize={PLANE_SIZE} />
          <MapLogic planeWidth={PLANE_SIZE} planeHeight={PLANE_SIZE} />
        </Suspense>
      </Canvas>
    </div>
  );
}
