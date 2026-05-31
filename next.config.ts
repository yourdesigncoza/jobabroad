import type { NextConfig } from "next";
import { withBotId } from "botid/next/config";

const nextConfig: NextConfig = {
  // Pin the workspace root to this project. A stray lockfile higher up the tree
  // (e.g. ~/package-lock.json) otherwise makes Next infer the wrong root, which
  // breaks API-route/redirect resolution under Turbopack dev.
  turbopack: { root: import.meta.dirname },
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
