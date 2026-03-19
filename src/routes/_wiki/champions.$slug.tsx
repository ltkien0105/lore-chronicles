import { createFileRoute } from "@tanstack/react-router";
import { WikiContainer } from "@/components/wiki/wiki-container";

export const Route = createFileRoute("/_wiki/champions/$slug")({
  component: ChampionDetailPage,
});

/**
 * Champion detail page - placeholder for Phase 04
 */
function ChampionDetailPage() {
  const { slug } = Route.useParams();

  return (
    <WikiContainer>
      <h1 className="font-heading text-3xl text-primary">Champion: {slug}</h1>
      <p className="mt-4 text-muted-foreground">
        Champion detail coming in Phase 04...
      </p>
    </WikiContainer>
  );
}
