/**
 * Info panel displaying selected champion details
 * Shows avatar, name, region, and relationships
 */

import { Link } from "@tanstack/react-router";
import { ExternalLink } from "lucide-react";
import type { GraphNode, GraphEdge } from "@/server/relationships";
import { RELATIONSHIP_COLORS } from "@/lib/graph-constants";

interface GraphInfoPanelProps {
  selectedNode: GraphNode | null;
  edges: GraphEdge[];
  allNodes: GraphNode[];
  onClose: () => void;
}

export function GraphInfoPanel({
  selectedNode,
  edges,
  allNodes,
  onClose,
}: GraphInfoPanelProps) {
  if (!selectedNode) return null;

  // Get relationships for selected node
  const relationships = edges
    .filter((e) => e.source === selectedNode.id || e.target === selectedNode.id)
    .map((edge) => {
      const isSource = edge.source === selectedNode.id;
      const connectedNodeId = isSource ? edge.target : edge.source;
      const connectedNode = allNodes.find((n) => n.id === connectedNodeId);

      return {
        id: edge.id,
        type: edge.type,
        description: edge.description,
        connectedNode,
      };
    });

  return (
    <div className="absolute bottom-0 left-0 right-0 z-10 border-t border-stone-800 bg-stone-950/95 p-6 backdrop-blur-sm lg:left-64">
      <button
        onClick={onClose}
        className="absolute right-4 top-4 text-muted-foreground hover:text-primary"
        aria-label="Close"
      >
        ✕
      </button>

      <div className="flex items-start gap-4">
        {/* Avatar */}
        {selectedNode.avatarUrl && (
          <img
            src={selectedNode.avatarUrl}
            alt={selectedNode.name}
            className="h-16 w-16 rounded-lg border-2 border-primary"
          />
        )}

        {/* Info */}
        <div className="flex-1">
          <h3 className="font-heading text-xl font-bold text-primary">
            {selectedNode.name}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {relationships.length} {relationships.length === 1 ? "connection" : "connections"}
          </p>

          {/* View Wiki Link */}
          <Link
            to="/champions/$slug"
            params={{ slug: selectedNode.slug }}
            className="mt-3 inline-flex items-center gap-2 text-sm text-primary hover:underline"
          >
            <ExternalLink className="h-4 w-4" />
            View Wiki Page
          </Link>
        </div>
      </div>

      {/* Relationships */}
      {relationships.length > 0 && (
        <div className="mt-4">
          <h4 className="mb-2 text-sm font-semibold text-stone-300">
            Relationships
          </h4>
          <ul className="space-y-2">
            {relationships.slice(0, 5).map((rel) => {
              const color =
                RELATIONSHIP_COLORS[rel.type as keyof typeof RELATIONSHIP_COLORS];
              return (
                <li key={rel.id} className="flex items-center gap-2 text-sm">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  <span className="capitalize text-stone-300">
                    {rel.type.replace(/_/g, " ")}
                  </span>
                  {rel.connectedNode && (
                    <span className="text-muted-foreground">
                      with {rel.connectedNode.name}
                    </span>
                  )}
                </li>
              );
            })}
            {relationships.length > 5 && (
              <li className="text-xs text-muted-foreground">
                +{relationships.length - 5} more
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
