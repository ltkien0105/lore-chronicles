# Phase 2: Basic Graph Visualization

## Context Links
- [Plan Overview](./plan.md)
- [Phase 1: Data Foundation](./phase-01-data-foundation.md)
- [Force Graph Libraries Research](./research/researcher-01-force-graph-libraries.md)
- [3D Graph UX Patterns Research](./research/researcher-02-3d-graph-ux-patterns.md)
- Existing R3F patterns: `src/components/MapCanvas.tsx`, `src/components/regions/RegionIcon.tsx`

## Overview

| Field | Value |
|-------|-------|
| Priority | P0 - Core Feature |
| Status | Pending |
| Effort | 5h |
| Dependencies | Phase 1 complete |

Build R3F canvas with force-directed layout rendering champion nodes as sprites and relationships as curved edges. Follow existing MapCanvas/RegionIcon patterns.

## Key Insights

From research reports:
- **three-forcegraph** recommended for best R3F integration (60fps with 50-200 nodes)
- Sprites for nodes (billboards, lowest overhead, always face camera)
- CatmullRomCurve3 for curved edges (smooth visual flow)
- HTML overlays via `<Html>` for labels (crisp text)
- Instanced geometry for performance with many nodes

## Requirements

### Functional
- FR1: Render champions as sprite nodes with avatars
- FR2: Render relationships as color-coded curved edges
- FR3: Apply force-directed layout for natural positioning
- FR4: Display champion initials as fallback when no avatar

### Non-Functional
- NFR1: 60fps on mid-tier devices (50-100 nodes)
- NFR2: Initial layout settles within 2 seconds
- NFR3: Bundle size increase <50KB

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                RelationshipGraphCanvas                       │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  <Canvas>                                             │  │
│  │    <Suspense>                                         │  │
│  │      <ambientLight />                                 │  │
│  │      <ForceGraph3D>         ← three-forcegraph        │  │
│  │        <GraphNode />        ← Champion sprite nodes   │  │
│  │        <GraphEdge />        ← Relationship curves     │  │
│  │      </ForceGraph3D>                                  │  │
│  │      <OrbitControls />      ← Camera controls         │  │
│  │    </Suspense>                                        │  │
│  │  </Canvas>                                            │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Component Hierarchy

```
RelationshipGraphCanvas
├── GraphScene (R3F scene setup)
│   ├── GraphNodes (instanced sprites)
│   │   └── GraphNode (individual champion)
│   ├── GraphEdges (curved lines)
│   │   └── GraphEdge (individual relationship)
│   └── GraphControls (OrbitControls wrapper)
└── GraphLoadingState (Suspense fallback)
```

### Force Layout Data Flow

```
getGraphData() → ForceGraph3D → node positions → GraphNode sprites
                              → link positions → GraphEdge curves
```

## Related Code Files

### Files to Create
- `src/components/graph/relationship-graph-canvas.tsx` — Main canvas wrapper
- `src/components/graph/graph-scene.tsx` — R3F scene with force graph
- `src/components/graph/graph-node.tsx` — Champion node sprite
- `src/components/graph/graph-edge.tsx` — Relationship edge curve
- `src/components/graph/graph-controls.tsx` — OrbitControls wrapper
- `src/components/graph/graph-loading-state.tsx` — Loading fallback
- `src/components/graph/index.ts` — Barrel exports
- `src/lib/graph-constants.ts` — Colors, sizes, physics config

### Reference Files
- `src/components/MapCanvas.tsx` — Canvas setup pattern
- `src/components/regions/RegionIcon.tsx` — Sprite + hover pattern

## Implementation Steps

### Step 1: Install Dependencies (15min)
```bash
pnpm add three-forcegraph
```
<!-- Updated: Validation Session 1 - Add compatibility verification -->
**Important:** After installation, verify three-forcegraph works with R3F v9.5+ and Three.js 0.182:
- Check package peer dependencies
- Run minimal test render with 5 nodes
- If incompatible, fallback to custom R3F + ngraph.forcelayout approach

### Step 2: Graph Constants (30min)
Create `src/lib/graph-constants.ts`:
```typescript
export const RELATIONSHIP_COLORS = {
  family: "#3B82F6",
  ally: "#22C55E",
  enemy: "#EF4444",
  romantic: "#EC4899",
  mentor: "#EAB308",
  rival: "#F97316",
  shared_history: "#6B7280",
} as const;

export const GRAPH_CONFIG = {
  nodeSize: 1.5,
  nodeHoverScale: 1.3,
  edgeWidth: 0.1,
  forceStrength: -100,
  linkDistance: 30,
  cameraPosition: [0, 0, 150],
  orbitDamping: 0.1,
  zoomMin: 30,
  zoomMax: 300,
} as const;
```

