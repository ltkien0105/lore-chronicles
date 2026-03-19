import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Relation } from "@/db/schema";

interface ChampionRelationsProps {
  relations?: Relation[];
  className?: string;
}

/**
 * Champion relations grid
 */
export function ChampionRelations({
  relations,
  className,
}: ChampionRelationsProps) {
  if (!relations || relations.length === 0) return null;

  return (
    <section className={cn("space-y-4", className)}>
      <h2 className="font-heading text-2xl font-semibold text-primary">
        Relations
      </h2>

      <div className="grid gap-4 sm:grid-cols-2">
        {relations.map((relation) => (
          <Card
            key={relation.id}
            className="border-primary/20 bg-card transition-colors hover:border-primary/40"
          >
            <CardContent className="p-4">
              {/* Champion Name */}
              <div className="mb-2 flex items-start justify-between gap-2">
                <h3 className="font-heading text-lg font-semibold text-foreground">
                  {relation.championName2}
                </h3>
                {relation.type && (
                  <Badge variant="secondary" className="text-xs">
                    {relation.type}
                  </Badge>
                )}
              </div>

              {/* Description */}
              {relation.description && (
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {relation.description}
                </p>
              )}

              {/* Source Link */}
              {relation.sourceUrl &&
                relation.sourceUrl.startsWith("https://") && (
                  <a
                    href={relation.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-1 text-xs text-primary transition-colors hover:text-accent"
                  >
                    Source
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
