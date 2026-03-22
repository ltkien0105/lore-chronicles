import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq } from "drizzle-orm";
import { champions, relations, RELATIONSHIP_TYPES } from "../src/db/schema";

type RelationshipSeed = {
  champion1Slug: string;
  champion2Slug: string;
  type: string;
  strength: number;
  bidirectional: boolean;
  description: string;
};

/**
 * 50+ curated champion relationships across 7 types
 * Based on official League of Legends lore
 */
const RELATIONSHIP_SEEDS: RelationshipSeed[] = [
  // ══════════════════════════════════════════════════════════════
  // FAMILY (8 relationships)
  // ══════════════════════════════════════════════════════════════
  {
    champion1Slug: "garen",
    champion2Slug: "lux",
    type: RELATIONSHIP_TYPES.FAMILY,
    strength: 3,
    bidirectional: true,
    description: "Siblings from House Crownguard of Demacia",
  },
  {
    champion1Slug: "yasuo",
    champion2Slug: "yone",
    type: RELATIONSHIP_TYPES.FAMILY,
    strength: 3,
    bidirectional: true,
    description: "Brothers from Ionia, tragically separated by death",
  },
  {
    champion1Slug: "darius",
    champion2Slug: "draven",
    type: RELATIONSHIP_TYPES.FAMILY,
    strength: 3,
    bidirectional: true,
    description: "Brothers, both generals of Noxus",
  },
  {
    champion1Slug: "vi",
    champion2Slug: "jinx",
    type: RELATIONSHIP_TYPES.FAMILY,
    strength: 3,
    bidirectional: true,
    description: "Sisters from Zaun with a complicated history",
  },
  {
    champion1Slug: "cassiopeia",
    champion2Slug: "katarina",
    type: RELATIONSHIP_TYPES.FAMILY,
    strength: 3,
    bidirectional: true,
    description: "Sisters from the Du Couteau family of Noxus",
  },
  {
    champion1Slug: "nasus",
    champion2Slug: "renekton",
    type: RELATIONSHIP_TYPES.FAMILY,
    strength: 3,
    bidirectional: true,
    description: "Brothers, Ascended guardians of Shurima",
  },
  {
    champion1Slug: "kayle",
    champion2Slug: "morgana",
    type: RELATIONSHIP_TYPES.FAMILY,
    strength: 3,
    bidirectional: true,
    description: "Twin sisters, divided by ideology",
  },
  {
    champion1Slug: "quinn",
    champion2Slug: "fiora",
    type: RELATIONSHIP_TYPES.FAMILY,
    strength: 2,
    bidirectional: true,
    description: "Fellow Demacian warriors and rangers",
  },

  // ══════════════════════════════════════════════════════════════
  // ROMANTIC (5 relationships)
  // ══════════════════════════════════════════════════════════════
  {
    champion1Slug: "xayah",
    champion2Slug: "rakan",
    type: RELATIONSHIP_TYPES.ROMANTIC,
    strength: 3,
    bidirectional: true,
    description: "Vastayan lovers and partners in rebellion",
  },
  {
    champion1Slug: "lucian",
    champion2Slug: "senna",
    type: RELATIONSHIP_TYPES.ROMANTIC,
    strength: 3,
    bidirectional: true,
    description: "Married Sentinels of Light",
  },
  {
    champion1Slug: "ashe",
    champion2Slug: "tryndamere",
    type: RELATIONSHIP_TYPES.ROMANTIC,
    strength: 3,
    bidirectional: true,
    description: "King and Queen of the Freljord",
  },
  {
    champion1Slug: "garen",
    champion2Slug: "katarina",
    type: RELATIONSHIP_TYPES.ROMANTIC,
    strength: 2,
    bidirectional: true,
    description: "Star-crossed lovers from rival nations",
  },
  {
    champion1Slug: "ezreal",
    champion2Slug: "lux",
    type: RELATIONSHIP_TYPES.ROMANTIC,
    strength: 1,
    bidirectional: false,
    description: "Ezreal's unrequited crush on Lux",
  },

  // ══════════════════════════════════════════════════════════════
  // ALLIES (10 relationships)
  // ══════════════════════════════════════════════════════════════
  {
    champion1Slug: "vi",
    champion2Slug: "caitlyn",
    type: RELATIONSHIP_TYPES.ALLY,
    strength: 3,
    bidirectional: true,
    description: "Piltover Enforcer partners",
  },
  {
    champion1Slug: "graves",
    champion2Slug: "twisted-fate",
    type: RELATIONSHIP_TYPES.ALLY,
    strength: 3,
    bidirectional: true,
    description: "Partners in crime (with complicated history)",
  },
  {
    champion1Slug: "jarvan-iv",
    champion2Slug: "garen",
    type: RELATIONSHIP_TYPES.ALLY,
    strength: 3,
    bidirectional: true,
    description: "Prince and loyal soldier of Demacia",
  },
  {
    champion1Slug: "ekko",
    champion2Slug: "vi",
    type: RELATIONSHIP_TYPES.ALLY,
    strength: 2,
    bidirectional: true,
    description: "Childhood friends from Zaun",
  },
  {
    champion1Slug: "ahri",
    champion2Slug: "yasuo",
    type: RELATIONSHIP_TYPES.ALLY,
    strength: 2,
    bidirectional: true,
    description: "Traveling companions in Ionia",
  },
  {
    champion1Slug: "braum",
    champion2Slug: "ashe",
    type: RELATIONSHIP_TYPES.ALLY,
    strength: 2,
    bidirectional: true,
    description: "Freljord allies",
  },
  {
    champion1Slug: "azir",
    champion2Slug: "sivir",
    type: RELATIONSHIP_TYPES.ALLY,
    strength: 2,
    bidirectional: true,
    description: "Emperor and descendant working to restore Shurima",
  },
  {
    champion1Slug: "miss-fortune",
    champion2Slug: "illaoi",
    type: RELATIONSHIP_TYPES.ALLY,
    strength: 2,
    bidirectional: true,
    description: "Bilgewater allies",
  },
  {
    champion1Slug: "poppy",
    champion2Slug: "galio",
    type: RELATIONSHIP_TYPES.ALLY,
    strength: 2,
    bidirectional: true,
    description: "Demacian guardians",
  },
  {
    champion1Slug: "taliyah",
    champion2Slug: "yasuo",
    type: RELATIONSHIP_TYPES.ALLY,
    strength: 2,
    bidirectional: true,
    description: "Student and reluctant mentor",
  },

  // ══════════════════════════════════════════════════════════════
  // ENEMIES (10 relationships)
  // ══════════════════════════════════════════════════════════════
  {
    champion1Slug: "rengar",
    champion2Slug: "nidalee",
    type: RELATIONSHIP_TYPES.ENEMY,
    strength: 3,
    bidirectional: true,
    description: "Rival hunters in the jungle",
  },
  {
    champion1Slug: "garen",
    champion2Slug: "darius",
    type: RELATIONSHIP_TYPES.ENEMY,
    strength: 3,
    bidirectional: true,
    description: "Generals of rival nations Demacia and Noxus",
  },
  {
    champion1Slug: "zed",
    champion2Slug: "shen",
    type: RELATIONSHIP_TYPES.ENEMY,
    strength: 3,
    bidirectional: true,
    description: "Former brothers turned enemies",
  },
  {
    champion1Slug: "yasuo",
    champion2Slug: "riven",
    type: RELATIONSHIP_TYPES.ENEMY,
    strength: 3,
    bidirectional: true,
    description: "Haunted by shared tragedy at the Placidium",
  },
  {
    champion1Slug: "thresh",
    champion2Slug: "lucian",
    type: RELATIONSHIP_TYPES.ENEMY,
    strength: 3,
    bidirectional: true,
    description: "Thresh tortured Senna, Lucian's wife",
  },
  {
    champion1Slug: "jinx",
    champion2Slug: "caitlyn",
    type: RELATIONSHIP_TYPES.ENEMY,
    strength: 3,
    bidirectional: true,
    description: "Criminal and enforcer of Piltover",
  },
  {
    champion1Slug: "sejuani",
    champion2Slug: "ashe",
    type: RELATIONSHIP_TYPES.ENEMY,
    strength: 2,
    bidirectional: true,
    description: "Rival Freljord leaders",
  },
  {
    champion1Slug: "swain",
    champion2Slug: "jarvan-iv",
    type: RELATIONSHIP_TYPES.ENEMY,
    strength: 2,
    bidirectional: true,
    description: "Noxian and Demacian leaders",
  },
  {
    champion1Slug: "gangplank",
    champion2Slug: "miss-fortune",
    type: RELATIONSHIP_TYPES.ENEMY,
    strength: 3,
    bidirectional: true,
    description: "Rival pirate captains of Bilgewater",
  },
  {
    champion1Slug: "lissandra",
    champion2Slug: "ashe",
    type: RELATIONSHIP_TYPES.ENEMY,
    strength: 2,
    bidirectional: false,
    description: "Ice Witch's secret manipulation of Freljord",
  },

  // ══════════════════════════════════════════════════════════════
  // MENTOR (7 relationships)
  // ══════════════════════════════════════════════════════════════
  {
    champion1Slug: "shen",
    champion2Slug: "akali",
    type: RELATIONSHIP_TYPES.MENTOR,
    strength: 2,
    bidirectional: false,
    description: "Former master and student of the Kinkou Order",
  },
  {
    champion1Slug: "master-yi",
    champion2Slug: "wukong",
    type: RELATIONSHIP_TYPES.MENTOR,
    strength: 2,
    bidirectional: false,
    description: "Wuju master and student",
  },
  {
    champion1Slug: "lee-sin",
    champion2Slug: "udyr",
    type: RELATIONSHIP_TYPES.MENTOR,
    strength: 2,
    bidirectional: false,
    description: "Ionian martial arts training",
  },
  {
    champion1Slug: "swain",
    champion2Slug: "darius",
    type: RELATIONSHIP_TYPES.MENTOR,
    strength: 2,
    bidirectional: false,
    description: "Grand General and Hand of Noxus",
  },
  {
    champion1Slug: "ryze",
    champion2Slug: "brand",
    type: RELATIONSHIP_TYPES.MENTOR,
    strength: 2,
    bidirectional: false,
    description: "Teacher and corrupted student",
  },
  {
    champion1Slug: "jax",
    champion2Slug: "fiora",
    type: RELATIONSHIP_TYPES.MENTOR,
    strength: 1,
    bidirectional: false,
    description: "Master duelist influences",
  },
  {
    champion1Slug: "zilean",
    champion2Slug: "ekko",
    type: RELATIONSHIP_TYPES.MENTOR,
    strength: 1,
    bidirectional: false,
    description: "Time manipulation mentorship",
  },

  // ══════════════════════════════════════════════════════════════
  // RIVALS (5 relationships)
  // ══════════════════════════════════════════════════════════════
  {
    champion1Slug: "fiora",
    champion2Slug: "jax",
    type: RELATIONSHIP_TYPES.RIVAL,
    strength: 2,
    bidirectional: true,
    description: "Master duelists competing for supremacy",
  },
  {
    champion1Slug: "yasuo",
    champion2Slug: "riven",
    type: RELATIONSHIP_TYPES.RIVAL,
    strength: 2,
    bidirectional: true,
    description: "Sword masters with conflicted past",
  },
  {
    champion1Slug: "darius",
    champion2Slug: "swain",
    type: RELATIONSHIP_TYPES.RIVAL,
    strength: 2,
    bidirectional: true,
    description: "Competing powers within Noxus",
  },
  {
    champion1Slug: "lux",
    champion2Slug: "sylas",
    type: RELATIONSHIP_TYPES.RIVAL,
    strength: 2,
    bidirectional: true,
    description: "Ideological conflict over magic in Demacia",
  },
  {
    champion1Slug: "jinx",
    champion2Slug: "vi",
    type: RELATIONSHIP_TYPES.RIVAL,
    strength: 3,
    bidirectional: true,
    description: "Sisters on opposite sides of the law",
  },

  // ══════════════════════════════════════════════════════════════
  // SHARED_HISTORY (5 relationships)
  // ══════════════════════════════════════════════════════════════
  {
    champion1Slug: "sylas",
    champion2Slug: "lux",
    type: RELATIONSHIP_TYPES.SHARED_HISTORY,
    strength: 2,
    bidirectional: true,
    description: "Former prisoner and visitor in Demacia",
  },
  {
    champion1Slug: "viktor",
    champion2Slug: "jayce",
    type: RELATIONSHIP_TYPES.SHARED_HISTORY,
    strength: 3,
    bidirectional: true,
    description: "Former research partners in Piltover",
  },
  {
    champion1Slug: "hecarim",
    champion2Slug: "kalista",
    type: RELATIONSHIP_TYPES.SHARED_HISTORY,
    strength: 3,
    bidirectional: true,
    description: "Betrayal and death in the Shadow Isles",
  },
  {
    champion1Slug: "twisted-fate",
    champion2Slug: "graves",
    type: RELATIONSHIP_TYPES.SHARED_HISTORY,
    strength: 3,
    bidirectional: true,
    description: "Partners betrayed, reunited",
  },
  {
    champion1Slug: "kindred",
    champion2Slug: "thresh",
    type: RELATIONSHIP_TYPES.SHARED_HISTORY,
    strength: 2,
    bidirectional: true,
    description: "Death and the defier of death",
  },
];

