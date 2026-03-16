import "dotenv/config";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq } from "drizzle-orm";
import { regions, champions, relations } from "../src/db/schema";
import {
  extractRegionName,
  regionNameToSlug,
  toSlug,
  MAIN_REGION_SLUGS,
  REGION_COORDINATES,
  type ChampionRawData,
  type ContentPanelRegion,
} from "./seed-utils";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const CRAWLER_OUTPUT = resolve(__dirname, "../../lore-chronicles-crawler/output");

async function main() {
  const connectionString =
    process.env.DATABASE_URL ??
    "postgresql://localhost:5432/lore_chronicles";

  const client = postgres(connectionString, {
    max: 1,
    prepare: false,
  });
  const db = drizzle(client);

  console.log("🗑️  Clearing existing data...");
  await db.delete(relations);
  await db.delete(champions);
  await db.delete(regions);
  // Reset sequences
  await client`ALTER SEQUENCE regions_id_seq RESTART WITH 1`;
  await client`ALTER SEQUENCE champions_id_seq RESTART WITH 1`;
  await client`ALTER SEQUENCE relations_id_seq RESTART WITH 1`;

  // ── Step 1: Seed regions from content-panels ──────────────────────────
  console.log("🌍 Seeding regions...");
  const contentPanels: Record<string, ContentPanelRegion> = JSON.parse(
    readFileSync(resolve(CRAWLER_OUTPUT, "content-panels-en_us.json"), "utf-8")
  );

  const regionInserts = MAIN_REGION_SLUGS.map((slug) => {
    // content-panels uses "piltover-zaun" as "piltover-zaun", "shadow-isles", etc.
    // Some keys use different formats, try exact match first
    const panel =
      contentPanels[slug] ??
      contentPanels[slug.replace(/-/g, "_")] ??
      null;

    return {
      name: panel?.title ?? slug,
      slug,
      title: panel?.subtitle ?? null,
      description: panel?.description ?? null,
      facts: panel?.facts ?? null,
      coordinates: REGION_COORDINATES[slug] ?? null,
      crestImage: panel?.crestImage
        ? `https://universe-meeps.leagueoflegends.com/v1/latest/content/images/regions/crest-${panel.crestImage}`
        : null,
      bgImage: panel?.backgroundImage
        ? `https://universe-meeps.leagueoflegends.com/v1/latest/content/images/regions/${panel.backgroundImage}`
        : null,
      championSlugs: panel?.championSlugs ?? null,
    };
  });

  const insertedRegions = await db
    .insert(regions)
    .values(regionInserts)
    .returning({ id: regions.id, slug: regions.slug });

  const regionSlugToId = new Map(
    insertedRegions.map((r) => [r.slug, r.id])
  );

  console.log(`  ✅ Seeded ${insertedRegions.length} regions`);

  // ── Step 2: Seed champions ────────────────────────────────────────────
  console.log("⚔️  Seeding champions...");
  const championsData: ChampionRawData[] = JSON.parse(
    readFileSync(resolve(CRAWLER_OUTPUT, "champions.json"), "utf-8")
  );

  // Build faction data to map champion slugs -> regions
  const factionFiles = [
    "bilgewater_faction.json",
    "demacia_faction.json",
    "freljord_faction.json",
    "ionia_faction.json",
    "ixtal_faction.json",
    "noxus_faction.json",
    "piltover_faction.json",
    "shadow-isles_faction.json",
    "shurima_faction.json",
    "mount-targon_faction.json",
    "void_faction.json",
    "zaun_faction.json",
    "bandle-city_faction.json",
  ];

  // Map champion slug → region slug from faction files
  const champSlugToRegionSlug = new Map<string, string>();
  for (const file of factionFiles) {
    try {
      const factionData = JSON.parse(
        readFileSync(resolve(CRAWLER_OUTPUT, "universe_meeps", file), "utf-8")
      );
      const factionSlug = factionData.faction?.slug ?? "";
      const regionSlug = mapFactionToRegionSlug(factionSlug);
      const assocChamps = factionData["associated-champions"] ?? [];
      for (const champ of assocChamps) {
        if (champ.slug && regionSlug) {
          champSlugToRegionSlug.set(champ.slug, regionSlug);
        }
      }
    } catch {
      // faction file might not exist, skip
    }
  }

  // Filter out malformed entries (some have validation_errors instead of structure)
  const validChampions = championsData.filter(
    (c) => c.structure && c.key_facts
  );
  console.log(
    `  📋 ${validChampions.length}/${championsData.length} valid champion entries`
  );

  const championInserts = validChampions.map((c) => {
    const name = c.structure.name.replace(/_/g, " ");
    const slug = toSlug(c.structure.name);

    // Try to resolve region from faction data, fall back to key_facts
    let regionId: number | null = null;
    const factionRegionSlug = champSlugToRegionSlug.get(slug);
    if (factionRegionSlug && regionSlugToId.has(factionRegionSlug)) {
      regionId = regionSlugToId.get(factionRegionSlug)!;
    } else {
      // Fall back: parse region from key_facts.professional_status.regions
      const regionName = extractRegionName(
        c.key_facts.professional_status.regions
      );
      if (regionName) {
        const rSlug = regionNameToSlug(regionName);
        if (rSlug && regionSlugToId.has(rSlug)) {
          regionId = regionSlugToId.get(rSlug)!;
        }
      }
    }

    return {
      name,
      slug,
      title: c.key_facts.titles.alias !== "Unknown" ? c.key_facts.titles.alias : null,
      regionId,
      quote: c.structure.quote || null,
      biography: {
        hook: c.structure.quote || "",
        body: c.structure.background || "",
        short: c.structure.biography || "",
      },
      appearance: c.structure.appearance || null,
      personality: c.structure.personality || null,
      abilities: c.structure.abilities || null,
      trivia: c.structure.trivia || null,
      keyFacts: c.key_facts,
      avatarUrl: null,
      bgUrl: null,
      role: c.structure.role !== "Unknown" ? c.structure.role : null,
      releaseDate:
        c.structure.release_date !== "Unknown"
          ? c.structure.release_date
          : null,
    };
  });

  // Insert one at a time — biography/keyFacts JSONB can be very large
  const insertedChampions: { id: number; slug: string }[] = [];

  for (let i = 0; i < championInserts.length; i++) {
    try {
      const result = await db
        .insert(champions)
        .values(championInserts[i])
        .onConflictDoNothing({ target: champions.slug })
        .returning({ id: champions.id, slug: champions.slug });
      insertedChampions.push(...result);
    } catch (err) {
      const e = err as Error & { cause?: Error };
      const causeMsg = e.cause?.message ?? "";
      console.error(
        `  ⚠️  Failed: ${championInserts[i].name} — ${causeMsg || e.message?.slice(0, 300)}`
      );
    }
  }

  const champSlugToId = new Map(
    insertedChampions.map((c) => [c.slug, c.id])
  );

  console.log(`  ✅ Seeded ${insertedChampions.length} champions`);

  // ── Step 3: Seed relations ────────────────────────────────────────────
  console.log("🔗 Seeding relations...");
  let relationCount = 0;

  for (const c of validChampions) {
    const sourceSlug = toSlug(c.structure.name);
    const sourceId = champSlugToId.get(sourceSlug);
    if (!sourceId) continue;

    for (const rel of c.structure.relations) {
      const targetSlug = toSlug(rel.champion_name);
      const targetId = champSlugToId.get(targetSlug) ?? null;

      // Infer relationship type from description keywords
      const desc = rel.relationship_description.toLowerCase();
      let relType = "Associated";
      if (desc.includes("enemy") || desc.includes("nemesis") || desc.includes("hatred")) {
        relType = "Enemy";
      } else if (desc.includes("rival") || desc.includes("adversar")) {
        relType = "Rival";
      } else if (desc.includes("ally") || desc.includes("allies") || desc.includes("friend")) {
        relType = "Ally";
      } else if (desc.includes("partner") || desc.includes("romantic") || desc.includes("love")) {
        relType = "Partner";
      } else if (
        desc.includes("family") ||
        desc.includes("sibling") ||
        desc.includes("parent") ||
        desc.includes("brother") ||
        desc.includes("sister") ||
        desc.includes("father") ||
        desc.includes("mother") ||
        desc.includes("daughter") ||
        desc.includes("son")
      ) {
        relType = "Family";
      } else if (desc.includes("mentor") || desc.includes("student") || desc.includes("teacher")) {
        relType = "Mentor";
      }

      await db.insert(relations).values({
        championId1: sourceId,
        championId2: targetId,
        championName2: rel.champion_name.replace(/_/g, " "),
        type: relType,
        description: rel.relationship_description,
        sourceUrl: rel.source_url || null,
      });
      relationCount++;
    }
  }

  console.log(`  ✅ Seeded ${relationCount} relations`);

  // ── Step 4: Backfill champion avatar URLs from faction data ───────────
  console.log("🖼️  Backfilling champion images from faction data...");
  let imageCount = 0;

  for (const file of factionFiles) {
    try {
      const factionData = JSON.parse(
        readFileSync(resolve(CRAWLER_OUTPUT, "universe_meeps", file), "utf-8")
      );
      const assocChamps = factionData["associated-champions"] ?? [];
      for (const champ of assocChamps) {
        const slug = champ.slug;
        const champId = champSlugToId.get(slug);
        if (!champId) continue;

        const avatarUri = champ.image?.uri ?? null;
        const bgUri = champ.background?.uri ?? null;

        if (avatarUri || bgUri) {
          await db
            .update(champions)
            .set({
              avatarUrl: avatarUri,
              bgUrl: bgUri,
            })
            .where(eq(champions.id, champId));
          imageCount++;
        }
      }
    } catch {
      // skip missing files
    }
  }

  console.log(`  ✅ Updated ${imageCount} champion images`);

  console.log("\n🎉 Seeding complete!");
  await client.end();
}

function mapFactionToRegionSlug(factionSlug: string): string | null {
  const map: Record<string, string> = {
    bilgewater: "bilgewater",
    demacia: "demacia",
    freljord: "freljord",
    ionia: "ionia",
    ixtal: "ixtal",
    noxus: "noxus",
    piltover: "piltover-zaun",
    zaun: "piltover-zaun",
    "shadow-isles": "shadow-isles",
    shurima: "shurima",
    "mount-targon": "targon",
    void: "the-void",
    "bandle-city": "bandle-city",
  };
  return map[factionSlug] ?? null;
}

main().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
