# TanStack Start SSR Patterns Research

## createServerFn API
```tsx
import { createServerFn } from '@tanstack/react-start'

// GET — no input
const getItems = createServerFn({ method: 'GET' }).handler(async () => {
  return db.query.items.findMany()
})

// GET — with input validation
const getItemBySlug = createServerFn({ method: 'GET' })
  .inputValidator((d: string) => d)
  .handler(async ({ data: slug }) => {
    return db.query.items.findFirst({ where: eq(items.slug, slug) })
  })
```

## Route Loaders
- `loader` runs on **both server and client** — NOT server-only
- Use `createServerFn` inside loader for server-only code (DB, env vars)
- Loader data accessed via `Route.useLoaderData()`

```tsx
export const Route = createFileRoute('/champions/$slug')({
  loader: async ({ params }) => {
    return getChampionBySlug({ data: params.slug })
  },
  component: ChampionPage,
})
```

## Dynamic Routes (File-based)
- `/champions/$slug` → file: `src/routes/champions/$slug.tsx`
- `/regions/$slug` → file: `src/routes/regions/$slug.tsx`
- Access params: `Route.useParams()` or `params` in loader

## Per-Route SEO Head
```tsx
head: ({ loaderData }) => ({
  meta: [
    { title: `${loaderData.name} — Lore Chronicles` },
    { name: 'description', content: loaderData.biography?.short },
    { property: 'og:title', content: loaderData.name },
    { property: 'og:image', content: loaderData.avatarUrl },
  ],
}),
```

## Layout Routes (Pathless)
- Prefix with underscore: `_wiki.tsx` → wraps children without affecting URL
- Children directory: `_wiki/` with files like `champions.index.tsx`
- Layout renders `<Outlet />` for child content
- Map page stays at `routes/index.tsx` — outside layout

```
src/routes/
├── __root.tsx           # HTML shell
├── index.tsx            # / (map, fullscreen)
├── _wiki.tsx            # pathless layout (nav wrapper)
├── _wiki/
│   ├── champions.index.tsx   # /champions
│   ├── champions.$slug.tsx   # /champions/:slug
│   ├── regions.index.tsx     # /regions
│   └── regions.$slug.tsx     # /regions/:slug
```

## Key Findings
- `shellComponent` = outermost HTML shell (already using)
- `component` in root = renders `<Outlet />` for child routes
- Current root uses `shellComponent` only — need to add `component` with `<Outlet />`
- Pathless layout = underscore prefix `_`
