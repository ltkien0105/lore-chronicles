import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaginationProps {
  total: number;
  pageSize: number;
  currentPage: number;
  className?: string;
}

/**
 * Pagination controls with prev/next and page numbers
 */
export function Pagination({
  total,
  pageSize,
  currentPage,
  className,
}: PaginationProps) {
  const totalPages = Math.ceil(total / pageSize);

  if (totalPages <= 1) return null;

  // Generate page numbers to display (max 7 with ellipsis)
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];

    if (totalPages <= 7) {
      // Show all pages
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show first, last, current, and neighbors
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, "...", totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
      }
    }

    return pages;
  };

  const pages = getPageNumbers();

  return (
    <nav
      className={cn("flex items-center justify-center gap-1", className)}
      aria-label="Pagination"
    >
      {/* Previous */}
      {currentPage > 1 ? (
        <Link
          to="/champions"
          search={(prev) => ({ ...prev, page: currentPage - 1 })}
          className="flex h-9 w-9 items-center justify-center rounded-md border border-primary/20 text-muted-foreground transition-colors hover:border-primary hover:text-primary"
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </Link>
      ) : (
        <div className="flex h-9 w-9 items-center justify-center rounded-md border border-muted text-muted">
          <ChevronLeft className="h-4 w-4" />
        </div>
      )}

      {/* Page numbers */}
      {pages.map((page, index) =>
        typeof page === "number" ? (
          <Link
            key={index}
            to="/champions"
            search={(prev) => ({ ...prev, page })}
            className={cn(
              "flex h-9 min-w-9 items-center justify-center rounded-md border px-3 text-sm font-medium transition-colors",
              page === currentPage
                ? "border-primary bg-primary text-primary-foreground"
                : "border-primary/20 text-muted-foreground hover:border-primary hover:text-primary"
            )}
          >
            {page}
          </Link>
        ) : (
          <span
            key={index}
            className="flex h-9 w-9 items-center justify-center text-muted-foreground"
          >
            {page}
          </span>
        )
      )}

      {/* Next */}
      {currentPage < totalPages ? (
        <Link
          to="/champions"
          search={(prev) => ({ ...prev, page: currentPage + 1 })}
          className="flex h-9 w-9 items-center justify-center rounded-md border border-primary/20 text-muted-foreground transition-colors hover:border-primary hover:text-primary"
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </Link>
      ) : (
        <div className="flex h-9 w-9 items-center justify-center rounded-md border border-muted text-muted">
          <ChevronRight className="h-4 w-4" />
        </div>
      )}
    </nav>
  );
}
