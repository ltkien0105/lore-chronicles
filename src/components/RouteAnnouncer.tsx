/**
 * Route Announcer Component
 * Announces route changes to screen readers for better accessibility
 * Uses ARIA live region to notify assistive technology of navigation
 */

import { useEffect, useState } from 'react';
import { useLocation } from '@tanstack/react-router';

export function RouteAnnouncer() {
  const location = useLocation();
  const [announcement, setAnnouncement] = useState('');

  useEffect(() => {
    // Extract page title or generate from pathname
    const title = document.title || location.pathname;

    // Update announcement for screen readers
    setAnnouncement(`Navigated to ${title}`);

    // Clear announcement after a delay to avoid cluttering screen reader history
    const timeout = setTimeout(() => {
      setAnnouncement('');
    }, 1000);

    return () => clearTimeout(timeout);
  }, [location.pathname]);

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
    >
      {announcement}
    </div>
  );
}
