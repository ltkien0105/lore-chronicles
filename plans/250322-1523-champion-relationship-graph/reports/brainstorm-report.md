# Brainstorm Report: Champion Relationship Graph

**Date:** 2026-03-22
**Feature:** Interactive 3D Champion Relationship Graph
**Status:** Approved for implementation planning

---

## Problem Statement

Lore Chronicles combines a Runeterra map with wiki-style champion/region content. To differentiate from League Wiki (Fandom), which is text-heavy and fragmented, we need an engaging visual feature that leverages our existing 3D capabilities.

---

## Requirements

### Target Audience
- **Primary:** Lore enthusiasts who want to explore champion connections
- **Secondary:** Casual LoL players browsing relationships

### Competitive Differentiation
- League Wiki uses text lists for relationships → We provide visual exploration
- Riot Universe is linear storytelling → We enable non-linear discovery
- No existing platform offers 3D relationship visualization for LoL

### Technical Constraints
- User can invest significant development time
- Should leverage existing Three.js/R3F stack
- Must maintain current performance standards

---

## Evaluated Approaches

### Visualization Libraries

| Option | Pros | Cons | Verdict |
|--------|------|------|---------|
| **Three.js/R3F (3D)** | Consistent with codebase, GPU-accelerated, unique visual impact | More complex, mobile challenges | ✅ Selected |
| **D3.js Force Graph** | Industry standard, easier data modeling, great docs | 2D only, different tech stack | Considered |
| **React-Sigma** | Performant for networks, React-native | Less visual differentiation | Rejected |

### Data Sourcing

| Option | Pros | Cons | Verdict |
|--------|------|------|---------|
| **Manual Curation** | Quality control, narrative control, accurate | Time-intensive, maintenance burden | ✅ Selected |
| **NLP Extraction** | Automated, scalable | Accuracy issues, misses nuance | Future consideration |
| **Hybrid** | Best of both | Complexity | Phase 2 enhancement |

---

## Final Recommended Solution

### Champion Relationship Graph

An interactive force-directed 3D graph where:
- **Nodes** = Champions (with avatar images/initials)
- **Edges** = Relationships (color-coded by type)
- **Interactions** = Click to expand, hover for preview, filter by region/type

### Relationship Types

| Type | Color Code | Example |
|------|------------|---------|
| Family | Blue (#3B82F6) | Garen ↔ Lux |
| Allies | Green (#22C55E) | Vi ↔ Caitlyn |
| Enemies | Red (#EF4444) | Yasuo ↔ Riven |
| Romantic | Pink (#EC4899) | Xayah ↔ Rakan |
| Mentor/Student | Gold (#EAB308) | Shen ↔ Akali |
| Rivals | Orange (#F97316) | Garen ↔ Katarina |
| Shared History | Gray (#6B7280) | Event participants |

### Data Model

```typescript
interface ChampionRelationship {
  id: string;
  champion1_id: string;
  champion2_id: string;
  type: 'family' | 'ally' | 'enemy' | 'romantic' | 'mentor' | 'rival' | 'shared_history';
  strength: 1 | 2 | 3;
  description: string;
  lore_source?: string;
  bidirectional: boolean;
}
```

### Key Interactions

1. Initial load shows all champions clustered by region
2. Click champion → Zoom and highlight connections
3. Hover edge → Show relationship description
4. Double-click → Navigate to champion wiki page
5. Filters → Toggle relationship types, filter by region
6. 3D controls → Orbit, zoom, pan

---

## Implementation Considerations

### Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| 200+ champions overwhelms graph | High | Region clustering, search, focus mode |
| Data curation time | Medium | Start with 50 popular champions |
| Performance degradation | Medium | LOD rendering, spatial partitioning |
| Poor mobile experience | Medium | Simplified 2D fallback on mobile |
| Maintenance burden | Low | Document curation process |

### Technical Dependencies

- Three.js / React Three Fiber (existing)
- @react-three/drei for helpers
- Force-directed layout algorithm (three-forcegraph or custom)
- Extended champion data with relationship fields

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Graph loads under 3s | Performance |
| 50+ relationships seeded | Content coverage |
| 5+ relationship types visualized | Feature completeness |
| Search finds champions <500ms | UX quality |
| No regression in Lighthouse score | Quality gate |

---

## Validation Criteria

- [ ] Graph renders all seeded champions as nodes
- [ ] Edges display with correct relationship colors
- [ ] Click interaction zooms to champion
- [ ] Hover shows relationship tooltip
- [ ] Region/type filters work correctly
- [ ] Navigation to wiki pages functions
- [ ] Mobile displays gracefully (fallback or simplified)
- [ ] Performance remains acceptable (60fps on mid-tier devices)

---

## Next Steps

1. Create detailed implementation plan with phased approach
2. Design data schema and seed initial relationships
3. Implement MVP graph visualization
4. Add interactions and filtering
5. Integrate with existing wiki pages
6. Polish and scale to full champion roster

---

## Decision Log

| Decision | Rationale | Date |
|----------|-----------|------|
| Use Three.js/R3F | Consistency with codebase, unique differentiation | 2026-03-22 |
| Manual data curation | Quality control, narrative accuracy | 2026-03-22 |
| Start with 50 champions | Manage scope, iterate based on feedback | 2026-03-22 |
| 3D visualization | Unique differentiator, existing expertise | 2026-03-22 |

---

*Report generated by Brainstorm Agent*
