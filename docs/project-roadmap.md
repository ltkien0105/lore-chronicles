# Project Roadmap

Lore Chronicles — The Mystical Library of Runeterra

## Overview

A League of Legends lore wiki with interactive map, champion database, and community features.

## Phases

### Phase 1: Foundation ✅ Complete
**Status:** Done | **Date:** 2026-03-15

- [x] TanStack Start setup with SSR
- [x] PostgreSQL + Drizzle ORM
- [x] Database schema (champions, regions, relations)
- [x] Interactive Runeterra map with region pins
- [x] Dark mystical theme

### Phase 2: Wiki Pages ✅ Complete
**Status:** Done | **Date:** 2026-03-20

- [x] Drizzle relations + server functions
- [x] Wiki layout with header, nav, breadcrumbs
- [x] Region list + detail pages
- [x] Champion list + detail pages (pagination, filters)
- [x] Search page (combined champion/region results)
- [x] Loading states, error boundaries, 404 page
- [x] Image fallbacks

### Phase 2.5: Map-to-Wiki Navigation ✅ Complete
**Status:** Done | **Date:** 2026-03-21

- [x] Region click handler with drag threshold
- [x] Callback threading (RegionIcon → RegionManager → MapCanvas → Router)
- [x] TanStack Router integration for region navigation
- [x] Seamless transitions from map to region detail pages

### Phase 3: User Features 🔜 Next
**Status:** Planned

- [ ] User authentication (Better Auth)
- [ ] User profiles
- [ ] Favorite champions/regions
- [ ] Reading lists
- [ ] Recently viewed

### Phase 4: Community Features
**Status:** Planned

- [ ] Comments on champions/regions
- [ ] User-submitted lore theories
- [ ] Upvoting/downvoting
- [ ] Moderation tools

### Phase 5: Advanced Features
**Status:** Planned

- [ ] Lore timeline visualization
- [ ] Champion relationship graph
- [ ] Story mode (guided lore reading)
- [ ] Mobile app (React Native)

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | TanStack Start (React 19) |
| Database | PostgreSQL + Drizzle ORM |
| Styling | Tailwind CSS + shadcn/ui |
| Auth | Better Auth (planned) |
| Hosting | Vercel / Cloudflare |

## Metrics

| Metric | Current | Target |
|--------|---------|--------|
| Champions in DB | 224 | 224 |
| Regions in DB | 13 | 13 |
| TypeScript Errors | 0 | 0 |
| Lighthouse Score | TBD | 80+ |
