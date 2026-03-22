# 3D Network Graph UX & Rendering Patterns Research

## Node Rendering Strategy

**Recommended: Hybrid Approach**
- **Sprites (2D billboards)** for small/distant nodes — lowest overhead, always face camera
- **Simple 3D meshes** (icosahedra/octahedra) for medium importance nodes — better depth perception
- **HTML overlays via R3F `<Html>` component** for labels — crisp text, occluded by 3D geometry naturally
- **Avoid full 3D meshes for labels** — performance killer; use Canvas texture atlasing if needed

**Implementation:** Use `instancedBufferGeometry` for sprite batching. Dynamically switch to HTML labels on zoom-in via camera distance checks.

## Edge Rendering

**Best Practices:**
- **Straight lines** for dense graphs (< 50 nodes) — use `BufferGeometry` with line segments
- **Catmull-Rom curves** for sparse graphs — smooth visual flow without performance hit
- **Tubes (vs lines)** only if edges must show direction/thickness; adds 8-10x geometry cost
- **Edge bundling** for 100+ nodes — group parallel edges, reduces visual clutter dramatically

**Implementation:** Use Three.js `CatmullRomCurve3` for curved edges. Cache geometry; update only on force-directed iterations (not every frame).

## Interaction Patterns

**Core interactions:**
- **Click-to-select:** Toggle node outline (ambient occlusion shader) + highlight connected edges
- **Hover feedback:** Brighten node, fade non-adjacent nodes (0.3 opacity)
- **Double-click:** Auto-focus with smooth camera animation (0.8s), zoom to fit node + 1-hop neighbors
- **Multi-select:** Hold Shift, click multiple nodes; show aggregated stats panel
- **Drag-to-pan:** Disable force simulation on pointer down, resume on up

**Animation:** Use Framer Motion or TweenMax for camera transitions; 60fps target mandatory.

## Clustering & LOD Strategy

**Grouping approach:**
- **Category-based:** Color-code by faction/type; use instanced meshes per category
- **Spatial clustering:** Pre-compute on load; collapse distant clusters at zoom-out (< 5 screen pixels)
- **LOD tiers:**
  - LOD0: Full graph (500+ nodes) — sprites only
  - LOD1: Clustered view (50-100 visible nodes) — 3D meshes
  - LOD2: Focused view (5-15 nodes) — detailed meshes + edges visible

**R3F Implementation:** Use `useThree().camera` to monitor zoom level; conditionally render via state updates.

## Mobile Optimization

**Touch patterns:**
- **Two-finger pinch:** Camera zoom (consistent with web)
- **Single-finger drag:** Pan camera (not node drag)
- **Double-tap:** Focus node
- **Tap + hold:** Show node context menu

**Performance fallbacks:**
- Detect mobile via user agent; reduce edge count (show only 1-hop connections)
- Disable force simulation; use precomputed layouts
- Use PointsMaterial instead of meshes for nodes on mobile
- Throttle interaction handlers (50ms debounce minimum)

## Camera Controls (R3F + OrbitControls)

**Orbit implementation:**
- Smooth damping (0.05-0.1) for natural feel
- Auto-rotate disabled by default; opt-in via button
- **Zoom limits:** Min = 5 units (detail view), Max = 500 units (full graph overview)
- **Focal point:** Track selected node; auto-pan if node exits viewport

**Auto-focus logic:**
1. Calculate bounding box of selected node + neighbors
2. Fit camera to view all with 20% padding
3. Smooth animate camera.position + orbit controls target over 800ms
4. Preserve camera.up orientation (no spinning)

## Rendering Performance

**Critical optimizations:**
- Use `THREE.InstancedBufferGeometry` for repeated nodes/edges
- Implement frustum culling; don't render off-screen nodes
- Use WebGL level-of-detail: reduce edge resolution at distance
- Cache force simulation results; only update when graph changes
- Monitor `requestAnimationFrame` delta; pause simulation if FPS < 30

**Budget targets:**
- 300+ nodes: 60fps with LOD
- 1000+ nodes: 30fps (mobile fallback) or client-side clustering

## Recommended Tech Stack for R3F

- **Force layout:** `d3-force` or `force-graph` (precompute, don't simulate in render loop)
- **Curves:** Three.js `CatmullRomCurve3` + `TubeGeometry` (optional)
- **Labels:** R3F `<Html>` component with `occlude` prop for occlusion queries
- **Selection:** Raycaster + outline post-processing (Outlines effect from Drei)
- **Animation:** Framer Motion for camera tweens, `useSpring` for node positions

## Key Takeaway

**Sprite nodes + curved edges + HTML labels + smooth camera interaction = optimal UX**.
Defer 3D mesh rendering to high-zoom details. Use aggressive LOD culling for 100+ node graphs.
