import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface RegionFact {
  label: string;
  description: string;
}

interface RegionFactsProps {
  facts?: RegionFact[] | null;
  className?: string;
}

/**
 * Renders region facts as a key/value list
 */
export function RegionFacts({ facts, className }: RegionFactsProps) {
  if (!facts || facts.length === 0) {
    return null;
  }

  return (
    <div className={cn("rounded-lg border border-primary/20 bg-card p-4", className)}>
      <h3 className="mb-4 font-heading text-lg font-semibold text-primary">
        Facts
      </h3>
      <dl className="space-y-3">
        {facts.map((fact, index) => (
          <div key={index}>
            {index > 0 && <Separator className="mb-3 bg-primary/10" />}
            <dt className="text-sm font-medium text-muted-foreground">
              {fact.label}
            </dt>
            <dd className="mt-1 text-sm text-foreground">
              {fact.description}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
