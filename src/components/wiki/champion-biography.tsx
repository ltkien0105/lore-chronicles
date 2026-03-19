import Markdown from "react-markdown";
import { cn } from "@/lib/utils";
import type { Champion } from "@/db/schema";

interface ChampionBiographyProps {
  biography?: Champion["biography"];
  className?: string;
}

/**
 * Champion biography with hook and body text
 */
export function ChampionBiography({
  biography,
  className,
}: ChampionBiographyProps) {
  if (!biography) return null;

  return (
    <section className={cn("space-y-6", className)}>
      <h2 className="font-heading text-2xl font-semibold text-primary">
        Biography
      </h2>

      {biography.hook && (
        <blockquote className="border-l-4 border-primary pl-6 font-body text-lg italic leading-relaxed text-foreground">
          {biography.hook}
        </blockquote>
      )}

      {biography.body && (
        <article className="prose prose-invert prose-stone max-w-none">
          <Markdown
            components={{
              p: ({ children }) => (
                <p className="mb-4 leading-relaxed text-foreground">{children}</p>
              ),
              strong: ({ children }) => (
                <strong className="font-semibold text-primary">{children}</strong>
              ),
              em: ({ children }) => <em className="italic">{children}</em>,
            }}
          >
            {biography.body}
          </Markdown>
        </article>
      )}
    </section>
  );
}
