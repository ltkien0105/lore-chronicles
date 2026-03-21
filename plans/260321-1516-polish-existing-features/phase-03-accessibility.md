---
parent: plan.md
phase: 3
status: pending
priority: P1
effort: 4h
---

# Phase 3 — Accessibility Improvements

## Context Links
- Parent: [plan.md](./plan.md)
- Can run parallel with Phase 2
- Related: `src/components/wiki/*`, `src/routes/_wiki/*`

## Overview

**Priority:** P1 (High)
**Status:** pending
**Description:** Add ARIA labels, keyboard navigation, and focus management

## Key Insights

<!-- Updated: Validation Session 1 - Scope limited to essential items (labels, skip-link, announcer) -->

From code analysis:
- Select dropdowns in `champion-filter-bar.tsx` use native `<select>` — good baseline
- Search inputs have `placeholder` but no explicit `aria-label`
- Mobile menu button has `aria-label` — good
- Pagination has `aria-label="Pagination"` on nav — good
- No skip-to-content link exists
- Route transitions don't announce to screen readers

**Validated scope:** Essential items only
- ARIA labels for inputs/selects
- Skip-to-content link
- Route announcer
- Defer: keyboard shortcuts, full WCAG audit

## Requirements

### Functional
- All interactive elements have ARIA labels
- Keyboard navigation works for all controls
- Skip-to-content link on wiki pages
- Route changes announce to screen readers

### Non-Functional
- WCAG 2.1 AA compliance
- No visual changes to existing UI
- Must work with common screen readers (NVDA, VoiceOver)

## Architecture

```
src/
├── components/
│   ├── skip-link.tsx             ← new: skip to main content
│   ├── route-announcer.tsx       ← new: announce route changes
│   └── wiki/
│       ├── champion-filter-bar.tsx ← add aria-labels
│       └── wiki-header.tsx         ← add skip link target
└── routes/
    ├── __root.tsx                ← add RouteAnnouncer
    └── _wiki.tsx                 ← add skip link
```

### Route Announcement Strategy

TanStack Router doesn't have built-in announcements. Use:
```tsx
// RouteAnnouncer component
function RouteAnnouncer() {
  const location = useLocation();
  const [announcement, setAnnouncement] = useState('');

  useEffect(() => {
    // Extract page title from meta or generate from path
    const title = document.title || location.pathname;
    setAnnouncement(`Navigated to ${title}`);
  }, [location.pathname]);

  return (
    <div role="status" aria-live="polite" className="sr-only">
      {announcement}
    </div>
  );
}
```

## Related Code Files

### Modify
- `src/components/wiki/champion-filter-bar.tsx` — add aria-labels to selects
- `src/components/wiki/wiki-header.tsx` — add id for skip link target
- `src/routes/__root.tsx` — add RouteAnnouncer
- `src/routes/_wiki.tsx` — add SkipLink component
- `src/routes/_wiki/search.tsx` — add label association to search input

### Create
- `src/components/skip-link.tsx` — skip to main content
- `src/components/route-announcer.tsx` — announce route changes

## Implementation Steps

1. Create `src/components/skip-link.tsx`
   - Visually hidden, visible on focus
   - Links to `#main-content`
   - Styled to match theme when visible

2. Create `src/components/route-announcer.tsx`
   - Listen to location changes
   - Announce page title to screen readers
   - Use `aria-live="polite"`

3. Update `src/routes/__root.tsx`
   - Add RouteAnnouncer to RootShell

4. Update `src/routes/_wiki.tsx`
   - Add SkipLink before header
   - Add `id="main-content"` to main element

5. Update `src/components/wiki/champion-filter-bar.tsx`
   - Add `aria-label` to search input
   - Add `aria-label` to region select
   - Add `aria-label` to role select
   - Add `id` attributes for label association

6. Update `src/components/wiki/wiki-header.tsx`
   - Add `aria-label` to search input
   - Ensure mobile menu has proper ARIA

7. Update `src/routes/_wiki/search.tsx`
   - Add proper label for search input
   - Consider `aria-describedby` for results count

8. Test with screen reader:
   - Tab through all controls
   - Verify announcements on route change
   - Test skip link functionality

## Todo List

- [ ] Create skip-link component
- [ ] Create route-announcer component
- [ ] Add RouteAnnouncer to root
- [ ] Add SkipLink to wiki layout
- [ ] Add aria-labels to filter selects
- [ ] Add aria-labels to search inputs
- [ ] Test with keyboard only
- [ ] Test with screen reader

## Success Criteria

- [ ] Skip link visible on focus, skips to main content
- [ ] Route changes announced to screen readers
- [ ] All inputs have accessible names
- [ ] All selects have accessible names
- [ ] Tab order is logical
- [ ] Focus visible on all interactive elements

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Announcements too verbose | Annoying UX | Keep messages concise |
| Skip link styling conflict | Visual glitch | Use sr-only with :focus override |
| Missing ARIA on dynamic content | Incomplete | Audit all components |

## Security Considerations

- No security implications
- All changes are presentational/accessibility

## Next Steps

After completion:
- Phase 4: Performance and code quality
- Consider adding keyboard shortcuts (e.g., / for search)
