import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Clean configuration optimized for development
  experimental: {
    // Enable optimizations
    optimizePackageImports: ['@radix-ui/react-icons'],
  },
};

export default nextConfig;
