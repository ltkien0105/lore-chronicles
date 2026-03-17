# Phase 03 — Region Pages

## Context Links
- Research: [researcher-01-tanstack-start-ssr.md](research/researcher-01-tanstack-start-ssr.md)
- Research: [researcher-02-drizzle-query-patterns.md](research/researcher-02-drizzle-query-patterns.md)
- Server functions: `src/server/regions.ts` (Phase 01)
- Layout: `src/routes/_wiki.tsx` (Phase 02)
- Shared components: `src/components/wiki/wiki-container.tsx`, `breadcrumb.tsx` (Phase 02)
- Region config (colors): `src/components/regions/region-config.ts`
- Schema: `src/db/schema/regions.ts`
- Assets: `src/assets/images/regions/` (crest images)
- Theme: `src/index.css`

---

## Overview

- **Priority**: P1
- **Status**: pending
- **Description**: Build the regions list page (`/regions`) and region detail page (`/regions/:slug`). Each region card shows crest image, name, excerpt, and champion count. Detail page has a full banner, description, facts sidebar, and champion grid.

---

## Key Insights

- 13 regions total — no pagination needed on the list page
- Region schema has: `name`, `slug`, `title`, `description`, `facts` (jsonb), `coordinates` (jsonb), `crestImage`, `bgImage`, `championSlugs` (jsonb)
- Region colors available in `region-config.ts` — use for accent borders on cards
- `crestImage` and `bgImage` may be null for some regions — needs fallback
- `facts` is a jsonb array — likely `Array<{ label: string; value: string }>` — render as key/value list
- Champion count derived from `championSlugs.length` or via join with champions table

---

## Requirements

### Functional
- `/regions` — grid of all 13 region cards, sorted alphabetically
- Each card: crest image (or placeholder), region name (Cinzel), short description excerpt (≤120 chars), champion count badge
- `/regions/:slug` — full detail page
  - Hero banner with `bgImage`, region name + title overlay
  - Full `description` text
  - Facts sidebar (rendered from `facts` jsonb)
  - Grid of champion avatar cards (from joined champions)
  - Breadcrumb: Home > Regions > {Region Name}
- 404 redirect for unknown slugs

### Non-Functional
- SSR: data fetched in route `loader` via server functions
- Per-route SEO `head` on both routes
- All component files ≤ 200 lines

---

## Architecture

```
src/routes/_wiki/
├── regions.index.tsx         ← /regions list page
└── regions.$slug.tsx         ← /regions/:slug detail page

src/components/wiki/
├── region-card.tsx           ← card used in list + champion detail sidebar
├── region-detail-header.tsx  ← hero banner with bg image + name overlay
└── region-facts.tsx          ← facts jsonb → key/value display
```

**Data flow:**
```
regions.index.tsx loader → getRegions() → RegionCard[]
regions.$slug.tsx loader → getRegionBySlug(slug) → region + champions[]
  → null → throw notFound()
```

---

## Related Code Files

### Create
- `src/routes/_wiki/regions.index.tsx`
- `src/routes/_wiki/regions.$slug.tsx`
- `src/components/wiki/region-card.tsx`
- `src/components/wiki/region-detail-header.tsx`
- `src/components/wiki/region-facts.tsx`

### Read (no changes)
- `src/server/regions.ts`
- `src/components/regions/region-config.ts`

---

## Implementation Steps

1. **Create `src/components/wiki/region-card.tsx`**
   - Props: `{ region: { name, slug, description, crestImage, champions: { id }[] } }`
   - shadcn `<Card>` with hover border color from `region-config` (match by slug)
   - Crest image (`<img>`) with `src={crestImage ?? '/placeholder-crest.svg'}` and `alt`
   - Region name in Cinzel font, gold
   - Description excerpt: `description.slice(0, 120) + '...'`
   - Champion count: shadcn `<Badge>` — `{champions.length} Champions`
   - Entire card wrapped in `<Link to="/regions/$slug" params={{ slug }}>`

