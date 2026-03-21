---
title: "Polish Existing Features"
description: "UX improvements, error handling, accessibility, and performance optimization for Phases 1-4"
status: in-progress
priority: P1
effort: 3-4 days
branch: main
tags: [polish, ux, accessibility, performance, error-handling]
created: 2026-03-21
---

# Polish Existing Features

## Goal

Improve quality, robustness, and accessibility of existing implementation before adding Phase 5 (Community Chronicles).

## Phases

| # | Phase | Status | Progress | File |
|---|-------|--------|----------|------|
| 1 | Map Error Handling & Loading States | completed | 100% | [phase-01](phase-01-map-error-handling.md) |
| 2 | Map-to-Wiki Navigation | pending | 0% | [phase-02-map-navigation.md](phase-02-map-navigation.md) |
| 3 | Accessibility Improvements | pending | 0% | [phase-03-accessibility.md](phase-03-accessibility.md) |
| 4 | Performance & Code Quality | pending | 0% | [phase-04-performance-quality.md](phase-04-performance-quality.md) |

## Key Issues Identified

### Critical (P0)
- **Map has no error boundary** — WebGL failures = blank screen
- **No loading indicator on map** — `Suspense fallback={null}` shows nothing
- **Region clicks have no navigation** — hover works but no click handler

### High (P1)
- **Missing ARIA labels** — select dropdowns, search inputs
- **No focus management** — route transitions don't announce
- **Server functions lack try/catch** — DB errors propagate unhandled

### Medium (P2)
- **Image loading states** — no blur placeholder or skeleton
- **Pagination hardcoded to `/champions`** — not reusable
- **Mobile touch controls** — MapControls needs touch config

## Architecture Changes

```
src/
├── components/
│   ├── map-canvas.tsx          ← update: add ErrorBoundary wrapper
│   ├── map-loading.tsx         ← new: loading spinner for map
│   ├── webgl-error-fallback.tsx ← new: fallback UI
│   └── regions/
│       └── RegionIcon.tsx      ← update: add onClick navigation
├── lib/
│   └── detect-webgl.ts         ← new: WebGL support detection
└── server/
    └── *.ts                    ← update: wrap in try/catch
```

## Dependencies

- Phase 2 depends on Phase 1 (error handling must exist before adding nav)
- Phase 3 can run parallel with Phase 2
- Phase 4 should run last (final cleanup)

## Research Reports

- [R3F Error Handling Patterns](./research/researcher-01-r3f-error-handling.md) — Error boundaries, loading states, WebGL fallback, touch controls
- [Accessibility Patterns](./research/researcher-02-accessibility-patterns.md) — Focus management, ARIA labels, keyboard navigation, loading announcements

## Scout Reports

- [Codebase Analysis](./scout/scout-01-codebase-analysis.md) — Detailed findings on existing implementation

## Success Metrics

- [ ] Map shows loading indicator while terrain loads
- [ ] WebGL failure shows friendly fallback with wiki link
- [ ] Region click navigates to `/regions/{slug}`
- [ ] All interactive elements have ARIA labels
- [ ] Server errors return structured error responses
- [ ] No console errors or warnings in production build

## Validation Log

### Session 1 — 2026-03-21
**Trigger:** Initial plan creation validation
**Questions asked:** 6

#### Questions & Answers

1. **[Architecture]** Phase 1 plans to wrap the map in an ErrorBoundary. Which approach should we use?
   - Options: Use react-error-boundary package (Recommended) | Write custom ErrorBoundary class | Minimal custom implementation
   - **Answer:** Use react-error-boundary package (Recommended)
   - **Rationale:** Well-tested package with reset/retry support reduces implementation risk

2. **[UX]** Phase 1 mentions adding a loading spinner with possible delay to prevent flash. Should we add a delay?
   - Options: Yes, add 200ms delay before showing spinner (Recommended) | No delay - show spinner immediately | Use CSS animation only
   - **Answer:** Yes, add 200ms delay before showing spinner (Recommended)
   - **Rationale:** Prevents jarring flash on fast loads while still providing feedback

3. **[Architecture]** Phase 2 needs to distinguish click from drag on map regions. How should we detect this?
   - Options: Pointer delta threshold (Recommended) | Time-based detection | Trust R3F onClick behavior
   - **Answer:** Pointer delta threshold (Recommended)
   - **Rationale:** Simple and reliable - any pointer movement > 5px cancels click

4. **[Scope]** Phase 3 covers accessibility. What's the scope for this polish pass?
   - Options: Essential items only (Recommended) | Include keyboard shortcuts | Full accessibility audit
   - **Answer:** Essential items only (Recommended)
   - **Rationale:** Focus on ARIA labels, skip-link, route announcer - defer advanced features

5. **[Architecture]** Phase 4 adds server-side error handling. How sophisticated should it be?
   - Options: Simple try/catch with console.error (Recommended) | Custom ServerError class with error codes | Full error middleware pattern
   - **Answer:** Simple try/catch with console.error (Recommended)
   - **Rationale:** Sufficient for current scale, avoids over-engineering

6. **[Architecture]** Phase 4 plans to make pagination route-agnostic. What approach?
   - Options: Add basePath prop to existing component (Recommended) | Create generic Pagination with render props | Skip pagination refactor
   - **Answer:** Add basePath prop to existing component (Recommended)
   - **Rationale:** Minimal code change, fixes the issue without over-abstraction

#### Confirmed Decisions
- ErrorBoundary: Use `react-error-boundary` package — proven, supports retry
- Loading: 200ms delay before spinner — prevents flash
- Click detection: Pointer delta > 5px — simple, reliable
- Accessibility: Essential items only — labels, skip-link, announcer
- Server errors: Simple try/catch — sufficient for scale
- Pagination: Add basePath prop — minimal change

#### Action Items
- [ ] Add `react-error-boundary` to dependencies in Phase 1
- [ ] Implement 200ms delay in loading spinner component
- [ ] Use pointer delta threshold (5px) for click vs drag in Phase 2
- [ ] Scope Phase 3 to essential accessibility only
- [ ] Simplify Phase 4 server error handling (remove ServerError class)
- [ ] Keep pagination refactor simple (basePath prop only)

#### Impact on Phases
- Phase 1: Use react-error-boundary package; add 200ms loading delay
- Phase 2: Implement pointer delta threshold (5px) for click detection
- Phase 3: Scope limited to essential items (labels, skip-link, announcer)
- Phase 4: Simplify to try/catch only, no custom error class
