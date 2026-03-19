# Phase 04 — Champion Pages

## Context Links
- Research: [researcher-01-tanstack-start-ssr.md](research/researcher-01-tanstack-start-ssr.md)
- Research: [researcher-02-drizzle-query-patterns.md](research/researcher-02-drizzle-query-patterns.md)
- Server functions: `src/server/champions.ts` (Phase 01)
- Layout + shared: `src/routes/_wiki.tsx`, `src/components/wiki/wiki-container.tsx`, `breadcrumb.tsx` (Phase 02)
- Schema: `src/db/schema/champions.ts`, `src/db/schema/relations.ts`
- Region config: `src/components/regions/region-config.ts`
- Theme: `src/index.css`

---

## Overview

- **Priority**: P1
- **Status**: ✅ completed (2026-03-20)
- **Description**: Build the champion list page (`/champions`) with pagination/filtering and the champion detail page (`/champions/:slug`) with full lore sections.

---

## Key Insights

- 224 champions — offset pagination at 24/page = ~10 pages; no need for cursor pagination
- Filters: `search` (name ilike), `regionId` (FK), `role` (string) — all optional, composable with `and()`
- Champion schema: `biography` is jsonb `{ hook, body, short }`, `keyFacts` is jsonb array
- Detail page has many sections — split into focused sub-components to stay ≤200 lines each
- `relations` table links two champions; `championId2` may reference champions not in DB (external lore) — handle gracefully
- URL search params drive filters/pagination: `?page=2&search=jinx&role=Mage` — use `validateSearch` on route
- `role` values likely a fixed set — derive distinct values from DB or use known list for filter dropdown

---

## Requirements

### Functional
- `/champions` — paginated grid (24/page), filter by search/region/role, URL param state
- Each champion card: avatar image, name, title, region name, role badge
- `/champions/:slug` — full detail page with all lore sections
- Filter bar: text search input, region dropdown, role dropdown, page controls
- Pagination: prev/next + page numbers, reflects `?page=` param
- 404 for unknown slugs

### Non-Functional
- Filter/page changes update URL without full page reload (client-side navigation)
- SSR: initial load fetches data server-side via loader
- All component files ≤ 200 lines
- SEO `head` on both routes

---

## Architecture

```
src/routes/_wiki/
├── champions.index.tsx        ← /champions list + filters + pagination
└── champions.$slug.tsx        ← /champions/:slug full detail

src/components/wiki/
├── champion-card.tsx           ← avatar, name, title, region, role badge
├── champion-filter-bar.tsx     ← search input + region/role selects
├── pagination.tsx              ← page number controls
├── champion-hero.tsx           ← bg image, avatar, name, title, quote
├── champion-key-facts.tsx      ← sidebar: species, age, origin, etc.
├── champion-biography.tsx      ← hook paragraph + body text
├── champion-lore-sections.tsx  ← appearance, personality, abilities, trivia tabs
└── champion-relations.tsx      ← relation cards grid
```

**Data flow:**
```
champions.index.tsx
  loader → getChampions({ page, pageSize:24, search, regionId, role })
         → { items: Champion[], total: number }

champions.$slug.tsx
  loader → getChampionBySlug(slug)
         → champion + region + relationsFrom[]
         → null → throw notFound()
```

---

## Related Code Files

### Create
- `src/routes/_wiki/champions.index.tsx`
- `src/routes/_wiki/champions.$slug.tsx`
- `src/components/wiki/champion-card.tsx`
- `src/components/wiki/champion-filter-bar.tsx`
- `src/components/wiki/pagination.tsx`
- `src/components/wiki/champion-hero.tsx`
- `src/components/wiki/champion-key-facts.tsx`
- `src/components/wiki/champion-biography.tsx`
- `src/components/wiki/champion-lore-sections.tsx`
- `src/components/wiki/champion-relations.tsx`

### Read (no changes)
- `src/server/champions.ts`
- `src/components/regions/region-config.ts`

---

## Implementation Steps

1. **Create `src/components/wiki/champion-card.tsx`**
   - Props: `{ champion: { name, slug, title, avatarUrl, role, region: { name, slug } } }`
   - shadcn `<Card>` with hover gold border
   - Avatar: `<img src={avatarUrl ?? '/placeholder-avatar.svg'}` fixed aspect ratio (square), `object-cover`
   - Name (Cinzel), title (EB Garamond italic, muted), region name (small, linked)
   - Role: shadcn `<Badge>` with role text
   - Full card: `<Link to="/champions/$slug" params={{ slug }}>`

2. **Create `src/components/wiki/champion-filter-bar.tsx`**
   - Props: `{ regions: { id, name }[], currentFilters: { search, regionId, role, page } }`
   - Uses controlled inputs that call `router.navigate({ search: { ...filters, page: 1 } })` on change
   - shadcn `<Input>` for search (debounced 300ms via `setTimeout`)
   - `<select>` for region and role (native select, styled with Tailwind)
   - "Clear filters" button resets all to undefined

3. **Create `src/components/wiki/pagination.tsx`**
   - Props: `{ total: number, pageSize: number, currentPage: number }`
   - Computes `totalPages = Math.ceil(total / pageSize)`
   - Renders prev/next buttons + up to 7 page numbers (ellipsis for large ranges)
   - Each page button: `<Link search={{ page: n }}>` — preserves other search params

