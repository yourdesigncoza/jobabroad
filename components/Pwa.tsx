'use client';

import { useEffect, useState } from 'react';

// Chrome/Android fire this before showing their native install prompt; we
// capture it so we can trigger the prompt from our own button.
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISS_KEY = 'ja-pwa-install-dismissed';

/**
 * Single mount point for PWA behaviour:
 *  - registers the service worker (/sw.js)
 *  - renders a subtle, dismissible "Add to Home Screen" banner on mobile
 *    (Android via beforeinstallprompt; iOS Safari via instructions).
 */
export default function Pwa() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  // null = hidden; 'ios' = show instructions; 'android' = show install button.
  // Single state set only from async callbacks (avoids cascading-render lint).
  const [banner, setBanner] = useState<null | 'ios' | 'android'>(null);
  const isIOS = banner === 'ios';

  // Register the service worker once on mount.
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

  // Decide whether to show the install banner.
  useEffect(() => {
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      // iOS Safari exposes navigator.standalone instead of display-mode.
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
    if (standalone) return; // already installed
    if (localStorage.getItem(DISMISS_KEY)) return; // user dismissed before

    const ios =
      /iPad|iPhone|iPod/.test(navigator.userAgent) &&
      !(window as Window & { MSStream?: unknown }).MSStream;

    // iOS gives no install event — show the instructional banner after a beat.
    if (ios) {
      const t = setTimeout(() => setBanner('ios'), 1200);
      return () => clearTimeout(t);
    }

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setBanner('android');
    };
    const onInstalled = () => setBanner(null);
    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  function dismiss() {
    setBanner(null);
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

  if (!banner) return null;

  return (
    <div
      role="dialog"
      aria-label="Install Jobabroad app"
      className="fixed inset-x-3 bottom-3 z-[60] mx-auto max-w-md rounded-2xl p-4 shadow-2xl sm:left-auto sm:right-4 sm:mx-0"
      style={{ backgroundColor: '#1B4D3E', color: '#F8F5F0' }}
    >
      <div className="flex items-start gap-3">
        {/* Plain img: 40px static brand icon — next/image optimization is needless overhead here. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/icon-192.png" alt="" width={40} height={40} className="rounded-lg" />
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
