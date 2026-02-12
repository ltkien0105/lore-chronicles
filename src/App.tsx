import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import TerrainTexture from "./components/TerrainTexture";
import MapLogic from "@/components/MapLogic";

const PLANE_SIZE = 100; // Cố định kích thước bản đồ là hình vuông
const ZOOM_DEFAULT = 15;

export function App() {
  return (
    <div className="w-screen h-screen">
      <Canvas
        orthographic
        camera={{ position: [0, 0, 10], zoom: ZOOM_DEFAULT }}
        gl={{ alpha: false }}
        style={{ background: "#000" }}
      >
        <Suspense fallback={null}>
          <TerrainTexture planeWidth={PLANE_SIZE} planeHeight={PLANE_SIZE} />
          <MapLogic planeWidth={PLANE_SIZE} planeHeight={PLANE_SIZE} />
        </Suspense>
      </Canvas>
    </div>
  );
}
