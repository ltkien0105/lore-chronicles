import { createServerFn } from "@tanstack/react-start";
import { eq, and, ilike, sql, asc } from "drizzle-orm";
import { db } from "@/db";
import {
  champions,
  regions,
  relations as relationsTable,
  type Champion,
  type Region,
  type Relation,
} from "@/db/schema";

export type ChampionWithRegion = Champion & {
  region: Region | null;
};

export type ChampionWithRelations = Champion & {
  region: Region | null;
  relationsFrom: Relation[];
};

export type PaginatedChampions = {
  items: Champion[];
  total: number;
};

export type ChampionsFilter = {
  page: number;
  pageSize: number;
  search?: string;
  regionId?: number;
  role?: string;
};

/**
 * Get paginated and filtered champions list
 */
export const getChampions = createServerFn({ method: "GET" })
  .inputValidator((data: ChampionsFilter) => data)
  .handler(async ({ data }): Promise<PaginatedChampions> => {
    const { page, pageSize, search, regionId, role } = data;
    const offset = (page - 1) * pageSize;

    // Build where conditions
    const conditions = [];
    if (search) {
      conditions.push(ilike(champions.name, `%${search}%`));
    }
    if (regionId) {
      conditions.push(eq(champions.regionId, regionId));
    }
    if (role) {
      conditions.push(eq(champions.role, role));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Run count and data queries in parallel
    const [countResult, items] = await Promise.all([
      db
        .select({ count: sql<number>`count(*)` })
        .from(champions)
        .where(whereClause),
      db.query.champions.findMany({
        where: whereClause,
        orderBy: [asc(champions.name)],
        limit: pageSize,
        offset,
      }),
    ]);

    return {
      items,
      total: Number(countResult[0]?.count ?? 0),
    };
  });

/**
 * Get a champion by slug with region and relations
 */
export const getChampionBySlug = createServerFn({ method: "GET" })
  .inputValidator((data: { slug: string }) => data)
  .handler(async ({ data }): Promise<ChampionWithRelations | null> => {
    const result = await db.query.champions.findFirst({
      where: eq(champions.slug, data.slug),
      with: {
        region: true,
        relationsFrom: true,
      },
    });
    return result ?? null;
  });
