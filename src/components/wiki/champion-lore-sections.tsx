import Markdown from "react-markdown";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface ChampionLoreSectionsProps {
  appearance?: string | null;
  personality?: string | null;
  abilities?: string | null;
  trivia?: string | null;
  className?: string;
}

interface LoreSection {
  title: string;
  content: string;
}

/**
 * Champion lore sections in long scroll layout
 */
export function ChampionLoreSections({
  appearance,
  personality,
  abilities,
  trivia,
  className,
}: ChampionLoreSectionsProps) {
  const sections: LoreSection[] = [];

  if (appearance) sections.push({ title: "Appearance", content: appearance });
  if (personality) sections.push({ title: "Personality", content: personality });
  if (abilities) sections.push({ title: "Abilities", content: abilities });
  if (trivia) sections.push({ title: "Trivia", content: trivia });

  if (sections.length === 0) return null;

  return (
    <div className={cn("space-y-8", className)}>
      {sections.map((section, index) => (
        <div key={section.title}>
          {index > 0 && <Separator className="mb-8 bg-primary/20" />}
          <section>
            <h2 className="mb-4 font-heading text-2xl font-semibold text-primary">
              {section.title}
            </h2>
            <article className="prose prose-invert prose-stone max-w-none">
              <Markdown
                components={{
                  p: ({ children }) => (
                    <p className="mb-4 leading-relaxed text-foreground">
                      {children}
                    </p>
                  ),
                  strong: ({ children }) => (
                    <strong className="font-semibold text-primary">
                      {children}
                    </strong>
                  ),
                  em: ({ children }) => <em className="italic">{children}</em>,
                  ul: ({ children }) => (
                    <ul className="mb-4 list-inside list-disc space-y-2 text-foreground">
                      {children}
                    </ul>
                  ),
                  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                }}
              >
                {section.content}
              </Markdown>
            </article>
          </section>
        </div>
      ))}
    </div>
  );
}
