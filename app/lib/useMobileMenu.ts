'use client';

import { useEffect, useState } from 'react';
import { DESKTOP_SIDEBAR_BREAKPOINT } from '@/app/lib/navigation';

/**
 * Hook for managing mobile sidebar open/closed state
 * - Closes on route changes
 * - Locks body scroll when open
 * - Closes on Escape key
 * - Closes on desktop breakpoint change
 */
export function useMobileMenu() {
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, []);

  // Handle body scroll lock
  useEffect(() => {
    if (!mobileOpen) {
      return undefined;
    }

    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = overflow;
    };
  }, [mobileOpen]);

  // Handle Escape key
  useEffect(() => {
    if (!mobileOpen) {
      return undefined;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMobileOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [mobileOpen]);

  // Handle desktop breakpoint
  useEffect(() => {
    const mediaQuery = window.matchMedia(DESKTOP_SIDEBAR_BREAKPOINT);
    const handleChange = (event: MediaQueryListEvent) => {
      if (event.matches) {
        setMobileOpen(false);
      }
    };

    if (mediaQuery.matches) {
      setMobileOpen(false);
    }

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }

    // Fallback for older browsers
    mediaQuery.addListener(handleChange);
    return () => mediaQuery.removeListener(handleChange);
  }, []);

  return [mobileOpen, setMobileOpen] as const;
}
