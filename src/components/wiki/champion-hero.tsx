import { cn } from "@/lib/utils";

interface ChampionHeroProps {
  name: string;
  title?: string | null;
  quote?: string | null;
  avatarUrl?: string | null;
  bgUrl?: string | null;
  className?: string;
}

/**
 * Hero banner for champion detail pages
 */
export function ChampionHero({
  name,
  title,
  quote,
  avatarUrl,
  bgUrl,
  className,
}: ChampionHeroProps) {
  return (
    <div
      className={cn(
        "relative flex min-h-[400px] items-end",
        bgUrl ? "bg-cover bg-center" : "border-b border-primary/30 bg-secondary",
        className
      )}
      style={bgUrl ? { backgroundImage: `url(${bgUrl})` } : undefined}
    >
      {/* Dark gradient overlay */}
      {bgUrl && (
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
      )}

      {/* Content */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-end">
          {/* Avatar */}
          {avatarUrl && (
            <div className="h-32 w-32 flex-shrink-0 overflow-hidden rounded-lg border-2 border-primary shadow-2xl sm:h-40 sm:w-40">
              <img
                src={avatarUrl}
                alt={name}
                className="h-full w-full object-cover"
              />
            </div>
          )}

          {/* Text Content */}
          <div className="flex-1">
            <h1 className="font-heading text-4xl font-bold text-primary drop-shadow-lg sm:text-5xl lg:text-6xl">
              {name}
            </h1>
            {title && (
              <p className="mt-2 font-body text-xl italic text-muted-foreground drop-shadow sm:text-2xl">
                {title}
              </p>
            )}
            {quote && (
              <blockquote className="mt-4 border-l-4 border-primary pl-4 font-body italic text-foreground drop-shadow">
                "{quote}"
              </blockquote>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
