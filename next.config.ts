import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  serverExternalPackages: ["maxmind"],
  outputFileTracingIncludes: {
    "/api/analytics/visit": ["./node_modules/@ip-location-db/dbip-city-mmdb/**/*"],
  },
  allowedDevOrigins: ["127.0.0.1"],
  webpack(config, { dev }) {
    // Immutable releases never reuse a previous build cache. Avoid spending
    // scarce production disk on a cache that is discarded after each build.
    if (!dev) config.cache = false;
    return config;
  },
};

export default nextConfig;
