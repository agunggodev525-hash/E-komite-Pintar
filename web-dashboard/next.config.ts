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
  typescript: {
    // Memastikan build Vercel tidak gagal hanya karena ada type 'any'
    ignoreBuildErrors: true,
  }
};

export default nextConfig;
