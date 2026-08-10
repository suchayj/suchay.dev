import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack(config, { dev }) {
    // Immutable releases never reuse a previous build cache. Avoid spending
    // scarce production disk on a cache that is discarded after each build.
    if (!dev) config.cache = false;
    return config;
  },
};

export default nextConfig;
