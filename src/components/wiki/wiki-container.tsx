import { cn } from "@/lib/utils";

interface WikiContainerProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Centered max-width container for wiki pages
 */
export function WikiContainer({ children, className }: WikiContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8",
        className
      )}
    >
      {children}
    </div>
  );
}
