import { useEffect, useState } from 'react';

/**
 * Map Loading Spinner
 * Full-screen loading indicator for map initialization with 200ms delay
 * to prevent flash on fast loads
 */
export default function MapLoadingSpinner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // 200ms delay before showing spinner (prevents flash on fast loads)
    const timer = setTimeout(() => {
      setVisible(true);
    }, 200);

    return () => clearTimeout(timer);
  }, []);

  // Don't render anything during delay period
  if (!visible) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0c0a09]"
    >
      {/* Screen reader text */}
      <span className="sr-only">Loading map, please wait...</span>
      {/* Animated spinner with gold theme */}
      <div className="relative">
        {/* Outer rotating ring */}
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-[#292524] border-t-[#eab308]" />

        {/* Inner glow effect */}
        <div className="absolute inset-0 h-16 w-16 animate-pulse rounded-full border-2 border-[#ca8a04]/20" />
      </div>

      {/* Loading text with mystical font */}
      <p className="mt-6 font-['Cinzel'] text-lg tracking-wide text-[#eab308] animate-pulse">
        Loading map...
      </p>

      {/* Subtle hint text */}
      <p className="mt-2 text-sm text-[#a8a29e]">
        Unveiling the mysteries of Runeterra
      </p>
    </div>
  );
}
