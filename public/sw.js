// Jobabroad service worker — installability + offline shell.
// Bump CACHE_VERSION on any change here to roll caches for returning visitors.
const CACHE_VERSION = 'v1';
const STATIC_CACHE = `ja-static-${CACHE_VERSION}`;
const PAGES_CACHE = `ja-pages-${CACHE_VERSION}`;
const OFFLINE_URL = '/offline.html';

// Minimal app shell precached on install so the offline fallback always works.
const PRECACHE_URLS = [
  OFFLINE_URL,
  '/icon-192.png',
  '/icon-512.png',
];

// Never cache private / dynamic surfaces — keep authed HTML out of CacheStorage
// and always hit the network for API + auth flows.
const NO_CACHE_PREFIXES = ['/api', '/auth', '/admin', '/dashboard', '/members', '/logout'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(PRECACHE_URLS)),
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== STATIC_CACHE && key !== PAGES_CACHE)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

function isPrivate(pathname) {
  return NO_CACHE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return; // let cross-origin pass through
  if (isPrivate(url.pathname)) return; // network-only for private routes

  // Page navigations: network-first, fall back to cached page, then offline shell.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(PAGES_CACHE).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() =>
          caches
            .match(request)
            .then((cached) => cached || caches.match(OFFLINE_URL)),
        ),
    );
    return;
  }

  // Static assets (Next build output, fonts, images): stale-while-revalidate.
  const isStatic =
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.startsWith('/fonts/') ||
    /\.(?:css|js|woff2?|png|jpe?g|webp|svg|ico|gif)$/.test(url.pathname);

  if (isStatic) {
    event.respondWith(
      caches.open(STATIC_CACHE).then((cache) =>
        cache.match(request).then((cached) => {
          const network = fetch(request)
            .then((response) => {
              if (response.ok) cache.put(request, response.clone());
              return response;
            })
            .catch(() => cached);
          return cached || network;
        }),
      ),
    );
  }
});
