# Phase 3: Interactions

## Context Links
- [Plan Overview](./plan.md)
- [Phase 2: Basic Graph Visualization](./phase-02-basic-graph-visualization.md)
- [3D Graph UX Patterns Research](./research/researcher-02-3d-graph-ux-patterns.md)
- Hover pattern: `src/components/regions/RegionIcon.tsx`

## Overview

| Field | Value |
|-------|-------|
| Priority | P1 - Core UX |
| Status | Pending |
| Effort | 4h |
| Dependencies | Phase 2 complete |

Implement click-to-focus, hover tooltips, double-click navigation, and smooth camera animations. Follow RegionIcon interaction patterns.

## Key Insights

From UX research:
- **Click-to-select**: Toggle node outline + highlight connected edges
- **Hover feedback**: Brighten node, fade non-adjacent nodes (0.3 opacity)
- **Double-click**: Auto-focus with smooth camera animation (0.8s) + navigate to wiki page
- **Drag-to-pan**: Standard orbit behavior
- Click-vs-drag detection: 5px threshold (RegionIcon pattern)

<!-- Updated: Validation Session 1 - Clarify double-click navigation + 1-hop focus -->
**Validated decisions:**
- Double-click navigates to champion wiki page (not single-click)
- Selection shows only 1-hop neighbors (hide non-connected nodes, not just dim)
- Single edge per bidirectional relationship (no double arrows)

## Requirements

### Functional
- FR1: Click node → highlight node and connected edges, **hide** non-connected nodes (1-hop focus)
- FR2: Hover node → show tooltip with champion name + relationship count
- FR3: Double-click node → **navigate to champion wiki page** (/champions/:slug)
- FR4: Hover edge → show relationship description tooltip
- FR5: Click empty space → clear selection, show all nodes

### Non-Functional
- NFR1: Camera animations complete in 800ms
- NFR2: Hover response <16ms (single frame)
- NFR3: No interaction jank during force simulation

## Architecture

### State Management

```typescript
interface GraphInteractionState {
  selectedNodeId: number | null;
  hoveredNodeId: number | null;
  hoveredEdgeId: number | null;
  highlightedEdges: Set<number>; // edges connected to selected node
  dimmedNodes: Set<number>;      // nodes not connected to selected
}
```

### Interaction Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    User Interactions                         │
├──────────────┬──────────────┬──────────────┬────────────────┤
│  Hover Node  │  Click Node  │ Double-Click │   Hover Edge   │
│      ↓       │      ↓       │      ↓       │       ↓        │
│  Show Name   │  Highlight   │  Zoom to Fit │ Show Relation  │
│  Tooltip     │  Connected   │  + 1-hop     │ Description    │
│  Brighten    │  Dim Others  │  Neighbors   │ Tooltip        │
└──────────────┴──────────────┴──────────────┴────────────────┘
```

### Camera Animation

```
Click Node → Calculate Bounding Box (node + neighbors)
           → Compute Camera Position (fit with 20% padding)
           → Animate camera.position (800ms easing)
           → Animate controls.target (center of bbox)
