/**
 * Hook for managing graph interaction state
 * Handles node selection, hovering, and connected edge highlighting
 */

import { useState, useMemo, useCallback } from "react";
import type { GraphEdge } from "@/server/relationships";

export interface GraphInteractionState {
  selectedNodeId: number | null;
  hoveredNodeId: number | null;
  hoveredEdgeId: number | null;
  highlightedEdges: Set<number>;
  visibleNodes: Set<number>;
  dimmedNodes: Set<number>;
}

export function useGraphInteractions(edges: GraphEdge[], allNodeIds: number[]) {
  const [selectedNodeId, setSelectedNodeId] = useState<number | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<number | null>(null);
  const [hoveredEdgeId, setHoveredEdgeId] = useState<number | null>(null);

  // Compute edges connected to selected node
  const highlightedEdges = useMemo(() => {
    if (!selectedNodeId) return new Set<number>();
    return new Set(
      edges
        .filter((e) => e.source === selectedNodeId || e.target === selectedNodeId)
        .map((e) => e.id)
    );
  }, [selectedNodeId, edges]);

  // Compute visible nodes (1-hop from selected)
  const visibleNodes = useMemo(() => {
    if (!selectedNodeId) return new Set<number>(allNodeIds);

    const visible = new Set<number>([selectedNodeId]);
    edges.forEach((e) => {
      if (e.source === selectedNodeId) visible.add(e.target);
      if (e.target === selectedNodeId) visible.add(e.source);
    });

    return visible;
  }, [selectedNodeId, edges, allNodeIds]);

  // Compute dimmed nodes (not in visible set)
  const dimmedNodes = useMemo(() => {
    if (!selectedNodeId) return new Set<number>();

    const dimmed = new Set<number>();
    allNodeIds.forEach((id) => {
      if (!visibleNodes.has(id)) {
        dimmed.add(id);
      }
    });

    return dimmed;
  }, [selectedNodeId, visibleNodes, allNodeIds]);

  const clearSelection = useCallback(() => {
    setSelectedNodeId(null);
  }, []);

  const selectNode = useCallback((nodeId: number | null) => {
    setSelectedNodeId(nodeId);
  }, []);

  return {
    selectedNodeId,
    hoveredNodeId,
    hoveredEdgeId,
    highlightedEdges,
    visibleNodes,
    dimmedNodes,
    setSelectedNodeId: selectNode,
    setHoveredNodeId,
    setHoveredEdgeId,
    clearSelection,
  };
}
