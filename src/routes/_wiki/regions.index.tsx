import { createFileRoute } from "@tanstack/react-router";
import { WikiContainer } from "@/components/wiki/wiki-container";

export const Route = createFileRoute("/_wiki/regions/")({
  component: RegionsPage,
});

/**
 * Regions index page - placeholder for Phase 03
 */
function RegionsPage() {
  return (
    <WikiContainer>
      <h1 className="text-3xl font-heading text-primary">Regions</h1>
      <p className="mt-4 text-muted-foreground">
        Region list coming in Phase 03...
      </p>
    </WikiContainer>
  );
}
