import { cn } from "@/lib/utils";

interface RegionDetailHeaderProps {
  name: string;
  title?: string | null;
  bgImage?: string | null;
  className?: string;
}

/**
 * Hero banner for region detail pages
 */
export function RegionDetailHeader({
  name,
  title,
  bgImage,
  className,
}: RegionDetailHeaderProps) {
  return (
    <div
      className={cn(
        "relative flex min-h-[320px] items-end",
        bgImage ? "bg-cover bg-center" : "border-b border-primary/30 bg-secondary",
        className
      )}
      style={bgImage ? { backgroundImage: `url(${bgImage})` } : undefined}
    >
      {/* Dark gradient overlay */}
      {bgImage && (
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
      )}

      {/* Content */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
        <h1 className="font-heading text-4xl font-bold text-primary drop-shadow-lg sm:text-5xl">
          {name}
        </h1>
        {title && (
          <p className="mt-2 font-body text-xl italic text-muted-foreground drop-shadow">
            {title}
          </p>
        )}
      </div>
    </div>
  );
}