4. **Create `src/routes/_wiki/champions.index.tsx`**
   - `validateSearch`: `{ page?: number, search?: string, regionId?: number, role?: string }`
   - `loader`: `getChampions({ page: search.page ?? 1, pageSize: 24, ... })` + `getRegions()` for filter dropdown
   - `head`: `{ meta: [{ title: 'Champions — Lore Chronicles' }] }`
   - Component: `<WikiContainer>` → h1 + `<ChampionFilterBar>` → grid → `<Pagination>`
   - Grid: `grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4`

5. **Create `src/components/wiki/champion-hero.tsx`**
   - Props: `{ name, title, quote, avatarUrl, bgUrl }`
   - Full-width hero with `bgUrl` background, dark gradient overlay
   - Large avatar image (centered or left-aligned), name (Cinzel xl), title (EB Garamond)
   - Quote in italic EB Garamond with gold left border
   - Fallback: stone-900 bg if no `bgUrl`

6. **Create `src/components/wiki/champion-key-facts.tsx`**
   - Props: `{ keyFacts: Array<{ label: string; value: string }>, region: { name, slug }, releaseDate }`
   - `<aside>` styled card with gold border
   - `<dl>` list of key facts + region link + release date
   - shadcn `<Separator>` between entries

7. **Create `src/components/wiki/champion-biography.tsx`**
   - Props: `{ biography: { hook: string; body: string } }`
   - Hook: large EB Garamond italic paragraph with gold left border
   - Body: render via `react-markdown` (install as dependency)
   - Wrap in prose-styled container

8. **Create `src/components/wiki/champion-lore-sections.tsx`**
   - Props: `{ appearance, personality, abilities, trivia }`
   - **Long scroll layout** (NOT tabs) — sequential sections with h2 headings
   - Each section: h2 title (Cinzel), content rendered via `react-markdown`
   - Skip sections where value is null/empty
   - Gold divider `<Separator>` between sections

9. **Create `src/components/wiki/champion-relations.tsx`**
   - Props: `{ relations: Array<{ championName2, type, description, sourceUrl }> }`
   - Grid of relation cards: `grid grid-cols-1 sm:grid-cols-2 gap-4`
   - Each card: champion name (linked if slug resolvable), relation `type` badge, description
   - Guard: render nothing if `relations` is empty

10. **Create `src/routes/_wiki/champions.$slug.tsx`**
    - `loader`: `getChampionBySlug({ data: params.slug })` → `notFound()` if null
    - `head`: `{ meta: [{ title: `${champion.name} — Lore Chronicles` }, { name: 'description', content: champion.biography?.short }, { property: 'og:image', content: champion.avatarUrl }] }`
    - Component layout:
      ```
      <ChampionHero />
      <WikiContainer>
        <Breadcrumb items={[{label:'Champions',href:'/champions'},{label:champion.name}]} />
        <div class="grid lg:grid-cols-3 gap-8">
          <main class="lg:col-span-2">
            <ChampionBiography />
            <ChampionLoreSections />
            <ChampionRelations />
          </main>
          <aside>
            <ChampionKeyFacts />
          </aside>
        </div>
      </WikiContainer>
      ```

---

## Todo List

- [x] Create `src/components/wiki/champion-card.tsx`
- [x] Create `src/components/wiki/champion-filter-bar.tsx`
- [x] Create `src/components/wiki/pagination.tsx`
- [x] Create `src/routes/_wiki/champions.index.tsx` with loader + validateSearch + head + component
- [x] Create `src/components/wiki/champion-hero.tsx`
- [x] Create `src/components/wiki/champion-key-facts.tsx`
- [x] Create `src/components/wiki/champion-biography.tsx`
- [x] Install `react-markdown` package
- [x] Create `src/components/wiki/champion-lore-sections.tsx` (long scroll layout)
- [x] Create `src/components/wiki/champion-relations.tsx`
- [x] Create `src/routes/_wiki/champions.$slug.tsx` with loader + head + component
- [x] Run `tsc --noEmit`

---

## Success Criteria

- `/champions` shows 24 cards per page with correct pagination controls
- Typing in search input navigates to `?search=term` and filters results
- Region and role dropdowns filter correctly
- Champion detail page renders all sections (hero, biography, lore tabs, relations, key facts)
- OG meta tags set correctly for social sharing
- Invalid champion slug returns 404 without crashing

---

## Risk Assessment

| Risk | Likelihood | Mitigation |
|------|-----------|------------|
| `biography`, `keyFacts` jsonb may have inconsistent shape across champions | Medium | Add null/undefined guards in each component; render gracefully if fields missing |
| `relations.championId2` references champion not in DB | Medium | `champion-relations.tsx` receives pre-joined data — display `championName2` as text only; link only if slug available |
| Debounced search causes stale URL state | Low | Clear timeout on unmount; use `useEffect` cleanup |
| `validateSearch` rejects unknown params and strips them | Low | Only validate expected fields, allow passthrough of others via Zod `.passthrough()` or manual spread |
| Tabs component not yet installed | Low | Add `tabs` to shadcn install list in Phase 02 or install in this phase |

---

## Security Considerations

- All filter inputs passed as typed URL search params — validated by `validateSearch` before reaching loader
- No user content rendered via `dangerouslySetInnerHTML` — biography/lore rendered via `react-markdown` (sanitized by default)
- `sourceUrl` in relations: render as `<a href>` only if it starts with `https://` — prevent javascript: URIs

---

## Next Steps

- Phase 05: loading states, error boundaries, image fallbacks, responsive QA
- `champion-card.tsx` can be reused by `region-detail-header.tsx` champion grid in Phase 03
