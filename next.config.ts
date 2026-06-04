import type { NextConfig } from "next";
import { withBotId } from "botid/next/config";

const nextConfig: NextConfig = {
  // Pin the workspace root to this project. A stray lockfile higher up the tree
  // (e.g. ~/package-lock.json) otherwise makes Next infer the wrong root, which
  // breaks API-route/redirect resolution under Turbopack dev.
  turbopack: { root: import.meta.dirname },
  async headers() {
    return [
      {
        // The service worker must never be served stale, or returning visitors
        // get pinned to an old SW. Also force the correct JS content type.
        source: '/sw.js',
        headers: [
          { key: 'Content-Type', value: 'application/javascript; charset=utf-8' },
          { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'jobabroad.co.za' }],
        destination: 'https://www.jobabroad.co.za/:path*',
        permanent: true,
      },
      {
        source: '/demo/:category',
        destination: '/pathways/:category',
        permanent: true,
      },
    ];
  },
};

export default withBotId(nextConfig);
