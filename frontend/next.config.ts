import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configure for Docker development
  ...(process.env.NODE_ENV === 'development' && {
    webpack: (config: any) => {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      };
      return config;
    },
  }),
};

export default nextConfig;
