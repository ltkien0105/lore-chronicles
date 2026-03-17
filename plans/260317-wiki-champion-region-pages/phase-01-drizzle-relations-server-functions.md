# Phase 01 — Drizzle Relations & Server Functions

## Context Links
- Research: [researcher-02-drizzle-query-patterns.md](research/researcher-02-drizzle-query-patterns.md)
- Research: [researcher-01-tanstack-start-ssr.md](research/researcher-01-tanstack-start-ssr.md)
- Schema: `src/db/schema/regions.ts`, `src/db/schema/champions.ts`, `src/db/schema/relations.ts`
- DB client: `src/db/index.ts`
- Root route: `src/routes/__root.tsx`

---

## Overview

- **Priority**: P1 — blocks all other phases
- **Status**: pending
- **Description**: Add Drizzle `relations()` definitions so `db.query` API supports `with:` joins. Create typed server functions for data fetching. Fix root route to render child routes.

---

## Key Insights

- `db/index.ts` already passes `schema` to `drizzle()` — query API is ready once relations are defined
- FK columns exist (`champions.regionId`, `relations.championId1/2`) but no `relations()` defs — `with:` joins will fail without them
- `loader` in TanStack routes runs on both client and server; DB calls must be inside `createServerFn`
- Current `__root.tsx` uses only `shellComponent` — child routes won't render without a `component: () => <Outlet />`

---

## Requirements

### Functional
- `getRegions()` — returns all 13 regions ordered by name
- `getRegionBySlug(slug)` — returns region + champions array; 404-safe (returns null)
- `getChampions({ page, pageSize, search, regionId, role })` — paginated, filtered, returns `{ items, total }`
- `getChampionBySlug(slug)` — returns champion + region + relations; 404-safe
- `searchAll(term)` — returns `{ champions[], regions[] }` (name ilike match, limit 10 each)
- Root route renders `<Outlet />` so wiki child routes display

### Non-Functional
- All server functions typed with explicit return types
- No raw SQL — use Drizzle query builder only
- Each server file stays under 200 lines

---

## Architecture

```
src/db/schema/
└── drizzle-relations.ts   ← regionsRelations, championsRelations, relationsRelations
                              export all from schema/index.ts

src/server/
├── regions.ts             ← getRegions, getRegionBySlug
├── champions.ts           ← getChampions, getChampionBySlug
└── search.ts              ← searchAll

src/routes/
└── __root.tsx             ← add component: () => <Outlet />
```

**Data flow**: Route loader → `createServerFn` handler → Drizzle query → typed response

---

## Related Code Files

### Modify
- `src/db/schema/index.ts` — add export for `drizzle-relations.ts`
- `src/routes/__root.tsx` — add `component` export

### Create
- `src/db/schema/drizzle-relations.ts`
- `src/server/regions.ts`
- `src/server/champions.ts`
- `src/server/search.ts`

---

## Implementation Steps

1. **Create `src/db/schema/drizzle-relations.ts`**
   - Import `relations` from `drizzle-orm`
   - Import `regions`, `champions`, `relations as relationsTable` from their schema files
   - Define `regionsRelations`: `many(champions)`
   - Define `championsRelations`: `one(regions, ...)`, `many(relationsTable)` (as relationsFrom)
   - Define `relationsTableRelations`: `one(champions, ...)` for both `championId1` and `championId2`
   - Export all three

2. **Update `src/db/schema/index.ts`**
   - Add `export * from './drizzle-relations'`

3. **Create `src/server/regions.ts`**
   - `getRegions` — `db.query.regions.findMany({ orderBy: asc(regions.name) })`
   - `getRegionBySlug` — `db.query.regions.findFirst({ where: eq(regions.slug, slug), with: { champions: { columns: { id, name, slug, avatarUrl, role } } } })`
   - Wrap each in `createServerFn({ method: 'GET' })` with `.inputValidator()` where needed

4. **Create `src/server/champions.ts`**
   - `getChampions` — input: `{ page: number, pageSize: number, search?: string, regionId?: number, role?: string }`
   - Build `where` conditions with `and(...)`: `ilike` for search, `eq` for regionId/role
   - Run two queries: count query + paginated data query
   - `getChampionBySlug` — query with `with: { region: true, relationsFrom: true }`

5. **Create `src/server/search.ts`**
   - `searchAll` — input: `string`
   - Parallel: `db.query.champions.findMany({ where: ilike(...), limit: 10 })` + regions
   - Returns `{ champions, regions }`

6. **Update `src/routes/__root.tsx`**
   - Import `Outlet` from `@tanstack/react-router`
   - Add `component: () => <Outlet />` to route definition

---

## Todo List

- [ ] Create `src/db/schema/drizzle-relations.ts`
- [ ] Export relations from `src/db/schema/index.ts`
- [ ] Create `src/server/regions.ts` with `getRegions` + `getRegionBySlug`
- [ ] Create `src/server/champions.ts` with `getChampions` + `getChampionBySlug`
- [ ] Create `src/server/search.ts` with `searchAll`
- [ ] Update `src/routes/__root.tsx` — add `component` with `<Outlet />`
- [ ] Run `tsc --noEmit` — verify no type errors

---

## Success Criteria

- `db.query.regions.findMany({ with: { champions: true } })` executes without runtime error
- `getChampionBySlug('jinx')` returns champion + region + relations correctly typed
- `getChampions({ page: 1, pageSize: 24 })` returns `{ items: Champion[], total: number }`
- Navigating to `/champions` renders page (not blank) — confirms `<Outlet />` fix works
- `tsc --noEmit` passes

---

## Risk Assessment

| Risk | Likelihood | Mitigation |
|------|-----------|------------|
| `relationsTable` name collision with Drizzle `relations()` import | Medium | Use aliased import: `import { relations as drizzleRelations }` |
| `championId2` may be nullable in relations — join breaks | Low | Use `leftJoin` or `with` optional relation |
| Root `<Outlet />` change breaks existing map page | Low | Map page at `index.tsx` is a direct child — still renders correctly |

---

## Security Considerations

- Server functions only accept typed, validated inputs — no raw user string passed to SQL
- `inputValidator` enforces input shape before handler executes
- No secrets or env vars returned to client in server function responses

---

## Next Steps

- Phase 02 (layout) can start in parallel once root `<Outlet />` is fixed
- Phases 03 and 04 depend on all server functions from this phase
