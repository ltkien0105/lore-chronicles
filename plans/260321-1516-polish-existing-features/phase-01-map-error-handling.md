---
parent: plan.md
phase: 1
status: pending
priority: P0
effort: 4h
---

# Phase 1 — Map Error Handling & Loading States

## Context Links
- Parent: [plan.md](./plan.md)
- Related: `src/components/map-canvas.tsx`, `src/routes/index.tsx`

## Overview

**Priority:** P0 (Critical)
**Status:** pending
**Description:** Add error boundary, loading states, and WebGL detection to map component

## Key Insights

<!-- Updated: Validation Session 1 - Use react-error-boundary package; add 200ms loading delay -->

From code analysis:
- `map-canvas.tsx` uses `Suspense fallback={null}` — no visual feedback during load
- No error boundary exists — WebGL failures crash silently
- React Three Fiber throws if WebGL unavailable
- Terrain LOD loads 64 tiles progressively — needs loading indicator

**Validated decisions:**
- Use `react-error-boundary` package (not custom) — proven, supports retry/reset
- Add 200ms delay before showing loading spinner — prevents flash on fast loads

## Requirements

### Functional
- Show loading spinner while map initializes
- Detect WebGL support before rendering Canvas
- Display friendly fallback if WebGL unavailable
- Catch and display R3F render errors gracefully

### Non-Functional
- Loading indicator must not block main thread
- Fallback must still allow wiki navigation
- Error messages should be user-friendly (no stack traces)

## Architecture

```
src/
├── components/
│   ├── map-canvas.tsx           ← wrap in ErrorBoundary
│   ├── map-loading-spinner.tsx  ← new: loading UI
│   └── webgl-error-fallback.tsx ← new: error UI
├── lib/
│   └── detect-webgl.ts          ← new: WebGL check
└── routes/
    └── index.tsx                ← update Suspense fallback
```

### Error Boundary Strategy
```tsx
// Wrap Canvas in class-based ErrorBoundary
<MapErrorBoundary fallback={<WebGLErrorFallback />}>
  <Suspense fallback={<MapLoadingSpinner />}>
    <MapCanvas />
  </Suspense>
</MapErrorBoundary>
```

### WebGL Detection
```ts
export function isWebGLSupported(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return !!(canvas.getContext('webgl') || canvas.getContext('webgl2'));
  } catch {
    return false;
  }
}
```

## Related Code Files

### Modify
- `src/routes/index.tsx` — add ErrorBoundary, update Suspense fallback
- `src/components/map-canvas.tsx` — no changes needed (already lazy loaded)

### Create
- `src/components/map-loading-spinner.tsx` — animated loading indicator
- `src/components/webgl-error-fallback.tsx` — fallback UI with wiki links
- `src/lib/detect-webgl.ts` — WebGL support detection

## Implementation Steps

1. Create `src/lib/detect-webgl.ts`
   - Export `isWebGLSupported()` function
   - Export `getWebGLInfo()` for debugging

2. Create `src/components/map-loading-spinner.tsx`
   - Full-screen overlay with mystical theme
   - Animated gold spinner/loader
   - "Loading map..." text

3. Create `src/components/webgl-error-fallback.tsx`
   - Styled fallback matching theme
   - Clear error message
   - Links to Champions and Regions pages
   - "Your browser doesn't support 3D graphics" messaging

4. Update `src/routes/index.tsx`
   - Import ErrorBoundary from `react-error-boundary`
   - Check `isWebGLSupported()` before rendering
   - Wrap MapCanvas in ErrorBoundary with `onReset` handler
   - Use MapLoadingSpinner as Suspense fallback (with 200ms delay)

5. Test scenarios:
   - Normal load on WebGL-capable browser
   - Disable WebGL in browser settings
   - Simulate R3F render error

## Todo List

- [ ] Create `detect-webgl.ts` utility
- [ ] Create `map-loading-spinner.tsx` component
- [ ] Create `webgl-error-fallback.tsx` component
- [ ] Update `index.tsx` with ErrorBoundary + WebGL check
- [ ] Test WebGL disabled scenario
- [ ] Test slow network (loading state visible)
- [ ] Verify fallback links work

## Success Criteria

- [ ] Map shows loading spinner during initialization
- [ ] WebGL detection works before Canvas mount
- [ ] Fallback UI displays when WebGL unavailable
- [ ] Error boundary catches R3F errors
- [ ] Fallback provides navigation to wiki pages
- [ ] No console errors during normal operation

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| WebGL detection false negative | User sees blank | Test multiple browsers |
| ErrorBoundary not catching | Crash | Use proven react-error-boundary pkg |
| Loading spinner flash | Poor UX | Add 200ms delay before showing |

## Security Considerations

- No user input involved
- No data fetching in error states
- Fallback doesn't expose system info

## Next Steps

After completion:
- Phase 2: Add region click → wiki navigation
- Consider adding retry button in error fallback
