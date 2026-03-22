# Phase 1: Data Foundation - Implementation Plan

## Context Links
- [Phase Overview](./phase-01-data-foundation.md)
- [Plan Overview](./plan.md)
- Existing schema: `src/db/schema/relations.ts`
- Server functions pattern: `src/server/champions.ts`

---

## Step 1: Enhance Relations Schema

**File:** `src/db/schema/relations.ts`

### Current Schema
```typescript
export const relations = pgTable("relations", {
  id: serial("id").primaryKey(),
  championId1: integer("champion_id_1").references(() => champions.id, { onDelete: "cascade" }).notNull(),
  championId2: integer("champion_id_2").references(() => champions.id, { onDelete: "cascade" }),
  championName2: varchar("champion_name_2", { length: 100 }),
  type: varchar("type", { length: 50 }),
  description: text("description"),
  sourceUrl: varchar("source_url", { length: 500 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
```

### Enhanced Schema
```typescript
import {
  pgTable,
  serial,
  varchar,
  text,
  integer,
  boolean,
  timestamp,
} from "drizzle-orm/pg-core";
import { champions } from "./champions";

/**
 * Champion relationship types:
 * - family: blood relatives (siblings, parents, etc.)
 * - ally: allies working together
 * - enemy: direct enemies/antagonists
 * - romantic: romantic partners
 * - mentor: teacher/student relationship
 * - rival: competitive rivals (not necessarily enemies)
 * - shared_history: significant shared past
 */
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
  /** Relationship strength: 1 (weak), 2 (moderate), 3 (strong) - affects edge thickness */
  strength: integer("strength").default(2).notNull(),
  /** Whether relationship is mutual (true) or one-directional (false) */
  bidirectional: boolean("bidirectional").default(true).notNull(),
  description: text("description"),
  sourceUrl: varchar("source_url", { length: 500 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Relation = typeof relations.$inferSelect;
export type NewRelation = typeof relations.$inferInsert;

/** Valid relationship types for graph visualization */
export const RELATIONSHIP_TYPES = [
  "family",
  "ally",
  "enemy",
  "romantic",
  "mentor",
  "rival",
  "shared_history",
] as const;

export type RelationshipType = (typeof RELATIONSHIP_TYPES)[number];
```

**Changes:**
1. Add `boolean` import from `drizzle-orm/pg-core`
2. Add `strength` column: `integer("strength").default(2).notNull()`
3. Add `bidirectional` column: `boolean("bidirectional").default(true).notNull()`
4. Add JSDoc comments for documentation
5. Export `RELATIONSHIP_TYPES` constant and type

---

## Step 2: Generate & Run Migration

### Commands
```bash
# Generate migration
pnpm db:generate

# Review generated SQL in drizzle/ folder
# Expected migration content:
# ALTER TABLE "relations" ADD COLUMN "strength" integer DEFAULT 2 NOT NULL;
# ALTER TABLE "relations" ADD COLUMN "bidirectional" boolean DEFAULT true NOT NULL;

# Run migration
pnpm db:migrate
```

### Expected Migration SQL
```sql
-- drizzle/XXXX_add_relationship_graph_fields.sql
ALTER TABLE "relations" ADD COLUMN "strength" integer DEFAULT 2 NOT NULL;
ALTER TABLE "relations" ADD COLUMN "bidirectional" boolean DEFAULT true NOT NULL;
```

### Verification
```bash
# Check migration applied
psql -c "SELECT column_name, data_type, column_default FROM information_schema.columns WHERE table_name = 'relations';"
```

---

## Step 3: Create Server Functions

**File:** `src/server/relationships.ts`

