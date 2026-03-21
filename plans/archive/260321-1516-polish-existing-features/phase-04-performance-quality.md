---
parent: plan.md
phase: 4
status: completed
priority: P2
effort: 4h
completedDate: 2026-03-21
---

# Phase 4 — Performance & Code Quality

## Context Links
- Parent: [plan.md](./plan.md)
- Should run last (final cleanup)
- Related: `src/server/*.ts`, `src/components/wiki/*.tsx`

## Overview

**Priority:** P2 (Medium)
**Status:** completed
**Description:** Server error handling, pagination reusability, image loading states, code cleanup

## Key Insights

<!-- Updated: Validation Session 1 - Simplify to try/catch only, no custom error class; basePath prop for pagination -->

From code analysis:
- Server functions have no try/catch — DB errors propagate raw
- Pagination component hardcoded to `/champions` route
- ChampionCard has `onError` for images but no loading state
- SearchResultCard has image fallback but no loading skeleton
- Some `useEffect` missing dependency array warnings likely

**Validated decisions:**
- Server errors: Simple try/catch with console.error — sufficient for scale
- Pagination: Add basePath prop only — minimal change, no over-abstraction

## Requirements

### Functional
- Server errors return structured error responses
- Pagination works on any route (regions, search)
- Images show loading state before load
- No console warnings in production

### Non-Functional
- Error messages don't expose internal details
- Image loading doesn't cause layout shift
- Bundle size maintained or reduced

## Architecture

```
src/
├── server/
│   ├── champions.ts     ← wrap in try/catch
│   ├── regions.ts       ← wrap in try/catch
│   └── search.ts        ← wrap in try/catch
├── components/
│   └── wiki/
│       ├── pagination.tsx      ← make route-agnostic
│       ├── champion-card.tsx   ← add loading state
│       └── image-with-fallback.tsx ← new: reusable image
└── lib/
    └── server-error.ts  ← new: error utilities
```

### Server Error Pattern
```ts
// Simple try/catch pattern (validated - no custom error class needed)
export const getChampions = createServerFn({ method: "GET" })
  .handler(async ({ data }) => {
    try {
      // ... existing logic
    } catch (error) {
      console.error('getChampions error:', error);
      throw new Error('Failed to load champions');
    }
  });
```

### Reusable Pagination
```tsx
interface PaginationProps {
  total: number;
  pageSize: number;
  currentPage: number;
  basePath: string;  // e.g., "/champions" or "/regions"
  className?: string;
}
```

## Related Code Files

### Modify
- `src/server/champions.ts` — add try/catch
- `src/server/regions.ts` — add try/catch
- `src/server/search.ts` — add try/catch
- `src/components/wiki/pagination.tsx` — make route-agnostic
- `src/components/wiki/champion-card.tsx` — add image loading state
- `src/routes/_wiki/champions.index.tsx` — pass basePath to pagination
- `src/routes/_wiki/regions.index.tsx` — use pagination if needed

### Create
- `src/components/wiki/image-with-fallback.tsx` — reusable image component

*Note: `src/lib/server-error.ts` removed from scope — simple try/catch is sufficient*

## Implementation Steps

1. Update server functions with simple try/catch
   - `src/server/champions.ts` — wrap both functions
   - `src/server/regions.ts` — wrap both functions
   - `src/server/search.ts` — wrap searchAll
   - Use console.error + throw new Error (no custom class)

3. Create `src/components/wiki/image-with-fallback.tsx`
   - Accept src, alt, fallback props
   - Show skeleton during load
   - Handle error with fallback
   - Prevent layout shift with aspect ratio

4. Update `src/components/wiki/pagination.tsx`
   - Add `basePath` prop
   - Replace hardcoded `/champions` with prop
   - Maintain backward compatibility with default

5. Update `src/components/wiki/champion-card.tsx`
   - Use ImageWithFallback component
   - Or add inline loading state

6. Update route files
   - Pass basePath to Pagination where used
   - Consider adding pagination to regions if needed

7. Run lint and fix warnings
   - Check useEffect dependencies
   - Fix any TypeScript errors
   - Remove unused imports

8. Test error scenarios
   - Disconnect database
   - Verify error messages are user-friendly

## Todo List

- [ ] Wrap champions.ts in try/catch
- [ ] Wrap regions.ts in try/catch
- [ ] Wrap search.ts in try/catch
- [ ] Create image-with-fallback component
- [ ] Make pagination route-agnostic (add basePath prop)
- [ ] Update champion-card with loading state
- [ ] Run eslint and fix warnings
- [ ] Test error handling
- [ ] Verify no console warnings

## Success Criteria

- [ ] Server errors return structured responses
- [ ] DB connection failure shows friendly error
- [ ] Pagination works on any route
- [ ] Images show loading skeleton
- [ ] No console warnings in dev/prod
- [ ] No layout shift on image load

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Over-catching errors | Hide bugs | Only catch DB errors, rethrow others |
| Pagination breaking change | Routes break | Add default basePath value |
| Image skeleton flash | Poor UX | Add minimum display time |

## Security Considerations

- Server errors must not expose stack traces
- Error codes should be generic (not reveal DB schema)
- Logging should not include sensitive data

## Next Steps

After Phase 4 completion:
- All polish work complete
- Ready for Phase 5: Community Chronicles
- Consider running lighthouse audit
- Update project changelog
