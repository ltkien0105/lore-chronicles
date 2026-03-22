# Phase 4: Filtering & UI

## Context Links
- [Plan Overview](./plan.md)
- [Phase 3: Interactions](./phase-03-interactions.md)
- [Brainstorm Report](./reports/brainstorm-report.md)
- Filter pattern: `src/components/wiki/champion-filter-bar.tsx`

## Overview

| Field | Value |
|-------|-------|
| Priority | P1 - Core UX |
| Status | Pending |
| Effort | 4h |
| Dependencies | Phase 3 complete |

Add filter controls for relationship types and regions, champion search with autocomplete, and info panel showing selected champion details.

## Key Insights

- Filter by relationship type: toggle visibility of edge types
- Filter by region: show only champions from selected region(s)
- Search: quick-find champion by name with autocomplete
- Info panel: display selected champion's connections and lore snippet
- Follow existing ChampionFilterBar patterns

## Requirements

### Functional
- FR1: Toggle relationship types on/off (7 types)
- FR2: Filter by region (multi-select)
- FR3: Search champions by name with autocomplete (<500ms)
- FR4: Display info panel when node selected
- FR5: "Reset filters" button to clear all
- FR6: Show relationship count badges

### Non-Functional
- NFR1: Search results appear <500ms
- NFR2: Filter changes apply instantly (no loading)
- NFR3: Mobile-friendly filter UI (collapsible)

## Architecture

### Filter State

```typescript
interface GraphFilters {
  relationshipTypes: Set<RelationshipType>; // which types visible
  regionIds: Set<number>;                   // which regions visible
  searchQuery: string;                      // champion name search
}
```

### Component Layout

```
┌─────────────────────────────────────────────────────────────┐
│  GraphPage                                                   │
│  ┌─────────────┬───────────────────────────────────────────┐│
│  │ FilterPanel │          RelationshipGraphCanvas           ││
│  │             │                                            ││
│  │ [Search]    │                                            ││
│  │             │                                            ││
│  │ Types:      │                                            ││
│  │ ☑ Family    │                                            ││
│  │ ☑ Allies    │                                            ││
│  │ ☑ Enemies   │                                            ││
│  │ ...         │                                            ││
│  │             │                                            ││
│  │ Regions:    │                                            ││
│  │ ☑ Demacia   │                                            ││
│  │ ☑ Noxus     │                                            ││
│  │ ...         │                                            ││
│  │             ├────────────────────────────────────────────┤│
│  │ [Reset]     │  InfoPanel (when node selected)            ││
│  └─────────────┴────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

```
GraphFilters → filterGraphData(data, filters) → filtered nodes/edges
                                              → update graph scene
