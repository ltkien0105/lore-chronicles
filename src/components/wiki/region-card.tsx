import { Link } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { REGIONS } from "@/components/regions/region-config";
import { cn } from "@/lib/utils";

interface RegionCardProps {
  region: {
    name: string;
    slug: string;
    description?: string | null;
    crestImage?: string | null;
    champions?: { id: number }[];
  };
  className?: string;
}

/**
 * Get region accent color from config, fallback to gold
 */
function getRegionColor(slug: string): string {
  const config = REGIONS.find((r) => r.id === slug);
  return config?.color ?? "#eab308";
}

/**
 * Region card for list pages
 */
export function RegionCard({ region, className }: RegionCardProps) {
  const accentColor = getRegionColor(region.slug);
  const championCount = region.champions?.length ?? 0;
  const excerpt = region.description
    ? region.description.length > 120
      ? `${region.description.slice(0, 120)}...`
      : region.description
    : "Explore this mysterious region...";

  return (
    <Link
      to="/regions/$slug"
      params={{ slug: region.slug }}
      className="group block"
    >
      <Card
        className={cn(
          "overflow-hidden border-primary/20 bg-card transition-all duration-300",
          "hover:border-opacity-60 hover:shadow-lg hover:shadow-primary/10",
          className
        )}
        style={{
          borderColor: `${accentColor}33`,
          ["--hover-border" as string]: accentColor,
        }}
      >
        <CardContent className="p-0">
          {/* Crest Image */}
          <div className="relative flex h-40 items-center justify-center bg-secondary/50">
            {region.crestImage ? (
              <img
                src={region.crestImage}
                alt={`${region.name} crest`}
                className="h-28 w-28 object-contain transition-transform duration-300 group-hover:scale-110"
              />
            ) : (
              <div
                className="flex h-28 w-28 items-center justify-center rounded-full bg-muted text-4xl font-heading text-muted-foreground"
              >
                {region.name.charAt(0)}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-4">
            <h3 className="font-heading text-lg font-semibold text-primary transition-colors group-hover:text-accent">
              {region.name}
            </h3>
            <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
              {excerpt}
            </p>
            <div className="mt-3">
              <Badge variant="secondary" className="text-xs">
                {championCount} {championCount === 1 ? "Champion" : "Champions"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