```typescript
import { createServerFn } from "@tanstack/react-start";
import { eq, and, or, inArray } from "drizzle-orm";
import { db } from "@/db";
import {
  champions,
  regions,
  relations as relationsTable,
  type Relation,
  type RelationshipType,
  RELATIONSHIP_TYPES,
} from "@/db/schema";

// ============================================================================
// Types
// ============================================================================

export interface GraphNode {
  id: number;
  name: string;
  slug: string;
  avatarUrl: string | null;
  regionId: number | null;
  regionSlug: string | null;
}

export interface GraphEdge {
  id: number;
  source: number;
  target: number;
  type: string;
  strength: number;
  bidirectional: boolean;
  description: string | null;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface ChampionRelationship extends Relation {
  relatedChampion: {
    id: number;
    name: string;
    slug: string;
    avatarUrl: string | null;
  } | null;
}

// ============================================================================
// Server Functions
// ============================================================================

/**
 * Get all graph data: nodes (champions with relationships) and edges
 * Used for the main relationship graph visualization
 */
export const getGraphData = createServerFn({ method: "GET" }).handler(
  async (): Promise<GraphData> => {
    try {
      // Fetch all relations with champion data
      const relationsData = await db
        .select({
          id: relationsTable.id,
          championId1: relationsTable.championId1,
          championId2: relationsTable.championId2,
          type: relationsTable.type,
          strength: relationsTable.strength,
          bidirectional: relationsTable.bidirectional,
          description: relationsTable.description,
        })
        .from(relationsTable)
        .where(
          // Only include relations where both champions exist (championId2 is not null)
          and(
            relationsTable.championId2.isNotNull()
          )
        );

      // Collect unique champion IDs from relations
      const championIds = new Set<number>();
      for (const rel of relationsData) {
        championIds.add(rel.championId1);
        if (rel.championId2) championIds.add(rel.championId2);
      }

      // Fetch champion data for nodes
      const championsData = await db
        .select({
          id: champions.id,
          name: champions.name,
          slug: champions.slug,
          avatarUrl: champions.avatarUrl,
          regionId: champions.regionId,
          regionSlug: regions.slug,
        })
        .from(champions)
        .leftJoin(regions, eq(champions.regionId, regions.id))
        .where(inArray(champions.id, Array.from(championIds)));

      // Transform to graph format
      const nodes: GraphNode[] = championsData.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        avatarUrl: c.avatarUrl,
        regionId: c.regionId,
        regionSlug: c.regionSlug,
      }));

      const edges: GraphEdge[] = relationsData
        .filter((r) => r.championId2 !== null)
        .map((r) => ({
          id: r.id,
          source: r.championId1,
          target: r.championId2!,
          type: r.type ?? "ally",
          strength: r.strength,
          bidirectional: r.bidirectional,
          description: r.description,
        }));

      return { nodes, edges };
    } catch (error) {
      console.error("getGraphData error:", error);
      throw new Error("Failed to load graph data");
    }
  }
);

/**
 * Get relationships for a specific champion
 * Returns both outgoing (from) and incoming (to) relationships
 */
export const getChampionRelationships = createServerFn({ method: "GET" })
  .inputValidator((data: { championId: number }) => data)
  .handler(async ({ data }): Promise<ChampionRelationship[]> => {
    try {
      const { championId } = data;

      // Get relations where this champion is champion1
      const outgoingRelations = await db.query.relationsTable.findMany({
        where: eq(relationsTable.championId1, championId),
        with: {
          champion2: {
            columns: {
              id: true,
              name: true,
              slug: true,
              avatarUrl: true,
            },
          },
        },
      });

      // Get relations where this champion is champion2 (bidirectional relations)
      const incomingRelations = await db.query.relationsTable.findMany({
        where: and(
          eq(relationsTable.championId2, championId),
          eq(relationsTable.bidirectional, true)
        ),
        with: {
          champion1: {
            columns: {
              id: true,
              name: true,
              slug: true,
              avatarUrl: true,
            },
          },
        },
      });

      // Transform outgoing relations
      const outgoing: ChampionRelationship[] = outgoingRelations.map((r) => ({
        ...r,
        relatedChampion: r.champion2 ?? null,
      }));

      // Transform incoming relations (swap perspective)
      const incoming: ChampionRelationship[] = incomingRelations.map((r) => ({
        ...r,
        relatedChampion: r.champion1 ?? null,
      }));

      return [...outgoing, ...incoming];
    } catch (error) {
      console.error("getChampionRelationships error:", error);
      throw new Error("Failed to load champion relationships");
    }
  });

/**
 * Get relationships filtered by type
 */
export const getRelationshipsByType = createServerFn({ method: "GET" })
  .inputValidator((data: { type: RelationshipType }) => data)
  .handler(async ({ data }): Promise<GraphData> => {
    try {
      const { type } = data;

      // Validate type
      if (!RELATIONSHIP_TYPES.includes(type)) {
        throw new Error(`Invalid relationship type: ${type}`);
      }

      // Fetch relations of this type
      const relationsData = await db
        .select({
          id: relationsTable.id,
          championId1: relationsTable.championId1,
          championId2: relationsTable.championId2,
          type: relationsTable.type,
          strength: relationsTable.strength,
          bidirectional: relationsTable.bidirectional,
          description: relationsTable.description,
        })
        .from(relationsTable)
        .where(
          and(
            eq(relationsTable.type, type),
            relationsTable.championId2.isNotNull()
          )
        );

      // Collect unique champion IDs
      const championIds = new Set<number>();
      for (const rel of relationsData) {
        championIds.add(rel.championId1);
        if (rel.championId2) championIds.add(rel.championId2);
      }

      if (championIds.size === 0) {
        return { nodes: [], edges: [] };
      }

      // Fetch champion data
      const championsData = await db
        .select({
          id: champions.id,
          name: champions.name,
          slug: champions.slug,
          avatarUrl: champions.avatarUrl,
          regionId: champions.regionId,
          regionSlug: regions.slug,
        })
        .from(champions)
        .leftJoin(regions, eq(champions.regionId, regions.id))
        .where(inArray(champions.id, Array.from(championIds)));

      // Transform to graph format
      const nodes: GraphNode[] = championsData.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        avatarUrl: c.avatarUrl,
        regionId: c.regionId,
        regionSlug: c.regionSlug,
      }));

      const edges: GraphEdge[] = relationsData
        .filter((r) => r.championId2 !== null)
        .map((r) => ({
          id: r.id,
          source: r.championId1,
          target: r.championId2!,
          type: r.type ?? type,
          strength: r.strength,
          bidirectional: r.bidirectional,
          description: r.description,
        }));

      return { nodes, edges };
    } catch (error) {
      console.error("getRelationshipsByType error:", error);
      throw new Error("Failed to load relationships by type");
    }
  });

/**
 * Get relationships filtered by region
 */
export const getRelationshipsByRegion = createServerFn({ method: "GET" })
  .inputValidator((data: { regionId: number }) => data)
  .handler(async ({ data }): Promise<GraphData> => {
    try {
      const { regionId } = data;

      // Get all champions in this region
      const regionChampions = await db
        .select({ id: champions.id })
        .from(champions)
        .where(eq(champions.regionId, regionId));

      const championIds = regionChampions.map((c) => c.id);

      if (championIds.length === 0) {
        return { nodes: [], edges: [] };
      }

      // Get relations involving these champions
      const relationsData = await db
        .select({
          id: relationsTable.id,
          championId1: relationsTable.championId1,
          championId2: relationsTable.championId2,
          type: relationsTable.type,
          strength: relationsTable.strength,
          bidirectional: relationsTable.bidirectional,
          description: relationsTable.description,
        })
        .from(relationsTable)
        .where(
          and(
            or(
              inArray(relationsTable.championId1, championIds),
              inArray(relationsTable.championId2, championIds)
            ),
            relationsTable.championId2.isNotNull()
          )
        );

      // Collect all champion IDs involved in these relations
      const allChampionIds = new Set<number>();
      for (const rel of relationsData) {
        allChampionIds.add(rel.championId1);
        if (rel.championId2) allChampionIds.add(rel.championId2);
      }

      // Fetch champion data
      const championsData = await db
        .select({
          id: champions.id,
          name: champions.name,
          slug: champions.slug,
          avatarUrl: champions.avatarUrl,
          regionId: champions.regionId,
          regionSlug: regions.slug,
        })
        .from(champions)
        .leftJoin(regions, eq(champions.regionId, regions.id))
        .where(inArray(champions.id, Array.from(allChampionIds)));

      const nodes: GraphNode[] = championsData.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        avatarUrl: c.avatarUrl,
        regionId: c.regionId,
        regionSlug: c.regionSlug,
      }));

      const edges: GraphEdge[] = relationsData
        .filter((r) => r.championId2 !== null)
        .map((r) => ({
          id: r.id,
          source: r.championId1,
          target: r.championId2!,
          type: r.type ?? "ally",
          strength: r.strength,
          bidirectional: r.bidirectional,
          description: r.description,
        }));

      return { nodes, edges };
    } catch (error) {
      console.error("getRelationshipsByRegion error:", error);
      throw new Error("Failed to load relationships by region");
    }
  });
```

