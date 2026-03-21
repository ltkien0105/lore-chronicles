import { Link } from '@tanstack/react-router';

/**
 * WebGL Error Fallback UI
 * Displayed when WebGL is unavailable or R3F encounters render errors
 * Provides navigation to wiki pages as alternative
 */
export default function WebGLErrorFallback() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0c0a09] px-4">
      {/* Error icon - golden scroll with alert */}
      <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-[#1c1917] border-2 border-[#ca8a04]/30">
        <svg
          className="h-12 w-12 text-[#eab308]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>

      {/* Error heading */}
      <h1
        role="alert"
        className="mb-4 font-['Cinzel'] text-3xl font-semibold text-[#eab308] text-center"
      >
        Map Unavailable
      </h1>

      {/* Error message */}
      <p className="mb-8 max-w-md text-center text-lg text-[#d6d3d1]">
        Your browser doesn't support 3D graphics required for the interactive map.
      </p>

      {/* Alternative navigation */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <Link
          to="/champions"
          className="flex items-center gap-2 rounded-lg bg-[#eab308] px-6 py-3 font-['Cinzel'] text-base font-medium text-[#0c0a09] transition-all hover:bg-[#ca8a04] hover:shadow-lg hover:shadow-[#eab308]/20"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
          Browse Champions
        </Link>

        <Link
          to="/regions"
          className="flex items-center gap-2 rounded-lg bg-[#292524] px-6 py-3 font-['Cinzel'] text-base font-medium text-[#d6d3d1] transition-all hover:bg-[#44403c] hover:shadow-lg hover:shadow-[#292524]/20"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Explore Regions
        </Link>
      </div>

      {/* Technical note */}
      <p className="mt-8 text-sm text-[#a8a29e] text-center max-w-lg">
        The interactive map requires WebGL support. Try updating your browser or enabling hardware acceleration in browser settings.
      </p>
    </div>
  );
}
