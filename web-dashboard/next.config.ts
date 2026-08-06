import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Tentukan root Turbopack ke web-dashboard agar tidak konflik dengan root monorepo
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
