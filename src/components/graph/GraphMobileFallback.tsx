/**
 * Simplified mobile fallback view for relationship graph
 * Displays champions in a grid with relationship counts
 */

import type { GraphData } from "@/server/relationships";
import { getRelationshipCount } from "@/lib/filter-graph-data";

interface GraphMobileFallbackProps {
  data: GraphData;
  onSelectNode: (nodeId: number) => void;
}

export function GraphMobileFallback({ data, onSelectNode }: GraphMobileFallbackProps) {
  return (
    <div className="h-full overflow-auto bg-stone-950 p-4">
      <div className="mb-4 rounded-lg border border-primary/20 bg-stone-900/50 p-3">
        <p className="text-sm text-muted-foreground">
          📱 Showing simplified view. Rotate to landscape or use a desktop for the full 3D experience.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {data.nodes.map((node) => {
          const relationshipCount = getRelationshipCount(node.id, data.edges);

          return (
            <button
              key={node.id}
              onClick={() => onSelectNode(node.id)}
              className="flex items-center gap-3 rounded-lg border border-stone-800 bg-stone-900 p-3 text-left transition-colors hover:border-primary hover:bg-stone-800"
            >
              {node.avatarUrl && (
                <img
                  src={node.avatarUrl}
                  alt={node.name}
                  className="h-12 w-12 rounded-md"
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-medium text-stone-100">
                  {node.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {relationshipCount} {relationshipCount === 1 ? "connection" : "connections"}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
