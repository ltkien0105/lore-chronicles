/**
 * Error display component for wiki pages
 * Shows when data loading fails
 */

import { Link } from "@tanstack/react-router";

interface WikiErrorProps {
  message?: string;
  retry?: () => void;
}

export function WikiError({ message, retry }: WikiErrorProps) {
  return (
    <div className="flex items-center justify-center min-h-[400px] px-4">
      <div className="max-w-md w-full rounded-lg border border-yellow-600/30 bg-stone-900 p-8 text-center">
        {/* Warning icon */}
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-600/10">
          <svg
            className="h-8 w-8 text-yellow-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        <h2 className="font-cinzel text-xl text-yellow-500 mb-2">
          Something went wrong
        </h2>

        {message && (
          <p className="text-stone-400 mb-6 text-sm">{message}</p>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {retry && (
            <button
              onClick={retry}
              className="px-4 py-2 rounded bg-yellow-600 text-stone-950 font-medium hover:bg-yellow-500 transition-colors"
            >
              Try again
            </button>
          )}
          <Link
            to="/"
            className="px-4 py-2 rounded border border-stone-600 text-stone-300 hover:bg-stone-800 transition-colors"
          >
            Go to map
          </Link>
        </div>
      </div>
    </div>
  );
}
