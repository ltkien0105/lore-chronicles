import { createFileRoute, Link } from "@tanstack/react-router";
import { WikiContainer } from "@/components/wiki/wiki-container";
import { WikiSkeleton } from "@/components/wiki/wiki-skeleton";
import { WikiError } from "@/components/wiki/wiki-error";
import { EmptyState } from "@/components/wiki/empty-state";
import { searchAll } from "@/server/search";

type SearchParams = {
  q?: string;
};

export const Route = createFileRoute("/_wiki/search")({
  validateSearch: (search: Record<string, unknown>): SearchParams => ({
    q: typeof search.q === "string" ? search.q : undefined,
  }),
  loaderDeps: ({ search }) => search,
  loader: async ({ deps }) => {
    if (!deps.q || deps.q.trim().length === 0) {
      return { results: null, query: "" };
    }
    const results = await searchAll({ data: { term: deps.q } });
    return { results, query: deps.q };
  },
  head: ({ loaderData }) => ({
    meta: [
      {
        title: loaderData?.query
          ? `Search: ${loaderData.query} — Lore Chronicles`
          : "Search — Lore Chronicles",
      },
      {
        name: "description",
        content: "Search champions and regions in the Lore Chronicles wiki.",
      },
    ],
  }),
  pendingComponent: () => (
    <WikiContainer>
      <header className="mb-8">
        <div className="h-9 w-48 animate-pulse rounded bg-stone-800" />
      </header>
      <WikiSkeleton count={6} variant="champion" />
    </WikiContainer>
  ),
  errorComponent: ({ error }) => (
    <WikiContainer>
      <WikiError message={error.message} />
    </WikiContainer>
  ),
  component: SearchPage,
});

function SearchPage() {
  const { results, query } = Route.useLoaderData();

  // No query provided
  if (!results) {
    return (
      <WikiContainer>
        <header className="mb-8">
          <h1 className="font-heading text-3xl font-bold text-primary sm:text-4xl">
            Search
          </h1>
          <p className="mt-2 text-muted-foreground">
            Enter a search term to find champions and regions.
          </p>
        </header>
        <SearchForm initialQuery="" />
      </WikiContainer>
    );
  }

  const totalResults = results.champions.length + results.regions.length;

  return (
    <WikiContainer>
      <header className="mb-8">
        <h1 className="font-heading text-3xl font-bold text-primary sm:text-4xl">
          Search Results
        </h1>
        <p className="mt-2 text-muted-foreground">
          {totalResults} {totalResults === 1 ? "result" : "results"} for "{query}"
        </p>
      </header>

      <SearchForm initialQuery={query} />

      {totalResults === 0 ? (
        <EmptyState
          title="No results found"
          description={`No champions or regions match "${query}". Try a different search term.`}
        />
      ) : (
        <div className="mt-8 space-y-10">
          {/* Champions Section */}
          {results.champions.length > 0 && (
            <section>
              <h2 className="mb-4 font-heading text-xl font-semibold text-primary">
                Champions ({results.champions.length})
              </h2>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {results.champions.map((champion) => (
                  <SearchResultCard
                    key={`champion-${champion.id}`}
                    href={`/champions/${champion.slug}`}
                    name={champion.name}
                    subtitle={champion.role ?? undefined}
                    imageUrl={champion.avatarUrl ?? undefined}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Regions Section */}
          {results.regions.length > 0 && (
            <section>
              <h2 className="mb-4 font-heading text-xl font-semibold text-primary">
                Regions ({results.regions.length})
              </h2>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {results.regions.map((region) => (
                  <SearchResultCard
                    key={`region-${region.id}`}
                    href={`/regions/${region.slug}`}
                    name={region.name}
                    imageUrl={region.crestImage ?? undefined}
                    isRegion
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </WikiContainer>
  );
}

function SearchForm({ initialQuery }: { initialQuery: string }) {
  return (
    <form action="/search" method="get" className="max-w-xl">
      <div className="relative">
        <input
          type="text"
          name="q"
          defaultValue={initialQuery}
          placeholder="Search champions, regions..."
          className="w-full rounded-lg border border-primary/30 bg-secondary px-4 py-3 pl-10 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <svg
          className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>
    </form>
  );
}

function SearchResultCard({
  href,
  name,
  subtitle,
  imageUrl,
  isRegion = false,
}: {
  href: string;
  name: string;
  subtitle?: string;
  imageUrl?: string;
  isRegion?: boolean;
}) {
  return (
    <Link
      to={href}
      className="group block overflow-hidden rounded-lg border border-primary/20 bg-card transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10"
    >
      <div className={`relative ${isRegion ? "h-24" : "aspect-square"} overflow-hidden bg-secondary/50`}>
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            className={`h-full w-full ${isRegion ? "object-contain p-4" : "object-cover"} transition-transform group-hover:scale-110`}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-3xl font-heading text-muted-foreground">
            {name.charAt(0)}
          </div>
        )}
      </div>
      <div className="p-3">
        <h3 className="font-heading text-sm font-semibold text-primary group-hover:text-accent">
          {name}
        </h3>
        {subtitle && (
          <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
        )}
      </div>
    </Link>
  );
}
