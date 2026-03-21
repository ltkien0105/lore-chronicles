import { Outlet, createFileRoute } from "@tanstack/react-router";
import { WikiHeader } from "@/components/wiki/wiki-header";
import { SkipLink } from "@/components/SkipLink";

export const Route = createFileRoute("/_wiki")({
  component: WikiLayout,
});

/**
 * Pathless layout for wiki pages (/champions/*, /regions/*)
 * Map page (/) is NOT wrapped by this layout
 */
function WikiLayout() {
  return (
    <div className="min-h-screen bg-background">
      <SkipLink />
      <WikiHeader />
      <main id="main-content">
        <Outlet />
      </main>
    </div>
  );
}
