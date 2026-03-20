import { relations as drizzleRelations } from "drizzle-orm";
import { regions } from "./regions";
import { champions } from "./champions";
import { relations as relationsTable } from "./relations";

/**
 * Drizzle ORM relations definitions for query API with: joins
 */

export const regionsRelations = drizzleRelations(regions, ({ many }) => ({
  champions: many(champions),
}));

export const championsRelations = drizzleRelations(champions, ({ one, many }) => ({
  region: one(regions, {
    fields: [champions.regionId],
    references: [regions.id],
  }),
  relationsFrom: many(relationsTable, {
    relationName: "champion1",
  }),
}));

export const relationsTableRelations = drizzleRelations(relationsTable, ({ one }) => ({
  champion1: one(champions, {
    fields: [relationsTable.championId1],
    references: [champions.id],
    relationName: "champion1",
  }),
  champion2: one(champions, {
    fields: [relationsTable.championId2],
    references: [champions.id],
    relationName: "champion2",
  }),
}));