Search Input → debounce 300ms → filter nodes → highlight match
```

## Related Code Files

### Files to Create
- `src/components/graph/graph-filter-panel.tsx` — Filter sidebar
- `src/components/graph/graph-search.tsx` — Search with autocomplete
- `src/components/graph/graph-info-panel.tsx` — Selected node details
- `src/components/graph/use-graph-filters.ts` — Filter state hook
- `src/lib/filter-graph-data.ts` — Filter logic utility

### Files to Modify
- `src/components/graph/graph-scene.tsx` — Apply filtered data
- `src/components/graph/relationship-graph-canvas.tsx` — Layout with panels

### Reference Files
- `src/components/wiki/champion-filter-bar.tsx` — Filter UI patterns

## Implementation Steps

### Step 1: Filter State Hook (30min)
Create `src/components/graph/use-graph-filters.ts`:
```typescript
export function useGraphFilters() {
  const [filters, setFilters] = useState<GraphFilters>({
    relationshipTypes: new Set(ALL_RELATIONSHIP_TYPES),
    regionIds: new Set(), // empty = all regions
    searchQuery: "",
  });

  const toggleRelationshipType = (type: RelationshipType) => {
    setFilters(prev => {
      const next = new Set(prev.relationshipTypes);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return { ...prev, relationshipTypes: next };
    });
  };

  const toggleRegion = (regionId: number) => { /* similar */ };
  const setSearchQuery = (query: string) => { /* similar */ };
  const resetFilters = () => { /* reset to defaults */ };

  return { filters, toggleRelationshipType, toggleRegion, setSearchQuery, resetFilters };
}
```

### Step 2: Filter Logic Utility (30min)
Create `src/lib/filter-graph-data.ts`:
```typescript
export function filterGraphData(
  data: GraphData,
  filters: GraphFilters
): GraphData {
  // Filter edges by relationship type
  let filteredEdges = data.edges.filter(
    edge => filters.relationshipTypes.has(edge.type)
  );

  // Get nodes involved in filtered edges
  const activeNodeIds = new Set<number>();
  filteredEdges.forEach(edge => {
    activeNodeIds.add(edge.source);
    activeNodeIds.add(edge.target);
  });

  // Filter nodes by region (if any selected)
  let filteredNodes = data.nodes.filter(node => {
    if (filters.regionIds.size > 0 && node.regionId) {
      if (!filters.regionIds.has(node.regionId)) return false;
    }
    return activeNodeIds.has(node.id);
  });

  // Apply search filter
  if (filters.searchQuery) {
    const query = filters.searchQuery.toLowerCase();
    filteredNodes = filteredNodes.filter(
      node => node.name.toLowerCase().includes(query)
    );
  }

  // Re-filter edges to only include nodes that passed
  const nodeIdSet = new Set(filteredNodes.map(n => n.id));
  filteredEdges = filteredEdges.filter(
    edge => nodeIdSet.has(edge.source) && nodeIdSet.has(edge.target)
  );

  return { nodes: filteredNodes, edges: filteredEdges };
}
```

### Step 3: Filter Panel Component (1h)
Create `src/components/graph/graph-filter-panel.tsx`:
- Relationship type toggles with color indicators
- Region checkboxes (fetch from regions data)
- Show counts next to each filter
- Reset button
- Collapsible on mobile

### Step 4: Search Component (45min)
Create `src/components/graph/graph-search.tsx`:
- Input with search icon
- Debounced input (300ms)
- Autocomplete dropdown with matching champions
- Click result → focus camera on champion
- Keyboard navigation (up/down/enter)

### Step 5: Info Panel Component (45min)
Create `src/components/graph/graph-info-panel.tsx`:
- Show when node selected
- Champion avatar, name, title
- Region badge
- List of relationships with type colors
- "View Wiki Page" button
- Close button

### Step 6: Update Canvas Layout (30min)
Modify `src/components/graph/relationship-graph-canvas.tsx`:
- Add responsive grid layout
- Filter panel on left (collapsible mobile)
- Canvas in center
- Info panel at bottom (overlay on mobile)

### Step 7: Connect Filter State (30min)
- Pass filters to graph-scene
- Apply filterGraphData before rendering
- Update graph when filters change
- Focus camera on search result selection

## Todo List

- [ ] Create use-graph-filters.ts hook
- [ ] Implement toggleRelationshipType function
- [ ] Implement toggleRegion function
- [ ] Implement setSearchQuery function
- [ ] Implement resetFilters function
- [ ] Create filter-graph-data.ts utility
- [ ] Implement edge filtering by type
- [ ] Implement node filtering by region
- [ ] Implement node filtering by search query
- [ ] Create graph-filter-panel.tsx component
- [ ] Add relationship type toggles with colors
- [ ] Add region checkboxes
- [ ] Add filter count badges
- [ ] Add reset filters button
- [ ] Make panel collapsible on mobile
- [ ] Create graph-search.tsx component
- [ ] Implement debounced search (300ms)
- [ ] Implement autocomplete dropdown
- [ ] Implement keyboard navigation
- [ ] Create graph-info-panel.tsx component
- [ ] Show champion avatar and details
- [ ] List relationships with colors
- [ ] Add "View Wiki Page" link
- [ ] Update relationship-graph-canvas.tsx layout
- [ ] Connect filter state to graph scene
- [ ] Test all filters work correctly
- [ ] Test search finds champions <500ms

## Success Criteria

- [ ] All 7 relationship types toggle on/off
- [ ] Region filter shows only selected regions
- [ ] Search finds champions by name <500ms
- [ ] Autocomplete shows matching results
- [ ] Info panel displays selected champion details
- [ ] Reset button clears all filters
- [ ] Filters apply instantly (no loading)
- [ ] Mobile layout is usable (collapsible)
- [ ] Filter counts update correctly

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Filter performance slow | Low | Medium | Memoize filtered data |
| Search autocomplete flickers | Medium | Low | Debounce properly, loading state |
| Mobile panel overlaps graph | Medium | Medium | Use overlay/modal pattern |
| Too many re-renders | Medium | Medium | useMemo for filtered data |

## Security Considerations

- Search input sanitized before display
- No SQL injection (client-side filtering)
- Region IDs validated against known regions

## Code Patterns

### Relationship Type Toggle
```typescript
const RELATIONSHIP_TYPES = [
  { type: "family", label: "Family", color: "#3B82F6" },
  { type: "ally", label: "Allies", color: "#22C55E" },
  { type: "enemy", label: "Enemies", color: "#EF4444" },
  { type: "romantic", label: "Romantic", color: "#EC4899" },
  { type: "mentor", label: "Mentor", color: "#EAB308" },
  { type: "rival", label: "Rivals", color: "#F97316" },
  { type: "shared_history", label: "Shared History", color: "#6B7280" },
] as const;

{RELATIONSHIP_TYPES.map(({ type, label, color }) => (
  <label key={type} className="flex items-center gap-2 cursor-pointer">
    <input
      type="checkbox"
      checked={filters.relationshipTypes.has(type)}
      onChange={() => toggleRelationshipType(type)}
      className="rounded border-primary/20"
    />
    <span
      className="h-3 w-3 rounded-full"
      style={{ backgroundColor: color }}
    />
    <span className="text-sm">{label}</span>
    <span className="text-xs text-muted-foreground">
      ({edgeCounts[type] || 0})
    </span>
  </label>
))}
```

### Debounced Search
```typescript
function GraphSearch({ onSearch, onSelect }: SearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Node[]>([]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      onSearch(query);
    }, 300);
    return () => clearTimeout(timeout);
  }, [query, onSearch]);

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search champions..."
        className="pl-9"
      />
      {results.length > 0 && (
        <ul className="absolute top-full mt-1 w-full rounded-md bg-stone-900 border">
          {results.map(node => (
            <li
              key={node.id}
              onClick={() => onSelect(node)}
              className="px-3 py-2 hover:bg-stone-800 cursor-pointer"
            >
              {node.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

## Next Steps

After completion:
1. Proceed to [Phase 5: Integration](./phase-05-integration.md)
2. Set up /relationships route and navigation
