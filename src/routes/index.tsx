import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Suspense, lazy, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { isWebGLSupported } from "@/lib/detect-webgl";
import MapLoadingSpinner from "@/components/map-loading-spinner";
import WebGLErrorFallback from "@/components/webgl-error-fallback";

const MapCanvas = lazy(() => import("@/components/map-canvas"));

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  const navigate = useNavigate();

  // Lazy initialization - check WebGL support only once on mount
  const [webglSupported, setWebglSupported] = useState<boolean | null>(() => {
    if (typeof window !== 'undefined') {
      return isWebGLSupported();
    }
    return null;
  });

  // Handle region click navigation
  const handleRegionClick = (slug: string) => {
    navigate({ to: '/regions/$slug', params: { slug } });
  };

  // Show loading while checking WebGL support (SSR only)
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
