import { createServerFn } from "@tanstack/react-start";
import { ilike, asc } from "drizzle-orm";
import { db } from "@/db";
import { champions, regions, type Champion, type Region } from "@/db/schema";

export type SearchResults = {
  champions: Pick<Champion, "id" | "name" | "slug" | "avatarUrl" | "role">[];
  regions: Pick<Region, "id" | "name" | "slug" | "crestImage">[];
};

/**
 * Search champions and regions by name (ilike match, limit 10 each)
 */
export const searchAll = createServerFn({ method: "GET" })
  .inputValidator((data: { term: string }) => data)
  .handler(async ({ data }): Promise<SearchResults> => {
    try {
      const { term } = data;

      if (!term || term.trim().length === 0) {
        return { champions: [], regions: [] };
      }

      const searchPattern = `%${term.trim()}%`;

      // Run both queries in parallel
      const [championResults, regionResults] = await Promise.all([
        db.query.champions.findMany({
          where: ilike(champions.name, searchPattern),
          columns: {
            id: true,
            name: true,
            slug: true,
            avatarUrl: true,
            role: true,
          },
          orderBy: [asc(champions.name)],
          limit: 10,
        }),
        db.query.regions.findMany({
          where: ilike(regions.name, searchPattern),
          columns: {
            id: true,
            name: true,
            slug: true,
            crestImage: true,
          },
          orderBy: [asc(regions.name)],
          limit: 10,
        }),
      ]);

      return {
        champions: championResults,
        regions: regionResults,
      };
    } catch (error) {
      console.error('searchAll error:', error);
      throw new Error('Failed to search');
    }
  });
