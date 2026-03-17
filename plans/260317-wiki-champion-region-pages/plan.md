---
title: "Phase 2 — Wiki Champion & Region Pages"
description: "Build wiki pages for champions and regions: SSR routes, data fetching via server functions, navigation layout, and SEO."
status: pending
priority: P1
effort: "3–4 days"
branch: main
tags: [wiki, champions, regions, ssr, tanstack-start, drizzle]
created: 2026-03-17
---

# Phase 2 — Wiki Champion & Region Pages

## Goal

Implement the full wiki section: champion list + detail pages, region list + detail pages, shared wiki navigation layout, and per-route SSO.

## Phases

| # | Phase | Status | Progress | File |
|---|-------|--------|----------|------|
| 1 | Drizzle Relations & Server Functions | pending | 0% | [phase-01](phase-01-drizzle-relations-server-functions.md) |
| 2 | Layout & Navigation | pending | 0% | [phase-02](phase-02-layout-navigation.md) |
| 3 | Region Pages | pending | 0% | [phase-03](phase-03-region-pages.md) |
| 4 | Champion Pages | pending | 0% | [phase-04](phase-04-champion-pages.md) |
| 5 | Polish & Testing | pending | 0% | [phase-05](phase-05-polish-and-testing.md) |

## Key Dependencies

- Phase 1 must complete before Phases 3–4 (server functions required by route loaders)
- Phase 2 must complete before Phases 3–4 (layout route wraps wiki pages)
- Phase 5 depends on all prior phases

## Architecture Summary

```
src/
├── db/schema/drizzle-relations.ts   ← new (Phase 1)
├── server/
│   ├── regions.ts                   ← new (Phase 1)
│   ├── champions.ts                 ← new (Phase 1)
│   └── search.ts                    ← new (Phase 1)
├── routes/
│   ├── __root.tsx                   ← update: add component (Phase 1)
│   ├── _wiki.tsx                    ← new (Phase 2)
│   └── _wiki/
│       ├── regions.index.tsx        ← new (Phase 3)
│       ├── regions.$slug.tsx        ← new (Phase 3)
│       ├── champions.index.tsx      ← new (Phase 4)
│       └── champions.$slug.tsx      ← new (Phase 4)
└── components/wiki/                 ← all new (Phases 2–4)
```

## Notes

- Map page (`/`) stays outside `_wiki` layout — fullscreen, no nav bar
- All files must stay under 200 lines
- Use Cinzel for headings, EB Garamond for body
- Gold (#eab308) primary, cyan-400 accent, stone-950 background
