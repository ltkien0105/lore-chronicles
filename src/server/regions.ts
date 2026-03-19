import { createServerFn } from "@tanstack/react-start";
import { eq, asc } from "drizzle-orm";
import { db } from "@/db";
import { regions, type Region, type Champion } from "@/db/schema";

export type RegionWithChampions = Region & {
  champions: Pick<Champion, "id" | "name" | "slug" | "avatarUrl" | "role">[];
};

export type RegionWithChampionCount = Region & {
  champions: { id: number }[];
};

/**
 * Get all regions ordered by name with champion count
 */
export const getRegions = createServerFn({ method: "GET" }).handler(
  async (): Promise<RegionWithChampionCount[]> => {
    return db.query.regions.findMany({
      orderBy: [asc(regions.name)],
      with: {
        champions: {
          columns: { id: true },
        },
      },
    });
  }
);

/**
 * Get a region by slug with its champions
 */
export const getRegionBySlug = createServerFn({ method: "GET" })
  .inputValidator((data: { slug: string }) => data)
  .handler(async ({ data }): Promise<RegionWithChampions | null> => {
    const result = await db.query.regions.findFirst({
      where: eq(regions.slug, data.slug),
      with: {
        champions: {
          columns: {
            id: true,
            name: true,
            slug: true,
            avatarUrl: true,
            role: true,
          },
        },
      },
    });
    return result ?? null;
  });
