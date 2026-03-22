/**
 * Hook for managing graph filter state
 * Handles relationship type, region, and search filters
 */

import { useState, useCallback } from "react";
import { RELATIONSHIP_TYPES } from "@/db/schema";

export interface GraphFilters {
  relationshipTypes: Set<string>;
  regionIds: Set<number>;
  searchQuery: string;
}

const ALL_RELATIONSHIP_TYPES = Object.values(RELATIONSHIP_TYPES);

export function useGraphFilters() {
  const [filters, setFilters] = useState<GraphFilters>({
    relationshipTypes: new Set(ALL_RELATIONSHIP_TYPES),
    regionIds: new Set(),
    searchQuery: "",
  });

  const toggleRelationshipType = useCallback((type: string) => {
    setFilters((prev) => {
      const next = new Set(prev.relationshipTypes);
      if (next.has(type)) {
        next.delete(type);
      } else {
        next.add(type);
      }
      return { ...prev, relationshipTypes: next };
    });
  }, []);

  const toggleRegion = useCallback((regionId: number) => {
    setFilters((prev) => {
      const next = new Set(prev.regionIds);
      if (next.has(regionId)) {
        next.delete(regionId);
      } else {
        next.add(regionId);
      }
      return { ...prev, regionIds: next };
    });
  }, []);

  const setSearchQuery = useCallback((query: string) => {
    setFilters((prev) => ({ ...prev, searchQuery: query }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({
      relationshipTypes: new Set(ALL_RELATIONSHIP_TYPES),
      regionIds: new Set(),
      searchQuery: "",
    });
  }, []);

  return {
    filters,
    toggleRelationshipType,
    toggleRegion,
    setSearchQuery,
    resetFilters,
  };
}
