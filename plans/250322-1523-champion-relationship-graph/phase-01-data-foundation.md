# Phase 1: Data Foundation

## Context Links
- [Plan Overview](./plan.md)
- [Brainstorm Report](./reports/brainstorm-report.md)
- Existing schema: `src/db/schema/relations.ts`
- Champion schema: `src/db/schema/champions.ts`

## Overview

| Field | Value |
|-------|-------|
| Priority | P0 - Blocker |
| Status | Pending |
| Effort | 3h |
| Dependencies | None |

Enhance existing `relations` table schema and seed 50 curated champion relationships. The current schema lacks `strength` and `bidirectional` fields needed for graph visualization.

## Key Insights

- Existing `relations` table has basic structure but needs enhancement
- Current fields: `championId1`, `championId2`, `championName2`, `type`, `description`, `sourceUrl`
- Missing fields: `strength` (1-3 for edge thickness), `bidirectional` (boolean)
- `championName2` field suggests some relations reference non-champion entities (keep for flexibility)

## Requirements

### Functional
- FR1: Enhance relations schema with `strength` and `bidirectional` columns
- FR2: Seed 50+ relationships across 7 relationship types
- FR3: Create server function to fetch relationships with champion data
- FR4: Support filtering by relationship type and region

### Non-Functional
- NFR1: Migration must be non-destructive to existing data
- NFR2: Query should return relationships in <100ms

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     relations table                          │
├─────────────────────────────────────────────────────────────┤
│ id (serial PK)                                              │
│ champion_id_1 (FK → champions.id) NOT NULL                  │
│ champion_id_2 (FK → champions.id) NULLABLE                  │
│ champion_name_2 (varchar) — fallback for non-champion refs  │
│ type (varchar) — family|ally|enemy|romantic|mentor|rival    │
│ strength (integer 1-3) — edge thickness DEFAULT 2           │
│ bidirectional (boolean) — mutual relationship DEFAULT true  │
│ description (text) — tooltip content                        │
│ source_url (varchar) — lore reference                       │
│ created_at (timestamp)                                      │
└─────────────────────────────────────────────────────────────┘
```

### Graph Data Query

```typescript
// Returns nodes + edges for graph visualization
interface GraphData {
  nodes: Array<{
    id: number;
    name: string;
    slug: string;
    avatarUrl: string | null;
    regionId: number | null;
    regionSlug: string | null;
  }>;
  edges: Array<{
    id: number;
    source: number; // champion_id_1
    target: number; // champion_id_2
    type: string;
    strength: number;
    bidirectional: boolean;
    description: string | null;
  }>;
}
```

## Related Code Files

### Files to Modify
- `src/db/schema/relations.ts` — Add strength, bidirectional columns
- `src/db/schema/index.ts` — Export new types if needed

### Files to Create
- `src/server/relationships.ts` — Graph data fetching functions
- `drizzle/XXXX_add_relationship_graph_fields.sql` — Migration file
- `scripts/seed-relationships.ts` — Seed 50 relationships

## Implementation Steps

### Step 1: Schema Enhancement (30min)
1. Add `strength` column: `integer("strength").default(2).notNull()`
2. Add `bidirectional` column: `boolean("bidirectional").default(true).notNull()`
3. Update type enum comment for documentation
4. Export updated types

### Step 2: Generate Migration (15min)
1. Run `pnpm drizzle-kit generate`
2. Verify migration SQL is correct
3. Run `pnpm drizzle-kit migrate` or `push`

### Step 3: Server Functions (1h)
1. Create `src/server/relationships.ts`
2. Implement `getGraphData()` — returns all nodes/edges
3. Implement `getChampionRelationships(championId)` — single champion's connections
4. Implement `getRelationshipsByType(type)` — filter by type
5. Add server function exports

### Step 4: Seed Data (1.5h)
1. Create seed script with 50 curated relationships
2. Include all 7 relationship types
3. Prioritize popular champions (Lux, Garen, Yasuo, etc.)
4. Run seed script
5. Verify data integrity

## Todo List

- [ ] Add `strength` integer column to relations schema
- [ ] Add `bidirectional` boolean column to relations schema
- [ ] Generate and run Drizzle migration
- [ ] Create `src/server/relationships.ts` with getGraphData()
- [ ] Implement getChampionRelationships() function
- [ ] Implement getRelationshipsByType() function
- [ ] Create seed script with 50 relationships
- [ ] Seed: 8 family relationships (Garen/Lux, Yasuo/Yone, etc.)
- [ ] Seed: 10 ally relationships (Vi/Caitlyn, etc.)
- [ ] Seed: 10 enemy relationships
- [ ] Seed: 5 romantic relationships (Xayah/Rakan, etc.)
- [ ] Seed: 7 mentor relationships
- [ ] Seed: 5 rival relationships
- [ ] Seed: 5 shared_history relationships
- [ ] Run seed script and verify

## Success Criteria

- [ ] Migration runs without errors
- [ ] `getGraphData()` returns valid nodes/edges structure
- [ ] 50+ relationships exist in database
- [ ] All 7 relationship types represented
- [ ] Query returns in <100ms
- [ ] No data loss from existing relations

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Migration fails | Low | High | Test on local DB first, backup prod |
| Champion IDs mismatch | Medium | Medium | Validate IDs against champions table |
| Missing popular champions | Low | Low | Cross-reference LoL universe page |

## Security Considerations

- Seed script should not expose sensitive data
- Server functions should be read-only (no mutations needed)
- No user input sanitization needed (admin-seeded data)

## Seed Data Examples

```typescript
// Family
{ champion1: "Garen", champion2: "Lux", type: "family", strength: 3, description: "Siblings from House Crownguard" },
{ champion1: "Yasuo", champion2: "Yone", type: "family", strength: 3, description: "Brothers" },
{ champion1: "Darius", champion2: "Draven", type: "family", strength: 3, description: "Brothers, generals of Noxus" },

// Romantic
{ champion1: "Xayah", champion2: "Rakan", type: "romantic", strength: 3, description: "Lovers and partners in rebellion" },
{ champion1: "Lucian", champion2: "Senna", type: "romantic", strength: 3, description: "Married, Sentinels of Light" },

// Enemies
{ champion1: "Garen", champion2: "Darius", type: "enemy", strength: 3, description: "Demacia vs Noxus generals" },
{ champion1: "Rengar", champion2: "Kha'Zix", type: "enemy", strength: 3, description: "The Hunt rivalry" },

// Mentor
{ champion1: "Shen", champion2: "Akali", type: "mentor", strength: 2, description: "Former master and student" },
{ champion1: "Lee Sin", champion2: "Udyr", type: "mentor", strength: 2, description: "Ionian martial training" },
```

## Next Steps

After completion:
1. Proceed to [Phase 2: Basic Graph Visualization](./phase-02-basic-graph-visualization.md)
2. Graph component will consume `getGraphData()` output
