import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: '/api/backend/:path*',
      },
    ];
  },
};

export default nextConfig;