async function main() {
  const connectionString =
    process.env.DATABASE_URL ?? "postgresql://localhost:5432/lore_chronicles";

  const client = postgres(connectionString, {
    max: 1,
    prepare: false,
  });
  const db = drizzle(client);

  console.log("🔗 Seeding champion relationships...");

  // Get all champion slugs to ID mapping
  const allChampions = await db.select().from(champions);
  const slugToId = new Map(allChampions.map((c) => [c.slug, c.id]));

  let successCount = 0;
  let skipCount = 0;

  for (const seed of RELATIONSHIP_SEEDS) {
    const champion1Id = slugToId.get(seed.champion1Slug);
    const champion2Id = slugToId.get(seed.champion2Slug);

    if (!champion1Id) {
      console.warn(`⚠️  Champion not found: ${seed.champion1Slug}`);
      skipCount++;
      continue;
    }

    if (!champion2Id) {
      console.warn(`⚠️  Champion not found: ${seed.champion2Slug}`);
      skipCount++;
      continue;
    }

    try {
      await db.insert(relations).values({
        championId1: champion1Id,
        championId2: champion2Id,
        type: seed.type,
        strength: seed.strength,
        bidirectional: seed.bidirectional,
        description: seed.description,
        sourceUrl: null,
        championName2: null,
      });

      successCount++;
      console.log(
        `✓ ${seed.champion1Slug} ←→ ${seed.champion2Slug} (${seed.type})`
      );
    } catch (error) {
      console.error(
        `✗ Failed to seed: ${seed.champion1Slug} ←→ ${seed.champion2Slug}`,
        error
      );
      skipCount++;
    }
  }

  console.log(`\n✨ Seeding complete!`);
  console.log(`   ✓ ${successCount} relationships seeded`);
  console.log(`   ⚠️  ${skipCount} relationships skipped`);
  console.log(`\nRelationship breakdown:`);

  // Count by type
  const typeCounts = RELATIONSHIP_SEEDS.reduce(
    (acc, seed) => {
      acc[seed.type] = (acc[seed.type] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  Object.entries(typeCounts).forEach(([type, count]) => {
    console.log(`   ${type}: ${count}`);
  });

  await client.end();
}

main().catch((error) => {
  console.error("Seed script failed:", error);
  process.exit(1);
});