### Update Drizzle Relations (if needed)

The existing `drizzle-relations.ts` already has proper relations defined. Verify that `relationsTable` is correctly aliased in the query API usage.

---

## Step 4: Create Seed Script

**File:** `scripts/seed-relationships.ts`

```typescript
import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq } from "drizzle-orm";
import { champions, relations } from "../src/db/schema";

const connectionString =
  process.env.DATABASE_URL ?? "postgresql://localhost:5432/lore_chronicles";

const client = postgres(connectionString);
const db = drizzle(client);

type RelationshipType =
  | "family"
  | "ally"
  | "enemy"
  | "romantic"
  | "mentor"
  | "rival"
  | "shared_history";

interface RelationshipSeed {
  champion1: string;
  champion2: string;
  type: RelationshipType;
  strength: 1 | 2 | 3;
  bidirectional: boolean;
  description: string;
}

// 50+ Curated Champion Relationships
const RELATIONSHIPS: RelationshipSeed[] = [
  // ============================================================================
  // FAMILY RELATIONSHIPS (8)
  // ============================================================================
  {
    champion1: "garen",
    champion2: "lux",
    type: "family",
    strength: 3,
    bidirectional: true,
    description: "Siblings from House Crownguard. Garen is protective of Lux despite her magical abilities.",
  },
  {
    champion1: "yasuo",
    champion2: "yone",
    type: "family",
    strength: 3,
    bidirectional: true,
    description: "Brothers. Yasuo was blamed for Yone's death, but Yone returned from death.",
  },
  {
    champion1: "darius",
    champion2: "draven",
    type: "family",
    strength: 3,
    bidirectional: true,
    description: "Brothers and Noxian generals. Draven is the flamboyant executioner, Darius the stoic Hand.",
  },
  {
    champion1: "kayle",
    champion2: "morgana",
    type: "family",
    strength: 3,
    bidirectional: true,
    description: "Twin sisters, daughters of Aspect of Justice. Torn apart by opposing ideologies.",
  },
  {
    champion1: "vi",
    champion2: "jinx",
    type: "family",
    strength: 3,
    bidirectional: true,
    description: "Sisters from Zaun. Jinx (Powder) was lost to chaos; Vi became an enforcer.",
  },
  {
    champion1: "nasus",
    champion2: "renekton",
    type: "family",
    strength: 3,
    bidirectional: true,
    description: "Brothers and Ascended warriors. Renekton's madness turned him against Nasus.",
  },
  {
    champion1: "katarina",
    champion2: "cassiopeia",
    type: "family",
    strength: 2,
    bidirectional: true,
    description: "Sisters of House Du Couteau. Katarina is an assassin, Cassiopeia was cursed into a serpent.",
  },
  {
    champion1: "ksante",
    champion2: "lissandra",
    type: "family",
    strength: 2,
    bidirectional: false,
    description: "K'Sante's ancestors fought against Lissandra's ice witch influence in Shurima.",
  },

  // ============================================================================
  // ALLY RELATIONSHIPS (10)
  // ============================================================================
  {
    champion1: "vi",
    champion2: "caitlyn",
    type: "ally",
    strength: 3,
    bidirectional: true,
    description: "Partners in Piltover's law enforcement. Caitlyn recruited Vi from Stillwater prison.",
  },
  {
    champion1: "jayce",
    champion2: "viktor",
    type: "ally",
    strength: 2,
    bidirectional: true,
    description: "Former partners in Hextech research. Their paths diverged over ethics of augmentation.",
  },
  {
    champion1: "lucian",
    champion2: "thresh",
    type: "ally",
    strength: 1,
    bidirectional: false,
    description: "Uneasy alliance. Lucian hunts Thresh who captured Senna's soul.",
  },
  {
    champion1: "ashe",
    champion2: "tryndamere",
    type: "ally",
    strength: 3,
    bidirectional: true,
    description: "Political marriage that grew into partnership. United Freljord tribes.",
  },
  {
    champion1: "braum",
    champion2: "ashe",
    type: "ally",
    strength: 2,
    bidirectional: true,
    description: "Braum supports Ashe's vision for a united Freljord.",
  },
  {
    champion1: "ezreal",
    champion2: "lux",
    type: "ally",
    strength: 2,
    bidirectional: true,
    description: "Adventuring companions. Ezreal admires Lux; their bond is friendly and playful.",
  },
  {
    champion1: "shen",
    champion2: "kennen",
    type: "ally",
    strength: 3,
    bidirectional: true,
    description: "Members of the Kinkou Order. Kennen is the Heart of the Tempest.",
  },
  {
    champion1: "leona",
    champion2: "diana",
    type: "ally",
    strength: 2,
    bidirectional: true,
    description: "Once friends, now representatives of opposing Solari and Lunari factions.",
  },
  {
    champion1: "graves",
    champion2: "twisted-fate",
    type: "ally",
    strength: 3,
    bidirectional: true,
    description: "Partners in crime. Betrayal and reconciliation define their bond.",
  },
  {
    champion1: "taric",
    champion2: "sona",
    type: "ally",
    strength: 2,
    bidirectional: true,
    description: "Both connected to divine power. Taric is Aspect of the Protector.",
  },

  // ============================================================================
  // ENEMY RELATIONSHIPS (10)
  // ============================================================================
  {
    champion1: "garen",
    champion2: "darius",
    type: "enemy",
    strength: 3,
    bidirectional: true,
    description: "Iconic rivalry. Demacian and Noxian champions on opposing sides of war.",
  },
  {
    champion1: "rengar",
    champion2: "khazix",
    type: "enemy",
    strength: 3,
    bidirectional: true,
    description: "The Hunt. Apex predators locked in eternal pursuit of each other.",
  },
  {
    champion1: "thresh",
    champion2: "lucian",
    type: "enemy",
    strength: 3,
    bidirectional: true,
    description: "Thresh captured Senna's soul. Lucian seeks vengeance.",
  },
  {
    champion1: "zed",
    champion2: "shen",
    type: "enemy",
    strength: 3,
    bidirectional: true,
    description: "Former brothers of the Kinkou. Zed embraced forbidden shadow arts.",
  },
  {
    champion1: "kayn",
    champion2: "zed",
    type: "enemy",
    strength: 2,
    bidirectional: false,
    description: "Kayn seeks to surpass Zed, his master. Rhaast corrupts him.",
  },
  {
    champion1: "nasus",
    champion2: "renekton",
    type: "enemy",
    strength: 3,
    bidirectional: true,
    description: "Brothers turned enemies. Renekton's madness consumes him.",
  },
  {
    champion1: "lissandra",
    champion2: "ashe",
    type: "enemy",
    strength: 2,
    bidirectional: true,
    description: "Lissandra manipulates Freljord from shadows. Ashe opposes her schemes.",
  },
  {
    champion1: "swain",
    champion2: "jarvan-iv",
    type: "enemy",
    strength: 2,
    bidirectional: true,
    description: "Leaders of Noxus and Demacia. Political and military adversaries.",
  },
  {
    champion1: "viego",
    champion2: "senna",
    type: "enemy",
    strength: 3,
    bidirectional: true,
    description: "Viego's obsession with Isolde led him to pursue Senna, who carries part of Isolde's soul.",
  },
  {
    champion1: "azir",
    champion2: "xerath",
    type: "enemy",
    strength: 3,
    bidirectional: true,
    description: "Former friends. Xerath betrayed Azir during Ascension, destroying Shurima.",
  },

  // ============================================================================
  // ROMANTIC RELATIONSHIPS (5)
  // ============================================================================
  {
    champion1: "xayah",
    champion2: "rakan",
    type: "romantic",
    strength: 3,
    bidirectional: true,
    description: "Vastayan lovers and partners in rebellion against human expansion.",
  },
  {
    champion1: "lucian",
    champion2: "senna",
    type: "romantic",
    strength: 3,
    bidirectional: true,
    description: "Married Sentinels of Light. Their love transcended even death.",
  },
  {
    champion1: "ashe",
    champion2: "tryndamere",
    type: "romantic",
    strength: 2,
    bidirectional: true,
    description: "Political marriage that evolved into genuine partnership and affection.",
  },
  {
    champion1: "garen",
    champion2: "katarina",
    type: "romantic",
    strength: 2,
    bidirectional: true,
    description: "Forbidden attraction between Demacian and Noxian champions.",
  },
  {
    champion1: "leona",
    champion2: "diana",
    type: "romantic",
    strength: 2,
    bidirectional: true,
    description: "Childhood friends with deep bond, now on opposing sides of Solari/Lunari divide.",
  },

  // ============================================================================
  // MENTOR RELATIONSHIPS (7)
  // ============================================================================
  {
    champion1: "shen",
    champion2: "akali",
    type: "mentor",
    strength: 2,
    bidirectional: false,
    description: "Shen trained Akali in Kinkou arts. She left to pursue her own path.",
  },
  {
    champion1: "zed",
    champion2: "kayn",
    type: "mentor",
    strength: 2,
    bidirectional: false,
    description: "Zed trained Kayn in shadow arts. Kayn now wields the darkin Rhaast.",
  },
  {
    champion1: "lee-sin",
    champion2: "udyr",
    type: "mentor",
    strength: 2,
    bidirectional: true,
    description: "Ionian monks who trained together. Both achieved enlightenment through discipline.",
  },
  {
    champion1: "master-yi",
    champion2: "wukong",
    type: "mentor",
    strength: 3,
    bidirectional: false,
    description: "Yi trained Wukong in Wuju style after the monkey king sought his guidance.",
  },
  {
    champion1: "gangplank",
    champion2: "miss-fortune",
    type: "mentor",
    strength: 1,
    bidirectional: false,
    description: "Miss Fortune learned from Gangplank before destroying his empire in revenge.",
  },
  {
    champion1: "ryze",
    champion2: "brand",
    type: "mentor",
    strength: 1,
    bidirectional: false,
    description: "Ryze trained Kegan Rodhe, who became Brand after being consumed by World Runes.",
  },
  {
    champion1: "trundle",
    champion2: "lissandra",
    type: "mentor",
    strength: 1,
    bidirectional: false,
    description: "Lissandra manipulated Trundle, using him as a pawn in her schemes.",
  },

  // ============================================================================
  // RIVAL RELATIONSHIPS (5)
  // ============================================================================
  {
    champion1: "fiora",
    champion2: "jax",
    type: "rival",
    strength: 2,
    bidirectional: true,
    description: "Greatest duelists in Runeterra. Both seek worthy opponents.",
  },
  {
    champion1: "draven",
    champion2: "darius",
    type: "rival",
    strength: 2,
    bidirectional: true,
    description: "Sibling rivalry. Draven seeks glory while Darius focuses on duty.",
  },
  {
    champion1: "yasuo",
    champion2: "riven",
    type: "rival",
    strength: 2,
    bidirectional: true,
    description: "Riven's wind technique killed Yasuo's master. Both seek redemption.",
  },
  {
    champion1: "ekko",
    champion2: "jinx",
    type: "rival",
    strength: 2,
    bidirectional: true,
    description: "Childhood friends turned rivals. Ekko fights for Zaun's future.",
  },
  {
    champion1: "vayne",
    champion2: "evelynn",
    type: "rival",
    strength: 2,
    bidirectional: true,
    description: "Vayne hunts monsters. Evelynn is the apex predator she cannot catch.",
  },

  // ============================================================================
  // SHARED HISTORY RELATIONSHIPS (5)
  // ============================================================================
  {
    champion1: "sylas",
    champion2: "lux",
    type: "shared_history",
    strength: 2,
    bidirectional: true,
    description: "Sylas absorbed Lux's magic, enabling his escape. Complex bond of mutual fascination.",
  },
  {
    champion1: "sejuani",
    champion2: "ashe",
    type: "shared_history",
    strength: 2,
    bidirectional: true,
    description: "Childhood friends, now leaders of opposing Freljord factions.",
  },
  {
    champion1: "viktor",
    champion2: "jayce",
    type: "shared_history",
    strength: 2,
    bidirectional: true,
    description: "Co-created Hextech. Viktor's accident led to his embrace of augmentation.",
  },
  {
    champion1: "orianna",
    champion2: "singed",
    type: "shared_history",
    strength: 1,
    bidirectional: false,
    description: "Orianna's father used Singed's work to save her, turning her into a machine.",
  },
  {
    champion1: "camille",
    champion2: "jhin",
    type: "shared_history",
    strength: 2,
    bidirectional: true,
    description: "Camille hunted Jhin. Their paths cross in violence and artistry.",
  },
];

async function seedRelationships() {
  console.log("🌱 Seeding champion relationships...");

  // Get all champions with their slugs mapped to IDs
  const allChampions = await db.select({ id: champions.id, slug: champions.slug }).from(champions);
  const slugToId = new Map(allChampions.map((c) => [c.slug, c.id]));

  console.log(`📊 Found ${allChampions.length} champions in database`);

  let seeded = 0;
  let skipped = 0;

  for (const rel of RELATIONSHIPS) {
    const championId1 = slugToId.get(rel.champion1);
    const championId2 = slugToId.get(rel.champion2);

    if (!championId1) {
      console.warn(`⚠️  Champion not found: ${rel.champion1}`);
      skipped++;
      continue;
    }
    if (!championId2) {
      console.warn(`⚠️  Champion not found: ${rel.champion2}`);
      skipped++;
      continue;
    }

    // Check if relationship already exists
    const existing = await db
      .select()
      .from(relations)
      .where(
        eq(relations.championId1, championId1)
      )
      .limit(1);

    const existingRel = existing.find(
      (e) => e.championId2 === championId2 && e.type === rel.type
    );

    if (existingRel) {
      console.log(`⏭️  Skipping existing: ${rel.champion1} → ${rel.champion2} (${rel.type})`);
      skipped++;
      continue;
    }

    // Insert relationship
    await db.insert(relations).values({
      championId1,
      championId2,
      type: rel.type,
      strength: rel.strength,
      bidirectional: rel.bidirectional,
      description: rel.description,
    });

    console.log(`✅ Seeded: ${rel.champion1} → ${rel.champion2} (${rel.type})`);
    seeded++;
  }

  console.log("\n📈 Seed Summary:");
  console.log(`   ✅ Seeded: ${seeded}`);
  console.log(`   ⏭️  Skipped: ${skipped}`);
  console.log(`   📊 Total relationships: ${RELATIONSHIPS.length}`);

  // Print type distribution
  const typeCounts = RELATIONSHIPS.reduce((acc, r) => {
    acc[r.type] = (acc[r.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  console.log("\n📊 Type Distribution:");
  for (const [type, count] of Object.entries(typeCounts)) {
    console.log(`   ${type}: ${count}`);
  }

  await client.end();
  console.log("\n✨ Done!");
}

seedRelationships().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
```

