/**
 * Helpers for parsing crawled JSON data into database-ready shapes.
 */

/** Extract plain region name from markdown link like "[Bilgewater](url)" */
export function extractRegionName(markdown: string): string | null {
  const match = markdown.match(/\[([^\]]+)\]/);
  return match ? match[1] : null;
}

/** Convert wiki-style champion name (underscores) to slug */
export function toSlug(name: string): string {
  return name
    .replace(/_/g, "-")
    .replace(/'/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9-]/g, "")
    .toLowerCase();
}

/** Main region slugs we seed (matching content-panels major regions) */
export const MAIN_REGION_SLUGS = [
  "bilgewater",
  "demacia",
  "freljord",
  "ionia",
  "ixtal",
  "noxus",
  "piltover-zaun",
  "shadow-isles",
  "shurima",
  "targon",
  "bandle-city",
  "the-void",
  "icathia",
] as const;

/** Map region names (as they appear in champion data) to our slugs */
const REGION_NAME_TO_SLUG: Record<string, string> = {
  Bilgewater: "bilgewater",
  Demacia: "demacia",
  Freljord: "freljord",
  Ionia: "ionia",
  Ixtal: "ixtal",
  Noxus: "noxus",
  Piltover: "piltover-zaun",
  Zaun: "piltover-zaun",
  "Shadow Isles": "shadow-isles",
  Shurima: "shurima",
  Targon: "targon",
  "Mount Targon": "targon",
  "Bandle City": "bandle-city",
  "The Void": "the-void",
  Void: "the-void",
  Icathia: "icathia",
  Runeterra: "runeterra",
};

export function regionNameToSlug(name: string): string | null {
  return REGION_NAME_TO_SLUG[name] ?? null;
}

/** Map coordinates from region-config.ts REGIONS array */
export const REGION_COORDINATES: Record<string, { x: number; y: number }> = {
  bilgewater: { x: 27.2, y: -9 },
  demacia: { x: -20.8, y: 2.7 },
  freljord: { x: -16.9, y: 13.2 },
  ionia: { x: 26.1, y: 10.7 },
  ixtal: { x: 13.5, y: -16.5 },
  noxus: { x: -0.7, y: 7.4 },
  "piltover-zaun": { x: 9.4, y: -5.7 },
  "shadow-isles": { x: 34.7, y: -19.5 },
  shurima: { x: 3, y: -17.3 },
  targon: { x: -10.9, y: -19.5 },
};

/** Content panel region data shape */
export interface ContentPanelRegion {
  slug: string;
  title: string;
  subtitle: string;
  description?: string;
  facts?: { label: string; description: string }[];
  championSlugs?: string[];
  crestImage?: string;
  backgroundImage?: string;
}

/** Champion raw data shape from champions.json */
export interface ChampionRawData {
  metadata: {
    last_crawled: string;
    source_url: string;
  };
  structure: {
    name: string;
    quote: string;
    biography: string;
    background: string;
    appearance: string;
    personality: string;
    abilities: string;
    relations: {
      champion_name: string;
      source_url: string;
      relationship_description: string;
    }[];
    relevant_links: string[];
    trivia: string;
    role: string;
    release_date: string;
  };
  key_facts: {
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
  };
}
