---
parent: plan.md
phase: 2
status: pending
priority: P0
effort: 3h
---

# Phase 2 — Map-to-Wiki Navigation

## Context Links
- Parent: [plan.md](./plan.md)
- Depends on: [phase-01-map-error-handling.md](./phase-01-map-error-handling.md)
- Related: `src/components/regions/RegionIcon.tsx`, `src/components/regions/region-config.ts`

## Overview

**Priority:** P0 (Critical)
**Status:** pending
**Description:** Add click handlers to region icons that navigate to wiki pages

## Key Insights

<!-- Updated: Validation Session 1 - Use pointer delta threshold (5px) for click detection -->

From code analysis:
- `RegionIcon.tsx` has `onPointerOver`/`onPointerOut` but no `onClick`
- Region config has `id` field matching wiki slugs (e.g., "demacia", "noxus")
- TanStack Router navigation available via `useNavigate()` hook
- R3F requires special handling for navigation (can't use hooks inside Canvas)

**Validated decisions:**
- Use pointer delta threshold (5px) to distinguish click from drag — simple and reliable

## Requirements

### Functional
- Click on region icon → navigate to `/regions/{slug}`
- Cursor should indicate clickability (already shows pointer)
- Navigation should work on both desktop and touch devices

### Non-Functional
- Navigation must not cause full page reload
- Click detection must be accurate on mobile
- Must not interfere with map pan/zoom

## Architecture

```
src/
└── components/
    └── regions/
        ├── RegionIcon.tsx        ← add onClick handler
        ├── RegionManager.tsx     ← pass navigation callback
        └── region-config.ts      ← add slug field if needed
```

### Navigation Strategy

Since `useNavigate()` can't be called inside R3F Canvas, we need to:
1. Accept a callback from outside Canvas
2. Call callback with region slug on click
3. Parent component handles actual navigation

```tsx
// In routes/index.tsx
const navigate = useNavigate();
const handleRegionClick = (slug: string) => {
  navigate({ to: '/regions/$slug', params: { slug } });
};

<MapCanvas onRegionClick={handleRegionClick} />
```

## Related Code Files

### Modify
- `src/components/regions/RegionIcon.tsx` — add onClick handler
- `src/components/regions/RegionManager.tsx` — accept and pass onRegionClick
- `src/components/TerrainTexture.tsx` — pass through onRegionClick
- `src/components/map-canvas.tsx` — accept onRegionClick prop
- `src/routes/index.tsx` — provide onRegionClick with navigation

### Possibly Modify
- `src/components/regions/region-config.ts` — verify slug matches wiki routes

## Implementation Steps

1. Verify region config slugs match wiki routes
   - Check `REGIONS` array in `region-config.ts`
   - Ensure each `id` matches database `slug`

2. Update `RegionIcon.tsx`
   - Add `onRegionClick?: (slug: string) => void` to props
   - Track pointer position on pointerdown, compare on pointerup
   - Only fire click if delta < 5px (validated threshold)
   - Add `onClick` handler calling `onRegionClick(region.id)`

3. Update `RegionManager.tsx`
   - Accept `onRegionClick` prop
   - Pass to each `RegionIcon` component

4. Update `TerrainTexture.tsx`
   - Accept `onRegionClick` prop
   - Pass to `RegionManager`

5. Update `map-canvas.tsx`
   - Accept `onRegionClick` prop
   - Pass to `TerrainTexture`

6. Update `routes/index.tsx`
   - Import `useNavigate`
   - Create `handleRegionClick` callback
   - Pass to `MapCanvas`

7. Test navigation:
   - Desktop: click each region
   - Mobile: tap each region
   - Verify pan/zoom still works

## Todo List

- [ ] Verify region slugs in config match DB
- [ ] Add onClick to RegionIcon
- [ ] Thread onRegionClick through component tree
- [ ] Add navigation callback in index.tsx
- [ ] Test all 13 regions navigate correctly
- [ ] Test mobile tap navigation
- [ ] Verify no interference with pan/zoom

## Success Criteria

- [ ] Clicking any region navigates to correct wiki page
- [ ] Navigation uses client-side routing (no reload)
- [ ] Map drag does not trigger navigation
- [ ] Mobile tap works correctly
- [ ] Cursor shows pointer on hover (already works)

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Click fires during pan | Frustrating UX | Track pointer delta, require threshold |
| Slug mismatch | 404 errors | Verify all slugs before implementation |
| Touch not detected | Mobile broken | Use onPointerDown/Up with delta check |

## Security Considerations

- Navigation params come from static config (not user input)
- No external URLs involved

## Next Steps

After completion:
- Phase 3: Add accessibility improvements
- Consider adding visual feedback on click (ripple effect)
