import { Link } from "@tanstack/react-router";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { Champion } from "@/db/schema";

interface ChampionKeyFactsProps {
  keyFacts?: Champion["keyFacts"];
  region?: { name: string; slug: string } | null;
  releaseDate?: string | null;
  className?: string;
}

/**
 * Champion key facts sidebar
 */
export function ChampionKeyFacts({
  keyFacts,
  region,
  releaseDate,
  className,
}: ChampionKeyFactsProps) {
  const facts: Array<{ label: string; value: string | React.ReactNode }> = [];

  // Extract facts from keyFacts jsonb structure
  if (keyFacts) {
    if (keyFacts.titles) {
      if (keyFacts.titles.real_name) {
        facts.push({ label: "Real Name", value: keyFacts.titles.real_name });
      }
      if (keyFacts.titles.alias) {
        facts.push({ label: "Alias", value: keyFacts.titles.alias });
      }
    }

    if (keyFacts.characteristics) {
      if (keyFacts.characteristics.species) {
        facts.push({ label: "Species", value: keyFacts.characteristics.species });
      }
      if (keyFacts.characteristics.pronoun) {
        facts.push({ label: "Pronoun", value: keyFacts.characteristics.pronoun });
      }
      if (keyFacts.characteristics.age?.current) {
        facts.push({ label: "Age", value: keyFacts.characteristics.age.current });
      }
      if (keyFacts.characteristics.weapons) {
        facts.push({ label: "Weapons", value: keyFacts.characteristics.weapons });
      }
    }

    if (keyFacts.personal_status) {
      if (keyFacts.personal_status.status) {
        facts.push({ label: "Status", value: keyFacts.personal_status.status });
      }
      if (keyFacts.personal_status.place_of_origin) {
        facts.push({
          label: "Place of Origin",
          value: keyFacts.personal_status.place_of_origin,
        });
      }
      if (keyFacts.personal_status.current_residence) {
        facts.push({
          label: "Residence",
          value: keyFacts.personal_status.current_residence,
        });
      }
      if (keyFacts.personal_status.family) {
        facts.push({ label: "Family", value: keyFacts.personal_status.family });
      }
    }

    if (keyFacts.professional_status) {
      if (keyFacts.professional_status.occupations) {
        facts.push({
          label: "Occupations",
          value: keyFacts.professional_status.occupations,
        });
      }
      if (keyFacts.professional_status.factions) {
        facts.push({
          label: "Factions",
          value: keyFacts.professional_status.factions,
        });
      }
    }
  }

  // Add region
  if (region) {
    facts.push({
      label: "Region",
      value: (
        <Link
          to="/regions/$slug"
          params={{ slug: region.slug }}
          className="text-primary hover:text-accent"
        >
          {region.name}
        </Link>
      ),
    });
  }

  // Add release date
  if (releaseDate) {
    facts.push({ label: "Release Date", value: releaseDate });
  }

  if (facts.length === 0) return null;

  return (
    <div
      className={cn("rounded-lg border border-primary/20 bg-card p-4", className)}
    >
      <h3 className="mb-4 font-heading text-lg font-semibold text-primary">
        Key Facts
      </h3>
      <dl className="space-y-3">
        {facts.map((fact, index) => (
          <div key={index}>
            {index > 0 && <Separator className="mb-3 bg-primary/10" />}
            <dt className="text-sm font-medium text-muted-foreground">
              {fact.label}
            </dt>
            <dd className="mt-1 text-sm text-foreground">{fact.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
