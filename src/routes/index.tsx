import { createFileRoute } from "@tanstack/react-router";
import { Suspense, lazy } from "react";

const MapCanvas = lazy(() => import("@/components/map-canvas"));

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  return (
    <div className="w-screen h-screen">
      <Suspense fallback={null}>
        <MapCanvas />
      </Suspense>
    </div>
  );
}
