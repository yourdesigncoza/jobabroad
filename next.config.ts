import type { NextConfig } from "next";
import { withBotId } from "botid/next/config";

const nextConfig: NextConfig = {
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
