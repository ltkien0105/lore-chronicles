import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChampionFilterBarProps {
  regions: { id: number; name: string }[];
  currentFilters: {
    search?: string;
    regionId?: number;
    role?: string;
    page?: number;
  };
  className?: string;
}

const ROLES = ["Mage", "Marksman", "Assassin", "Fighter", "Tank", "Support"];

/**
 * Filter bar for champion list with search, region, and role selects
 */
export function ChampionFilterBar({
  regions,
  currentFilters,
  className,
}: ChampionFilterBarProps) {
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState(currentFilters.search ?? "");

  // Debounced search - navigate after 300ms of no typing
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (searchInput !== currentFilters.search) {
        navigate({
          to: "/champions",
          search: {
            ...currentFilters,
            search: searchInput || undefined,
            page: 1, // Reset to page 1 on filter change
          },
        });
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [searchInput]);

  const handleRegionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    navigate({
      to: "/champions",
      search: {
        ...currentFilters,
        regionId: value ? parseInt(value) : undefined,
        page: 1,
      },
    });
  };

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    navigate({
      to: "/champions",
      search: {
        ...currentFilters,
        role: value || undefined,
        page: 1,
      },
    });
  };

  const clearFilters = () => {
    setSearchInput("");
    navigate({ to: "/champions", search: {} });
  };

  const hasFilters =
    currentFilters.search || currentFilters.regionId || currentFilters.role;

  return (
    <div className={cn("space-y-4", className)}>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Search */}
        <div className="relative lg:col-span-2">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search champions..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="h-10 border-primary/20 bg-secondary pl-9 placeholder:text-muted-foreground focus-visible:ring-primary"
          />
        </div>

        {/* Region Select */}
        <select
          value={currentFilters.regionId ?? ""}
          onChange={handleRegionChange}
          className="h-10 rounded-md border border-primary/20 bg-secondary px-3 text-sm text-foreground transition-colors hover:border-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
        >
          <option value="">All Regions</option>
          {regions.map((region) => (
            <option key={region.id} value={region.id}>
              {region.name}
            </option>
          ))}
        </select>

        {/* Role Select */}
        <select
          value={currentFilters.role ?? ""}
          onChange={handleRoleChange}
          className="h-10 rounded-md border border-primary/20 bg-secondary px-3 text-sm text-foreground transition-colors hover:border-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
        >
          <option value="">All Roles</option>
          {ROLES.map((role) => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </select>
      </div>

      {/* Clear Filters */}
      {hasFilters && (
        <button
          onClick={clearFilters}
          className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
        >
          <X className="h-4 w-4" />
          Clear filters
        </button>
      )}
    </div>
  );
}
