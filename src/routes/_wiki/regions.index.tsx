import { createFileRoute } from "@tanstack/react-router";
import { WikiContainer } from "@/components/wiki/wiki-container";
import { RegionCard } from "@/components/wiki/region-card";
import { WikiSkeleton } from "@/components/wiki/wiki-skeleton";
import { WikiError } from "@/components/wiki/wiki-error";
import { getRegions } from "@/server/regions";

export const Route = createFileRoute("/_wiki/regions/")({
  loader: async () => {
    const regions = await getRegions();
    return { regions };
  },
  head: () => ({
    meta: [
      { title: "Regions — Lore Chronicles" },
      {
        name: "description",
        content:
          "Explore the 13 regions of Runeterra. Discover the lore, culture, and champions of each unique land.",
      },
    ],
  }),
  pendingComponent: () => (
    <WikiContainer>
      <header className="mb-8">
        <div className="h-9 w-64 animate-pulse rounded bg-stone-800" />
        <div className="mt-2 h-5 w-96 animate-pulse rounded bg-stone-800" />
      </header>
      <WikiSkeleton count={13} variant="region" />
    </WikiContainer>
  ),
  errorComponent: ({ error }) => (
    <WikiContainer>
      <WikiError message={error.message} />
    </WikiContainer>
  ),
  component: RegionsPage,
});

function RegionsPage() {
  const { regions } = Route.useLoaderData();

  return (
    <WikiContainer>
      <header className="mb-8">
        <h1 className="font-heading text-3xl font-bold text-primary sm:text-4xl">
          Regions of Runeterra
        </h1>
        <p className="mt-2 text-muted-foreground">
          Explore the diverse lands and factions that shape the world of Runeterra.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {regions.map((region) => (
          <RegionCard key={region.id} region={region} />
        ))}
      </div>
    </WikiContainer>
  );
}