2. **Create `src/routes/_wiki/regions.index.tsx`**
   - `createFileRoute('/_wiki/regions/')({ loader, head, component })`
   - `loader`: calls `getRegions()` (includes champion count via `with: { champions: { columns: { id } } }`)
   - `head`: `{ meta: [{ title: 'Regions — Lore Chronicles' }, { name: 'description', content: '...' }] }`
   - Component: `<WikiContainer>` → page heading "Regions" (Cinzel h1) → `<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">` → `<RegionCard>` per region

3. **Create `src/components/wiki/region-detail-header.tsx`**
   - Props: `{ name, title, bgImage }`
   - Full-width `<div>` with `bgImage` as CSS `backgroundImage`, dark gradient overlay
   - Region `name` in large Cinzel, `title` in EB Garamond italic below
   - Min-height: `320px`
   - Fallback: if no `bgImage`, use solid stone-900 background with gold border bottom

4. **Create `src/components/wiki/region-facts.tsx`**
   - Props: `{ facts: Array<{ label: string; value: string }> }`
   - Renders as `<dl>` list: `<dt>` (label, muted) + `<dd>` (value, white)
   - shadcn `<Separator>` between items
   - Guard: if `facts` is empty/null, render nothing

5. **Create `src/routes/_wiki/regions.$slug.tsx`**
   - `loader`: `getRegionBySlug({ data: params.slug })` → throws `notFound()` if null
   - `head`: dynamic title `${region.name} — Regions — Lore Chronicles`, OG image = `region.bgImage`
   - Component layout:
     ```
     <RegionDetailHeader name title bgImage />
     <WikiContainer>
       <Breadcrumb items={[{label:'Regions',href:'/regions'},{label:region.name}]} />
       <div class="grid lg:grid-cols-3 gap-8">
         <main class="lg:col-span-2">  ← description paragraphs
         <aside>                        ← RegionFacts + champion grid
       </div>
     </WikiContainer>
     ```
   - Champion grid in aside: small avatar cards linking to `/champions/$slug`

---

## Todo List

- [ ] Create `src/components/wiki/region-card.tsx`
- [ ] Create `src/routes/_wiki/regions.index.tsx` with loader + head + component
- [ ] Create `src/components/wiki/region-detail-header.tsx`
- [ ] Create `src/components/wiki/region-facts.tsx`
- [ ] Create `src/routes/_wiki/regions.$slug.tsx` with loader + head + component
- [ ] Verify `/regions` renders all 13 region cards
- [ ] Verify `/regions/demacia` renders full detail with champions
- [ ] Verify `/regions/invalid-slug` returns 404
- [ ] Run `tsc --noEmit`

---

## Success Criteria

- `/regions` page loads with 13 cards, each linking correctly to detail page
- Region cards show correct crest image (or placeholder), name, champion count
- Detail page shows hero banner, full description, facts list, champion grid
- Breadcrumb renders correctly on detail page
- SEO `<title>` is dynamic (e.g., "Demacia — Regions — Lore Chronicles")
- Invalid slug shows TanStack Router 404, not a crash

---

## Risk Assessment

| Risk | Likelihood | Mitigation |
|------|-----------|------------|
| `facts` jsonb shape differs from expected `{label,value}[]` | Medium | Read actual DB data first; adjust `region-facts.tsx` rendering accordingly |
| `bgImage` URLs may be relative paths vs absolute URLs | Low | Use `src={bgImage}` — Vite asset handling resolves both |
| Region color not found in `region-config.ts` for a slug | Low | Default to gold border if no match |
| Champion mini-cards in aside overflow on small screens | Low | Wrap in `grid grid-cols-3 gap-2` with small fixed avatar size |

---

## Security Considerations

- Slug from URL params is passed only to parameterized Drizzle query — no injection risk
- `facts` jsonb rendered as text values only — no `dangerouslySetInnerHTML`
- Images loaded from `src` attributes — CSP should allow image origins

---

## Next Steps

- Phase 04 champion pages can be built in parallel with this phase (no shared component conflicts)
- Champion mini-cards in the region detail aside can reuse `champion-card.tsx` from Phase 04 once available — use a simplified inline version initially
