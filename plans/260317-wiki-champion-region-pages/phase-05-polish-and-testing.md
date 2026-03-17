# Phase 05 — Polish & Testing

## Context Links
- Phase 01: [phase-01-drizzle-relations-server-functions.md](phase-01-drizzle-relations-server-functions.md)
- Phase 02: [phase-02-layout-navigation.md](phase-02-layout-navigation.md)
- Phase 03: [phase-03-region-pages.md](phase-03-region-pages.md)
- Phase 04: [phase-04-champion-pages.md](phase-04-champion-pages.md)
- All routes: `src/routes/_wiki/`
- All wiki components: `src/components/wiki/`
- Root route: `src/routes/__root.tsx`

---

## Overview

- **Priority**: P2 — final quality gate before this feature is done
- **Status**: pending
- **Description**: Add loading states, error boundaries, image fallbacks, 404 handling, and run a full TypeScript + responsive design verification pass across all Phase 2 work.

---

## Key Insights

- TanStack Router has built-in `pendingComponent` and `errorComponent` on route definitions — use these instead of manual loading state management
- Image fallback best handled with `onError` handler swapping `src` to a placeholder SVG — no extra library needed
- 404 cases: TanStack Router `notFound()` throw in loader + `notFoundComponent` on route or global in `__root.tsx`
- Responsive design: wiki pages need to work at 375px (mobile), 768px (tablet), 1280px (desktop)
- TypeScript check (`tsc --noEmit`) is the primary correctness gate — run once at end of each prior phase, then final clean run here

---

## Requirements

### Functional
- All wiki routes show a skeleton/spinner while data loads (client-side navigation)
- All wiki routes show a user-friendly error message if loader throws unexpectedly
- Images (avatar, crest, bg) fall back to placeholder on load error
- Invalid slugs (`/champions/xyz`, `/regions/xyz`) show a 404 page — not a crash
- Search with no results shows an empty state message ("No champions found")
- Pagination with `?page=99` (beyond total) renders gracefully (clamps to last page or shows empty)

### Non-Functional
- `tsc --noEmit` passes with zero errors across the entire project
- No `console.error` or unhandled promise rejections in browser dev tools on happy path
- All pages render correctly at 375px, 768px, 1280px viewports
- Lighthouse performance score ≥ 80 on champion list page (optional stretch)

---

## Architecture

```
src/routes/
└── __root.tsx              ← add global notFoundComponent

src/components/wiki/
├── wiki-skeleton.tsx       ← reusable skeleton loader (card grid shape)
├── wiki-error.tsx          ← reusable error display component
└── empty-state.tsx         ← "no results" display with optional CTA

Updates to existing routes (pendingComponent, errorComponent, notFoundComponent):
  _wiki/champions.index.tsx
  _wiki/champions.$slug.tsx
  _wiki/regions.index.tsx
  _wiki/regions.$slug.tsx
```

---

## Related Code Files

### Create
- `src/components/wiki/wiki-skeleton.tsx`
- `src/components/wiki/wiki-error.tsx`
- `src/components/wiki/empty-state.tsx`

### Modify
- `src/routes/__root.tsx` — add `notFoundComponent`
- `src/routes/_wiki/champions.index.tsx` — add `pendingComponent`, `errorComponent`, empty state
- `src/routes/_wiki/champions.$slug.tsx` — add `pendingComponent`, `errorComponent`
- `src/routes/_wiki/regions.index.tsx` — add `pendingComponent`, `errorComponent`
- `src/routes/_wiki/regions.$slug.tsx` — add `pendingComponent`, `errorComponent`

---

## Implementation Steps

1. **Create `src/components/wiki/wiki-skeleton.tsx`**
   - Props: `{ count?: number }` (default 12)
   - Renders `count` placeholder card divs with `animate-pulse` Tailwind class
   - Card shape: fixed height div (matches champion card aspect ratio), stone-800 bg, rounded

2. **Create `src/components/wiki/wiki-error.tsx`**
   - Props: `{ message?: string, retry?: () => void }`
   - Centered layout: warning icon (unicode or inline SVG), "Something went wrong" heading, optional message, optional retry button
   - Gold border card, stone-900 bg

3. **Create `src/components/wiki/empty-state.tsx`**
   - Props: `{ title: string, description?: string, action?: { label: string, href: string } }`
   - Centered card: title (Cinzel), description, optional `<Link>` button
   - Used on champion list when `items.length === 0`

4. **Add `pendingComponent` and `errorComponent` to all four wiki routes**
   - `pendingComponent: () => <WikiContainer><WikiSkeleton /></WikiContainer>`
   - `errorComponent: ({ error }) => <WikiContainer><WikiError message={error.message} /></WikiContainer>`
   - Import `WikiSkeleton` and `WikiError` from `~/components/wiki/`

