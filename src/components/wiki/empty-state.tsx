/**
 * Empty state component for wiki pages
 * Shows when search/filter returns no results
 */

import { Link } from "@tanstack/react-router";

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: {
    label: string;
    href: string;
  };
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex items-center justify-center min-h-[300px] px-4">
      <div className="max-w-md w-full text-center">
        {/* Empty icon */}
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-stone-800">
          <svg
            className="h-8 w-8 text-stone-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
        </div>

        <h3 className="font-cinzel text-xl text-stone-300 mb-2">{title}</h3>

        {description && (
          <p className="text-stone-500 mb-6 text-sm">{description}</p>
        )}

        {action && (
          <Link
            to={action.href}
            className="inline-flex px-4 py-2 rounded bg-yellow-600 text-stone-950 font-medium hover:bg-yellow-500 transition-colors"
          >
            {action.label}
          </Link>
        )}
      </div>
    </div>
  );
}
