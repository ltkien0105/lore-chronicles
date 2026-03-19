import { Outlet, createFileRoute } from "@tanstack/react-router";
import { WikiHeader } from "@/components/wiki/wiki-header";

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
      <WikiHeader />
      <main>
        <Outlet />
      </main>
    </div>
  );
}
