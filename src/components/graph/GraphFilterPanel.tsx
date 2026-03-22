/**
 * Filter panel for graph visualization
 * Allows filtering by relationship types and regions
 */

import { RELATIONSHIP_TYPES } from "@/db/schema";
import { RELATIONSHIP_COLORS } from "@/lib/graph-constants";
import type { RegionWithChampionCount } from "@/server/regions";
import type { GraphEdge } from "@/server/relationships";
import { countEdgesByType } from "@/lib/filter-graph-data";

interface GraphFilterPanelProps {
  filters: {
    relationshipTypes: Set<string>;
    regionIds: Set<number>;
  };
  regions: RegionWithChampionCount[];
  edges: GraphEdge[];
  onToggleRelationshipType: (type: string) => void;
  onToggleRegion: (regionId: number) => void;
  onReset: () => void;
}

const RELATIONSHIP_TYPE_LABELS = {
  [RELATIONSHIP_TYPES.FAMILY]: "Family",
  [RELATIONSHIP_TYPES.ALLY]: "Allies",
  [RELATIONSHIP_TYPES.ENEMY]: "Enemies",
  [RELATIONSHIP_TYPES.ROMANTIC]: "Romantic",
  [RELATIONSHIP_TYPES.MENTOR]: "Mentor",
  [RELATIONSHIP_TYPES.RIVAL]: "Rivals",
  [RELATIONSHIP_TYPES.SHARED_HISTORY]: "Shared History",
} as const;

export function GraphFilterPanel({
  filters,
  regions,
  edges,
  onToggleRelationshipType,
  onToggleRegion,
  onReset,
}: GraphFilterPanelProps) {
  const edgeCounts = countEdgesByType(edges);

  return (
    <aside className="h-full w-full overflow-y-auto border-r border-stone-800 bg-stone-950 p-4">
      <div className="mb-6">
        <h2 className="mb-4 font-heading text-lg font-semibold text-primary">
          Filters
        </h2>

        {/* Relationship Types */}
        <fieldset className="mb-6">
          <legend className="mb-3 text-sm font-medium text-stone-300">
            Relationship Types
          </legend>
          <div className="space-y-2">
            {Object.entries(RELATIONSHIP_TYPE_LABELS).map(([type, label]) => {
              const color =
                RELATIONSHIP_COLORS[type as keyof typeof RELATIONSHIP_COLORS];
              const count = edgeCounts[type] || 0;
              const isChecked = filters.relationshipTypes.has(type);

              return (
                <label
                  key={type}
                  className="flex cursor-pointer items-center gap-2 hover:text-primary"
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => onToggleRelationshipType(type)}
                    className="h-4 w-4 rounded border-stone-700 bg-stone-900 text-primary focus:ring-2 focus:ring-primary"
                  />
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-sm">{label}</span>
                  <span className="ml-auto text-xs text-muted-foreground">
                    {count}
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>

        {/* Regions */}
        <fieldset className="mb-6">
          <legend className="mb-3 text-sm font-medium text-stone-300">
            Regions
          </legend>
          <div className="space-y-2">
            {regions.map((region) => {
              const isChecked = filters.regionIds.has(region.id);
              const championCount = region.champions.length;

              return (
                <label
                  key={region.id}
                  className="flex cursor-pointer items-center gap-2 hover:text-primary"
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => onToggleRegion(region.id)}
                    className="h-4 w-4 rounded border-stone-700 bg-stone-900 text-primary focus:ring-2 focus:ring-primary"
                  />
                  <span className="text-sm">{region.name}</span>
                  <span className="ml-auto text-xs text-muted-foreground">
                    {championCount}
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>

        {/* Reset Button */}
        <button
          onClick={onReset}
          className="w-full rounded-md bg-stone-800 px-4 py-2 text-sm font-medium text-stone-300 hover:bg-stone-700 hover:text-primary"
        >
          Reset Filters
        </button>
      </div>
    </aside>
  );
}