### Run Seed Script
```bash
pnpm tsx scripts/seed-relationships.ts
```

---

## Step 5: Update Package.json Scripts

Add convenience script for seeding relationships:

```json
{
  "scripts": {
    "seed:relationships": "npx tsx scripts/seed-relationships.ts"
  }
}
```

---

## Verification Checklist

### Schema Verification
```bash
# Check columns exist
psql -c "\d relations"
# Expected: strength (integer), bidirectional (boolean)
```

### Server Function Tests
```typescript
// Test in dev console or separate test file
import { getGraphData, getChampionRelationships, getRelationshipsByType } from '@/server/relationships';

// Test 1: Get all graph data
const graphData = await getGraphData();
console.log('Nodes:', graphData.nodes.length);
console.log('Edges:', graphData.edges.length);

// Test 2: Get relationships for Garen (need to know ID)
const garenRels = await getChampionRelationships({ data: { championId: 1 } });
console.log('Garen relationships:', garenRels.length);

// Test 3: Get family relationships
const familyGraph = await getRelationshipsByType({ data: { type: 'family' } });
console.log('Family edges:', familyGraph.edges.length);
```

### Performance Test
```sql
-- Should return in <100ms
EXPLAIN ANALYZE
SELECT r.*, c1.name as champion1_name, c2.name as champion2_name
FROM relations r
JOIN champions c1 ON r.champion_id_1 = c1.id
LEFT JOIN champions c2 ON r.champion_id_2 = c2.id
WHERE r.champion_id_2 IS NOT NULL;
```

