import type { MetadataRoute } from 'next';
import { SITE_NAME, SITE_DESCRIPTION } from '@/lib/site';

// Web app manifest — served at /manifest.webmanifest and auto-linked by Next.
// Enables "Add to Home Screen" install on Android/Chrome + iOS Safari.
// Icons live in public/ (icon-192.png, icon-512.png, apple-icon.png) so they
// resolve at the root path the manifest references.
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/',
    name: `${SITE_NAME} — Work Abroad from South Africa`,
    short_name: SITE_NAME,
    description: SITE_DESCRIPTION,
    start_url: '/?src=pwa',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#F8F5F0',
    theme_color: '#1B4D3E',
    lang: 'en-ZA',
    dir: 'ltr',
    categories: ['education', 'business', 'travel'],
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      // Maskable variant lets Android crop the icon into its adaptive shape.
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
