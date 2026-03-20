import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { WikiContainer } from "@/components/wiki/wiki-container";
import { Breadcrumb } from "@/components/wiki/breadcrumb";
import { RegionDetailHeader } from "@/components/wiki/region-detail-header";
import { RegionFacts } from "@/components/wiki/region-facts";
import { WikiDetailSkeleton } from "@/components/wiki/wiki-skeleton";
import { WikiError } from "@/components/wiki/wiki-error";
import { getRegionBySlug } from "@/server/regions";

export const Route = createFileRoute("/_wiki/regions/$slug")({
  loader: async ({ params }) => {
    const region = await getRegionBySlug({ data: { slug: params.slug } });
    if (!region) {
      throw notFound();
    }
    return { region };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.region.name ?? "Region"} — Regions — Lore Chronicles` },
      {
        name: "description",
        content: loaderData?.region.description?.slice(0, 160) ?? "Explore this region of Runeterra.",
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
  component: RegionDetailPage,
});

function RegionDetailPage() {
  const { region } = Route.useLoaderData();

  return (
    <>
      <RegionDetailHeader
        name={region.name}
        title={region.title}
        bgImage={region.bgImage}
      />

      <WikiContainer>
        <Breadcrumb
          items={[
            { label: "Regions", href: "/regions" },
            { label: region.name },
          ]}
          className="mb-6"
        />

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <main className="lg:col-span-2">
            <article className="prose prose-invert prose-stone max-w-none">
              <p className="text-lg leading-relaxed text-foreground">
                {region.description ?? "No description available."}
              </p>
            </article>
          </main>

          {/* Sidebar */}
          <aside className="space-y-6">
            <RegionFacts facts={region.facts} />

            {/* Champions Grid */}
            {region.champions && region.champions.length > 0 && (
              <div className="rounded-lg border border-primary/20 bg-card p-4">
                <h3 className="mb-4 font-heading text-lg font-semibold text-primary">
                  Champions ({region.champions.length})
                </h3>
                <div className="grid grid-cols-4 gap-2">
                  {region.champions.map((champion) => (
                    <Link
                      key={champion.id}
                      to="/champions/$slug"
                      params={{ slug: champion.slug }}
                      className="group relative"
                    >
                      <div className="aspect-square overflow-hidden rounded-md border border-primary/20 bg-secondary transition-all group-hover:border-primary/50">
                        {champion.avatarUrl ? (
                          <img
                            src={champion.avatarUrl}
                            alt={champion.name}
                            className="h-full w-full object-cover transition-transform group-hover:scale-110"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                            {champion.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <span className="mt-1 block truncate text-center text-xs text-muted-foreground group-hover:text-primary">
                        {champion.name}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </WikiContainer>
    </>
  );
}
