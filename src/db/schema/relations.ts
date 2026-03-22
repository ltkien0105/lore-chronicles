import {
  pgTable,
  serial,
  varchar,
  text,
  integer,
  timestamp,
  boolean,
} from "drizzle-orm/pg-core";
import { champions } from "./champions";

// Relationship type constants
export const RELATIONSHIP_TYPES = {
  FAMILY: "family",
  ALLY: "ally",
  ENEMY: "enemy",
  ROMANTIC: "romantic",
  MENTOR: "mentor",
  RIVAL: "rival",
  SHARED_HISTORY: "shared_history",
} as const;

export type RelationshipType =
  (typeof RELATIONSHIP_TYPES)[keyof typeof RELATIONSHIP_TYPES];

export const relations = pgTable("relations", {
  id: serial("id").primaryKey(),
  championId1: integer("champion_id_1")
    .references(() => champions.id, { onDelete: "cascade" })
    .notNull(),
  championId2: integer("champion_id_2").references(() => champions.id, {
    onDelete: "cascade",
  }),
  championName2: varchar("champion_name_2", { length: 100 }),
  type: varchar("type", { length: 50 }),
  description: text("description"),
  sourceUrl: varchar("source_url", { length: 500 }),
  strength: integer("strength").default(2).notNull(), // 1-3 for edge thickness
  bidirectional: boolean("bidirectional").default(true).notNull(), // mutual relationship
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Relation = typeof relations.$inferSelect;
export type NewRelation = typeof relations.$inferInsert;
