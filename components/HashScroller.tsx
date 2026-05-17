'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

/**
 * Bridge for the login-flow hash carrier. Hash fragments don't survive a
 * server-side redirect, so the login action forwards them as `?h=<anchor>`.
 * This mounts on the destination page, reads `?h=`, and scrolls the matching
 * element into view. Validated against the same alphanumeric regex used in
 * the login action to prevent any DOM-query funniness.
 */
export default function HashScroller() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const raw = searchParams.get('h');
    if (!raw) return;
    if (!/^[A-Za-z0-9\-_]+$/.test(raw)) return;
    // Defer one paint so the target element exists in the DOM (server-rendered
    // pages may still be hydrating when the effect fires).
    requestAnimationFrame(() => {
      const el = document.getElementById(raw);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }, [searchParams]);

  return null;
}
