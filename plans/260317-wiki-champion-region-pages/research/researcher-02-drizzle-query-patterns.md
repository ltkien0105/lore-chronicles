# Drizzle ORM Query Patterns Research

## Relational Queries (db.query API)
Requires `schema` passed to `drizzle()` — already configured in `src/db/index.ts`.

**Must define relations** in schema for `with:` joins:
```ts
import { relations } from "drizzle-orm";
export const regionsRelations = relations(regions, ({ many }) => ({
  champions: many(champions),
}));
export const championsRelations = relations(champions, ({ one, many }) => ({
  region: one(regions, { fields: [champions.regionId], references: [regions.id] }),
  relationsFrom: many(relationsTable),
}));
```

## Filtering
```ts
import { ilike, or, eq, and } from "drizzle-orm";
// Case-insensitive search
db.select().from(champions).where(ilike(champions.name, `%${term}%`))
// Multiple conditional filters
db.select().from(champions).where(and(
  term ? ilike(champions.name, `%${term}%`) : undefined,
  regionId ? eq(champions.regionId, regionId) : undefined,
))
```

## Pagination
```ts
// Offset-based (sufficient for 224 champions)
await db.select().from(champions)
  .orderBy(asc(champions.name))
  .limit(pageSize)
  .offset((page - 1) * pageSize)
```

## Key Findings
1. **Must add Drizzle `relations()` definitions** — schema has FK columns but no relation defs
2. `db.query` API needs relations defined to use `with:` joins
3. `ilike` sufficient for 224-champion search (no full-text needed)
4. Offset pagination fine for small dataset
5. Select specific columns via `columns:` option in relational API
