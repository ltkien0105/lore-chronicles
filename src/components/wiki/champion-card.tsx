import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ChampionCardProps {
  champion: {
    name: string;
    slug: string;
    title?: string | null;
    avatarUrl?: string | null;
    role?: string | null;
    region?: { name: string; slug: string } | null;
  };
  className?: string;
}

/**
 * Champion card for list pages
 */
export function ChampionCard({ champion, className }: ChampionCardProps) {
  const [imgError, setImgError] = useState(false);

  return (
    <Link
      to="/champions/$slug"
      params={{ slug: champion.slug }}
      className="group block"
    >
      <Card
        className={cn(
          "overflow-hidden border-primary/20 bg-card transition-all duration-300",
          "hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10",
          className
        )}
      >
        <CardContent className="p-0">
          {/* Avatar */}
          <div className="relative aspect-square overflow-hidden bg-secondary/50">
            {champion.avatarUrl && !imgError ? (
              <img
                src={champion.avatarUrl}
                alt={champion.name}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-4xl font-heading text-muted-foreground">
                {champion.name.charAt(0)}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-3">
            <h3 className="font-heading text-base font-semibold text-primary transition-colors group-hover:text-accent">
              {champion.name}
            </h3>
            {champion.title && (
              <p className="mt-1 line-clamp-2 text-xs italic text-muted-foreground">
                {champion.title}
              </p>
            )}
            <div className="mt-2 flex items-center gap-2">
              {champion.role && (
                <Badge variant="secondary" className="text-xs">
                  {champion.role}
                </Badge>
              )}
              {champion.region && (
                <Link
                  to="/regions/$slug"
                  params={{ slug: champion.region.slug }}
                  className="text-xs text-muted-foreground hover:text-primary"
                  onClick={(e) => e.stopPropagation()}
                >
                  {champion.region.name}
                </Link>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
