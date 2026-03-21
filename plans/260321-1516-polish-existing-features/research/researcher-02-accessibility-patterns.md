# Accessibility Patterns for TanStack Router Apps

**Date:** 2026-03-21
**Scope:** Focus management, ARIA labels, keyboard navigation, loading announcements

---

## 1. Focus Management on Route Transitions

### Key Pattern
- Use `resetScroll: true` in `NavigateOptions` to reset viewport to top
- Implement focus restoration hook that stores focus position before navigation
- Move focus to main content area (`<main>` element) after route transition completes
- Use `useEffect` to manage focus programmatically during route changes

### Implementation
```tsx
// Focus management on route change
useEffect(() => {
  const mainContent = document.querySelector('main');
  if (mainContent) {
    mainContent.focus();
    mainContent.tabIndex = -1; // Allow programmatic focus
  }
}, [location]); // location changes on route transition
```

---

## 2. ARIA Labels for Interactive Filters/Search

### Critical Attributes
- **`aria-label`**: Provide descriptive labels for filter buttons/search input
- **`aria-expanded`**: Toggle filters (true/false) for accordion patterns
- **`aria-current="page"`**: Mark current page in navigation links
- **`aria-describedby`**: Link input to helper text or error messages

### Pattern
```tsx
<input
  type="search"
  aria-label="Search chronicles by title or author"
  aria-describedby="search-help"
/>
<span id="search-help">Type to filter results</span>

<button aria-label="Toggle filters" aria-expanded={showFilters}>
  Filters
</button>
```

---

## 3. Keyboard Navigation Patterns

### Essentials
- **Semantic HTML**: Use native `<button>`, `<a>`, `<input>` elements (inherit keyboard support)
- **Tab Order**: Maintain logical tab sequence; avoid tabindex > 0
- **Enter/Space**: Native elements handle; custom divs need `tabindex="0"` + keydown handlers
- **Escape Key**: Close modals, dropdowns on ESC

### TanStack Router Integration
- `<Link>` components render semantic `<a>` tags (keyboard accessible by default)
- Disabled links: use `disabled` prop instead of removing href
- Navigation doesn't require manual keyboard management with proper semantic HTML

---

## 4. Loading State Announcements

### ARIA Live Regions
- **`aria-live="polite"`**: Non-intrusive announcements (search results, filters applied)
- **`aria-live="assertive"`**: Urgent announcements (errors, critical updates)
- Paired with `role="status"` for implicit live region semantics

### Implementation
```tsx
<div aria-live="polite" aria-atomic="true" role="status" className="sr-only">
  {isLoading && "Loading search results..."}
  {loadingError && `Error: ${loadingError}`}
</div>

// For loading skeletons: announce when complete
useEffect(() => {
  if (!isLoading && data) {
    announceToScreenReader(`Loaded ${data.length} results`);
  }
}, [isLoading, data]);
```

---

## Key Takeaways

| Pattern | Priority | TanStack Router Support |
|---------|----------|------------------------|
| Focus management | HIGH | Manual via useEffect + NavigateOptions |
| ARIA labels | HIGH | All filter/search components |
| Keyboard navigation | HIGH | Native via semantic HTML + `<Link>` |
| Loading announcements | MEDIUM | ARIA live regions (manual setup) |

---

## References

- TanStack Router Docs: Navigation & Link Components
- WCAG 2.2: Focus Visible (C45), Keyboard Accessibility (SCR32, SCR29)
- WCAG 2.2: Live Regions (SCR14), ARIA Authoring Practices

**Next:** Implement focus management hook + audit filter ARIA labels in codebase.
