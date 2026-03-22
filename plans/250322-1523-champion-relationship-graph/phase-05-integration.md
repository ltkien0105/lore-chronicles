# Phase 5: Integration

## Context Links
- [Plan Overview](./plan.md)
- [Phase 4: Filtering & UI](./phase-04-filtering-and-ui.md)
- Route patterns: `src/routes/_wiki/champions.index.tsx`
- Navigation: `src/components/wiki/wiki-header.tsx`

## Overview

| Field | Value |
|-------|-------|
| Priority | P1 - Integration |
| Status | Pending |
| Effort | 2h |
| Dependencies | Phase 4 complete |

Create /relationships route, add navigation link, implement deep links with ?focus=champion query param, and connect to live data.

## Key Insights

- Follow TanStack Router file-based routing pattern
- Route at `src/routes/_wiki/relationships.tsx`
- Add "Graph" link to wiki-header navLinks
- Support `?focus=slug` for deep linking to specific champion
- Load data via server function in route loader

## Requirements

### Functional
- FR1: /relationships route renders graph page
- FR2: Navigation link "Graph" in wiki header
- FR3: Deep link ?focus=champion-slug focuses camera on champion
- FR4: Champion wiki page links to graph with focus param
- FR5: Graph link from champion page focuses that champion

### Non-Functional
- NFR1: Route loads <3s on initial visit
- NFR2: Deep link focuses champion within 1s of render

## Architecture

### Route Structure

```
src/routes/
├── _wiki.tsx                    # Wiki layout (existing)
└── _wiki/
    ├── champions.index.tsx      # /champions (existing)
    ├── champions.$slug.tsx      # /champions/:slug (existing)
    ├── regions.index.tsx        # /regions (existing)
    ├── regions.$slug.tsx        # /regions/:slug (existing)
    └── relationships.tsx        # /relationships (NEW)
```

### Deep Link Flow

```
URL: /relationships?focus=garen
                ↓
Route validates search params
                ↓
Loader fetches graph data
                ↓
Component renders with focusSlug prop
                ↓
useEffect finds node by slug
                ↓
Camera animates to focused champion
```

### Cross-Linking

```
Champion Page (/champions/garen)
  → "View Relationships" button
  → Link to /relationships?focus=garen

Graph Page (/relationships)
  → Double-click or "View Wiki" button
  → Navigate to /champions/{slug}
```

## Related Code Files

### Files to Create
- `src/routes/_wiki/relationships.tsx` — Graph route

### Files to Modify
- `src/components/wiki/wiki-header.tsx` — Add "Graph" nav link
- `src/components/graph/relationship-graph-canvas.tsx` — Accept focusSlug prop
- `src/components/graph/graph-scene.tsx` — Handle initial focus
- `src/routes/_wiki/champions.$slug.tsx` — Add "View Relationships" link

### Reference Files
- `src/routes/_wiki/champions.index.tsx` — Route loader pattern

## Implementation Steps

### Step 1: Create Route File (45min)
Create `src/routes/_wiki/relationships.tsx`:
```typescript
import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";
import { RelationshipGraphCanvas } from "@/components/graph";
import { WikiContainer } from "@/components/wiki/wiki-container";
import { WikiSkeleton } from "@/components/wiki/wiki-skeleton";
import { WikiError } from "@/components/wiki/wiki-error";
import { getGraphData } from "@/server/relationships";
import { getRegions } from "@/server/regions";

type RelationshipSearch = {
  focus?: string; // champion slug to focus
};

export const Route = createFileRoute("/_wiki/relationships")({
  validateSearch: (search: Record<string, unknown>): RelationshipSearch => ({
    focus: typeof search.focus === "string" ? search.focus : undefined,
  }),
  loader: async () => {
    const [graphData, regions] = await Promise.all([
      getGraphData(),
      getRegions(),
    ]);
    return { graphData, regions };
  },
  head: () => ({
    meta: [
      { title: "Champion Relationships — Lore Chronicles" },
      {
        name: "description",
        content: "Explore champion connections through an interactive 3D relationship graph.",
      },
    ],
  }),
  pendingComponent: () => (
    <WikiContainer>
      <WikiSkeleton count={1} variant="graph" />
    </WikiContainer>
  ),
  errorComponent: ({ error }) => (
    <WikiContainer>
      <WikiError message={error.message} />
    </WikiContainer>
  ),
  component: RelationshipsPage,
});

function RelationshipsPage() {
  const { graphData, regions } = Route.useLoaderData();
  const { focus } = Route.useSearch();

  return (
    <div className="h-[calc(100vh-4rem)]"> {/* Full height minus header */}
      <Suspense fallback={<GraphLoadingState />}>
        <RelationshipGraphCanvas
          data={graphData}
          regions={regions}
          focusSlug={focus}
        />
      </Suspense>
    </div>
  );
}
```

