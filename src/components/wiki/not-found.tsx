/**
 * 404 Not Found page component
 * Used as global notFoundComponent in __root.tsx
 */

import { Link } from "@tanstack/react-router";

export function NotFound() {
  return (
    <div className="min-h-screen bg-stone-950 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* 404 illustration */}
        <div className="mb-8">
          <span className="font-cinzel text-8xl font-bold text-yellow-600/20">
            404
          </span>
        </div>

        <h1 className="font-cinzel text-3xl text-yellow-500 mb-4">
          Page Not Found
        </h1>

        <p className="text-stone-400 mb-8">
          The page you're looking for doesn't exist or has been moved to another
          location in Runeterra.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="px-6 py-3 rounded bg-yellow-600 text-stone-950 font-medium hover:bg-yellow-500 transition-colors"
          >
            View Map
          </Link>
          <Link
            to="/champions"
            className="px-6 py-3 rounded border border-stone-600 text-stone-300 hover:bg-stone-800 transition-colors"
          >
            Browse Champions
          </Link>
        </div>
      </div>
    </div>
  );
}
