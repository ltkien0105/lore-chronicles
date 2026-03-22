---
title: "Champion Relationship Graph"
description: "Interactive 3D visualization of LoL champion connections"
status: complete
priority: P1
effort: 20h
branch: main
tags: [feature, r3f, visualization, ux]
created: 2026-03-22
completed: 2026-03-23
---

# Champion Relationship Graph

Interactive 3D force-directed graph visualizing champion relationships across Runeterra.

## Overview

This feature provides a unique visual exploration experience for champion connections, differentiating Lore Chronicles from text-based wikis. Users can discover family ties, alliances, rivalries, and romantic relationships through an immersive 3D interface.

## Key Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Visualization | React Three Fiber | Consistent with codebase, GPU-accelerated |
| Layout Engine | three-forcegraph | Best R3F integration, active maintenance |
| Data Source | Manual curation | Quality control, narrative accuracy |
| Initial Scope | 50 relationships | Manageable scope, iterate on feedback |

## Phase Overview

| Phase | Focus | Status | Effort |
|-------|-------|--------|--------|
| [Phase 1](./phase-01-data-foundation.md) | Data Foundation | ✅ Complete | 3h |
| [Phase 2](./phase-02-basic-graph-visualization.md) | Basic Graph Visualization | ✅ Complete | 5h |
| [Phase 3](./phase-03-interactions.md) | Interactions | ✅ Complete | 4h |
| [Phase 4](./phase-04-filtering-and-ui.md) | Filtering & UI | ✅ Complete | 4h |
| [Phase 5](./phase-05-integration.md) | Integration | ✅ Complete | 2h |
| [Phase 6](./phase-06-polish.md) | Polish | ✅ Complete | 2h |

## Dependencies

### External
- `three-forcegraph` - Force layout engine
- `@react-three/drei` - R3F helpers (existing)
- `@react-three/fiber` - R3F core (existing)

### Internal
- Existing `relations` table in DB schema
- Champion avatars from Data Dragon CDN
- R3F patterns from MapCanvas/RegionIcon

## Relationship Types

| Type | Color | Hex | Example |
|------|-------|-----|---------|
| Family | Blue | #3B82F6 | Garen ↔ Lux |
| Allies | Green | #22C55E | Vi ↔ Caitlyn |
| Enemies | Red | #EF4444 | Yasuo ↔ Riven |
| Romantic | Pink | #EC4899 | Xayah ↔ Rakan |
| Mentor | Gold | #EAB308 | Shen ↔ Akali |
| Rivals | Orange | #F97316 | Garen ↔ Katarina |
| Shared History | Gray | #6B7280 | Event participants |

## Success Metrics

- [ ] Graph loads under 3s
- [ ] 50+ relationships seeded
- [ ] 5+ relationship types visualized
- [ ] Search finds champions <500ms
- [ ] No regression in Lighthouse score
- [ ] 60fps on mid-tier devices

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| 200+ champions overwhelms graph | High | Region clustering, focus mode |
| Performance degradation | Medium | LOD rendering, spatial partitioning |
| Poor mobile experience | Medium | Simplified 2D fallback |

## File Structure

```
src/
├── components/
│   └── graph/
│       ├── relationship-graph-canvas.tsx   # R3F Canvas wrapper
│       ├── graph-node.tsx                  # Champion node sprite
│       ├── graph-edge.tsx                  # Relationship edge
│       ├── graph-tooltip.tsx               # Hover tooltip
│       ├── graph-controls.tsx              # Camera controls
│       └── graph-filter-panel.tsx          # Filter sidebar
├── routes/
│   └── _wiki/
│       └── relationships.tsx               # /relationships route
├── db/
│   └── schema/
│       └── relations.ts                    # Enhance existing schema
└── server/
    └── relationships.ts                    # API endpoints
```

## References

- [Brainstorm Report](./reports/brainstorm-report.md)
- [Force Graph Libraries Research](./research/researcher-01-force-graph-libraries.md)
- [3D Graph UX Patterns Research](./research/researcher-02-3d-graph-ux-patterns.md)

---

## Validation Log

### Session 1 — 2026-03-22
**Trigger:** Initial plan creation validation
**Questions asked:** 7

#### Questions & Answers

1. **[Architecture]** The plan assumes three-forcegraph library. Have you verified it works with R3F v9.5+ and Three.js 0.182?
   - Options: three-forcegraph (Recommended) | Custom R3F + ngraph.forcelayout | Custom first, fallback to lib
   - **Answer:** three-forcegraph (Recommended)
   - **Rationale:** Proceed with library approach for faster MVP; test compatibility early in Phase 2

2. **[Scope]** What should the route path be for the graph feature?
   - Options: /relationships (Recommended) | /graph | /connections
   - **Answer:** /relationships (Recommended)
   - **Rationale:** Clear purpose, matches planned "Graph" nav label, professional naming

3. **[Architecture]** How should mobile devices (<768px) experience the relationship graph?
   - Options: 2D fallback (Recommended) | Simplified 3D | No graph on mobile
   - **Answer:** 2D fallback (Recommended)
   - **Rationale:** Reliable experience over impressive but potentially broken 3D on mobile

4. **[Scope]** The plan seeds 50 relationships for MVP. Is this sufficient for a compelling graph?
   - Options: 50 relationships (MVP) | 100 relationships | All known relationships
   - **Answer:** 50 relationships (MVP)
   - **Rationale:** Start small, iterate based on user feedback; can expand in future milestone

5. **[UX]** When user clicks a champion node, should it navigate to their wiki page or just highlight?
   - Options: Double-click → Wiki page | Single-click → Wiki page | Graph-only (no navigation)
   - **Answer:** Double-click → Wiki page
   - **Rationale:** Standard UX pattern; click highlights for exploration, double-click navigates

6. **[Architecture]** How should bidirectional relationships (e.g., Garen ↔ Lux siblings) be rendered?
   - Options: Single edge (Recommended) | Double edges with arrows | Arrows for directed only
   - **Answer:** Single edge (Recommended)
   - **Rationale:** Cleaner graph visualization, bidirectional flag in data handles semantics

7. **[UX]** When a champion is selected, how much of the graph should be visible?
   - Options: 1-hop neighbors only | 2-hop neighbors | Dim only, show all
   - **Answer:** 1-hop neighbors only
   - **Rationale:** Cleaner focused view; prevents overwhelming display on complex graphs

#### Confirmed Decisions
- **Library:** three-forcegraph — proven R3F integration, test early
- **Route:** /relationships — clear and professional
- **Mobile:** 2D fallback — reliability over impressiveness
- **Seed:** 50 relationships — MVP scope, iterate later
- **Click:** Double-click navigates — standard exploration UX
- **Edges:** Single bidirectional — cleaner visualization
- **Focus:** 1-hop only — prevent overwhelm

#### Action Items
- [ ] Add compatibility test for three-forcegraph + R3F v9.5 in Phase 2 Step 1
- [ ] Update Phase 3 interactions to specify double-click navigation
- [ ] Update Phase 3 to implement 1-hop focus mode (hide non-connected nodes)
- [ ] Confirm Phase 6 mobile fallback is 2D static view

#### Impact on Phases
- Phase 2: Add three-forcegraph compatibility verification step
- Phase 3: Clarify double-click navigation, implement 1-hop focus mode
- Phase 6: Confirm 2D fallback approach for mobile