### Step 3: Canvas Wrapper (45min)
Create `src/components/graph/relationship-graph-canvas.tsx`:
- Follow MapCanvas pattern
- Canvas setup with camera, lights
- Suspense boundary with loading state
- Accept `data: GraphData` prop

### Step 4: Graph Scene (1h)
Create `src/components/graph/graph-scene.tsx`:
- Initialize three-forcegraph
- Configure force simulation (strength, distance)
- Map nodes → GraphNode components
- Map edges → GraphEdge components
- Handle layout stabilization

### Step 5: Graph Node (1h)
Create `src/components/graph/graph-node.tsx`:
- Sprite with champion avatar texture
- Fallback to canvas-rendered initials
- Scale based on relationship count (more connected = larger)
- Follow RegionIcon pointer event pattern
- Expose position for edge connections

### Step 6: Graph Edge (45min)
Create `src/components/graph/graph-edge.tsx`:
- CatmullRomCurve3 for smooth curves
- Color based on relationship type
- Line width based on strength (1-3)
- Use BufferGeometry for performance

### Step 7: Controls (30min)
Create `src/components/graph/graph-controls.tsx`:
- OrbitControls with damping
- Zoom limits (30-300 units)
- Disable pan on mobile
- Auto-rotate toggle (disabled by default)

### Step 8: Integration Test (30min)
- Render with sample data
- Verify nodes render with avatars
- Verify edges connect correctly
- Check force layout stabilizes
- Profile performance (target 60fps)

## Todo List

- [ ] Install three-forcegraph dependency
- [ ] Create `src/lib/graph-constants.ts` with colors and config
- [ ] Create `src/components/graph/` directory
- [ ] Implement relationship-graph-canvas.tsx (Canvas wrapper)
- [ ] Implement graph-scene.tsx (force graph initialization)
- [ ] Implement graph-node.tsx (champion sprite)
- [ ] Implement avatar texture loading with fallback
- [ ] Implement initials fallback rendering
- [ ] Implement graph-edge.tsx (curved edges)
- [ ] Implement color coding by relationship type
- [ ] Implement edge width by strength
- [ ] Implement graph-controls.tsx (OrbitControls)
- [ ] Create barrel export index.ts
- [ ] Test with mock data (10 nodes, 15 edges)
- [ ] Verify 60fps performance
- [ ] Verify force layout stabilizes <2s

## Success Criteria

- [ ] Canvas renders without errors
- [ ] Nodes display champion avatars or initials
- [ ] Edges colored correctly by relationship type
- [ ] Force layout positions nodes naturally
- [ ] OrbitControls allow rotate/zoom/pan
- [ ] 60fps maintained with 50 nodes
- [ ] Layout stabilizes within 2 seconds
- [ ] No console errors or warnings

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| three-forcegraph R3F conflicts | Low | High | Test early, fallback to custom impl |
| Avatar texture loading slow | Medium | Medium | Use placeholder, lazy load |
| Force layout never stabilizes | Low | Medium | Set iteration limit, reduce forces |
| Too many re-renders | Medium | Medium | useMemo positions, React.memo nodes |

## Security Considerations

- Avatar URLs from Data Dragon CDN (trusted source)
- No user-generated content in graph
- Node positions computed client-side (no server state)

## Code Patterns

### Avatar Texture with Fallback
```typescript
function useChampionTexture(avatarUrl: string | null, name: string) {
  const [texture, setTexture] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    if (avatarUrl) {
      new THREE.TextureLoader().load(
        avatarUrl,
        setTexture,
        undefined,
        () => setTexture(createInitialsTexture(name))
      );
    } else {
      setTexture(createInitialsTexture(name));
    }
  }, [avatarUrl, name]);

  return texture;
}
```

### Edge Curve
```typescript
function GraphEdge({ source, target, type, strength }: EdgeProps) {
  const curve = useMemo(() => {
    const mid = new THREE.Vector3()
      .addVectors(source, target)
      .multiplyScalar(0.5);
    mid.y += 5; // Curve upward
    return new THREE.CatmullRomCurve3([source, mid, target]);
  }, [source, target]);

  return (
    <line>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={curve.getPoints(20).flatMap(p => [p.x, p.y, p.z])}
          count={21}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial
        color={RELATIONSHIP_COLORS[type]}
        linewidth={strength}
      />
    </line>
  );
}
```

## Next Steps

After completion:
1. Proceed to [Phase 3: Interactions](./phase-03-interactions.md)
2. Add click, hover, zoom interactions
3. Connect to actual data from getGraphData()
