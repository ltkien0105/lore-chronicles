/**
 * Skip Link Component
 * Provides keyboard navigation shortcut to skip to main content
 * Visually hidden until focused with Tab key
 */

export function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-lg focus:bg-[#eab308] focus:px-4 focus:py-2 focus:font-['Cinzel'] focus:text-sm focus:font-medium focus:text-[#0c0a09] focus:shadow-lg focus:ring-2 focus:ring-[#ca8a04] focus:ring-offset-2 focus:ring-offset-[#0c0a09]"
    >
      Skip to main content
    </a>
  );
}
