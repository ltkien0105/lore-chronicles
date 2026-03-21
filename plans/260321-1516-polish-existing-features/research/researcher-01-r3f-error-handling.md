# React Three Fiber Error Handling & Loading States Research

**Date:** 2026-03-21 | **Focus:** R3F error handling, loading states, WebGL support, touch controls

---

## 1. Error Boundaries for WebGL/Three.js Failures

### Implementation Pattern
- Use `use-error-boundary` hook to wrap Canvas component
- Catches WebGL context crashes from disabled GPUs/faulty drivers
- Display graceful error UI instead of blank/broken canvas

```jsx
import { useErrorBoundary } from 'use-error-boundary'

function App() {
  const { ErrorBoundary, didCatch, error } = useErrorBoundary()
  return didCatch ? (
    <div>WebGL Error: {error.message}</div>
  ) : (
    <ErrorBoundary>
      <Canvas>
        <mesh />
      </Canvas>
    </ErrorBoundary>
  )
}
```

---

## 2. Loading Indicators for 3D Scenes

### Suspense + Loader Pattern
- Wrap 3D components in `<Suspense>` boundary
- `useLoader()` hook integrates with React Suspense for fallback UI
- Supports pre-loading with `useLoader.preload()`
- Auto-caches assets by URL for reuse

```jsx
<Canvas>
  <Suspense fallback={<LoadingSpinner />}>
    <Model />
  </Suspense>
</Canvas>
```

### useLoader Features
- Load GLTF with DRACOLoader compression support
- Load multiple textures simultaneously
- Custom loader configurations per asset type

---

## 3. Fallback UI for WebGL Not Supported

### Canvas Fallback Prop
- R3F Canvas accepts `fallback` prop for unsupported browsers
- Provides graceful degradation when WebGL unavailable

```jsx
<Canvas fallback={<div>Sorry, WebGL not supported!</div>}>
  <mesh />
</Canvas>
```

### Best Practice
- Combine with Canvas `onCreated` callback for initialization checks
- Use `dpr={[1, 2]}` for device pixel ratio optimization

---

## 4. Touch Controls for Mobile

### Event Handling Strategy
- Use `pointermove`, `touchstart`, `touchmove`, `touchend` listeners
- Prevent default browser behaviors (scrolling, zooming) with `{ passive: false }`
- Convert touch coordinates to normalized device coordinates (-1 to 1)

```javascript
renderer.domElement.addEventListener('touchstart', (e) => e.preventDefault(), { passive: false });
renderer.domElement.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });
renderer.domElement.addEventListener('touchend', (e) => e.preventDefault(), { passive: false });
```

### Input Manager Pattern
- Track key/touch states with `down` and `justPressed` flags
- Map touch regions (left/right UI sections) for directional controls
- Clear states on pointer release

### R3F Integration
- Use `onPointerMissed` callback for empty space clicks
- R3F handles pointer events natively through Canvas
- Supports both mouse and touch via pointer API

---

## Key Takeaways

| Feature | Pattern | Notes |
|---------|---------|-------|
| **Error Handling** | useErrorBoundary + ErrorBoundary component | Catches context crashes gracefully |
| **Loading States** | Suspense + useLoader hook | Auto-caches, pre-load support |
| **WebGL Fallback** | Canvas `fallback` prop | Graceful degradation |
| **Touch Input** | pointermove/touchstart events | Prevent default with passive: false |
| **Mobile Optimization** | Normalized coordinates, state tracking | Convert screen→NDC coords |

---

## Implementation Priority

1. **Error Boundary** (highest) - Critical for crash prevention
2. **Suspense + Loaders** - Required for good UX
3. **WebGL Fallback** - Ensures accessibility
4. **Touch Controls** - Mobile support enhancement
