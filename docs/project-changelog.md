# Project Changelog

All notable changes to Lore Chronicles.

## [Unreleased]

### Added
- **Search Page** (`/search`) - Combined search for champions and regions with live results
- **Loading States** - Skeleton loaders during page transitions
- **Error Boundaries** - Graceful error handling on all wiki routes
- **404 Page** - Styled not-found page with navigation links
- **Image Fallbacks** - Placeholder display when images fail to load

## [0.2.0] - 2026-03-20

### Added
- **Wiki Champion Pages** (`/champions`, `/champions/:slug`)
  - Paginated list (24/page) with smart page numbers
  - Filters: search (debounced), region dropdown, role dropdown
  - Detail page: hero banner, biography, lore sections, key facts, relations
  - SEO meta tags per champion

- **Wiki Region Pages** (`/regions`, `/regions/:slug`)
  - 13 region cards with crests, descriptions, champion counts
  - Detail page: hero, facts sidebar (from JSONB), champion grid
  - Accent colors per region from config

- **Wiki Layout & Navigation**
  - Sticky header with logo, nav links (Map/Champions/Regions/Search)
  - Mobile hamburger menu
  - Breadcrumb navigation
  - Global search input

- **Server Functions**
  - `getRegions()` - All regions with champion count
  - `getRegionBySlug()` - Single region with champions
  - `getChampions()` - Paginated/filtered list
  - `getChampionBySlug()` - Champion with region and relations
  - `searchAll()` - Combined champion/region search

- **Drizzle ORM Relations**
  - `regions ↔ champions` one-to-many
  - `champions ↔ relations` many-to-many (via junction table)

### Technical
- TanStack Start with SSR loaders
- URL search params for filters/pagination
- TypeScript strict mode (0 errors)
- All files under 200 lines

## [0.1.0] - 2026-03-15

### Added
- Initial TanStack Start setup
- Interactive Runeterra map with region pins
- Drizzle ORM with PostgreSQL
- Database schema: champions, regions, relations
- Dark mystical theme (Cinzel + EB Garamond fonts)
