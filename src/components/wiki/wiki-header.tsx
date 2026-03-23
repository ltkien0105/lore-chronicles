import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Menu, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "Map", href: "/" },
  { label: "Champions", href: "/champions" },
  { label: "Regions", href: "/regions" },
  // { label: "Graph", href: "/relationships" }, // TODO: Re-enable when graph feature is ready
  { label: "Search", href: "/search" },
] as const;

/**
 * Wiki navigation header with logo, nav links, search, and mobile menu
 */
export function WikiHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchValue.trim()) {
      navigate({ to: "/search", search: { q: searchValue.trim() } });
      setSearchValue("");
      setMenuOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-primary/20 bg-stone-950/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <Link
          to="/"
          className="font-heading text-xl font-semibold tracking-wide text-primary transition-colors hover:text-accent"
        >
          Lore Chronicles
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary data-[status=active]:text-primary"
              activeProps={{ className: "text-primary" }}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop Search */}
        <div className="hidden items-center gap-4 md:flex">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search champions..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyDown={handleSearch}
              className="h-9 w-64 border-primary/20 bg-secondary pl-9 text-sm placeholder:text-muted-foreground focus-visible:ring-primary"
            />
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex h-10 w-10 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-primary md:hidden"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
        >
          {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={cn(
          "overflow-hidden border-t border-primary/20 bg-stone-950 transition-all duration-200 md:hidden",
          menuOpen ? "max-h-80" : "max-h-0"
        )}
      >
        <nav className="flex flex-col gap-1 px-4 py-4">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              onClick={() => setMenuOpen(false)}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-primary"
              activeProps={{ className: "bg-secondary text-primary" }}
            >
              {link.label}
            </Link>
          ))}
          <div className="relative mt-2">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search champions..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyDown={handleSearch}
              className="h-10 w-full border-primary/20 bg-secondary pl-9 text-sm placeholder:text-muted-foreground focus-visible:ring-primary"
            />
          </div>
        </nav>
      </div>
    </header>
  );
}
