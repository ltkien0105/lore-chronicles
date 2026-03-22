import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { Network } from "lucide-react";
import { WikiContainer } from "@/components/wiki/wiki-container";
import { Breadcrumb } from "@/components/wiki/breadcrumb";
import { ChampionHero } from "@/components/wiki/champion-hero";
import { ChampionKeyFacts } from "@/components/wiki/champion-key-facts";
import { ChampionBiography } from "@/components/wiki/champion-biography";
import { ChampionLoreSections } from "@/components/wiki/champion-lore-sections";
import { ChampionRelations } from "@/components/wiki/champion-relations";
import { WikiDetailSkeleton } from "@/components/wiki/wiki-skeleton";
import { WikiError } from "@/components/wiki/wiki-error";
import { getChampionBySlug } from "@/server/champions";

export const Route = createFileRoute("/_wiki/champions/$slug")({
  loader: async ({ params }) => {
    const champion = await getChampionBySlug({ data: { slug: params.slug } });
    if (!champion) {
      throw notFound();
    }
    return { champion };
  },
  head: ({ loaderData }) => ({
    meta: [
      {
        title: `${loaderData?.champion.name ?? "Champion"} — Champions — Lore Chronicles`,
      },
      {
        name: "description",
        content:
          loaderData?.champion.biography?.short ??
          loaderData?.champion.title ??
          "Explore the lore of this champion.",
      },
      {
        property: "og:image",
        content: loaderData?.champion.avatarUrl ?? undefined,
      },
    ],
  }),
  pendingComponent: () => (
    <WikiContainer>
      <WikiDetailSkeleton />
    </WikiContainer>
  ),
  errorComponent: ({ error }) => (
    <WikiContainer>
      <WikiError message={error.message} />
    </WikiContainer>
  ),
  component: ChampionDetailPage,
});

function ChampionDetailPage() {
  const { champion } = Route.useLoaderData();

  return (
    <>
      <ChampionHero
        name={champion.name}
        title={champion.title}
        quote={champion.quote}
        avatarUrl={champion.avatarUrl}
        bgUrl={champion.bgUrl}
      />

      <WikiContainer>
        <div className="mb-6 flex items-center justify-between">
          <Breadcrumb
            items={[
              { label: "Champions", href: "/champions" },
              { label: champion.name },
            ]}
          />
          <Link
            to="/relationships"
            search={{ focus: champion.slug }}
            className="inline-flex items-center gap-2 rounded-md border border-primary/20 bg-stone-900 px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-primary"
          >
            <Network className="h-4 w-4" />
            View Relationships
          </Link>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <main className="space-y-12 lg:col-span-2">
            <ChampionBiography biography={champion.biography} />

            <ChampionLoreSections
              appearance={champion.appearance}
              personality={champion.personality}
              abilities={champion.abilities}
              trivia={champion.trivia}
            />

            <ChampionRelations relations={champion.relationsFrom} />
          </main>

          {/* Sidebar */}
          <aside className="lg:sticky lg:top-20 lg:self-start">
            <ChampionKeyFacts
              keyFacts={champion.keyFacts}
              region={champion.region}
              releaseDate={champion.releaseDate}
            />
          </aside>
        </div>
      </WikiContainer>
    </>
  );
}
