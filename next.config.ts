import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The old site in legacy/ is kept for reference only. It is never built.
  reactStrictMode: true,
  // The demo reads its benchmarks from this file at request time (src/lib/demo/load.ts), so it must ship with the deployment.
  outputFileTracingIncludes: {
    "/demo": ["./data/benchmarks.csv"],
    "/demo/**": ["./data/benchmarks.csv"],
  },
};

export default nextConfig;
