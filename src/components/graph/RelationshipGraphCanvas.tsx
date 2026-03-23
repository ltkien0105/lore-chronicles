/**
 * Main relationship graph canvas component
 * Integrates 3D visualization with filters and info panel
 */

import { Suspense, useMemo, useState, lazy, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { useNavigate } from "@tanstack/react-router";
import { GraphFilterPanel } from "./GraphFilterPanel";
import { GraphSearch } from "./GraphSearch";
import { GraphInfoPanel } from "./GraphInfoPanel";
import { GraphLoadingState } from "./GraphLoadingState";
import { GraphMobileFallback } from "./GraphMobileFallback";
import { useGraphFilters } from "./useGraphFilters";
import { useDeviceDetection } from "./useDeviceDetection";
import { filterGraphData } from "@/lib/filter-graph-data";
import type { GraphData } from "@/server/relationships";
import type { RegionWithChampionCount } from "@/server/regions";
import { GRAPH_CONFIG } from "@/lib/graph-constants";

// Lazy load GraphScene to avoid SSR issues with three-forcegraph
const GraphScene = lazy(() =>
  import("./GraphScene").then((mod) => ({ default: mod.GraphScene }))
);

// Client-only check
function useIsClient() {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);
  return isClient;
}

interface RelationshipGraphCanvasProps {
  data: GraphData;
  regions: RegionWithChampionCount[];
  focusSlug?: string;
}

export function RelationshipGraphCanvas({
  data,
  regions,
  focusSlug,
}: RelationshipGraphCanvasProps) {
  const navigate = useNavigate();
  const isClient = useIsClient();
  const { shouldSimplify } = useDeviceDetection();
  const {
    filters,
    toggleRelationshipType,
    toggleRegion,
    setSearchQuery,
    resetFilters,
  } = useGraphFilters();

  const [selectedNodeId, setSelectedNodeId] = useState<number | null>(null);

  // Filter data based on active filters
  const filteredData = useMemo(
    () => filterGraphData(data, filters),
    [data, filters]
  );

  // Get selected node details
  const selectedNode = useMemo(
    () => filteredData.nodes.find((n) => n.id === selectedNodeId) || null,
    [filteredData.nodes, selectedNodeId]
  );

  const handleNodeClick = (slug: string) => {
    navigate({ to: "/champions/$slug", params: { slug } });
  };

  const handleSelectNodeFromSearch = (nodeId: number) => {
    setSelectedNodeId(nodeId);
    // Focus will be handled by GraphScene
  };

  const handleSelectNodeFromMobile = (nodeId: number) => {
    const node = data.nodes.find((n) => n.id === nodeId);
    if (node) {
      navigate({ to: "/champions/$slug", params: { slug: node.slug } });
    }
  };

  // Show loading state during SSR
  if (!isClient) {
    return (
      <div className="flex h-full items-center justify-center bg-stone-950">
        <GraphLoadingState />
      </div>
    );
  }

  // Mobile fallback
  if (shouldSimplify) {
    return (
      <GraphMobileFallback
        data={filteredData}
        onSelectNode={handleSelectNodeFromMobile}
      />
    );
  }

  return (
    <div className="relative flex h-full">
      {/* Filter sidebar */}
      <div className="hidden w-64 lg:block">
        <div className="mb-4 p-4 pb-0">
          <GraphSearch
            nodes={filteredData.nodes}
            onSearch={setSearchQuery}
            onSelectNode={handleSelectNodeFromSearch}
          />
        </div>
        <GraphFilterPanel
          filters={filters}
          regions={regions}
          edges={data.edges}
          onToggleRelationshipType={toggleRelationshipType}
          onToggleRegion={toggleRegion}
          onReset={resetFilters}
        />
      </div>

      {/* 3D Canvas */}
      <div className="flex-1">
        <Canvas
          camera={{
            position: GRAPH_CONFIG.cameraPosition,
            fov: 75,
            near: 0.1,
            far: 1000,
          }}
          gl={{ alpha: false }}
          style={{ background: "#0c0a09" }}
        >
          <Suspense fallback={null}>
            <GraphScene
              data={filteredData}
              focusSlug={focusSlug}
              onNodeClick={handleNodeClick}
            />
          </Suspense>
        </Canvas>

        {/* Info panel overlay */}
        <GraphInfoPanel
          selectedNode={selectedNode}
          edges={filteredData.edges}
          allNodes={filteredData.nodes}
          onClose={() => setSelectedNodeId(null)}
        />
      </div>
    </div>
  );
}
