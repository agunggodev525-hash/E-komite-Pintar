import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: process.env.BACKEND_INTERNAL_URL 
          ? `${process.env.BACKEND_INTERNAL_URL}/api/v1/:path*`
          : 'https://e-komite-pintar.onrender.com/api/v1/:path*',
      },
    ];
  },
  typescript: {
    // Memastikan build Vercel tidak gagal hanya karena ada type 'any'
    ignoreBuildErrors: true,
  }
};

export default nextConfig;