```

## Related Code Files

### Files to Modify
- `src/components/graph/graph-node.tsx` — Add hover/click handlers
- `src/components/graph/graph-edge.tsx` — Add hover handler, dim state
- `src/components/graph/graph-scene.tsx` — Add selection state, camera animation
- `src/components/graph/graph-controls.tsx` — Expose controls ref for animation

### Files to Create
- `src/components/graph/graph-tooltip.tsx` — Tooltip component
- `src/components/graph/use-graph-interactions.ts` — Interaction state hook
- `src/components/graph/use-camera-animation.ts` — Camera animation hook

### Reference Files
- `src/components/regions/RegionIcon.tsx` — Click-vs-drag pattern

## Implementation Steps

### Step 1: Interaction State Hook (45min)
Create `src/components/graph/use-graph-interactions.ts`:
```typescript
export function useGraphInteractions(edges: Edge[]) {
  const [selectedNodeId, setSelectedNodeId] = useState<number | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<number | null>(null);
  const [hoveredEdgeId, setHoveredEdgeId] = useState<number | null>(null);

  // Compute connected edges when selection changes
  const highlightedEdges = useMemo(() => {
    if (!selectedNodeId) return new Set<number>();
    return new Set(
      edges
        .filter(e => e.source === selectedNodeId || e.target === selectedNodeId)
        .map(e => e.id)
    );
  }, [selectedNodeId, edges]);

  // Compute dimmed nodes (not connected to selected)
  const dimmedNodes = useMemo(() => {
    if (!selectedNodeId) return new Set<number>();
    const connected = new Set<number>([selectedNodeId]);
    edges.forEach(e => {
      if (e.source === selectedNodeId) connected.add(e.target);
      if (e.target === selectedNodeId) connected.add(e.source);
    });
    return new Set(/* all nodes not in connected */);
  }, [selectedNodeId, edges]);

  return {
    selectedNodeId, setSelectedNodeId,
    hoveredNodeId, setHoveredNodeId,
    hoveredEdgeId, setHoveredEdgeId,
    highlightedEdges,
    dimmedNodes,
    clearSelection: () => setSelectedNodeId(null),
  };
}
```

### Step 2: Camera Animation Hook (45min)
Create `src/components/graph/use-camera-animation.ts`:
```typescript
export function useCameraAnimation(controlsRef: RefObject<OrbitControls>) {
  const { camera } = useThree();

  const focusOnNode = useCallback((
    nodePosition: Vector3,
    neighborPositions: Vector3[]
  ) => {
    // Calculate bounding box
    const bbox = new Box3();
    bbox.expandByPoint(nodePosition);
    neighborPositions.forEach(p => bbox.expandByPoint(p));

    // Add 20% padding
    const center = bbox.getCenter(new Vector3());
    const size = bbox.getSize(new Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const distance = maxDim * 1.2;

    // Animate camera position
    const targetPos = center.clone().add(new Vector3(0, 0, distance));

    // Use gsap or manual animation
    animateCamera(camera, targetPos, center, 800);
  }, [camera, controlsRef]);

  return { focusOnNode };
}
```

### Step 3: Tooltip Component (30min)
Create `src/components/graph/graph-tooltip.tsx`:
```typescript
interface TooltipProps {
  position: Vector3;
  content: {
    title: string;
    subtitle?: string;
  };
}

export function GraphTooltip({ position, content }: TooltipProps) {
  return (
    <Html position={position} center occlude>
      <div className="rounded-lg bg-stone-900/95 px-3 py-2 shadow-lg border border-primary/20">
        <p className="font-heading text-sm font-semibold text-primary">
          {content.title}
        </p>
        {content.subtitle && (
          <p className="text-xs text-muted-foreground">{content.subtitle}</p>
        )}
      </div>
    </Html>
  );
}
```

### Step 4: Update GraphNode (1h)
Modify `src/components/graph/graph-node.tsx`:
- Add `onHover`, `onClick`, `onDoubleClick` props
- Implement click-vs-drag detection (5px threshold)
- Apply dim/highlight visual states
- Change cursor on hover
- Show tooltip on hover

### Step 5: Update GraphEdge (30min)
Modify `src/components/graph/graph-edge.tsx`:
- Add `onHover` prop
- Apply dim state when not highlighted
- Show tooltip on hover with relationship description

### Step 6: Wire Up Scene (30min)
Modify `src/components/graph/graph-scene.tsx`:
- Use `useGraphInteractions` hook
- Pass interaction handlers to nodes/edges
- Handle background click to clear selection
- Integrate camera animation on double-click

### Step 7: Test Interactions (30min)
- Verify hover shows tooltip
- Verify click highlights connections
- Verify double-click zooms smoothly
- Verify click-drag doesn't trigger click
- Verify background click clears selection

## Todo List

- [ ] Create use-graph-interactions.ts hook
- [ ] Implement selectedNodeId state
- [ ] Implement highlightedEdges computation
- [ ] Implement dimmedNodes computation
- [ ] Create use-camera-animation.ts hook
- [ ] Implement focusOnNode with bounding box
- [ ] Implement smooth camera animation (800ms)
- [ ] Create graph-tooltip.tsx component
- [ ] Style tooltip with existing design system
- [ ] Update graph-node.tsx with hover handler
- [ ] Update graph-node.tsx with click handler
- [ ] Update graph-node.tsx with double-click handler
- [ ] Implement click-vs-drag detection (5px threshold)
- [ ] Apply dim opacity (0.3) to non-connected nodes
- [ ] Apply highlight glow to selected node
- [ ] Update graph-edge.tsx with hover handler
- [ ] Apply dim opacity to non-connected edges
- [ ] Wire interactions in graph-scene.tsx
- [ ] Handle background click to clear selection
- [ ] Test all interactions work correctly
- [ ] Verify no performance regression

## Success Criteria

- [ ] Hover node shows tooltip with name
- [ ] Click node highlights connected edges
- [ ] Click node dims non-connected nodes (0.3 opacity)
- [ ] Double-click zooms to node + neighbors
- [ ] Camera animation completes in ~800ms
- [ ] Click-drag orbit works without triggering click
- [ ] Background click clears selection
- [ ] Edge hover shows relationship description
- [ ] 60fps maintained during interactions

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Camera animation jank | Medium | Medium | Use requestAnimationFrame, optimize |
| Tooltip z-fighting | Low | Low | Use Html occlude prop |
| Click-drag false positives | Low | Medium | Tune 5px threshold |
| Too many state updates | Medium | Medium | Debounce hover, batch updates |

## Security Considerations

- No user input in tooltips (data from DB)
- Navigation double-click uses internal routing

## Code Patterns

### Click-vs-Drag Detection (from RegionIcon)
```typescript
const DRAG_THRESHOLD_PX = 5;
const pointerStartRef = useRef<{ x: number; y: number } | null>(null);

const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
  e.stopPropagation();
  pointerStartRef.current = { x: e.clientX, y: e.clientY };
};

const handlePointerUp = (e: ThreeEvent<PointerEvent>) => {
  e.stopPropagation();
  if (pointerStartRef.current) {
    const deltaX = Math.abs(e.clientX - pointerStartRef.current.x);
    const deltaY = Math.abs(e.clientY - pointerStartRef.current.y);
    const delta = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    if (delta < DRAG_THRESHOLD_PX) {
      onClick?.();
    }
  }
  pointerStartRef.current = null;
};
```

### Dim/Highlight Material
```typescript
const opacity = useMemo(() => {
  if (!selectedNodeId) return 1;
  if (isDimmed) return 0.3;
  return 1;
}, [selectedNodeId, isDimmed]);

<spriteMaterial
  map={texture}
  transparent
  opacity={opacity}
  depthWrite={false}
/>
```

## Next Steps

After completion:
1. Proceed to [Phase 4: Filtering & UI](./phase-04-filtering-and-ui.md)
2. Add filter controls, search, sidebar info panel
