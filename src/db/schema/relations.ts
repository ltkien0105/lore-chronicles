import {
  pgTable,
  serial,
  varchar,
  text,
  integer,
  timestamp,
} from "drizzle-orm/pg-core";
import { champions } from "./champions";

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
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Relation = typeof relations.$inferSelect;
export type NewRelation = typeof relations.$inferInsert;
