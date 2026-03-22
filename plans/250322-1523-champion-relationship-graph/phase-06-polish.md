# Phase 6: Polish

## Context Links
- [Plan Overview](./plan.md)
- [Phase 5: Integration](./phase-05-integration.md)
- [3D Graph UX Patterns Research](./research/researcher-02-3d-graph-ux-patterns.md)
- [Brainstorm Report](./reports/brainstorm-report.md)

## Overview

| Field | Value |
|-------|-------|
| Priority | P2 - Polish |
| Status | Pending |
| Effort | 2h |
| Dependencies | Phase 5 complete |

Performance optimization, mobile fallback/simplification, accessibility improvements, and final quality checks.

## Key Insights

From research:
- Mobile: disable force simulation, use precomputed layouts
- Mobile: use PointsMaterial instead of meshes
- LOD: reduce edge resolution at distance
- Frustum culling: don't render off-screen nodes
- Accessibility: keyboard navigation, screen reader announcements

## Requirements

### Functional
- FR1: Mobile displays simplified 2D view or graceful degradation
- FR2: Keyboard navigation (Tab between nodes, Enter to select)
- FR3: Screen reader announces selected champion
- FR4: Loading states for all async operations
- FR5: Error boundaries catch rendering failures

### Non-Functional
- NFR1: 60fps on desktop with 100 nodes
- NFR2: 30fps on mobile with 50 nodes
- NFR3: No Lighthouse regression (>90 performance)
- NFR4: WCAG 2.1 AA compliance for controls

## Architecture

### Performance Optimizations

```
┌─────────────────────────────────────────────────────────────┐
│                 Performance Strategy                         │
├─────────────────────────────────────────────────────────────┤
│ 1. Instanced Rendering                                      │
│    - Use InstancedMesh for nodes with same geometry         │
│    - Batch edge line segments                               │
│                                                             │
│ 2. LOD (Level of Detail)                                    │
│    - Far: sprites only, no labels                           │
│    - Medium: sprites + labels                               │
│    - Close: detailed meshes + full UI                       │
│                                                             │
│ 3. Frustum Culling                                          │
│    - Skip rendering nodes outside camera view               │
│    - useFrame check against camera frustum                  │
│                                                             │
│ 4. Mobile Optimizations                                     │
│    - Detect via user agent or matchMedia                    │
│    - Precomputed layout (no live physics)                   │
│    - Reduced node count (show 1-hop only)                   │
│    - PointsMaterial for nodes                               │
└─────────────────────────────────────────────────────────────┘
```

