# Phase 02 — Layout & Navigation

## Context Links
- Research: [researcher-01-tanstack-start-ssr.md](research/researcher-01-tanstack-start-ssr.md)
- Root route: `src/routes/__root.tsx`
- Theme: `src/index.css`
- Existing UI: `src/components/ui/button.tsx`
- Region config (colors): `src/components/regions/region-config.ts`
- Phase 01: [phase-01-drizzle-relations-server-functions.md](phase-01-drizzle-relations-server-functions.md)

---

## Overview

- **Priority**: P1 — required before wiki pages render with navigation
- **Status**: ✅ completed (2026-03-20)
- **Description**: Create the pathless `_wiki` layout route, install missing shadcn/ui components, and build the wiki navigation header and shared layout primitives.

---

## Key Insights

- Pathless layout route `_wiki.tsx` wraps `/champions/*` and `/regions/*` but NOT `/` (map stays fullscreen)
- Wiki header needs Cinzel font (already loaded via Google Fonts in root), gold primary color (`#eab308`)
- shadcn/ui `Card`, `Badge`, `Input`, `Separator` are needed by Phases 03–04 — install here
- Mobile hamburger requires local open/close state only — no global state needed (KISS)
- Breadcrumb is a pure display component — receives `items: { label, href? }[]` prop

---

## Requirements

### Functional
- `_wiki.tsx` layout renders persistent header + `<Outlet />` for page content
- Header: brand logo → `/`, nav links (Map, Champions, Regions), search input, mobile menu
- Search input: on submit/enter navigates to `/champions?search={term}`
- Breadcrumb: renders hierarchical path, last item non-linked
- `wiki-container.tsx`: max-width wrapper with consistent padding

### Non-Functional
- Header height: fixed, doesn't jump on navigation
- Mobile breakpoint: collapse nav links behind hamburger at `< md`
- All new component files ≤ 200 lines
- No external animation libraries — CSS transitions only

---

## Architecture

```
src/routes/
└── _wiki.tsx                        ← pathless layout, imports WikiHeader + WikiContainer

src/components/wiki/
├── wiki-header.tsx                  ← top nav: logo, links, search, hamburger
├── breadcrumb.tsx                   ← generic breadcrumb display
└── wiki-container.tsx               ← max-w-7xl centered wrapper with padding
```

**Routing tree after this phase:**
```
__root (shellComponent + Outlet)
├── index.tsx          → /          (fullscreen map, no wiki nav)
└── _wiki.tsx          → layout wrapper
    ├── champions.index.tsx  → /champions
    ├── champions.$slug.tsx  → /champions/:slug
    ├── regions.index.tsx    → /regions
    └── regions.$slug.tsx    → /regions/:slug
```

---

## Related Code Files

### Create
- `src/routes/_wiki.tsx`
- `src/components/wiki/wiki-header.tsx`
- `src/components/wiki/breadcrumb.tsx`
- `src/components/wiki/wiki-container.tsx`

### Install (shadcn CLI)
- `card` — used by region-card, champion-card
- `badge` — used by champion role/region tags
- `input` — used by search and filter bar
- `separator` — used by detail page sections

---

## Implementation Steps

1. **Install shadcn/ui components**
   ```bash
   npx shadcn@latest add card badge input separator
   ```
   Verify files appear in `src/components/ui/`.

2. **Create `src/routes/_wiki.tsx`**
   - `createFileRoute('/_wiki')({ component: WikiLayout })`
   - `WikiLayout`: renders `<WikiHeader />` + `<main><Outlet /></main>`
   - Import `WikiHeader` from `~/components/wiki/wiki-header`
   - No loader needed — layout has no data of its own

3. **Create `src/components/wiki/wiki-header.tsx`**
   - Brand: `<Link to="/">` with Cinzel font, gold text "Lore Chronicles"
   - Nav links: `<Link to="/champions">Champions</Link>`, `<Link to="/regions">Regions</Link>`, `<Link to="/">Map</Link>`
   - Active link style: use `data-[status=active]` TanStack Router class
   - Search: `<Input>` with `onKeyDown` — on Enter, `router.navigate({ to: '/champions', search: { search: value } })`
   - Mobile: `useState(false)` for `menuOpen`, hamburger button toggles visibility
   - Sticky positioning: `sticky top-0 z-40 bg-stone-950/95 backdrop-blur border-b border-gold`

4. **Create `src/components/wiki/breadcrumb.tsx`**
   - Props: `items: Array<{ label: string; href?: string }>`
   - Renders: `Home > Region > Current Page` with `/` separators
   - Last item: plain text (no link), gold color
   - Other items: `<Link>` with muted stone color, hover gold

5. **Create `src/components/wiki/wiki-container.tsx`**
   - Props: `{ children, className? }`
   - Renders `<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 {className}">`
   - Simple wrapper — no logic

---

## Todo List

- [x] Install shadcn/ui: `card`, `badge`, `input`, `separator`
- [x] Create `src/routes/_wiki.tsx` — pathless layout with WikiHeader + Outlet
- [x] Create `src/components/wiki/wiki-header.tsx` — logo, nav, search, hamburger
- [x] Create `src/components/wiki/breadcrumb.tsx`
- [x] Create `src/components/wiki/wiki-container.tsx`
- [x] Create placeholder routes: `champions.index.tsx`, `regions.index.tsx`
- [x] Run `tsc --noEmit` — verify no type errors

---

## Success Criteria

- Navigating to `/regions` shows persistent header above page content
- Navigating to `/` shows fullscreen map with no header
- Entering "jinx" in search and pressing Enter navigates to `/champions?search=jinx`
- Active nav link is visually distinct (gold underline or color)
- On mobile viewport (`< 768px`) nav links hidden behind hamburger, which toggles correctly
- `tsc --noEmit` passes

---

## Risk Assessment

| Risk | Likelihood | Mitigation |
|------|-----------|------------|
| `_wiki.tsx` layout accidentally wraps `/` map route | Low | Map at `index.tsx` is a sibling of `_wiki.tsx`, not a child — confirmed by TanStack Router file routing rules |
| shadcn `input` styles conflict with existing CSS vars | Low | shadcn uses CSS vars (`--input`) — verify `src/index.css` doesn't redefine them destructively |
| Sticky header overlaps map canvas on mobile | Low | Map is outside wiki layout, no overlap possible |

---

## Security Considerations

- Search input value is passed as URL query param only — no server-side execution in this phase
- No auth required for wiki navigation

---

## Next Steps

- Phase 03 (region pages) and Phase 04 (champion pages) can begin once this phase completes
- Both phases import `WikiContainer` and `Breadcrumb` from this phase
