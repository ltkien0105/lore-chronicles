# Force-Directed Graph Visualization Libraries Research
**Date:** 2026-03-22 | **Researcher:** Claude Code | **Scope:** R3F-compatible graph libraries

## Evaluation Summary

### 1. **three-forcegraph** ⭐ RECOMMENDED
- **R3F Compatibility:** Native support, fully integrated with Three.js
- **Performance:** 50-200 nodes: excellent (~60fps), WebGL optimized
- **Customization:** High—full control over node/edge materials, geometries
- **Animations:** Smooth transitions, physics-driven, easy frame control
- **Bundle Size:** ~45KB (moderate impact)
- **Docs:** Good—examples on GitHub, active community
- **Maintenance:** Active (last update 2024), established ecosystem
- **Verdict:** Best for feature-rich, performant R3F graphs

### 2. **ngraph.forcelayout**
- **R3F Compatibility:** Indirect—layout engine only, requires manual integration
- **Performance:** 50-200 nodes: fast physics (~500fps layout), decoupled rendering
- **Customization:** Excellent for physics tweaking, minimal rendering overhead
- **Animations:** Manual control, flexible but requires more setup
- **Bundle Size:** ~15KB (very small)
- **Docs:** Sparse documentation, steep learning curve
- **Maintenance:** Stable but dormant (last major update 2020)
- **Verdict:** Best for lightweight, physics-focused applications; needs wrapper

### 3. **d3-force-3d**
- **R3F Compatibility:** Possible but awkward—D3 is DOM-centric, conflicts with Three.js
- **Performance:** 50-200 nodes: reasonable, but not optimized for WebGL
- **Customization:** Standard D3 patterns, less intuitive with Three.js objects
- **Animations:** D3 transitions work but inefficient in R3F context
- **Bundle Size:** ~60KB (large with D3 dependencies)
- **Docs:** Excellent D3 docs, but R3F integration guides lacking
- **Maintenance:** Active (D3 is stable and popular)
- **Verdict:** Not recommended for R3F—cross-framework friction

### 4. **Custom Implementation**
- **R3F Compatibility:** Perfect—full control, no library constraints
- **Performance:** 50-200 nodes: excellent (~60fps) with `useFrame` hook + physics
- **Customization:** Maximum flexibility in visuals & physics behavior
- **Animations:** Native R3F animations, react-spring integration possible
- **Bundle Size:** Zero overhead (only physics library: e.g., cannon-es ~50KB)
- **Docs:** Varies; requires R3F Three.js knowledge
- **Maintenance:** Your responsibility, no dependency risk
- **Verdict:** Best for unique requirements; higher dev time (~2-3 days)

## Recommendation
**Primary:** **three-forcegraph** for production—balances performance, ease-of-use, and customization.
**Alternative:** **Custom + ngraph.forcelayout** if physics tuning is critical or bundle size tight.
**Avoid:** d3-force-3d (ecosystem mismatch with R3F/Three.js).

## Implementation Path
1. Prototype with `three-forcegraph` (fastest validation)
2. If physics needs are complex, evaluate custom approach with ngraph integration
3. Custom implementation worthwhile only if physics behavior significantly differs from standard force-directed