### Step 2: Add Navigation Link (15min)
Modify `src/components/wiki/wiki-header.tsx`:
```typescript
const navLinks = [
  { label: "Map", href: "/" },
  { label: "Champions", href: "/champions" },
  { label: "Regions", href: "/regions" },
  { label: "Graph", href: "/relationships" }, // ADD THIS
  { label: "Search", href: "/search" },
] as const;
```

### Step 3: Handle Focus Prop (30min)
Modify `src/components/graph/relationship-graph-canvas.tsx`:
- Accept `focusSlug?: string` prop
- Pass to graph-scene component

Modify `src/components/graph/graph-scene.tsx`:
```typescript
useEffect(() => {
  if (focusSlug && nodes.length > 0) {
    const node = nodes.find(n => n.slug === focusSlug);
    if (node) {
      // Set as selected
      setSelectedNodeId(node.id);
      // Animate camera to node
      focusOnNode(node.position, getNeighborPositions(node.id));
    }
  }
}, [focusSlug, nodes]);
```

### Step 4: Add Cross-Links (30min)
Modify `src/routes/_wiki/champions.$slug.tsx`:
Add "View Relationships" button/link:
```typescript
<Link
  to="/relationships"
  search={{ focus: champion.slug }}
  className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
>
  <Network className="h-4 w-4" />
  View Relationships
</Link>
```

Modify `src/components/graph/graph-info-panel.tsx`:
Add "View Wiki Page" link:
```typescript
<Link
  to="/champions/$slug"
  params={{ slug: selectedNode.slug }}
  className="btn btn-primary"
>
  View Wiki Page
</Link>
```

## Todo List

- [ ] Create `src/routes/_wiki/relationships.tsx` route file
- [ ] Implement validateSearch for focus param
- [ ] Implement loader with getGraphData and getRegions
- [ ] Add head meta for SEO
- [ ] Implement pendingComponent (loading state)
- [ ] Implement errorComponent
- [ ] Implement RelationshipsPage component
- [ ] Add "Graph" link to wiki-header.tsx navLinks
- [ ] Update relationship-graph-canvas.tsx to accept focusSlug
- [ ] Update graph-scene.tsx to handle initial focus
- [ ] Implement focus animation on mount
- [ ] Add "View Relationships" link to champion page
- [ ] Add "View Wiki Page" link to graph info panel
- [ ] Test route loads correctly
- [ ] Test deep link ?focus=garen works
- [ ] Test navigation from champion page
- [ ] Test navigation back to champion page

## Success Criteria

- [ ] /relationships route renders graph
- [ ] "Graph" link visible in navigation
- [ ] ?focus=slug focuses camera on champion
- [ ] Champion page has "View Relationships" link
- [ ] Graph info panel has "View Wiki Page" link
- [ ] Route loads <3s
- [ ] Deep link focuses within 1s
- [ ] No 404 errors

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Route conflicts with existing | Low | High | Verify no /relationships route exists |
| Focus slug not found | Medium | Low | Show "Champion not found" toast |
| Large data slows initial load | Medium | Medium | Consider pagination or lazy edges |

## Security Considerations

- Validate focus slug is alphanumeric + hyphens only
- Sanitize slug before DB query
- No sensitive data exposed in URL params

## Code Patterns

### Search Param Validation
```typescript
validateSearch: (search: Record<string, unknown>): RelationshipSearch => ({
  focus: typeof search.focus === "string"
    ? search.focus.replace(/[^a-z0-9-]/gi, "") // sanitize
    : undefined,
}),
```

### Initial Focus Effect
```typescript
const hasInitialFocus = useRef(false);

useEffect(() => {
  // Only run once on initial mount
  if (hasInitialFocus.current || !focusSlug || !layoutStabilized) return;

  const node = nodes.find(n => n.slug === focusSlug);
  if (node) {
    hasInitialFocus.current = true;
    setSelectedNodeId(node.id);
    focusOnNode(node.position, getNeighborPositions(node.id));
  }
}, [focusSlug, nodes, layoutStabilized]);
```

## Next Steps

After completion:
1. Proceed to [Phase 6: Polish](./phase-06-polish.md)
2. Performance optimization, mobile fallback, accessibility
