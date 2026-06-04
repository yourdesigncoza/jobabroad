'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

// Chrome/Android fire this before showing their native install prompt; we
// capture it so we can trigger the prompt from our own button at the right
// moment (rather than on a cold first paint).
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISS_KEY = 'ja-pwa-install-dismissed';
const SEEN_KEY = 'ja-pwa-seen'; // set on first-ever visit → presence means "returning"
const PV_KEY = 'ja-pwa-pageviews'; // per-session pageview counter

// Conversion-critical pages: the install banner must never compete with the
// primary CTA (sign up / pay), so it is suppressed here regardless of intent.
const SUPPRESS_EXACT = new Set([
  '/',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
]);

function isSuppressed(path: string): boolean {
  if (SUPPRESS_EXACT.has(path)) return true;
  // Don't interrupt the payment / booking decision.
  return path.endsWith('/paid') || path.endsWith('/book');
}

// Strong intent signal: a registered user inside the gated members area.
function isIntentRoute(path: string): boolean {
  return path.startsWith('/members') || path.startsWith('/dashboard');
}

// Computed once on first client render (lazy state init, never on the server).
// Returns the install affordance for this device, or null when we can't / must
// not offer one (already installed, previously dismissed, unsupported).
function detectPlatform(): null | 'ios' | 'android' {
  if (typeof window === 'undefined') return null;
  try {
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
    if (standalone) return null;
    if (localStorage.getItem(DISMISS_KEY)) return null;
  } catch {
    return null;
  }
  const ios =
    /iPad|iPhone|iPod/.test(navigator.userAgent) &&
    !(window as Window & { MSStream?: unknown }).MSStream;
  // Android/desktop Chrome only becomes installable once beforeinstallprompt
  // fires, so it is promoted to 'android' from that listener — not here.
  return ios ? 'ios' : null;
}

/**
 * Single mount point for PWA behaviour:
 *  - registers the service worker (/sw.js) globally — offline/caching helps
 *    every visitor and is what makes the site install-eligible.
 *  - renders a subtle, dismissible "Add to Home Screen" banner, but only once
 *    the visitor has shown intent: inside /members or /dashboard, OR on a
 *    return visit, OR from the 2nd pageview in a session. Never on the
 *    conversion-critical pages above.
 */
export default function Pwa() {
  const [platform, setPlatform] = useState<null | 'ios' | 'android'>(detectPlatform);
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  // Flips true once the reveal delay has elapsed on an eligible route. Live
  // visibility is still gated by routeEligible() below, so this only ever needs
  // to go true (no synchronous reset in an effect).
  const [revealed, setRevealed] = useState(false);

  const isReturnVisit = useRef(false);
  const pageviews = useRef(0);

  const pathname = usePathname();
  const isIOS = platform === 'ios';

  // Register the service worker once on mount (always, on every route).
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;
    const onLoad = () => {
      navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(() => {
        /* registration failure is non-fatal — site still works */
      });
    };
    if (document.readyState === 'complete') onLoad();
    else {
      window.addEventListener('load', onLoad);
      return () => window.removeEventListener('load', onLoad);
    }
  }, []);

  // Capture the Android install prompt + record return-visit state. Runs once.
  useEffect(() => {
    // Return-visit detection: SEEN_KEY persists across sessions, so finding it
    // already set means this isn't the visitor's first time here.
    try {
      isReturnVisit.current = !!localStorage.getItem(SEEN_KEY);
      if (!isReturnVisit.current) localStorage.setItem(SEEN_KEY, '1');
    } catch {
      /* private mode — ignore */
    }

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setPlatform('android'); // set from a callback, not synchronously in effect
    };
    const onInstalled = () => {
      setPlatform(null);
      setRevealed(false);
    };
    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  // Re-evaluate the trigger on every navigation. The component persists across
  // App Router soft navigations, so counters + the captured prompt survive.
  useEffect(() => {
    try {
      pageviews.current = Number(sessionStorage.getItem(PV_KEY) || '0') + 1;
      sessionStorage.setItem(PV_KEY, String(pageviews.current));
    } catch {
      pageviews.current += 1;
    }

    if (!routeEligible(pathname)) return;
    // Small delay so it doesn't pop the instant an eligible route paints.
    const t = setTimeout(() => setRevealed(true), 600);
    return () => clearTimeout(t);
  }, [pathname]);

  // Live eligibility for the current route — derived, so navigating to a
  // suppressed page hides the banner without any state reset.
  function routeEligible(path: string): boolean {
    if (isSuppressed(path)) return false;
    return isIntentRoute(path) || isReturnVisit.current || pageviews.current >= 2;
  }

  function dismiss() {
    setRevealed(false);
    setPlatform(null); // don't reappear this session
    try {
      localStorage.setItem(DISMISS_KEY, '1');
    } catch {
      /* private mode — ignore */
    }
  }

  async function install() {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    setDeferred(null);
    dismiss();
  }

  if (platform === null || !revealed || !routeEligible(pathname)) return null;

  return (
    <div
      role="dialog"
      aria-label="Install Jobabroad app"
      className="fixed inset-x-3 bottom-3 z-[60] mx-auto max-w-md rounded-2xl p-4 shadow-2xl sm:left-auto sm:right-4 sm:mx-0"
      style={{ backgroundColor: '#1B4D3E', color: '#F8F5F0' }}
    >
      <div className="flex items-start gap-3">
        {/* Cream chip so the dark-green app icon stays visible on the green banner. */}
        <span className="shrink-0 rounded-xl p-1" style={{ backgroundColor: '#F8F5F0' }}>
          {/* Plain img: small static brand icon — next/image optimization is needless overhead here. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icon-192.png" alt="" width={36} height={36} className="block rounded-lg" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-display font-semibold uppercase tracking-wide" style={{ fontSize: '0.95rem' }}>
            Install Jobabroad
          </p>
          {isIOS ? (
            <p className="mt-0.5 text-sm" style={{ color: '#CFE0D9' }}>
              Tap the Share icon, then “Add to Home Screen” for an app-like experience.
            </p>
          ) : (
            <p className="mt-0.5 text-sm" style={{ color: '#CFE0D9' }}>
              Add it to your home screen for quick, app-like access — no app store needed.
            </p>
          )}
          {!isIOS && (
            <button
              onClick={install}
              className="mt-3 rounded-full px-4 py-2 text-sm font-semibold"
              style={{ backgroundColor: '#ff751f', color: '#fff' }}
            >
              Add to Home Screen
            </button>
          )}
        </div>
        <button
          onClick={dismiss}
          aria-label="Dismiss"
          className="-mr-1 -mt-1 shrink-0 rounded-full p-1 leading-none"
          style={{ color: '#CFE0D9' }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
            <path d="M4 4l10 10M14 4L4 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}