### Accessibility Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                 Accessibility Features                       │
├─────────────────────────────────────────────────────────────┤
│ Keyboard Navigation                                         │
│ - Tab: cycle through nodes (focus ring)                     │
│ - Enter/Space: select focused node                          │
│ - Escape: clear selection                                   │
│ - Arrow keys: pan camera                                    │
│                                                             │
│ Screen Reader                                               │
│ - aria-live region announces selections                     │
│ - Node count announced on load                              │
│ - Relationship descriptions read on hover                   │
│                                                             │
│ Visual                                                      │
│ - Focus indicators on interactive elements                  │
│ - Sufficient color contrast for edges                       │
│ - Text alternatives for color coding (patterns/shapes)      │
└─────────────────────────────────────────────────────────────┘
```

## Related Code Files

### Files to Create
- `src/components/graph/graph-mobile-fallback.tsx` — Simplified mobile view
- `src/components/graph/use-device-detection.ts` — Mobile/desktop detection
- `src/components/graph/graph-accessibility.tsx` — A11y wrapper

### Files to Modify
- `src/components/graph/relationship-graph-canvas.tsx` — Add mobile detection
- `src/components/graph/graph-scene.tsx` — Add LOD, frustum culling
- `src/components/graph/graph-node.tsx` — Add keyboard focus
- `src/components/graph/graph-filter-panel.tsx` — Add aria labels

## Implementation Steps

### Step 1: Device Detection (20min)
Create `src/components/graph/use-device-detection.ts`:
```typescript
export function useDeviceDetection() {
  const [isMobile, setIsMobile] = useState(false);
  const [isLowPerfDevice, setIsLowPerfDevice] = useState(false);

  useEffect(() => {
    // Check screen size
    const mql = window.matchMedia("(max-width: 768px)");
    setIsMobile(mql.matches);

    // Check for low performance indicators
    const hasLowMemory = (navigator as any).deviceMemory < 4;
    const hasSlowCPU = navigator.hardwareConcurrency < 4;
    setIsLowPerfDevice(hasLowMemory || hasSlowCPU);

    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  return { isMobile, isLowPerfDevice, shouldSimplify: isMobile || isLowPerfDevice };
}
```

### Step 2: Mobile Fallback (45min)
Create `src/components/graph/graph-mobile-fallback.tsx`:
- Simplified 2D list view or basic force graph
- Touch-friendly large tap targets
- Reduced visual complexity
- Same data, different presentation

```typescript
export function GraphMobileFallback({ data, onSelectNode }: Props) {
  return (
    <div className="h-full overflow-auto p-4">
      <p className="text-sm text-muted-foreground mb-4">
        Showing simplified view. Rotate device for full 3D experience.
      </p>
      <div className="grid grid-cols-2 gap-3">
        {data.nodes.map(node => (
          <button
            key={node.id}
            onClick={() => onSelectNode(node.id)}
            className="flex items-center gap-2 p-3 rounded-lg bg-stone-800 hover:bg-stone-700"
          >
            <img
              src={node.avatarUrl}
              alt=""
              className="w-10 h-10 rounded-full"
            />
            <div className="text-left">
              <p className="text-sm font-medium">{node.name}</p>
              <p className="text-xs text-muted-foreground">
                {getRelationshipCount(node.id, data.edges)} connections
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
```

### Step 3: Performance Optimizations (30min)
Modify `src/components/graph/graph-scene.tsx`:
```typescript
// Frustum culling
const frustum = useMemo(() => new THREE.Frustum(), []);
const matrix = useMemo(() => new THREE.Matrix4(), []);

useFrame(({ camera }) => {
  frustum.setFromProjectionMatrix(
    matrix.multiplyMatrices(
      camera.projectionMatrix,
      camera.matrixWorldInverse
    )
  );
});

// Only render visible nodes
const visibleNodes = useMemo(() => {
  return nodes.filter(node =>
    frustum.containsPoint(new THREE.Vector3(...node.position))
  );
}, [nodes, frustum]);
```

### Step 4: Accessibility (30min)
Create `src/components/graph/graph-accessibility.tsx`:
```typescript
export function GraphAccessibility({
  selectedNode,
  nodeCount,
}: {
  selectedNode: Node | null;
  nodeCount: number;
}) {
  return (
    <>
      {/* Screen reader announcements */}
      <div aria-live="polite" className="sr-only">
        {selectedNode
          ? `Selected ${selectedNode.name}. ${getRelationshipSummary(selectedNode)}`
          : `Relationship graph loaded with ${nodeCount} champions.`
        }
      </div>

      {/* Skip link */}
      <a
        href="#graph-controls"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-2 focus:bg-stone-900"
      >
        Skip to graph controls
      </a>
    </>
  );
}
```

Update filter panel with aria labels:
```typescript
<fieldset>
  <legend className="sr-only">Filter by relationship type</legend>
  {/* toggles */}
</fieldset>
```

### Step 5: Keyboard Navigation (20min)
Add to graph-scene.tsx:
```typescript
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    switch (e.key) {
      case "Tab":
        // Cycle through nodes
        e.preventDefault();
        const nextIndex = (focusedIndex + (e.shiftKey ? -1 : 1)) % nodes.length;
        setFocusedNodeId(nodes[nextIndex].id);
        break;
      case "Enter":
      case " ":
        if (focusedNodeId) {
          setSelectedNodeId(focusedNodeId);
        }
        break;
      case "Escape":
        setSelectedNodeId(null);
        break;
    }
  };

  window.addEventListener("keydown", handleKeyDown);
  return () => window.removeEventListener("keydown", handleKeyDown);
}, [focusedIndex, nodes]);
```

### Step 6: Final Quality Checks (15min)
- Run Lighthouse audit
- Test on mobile device
- Test with screen reader
- Verify no console errors
- Check bundle size increase

## Todo List

- [ ] Create use-device-detection.ts hook
- [ ] Implement mobile/low-perf detection
- [ ] Create graph-mobile-fallback.tsx component
- [ ] Implement simplified mobile view
- [ ] Add conditional rendering in canvas
- [ ] Implement frustum culling in graph-scene
- [ ] Implement LOD switching based on zoom
- [ ] Create graph-accessibility.tsx component
- [ ] Add aria-live announcements
- [ ] Add skip link for keyboard users
- [ ] Add keyboard navigation (Tab/Enter/Escape)
- [ ] Add aria-labels to filter controls
- [ ] Add focus indicators to nodes
- [ ] Test with VoiceOver/NVDA
- [ ] Run Lighthouse audit
- [ ] Verify 60fps on desktop
- [ ] Verify 30fps on mobile
- [ ] Check bundle size <50KB increase
- [ ] Fix any console errors/warnings

## Success Criteria

- [ ] Mobile shows simplified or fallback view
- [ ] Keyboard Tab cycles through nodes
- [ ] Enter selects focused node
- [ ] Escape clears selection
- [ ] Screen reader announces selections
- [ ] Lighthouse performance >90
- [ ] No Lighthouse accessibility errors
- [ ] 60fps on desktop (100 nodes)
- [ ] 30fps on mobile (50 nodes)
- [ ] Bundle size increase <50KB

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Mobile fallback UX poor | Medium | Medium | User test, iterate design |
| Keyboard nav conflicts | Low | Low | Check existing shortcuts |
| Lighthouse regression | Low | High | Test incrementally |
| Bundle bloat | Medium | Medium | Analyze with vite-bundle-analyzer |

## Security Considerations

- No additional security concerns in polish phase
- Maintain existing sanitization

## Code Patterns

### Conditional 3D/2D Rendering
```typescript
export function RelationshipGraphCanvas({ data, regions, focusSlug }: Props) {
  const { shouldSimplify } = useDeviceDetection();

  if (shouldSimplify) {
    return (
      <GraphMobileFallback
        data={data}
        onSelectNode={handleSelectNode}
      />
    );
  }

  return (
    <Canvas camera={{ position: GRAPH_CONFIG.cameraPosition }}>
      {/* Full 3D graph */}
    </Canvas>
  );
}
```

### LOD Based on Camera Distance
```typescript
function GraphNode({ node, cameraDistance }: NodeProps) {
  const lod = useMemo(() => {
    if (cameraDistance > 200) return "far";
    if (cameraDistance > 100) return "medium";
    return "close";
  }, [cameraDistance]);

  return (
    <>
      <sprite>
        <spriteMaterial map={texture} />
      </sprite>
      {lod !== "far" && (
        <Html center occlude>
          <span className="text-xs">{node.name}</span>
        </Html>
      )}
    </>
  );
}
```

## Checklist Before Completion

- [ ] All phases complete and tested
- [ ] No TypeScript errors
- [ ] No ESLint warnings
- [ ] All tests pass
- [ ] Documentation updated
- [ ] Commit with clean history
- [ ] Ready for code review

## Final Deliverables

1. `/relationships` route with 3D graph
2. Navigation link in header
3. Deep linking support
4. 50+ seeded relationships
5. Filter controls (type, region, search)
6. Click/hover/double-click interactions
7. Mobile fallback
8. Accessibility features
9. Performance optimized

## Post-Launch Considerations

- Monitor performance in production (Sentry/Analytics)
- Gather user feedback on graph usability
- Plan Phase 2 enhancements:
  - Scale to 200+ champions
  - Add relationship creation UI (admin)
  - NLP extraction from lore text
  - Time-based relationship evolution
