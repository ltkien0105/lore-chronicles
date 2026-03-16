import {
  pgTable,
  serial,
  varchar,
  text,
  jsonb,
  integer,
  timestamp,
} from "drizzle-orm/pg-core";
import { regions } from "./regions";

export const champions = pgTable("champions", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  title: text("title"),
  regionId: integer("region_id").references(() => regions.id),
  quote: text("quote"),
  biography: jsonb("biography").$type<{
    hook: string;
    body: string;
    short: string;
  }>(),
  appearance: text("appearance"),
  personality: text("personality"),
  abilities: text("abilities"),
  trivia: text("trivia"),
  keyFacts: jsonb("key_facts").$type<{
    titles: { real_name: string; alias: string };
    characteristics: {
      species: string;
      pronoun: string;
      age: { current: string; born_time: string };
      weapons: string;
    };
    personal_status: {
      status: string;
      place_of_origin: string;
      current_residence: string;
      romantic_interest: string;
      family: string;
    };
    professional_status: {
      occupations: string;
      regions: string;
      factions: string;
    };
  }>(),
  avatarUrl: varchar("avatar_url", { length: 500 }),
  bgUrl: varchar("bg_url", { length: 500 }),
  role: varchar("role", { length: 50 }),
  releaseDate: varchar("release_date", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Champion = typeof champions.$inferSelect;
export type NewChampion = typeof champions.$inferInsert;
