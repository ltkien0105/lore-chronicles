import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Suspense, lazy, useState, useEffect } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { isWebGLSupported } from "@/lib/detect-webgl";
import MapLoadingSpinner from "@/components/MapLoadingSpinner";
import WebGLErrorFallback from "@/components/WebGLErrorFallback";

const MapCanvas = lazy(() => import("@/components/MapCanvas"));

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  const navigate = useNavigate();

  // Check WebGL support on client-side only (prevents hydration mismatch)
  const [webglSupported, setWebglSupported] = useState<boolean | null>(null);

  useEffect(() => {
    // Only run on client
    setWebglSupported(isWebGLSupported());
  }, []);

  // Handle region click navigation
  const handleRegionClick = (slug: string) => {
    navigate({ to: '/regions/$slug', params: { slug } });
  };

  // Show loading while checking WebGL support (initially null)
  if (webglSupported === null) {
    return <MapLoadingSpinner />;
  }

  // Show fallback if WebGL not supported
  if (!webglSupported) {
    return <WebGLErrorFallback />;
  }

  return (
    <div className="w-screen h-screen">
      <ErrorBoundary
        FallbackComponent={WebGLErrorFallback}
        onReset={() => window.location.reload()}
      >
        <Suspense fallback={<MapLoadingSpinner />}>
          <MapCanvas onRegionClick={handleRegionClick} />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}
