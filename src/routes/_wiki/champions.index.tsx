import { createFileRoute } from "@tanstack/react-router";
import { WikiContainer } from "@/components/wiki/wiki-container";

export const Route = createFileRoute("/_wiki/champions/")({
  component: ChampionsPage,
});

/**
 * Champions index page - placeholder for Phase 04
 */
function ChampionsPage() {
  return (
    <WikiContainer>
      <h1 className="text-3xl font-heading text-primary">Champions</h1>
      <p className="mt-4 text-muted-foreground">
        Champion list coming in Phase 04...
      </p>
    </WikiContainer>
  );
}
