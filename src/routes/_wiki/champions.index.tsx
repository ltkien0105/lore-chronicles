import { createFileRoute } from "@tanstack/react-router";
import { WikiContainer } from "@/components/wiki/wiki-container";
import { ChampionCard } from "@/components/wiki/champion-card";
import { ChampionFilterBar } from "@/components/wiki/champion-filter-bar";
import { Pagination } from "@/components/wiki/pagination";
import { getChampions } from "@/server/champions";
import { getRegions } from "@/server/regions";

type ChampionSearch = {
  page?: number;
  search?: string;
  regionId?: number;
  role?: string;
};

export const Route = createFileRoute("/_wiki/champions/")({
  validateSearch: (search: Record<string, unknown>): ChampionSearch => ({
    page: Number(search.page) || undefined,
    search: typeof search.search === "string" ? search.search : undefined,
    regionId: Number(search.regionId) || undefined,
    role: typeof search.role === "string" ? search.role : undefined,
  }),
  loaderDeps: ({ search }) => search,
  loader: async ({ deps }) => {
    const [championsData, regions] = await Promise.all([
      getChampions({
        data: {
          page: deps.page ?? 1,
          pageSize: 24,
          search: deps.search,
          regionId: deps.regionId,
          role: deps.role,
        },
      }),
      getRegions(),
    ]);

    return {
      champions: championsData.items,
      total: championsData.total,
      regions,
      currentFilters: deps,
    };
  },
  head: () => ({
    meta: [
      { title: "Champions — Lore Chronicles" },
      {
        name: "description",
        content:
          "Browse all 224 champions from League of Legends. Filter by region, role, and search to explore the heroes of Runeterra.",
      },
    ],
  }),
  component: ChampionsPage,
});

function ChampionsPage() {
  const { champions, total, regions, currentFilters } = Route.useLoaderData();
  const currentPage = currentFilters.page ?? 1;

  return (
    <WikiContainer>
      <header className="mb-8">
        <h1 className="font-heading text-3xl font-bold text-primary sm:text-4xl">
          Champions
        </h1>
        <p className="mt-2 text-muted-foreground">
          Discover the heroes, legends, and warriors of Runeterra.
        </p>
      </header>

      <ChampionFilterBar
        regions={regions.map((r) => ({ id: r.id, name: r.name }))}
        currentFilters={currentFilters}
        className="mb-8"
      />

      {champions.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-lg text-muted-foreground">
            No champions found matching your filters.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {champions.map((champion) => (
              <ChampionCard key={champion.id} champion={champion} />
            ))}
          </div>

          <Pagination
            total={total}
            pageSize={24}
            currentPage={currentPage}
            className="mt-8"
          />
        </>
      )}
    </WikiContainer>
  );
}
