import { createServerFn } from "@tanstack/react-start";
import { eq, and, or, isNotNull } from "drizzle-orm";
import { db } from "@/db";
import {
  champions,
  relations as relationsTable,
  type Champion,
  type Relation,
} from "@/db/schema";

export type GraphNode = {
  id: number;
  name: string;
  slug: string;
  avatarUrl: string | null;
  regionId: number | null;
  regionSlug: string | null;
};

export type GraphEdge = {
  id: number;
  source: number;
  target: number;
  type: string;
  strength: number;
  bidirectional: boolean;
  description: string | null;
};

export type GraphData = {
  nodes: GraphNode[];
  edges: GraphEdge[];
};

/**
 * Get all graph data for visualization
 * Returns nodes (champions) and edges (relationships)
 */
export const getGraphData = createServerFn({ method: "GET" }).handler(
  async (): Promise<GraphData> => {
    try {
      // Fetch all relations with champion data
      const relationsData = await db
        .select({
          relationId: relationsTable.id,
          championId1: relationsTable.championId1,
          championId2: relationsTable.championId2,
          type: relationsTable.type,
          strength: relationsTable.strength,
          bidirectional: relationsTable.bidirectional,
          description: relationsTable.description,
          champion1: champions,
        })
        .from(relationsTable)
        .innerJoin(champions, eq(relationsTable.championId1, champions.id))
        .where(isNotNull(relationsTable.championId2)); // Only include relations where championId2 exists

      // Build unique set of champion IDs involved in relationships
      const championIds = new Set<number>();
      relationsData.forEach((rel) => {
        championIds.add(rel.championId1);
        if (rel.championId2) {
          championIds.add(rel.championId2);
        }
      });

      // Fetch all champions involved in relationships
      const championRecords = await db
        .select()
        .from(champions)
        .where(
          or(
            ...Array.from(championIds).map((id) => eq(champions.id, id))
          )
        );

      // Map champions to nodes
      const nodes: GraphNode[] = championRecords.map((champion) => ({
        id: champion.id,
        name: champion.name,
        slug: champion.slug,
        avatarUrl: champion.avatarUrl,
        regionId: champion.regionId,
        regionSlug: null, // Will be populated if needed
      }));

      // Map relations to edges
      const edges: GraphEdge[] = relationsData
        .filter((rel) => rel.championId2 !== null)
        .map((rel) => ({
          id: rel.relationId,
          source: rel.championId1,
          target: rel.championId2!,
          type: rel.type || "shared_history",
          strength: rel.strength || 2,
          bidirectional: rel.bidirectional || true,
          description: rel.description,
        }));

      return { nodes, edges };
    } catch (error) {
      console.error("Error fetching graph data:", error);
      throw new Error("Failed to fetch graph data");
    }
  }
);

/**
 * Get relationships for a specific champion
 */
export const getChampionRelationships = createServerFn({ method: "GET" })
  .inputValidator((championId: number) => championId)
  .handler(async ({ data: championId }): Promise<Relation[]> => {
    try {
      const relationships = await db
        .select()
        .from(relationsTable)
        .where(
          or(
            eq(relationsTable.championId1, championId),
            eq(relationsTable.championId2, championId)
          )
        );

      return relationships;
    } catch (error) {
      console.error(
        `Error fetching relationships for champion ${championId}:`,
        error
      );
      throw new Error("Failed to fetch champion relationships");
    }
  });

/**
 * Get relationships filtered by type
 */
export const getRelationshipsByType = createServerFn({ method: "GET" })
  .inputValidator((type: string) => type)
  .handler(async ({ data: type }): Promise<Relation[]> => {
    try {
      const relationships = await db
        .select()
        .from(relationsTable)
        .where(eq(relationsTable.type, type));

      return relationships;
    } catch (error) {
      console.error(`Error fetching relationships by type ${type}:`, error);
      throw new Error("Failed to fetch relationships by type");
    }
  });

/**
 * Get relationships filtered by region
 * Returns all relationships where at least one champion is from the specified region
 */
export const getRelationshipsByRegion = createServerFn({ method: "GET" })
  .inputValidator((regionId: number) => regionId)
  .handler(async ({ data: regionId }): Promise<GraphData> => {
    try {
      // Get champions from the specified region
      const regionChampions = await db
        .select()
        .from(champions)
        .where(eq(champions.regionId, regionId));

      const championIds = regionChampions.map((c) => c.id);

      // Get relationships involving these champions
      const relationships = await db
        .select()
        .from(relationsTable)
        .where(
          or(
            ...championIds.flatMap((id) => [
              eq(relationsTable.championId1, id),
              eq(relationsTable.championId2, id),
            ])
          )
        );

      // Build graph data
      const allChampionIds = new Set<number>();
      relationships.forEach((rel) => {
        allChampionIds.add(rel.championId1);
        if (rel.championId2) {
          allChampionIds.add(rel.championId2);
        }
      });

      const allChampions = await db
        .select()
        .from(champions)
        .where(
          or(
            ...Array.from(allChampionIds).map((id) => eq(champions.id, id))
          )
        );

      const nodes: GraphNode[] = allChampions.map((champion) => ({
        id: champion.id,
        name: champion.name,
        slug: champion.slug,
        avatarUrl: champion.avatarUrl,
        regionId: champion.regionId,
        regionSlug: null,
      }));

      const edges: GraphEdge[] = relationships
        .filter((rel) => rel.championId2 !== null)
        .map((rel) => ({
          id: rel.id,
          source: rel.championId1,
          target: rel.championId2!,
          type: rel.type || "shared_history",
          strength: rel.strength || 2,
          bidirectional: rel.bidirectional || true,
          description: rel.description,
        }));

      return { nodes, edges };
    } catch (error) {
      console.error(
        `Error fetching relationships for region ${regionId}:`,
        error
      );
      throw new Error("Failed to fetch relationships by region");
    }
  });
