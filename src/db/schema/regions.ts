import {
  pgTable,
  serial,
  varchar,
  text,
  jsonb,
  timestamp,
} from "drizzle-orm/pg-core";

export const regions = pgTable("regions", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  title: varchar("title", { length: 200 }),
  description: text("description"),
  facts: jsonb("facts").$type<{ label: string; description: string }[]>(),
  coordinates: jsonb("coordinates").$type<{ x: number; y: number }>(),
  crestImage: varchar("crest_image", { length: 500 }),
  bgImage: varchar("bg_image", { length: 500 }),
  championSlugs: jsonb("champion_slugs").$type<string[]>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Region = typeof regions.$inferSelect;
export type NewRegion = typeof regions.$inferInsert;