---

## File Changes Summary

| File | Action | Description |
|------|--------|-------------|
| `src/db/schema/relations.ts` | Modify | Add strength, bidirectional columns |
| `src/db/schema/index.ts` | Modify | Export RELATIONSHIP_TYPES if needed |
| `src/server/relationships.ts` | Create | Graph data server functions |
| `scripts/seed-relationships.ts` | Create | Seed 50 relationships |
| `drizzle/XXXX_*.sql` | Generated | Migration file |

---

## Success Criteria Verification

- [ ] `strength` and `bidirectional` columns added to relations table
- [ ] Migration runs without errors
- [ ] `getGraphData()` returns `{ nodes: [], edges: [] }` structure
- [ ] `getChampionRelationships()` returns relationships for a champion
- [ ] `getRelationshipsByType()` filters by type correctly
- [ ] 50+ relationships seeded (50 in this plan)
- [ ] All 7 types represented: family(8), ally(10), enemy(10), romantic(5), mentor(7), rival(5), shared_history(5)
- [ ] Query performance <100ms

---

## Next Steps
After completing Phase 1:
1. Verify all server functions work via dev tools
2. Proceed to [Phase 2: Basic Graph Visualization](./phase-02-basic-graph-visualization.md)
3. Graph component will consume `getGraphData()` output