5. **Add global `notFoundComponent` to `__root.tsx`**
   - Simple centered layout: "404 — Page Not Found", links back to `/` and `/champions`
   - Inline in root file (short enough) or extract to `src/components/wiki/not-found.tsx`

6. **Add image `onError` fallbacks across components**
   - `champion-card.tsx`: `<img onError={(e) => { e.currentTarget.src = '/placeholder-avatar.svg' }}>`
   - `champion-hero.tsx`: same pattern for avatar + bg (bg via inline style — use `onError` on a hidden `<img>` to detect failure, then switch bg to stone-900)
   - `region-card.tsx`: crest image fallback to `/placeholder-crest.svg`
   - `region-detail-header.tsx`: bg fallback to stone-900

7. **Add empty state to champion list**
   - In `champions.index.tsx` component: if `loaderData.total === 0`, render `<EmptyState title="No champions found" description="Try adjusting your filters." action={{ label: 'Clear filters', href: '/champions' }} />`

8. **Handle `?page` out-of-range in `getChampions` server function**
   - In `src/server/champions.ts`: clamp `page` to `max(1, min(page, Math.ceil(total / pageSize)))`
   - Or: return empty items array with total — let UI show empty state

9. **TypeScript final check**
   - Run `tsc --noEmit` from project root
   - Fix all type errors before marking phase complete
   - Common issues to watch: jsonb fields typed as `unknown`, nullable FK fields, missing `params` types on routes

10. **Responsive design manual verification**
    - Open browser DevTools, test each route at 375px / 768px / 1280px
    - Champion grid: `grid-cols-2` on mobile, `grid-cols-4` on md, `grid-cols-6` on xl
    - Region grid: `grid-cols-1` on mobile, `grid-cols-2` on sm, `grid-cols-3` on lg
    - Wiki header: hamburger at < md, full nav at ≥ md
    - Champion detail: single column on mobile, 3-column grid on lg (main + aside)

---

## Todo List

- [ ] Create `src/components/wiki/wiki-skeleton.tsx`
- [ ] Create `src/components/wiki/wiki-error.tsx`
- [ ] Create `src/components/wiki/empty-state.tsx`
- [ ] Add `pendingComponent` + `errorComponent` to `champions.index.tsx`
- [ ] Add `pendingComponent` + `errorComponent` to `champions.$slug.tsx`
- [ ] Add `pendingComponent` + `errorComponent` to `regions.index.tsx`
- [ ] Add `pendingComponent` + `errorComponent` to `regions.$slug.tsx`
- [ ] Add `notFoundComponent` to `__root.tsx`
- [ ] Add `onError` image fallbacks to `champion-card.tsx`, `champion-hero.tsx`, `region-card.tsx`, `region-detail-header.tsx`
- [ ] Add empty state to `champions.index.tsx` for zero results
- [ ] Handle out-of-range `?page` in server function or component
- [ ] Run `tsc --noEmit` — fix all errors
- [ ] Manual browser test: all routes at 375px, 768px, 1280px
- [ ] Manual test: invalid slugs return 404 page
- [ ] Manual test: search with no results shows empty state
- [ ] Manual test: fast 3G throttle shows skeleton loaders on client navigation

---

## Success Criteria

- `tsc --noEmit` exits with code 0
- Navigating between wiki pages shows skeleton briefly then content (no layout shift)
- `/champions/invalid-slug` shows 404 page with links back to site
- Champion list with `?search=zzznomatch` shows empty state, not broken UI
- All grid layouts correct at all three tested viewports
- No broken image slots — all fall back to placeholder gracefully
- No unhandled runtime errors in browser console on happy path

---

## Risk Assessment

| Risk | Likelihood | Mitigation |
|------|-----------|------------|
| jsonb fields (`biography`, `keyFacts`, `facts`) typed as `unknown` by Drizzle | High | Cast with `as` after null check, or add explicit TS type to schema column using `.$type<T>()` Drizzle API |
| `pendingComponent` not firing because SSR pre-renders data | Low | Pending only shows on client-side navigations after initial load — expected behavior, still valuable |
| Placeholder SVG files missing from `public/` dir | Medium | Create minimal SVG placeholders in `public/` as part of this phase |
| `notFoundComponent` in root conflicts with nested route 404 | Low | TanStack Router resolves closest `notFoundComponent` — root one is fallback only |

---

## Security Considerations

- No new data fetching in this phase — security surface unchanged
- `onError` handlers only swap `src` attribute — no eval or DOM injection
- 404 page should not reflect URL path back to user (XSS via path reflection)

---

## Next Steps

- Once this phase passes, Phase 2 is complete — update `plan.md` status to `complete`
- Update `docs/project-roadmap.md` and `docs/project-changelog.md` via `docs-manager`
- Phase 3 (future): search page (`/search?q=`), using `searchAll` server function from Phase 01
