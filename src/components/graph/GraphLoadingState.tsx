/**
 * Loading state component for graph visualization
 */

export function GraphLoadingState() {
  return (
    <div className="flex h-full items-center justify-center bg-stone-950">
      <div className="text-center">
        <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-stone-800 border-t-primary" />
        <p className="text-sm text-muted-foreground">Loading relationship graph...</p>
      </div>
    </div>
  );
}
