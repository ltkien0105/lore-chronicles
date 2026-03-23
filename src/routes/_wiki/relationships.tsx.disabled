import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";
import { RelationshipGraphCanvas } from "@/components/graph";
import { WikiContainer } from "@/components/wiki/wiki-container";
import { WikiSkeleton } from "@/components/wiki/wiki-skeleton";
import { WikiError } from "@/components/wiki/wiki-error";
import { getGraphData } from "@/server/relationships";
import { getRegions } from "@/server/regions";

type RelationshipSearch = {
  focus?: string;
};

export const Route = createFileRoute("/_wiki/relationships")({
  validateSearch: (search: Record<string, unknown>): RelationshipSearch => ({
    focus: typeof search.focus === "string" ? search.focus : undefined,
  }),
  loader: async () => {
    const [graphData, regions] = await Promise.all([
      getGraphData(),
      getRegions(),
    ]);
    return { graphData, regions };
  },
  head: () => ({
    meta: [
      { title: "Champion Relationships — Lore Chronicles" },
      {
        name: "description",
        content:
          "Explore champion connections through an interactive 3D relationship graph. Discover how the heroes of Runeterra are connected.",
      },
    ],
  }),
  pendingComponent: () => (
    <WikiContainer>
      <div className="h-[calc(100vh-4rem)] animate-pulse rounded-lg bg-stone-900" />
    </WikiContainer>
  ),
  errorComponent: ({ error }) => (
    <WikiContainer>
      <WikiError message={error.message} />
    </WikiContainer>
  ),
  component: RelationshipsPage,
});

function RelationshipsPage() {
  const { graphData, regions } = Route.useLoaderData();
  const { focus } = Route.useSearch();

  return (
    <div className="h-[calc(100vh-4rem)]">
      <Suspense fallback={<div className="h-full bg-stone-950" />}>
        <RelationshipGraphCanvas
          data={graphData}
          regions={regions}
          focusSlug={focus}
        />
      </Suspense>
    </div>
  );
}
