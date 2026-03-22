/**
 * Utility functions for filtering graph data
 * Filters nodes and edges based on relationship types, regions, and search
 */

import type { GraphData, GraphNode, GraphEdge } from "@/server/relationships";

export interface GraphFilters {
  relationshipTypes: Set<string>;
  regionIds: Set<number>;
  searchQuery: string;
}

/**
 * Filter graph data based on active filters
 * Returns filtered nodes and edges
 */
export function filterGraphData(
  data: GraphData,
  filters: GraphFilters
): GraphData {
  // Filter edges by relationship type
  let filteredEdges = data.edges.filter((edge) =>
    filters.relationshipTypes.has(edge.type)
  );

  // Get node IDs involved in filtered edges
  const activeNodeIds = new Set<number>();
  filteredEdges.forEach((edge) => {
    activeNodeIds.add(edge.source);
    activeNodeIds.add(edge.target);
  });

  // Filter nodes by region (if any selected)
  let filteredNodes = data.nodes.filter((node) => {
    // Must be involved in at least one visible edge
    if (!activeNodeIds.has(node.id)) return false;

    // If regions filter active, check region
    if (filters.regionIds.size > 0 && node.regionId) {
      if (!filters.regionIds.has(node.regionId)) return false;
    }

    // Apply search filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      if (!node.name.toLowerCase().includes(query)) return false;
    }

    return true;
  });

  // Re-filter edges to only include visible nodes
  const visibleNodeIds = new Set(filteredNodes.map((n) => n.id));
  filteredEdges = filteredEdges.filter(
    (edge) => visibleNodeIds.has(edge.source) && visibleNodeIds.has(edge.target)
  );

  return {
    nodes: filteredNodes,
    edges: filteredEdges,
  };
}

/**
 * Count edges by relationship type
 */
export function countEdgesByType(edges: GraphEdge[]): Record<string, number> {
  const counts: Record<string, number> = {};
  edges.forEach((edge) => {
    counts[edge.type] = (counts[edge.type] || 0) + 1;
  });
  return counts;
}

/**
 * Get relationship count for a node
 */
export function getRelationshipCount(nodeId: number, edges: GraphEdge[]): number {
  return edges.filter(
    (e) => e.source === nodeId || e.target === nodeId
  ).length;
}
